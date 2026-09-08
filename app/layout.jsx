import { Analytics } from '@vercel/analytics/next';
import './styles.css';

export const metadata = {
  title: 'AEO Prospect Intelligence | Find AEO/GEO Prospects',
  description: 'Find the marketing people most relevant to AEO, GEO and AI search. Research target companies, understand AEO relevance and get an outreach angle.',
  keywords: ['AEO prospecting', 'GEO prospecting', 'AI search', 'AEO sales', 'AEO marketing', 'Answer Engine Optimization', 'Generative Engine Optimization'],
};

export default function RootLayout({ children }) {
  return <html lang="en"><body>{children}<Analytics /></body></html>;
}
