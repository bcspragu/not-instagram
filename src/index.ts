import './style.css'
import site from './site.json'

interface Image {
  url: string
  objectPosition?: string
}

interface GalleryItem {
  description: string
  media: Image[]
}

const ready = (fn: () => void): void => {
  if (document.readyState != 'loading'){
    fn()
  } else {
    document.addEventListener('DOMContentLoaded', fn)
  }
}

let currentOpenIndex = 0

const byID = (id: string): HTMLElement => {
  const el = document.getElementById(id)
  if (!el) {
    throw new Error(`#${id} was not found`)
  }
  return el
}

const query = (selector: string, parent?: Element | Document | DocumentFragment): Element => {
  if (!parent) {
    parent = document
  }
  const el = parent.querySelector(selector)
  if (!el) {
    throw new Error(`${selector} was not found`)
  }
  return el
}

const addPost = (parent: Element, idx: number, item: GalleryItem) => {
  const tmpl = byID('gallery-item-template') as HTMLTemplateElement
  if (!('content' in tmpl)) {
    throw new Error('browser doesn\'t support <template> element')
  }
  const galleryItem = tmpl.content.cloneNode(true) as Element

  const likes = query('.gallery-item-likes-count', galleryItem) as HTMLElement
  likes.innerText = randomEngagement()
  const comments = query('.gallery-item-comments-count', galleryItem) as HTMLElement
  comments.innerText = randomEngagement()

  const img = query('img', galleryItem)
  if (!(img instanceof HTMLImageElement)) {
    throw new Error('img was not an <img> element')
  }

  // TODO(bcspragu): Maybe make this `.jpg` based on client.
  img.src = `/thumbs/${item.media[0].url}.webp`
  if (item.media[0].objectPosition) {
    img.style.objectPosition = item.media[0].objectPosition
  }

  parent.appendChild(galleryItem)
  if (!parent.lastElementChild) {
    throw new Error('no child despite just appending one')
  }
  parent.lastElementChild.addEventListener('click', function(this: HTMLElement) {
    const img = query('img', this)
    if (!(img instanceof HTMLImageElement)) {
      return
    }
    openOverlay(idx, item)
  })
}

const randomNumber = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max+1 - min) + min)
}

const randomFollowers = (): string => {
  const n = randomNumber(0, 10)
  if (n <= 7) {
    return randomNumber(0, 500).toString()
  } else if (n <= 9) {
    return randomNumber(500, 250000).toLocaleString('en-US')
  } else {
    return `${randomNumber(2, 300)}M`
  }
}

const randomFollowing = (): string => {
  return randomNumber(0, 2000).toLocaleString('en-US')
}

const randomEngagement = (): string => {
  const n = randomNumber(0, 10)
  if (n <= 7) {
    return ' ' + randomNumber(0, 30).toString()
  } else if (n <= 9) {
    return ' ' + randomNumber(0, 300).toString()
  } else {
    return ` ${randomNumber(1, 15)}.${randomNumber(1, 9)}K`
  }
}

const stopProp = (e: Event) => {
  e.stopPropagation()
}

const openOverlay = (idx: number, item: GalleryItem) => {
  currentOpenIndex = idx
  const overlay = query('.overlay')
  overlay.addEventListener('click', closeOverlay)
  query('.overlay-image-holder').addEventListener('click', stopProp)
  const img = query('img', overlay)
  if (!(img instanceof HTMLImageElement)) {
    throw new Error('img was not an <img> element')
  }
  img.src = `/full/${item.media[0].url}.webp`
  img.onload = () => {
    if (item.media[0].objectPosition) {
      img.style.objectPosition = item.media[0].objectPosition
    } else {
      img.style.objectPosition = ''
    }
    query('.overlay-description').textContent = item.description
    overlay.classList.remove('is-hidden')
  }
}

const closeOverlay = () => {
  const overlay = query('.overlay')
  overlay.classList.add('is-hidden')
  overlay.removeEventListener('click', closeOverlay)
  query('.overlay-image-holder').removeEventListener('click', stopProp)
}

ready(() => {
  const statPosts = byID('stat-posts')
  const statFollowers = byID('stat-followers')
  const statFollowing = byID('stat-following')
  statPosts.innerText = site.posts.length.toString()
  statFollowers.innerText = randomFollowers()
  statFollowing.innerText = randomFollowing()

  const gallery = query('.gallery')
  let i = 0
  for (const item of site.posts) {
    addPost(gallery, i, item)
    i++
  }

  document.addEventListener('keydown', (ev: KeyboardEvent) => {
    const overlay = query('.overlay')
    if (overlay.classList.contains('is-hidden')) {
      return
    }

    switch (ev.key) {
    case 'ArrowLeft':
      if (currentOpenIndex > 0) {
        openOverlay(currentOpenIndex-1, site.posts[currentOpenIndex-1])
      }
      break
    case 'ArrowRight':
      if (currentOpenIndex < site.posts.length-1) {
        openOverlay(currentOpenIndex+1, site.posts[currentOpenIndex+1])
      }
      break
    }
  })
})
