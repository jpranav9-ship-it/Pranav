const baseUrl = 'https://routeprospect.com';

export default function sitemap() {
  const pages = [
    ['', 'weekly'],
    ['/about', 'monthly'],
    ['/contact', 'monthly'],
    ['/resources', 'weekly'],
    ['/resources/aeo-prospecting-software', 'monthly'],
    ['/resources/aeo-sales-prospecting', 'monthly'],
    ['/resources/aeo-sdr-playbook', 'monthly'],
    ['/resources/ai-search-prospecting', 'monthly'],
    ['/resources/ai-search-buyers', 'monthly'],
    ['/resources/geo-vs-seo-sales', 'monthly'],
  ];

  return pages.map(([path, changeFrequency]) => ({
    url: `${baseUrl}${path}`,
    changeFrequency,
    priority: path === '' ? 1 : path.startsWith('/resources') ? 0.8 : 0.6,
  }));
}
