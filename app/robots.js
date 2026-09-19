export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/dashboard', '/signin'],
    },
    sitemap: 'https://routeprospect.com/sitemap.xml',
  };
}
