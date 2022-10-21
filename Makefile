# See https://tech.davis-hansson.com/p/make/
SHELL := bash
.ONESHELL:
.SHELLFLAGS := -eu -o pipefail -c
.DELETE_ON_ERROR:
MAKEFLAGS += --warn-undefined-variables
MAKEFLAGS += --no-builtin-rules

ifeq ($(origin .RECIPEPREFIX), undefined)
  $(error This Make does not support .RECIPEPREFIX. Please use GNU Make 4.0 or later)
endif
.RECIPEPREFIX = >

# See https://szymonkrajewski.pl/use-make-as-task-runner/
GREEN  := $(shell tput -Txterm setaf 2)
YELLOW := $(shell tput -Txterm setaf 3)
WHITE  := $(shell tput -Txterm setaf 7)
RESET  := $(shell tput -Txterm sgr0)

TARGET_MAX_CHAR_NUM=15

.DEFAULT_GOAL := help

## Show this help message
help:
> echo ''
> echo 'Usage:'
> echo '  ${YELLOW}make${RESET} ${GREEN}<target>${RESET}'
> echo ''
> echo 'Targets:'
> awk '/^[a-zA-Z\-_0-9]+:/ { \
    helpMessage = match(lastLine, /^## (.*)/); \
    if (helpMessage) { \
        helpCommand = substr($$1, 0, index($$1, ":")); \
        sub(/:/, "", helpCommand); \
        helpMessage = substr(lastLine, RSTART + 3, RLENGTH); \
        printf "  ${YELLOW}%-$(TARGET_MAX_CHAR_NUM)s${RESET} ${GREEN}%s${RESET}\n", helpCommand, helpMessage; \
    } \
} \
{ lastLine = $$0 }' $(MAKEFILE_LIST)
.SILENT: help

# See https://stackoverflow.com/a/25668869
EXECUTABLES = exiftool convert jpegoptim cwebp go npm
K := $(foreach exec,$(EXECUTABLES),\
        $(if $(shell which $(exec)),some string,$(error "No $(exec) in PATH")))

original_images=$(wildcard images/originals/*.jpg)
stripped_images=$(subst originals,exif_stripped, $(original_images))
thumb_images=$(subst originals,thumbs, $(original_images))
full_images=$(subst originals,full, $(original_images))
thumb_webp_images=$(subst jpg,webp, $(thumb_images))
full_webp_images=$(subst jpg,webp, $(full_images))

images/exif_stripped/%.jpg: images/originals/%.jpg
> mkdir -p images/exif_stripped/
> exiftool -all= -o $@ $<

## Scale and optimize all the images.
optimize-images: $(thumb_images) $(full_images) $(thumb_webp_images) $(full_webp_images)
.PHONY: optimize-images

images/thumbs/%.jpg: images/exif_stripped/%.jpg
> mkdir -p images/thumbs/
> convert $< -resize 633x474 -strip $@
> jpegoptim -sq $@

images/full/%.jpg: images/exif_stripped/%.jpg
> mkdir -p images/full/
> convert $< -resize 1688x1264 -strip $@
> jpegoptim -sq $@

images/thumbs/%.webp: images/exif_stripped/%.jpg
> mkdir -p images/full/
> cwebp $< -q 75 -z 6 -resize 633 0 -o $@

images/full/%.webp: images/exif_stripped/%.jpg
> mkdir -p images/full/
> cwebp $< -q 75 -z 6 -resize 1688 0 -o $@

.make/install: package.json
> npm install
> @mkdir -p .make
> @touch .make/install

## Install frontend dependencies
install: .make/install
.PHONY: install

## Run the frontend locally
run: .make/install optimize-images
> npm run local
.PHONY: run

## Lint + fix the frontend code
lint: .make/install
> npm run lint:fix
.PHONY: lint

js_targets := dist/index.min.js dist/index.html dist/index.min.css
web_inputs := $(shell find src/)
$(js_targets): .make/install rollup.config.js $(web_inputs)
> npm run build:prod

## Build the frontend
build: $(js_targets)
.PHONY: build

dist/index.min.html: build
> go run ./cmd/inline

## Inline and further minify assets
inline: dist/index.min.html
.PHONY: inline

## Clean up the production output JS files
clean:
> rm -f $(js_targets)
.PHONY: clean
