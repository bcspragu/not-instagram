import typescript from '@rollup/plugin-typescript';
import { terser } from "rollup-plugin-terser";
import htmlTemplate from 'rollup-plugin-generate-html-template'
import postcss from 'rollup-plugin-postcss'
import serve from 'rollup-plugin-serve'
import json from '@rollup/plugin-json'
import site from './src/site.json'

const isProd = process.env.BUILD === 'production'
const infix = isProd ? '.min' : ''

export default {
  input: `src/index.ts`,
  output: {
    file: `dist/index${infix}.js`,
    format: 'iife',
  },
  plugins: [
    json(),
    typescript(),
    postcss({ extract: true, minimize: true, plugins: [] }),
    htmlTemplate({
      template: 'src/template.html',
      target: 'index.html',
      replaceVars: {
        '__TITLE__': site.title,
        '__DESCRIPTION__': site.description,
        '__AUTHOR__': site.author,
        '__WEBSITE__': site.website,
        '__PROFILE_NAME__': site.profile_name,
        '__PROFILE_BIO__': site.profile_bio,
        '__FULL_NAME__': site.full_name,
        '__PROFILE_PHOTO__': `${site.profile_photo.url}.webp`,
        '__PROFILE_PHOTO_POSITION__': site.profile_photo.objectPosition || '50% 50%',
      },
    }),
    isProd && terser(),
    !isProd && serve({
      contentBase: ['dist', 'images'],
    }),
  ],
}
