import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/search',
        '/*?print',
        '/login/',
        '/myaccount',
        '/register',
        '/admin/',
        '/api/',
        '/_next/',
        '/static/',
        '/preview/'
      ],
    },
    sitemap: [
      'https://galinfo.com.ua/sitemap.xml',
      'https://galinfo.com.ua/sitemap-index.xml',
      'https://galinfo.com.ua/api/rss/googlenews'
    ],
    host: 'https://galinfo.com.ua'
  }
}
