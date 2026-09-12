import { Analytics } from '@vercel/analytics/next';
import './styles.css';
import './brand.css';

export const metadata = {
  title: 'RouteProspect | Find the Right People at the Right Accounts',
  description: 'RouteProspect helps AEO/GEO product builders find relevant marketing prospects, understand why they matter, and approach them with context.',
  keywords: ['RouteProspect', 'prospect intelligence', 'AEO prospecting', 'GEO prospecting', 'AI search', 'B2B prospecting', 'account research'],
};

export default function RootLayout({ children }) {
  return <html lang="en"><body>{children}<Analytics /></body></html>;
}
