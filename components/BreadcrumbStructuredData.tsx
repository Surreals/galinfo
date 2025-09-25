'use client'

interface BreadcrumbItem {
  name: string
  item: string
}

interface BreadcrumbStructuredDataProps {
  breadcrumbs: BreadcrumbItem[]
}

export function BreadcrumbStructuredData({ breadcrumbs }: BreadcrumbStructuredDataProps) {
  // Перевіряємо, чи breadcrumbs існують і не є порожніми
  if (!breadcrumbs || !Array.isArray(breadcrumbs) || breadcrumbs.length === 0) {
    return null
  }

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbs.map((item, index) => ({
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

// Утилітарна функція для створення breadcrumbs
export function createBreadcrumbs(
  items: Array<{ name: string; url: string }>,
  baseUrl: string = 'https://galinfo.com.ua'
): BreadcrumbItem[] {
  return items.map(item => ({
    name: item.name,
    item: `${baseUrl}${item.url}`
  }))
}

// Популярні breadcrumbs шаблони
export const BREADCRUMB_TEMPLATES = {
  home: () => createBreadcrumbs([{ name: 'Головна', url: '/' }]),
  
  category: (categoryName: string, categoryUrl: string) => 
    createBreadcrumbs([
      { name: 'Головна', url: '/' },
      { name: categoryName, url: categoryUrl }
    ]),
  
  article: (categoryName: string, categoryUrl: string, articleTitle: string, articleUrl: string) =>
    createBreadcrumbs([
      { name: 'Головна', url: '/' },
      { name: categoryName, url: categoryUrl },
      { name: articleTitle, url: articleUrl }
    ]),
  
  about: createBreadcrumbs([
    { name: 'Головна', url: '/' },
    { name: 'Про редакцію', url: '/about' }
  ])
} as const
