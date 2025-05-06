import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from './ui/button';
import { CheckCircle2 } from 'lucide-react';

export function Hero() {
  return (
    <section className="bg-white relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full bg-grid-pattern opacity-5 pointer-events-none"></div>
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-purple/10 rounded-full blur-3xl animate-pulse-slow"></div>
      <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-navy/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-400/5 rounded-full blur-2xl animate-float-slow"></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:w-2/5 mb-12 md:mb-0">
            <div className="space-y-6 animate-fade-in-up">
              <div className="flex items-center space-x-2">
                <span className="bg-purple/10 text-purple px-4 py-2 rounded-full text-sm font-medium inline-block transform transition-transform hover:scale-105">
                  #1 Pharmacy Management Software
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></span>
                  New Features
                </span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-navy leading-tight">
                Complete <span className="text-purple relative">
                  Pharmacy
                  <svg className="absolute bottom-0 left-0 w-full h-2 text-purple/20" viewBox="0 0 200 8" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0 4C40 0 60 8 200 4" stroke="currentColor" strokeWidth="4" fill="none" strokeLinecap="round" />
                  </svg>
                </span> Management Solution
              </h1>

              <p className="text-xl text-slate-600 leading-relaxed max-w-xl">
                Streamline your pharmacy operations, manage inventory, process prescriptions, 
                and boost sales with our all-in-one pharmacy management system.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <Link href="/register">
                  <Button size="lg" className="w-full sm:w-auto bg-purple hover:bg-purple/90 text-white shadow-lg shadow-purple/20 transition-all duration-300 hover:translate-y-[-2px]">
                    <span>Start Free Trial</span>
                    <svg className="w-5 h-5 ml-2 animate-bounce-x" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Button>
                </Link>
                <Link href="#demo">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto border-navy text-navy hover:bg-navy hover:text-white transition-all duration-300 group">
                    <svg className="w-5 h-5 mr-2 group-hover:animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Watch Demo</span>
                  </Button>
                </Link>
              </div>

              <div className="pt-6 space-y-4">
                <div className="flex items-center text-sm text-slate-500 bg-white/50 backdrop-blur-sm px-4 py-2 rounded-lg shadow-sm border border-slate-100 hover:shadow-md transition-all duration-300">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                  <span>No credit card required for free tier</span>
                </div>

                <div className="flex items-center justify-between bg-white/50 backdrop-blur-sm px-4 py-3 rounded-lg shadow-sm border border-slate-100 hover:shadow-md transition-all duration-300">
                  <div className="flex -space-x-2">
                    {[
                      { initials: 'JD', bg: 'bg-blue-500' },
                      { initials: 'MR', bg: 'bg-green-500' },
                      { initials: 'KL', bg: 'bg-amber-500' },
                      { initials: '+', bg: 'bg-purple' }
                    ].map((user, index) => (
                      <div 
                        key={index}
                        className={`w-8 h-8 rounded-full ${user.bg} flex items-center justify-center text-white text-xs font-bold border-2 border-white transform transition-transform hover:scale-110 hover:z-10`}
                        style={{ transitionDelay: `${index * 50}ms` }}
                      >
                        {user.initials}
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm text-slate-500">Trusted by 1,000+ pharmacies</span>
                    <div className="ml-2 flex items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg key={star} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="md:w-3/5 relative md:-right-8 lg:-right-12 xl:-right-16 perspective-1000">
            <div className="absolute -z-10 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-r from-purple/20 via-transparent to-navy/20 rounded-full blur-3xl opacity-30 animate-rotate-slow"></div>
            <div className="relative bg-white p-3 rounded-2xl shadow-xl border border-slate-100 rotate-1 transition-all duration-500 hover:rotate-0 hover:scale-[1.02] w-full group">
              <div className="absolute inset-0 bg-grid-pattern opacity-5 rounded-2xl"></div>
              <div className="relative overflow-hidden rounded-xl">
                <Image 
                  src="/images/pharmacist.jpeg" 
                  alt="ZiindiPro Dashboard" 
                  width={900} 
                  height={600} 
                  className="rounded-xl transition-transform duration-700 group-hover:scale-105 w-full h-auto"
                  priority
                  quality={95}
                />
                <div className="absolute top-0 left-0 right-0 h-7 bg-slate-100/80 backdrop-blur-sm rounded-t-xl flex items-center px-3 z-20">
                  <div className="flex space-x-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-400 group-hover:animate-pulse"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-400 group-hover:animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-green-400 group-hover:animate-pulse" style={{ animationDelay: '1s' }}></div>
                  </div>
                  <div className="mx-auto bg-white/70 rounded-full text-[10px] px-3 py-0.5 text-slate-500 flex items-center">
                    dashboard.ziindipro.com
                  </div>
                </div>
                <div className="absolute bottom-4 left-4 right-4 bg-white/80 backdrop-blur-md rounded-lg p-3 shadow-lg transform translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 z-20 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-purple rounded-full flex items-center justify-center text-white">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div className="text-xs">
                      <p className="font-medium text-navy">Dr. Sarah Johnson</p>
                      <p className="text-slate-500">Pharmacy Manager</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                    <div className="w-6 h-6 bg-purple/10 rounded-full flex items-center justify-center text-purple">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-1 -right-1 w-16 h-16 bg-gradient-to-br from-purple via-blue-400 to-navy animate-spin-slow opacity-70 blur-md rounded-br-2xl"></div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-white animate-bounce-subtle">
                3
              </div>
            </div>
            
            {/* Floating elements */}
            <div className="hidden md:flex absolute top-1/4 left-0 transform -translate-x-1/2 bg-white rounded-xl shadow-lg py-2 px-3 items-center space-x-2 border border-slate-100 transition-all duration-300 hover:shadow-xl hover:translate-x-1 animate-fade-in" style={{ animationDelay: '1.2s' }}>
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center text-red-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <p className="text-[10px] text-slate-500">Low stock alert</p>
                <p className="font-bold text-sm text-red-600">5 items</p>
              </div>
            </div>
            <div className="hidden md:flex absolute bottom-1/4 right-0 transform translate-x-1/3 bg-white rounded-xl shadow-lg py-2 px-3 items-center space-x-2 border border-slate-100 transition-all duration-300 hover:shadow-xl hover:-translate-x-1 animate-fade-in" style={{ animationDelay: '1.5s' }}>
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-[10px] text-slate-500">Today's revenue</p>
                <p className="font-bold text-sm text-blue-600">K1,250</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}