import { Analytics } from '@vercel/analytics/next';
import './styles.css';
import './brand.css';

export const metadata = {
  metadataBase: new URL('https://routeprospect.com'),
  title: { default: 'RouteProspect | AEO & AI Search Prospect Intelligence', template: '%s | RouteProspect' },
  description: 'RouteProspect helps AEO and GEO sales teams find the right marketing prospects, understand account signals and build relevant outreach from public evidence.',
  keywords: ['RouteProspect','AEO sales prospecting','AEO SDR','GEO prospecting','AI search sales','AEO ICP','AI search ICP','prospect intelligence','account research','AEO outreach'],
  alternates: { canonical: '/' },
  openGraph: { title: 'RouteProspect | AEO & AI Search Prospect Intelligence', description: 'Find the right marketing people at the right accounts for AEO, GEO and AI-search products.', url: 'https://routeprospect.com', siteName: 'RouteProspect', type: 'website' },
  twitter: { card: 'summary_large_image', title: 'RouteProspect | AEO & AI Search Prospect Intelligence', description: 'Find the right marketing people at the right accounts.' },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }) {
  const organization = { '@context':'https://schema.org', '@type':'Organization', name:'RouteProspect', url:'https://routeprospect.com', description:'Prospect intelligence for AEO, GEO and AI-search product builders.' };
  const software = { '@context':'https://schema.org', '@type':'SoftwareApplication', name:'RouteProspect', url:'https://routeprospect.com', applicationCategory:'BusinessApplication', operatingSystem:'Web', description:'Prospect intelligence for AEO, GEO and AI-search sales teams.' };
  return <html lang="en"><body><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(organization)}}/><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(software)}}/>{children}<Analytics /></body></html>;
}
