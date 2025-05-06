import React from 'react';

export function Testimonials() {
  return (
    <section id="testimonials" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4 text-navy">What Our Customers Say</h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Trusted by pharmacies across the country.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Testimonial 1 */}
          <div className="bg-slate-50 p-8 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-slate-100">
            <p className="text-slate-700 mb-6">
              "ZiindiPro has transformed how we manage our pharmacy. The inventory alerts and sales analytics are game changers."
            </p>
            <div className="flex items-center space-x-4">
              <img src="/images/testimonial1.jpg" alt="Customer 1" className="w-12 h-12 rounded-full object-cover" />
              <div>
                <p className="font-semibold text-navy">Dr. Sarah Johnson</p>
                <p className="text-sm text-slate-500">Pharmacy Manager</p>
              </div>
            </div>
          </div>

          {/* Testimonial 2 */}
          <div className="bg-slate-50 p-8 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-slate-100">
            <p className="text-slate-700 mb-6">
              "The prescription management features have saved us countless hours. Highly recommend ZiindiPro!"
            </p>
            <div className="flex items-center space-x-4">
              <img src="/images/testimonial2.jpg" alt="Customer 2" className="w-12 h-12 rounded-full object-cover" />
              <div>
                <p className="font-semibold text-navy">Michael Roberts</p>
                <p className="text-sm text-slate-500">Pharmacist</p>
              </div>
            </div>
          </div>

          {/* Testimonial 3 */}
          <div className="bg-slate-50 p-8 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-slate-100">
            <p className="text-slate-700 mb-6">
              "Excellent customer support and a robust platform. ZiindiPro is essential for our daily operations."
            </p>
            <div className="flex items-center space-x-4">
              <img src="/images/testimonial3.jpg" alt="Customer 3" className="w-12 h-12 rounded-full object-cover" />
              <div>
                <p className="font-semibold text-navy">Linda Kim</p>
                <p className="text-sm text-slate-500">Pharmacy Owner</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
