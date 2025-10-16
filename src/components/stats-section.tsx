'use client';

import { motion } from 'framer-motion';
import { Users, Trophy, MapPin, TrendingUp, Star, Zap } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';

interface StatItemProps {
  icon: React.ElementType;
  value: string;
  label: string;
  suffix?: string;
  delay: number;
}

function StatItem({ icon: Icon, value, label, suffix = '', delay }: StatItemProps) {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const targetValue = parseInt(value);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    const duration = 2000;
    const steps = 60;
    const increment = targetValue / steps;
    const stepDuration = duration / steps;

    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      if (currentStep >= steps) {
        setCount(targetValue);
        clearInterval(timer);
      } else {
        setCount(Math.floor(increment * currentStep));
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, [isVisible, targetValue]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isVisible ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay }}
      className="relative group"
    >
      <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-slate-100 hover:border-blue-200 hover:scale-105">
        {/* Icon avec gradient background */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-400 rounded-xl p-4 w-fit mb-4 group-hover:scale-110 transition-transform">
          <Icon className="h-8 w-8 text-white" />
        </div>
        
        {/* Valeur animée */}
        <div className="text-4xl font-bold text-slate-900 mb-2">
          {count}
          {suffix}
        </div>
        
        {/* Label */}
        <div className="text-slate-600 font-medium">{label}</div>
        
        {/* Decorative element */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/10 to-transparent rounded-full blur-2xl -z-10 group-hover:scale-150 transition-transform" />
      </div>
    </motion.div>
  );
}

export function StatsSection() {
  const stats = [
    { icon: Users, value: '250', suffix: '+', label: 'Joueurs inscrits', delay: 0 },
    { icon: Trophy, value: '120', suffix: '+', label: 'Tournois organisés', delay: 0.1 },
    { icon: MapPin, value: '45', suffix: '+', label: 'Villes couvertes', delay: 0.2 },
    { icon: TrendingUp, value: '95', suffix: '%', label: 'Taux de satisfaction', delay: 0.3 },
  ];

  return (
    <section className="py-12 px-6 bg-gradient-to-b from-slate-50 to-white relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-10 left-10 w-72 h-72 bg-blue-200 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-cyan-200 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto max-w-7xl relative z-10">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 rounded-full mb-6">
            <Star className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-semibold text-blue-600">Notre Impact</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            Rejoins une communauté
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              en pleine croissance
            </span>
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Des milliers de volleyeurs nous font confiance pour organiser et participer à des tournois inoubliables
          </p>
        </motion.div>

        {/* Stats grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <StatItem key={index} {...stat} />
          ))}
        </div>
      </div>
    </section>
  );
}

