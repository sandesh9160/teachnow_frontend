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
        <Accordion type="single" collapsible className="w-full space-y-4">
          {faqs.map((faq, i) => (
            <AccordionItem 
              key={i} 
              value={`item-${i}`}
              className="rounded-xl border border-border bg-card shadow-sm px-4 sm:px-6 overflow-hidden transition-all duration-300 hover:border-primary/20 data-[state=open]:border-primary/30 data-[state=open]:shadow-md"
            >
              <AccordionTrigger className="text-left font-display text-base font-semibold py-5 hover:no-underline [&[data-state=open]>svg]:text-primary">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-sm sm:text-base leading-relaxed pb-6">
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
