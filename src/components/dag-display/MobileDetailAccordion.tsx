"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

export type MobileAccordionSection = {
  value: string;
  title: string;
  content: React.ReactNode;
};

export function MobileDetailAccordion({
  sections,
  defaultValue = ["edges", "nodes"],
  className,
}: {
  sections: MobileAccordionSection[];
  defaultValue?: string[];
  className?: string;
}) {
  if (sections.length === 0) return null;

  return (
    <Accordion
      type="multiple"
      defaultValue={defaultValue}
      className={cn("w-full", className)}
    >
      {sections.map((section) => (
        <AccordionItem
          key={section.value}
          value={section.value}
          className="border-b border-border last:border-b-0"
        >
          <AccordionTrigger className="rounded-none px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:no-underline">
            {section.title}
          </AccordionTrigger>
          <AccordionContent className="pb-0">{section.content}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
