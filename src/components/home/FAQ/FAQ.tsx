"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/shared/ui/Accordion/Accordion";
import { FAQProps } from "@/types/components";

export const FAQ = ({ faqs }: FAQProps) => {
  if (!faqs || !Array.isArray(faqs) || faqs.length === 0) return null;

  return (
    <section className="bg-[#f8faff] py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8 px-4">
          <h2 className="text-[26px] md:text-[32px] font-bold text-[#111827] tracking-tight mb-2">
            Frequently Asked Questions
          </h2>
          <p className="text-[15px] md:text-[16px] text-slate-500 font-medium">
            Find answers to common questions from our community
          </p>
        </div>

        <Accordion type="single" collapsible className="w-full space-y-2">
          {faqs.map((faq, i) => (
            <AccordionItem 
              key={i} 
              value={`item-${i}`}
              className="group rounded-lg border border-slate-300 bg-white px-4 md:px-5 overflow-hidden transition-all duration-300 shadow-xs"
            >
              <AccordionTrigger className="text-left py-3 text-[15px] md:text-[16px] font-semibold text-[#111827] hover:no-underline transition-all gap-4">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="pb-4 text-[14px] text-slate-500 font-medium leading-relaxed">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

export default FAQ;
