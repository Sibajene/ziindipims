import React from 'react';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-navy text-white py-12">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <h3 className="font-bold mb-4">ZiindiPro</h3>
          <p className="text-sm max-w-xs">
            The complete pharmacy management solution trusted by thousands of pharmacies.
          </p>
        </div>
        <div>
          <h4 className="font-semibold mb-3">Product</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/features" className="hover:underline">Features</Link></li>
            <li><Link href="/pricing" className="hover:underline">Pricing</Link></li>
            <li><Link href="/demo" className="hover:underline">Demo</Link></li>
            <li><Link href="/contact" className="hover:underline">Contact</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3">Company</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/about" className="hover:underline">About Us</Link></li>
            <li><Link href="/careers" className="hover:underline">Careers</Link></li>
            <li><Link href="/blog" className="hover:underline">Blog</Link></li>
            <li><Link href="/support" className="hover:underline">Support</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3">Legal</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/terms" className="hover:underline">Terms of Service</Link></li>
            <li><Link href="/privacy" className="hover:underline">Privacy Policy</Link></li>
            <li><Link href="/security" className="hover:underline">Security</Link></li>
          </ul>
        </div>
      </div>
      <div className="text-center text-sm mt-8 text-slate-400">
        &copy; {new Date().getFullYear()} ZiindiPro. All rights reserved.
      </div>
    </footer>
  );
}
