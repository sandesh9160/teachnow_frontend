"use client";

import { useState, useEffect } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/shared/ui/Accordion/Accordion";

interface FAQItem {
  id: number;
  question: string;
  answer: string;
}

export default function FAQClient({ faqs }: { faqs: FAQItem[] }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || faqs.length === 0) {
    return null;
  }

  return (
    <div id="faq-js-wrapper">
      {/* Hide the static list dynamically when JS mounts the accordion */}
      <style dangerouslySetInnerHTML={{ __html: `
        #faq-static-list { display: none !important; }
      `}} />
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
                className="rich-text text-sm leading-relaxed max-w-none"
                dangerouslySetInnerHTML={{ __html: faq.answer }}
              />
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
