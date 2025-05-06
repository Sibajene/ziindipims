import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from './ui/button';
import { Logo } from './ui/logo';
import { Menu, X, ChevronDown } from 'lucide-react';
import { usePathname } from 'next/navigation';

export function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  // Handle scroll effect for header
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when navigating
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const navItems = [
    { href: "#features", label: "Features" },
    { href: "#pricing", label: "Pricing" },
    { href: "#testimonials", label: "Testimonials" },
    { href: "#faq", label: "FAQ" },
  ];

  return (
    <header 
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-white/95 backdrop-blur-md shadow-md py-2' 
          : 'bg-white/90 backdrop-blur-sm shadow-sm py-3'
      }`}
    >
      <div className="container mx-auto px-4 flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="flex items-center group">
          <Logo size="lg" withText={false} asLink={false} />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center">
          <div className="bg-slate-100/80 rounded-full px-1 py-1 flex space-x-1 mr-8 hover:bg-slate-100 transition-colors">
            {navItems.map((item, index) => (
              <Link
                key={index}
                href={item.href}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-purple rounded-full transition-all duration-200 hover:bg-white hover:shadow-sm relative group"
              >
                {item.label}
                <span className="absolute inset-x-0 bottom-0 h-0.5 bg-purple scale-x-0 group-hover:scale-x-100 transition-transform origin-left rounded-full"></span>
              </Link>
            ))}
          </div>
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-purple/40 focus:ring-offset-2 transition-all"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle mobile menu"
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>

        {/* Auth Buttons */}
        <div className="hidden md:flex items-center space-x-4">
          <Link href="/login">
            <Button 
              variant="ghost" 
              className="text-slate-600 hover:text-navy hover:bg-slate-100 transition-all"
            >
              Log In
            </Button>
          </Link>
          <Link href="/register">
            <Button 
              className="bg-purple hover:bg-purple/90 text-white shadow-md shadow-purple/20 transition-all duration-300 hover:shadow-lg hover:shadow-purple/30 hover:translate-y-[-1px]"
            >
              Start Free Trial
            </Button>
          </Link>
        </div>
      </div>

      {/* Mobile Navigation - Slide down animation */}
      <div 
        className={`md:hidden border-t border-slate-100 overflow-hidden transition-all duration-300 ease-in-out ${
          mobileMenuOpen 
            ? 'max-h-[500px] opacity-100' 
            : 'max-h-0 opacity-0'
        }`}
      >
        <div className="container mx-auto px-4 py-3">
          <nav className="flex flex-col space-y-2">
            {navItems.map((item, index) => (
              <Link 
                key={index}
                href={item.href} 
                className="px-4 py-3 text-slate-600 hover:text-purple hover:bg-slate-50 rounded-lg flex items-center justify-between transition-all"
              >
                <span>{item.label}</span>
                <ChevronDown size={16} className="text-slate-400" />
              </Link>
            ))}
            <Link 
              href="/(dashboard)/subscriptions" 
              className="px-4 py-3 text-slate-600 hover:text-purple hover:bg-slate-50 rounded-lg flex items-center justify-between transition-all"
            >
              <span>Subscriptions</span>
              <ChevronDown size={16} className="text-slate-400" />
            </Link>
          </nav>
          
          <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-4 border-t border-slate-100">
            <Link href="/login" className="flex-1">
              <Button 
                variant="outline" 
                className="w-full border-navy text-navy hover:bg-navy hover:text-white transition-all"
              >
                Log In
              </Button>
            </Link>
            <Link href="/register" className="flex-1">
              <Button 
                className="w-full bg-purple hover:bg-purple/90 text-white shadow-sm hover:shadow-md transition-all"
              >
                Start Free Trial
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}