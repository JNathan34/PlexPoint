import { useState, useEffect, useCallback, useRef } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { NAVBAR_HEIGHT, NAV_ITEMS, scrollToSection } from "@/lib/constants";

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.scrollY > 50;
  });
  const [activeSection, setActiveSection] = useState<string>(() => {
    if (typeof window === "undefined") return "home";
    return window.location.pathname === "/" ? "home" : "";
  });
  const autoScrollTargetRef = useRef<string | null>(null);
  const autoScrollClearTimeoutRef = useRef<number | null>(null);
  const [location, setLocation] = useLocation();
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(max-width: 767px)").matches;
  });

  const isHomeRoute = location === "/";

  const handleNavClick = useCallback((id: string) => {
    setIsMenuOpen(false);
    setActiveSection(id);
    autoScrollTargetRef.current = id;

    if (autoScrollClearTimeoutRef.current) {
      window.clearTimeout(autoScrollClearTimeoutRef.current);
    }

    if (!isHomeRoute) {
      try {
        window.sessionStorage.setItem("plexpoint:scroll-target", id);
      } catch {
        // Ignore storage failures (private mode, etc.)
      }

      setLocation("/");
      return;
    }

    // Fallback: release lock even if the browser never lands exactly on the pixel.
    autoScrollClearTimeoutRef.current = window.setTimeout(() => {
      autoScrollTargetRef.current = null;
      autoScrollClearTimeoutRef.current = null;
    }, 3000);

    // Ensure the mobile menu closes before scrolling (improves reliability on iOS/Safari).
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        scrollToSection(id);
      });
    });
  }, [isHomeRoute, setLocation]);

  const handleScroll = useCallback(() => {
    setIsScrolled(window.scrollY > 50);
    if (!isHomeRoute) return;

    const autoTarget = autoScrollTargetRef.current;
    if (autoTarget) {
      const targetElement = document.getElementById(autoTarget);
      if (targetElement) {
        const targetTop =
          targetElement.getBoundingClientRect().top + window.scrollY - NAVBAR_HEIGHT;
        if (Math.abs(window.scrollY - targetTop) <= 2) {
          autoScrollTargetRef.current = null;
          if (autoScrollClearTimeoutRef.current) {
            window.clearTimeout(autoScrollClearTimeoutRef.current);
            autoScrollClearTimeoutRef.current = null;
          }
        }
      }

      // Keep the nav indicator pinned to the clicked section while auto-scrolling
      // so it doesn't "step through" intermediate tabs.
      return;
    }
    
    const scrollPosition = window.scrollY + NAVBAR_HEIGHT + 50;
    
    let foundSection = false;
    for (let i = NAV_ITEMS.length - 1; i >= 0; i--) {
      const section = document.getElementById(NAV_ITEMS[i]);
      if (section) {
        const sectionTop = section.getBoundingClientRect().top + window.scrollY;
        if (sectionTop <= scrollPosition) {
        setActiveSection(NAV_ITEMS[i]);
        foundSection = true;
        break;
        }
      }
    }
    
    if (!foundSection) {
      setActiveSection('home');
    }
  }, [isHomeRoute]);

  useEffect(() => {
    if (!isHomeRoute) return;

    let pending: string | null = null;
    try {
      pending = window.sessionStorage.getItem("plexpoint:scroll-target");
      if (pending) window.sessionStorage.removeItem("plexpoint:scroll-target");
    } catch {
      pending = null;
    }

    if (!pending) return;

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        handleNavClick(pending);
      });
    });
  }, [handleNavClick, isHomeRoute]);

  useEffect(() => {
    if (isHomeRoute) return;
    setActiveSection("");
    autoScrollTargetRef.current = null;
    if (autoScrollClearTimeoutRef.current) {
      window.clearTimeout(autoScrollClearTimeoutRef.current);
      autoScrollClearTimeoutRef.current = null;
    }
  }, [isHomeRoute]);

  useEffect(() => {
    handleScroll();
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    return () => {
      if (autoScrollClearTimeoutRef.current) {
        window.clearTimeout(autoScrollClearTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 767px)");

    const handleMediaChange = (event: MediaQueryListEvent | MediaQueryList) => {
      const matches = "matches" in event ? event.matches : mediaQuery.matches;
      setIsMobile(matches);
    };

    handleMediaChange(mediaQuery);

    // Modern browsers
    mediaQuery.addEventListener("change", handleMediaChange);
    return () => mediaQuery.removeEventListener("change", handleMediaChange);
  }, []);

  const useSolidNavbar = isScrolled || isMobile;

  return (
    <motion.nav 
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={`fixed top-0 w-full z-50 transition-all duration-500 ${
        useSolidNavbar ? 'navbar-custom' : 'bg-background/80 backdrop-blur-sm'
      } ${isScrolled ? 'py-2' : 'py-3 md:py-4'}`}
      data-testid="navigation"
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          <motion.button 
            onClick={() => handleNavClick("home")}
            className="flex items-center space-x-2 text-foreground hover:text-primary transition-colors group"
            data-testid="logo-button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="relative inline-flex">
              <span className="absolute -inset-2 rounded-2xl bg-gradient-to-br from-primary/30 via-purple-500/20 to-cyan-500/20 blur-xl opacity-80 group-hover:opacity-100 transition-opacity" />
              <img 
                src="/plexpoint-logo.png" 
                alt="Plex Point Logo" 
                className="relative h-9 w-9 md:h-10 md:w-10 rounded-xl object-contain group-hover:shadow-lg group-hover:shadow-primary/30 transition-shadow"
              />
            </span>
            <span className="text-lg md:text-xl font-bold">Plex Point</span>
          </motion.button>

          <div className="hidden md:flex items-center gap-3">
            <div className="flex items-center gap-1 p-1.5 rounded-full glass">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item}
                  onClick={() => handleNavClick(item)}
                  className={`relative px-4 lg:px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 capitalize ${
                    activeSection === item
                      ? "text-white"
                      : "text-muted-foreground hover:text-foreground"
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
                    {NAV_ITEMS.map((item) => (
                      <button
                        key={item}
                        type="button"
                      onClick={() => handleNavClick(item)}
                      className={`text-left px-4 py-3 rounded-xl transition-all capitalize min-h-[48px] cursor-pointer select-none ${
                        activeSection === item 
                          ? 'bg-primary/10 text-primary font-medium' 
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted/50 active:bg-muted'
                      }`}
                      style={{ touchAction: 'manipulation' }}
                      data-testid={`mobile-nav-link-${item}`}
                    >
                      {item}
                    </button>
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
