import React, { useState } from 'react';

const faqData = [
  {
    question: 'How does the free trial work?',
    answer: 'You can try all features free for 14 days with no credit card required. Cancel anytime during the trial period.'
  },
  {
    question: 'Can I upgrade or downgrade my plan later?',
    answer: 'Yes, you can change your subscription plan at any time from your account settings.'
  },
  {
    question: 'Is my data secure?',
    answer: 'We use industry-standard encryption and security practices to protect your data.'
  },
  {
    question: 'Do you offer customer support?',
    answer: 'Yes, we offer 24/7 email and phone support for all paid plans.'
  }
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleIndex = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-20 bg-white">
      <div className="container mx-auto px-4 max-w-3xl">
        <h2 className="text-3xl font-bold mb-8 text-navy text-center">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqData.map((item, index) => (
            <div key={index} className="border border-slate-200 rounded-lg">
              <button
                onClick={() => toggleIndex(index)}
                className="w-full flex justify-between items-center px-6 py-4 text-left text-navy font-semibold focus:outline-none"
                aria-expanded={openIndex === index}
                aria-controls={`faq-panel-${index}`}
                id={`faq-header-${index}`}
              >
                {item.question}
                <svg
                  className={`w-5 h-5 transition-transform duration-300 ${openIndex === index ? 'rotate-180' : 'rotate-0'}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div
                id={`faq-panel-${index}`}
                role="region"
                aria-labelledby={`faq-header-${index}`}
                className={`px-6 pb-4 text-slate-600 transition-max-height duration-300 overflow-hidden ${openIndex === index ? 'max-h-96' : 'max-h-0'}`}
              >
                <p>{item.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
