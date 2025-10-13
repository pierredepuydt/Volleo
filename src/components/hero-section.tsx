'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Trophy, ArrowRight, Zap, Users, Calendar } from 'lucide-react';

interface HeroSectionProps {
  user?: any;
}

export function HeroSection({ user }: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-600 text-white">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="container mx-auto px-6 py-20 md:py-32 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full mb-6 border border-white/20">
              <Zap className="h-4 w-4 text-amber-300" />
              <span className="text-sm font-medium">La plateforme #1 des tournois de volley</span>
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              Rejoins la communauté
              <br />
              <span className="bg-gradient-to-r from-amber-300 to-orange-300 bg-clip-text text-transparent">
                des volleyeurs
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-blue-100 mb-10 max-w-2xl mx-auto leading-relaxed">
              Crée ou découvre ton prochain tournoi indoor ou beach.
              <br />
              Simple, rapide, et gratuit.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              {user ? (
                <>
                  <Link href="/tournois/creer">
                    <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 shadow-xl hover:shadow-2xl transition-all px-8 py-6 text-lg">
                      <Trophy className="h-5 w-5 mr-2" />
                      Créer un tournoi
                      <ArrowRight className="h-5 w-5 ml-2" />
                    </Button>
                  </Link>
                  <Link href="/mes-tournois">
                    <Button size="lg" variant="outline" className="bg-transparent border-2 border-white text-white hover:bg-white/10 px-8 py-6 text-lg">
                      Mes tournois
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/auth/inscription">
                    <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 shadow-xl hover:shadow-2xl transition-all px-8 py-6 text-lg">
                      Commencer gratuitement
                      <ArrowRight className="h-5 w-5 ml-2" />
                    </Button>
                  </Link>
                  <Link href="/auth/connexion">
                    <Button size="lg" variant="outline" className="bg-transparent border-2 border-white text-white hover:bg-white/10 px-8 py-6 text-lg">
                      Se connecter
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="grid grid-cols-3 gap-8 max-w-2xl mx-auto"
          >
            <div className="text-center">
              <div className="flex justify-center mb-2">
                <Users className="h-8 w-8 text-amber-300" />
              </div>
              <div className="text-3xl font-bold mb-1">100+</div>
              <div className="text-sm text-blue-200">Joueurs actifs</div>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-2">
                <Trophy className="h-8 w-8 text-amber-300" />
              </div>
              <div className="text-3xl font-bold mb-1">50+</div>
              <div className="text-sm text-blue-200">Tournois créés</div>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-2">
                <Calendar className="h-8 w-8 text-amber-300" />
              </div>
              <div className="text-3xl font-bold mb-1">24/7</div>
              <div className="text-sm text-blue-200">Disponible</div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Wave separator */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
          <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 80C1200 80 1320 70 1380 65L1440 60V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white"/>
        </svg>
      </div>
    </section>
  );
}

