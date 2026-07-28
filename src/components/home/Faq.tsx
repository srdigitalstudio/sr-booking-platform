import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import { Section } from "@/components/ui/section";
import { SectionHeader } from "@/components/common/SectionHeader";

const faqs = [
  {
    question: "Who is SR Booking Platform for?",
    answer:
      "It's designed for salons, clinics, fitness studios, spas, consultants, and any business that accepts appointments.",
  },
  {
    question: "Can customers book online?",
    answer:
      "Yes. Customers can book appointments 24/7 from any device without calling your business.",
  },
  {
    question: "Does it send reminders?",
    answer:
      "Yes. Automatic reminders help reduce no-shows and keep your schedule organized.",
  },
  {
    question: "Can I manage multiple staff members?",
    answer:
      "Absolutely. You can create multiple staff accounts and manage their schedules independently.",
  },
];
export function Faq() {
  return (
    <Section id="faq">
      <SectionHeader
  badge="FAQ"
  title="Frequently Asked Questions"
  description="Everything you need to know about SR Booking Platform."
/>

      <div className="mx-auto mt-12 max-w-3xl">
        <Accordion className="w-full">
          {faqs.map((faq, index) => (
           <AccordionItem
  key={index}
>
            
              <AccordionTrigger>
                {faq.question}
              </AccordionTrigger>

              <AccordionContent>
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </Section>
  );
}