import './styles.css';

export const metadata = {
  title: 'AEO Prospect Intelligence',
  description: 'Find the marketing prospects most relevant to AEO.',
};

export default function RootLayout({ children }) {
  return <html lang="en"><body>{children}</body></html>;
}
