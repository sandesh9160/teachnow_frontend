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
      <div className="border-b border-border bg-white/80 backdrop-blur-md sticky top-16 z-40">
        <div className="mx-auto max-w-7xl px-4 py-2 sm:px-6 lg:px-8">
          <Breadcrumb items={breadcrumbItems} />
        </div>
      </div>

      <section className="bg-white border-b border-slate-100 py-16 md:py-20 text-center">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold text-slate-900 md:text-5xl lg:text-6xl tracking-tight leading-tight">
              Frequently Asked <span className="text-primary italic">Questions</span>
            </h1>
            <p className="mt-6 text-lg text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed">
              Everything you need to know about the platform. Can't find the answer you're looking for? Reach out to our support team.
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16 max-w-3xl">
        {loading && (
          <div className="space-y-4 animate-pulse">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={`skeleton-${i}`} className="h-16 bg-white rounded-2xl border border-gray-100" />
            ))}
          </div>
        )}

        {!loading && faqs.length > 0 && (
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, i) => (
              <AccordionItem 
                key={faq.id || i} 
                value={`faq-${i}`} 
                className="group relative rounded-xl border-2 border-blue-500 bg-white px-6 overflow-hidden shadow-none transition-all duration-300"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50/50 rounded-full -mr-12 -mt-12 animate-pulse pointer-events-none" />
                
                <AccordionTrigger className="relative z-10 text-base font-bold text-slate-900 hover:text-blue-600 py-6 text-left no-underline [&[data-state=open]>svg]:text-blue-600">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="relative z-10 px-6 pb-6">
                  <div className="pl-6 border-l-2 border-blue-100 text-slate-600 text-sm sm:text-[15px] font-medium leading-relaxed">
                    {faq.answer}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}

        {!loading && faqs.length === 0 && (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
            <p className="text-muted-foreground">No FAQs available at the moment. Please check back later.</p>
          </div>
        )}
      </div>
    </div>
  );
}
