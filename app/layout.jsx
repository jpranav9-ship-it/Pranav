import { Analytics } from '@vercel/analytics/next';
import './styles.css';

export const metadata = {
  title: 'RouteProspect | Prospect Intelligence for AEO/GEO Teams',
  description: 'RouteProspect helps AEO/GEO teams find the right marketing people inside target accounts, understand why they matter, and get a relevant outreach angle.',
  keywords: ['AEO prospecting', 'GEO prospecting', 'AI search', 'AEO sales', 'AEO marketing', 'prospect intelligence', 'account research'],
};

export default function RootLayout({ children }) {
  return <html lang="en"><body>{children}<Analytics /></body></html>;
}
