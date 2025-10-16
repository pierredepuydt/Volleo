import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';

// Optimisation de la police avec preload et display swap
const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

// Métadonnées par défaut
export const metadata: Metadata = {
  title: {
    default: 'Volleo - Plateforme de Tournois de Volleyball',
    template: '%s | Volleo'
  },
  description: 'Créez, découvrez et participez à des tournois de volleyball indoor et beach. Plateforme gratuite pour organiser vos compétitions.',
  applicationName: 'Volleo',
  authors: [{ name: 'Volleo Team' }],
  generator: 'Next.js',
  keywords: ['volleyball', 'tournoi', 'beach volley', 'volleyball indoor', 'compétition', 'sport'],
  referrer: 'origin-when-cross-origin',
  creator: 'Volleo',
  publisher: 'Volleo',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-icon.png',
  },
  manifest: '/manifest.json',
};

// Configuration du viewport pour le responsive
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#2563eb' },
    { media: '(prefers-color-scheme: dark)', color: '#1e40af' }
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className="scroll-smooth">
      <head>
        {/* Preconnect to external domains for performance */}
        <link rel="preconnect" href="https://images.unsplash.com" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
      </head>
      <body className={`${inter.variable} ${inter.className} antialiased`}>
        {/* Skip to main content for accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-lg focus:shadow-lg"
        >
          Aller au contenu principal
        </a>
        {children}
        <Toaster />
      </body>
    </html>
  );
}

