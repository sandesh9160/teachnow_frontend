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
    <section className="bg-slate-50/50 py-12 md:py-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="text-left mb-10 pl-2">
          <h2 className="text-3xl font-bold text-slate-900 md:text-4xl">
            Frequently Asked <span className="text-primary/80">Questions</span>
          </h2>
          <p className="mt-2 text-lg text-slate-500 font-medium tracking-wide">
            Find answers to common questions about TeachNow
          </p>
        </div>
        <Accordion type="single" collapsible className="w-full space-y-3">
          {faqs.map((faq, i) => (
            <AccordionItem 
              key={i} 
              value={`item-${i}`}
              className="group relative rounded-2xl border border-slate-200 bg-white px-6 overflow-hidden shadow-sm transition-all duration-300 hover:border-primary/20"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50/50 rounded-full -mr-12 -mt-12 pointer-events-none" />
              
              <AccordionTrigger className="relative z-10 text-left font-display text-[15px] font-bold py-5 hover:no-underline [&[data-state=open]>svg]:text-primary text-slate-900">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="relative z-10 px-0 pb-5">
                <div className="pl-5 border-l-2 border-primary/20 text-slate-500 text-sm sm:text-[14px] font-medium leading-relaxed">
                  {faq.answer}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

export default FAQ;
