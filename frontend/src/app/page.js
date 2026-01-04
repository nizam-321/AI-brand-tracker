//path: frontend/src/app/page.js
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import useReveal from '@/hooks/useReveal';

import {
  ArrowRight,
  BarChart3,
  TrendingUp,
  Zap,
  Shield,
  Globe,
  Eye,
} from 'lucide-react';

export default function Home() {
  useReveal();

  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) router.push('/dashboard');
  }, [user, router]);

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <Navbar />
      <HeroSection />
      <StatsSection />
      <FeaturesSection />
      <CTASection />
      <Footer />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* NAVBAR */
/* -------------------------------------------------------------------------- */

function Navbar() {
  return (
    <nav className="fixed top-0 w-full bg-white border-b shadow-sm z-50">
      <div className="container mx-auto px-4 md:px-6 py-4 flex items-center justify-between">

        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900">BrandTracker</span>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <Link href="/login">
            <Button variant="ghost" className="text-gray-800 hover:bg-gray-100">
              Login
            </Button>
          </Link>
          <Link href="/signup">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              Get Started <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>

      </div>
    </nav>
  );
}

/* -------------------------------------------------------------------------- */
/* HERO SECTION */
/* -------------------------------------------------------------------------- */

function HeroSection() {
  return (
    <section className="pt-32 md:pt-40 pb-20 text-center px-4 bg-gradient-to-b from-white via-white to-gray-50 reveal">
      <div className="container mx-auto">

        {/* Tag */}
        <span className="px-4 py-1 rounded-full text-sm font-medium 
          bg-blue-100 text-blue-700">
          AI-Powered Brand Monitoring
        </span>

        {/* Title */}
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mt-6 text-gray-900">
          Monitor Your Brand Reputation
          <span className="block bg-blue-700 bg-clip-text text-transparent">
            Across The Internet
          </span>
        </h1>

        {/* Subtext */}
        <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mt-4">
          Real-time monitoring, sentiment analysis, and instant alerts for brand mentions across social media and the web.
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
          <Link href="/signup">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-10">
              Start Free Trial <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>

          <Link href="/login">
            <Button
              size="lg"
              className="bg-white border border-gray-300 text-gray-900 hover:bg-gray-100 px-10"
            >
              View Demo
            </Button>
          </Link>
        </div>

      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* STATS SECTION */
/* -------------------------------------------------------------------------- */

function StatsSection() {
  const stats = [
    { value: "10M+", label: "Mentions Tracked" },
    { value: "500+", label: "Brands Monitored" },
    { value: "99.9%", label: "Uptime" },
    { value: "<1s", label: "Response Time" },
  ];

  return (
    <section className="py-16 bg-gray-50 opacity-5 px-4 reveal">
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">

        {stats.map((s, i) => (
          <div
            key={i}
            className="bg-blue-100 shadow-sm border rounded-xl p-6 text-center card-hover"
          >
            <div className="text-2xl md:text-3xl font-bold text-gray-900">{s.value}</div>
            <div className="text-gray-500 mt-2 text-sm md:text-base">{s.label}</div>
          </div>
        ))}

      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* FEATURES SECTION */
/* -------------------------------------------------------------------------- */

function FeaturesSection() {
  const features = [
    { icon: <Eye className="w-8 h-8 text-blue-600" />, title: "Real-time Monitoring", desc: "Track brand mentions across all platforms instantly." },
    { icon: <TrendingUp className="w-8 h-8 text-blue-600" />, title: "Sentiment Analysis", desc: "AI-powered sentiment detection for accurate insights." },
    { icon: <Zap className="w-8 h-8 text-blue-600" />, title: "Instant Alerts", desc: "Get alerts when negative mentions spike." },
    { icon: <BarChart3 className="w-8 h-8 text-blue-600" />, title: "Deep Analytics", desc: "Visual dashboards with trends and charts." },
    { icon: <Globe className="w-8 h-8 text-blue-600" />, title: "Multi-platform Coverage", desc: "Track mentions across social media, news, blogs." },
    { icon: <Shield className="w-8 h-8 text-blue-600" />, title: "Enterprise Security", desc: "Secure and encrypted platform for all your data." },
  ];

  return (
    <section className="py-20 px-4 bg-white reveal">
      <div className="container mx-auto">

        {/* Title */}
        <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-4">
          Powerful Features
        </h2>
        <p className="text-lg text-gray-600 text-center max-w-2xl mx-auto mb-12">
          Everything you need to monitor and manage your online presence.
        </p>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">

          {features.map((f, i) => (
            <div
              key={i}
              className="bg-gray-100 border shadow-sm rounded-2xl p-8 card-hover"
            >
              <div className="w-16 h-16 rounded-xl bg-blue-100 flex items-center justify-center mb-6">
                {f.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">{f.title}</h3>
              <p className="text-gray-600">{f.desc}</p>
            </div>
          ))}

        </div>

      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* CTA SECTION */
/* -------------------------------------------------------------------------- */

function CTASection() {
  return (
    <section className="py-20 bg-gray-50 px-4 reveal">
      <div className="container mx-auto">
        <div className=" rounded-3xl p-10 md:p-14 text-center">

          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Ready to Get Started?
          </h2>

          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
            Start monitoring your brand reputation today with our AI-powered tools.
          </p>

          <Link href="/signup">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-12">
              Start Free Trial <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>

          <p className="text-gray-500 mt-4 text-sm">
            No credit card required • 14-day free trial
          </p>

        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* FOOTER */
/* -------------------------------------------------------------------------- */

function Footer() {
  return (
    <footer className="py-10 px-4 border-t reveal">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between">

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold text-gray-900">BrandTracker</span>
        </div>

        <p className="text-gray-500 mt-4 md:mt-0">
          © 2025 BrandTracker. All rights reserved.
        </p>

      </div>
    </footer>
  );
}
