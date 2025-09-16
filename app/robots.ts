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
        '/static/'
      ],
    },
    sitemap: 'https://galinfo.com.ua/sitemap.xml',
    host: 'https://galinfo.com.ua'
  }
}
