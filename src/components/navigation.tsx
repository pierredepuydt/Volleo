'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Trophy, Plus, User, LogOut, Menu, X, Home, ListTodo } from 'lucide-react';
import { useState, useEffect } from 'react';
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
  const [scrolled, setScrolled] = useState(false);

  const displayName = userProfile?.first_name 
    ? `${userProfile.first_name} ${userProfile.last_name || ''}`.trim()
    : user?.email?.split('@')[0] || 'Mon profil';

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  return (
    <>
      <header 
        className={`sticky top-0 z-50 border-b transition-all duration-300 ${
          scrolled 
            ? 'bg-white/95 backdrop-blur-xl shadow-sm' 
            : 'bg-white/80 backdrop-blur-lg'
        }`}
      >
        <div className="container mx-auto px-6">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-8">
              <Link href="/" className="flex items-center gap-2 font-bold text-xl group">
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                  className="bg-gradient-to-br from-blue-600 to-blue-400 p-1.5 rounded-lg"
                >
                  <Trophy className="h-5 w-5 text-white" />
                </motion.div>
                <span className="bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
                  Volleo
                </span>
              </Link>

              <nav className="hidden md:flex items-center gap-1">
                <Link href="/">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`transition-colors ${
                      pathname === '/' 
                        ? 'bg-blue-50 text-blue-600' 
                        : 'text-slate-600 hover:text-blue-600 hover:bg-blue-50'
                    }`}
                  >
                    <Home className="h-4 w-4 mr-2" />
                    Tournois
                  </Button>
                </Link>
                {user && (
                  <>
                    <Link href="/mes-tournois">
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`transition-colors ${
                          pathname === '/mes-tournois'
                            ? 'bg-blue-50 text-blue-600'
                            : 'text-slate-600 hover:text-blue-600 hover:bg-blue-50'
                        }`}
                      >
                        <ListTodo className="h-4 w-4 mr-2" />
                        Mes Tournois
                      </Button>
                    </Link>
                  </>
                )}
              </nav>
            </div>

            <div className="flex items-center gap-2">
              {user ? (
                <>
                  <Link href="/tournois/creer" className="hidden lg:block">
                    <Button 
                      size="sm" 
                      className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-sm hover:shadow-md transition-all"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Créer un tournoi
                    </Button>
                  </Link>
                  <NotificationBell userId={user.id} />
                  <Link href="/profil" className="hidden sm:flex">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="gap-2 hover:bg-blue-50"
                    >
                      <div className="bg-gradient-to-br from-blue-600 to-blue-400 p-1.5 rounded-full">
                        <User className="h-3.5 w-3.5 text-white" />
                      </div>
                      <span className="text-sm font-medium text-slate-700 max-w-[120px] truncate">
                        {displayName}
                      </span>
                    </Button>
                  </Link>
                  <Link href="/profil" className="sm:hidden">
                    <Button variant="ghost" size="icon" className="hover:bg-blue-50">
                      <User className="h-5 w-5" />
                    </Button>
                  </Link>
                  <form action="/auth/signout" method="post">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      type="submit" 
                      className="hover:bg-red-50 hover:text-red-600 transition-colors"
                      title="Déconnexion"
                    >
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
                    <Button 
                      size="sm" 
                      className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-sm hover:shadow-md transition-all"
                    >
                      Inscription
                    </Button>
                  </Link>
                </>
              )}
              
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden hover:bg-blue-50"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label={mobileMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
              >
                {mobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile menu overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-16 right-0 bottom-0 w-72 bg-white shadow-2xl z-50 md:hidden overflow-y-auto"
            >
              <nav className="flex flex-col p-6 gap-2">
                <Link href="/">
                  <Button
                    variant="ghost"
                    className={`w-full justify-start ${
                      pathname === '/' ? 'bg-blue-50 text-blue-600' : 'text-slate-600'
                    }`}
                  >
                    <Home className="h-4 w-4 mr-3" />
                    Tournois
                  </Button>
                </Link>
                {user && (
                  <>
                    <Link href="/mes-tournois">
                      <Button
                        variant="ghost"
                        className={`w-full justify-start ${
                          pathname === '/mes-tournois' ? 'bg-blue-50 text-blue-600' : 'text-slate-600'
                        }`}
                      >
                        <ListTodo className="h-4 w-4 mr-3" />
                        Mes Tournois
                      </Button>
                    </Link>
                    <Link href="/tournois/creer">
                      <Button
                        variant="ghost"
                        className={`w-full justify-start ${
                          pathname === '/tournois/creer' ? 'bg-blue-50 text-blue-600' : 'text-slate-600'
                        }`}
                      >
                        <Plus className="h-4 w-4 mr-3" />
                        Créer un Tournoi
                      </Button>
                    </Link>
                    <div className="my-4 border-t" />
                    <Link href="/profil">
                      <Button
                        variant="ghost"
                        className={`w-full justify-start ${
                          pathname === '/profil' ? 'bg-blue-50 text-blue-600' : 'text-slate-600'
                        }`}
                      >
                        <User className="h-4 w-4 mr-3" />
                        Mon Profil
                      </Button>
                    </Link>
                  </>
                )}
                {!user && (
                  <>
                    <div className="my-4 border-t" />
                    <Link href="/auth/connexion">
                      <Button variant="outline" className="w-full">
                        Connexion
                      </Button>
                    </Link>
                    <Link href="/auth/inscription">
                      <Button className="w-full bg-gradient-to-r from-blue-600 to-blue-700">
                        Inscription
                      </Button>
                    </Link>
                  </>
                )}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}





