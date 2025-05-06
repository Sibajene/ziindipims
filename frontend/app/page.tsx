'use client'
import { useState } from 'react';
import { Navigation } from '../components/navigation';
import { Hero } from '../components/hero';
import { Features } from '../components/features';
import { Pricing } from '../components/pricing';
import { Testimonials } from '../components/testimonials';
import { FAQ } from '../components/faq';
import { Footer } from '../components/footer';

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  return (
    <div className="flex flex-col min-h-screen">
      <Navigation/>
      <main className="flex-grow">
        <Hero />
        <Features />
        <Pricing />
        <Testimonials />
        <FAQ />
      </main>
      <Footer />
    </div>
  );
}