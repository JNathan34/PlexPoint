import { Play, Coffee } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FaDiscord, FaTelegram, FaReddit } from "react-icons/fa";

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
    <footer className="bg-card py-16 border-t border-border" data-testid="footer">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-2 mb-6">
              <Play className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold">PlexServer</span>
            </div>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Your personal media paradise with 800+ movies and 100+ TV shows. Stream anytime, anywhere.
            </p>
            <div className="mb-4">
              <a href="https://ko-fi.com/jnathan34" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80 transition-colors">
                💖 Support on Ko-fi: ko-fi.com/jnathan34
              </a>
            </div>
            <div className="flex space-x-4">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <button
                    key={social.name}
                    onClick={() => handleLinkClick(social.href)}
                    className="text-muted-foreground hover:text-primary transition-colors p-2"
                    data-testid={`social-link-${social.name.toLowerCase()}`}
                  >
                    <Icon className="h-5 w-5" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h5 className="font-bold mb-6">Quick Links</h5>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <button
                    onClick={() => handleLinkClick(link.href)}
                    className="text-muted-foreground hover:text-primary transition-colors text-left"
                    data-testid={`quick-link-${link.name.toLowerCase().replace(' ', '-')}`}
                  >
                    {link.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h5 className="font-bold mb-6">Support</h5>
            <ul className="space-y-3">
              {supportLinks.map((link) => (
                <li key={link.name}>
                  <button
                    onClick={() => handleLinkClick(link.href)}
                    className="text-muted-foreground hover:text-primary transition-colors text-left"
                    data-testid={`support-link-${link.name.toLowerCase().replace(' ', '-')}`}
                  >
                    {link.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Us Section */}
          <div>
            <h5 className="font-bold mb-6">Contact & Payment</h5>
            <p className="text-muted-foreground mb-6">
              Get in touch for subscriptions or support. We prefer direct bank transfers to avoid fees.
            </p>
            <Button 
              className="bg-primary hover:bg-primary/90"
              onClick={handleContactClick}
              data-testid="footer-contact-button"
            >
              <Coffee className="mr-2 h-4 w-4" />
              Contact Jacob
            </Button>
          </div>
        </div>

        <hr className="my-8 border-border" />

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
          <p className="text-muted-foreground">
            &copy; 2024 PlexServer. All rights reserved.
          </p>
          <div className="flex space-x-6">
            {legalLinks.map((link) => (
              <button
                key={link.name}
                onClick={() => handleLinkClick(link.href)}
                className="text-muted-foreground hover:text-primary transition-colors"
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
