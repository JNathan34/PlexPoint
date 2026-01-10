import { useState } from "react";
import { MessageCircle, X, Send, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

const faqs = [
  {
    question: "What is Plex?",
    answer: "Plex is a media server platform that allows you to stream movies, TV shows, and other media content across all your devices. It organizes content with beautiful artwork and metadata, making it easy to enjoy your entertainment anywhere, anytime."
  },
  {
    question: "How does Plex work?",
    answer: "Plex runs a media server that organizes your media files. You access this content through Plex apps on phones, tablets, smart TVs, and web browsers. The server transcodes content to ensure smooth playback on any device."
  },
  {
    question: "What devices can I use?",
    answer: "You can watch on smartphones (iOS/Android), tablets, computers (Windows/Mac), smart TVs (Samsung, LG, Sony), streaming devices (Roku, Apple TV, Chromecast, Fire TV), and gaming consoles (PlayStation, Xbox)."
  },
  {
    question: "How do I request content?",
    answer: "Use our Overseerr request system to search for any movie or TV show you'd like added. Just click 'Requests' in the menu to access it. Requests are processed based on your subscription tier."
  },
  {
    question: "What are the subscription tiers?",
    answer: "Each tier offers different benefits - more movie/TV requests per month, faster processing times, and priority treatment. Check the Membership section to see all tier options and prices."
  },
  {
    question: "How do I make payments?",
    answer: "We prefer direct bank transfers to avoid fees. Bank details: Name: Jacob Nathan, Account: 58925008, Sort Code: 09-01-28. Contact Jacob on WhatsApp (07481 861478) after payment."
  },
  {
    question: "Can I share my account?",
    answer: "No, account sharing is not allowed unless they live in the same household as you."
  },
  {
    question: "How do I get started?",
    answer: "1) Download the Plex app, 2) Create a free Plex account, 3) Send Jacob a friend request on Plex (not follow!), 4) Message him on WhatsApp, 5) Accept the server invitation email. Check the Tutorials section for detailed steps."
  },
  {
    question: "Why can't I see the server?",
    answer: "Make sure you sent Jacob a FRIEND REQUEST on Plex (not just followed him), then wait for the server invitation email. Check your spam folder too! If you still can't see it, message Jacob on WhatsApp."
  },
  {
    question: "What quality is the content?",
    answer: "We offer HD streaming for most content. The quality depends on your internet speed - Plex will automatically adjust to give you the best experience without buffering."
  },
  {
    question: "How long do requests take?",
    answer: "Request times vary by tier: Bronze gets 5 movies/shows per month, Silver gets 15 with faster processing, Gold gets 30 with priority, and Diamond gets unlimited with instant priority processing!"
  },
  {
    question: "Is there a free trial?",
    answer: "The Bronze tier at just £1/month is a great way to try the service. You get access to all content on the server and can make 5 requests per month."
  },
  {
    question: "What if content isn't available?",
    answer: "Simply submit a request through Overseerr (click 'Requests' in the menu) and we'll try to add it. Most popular movies and shows can be added quickly!"
  },
  {
    question: "How do I cancel my subscription?",
    answer: "Just message Jacob on WhatsApp (07481 861478) to cancel. There's no contract or commitment - you can stop anytime."
  },
  {
    question: "Still need help?",
    answer: "No worries! Contact Jacob directly on WhatsApp: 07481 861478. He's happy to help with any questions or issues you have!"
  }
];

interface Message {
  type: 'user' | 'bot';
  content: string;
}

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { type: 'bot', content: "Hi! I'm here to help answer your questions about Plex Point. Tap a question below or type your own!" }
  ]);
  const [showQuestions, setShowQuestions] = useState(true);

  const handleQuestionClick = (faq: typeof faqs[0]) => {
    setMessages(prev => [
      ...prev,
      { type: 'user', content: faq.question },
      { type: 'bot', content: faq.answer }
    ]);
    setShowQuestions(false);
    
    setTimeout(() => setShowQuestions(true), 500);
  };

  const resetChat = () => {
    setMessages([
      { type: 'bot', content: "Hi! I'm here to help answer your questions about Plex Point. Tap a question below!" }
    ]);
    setShowQuestions(true);
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-20 right-4 md:bottom-24 md:right-6 w-[calc(100%-2rem)] max-w-sm z-50"
          >
            <div className="glass-card rounded-2xl shadow-2xl border border-border/50 overflow-hidden">
              <div className="bg-gradient-to-r from-primary to-orange-400 p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-white" />
                  <span className="font-semibold text-white">Plex Point Help</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-white/80 hover:text-white hover:bg-white/20"
                    onClick={resetChat}
                  >
                    <Send className="h-4 w-4 rotate-180" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-white/80 hover:text-white hover:bg-white/20"
                    onClick={() => setIsOpen(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="h-80 overflow-y-auto p-4 space-y-3 bg-background/95">
                {messages.map((message, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                        message.type === 'user'
                          ? 'bg-primary text-white rounded-br-md'
                          : 'glass rounded-bl-md'
                      }`}
                    >
                      {message.content}
                    </div>
                  </motion.div>
                ))}
              </div>
              
              <div className="p-3 border-t border-border/50 bg-background/95 max-h-48 overflow-y-auto">
                <p className="text-xs text-muted-foreground mb-2">Quick questions:</p>
                <AnimatePresence>
                  {showQuestions && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="space-y-1.5"
                    >
                      {faqs.map((faq, index) => (
                        <motion.button
                          key={index}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.03 }}
                          onClick={() => handleQuestionClick(faq)}
                          className="w-full text-left px-3 py-2 rounded-xl text-xs glass hover:border-primary/50 hover:text-primary transition-all flex items-center justify-between group"
                        >
                          <span className="line-clamp-1">{faq.question}</span>
                          <ChevronRight className="h-3 w-3 text-muted-foreground group-hover:text-primary flex-shrink-0 ml-2" />
                        </motion.button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1, type: "spring", stiffness: 200 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-4 right-4 md:bottom-6 md:right-6 z-50 h-14 w-14 rounded-full shadow-lg flex items-center justify-center transition-all ${
          isOpen 
            ? 'bg-muted hover:bg-muted/80' 
            : 'bg-gradient-to-r from-primary to-orange-400 hover:shadow-primary/30 hover:shadow-xl'
        }`}
        data-testid="chatbot-button"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
            >
              <X className="h-6 w-6" />
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
            >
              <MessageCircle className="h-6 w-6 text-white" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </>
  );
}
