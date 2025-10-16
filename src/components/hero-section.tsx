'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Trophy, ArrowRight, Zap, Users, Calendar, Target } from 'lucide-react';

interface HeroSectionProps {
  user?: any;
}

export function HeroSection({ user }: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden min-h-[70vh] flex items-center">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <Image
          src="https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?q=80&w=2000&auto=format&fit=crop"
          alt="Volleyball tournament background"
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
          quality={90}
        />
        {/* Dark gradient overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/95 via-blue-800/90 to-cyan-900/85" />
        {/* Animated pattern overlay */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>
      </div>

      <div className="container mx-auto px-6 py-20 md:py-32 relative z-10">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 backdrop-blur-md rounded-full mb-8 border border-white/20 shadow-lg"
            >
              <Zap className="h-4 w-4 text-amber-400 animate-pulse" />
              <span className="text-sm font-semibold tracking-wide text-white">La plateforme #1 des tournois de volley</span>
            </motion.div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-8 leading-tight text-white tracking-tight">
              Rejoins la communauté
              <br />
              <span className="bg-gradient-to-r from-amber-400 via-amber-300 to-orange-400 bg-clip-text text-transparent">
                des volleyeurs
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-blue-50 mb-12 max-w-3xl mx-auto leading-relaxed font-light">
              Crée, découvre et vis tes tournois indoor ou beach.
              <br className="hidden sm:block" />
              <span className="text-amber-300 font-medium">Simple, rapide, et entièrement gratuit.</span>
            </p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
            >
              {user ? (
                <>
                  <Link href="/tournois/creer">
                    <Button 
                      size="lg" 
                      className="bg-white text-blue-700 hover:bg-amber-50 shadow-2xl hover:shadow-amber-500/25 hover:scale-105 transition-all duration-300 px-10 py-7 text-lg font-semibold rounded-xl group"
                    >
                      <Trophy className="h-5 w-5 mr-2 group-hover:rotate-12 transition-transform" />
                      Créer un tournoi
                      <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                  <Link href="#tournois">
                    <Button 
                      size="lg" 
                      variant="outline" 
                      className="bg-white/10 backdrop-blur-sm border-2 border-white/60 text-white hover:bg-white/20 hover:border-white transition-all duration-300 px-10 py-7 text-lg font-semibold rounded-xl"
                    >
                      <Target className="h-5 w-5 mr-2" />
                      Découvrir les tournois
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/auth/inscription">
                    <Button 
                      size="lg" 
                      className="bg-white text-blue-700 hover:bg-amber-50 shadow-2xl hover:shadow-amber-500/25 hover:scale-105 transition-all duration-300 px-10 py-7 text-lg font-semibold rounded-xl group"
                    >
                      Commencer gratuitement
                      <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                  <Link href="/auth/connexion">
                    <Button 
                      size="lg" 
                      variant="outline" 
                      className="bg-white/10 backdrop-blur-sm border-2 border-white/60 text-white hover:bg-white/20 hover:border-white transition-all duration-300 px-10 py-7 text-lg font-semibold rounded-xl"
                    >
                      Se connecter
                    </Button>
                  </Link>
                </>
              )}
            </motion.div>
          </motion.div>

          {/* Stats - Improved with cards */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto"
          >
            {[
              { icon: Users, value: '100+', label: 'Joueurs actifs', delay: 0.7 },
              { icon: Trophy, value: '50+', label: 'Tournois créés', delay: 0.8 },
              { icon: Calendar, value: '24/7', label: 'Disponible', delay: 0.9 }
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: stat.delay }}
                className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all duration-300 hover:scale-105"
              >
                <div className="flex justify-center mb-3">
                  <stat.icon className="h-10 w-10 text-amber-400" />
                </div>
                <div className="text-4xl font-bold mb-2 text-white">{stat.value}</div>
                <div className="text-sm text-blue-100 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Enhanced Wave separator with subtle animation */}
      <div className="absolute bottom-0 left-0 right-0 z-20">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
          <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 80C1200 80 1320 70 1380 65L1440 60V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white"/>
        </svg>
      </div>
    </section>
  );
}

