import { getFAQs } from "@/hooks/useHomepage";
import Breadcrumb from "@/shared/ui/Breadcrumb/Breadcrumb";
import FAQClient from "./FAQClient";
import { JsonLd } from '@/components/seo/JsonLd';
import { generateFAQSchema, generateSeoMetadata } from '@/lib/seo';

export const metadata = generateSeoMetadata({
  path: '/faqs',
  pageFallback: {
    title: 'Frequently Asked Questions | TeachNow',
    description: 'Find answers to common questions about TeachNow, including how to find jobs and manage your profile.'
  }
});

// Incremental Static Regeneration (ISR): Cache for 1/2 hour, refresh in background
// export const revalidate = 900;

interface FAQItem {
  id: number;
  question: string;
  answer: string;
}

export default async function FAQPage() {
  const faqs = (await getFAQs()) as FAQItem[];
  const breadcrumbItems = [{ label: "FAQs", isCurrent: true }];

  return (
    <div className="bg-[#F8FAFC] min-h-screen">
      <JsonLd 
        schema={generateFAQSchema(faqs.map(faq => ({
          question: faq.question,
          answer: faq.answer
        })))} 
      />
      {/* Consistent Breadcrumb Bar */}
      <div className="border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-16 z-40">
        <div className="mx-auto max-w-7xl px-4 py-1.5 sm:px-6 lg:px-8">
          <Breadcrumb items={breadcrumbItems} />
        </div>
      </div>

      {/* Very Compact Header Section */}
      <section className="bg-white border-b border-slate-100 py-10 text-center">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">
              Frequently Asked Questions
            </h1>
            <p className="mt-3 text-sm sm:text-base text-slate-500 font-medium">
              Find answers to common questions about TeachNow
            </p>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          {/* 1. Progressive Fallback: Render static cards (visible to No-JS users and SEO crawlers by default) */}
          <div id="faq-static-list" className="space-y-3">
            {faqs.map((faq, i) => (
              <div 
                key={faq.id || i} 
                className="rounded-xl border border-slate-200 bg-white px-5 sm:px-6 py-5 shadow-sm"
              >
                <h3 className="text-[15px] sm:text-base font-bold text-slate-900 mb-3">
                  {faq.question}
                </h3>
                <div 
                  className="rich-text text-sm leading-relaxed max-w-none text-slate-600 border-t border-slate-100 pt-3"
                  dangerouslySetInnerHTML={{ __html: faq.answer }}
                />
              </div>
            ))}
            {faqs.length === 0 && (
              <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-200">
                <p className="text-slate-400 text-sm font-medium">No FAQs available at the moment.</p>
              </div>
            )}
          </div>

          {/* 2. Interactive Enhancer: Renders animated accordion and hides static list when JS hydrates */}
          <FAQClient faqs={faqs} />
        </div>
      </div>
    </div>
  );
}
