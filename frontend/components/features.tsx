import React from 'react';
import { CheckCircle2 } from 'lucide-react';

export function Features() {
  return (
    <section id="features" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <span className="bg-purple/10 text-purple px-4 py-2 rounded-full text-sm font-medium mb-4 inline-block">Features</span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-navy">Powerful Features for Modern Pharmacies</h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Everything you need to run your pharmacy efficiently, all in one platform.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-slate-100 group">
            <div className="w-14 h-14 bg-navy/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-navy group-hover:text-white transition-all duration-300">
              <svg className="w-7 h-7 text-navy group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-3 text-navy group-hover:text-purple transition-colors">Inventory Management</h3>
            <p className="text-slate-600">
              Track stock levels, manage batches, and get alerts for low inventory and expiring products.
            </p>
            <ul className="mt-4 space-y-2">
              <li className="flex items-start text-sm text-slate-500">
                <CheckCircle2 className="h-4 w-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                <span>Automated reorder points</span>
              </li>
              <li className="flex items-start text-sm text-slate-500">
                <CheckCircle2 className="h-4 w-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                <span>Batch and expiry tracking</span>
              </li>
            </ul>
          </div>

          {/* Feature 2 */}
          <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-slate-100 group">
            <div className="w-14 h-14 bg-purple/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-purple group-hover:text-white transition-all duration-300">
              <svg className="w-7 h-7 text-purple group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-3 group-hover:text-purple transition-colors">Prescription Management</h3>
            <p className="text-slate-600">
              Process prescriptions efficiently, track fulfillment status, and maintain patient history.
            </p>
            <ul className="mt-4 space-y-2">
              <li className="flex items-start text-sm text-slate-500">
                <CheckCircle2 className="h-4 w-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                <span>Electronic prescription handling</span>
              </li>
              <li className="flex items-start text-sm text-slate-500">
                <CheckCircle2 className="h-4 w-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                <span>Refill reminders</span>
              </li>
            </ul>
          </div>

          {/* Feature 3 */}
          <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-slate-100 group">
            <div className="w-14 h-14 bg-green-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-green-500 group-hover:text-white transition-all duration-300">
              <svg className="w-7 h-7 text-green-500 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-3 group-hover:text-green-500 transition-colors">Sales & Billing</h3>
            <p className="text-slate-600">
              Process sales quickly, handle multiple payment methods, and generate detailed receipts.
            </p>
            <ul className="mt-4 space-y-2">
              <li className="flex items-start text-sm text-slate-500">
                <CheckCircle2 className="h-4 w-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                <span>Multiple payment options</span>
              </li>
              <li className="flex items-start text-sm text-slate-500">
                <CheckCircle2 className="h-4 w-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                <span>Discount management</span>
              </li>
            </ul>
          </div>

          {/* Feature 4 */}
          <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-slate-100 group">
            <div className="w-14 h-14 bg-blue-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-500 group-hover:text-white transition-all duration-300">
              <svg className="w-7 h-7 text-blue-500 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-3 group-hover:text-blue-500 transition-colors">Patient Management</h3>
            <p className="text-slate-600">
              Maintain patient profiles, medical history, and insurance information for better service.
            </p>
            <ul className="mt-4 space-y-2">
              <li className="flex items-start text-sm text-slate-500">
                <CheckCircle2 className="h-4 w-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                <span>Patient medication history</span>
              </li>
              <li className="flex items-start text-sm text-slate-500">
                <CheckCircle2 className="h-4 w-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                <span>Insurance information storage</span>
              </li>
            </ul>
          </div>

          {/* Feature 5 */}
          <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-slate-100 group">
            <div className="w-14 h-14 bg-amber-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-amber-500 group-hover:text-white transition-all duration-300">
              <svg className="w-7 h-7 text-amber-500 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-3 group-hover:text-amber-500 transition-colors">Reports & Analytics</h3>
            <p className="text-slate-600">
              Generate comprehensive reports on sales, inventory, prescriptions, and financial performance.
            </p>
            <ul className="mt-4 space-y-2">
              <li className="flex items-start text-sm text-slate-500">
                <CheckCircle2 className="h-4 w-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                <span>Customizable dashboards</span>
              </li>
              <li className="flex items-start text-sm text-slate-500">
                <CheckCircle2 className="h-4 w-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                <span>Export to multiple formats</span>
              </li>
            </ul>
          </div>

          {/* Feature 6 */}
          <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-slate-100 group">
            <div className="w-14 h-14 bg-red-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-red-500 group-hover:text-white transition-all duration-300">
              <svg className="w-7 h-7 text-red-500 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-3 group-hover:text-red-500 transition-colors">Security & Compliance</h3>
            <p className="text-slate-600">
              Keep your pharmacy data secure and maintain compliance with healthcare regulations.
            </p>
            <ul className="mt-4 space-y-2">
              <li className="flex items-start text-sm text-slate-500">
                <CheckCircle2 className="h-4 w-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                <span>Role-based access control</span>
              </li>
              <li className="flex items-start text-sm text-slate-500">
                <CheckCircle2 className="h-4 w-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                <span>Audit trail & logging</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
    );
}
