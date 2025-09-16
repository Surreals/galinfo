// Типи для структурованих даних Schema.org

export interface NewsArticle {
  headline: string
  description: string
  datePublished: string
  dateModified: string
  author?: {
    name: string
    url?: string
  }
  url: string
  image?: {
    url: string
    width?: number
    height?: number
  }
  articleSection?: string
  keywords?: string[]
  wordCount?: number
  timeRequired?: string
}

export interface Organization {
  name: string
  url: string
  logo: {
    url: string
    width: number
    height: number
  }
  description: string
  address?: {
    addressLocality: string
    addressRegion: string
    addressCountry: string
  }
  contactPoint?: {
    telephone?: string
    email?: string
    contactType: string
  }
  sameAs?: string[]
}

export interface WebSite {
  name: string
  url: string
  description: string
}

export interface BreadcrumbList {
  itemListElement: Array<{
    name: string
    item: string
  }>
}
