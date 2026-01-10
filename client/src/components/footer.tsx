import { Play, Coffee, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FaDiscord, FaTelegram, FaReddit } from "react-icons/fa";
import { motion } from "framer-motion";

const quickLinks = [
  { name: "Home", href: "#home" },
  { name: "Membership", href: "#membership" },
  { name: "Requests", href: "#requests" },
  { name: "Tutorials", href: "#tutorials" },
  { name: "FAQ", href: "#faq" },
];

const supportLinks = [
  { name: "Tutorials", href: "#tutorials" },
  { name: "Help Center", href: "#" },
  { name: "Contact", href: "#" },
  { name: "Status Page", href: "#" },
];

const legalLinks = [
  { name: "Privacy Policy", href: "#" },
  { name: "Terms of Service", href: "#" },
];

const socialLinks = [
  { name: "Discord", href: "#", icon: FaDiscord },
  { name: "Telegram", href: "#", icon: FaTelegram },
  { name: "Reddit", href: "#", icon: FaReddit },
];

export default function Footer() {
  const scrollToSection = (id: string) => {
    if (id.startsWith('#')) {
      const element = document.getElementById(id.substring(1));
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleContactClick = () => {
    alert('Contact Jacob Nathan:\n\nPhone: 07481 861478\nEmail: jacobnathan1718@gmail.com\n\nBank Transfer Details:\nName: Jacob Nathan\nAccount: 58925008\nSort Code: 09-01-28');
  };

  const handleLinkClick = (href: string) => {
    if (href.startsWith('#') && href !== '#') {
      scrollToSection(href);
    } else if (href === '#') {
      alert('This link would be implemented in a real application');
    }
  };

  return (
    <footer className="relative pt-20 pb-8 overflow-hidden" data-testid="footer">
      <div className="absolute inset-0 bg-gradient-to-b from-background to-secondary/30" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-12 mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-1"
          >
            <div className="flex items-center space-x-2 mb-6">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-orange-400 flex items-center justify-center">
                <Play className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold">PlexServer</span>
            </div>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Your personal media paradise with 800+ movies and 100+ TV shows. Stream anytime, anywhere.
            </p>
            <a 
              href="https://ko-fi.com/jnathan34" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors text-sm font-medium"
            >
              <Coffee className="h-4 w-4" />
              Support on Ko-fi
              <ExternalLink className="h-3 w-3" />
            </a>
            
            <div className="flex gap-2 mt-6">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <motion.button
                    key={social.name}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleLinkClick(social.href)}
                    className="h-10 w-10 rounded-xl glass flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/30 transition-all"
                    data-testid={`social-link-${social.name.toLowerCase()}`}
                  >
                    <Icon className="h-5 w-5" />
                  </motion.button>
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
            <h5 className="font-bold mb-6 text-lg">Quick Links</h5>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <button
                    onClick={() => handleLinkClick(link.href)}
                    className="text-muted-foreground hover:text-primary transition-colors text-left text-sm"
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
            <h5 className="font-bold mb-6 text-lg">Support</h5>
            <ul className="space-y-3">
              {supportLinks.map((link) => (
                <li key={link.name}>
                  <button
                    onClick={() => handleLinkClick(link.href)}
                    className="text-muted-foreground hover:text-primary transition-colors text-left text-sm"
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
          >
            <h5 className="font-bold mb-6 text-lg">Contact & Payment</h5>
            <p className="text-muted-foreground mb-6 text-sm leading-relaxed">
              Get in touch for subscriptions or support. We prefer direct bank transfers to avoid fees.
            </p>
            <Button 
              className="btn-primary-gradient"
              onClick={handleContactClick}
              data-testid="footer-contact-button"
            >
              <Coffee className="mr-2 h-4 w-4" />
              Contact Jacob
            </Button>
          </motion.div>
        </div>

        <div className="section-divider mb-8" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-muted-foreground text-sm">
            &copy; {new Date().getFullYear()} PlexServer. All rights reserved.
          </p>
          <div className="flex gap-6">
            {legalLinks.map((link) => (
              <button
                key={link.name}
                onClick={() => handleLinkClick(link.href)}
                className="text-muted-foreground hover:text-primary transition-colors text-sm"
                data-testid={`legal-link-${link.name.toLowerCase().replace(' ', '-')}`}
              >
                {link.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
