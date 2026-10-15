import { Analytics } from '@vercel/analytics/next';
import './styles.css';
import './brand.css';

export const metadata = {
  metadataBase: new URL('https://routeprospect.com'),
  title: { default: 'RouteProspect | Prospect Intelligence for AEO, GEO & AI Search', template: '%s | RouteProspect' },
  description: 'Find prospects for AEO/GEO agencies and AI-search products. RouteProspect helps agency owners, founders and SDRs identify relevant marketing buyers, research account signals and personalize outreach.',
  keywords: ['RouteProspect','AEO prospecting software','AEO sales prospecting','AEO SDR','GEO prospecting','AI search prospecting','AI search sales','AEO ICP','AI search ICP','prospect intelligence','account research','AEO outreach'],
  alternates: { canonical: '/' },
  icons: {
    icon: '/favicon.png',
    shortcut: '/favicon.png',
    apple: '/favicon.png',
  },
  openGraph: { title: 'RouteProspect | Prospect Intelligence for AEO, GEO & AI Search', description: 'Find prospects for AEO/GEO agencies and AI-search products. Identify relevant marketing buyers, research account signals and personalize outreach.', url: 'https://routeprospect.com', siteName: 'RouteProspect', type: 'website' },
  twitter: { card: 'summary_large_image', title: 'RouteProspect | Prospect Intelligence for AEO, GEO & AI Search', description: 'Find relevant marketing buyers for AEO, GEO and AI-search products.' },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-snippet': -1 } },
};

export default function RootLayout({ children }) {
  const organization = {
    '@context':'https://schema.org',
    '@type':'Organization',
    '@id':'https://routeprospect.com/#organization',
    name:'RouteProspect',
    url:'https://routeprospect.com/',
    logo:'https://routeprospect.com/favicon.png',
    email:'j.pranav9@gmail.com',
    description:'Find prospects for AEO/GEO agencies and AI-search products. Identify relevant marketing buyers, research account signals and personalize outreach.'
  };
  const website = {
    '@context':'https://schema.org',
    '@type':'WebSite',
    '@id':'https://routeprospect.com/#website',
    name:'RouteProspect',
    alternateName:['RouteProspect','routeprospect.com'],
    url:'https://routeprospect.com/',
    description:'Prospect intelligence for AEO, GEO and AI-search product builders.',
    publisher:{'@id':'https://routeprospect.com/#organization'}
  };
  const software = {
    '@context':'https://schema.org',
    '@type':'SoftwareApplication',
    '@id':'https://routeprospect.com/#software',
    name:'RouteProspect',
    url:'https://routeprospect.com/',
    applicationCategory:'BusinessApplication',
    operatingSystem:'Web',
    description:'Prospect intelligence software for teams selling AEO, GEO and AI-search products.',
    publisher:{'@id':'https://routeprospect.com/#organization'}
  };
  return <html lang="en"><body><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(organization)}}/><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(website)}}/><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(software)}}/>{children}<Analytics /></body></html>;
}
