package main

import (
	"bytes"
	"io/ioutil"
	"log"
	"path/filepath"

	minify "github.com/tdewolff/minify/v2"
	"github.com/tdewolff/minify/v2/css"
	"github.com/tdewolff/minify/v2/html"
	"github.com/tdewolff/minify/v2/js"
)

const (
	distDir = "dist"
)

func main() {
	m := minify.New()
	m.AddFunc("text/css", css.Minify)
	m.AddFunc("text/html", html.Minify)
	m.AddFunc("text/javascript", js.Minify)

	inHTML, err := ioutil.ReadFile(filepath.Join(distDir, "index.html"))
	if err != nil {
		log.Fatalf("faild to read index.html: %v", err)
	}

	inCSS, err := ioutil.ReadFile(filepath.Join(distDir, "index.min.css"))
	if err != nil {
		log.Fatalf("faild to read style.css: %v", err)
	}

	inJS, err := ioutil.ReadFile(filepath.Join(distDir, "index.min.js"))
	if err != nil {
		log.Fatalf("faild to read main.js: %v", err)
	}

	minCSS, err := m.Bytes("text/css", inCSS)
	if err != nil {
		log.Fatalf("failed to minify CSS: %v", err)
	}

	minJS, err := m.Bytes("text/javascript", inJS)
	if err != nil {
		log.Fatalf("failed to minify JS: %v", err)
	}

	inHTML = bytes.Replace(inHTML, []byte(`<link rel="stylesheet" type="text/css" href="index.min.css">`), concat([]byte("<style>"), minCSS, []byte("</style>")), 1)
	inHTML = bytes.Replace(inHTML, []byte(`<script  src="index.min.js"></script>`), concat([]byte("<script>"), minJS, []byte("</script>")), 1)

	minHTML, err := m.Bytes("text/html", inHTML)
	if err != nil {
		log.Fatalf("failed to minify HTML: %v", err)
	}

	if err := ioutil.WriteFile("dist/index.min.html", minHTML, 0644); err != nil {
		log.Fatalf("failed to create dist/index.html: %v", err)
	}
}

func concat(ins ...[]byte) []byte {
	var out []byte
	for _, in := range ins {
		out = append(out, in...)
	}
	return out
}
