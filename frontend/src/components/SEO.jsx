/**
 * SEO Component
 * Dynamically updates the page <title> and <meta description> using the document API.
 * Use this at the top of every public page for better SEO.
 *
 * Usage:
 *   import SEO from '../../components/SEO'
 *   <SEO title="Berita" description="Baca berita terkini dari SMP Negeri 112 Jakarta." />
 */

import { useEffect } from 'react'

const SITE_NAME = 'SMP Negeri 112 Jakarta'

export default function SEO({ title, description, image }) {
  useEffect(() => {
    // Update document title
    document.title = title
      ? `${title} – ${SITE_NAME}`
      : `${SITE_NAME} – Sekolah Berkarakter dan Berprestasi`

    // Update meta description
    const setMeta = (name, content, attr = 'name') => {
      let el = document.querySelector(`meta[${attr}="${name}"]`)
      if (!el) {
        el = document.createElement('meta')
        el.setAttribute(attr, name)
        document.head.appendChild(el)
      }
      el.setAttribute('content', content)
    }

    if (description) {
      setMeta('description', description)
      setMeta('og:description', description, 'property')
      setMeta('twitter:description', description)
    }

    if (title) {
      const fullTitle = `${title} – ${SITE_NAME}`
      setMeta('og:title', fullTitle, 'property')
      setMeta('twitter:title', fullTitle)
    }

    if (image) {
      setMeta('og:image', image, 'property')
      setMeta('twitter:image', image)
    }
  }, [title, description, image])

  return null
}
