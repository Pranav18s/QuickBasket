/**
 * apps/web/app/layout.jsx
 *
 * Root layout — wraps the entire application.
 *
 * This is a SERVER Component by default. It:
 *   1. Sets the <html> and <body> attributes.
 *   2. Imports global CSS.
 *   3. Wraps children in StoreProvider (a Client Component) so that
 *      Redux state is available everywhere below.
 *
 * We do NOT put any client-side logic directly in this file.
 */

import './globals.css';
import StoreProvider from '../store/provider';

export const metadata = {
  title: {
    template: '%s | QuickBasket',
    default: 'QuickBasket — Fresh Groceries in Edappal & Vattamkulam',
  },
  description:
    'QuickBasket 2026 — a portfolio demo grocery ordering website for Edappal and Vattamkulam, Kerala. ' +
    'Browse fresh groceries, manage your cart, and place demo orders.',
  keywords: ['grocery', 'Edappal', 'Vattamkulam', 'Kerala', 'online grocery', 'demo'],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {/* StoreProvider is a Client Component — it creates the Redux store once
            per browser session and wraps children in <Provider>. */}
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}
