'use client'

interface NewsStructuredDataProps {
  article: {
    id: string
    title: string
    description: string
    publishedAt: string
    modifiedAt: string
    category: string
    author?: string
    imageUrl?: string
    url: string
  }
}

export function NewsStructuredData({ article }: NewsStructuredDataProps) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "headline": article.title,
    "description": article.description,
    "datePublished": article.publishedAt,
    "dateModified": article.modifiedAt,
    "author": {
      "@type": "Organization",
      "name": article.author || "Гал-Інфо",
      "url": "https://galinfo.com.ua"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Гал-Інфо",
      "url": "https://galinfo.com.ua",
      "logo": {
        "@type": "ImageObject",
        "url": "https://galinfo.com.ua/im/logo-rss-100.png",
        "width": 100,
        "height": 100
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": article.url
    },
    "url": article.url,
    "image": article.imageUrl ? {
      "@type": "ImageObject",
      "url": article.imageUrl,
      "width": 800,
      "height": 600
    } : undefined,
    "articleSection": article.category,
    "keywords": [article.category, "новини", "Львів", "Гал-Інфо"],
    "inLanguage": "uk-UA"
  }
  
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  )
}
