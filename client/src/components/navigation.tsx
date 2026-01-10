import { useState, useEffect, useCallback } from "react";
import { Play, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { NAVBAR_HEIGHT, NAV_ITEMS, scrollToSection } from "@/lib/constants";

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('home');

  const handleNavClick = useCallback((id: string) => {
    scrollToSection(id);
    setIsMenuOpen(false);
  }, []);

  const handleScroll = useCallback(() => {
    setIsScrolled(window.scrollY > 50);
    
    const scrollPosition = window.scrollY + NAVBAR_HEIGHT + 50;
    
    let foundSection = false;
    for (let i = NAV_ITEMS.length - 1; i >= 0; i--) {
      const section = document.getElementById(NAV_ITEMS[i]);
      if (section && section.offsetTop <= scrollPosition) {
        setActiveSection(NAV_ITEMS[i]);
        foundSection = true;
        break;
      }
    }
    
    if (!foundSection) {
      setActiveSection('home');
    }
  }, []);

  useEffect(() => {
    handleScroll();
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  return (
    <motion.nav 
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={`fixed top-0 w-full z-50 transition-all duration-500 ${
        isScrolled ? 'navbar-custom py-2' : 'bg-background/80 backdrop-blur-sm py-3 md:py-4'
      }`}
      data-testid="navigation"
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          <motion.button 
            onClick={() => handleNavClick('home')}
            className="flex items-center space-x-2 text-foreground hover:text-primary transition-colors group"
            data-testid="logo-button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="h-9 w-9 md:h-10 md:w-10 rounded-xl bg-gradient-to-br from-primary to-orange-400 flex items-center justify-center group-hover:shadow-lg group-hover:shadow-primary/30 transition-shadow">
              <Play className="h-4 w-4 md:h-5 md:w-5 text-white" />
            </div>
            <span className="text-lg md:text-xl font-bold">PlexServer</span>
          </motion.button>

          <div className="hidden md:flex items-center">
            <div className="flex items-center gap-1 p-1.5 rounded-full glass">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item}
                  onClick={() => handleNavClick(item)}
                  className={`relative px-4 lg:px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 capitalize ${
                    activeSection === item 
                      ? 'text-white' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                  data-testid={`nav-link-${item}`}
                >
                  {activeSection === item && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute inset-0 bg-gradient-to-r from-primary to-orange-400 rounded-full"
                      transition={{ type: "spring", duration: 0.5 }}
                    />
                  )}
                  <span className="relative z-10">{item}</span>
                </button>
              ))}
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="md:hidden p-2 min-h-[44px] min-w-[44px]"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            data-testid="mobile-menu-button"
          >
            <AnimatePresence mode="wait">
              {isMenuOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <X className="h-6 w-6" />
                </motion.div>
              ) : (
                <motion.div
                  key="menu"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Menu className="h-6 w-6" />
                </motion.div>
              )}
            </AnimatePresence>
          </Button>
        </div>

        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden overflow-hidden"
            >
              <div className="py-4 mt-4 border-t border-border/50">
                <div className="flex flex-col space-y-1">
                  {NAV_ITEMS.map((item, index) => (
                    <motion.button
                      key={item}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => handleNavClick(item)}
                      className={`text-left px-4 py-3 rounded-xl transition-all capitalize min-h-[48px] ${
                        activeSection === item 
                          ? 'bg-primary/10 text-primary font-medium' 
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted/50 active:bg-muted'
                      }`}
                      data-testid={`mobile-nav-link-${item}`}
                    >
                      {item}
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
}
