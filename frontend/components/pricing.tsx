import React from 'react';
import Link from 'next/link';
import { Button } from './ui/button';
import { CheckCircle2 } from 'lucide-react';

export function Pricing() {
  return (
    <section id="pricing" className="py-20 bg-slate-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4 text-navy">Simple, Transparent Pricing</h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Choose the plan that fits your pharmacy's needs. All plans include core features.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Basic Plan */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden border border-slate-200 transition-all duration-300 hover:shadow-lg relative">
            <div className="p-6 border-b bg-gradient-to-r from-navy/5 to-navy/10">
              <h3 className="text-2xl font-bold mb-2 text-navy">Basic</h3>
              <div className="flex items-baseline mb-4">
                <span className="text-4xl font-bold text-navy">K299</span>
                <span className="text-slate-500 ml-2">/month</span>
              </div>
              <p className="text-slate-600">Perfect for small pharmacies just getting started</p>
            </div>
            <div className="p-6 space-y-4">
              <ul className="space-y-3">
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Up to 500 products</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>2 user accounts</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Basic inventory management</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Sales processing</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Standard reports</span>
                </li>
              </ul>
              <Link href="/register?plan=basic">
                <Button className="w-full mt-6 bg-navy hover:bg-navy/90 text-white">Start Free Trial</Button>
              </Link>
            </div>
          </div>

          {/* Professional Plan */}
          <div className="bg-white rounded-lg shadow-xl overflow-hidden border border-purple transform scale-105 relative z-10">
            <div className="absolute top-0 right-0 bg-purple text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
              MOST POPULAR
            </div>
            <div className="p-6 border-b bg-gradient-to-r from-purple/10 to-purple/20">
              <h3 className="text-2xl font-bold mb-2 text-purple">Professional</h3>
              <div className="flex items-baseline mb-4">
                <span className="text-4xl font-bold text-purple">K499</span>
                <span className="text-slate-500 ml-2">/month</span>
              </div>
              <p className="text-slate-600">Ideal for growing pharmacies with multiple staff</p>
            </div>
            <div className="p-6 space-y-4">
              <ul className="space-y-3">
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Unlimited products</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>5 user accounts</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Advanced inventory management</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Insurance billing integration</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Advanced analytics & reporting</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Priority email support</span>
                </li>
              </ul>
              <Link href="/register?plan=professional">
                <Button className="w-full mt-6 bg-purple hover:bg-purple/90 text-white">Start Free Trial</Button>
              </Link>
            </div>
          </div>

          {/* Enterprise Plan */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden border border-slate-200 transition-all duration-300 hover:shadow-lg relative">
            <div className="p-6 border-b bg-gradient-to-r from-navy/5 to-navy/10">
              <h3 className="text-2xl font-bold mb-2 text-navy">Enterprise</h3>
              <div className="flex items-baseline mb-4">
                <span className="text-4xl font-bold text-navy">K999</span>
                <span className="text-slate-500 ml-2">/month</span>
              </div>
              <p className="text-slate-600">For pharmacy chains and hospital pharmacies</p>
            </div>
            <div className="p-6 space-y-4">
              <ul className="space-y-3">
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Everything in Professional</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Unlimited user accounts</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Multi-location management</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Custom integrations</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Dedicated account manager</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>24/7 phone & email support</span>
                </li>
              </ul>
              <Link href="/register?plan=enterprise">
                <Button className="w-full mt-6 bg-navy hover:bg-navy/90 text-white">Contact Sales</Button>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Additional pricing information */}
        <div className="mt-16 max-w-3xl mx-auto text-center">
          <h3 className="text-xl font-semibold mb-4 text-navy">Need a custom solution?</h3>
          <p className="text-slate-600 mb-4">
            We offer tailored solutions for unique pharmacy requirements. Contact our sales team to discuss your needs.
          </p>
          <Link href="/contact">
            <Button variant="outline" className="border-navy text-navy hover:bg-navy hover:text-white">
              Contact Sales Team
            </Button>
          </Link>
        </div>
        
        <div className="mt-8 flex flex-col md:flex-row items-center justify-center gap-2 md:gap-8 text-sm text-slate-500">
          <div className="flex items-center">
            <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
            No credit card required for trial
          </div>
          <div className="flex items-center">
            <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
            Cancel anytime
          </div>
          <div className="flex items-center">
            <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
            Free data migration assistance
          </div>
        </div>
      </div>
    </section>
  );
}
