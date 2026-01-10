import { Play, Coffee, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FaDiscord, FaTelegram, FaReddit } from "react-icons/fa";
import { motion } from "framer-motion";
import { scrollToSection } from "@/lib/constants";

const quickLinks = [
  { name: "Home", href: "home" },
  { name: "Membership", href: "membership" },
  { name: "Requests", href: "requests" },
  { name: "Tutorials", href: "tutorials" },
  { name: "FAQ", href: "faq" },
];

const supportLinks = [
  { name: "Tutorials", href: "tutorials" },
  { name: "FAQ", href: "faq" },
];

const legalLinks = [
  { name: "Privacy Policy", href: "" },
  { name: "Terms of Service", href: "" },
];

const socialLinks = [
  { name: "Discord", href: "", icon: FaDiscord },
  { name: "Telegram", href: "", icon: FaTelegram },
  { name: "Reddit", href: "", icon: FaReddit },
];

export default function Footer() {
  const handleContactClick = () => {
    window.open('mailto:jacobnathan1718@gmail.com', '_blank');
  };

  const handleLinkClick = (href: string) => {
    if (href) {
      scrollToSection(href);
    }
  };

  return (
    <footer className="relative pt-12 md:pt-20 pb-6 md:pb-8 overflow-hidden" data-testid="footer">
      <div className="absolute inset-0 bg-gradient-to-b from-background to-secondary/30" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 mb-10 md:mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="col-span-2 md:col-span-2 lg:col-span-1"
          >
            <div className="flex items-center space-x-2 mb-4 md:mb-6">
              <div className="h-9 w-9 md:h-10 md:w-10 rounded-xl bg-gradient-to-br from-primary to-orange-400 flex items-center justify-center">
                <Play className="h-4 w-4 md:h-5 md:w-5 text-white" />
              </div>
              <span className="text-lg md:text-xl font-bold">PlexServer</span>
            </div>
            <p className="text-muted-foreground mb-4 md:mb-6 leading-relaxed text-sm md:text-base">
              Your personal media paradise with 800+ movies and 100+ TV shows. Stream anytime, anywhere.
            </p>
            <a 
              href="https://ko-fi.com/jnathan34" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="inline-flex items-center gap-2 text-primary hover:text-primary/80 active:text-primary/60 transition-colors text-xs md:text-sm font-medium"
            >
              <Coffee className="h-3 w-3 md:h-4 md:w-4" />
              Support on Ko-fi
              <ExternalLink className="h-2.5 w-2.5 md:h-3 md:w-3" />
            </a>
            
            <div className="flex gap-2 mt-4 md:mt-6">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <motion.a
                    key={social.name}
                    href="#"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="h-9 w-9 md:h-10 md:w-10 rounded-lg md:rounded-xl glass flex items-center justify-center text-muted-foreground hover:text-primary active:bg-primary/20 hover:border-primary/30 transition-all"
                    data-testid={`social-link-${social.name.toLowerCase()}`}
                    aria-label={social.name}
                  >
                    <Icon className="h-4 w-4 md:h-5 md:w-5" />
                  </motion.a>
                );
              })}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <h5 className="font-bold mb-4 md:mb-6 text-base md:text-lg">Quick Links</h5>
            <ul className="space-y-2 md:space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <button
                    onClick={() => handleLinkClick(link.href)}
                    className="text-muted-foreground hover:text-primary active:text-primary/70 transition-colors text-left text-xs md:text-sm min-h-[32px] flex items-center"
                    data-testid={`quick-link-${link.name.toLowerCase().replace(' ', '-')}`}
                  >
                    {link.name}
                  </button>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <h5 className="font-bold mb-4 md:mb-6 text-base md:text-lg">Support</h5>
            <ul className="space-y-2 md:space-y-3">
              {supportLinks.map((link) => (
                <li key={link.name}>
                  <button
                    onClick={() => handleLinkClick(link.href)}
                    className="text-muted-foreground hover:text-primary active:text-primary/70 transition-colors text-left text-xs md:text-sm min-h-[32px] flex items-center"
                    data-testid={`support-link-${link.name.toLowerCase().replace(' ', '-')}`}
                  >
                    {link.name}
                  </button>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="col-span-2 sm:col-span-1"
          >
            <h5 className="font-bold mb-4 md:mb-6 text-base md:text-lg">Contact & Payment</h5>
            <p className="text-muted-foreground mb-4 md:mb-6 text-xs md:text-sm leading-relaxed">
              Get in touch for subscriptions or support. We prefer direct bank transfers to avoid fees.
            </p>
            <Button 
              className="btn-primary-gradient min-h-[44px] text-xs md:text-sm"
              onClick={handleContactClick}
              data-testid="footer-contact-button"
            >
              <Coffee className="mr-2 h-3 w-3 md:h-4 md:w-4" />
              Contact Jacob
            </Button>
          </motion.div>
        </div>

        <div className="section-divider mb-6 md:mb-8" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-muted-foreground text-xs md:text-sm text-center md:text-left">
            &copy; {new Date().getFullYear()} PlexServer. All rights reserved.
          </p>
          <div className="flex gap-4 md:gap-6">
            {legalLinks.map((link) => (
              <span
                key={link.name}
                className="text-muted-foreground text-xs md:text-sm"
                data-testid={`legal-link-${link.name.toLowerCase().replace(' ', '-')}`}
              >
                {link.name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
