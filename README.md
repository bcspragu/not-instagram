# Not Instagram

![An image of a compiled site, with a bunch of stock photos of different dogs.](/example-site.png)

Not Instagram is a static site generator, whose static site happens to look
similar to an Instagram profile page. This is primarily for people who want to
share photos in a well-known format, but aren't fans of social media.

Personally, I use it for hosting corny pet sites, and encourage you to do the
same. If you take me up on this offer, I humbly request you share your pet site
with me.

The site compiles down to a ~12kB `index.min.html` file with no external JS
dependencies, a few SVG icons, and your images, optimized for web usage. It
should work on modern desktop and mobile devices. If it doesn't, let me know!

## Required Tools

- `make` for task running
  - Run `make` to see a list of available tasks
- `npm`, for frontend tooling
- Assorted image manipulation tools
  - exiftool
  - convert (i.e. ImageMagick)
  - jpegoptim
  - cwebp
- `go`, for the final inlining/minification step

## Usage

Once you've installed all the above tools, do the following:

1. Put all your images in `/images/originals/`
  - They should be JPEG-formatted and have the `.jpg` extension.
2. Update `/src/site.json`
  - Most of the top-level fields are self-explanatory.
  - Each entry in `posts` should map to an image in your `/images/originals/` directory.
    - Ex. If you have `/images/originals/eating-garbage.jpg`, the `posts[].media[].url` should be `eating-garbage`

Once that's all set, run `make run` to install dependencies, strip image
metadata and resize/optimize images, build the frontend, and start a local
web server. You should be able to view the site on `localhost:10001`.

Note: The `/images/originals` directory is **not** committed to source
control by default (e.g. it is in the `.gitignore` file). This is to prevent
accidentally leaking information like geolocation information and device
metadata. If you have a private fork of this repo, or are sure that your
original images contain no sensitive information, feel free to commit the
original images to the repo for convenience.

## Deployment

To deploy your static site, run `make minify optimize-images`, this will build
the whole site and prep all the images. The output directory you'll want to
upload should look like:

- `dist/index.min.html` -> `index.html`
- `images/{.,thumbs,full,icons}` -> `/`

## TODO

- [ ] Add support for video + multiple images
- [ ] Add support for non-JPEG source images
- [ ] Make updating `site.json` or `src/template.html` refresh the dev server
- [ ] [Maybe] Check user agent to decide whether to serve JPEG or WebP
- [ ] [Maybe] Migrate to using [Taskfile](https://taskfile.dev/) instead of Makefile
  - The only problem is that we actually use the 'turn this glob into a 1:1 mapping and only run commands for new stuff', which saves a lot of unnecessary compute.

## Prior Art

Since Instagram heavily restricts access for people without accounts, I mostly
used image search and random internet digging as a reference. In no particular
order, I looked at:

- https://codepen.io/GeorgePark/pen/VXrwOP
- https://www.geeksforgeeks.org/instagram-clone-using-html-css/
- https://www.freecodecamp.org/news/content/images/2019/09/Ruben_A__Harris___rubenharris__-_Instagram_photos_and_videos.png