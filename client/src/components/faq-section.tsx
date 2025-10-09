import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

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
    answer: "The Bronze Tier provides basic access to all available content on Plex for just £1/month. This is a great way to test the service before upgrading to a higher tier with more features and request capabilities."
  }
];

export default function FaqSection() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <section id="faq" className="py-20 bg-secondary" data-testid="faq-section">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold mb-4">Frequently Asked Questions</h2>
          <p className="text-xl text-muted-foreground">Everything you need to know about Plex and our service</p>
        </div>

        <div className="max-w-4xl mx-auto space-y-4">
          {faqs.map((faq, index) => (
            <Card key={index} className="bg-card border border-border" data-testid={`faq-${index}`}>
              <CardContent className="p-0">
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full p-6 text-left flex items-center justify-between hover:bg-muted/50 transition-colors"
                  data-testid={`faq-question-${index}`}
                >
                  <h3 className="text-lg font-semibold pr-4">{faq.question}</h3>
                  {openFaq === index ? (
                    <ChevronUp className="h-5 w-5 text-primary flex-shrink-0" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  )}
                </button>
                {openFaq === index && (
                  <div className="px-6 pb-6" data-testid={`faq-answer-${index}`}>
                    <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}