'use client'

import { NewsArticle, Organization, WebSite, BreadcrumbList } from './types/structured-data'

interface NewsArticleStructuredDataProps {
  article: NewsArticle
}

interface OrganizationStructuredDataProps {
  organization: Organization
}

interface WebSiteStructuredDataProps {
  website: WebSite
}

interface BreadcrumbStructuredDataProps {
  breadcrumbs: BreadcrumbList
}

// Структуровані дані для новинної статті
export function NewsArticleStructuredData({ article }: NewsArticleStructuredDataProps) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "headline": article.headline,
    "description": article.description,
    "datePublished": article.datePublished,
    "dateModified": article.dateModified,
    "author": {
      "@type": "Organization",
      "name": article.author?.name || "Гал-Інфо",
      "url": article.author?.url || "https://galinfo.com.ua"
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
    "image": article.image ? {
      "@type": "ImageObject",
      "url": article.image.url,
      "width": article.image.width || 800,
      "height": article.image.height || 600
    } : undefined,
    "articleSection": article.articleSection,
    "keywords": article.keywords?.join(', '),
    "wordCount": article.wordCount,
    "timeRequired": article.timeRequired
  }
  
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  )
}

// Структуровані дані для організації
export function OrganizationStructuredData({ organization }: OrganizationStructuredDataProps) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": organization.name,
    "url": organization.url,
    "logo": {
      "@type": "ImageObject",
      "url": organization.logo.url,
      "width": organization.logo.width,
      "height": organization.logo.height
    },
    "description": organization.description,
    "address": organization.address ? {
      "@type": "PostalAddress",
      "addressLocality": organization.address.addressLocality,
      "addressRegion": organization.address.addressRegion,
      "addressCountry": organization.address.addressCountry
    } : undefined,
    "contactPoint": organization.contactPoint ? {
      "@type": "ContactPoint",
      "telephone": organization.contactPoint.telephone,
      "email": organization.contactPoint.email,
      "contactType": organization.contactPoint.contactType
    } : undefined,
    "sameAs": organization.sameAs
  }
  
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  )
}

// Структуровані дані для веб-сайту
export function WebSiteStructuredData({ website }: WebSiteStructuredDataProps) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": website.name,
    "url": website.url,
    "description": website.description,
    "publisher": {
      "@type": "Organization",
      "name": "Гал-Інфо",
      "url": "https://galinfo.com.ua"
    },
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://galinfo.com.ua/search?q={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    },
    "inLanguage": "uk-UA"
  }
  
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  )
}

// Структуровані дані для навігаційних хлібних крихт
export function BreadcrumbStructuredData({ breadcrumbs }: BreadcrumbStructuredDataProps) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbs.itemListElement.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.item
    }))
  }
  
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  )
}

// Компонент для додавання структурованих даних на головну сторінку
export function HomePageStructuredData() {
  const websiteData: WebSite = {
    name: "Гал-Інфо",
    url: "https://galinfo.com.ua",
    description: "Агенція інформації та аналітики 'Гал-інфо' - останні новини Львова та регіону",
  }

  const organizationData: Organization = {
    name: "Гал-Інфо",
    url: "https://galinfo.com.ua",
    logo: {
      url: "https://galinfo.com.ua/im/logo-rss-100.png",
      width: 100,
      height: 100
    },
    description: "Агенція інформації та аналітики 'Гал-інфо'",
    address: {
      addressLocality: "Львів",
      addressRegion: "Львівська область",
      addressCountry: "Україна"
    },
    sameAs: [
      "https://www.facebook.com/galinfo",
      "https://twitter.com/galinfo_lviv"
    ]
  }

  return (
    <>
      <WebSiteStructuredData website={websiteData} />
      <OrganizationStructuredData organization={organizationData} />
    </>
  )
}
