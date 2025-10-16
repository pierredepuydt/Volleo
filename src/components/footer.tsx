'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Trophy, Facebook, Twitter, Instagram, Linkedin, Heart } from 'lucide-react';

export function Footer() {
  const socialLinks = [
    { icon: Facebook, href: '#', label: 'Facebook' },
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Instagram, href: '#', label: 'Instagram' },
    { icon: Linkedin, href: '#', label: 'LinkedIn' },
  ];

  const footerSections = [
    {
      title: 'Tournois',
      links: [
        { label: 'Découvrir', href: '/' },
        { label: 'Créer un tournoi', href: '/tournois/creer' },
        { label: 'Mes tournois', href: '/mes-tournois' },
      ]
    },
    {
      title: 'À propos',
      links: [
        { label: 'À propos de nous', href: '#' },
        { label: 'FAQ', href: '#' },
        { label: 'Blog', href: '#' },
      ]
    },
    {
      title: 'Légal',
      links: [
        { label: 'CGU', href: '#' },
        { label: 'Confidentialité', href: '#' },
        { label: 'Contact', href: '#' },
      ]
    }
  ];

  return (
    <footer className="relative border-t bg-gradient-to-br from-gray-50 via-white to-blue-50/30 mt-24">
      <div className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-12">
          {/* Logo et description */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 font-bold text-2xl mb-6 group">
              <div className="bg-gradient-to-br from-blue-600 to-blue-400 p-2 rounded-xl group-hover:scale-110 transition-transform">
                <Trophy className="h-7 w-7 text-white" />
              </div>
              <span className="bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
                Volleo
              </span>
            </Link>
            <p className="text-slate-600 text-base leading-relaxed max-w-md">
              La plateforme dédiée aux passionnés de volleyball. Créez, gérez et participez à des tournois indoor et beach partout en France.
            </p>
          </div>

          {/* Liens par sections */}
          {footerSections.map((section, idx) => (
            <div key={section.title}>
              <h3 className="font-bold text-slate-900 mb-4 text-sm uppercase tracking-wider">
                {section.title}
              </h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-slate-600 hover:text-blue-600 transition-colors text-sm inline-flex items-center group"
                    >
                      <span className="group-hover:translate-x-1 transition-transform">
                        {link.label}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="border-t border-slate-200 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            {/* Copyright */}
            <div className="text-sm text-slate-600 text-center md:text-left">
              <p className="flex items-center justify-center md:justify-start gap-1 flex-wrap">
                © {new Date().getFullYear()} Volleo — Fait avec{' '}
                <Heart className="h-4 w-4 text-red-500 fill-red-500 animate-pulse" />{' '}
                par l'équipe Volleo
              </p>
              <p className="mt-1">
                Propulsé par{' '}
                <a
                  href="https://supabase.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline font-medium"
                >
                  Supabase
                </a>{' '}
                &{' '}
                <a
                  href="https://nextjs.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline font-medium"
                >
                  Next.js
                </a>
              </p>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-3">
              {socialLinks.map((social, idx) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-slate-100 hover:bg-blue-600 text-slate-600 hover:text-white p-2.5 rounded-lg transition-all duration-300 hover:scale-110 group"
                >
                  <social.icon className="h-5 w-5" />
                </motion.a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Decorative gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600" />
    </footer>
  );
}

