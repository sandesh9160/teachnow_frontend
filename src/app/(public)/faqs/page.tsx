"use client";

import { useEffect, useState } from "react";
import { getFAQs } from "@/hooks/useHomepage";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/shared/ui/Accordion/Accordion";
import Breadcrumb from "@/shared/ui/Breadcrumb/Breadcrumb";

interface FAQItem {
  id: number;
  question: string;
  answer: string;
}

export default function FAQPage() {
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        const data = await getFAQs();
        setFaqs(data || []);
      } catch (err) {
        //console.error("Failed to load FAQs:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFaqs();
  }, []);

  const breadcrumbItems = [{ label: "FAQs", isCurrent: true }];

  return (
    <div className="bg-[#F8FAFC] min-h-screen">
      {/* Consistent Breadcrumb Bar */}
      <div className="border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-16 z-40">
        <div className="w-full px-4 py-2 sm:px-6 lg:px-12">
          <Breadcrumb items={breadcrumbItems} />
        </div>
      </div>

      {/* Very Compact Header Section */}
      <section className="bg-white border-b border-slate-100 py-10 text-center">
        <div className="w-full px-4 sm:px-6 lg:px-12">
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

      <div className="w-full px-4 py-8 sm:px-6 lg:px-12">
        <div className="max-w-3xl mx-auto">
          {loading && (
            <div className="space-y-3 animate-pulse">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={`skeleton-${i}`} className="h-14 bg-white rounded-xl border border-slate-100" />
              ))}
            </div>
          )}

          {!loading && faqs.length > 0 && (
            <Accordion type="single" collapsible className="space-y-3">
              {faqs.map((faq, i) => (
                <AccordionItem 
                  key={faq.id || i} 
                  value={`faq-${i}`} 
                  className="rounded-xl border border-slate-200 bg-white px-5 sm:px-6 overflow-hidden shadow-sm transition-all duration-300 hover:border-slate-300"
                >
                  <AccordionTrigger className="text-[15px] sm:text-base font-medium text-slate-900 hover:text-slate-900 py-5 text-left no-underline [&[data-state=open]>svg]:rotate-180 transition-all group-hover:no-underline">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="pb-5">
                    <div 
                      className="text-slate-500 text-sm leading-relaxed prose prose-slate max-w-none"
                      dangerouslySetInnerHTML={{ __html: faq.answer }}
                    />
                  </AccordionContent>

                </AccordionItem>
              ))}
            </Accordion>
          )}

          {!loading && faqs.length === 0 && (
            <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-200">
              <p className="text-slate-400 text-sm font-medium">No FAQs available at the moment.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
