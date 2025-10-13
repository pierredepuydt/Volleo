'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Trophy, Plus, User, LogOut, Menu } from 'lucide-react';
import { useState } from 'react';
import { NotificationBell } from '@/components/notification-bell';

interface NavigationProps {
  user?: {
    id: string;
    email?: string;
  } | null;
  userProfile?: {
    first_name: string | null;
    last_name: string | null;
  } | null;
}

export function Navigation({ user, userProfile }: NavigationProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const displayName = userProfile?.first_name 
    ? `${userProfile.first_name} ${userProfile.last_name || ''}`.trim()
    : user?.email?.split('@')[0] || 'Mon profil';

  return (
    <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-lg">
      <div className="container mx-auto px-6">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl">
              <Trophy className="h-6 w-6 text-blue-600" />
              <span className="bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
                Volleo
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-6">
              <Link
                href="/"
                className={`text-sm font-medium transition-colors hover:text-blue-600 ${
                  pathname === '/' ? 'text-blue-600' : 'text-slate-600'
                }`}
              >
                Tournois
              </Link>
              {user && (
                <>
                  <Link
                    href="/mes-tournois"
                    className={`text-sm font-medium transition-colors hover:text-blue-600 ${
                      pathname === '/mes-tournois'
                        ? 'text-blue-600'
                        : 'text-slate-600'
                    }`}
                  >
                    Mes Tournois
                  </Link>
                  <Link
                    href="/tournois/creer"
                    className={`text-sm font-medium transition-colors hover:text-blue-600 ${
                      pathname === '/tournois/creer'
                        ? 'text-blue-600'
                        : 'text-slate-600'
                    }`}
                  >
                    Créer un Tournoi
                  </Link>
                </>
              )}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <>
                <Link href="/tournois/creer" className="hidden lg:block">
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Créer un tournoi
                  </Button>
                </Link>
                <NotificationBell userId={user.id} />
                <Link href="/profil" className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-blue-50 transition-colors">
                  <User className="h-5 w-5 text-slate-600" />
                  <span className="text-sm font-medium text-slate-700">{displayName}</span>
                </Link>
                <Link href="/profil" className="sm:hidden">
                  <Button variant="ghost" size="icon" className="hover:bg-blue-50">
                    <User className="h-5 w-5" />
                  </Button>
                </Link>
                <form action="/auth/signout" method="post">
                  <Button variant="ghost" size="icon" type="submit" className="hover:bg-red-50 hover:text-red-600">
                    <LogOut className="h-5 w-5" />
                  </Button>
                </form>
              </>
            ) : (
              <>
                <Link href="/auth/connexion" className="hidden sm:block">
                  <Button variant="ghost" size="sm" className="hover:bg-blue-50">
                    Connexion
                  </Button>
                </Link>
                <Link href="/auth/inscription">
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                    Inscription
                  </Button>
                </Link>
              </>
            )}
            
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t py-4">
            <nav className="flex flex-col gap-4">
              <Link
                href="/"
                className="text-sm font-medium text-slate-600 hover:text-blue-600"
                onClick={() => setMobileMenuOpen(false)}
              >
                Tournois
              </Link>
              {user && (
                <>
                  <Link
                    href="/mes-tournois"
                    className="text-sm font-medium text-slate-600 hover:text-blue-600"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Mes Tournois
                  </Link>
                  <Link
                    href="/tournois/creer"
                    className="text-sm font-medium text-slate-600 hover:text-blue-600"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Créer un Tournoi
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}





