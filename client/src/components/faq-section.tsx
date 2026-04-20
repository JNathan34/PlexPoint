import { HelpCircle } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { motion } from "framer-motion";

const faqs = [
  {
    question: "What is Plex?",
    answer: "Plex is a media server platform that allows you to stream your movies, TV shows, music, and other media content across all your devices. It organizes your content with beautiful artwork and metadata, making it easy to find and enjoy your entertainment library anywhere, anytime."
  },
  {
    question: "How does Plex work?",
    answer: "Plex works by running a media server on a computer that scans and organizes your media files. You can then access this content through Plex apps on various devices like phones, tablets, smart TVs, and web browsers. The server transcodes content on-the-fly to ensure smooth playback on any device."
  },
  {
    question: "What devices can I use to watch content?",
    answer: "You can watch on virtually any device including smartphones (iOS/Android), tablets, computers (Windows/Mac/Linux), smart TVs (Samsung, LG, Sony, etc.), streaming devices (Roku, Apple TV, Chromecast, Fire TV), and gaming consoles (PlayStation, Xbox)."
  },
  {
    question: "How do I request new content?",
    answer: "Simply use our integrated request system to search for and request any movie or TV show you'd like to see added to the library. Requests are processed based on your subscription tier, with higher tiers receiving faster processing times."
  },
  {
    question: "What's the difference between subscription tiers?",
    answer: "Each tier offers different benefits including the number of movie and TV show requests you can make per month, processing time for requests, and access levels. Higher tiers get more requests, faster processing, and priority treatment."
  },
  {
    question: "How do I make payments?",
    answer: "We prefer direct bank transfers to avoid third-party fees. Contact Jacob Nathan at 07481 861478 or jacobnathan1718@gmail.com for payment details. Bank transfer information: Name: Jacob Nathan, Account: 58925008, Sort Code: 09-01-28."
  },
  {
    question: "Can I share my account?",
    answer: "No, you are not allowed to share your account unless they live in the same household."
  },
  {
    question: "Is there a free trial?",
    answer: "The Bronze Tier provides basic access to all available content on Plex for just £2.50/month. This is a great way to test the service before upgrading to a higher tier with more features and request capabilities."
  }
];

export default function FaqSection() {
  return (
    <section id="faq" className="py-10 md:py-24 section-gradient relative overflow-hidden" data-testid="faq-section">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-0 left-1/4 w-[300px] md:w-[600px] h-[300px] md:h-[600px] rounded-full bg-gradient-to-r from-primary/5 to-transparent blur-3xl" />
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 md:mb-16"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-full glass text-xs md:text-sm font-medium mb-4 md:mb-6"
          >
            <HelpCircle className="h-3 w-3 md:h-4 md:w-4 text-primary" />
            <span>Got Questions?</span>
          </motion.div>
          
          <h2 className="text-3xl md:text-4xl lg:text-6xl font-bold mb-4 md:mb-6">
            Frequently Asked <span className="text-gradient">Questions</span>
          </h2>
          <p className="text-base md:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
            Everything you need to know about Plex and our service
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-3xl mx-auto"
        >
          <Accordion type="single" collapsible className="space-y-2 md:space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="glass-card rounded-xl md:rounded-2xl border-none px-4 md:px-6 data-[state=open]:ring-1 data-[state=open]:ring-primary/30 transition-all"
                data-testid={`faq-${index}`}
              >
                <AccordionTrigger className="text-left py-4 md:py-5 hover:no-underline group min-h-[48px]" data-testid={`faq-question-${index}`}>
                  <span className="font-semibold text-sm md:text-lg group-hover:text-primary transition-colors pr-4">
                    {faq.question}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="pb-4 md:pb-5" data-testid={`faq-answer-${index}`}>
                  <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
                    {faq.answer}
                  </p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}
