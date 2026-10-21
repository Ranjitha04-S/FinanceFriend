import './globals.css';
export const metadata = { title: 'Daily Collection', description: 'Daily collection ledger' };
export const viewport = { width: 'device-width', initialScale: 1, themeColor: '#12332f' };
export default function RootLayout({ children }) {
  return (<html lang="en" suppressHydrationWarning><body>{children}</body></html>);
}
