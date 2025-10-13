import Link from 'next/link';
import { Trophy } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t bg-slate-50/50 mt-20">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo et description */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl mb-4">
              <Trophy className="h-6 w-6 text-blue-600" />
              <span className="bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
                Volleo
              </span>
            </Link>
            <p className="text-slate-600 text-sm max-w-md">
              La plateforme dédiée aux passionnés de volleyball. Créez, gérez et participez à des tournois indoor et beach partout en France.
            </p>
          </div>

          {/* Liens rapides */}
          <div>
            <h3 className="font-semibold text-slate-900 mb-4">Tournois</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="text-slate-600 hover:text-blue-600 transition-colors">
                  Découvrir
                </Link>
              </li>
              <li>
                <Link href="/tournois/creer" className="text-slate-600 hover:text-blue-600 transition-colors">
                  Créer un tournoi
                </Link>
              </li>
              <li>
                <Link href="/mes-tournois" className="text-slate-600 hover:text-blue-600 transition-colors">
                  Mes tournois
                </Link>
              </li>
            </ul>
          </div>

          {/* À propos */}
          <div>
            <h3 className="font-semibold text-slate-900 mb-4">Légal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="#" className="text-slate-600 hover:text-blue-600 transition-colors">
                  CGU
                </Link>
              </li>
              <li>
                <Link href="#" className="text-slate-600 hover:text-blue-600 transition-colors">
                  Confidentialité
                </Link>
              </li>
              <li>
                <Link href="#" className="text-slate-600 hover:text-blue-600 transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t mt-8 pt-8 text-center">
          <p className="text-sm text-slate-600">
            © {new Date().getFullYear()} Volleo — Propulsé par{' '}
            <a
              href="https://supabase.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Supabase
            </a>{' '}
            &{' '}
            <a
              href="https://nextjs.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Next.js
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}

