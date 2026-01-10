import { useQuery } from "@tanstack/react-query";
import { Film, Tv, Users, Library, Sparkles, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import type { ServerStats } from "@shared/schema";
import { scrollToSection } from "@/lib/constants";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 30 },
  show: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

const fadeInScale = {
  hidden: { opacity: 0, scale: 0.9 },
  show: { 
    opacity: 1, 
    scale: 1,
    transition: {
      duration: 0.7,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

function AnimatedCounter({ value, suffix = "" }: { value: string; suffix?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
      viewport={{ once: true }}
      className="text-2xl md:text-3xl font-bold text-gradient"
    >
      {value}{suffix}
    </motion.div>
  );
}

export default function HeroSection() {
  const { data: serverStats } = useQuery<ServerStats>({
    queryKey: ['/api/server-stats'],
  });

  return (
    <section 
      id="home" 
      className="hero-section min-h-screen flex items-center relative overflow-hidden pt-20 md:pt-0"
      data-testid="hero-section"
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            x: [0, 30, 0],
            y: [0, -20, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute top-20 right-1/4 w-64 md:w-96 h-64 md:h-96 rounded-full bg-gradient-to-r from-primary/10 to-transparent blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, -20, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute bottom-20 left-1/4 w-48 md:w-80 h-48 md:h-80 rounded-full bg-gradient-to-r from-blue-500/5 to-transparent blur-3xl"
        />
      </div>
      
      <div className="container mx-auto px-4 py-12 md:py-24 relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-6 md:space-y-8"
          >
            <div className="space-y-4 md:space-y-6">
              <motion.div variants={item} className="inline-flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-full glass text-xs md:text-sm font-medium">
                <Sparkles className="h-3 w-3 md:h-4 md:w-4 text-primary" />
                <span>Premium Streaming Experience</span>
              </motion.div>
              
              <motion.h1 variants={item} className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-extrabold leading-tight tracking-tight">
                Welcome to My{" "}
                <span className="text-gradient">Plex Media Server</span>
              </motion.h1>
              
              <motion.p variants={item} className="text-base md:text-xl text-muted-foreground leading-relaxed max-w-xl">
                Enjoy unlimited entertainment with movies and shows available right at your fingertips. Premium streaming with different tiers to suit your viewing needs.
              </motion.p>
              
              <motion.div variants={item} className="glass-card rounded-xl md:rounded-2xl p-4 md:p-6">
                <div className="flex items-center gap-2 mb-3 md:mb-4">
                  <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-xs md:text-sm font-medium text-muted-foreground">Preferred Payment Method</span>
                </div>
                <p className="text-base md:text-lg font-semibold mb-3 md:mb-4">Direct Bank Transfer (to avoid third-party fees)</p>
                <div className="space-y-1 md:space-y-1.5 text-muted-foreground text-xs md:text-sm">
                  <p>Name: <span className="text-foreground">Jacob Nathan</span></p>
                  <p>Account: <span className="text-foreground font-mono">58925008</span></p>
                  <p>Sort Code: <span className="text-foreground font-mono">09-01-28</span></p>
                </div>
              </motion.div>
            </div>

            <motion.div variants={item} className="grid grid-cols-3 gap-2 md:gap-4">
              <Card className="stats-card group">
                <CardContent className="p-3 md:p-5 text-center">
                  <Film className="h-5 w-5 md:h-7 md:w-7 text-primary mx-auto mb-2 md:mb-3 group-hover:scale-110 transition-transform" />
                  <AnimatedCounter value={serverStats?.totalMovies?.toString() || '834'} />
                  <p className="text-xs md:text-sm text-muted-foreground mt-1">Movies</p>
                </CardContent>
              </Card>
              
              <Card className="stats-card group">
                <CardContent className="p-3 md:p-5 text-center">
                  <Tv className="h-5 w-5 md:h-7 md:w-7 text-primary mx-auto mb-2 md:mb-3 group-hover:scale-110 transition-transform" />
                  <AnimatedCounter value={serverStats?.totalTvShows?.toString() || '127'} />
                  <p className="text-xs md:text-sm text-muted-foreground mt-1">TV Shows</p>
                </CardContent>
              </Card>
              
              <Card className="stats-card group">
                <CardContent className="p-3 md:p-5 text-center">
                  <Users className="h-5 w-5 md:h-7 md:w-7 text-primary mx-auto mb-2 md:mb-3 group-hover:scale-110 transition-transform" />
                  <AnimatedCounter value="24/7" />
                  <p className="text-xs md:text-sm text-muted-foreground mt-1">Access</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={item} className="flex flex-col sm:flex-row gap-3 md:gap-4">
              <Button
                size="lg"
                className="btn-primary-gradient px-6 md:px-8 py-5 md:py-6 text-base md:text-lg font-semibold rounded-xl min-h-[48px]"
                onClick={() => scrollToSection('membership')}
                data-testid="view-subscriptions-button"
              >
                <Play className="mr-2 h-4 w-4 md:h-5 md:w-5" />
                View Subscriptions
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="px-6 md:px-8 py-5 md:py-6 text-base md:text-lg rounded-xl border-border hover:border-primary/50 hover:bg-primary/10 active:bg-primary/20 transition-all duration-300 min-h-[48px]"
                onClick={() => scrollToSection('requests')}
                data-testid="browse-library-button"
              >
                <Library className="mr-2 h-4 w-4 md:h-5 md:w-5" />
                Request Content
              </Button>
            </motion.div>
          </motion.div>

          <motion.div
            variants={fadeInScale}
            initial="hidden"
            animate="show"
            className="relative hidden lg:block"
          >
            <div className="relative">
              <motion.div
                animate={{
                  y: [0, -10, 0],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="relative rounded-3xl overflow-hidden shadow-2xl"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent z-10" />
                <img 
                  src="https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&h=700&q=80" 
                  alt="Modern media server setup" 
                  className="w-full h-auto rounded-3xl object-cover"
                  data-testid="hero-image"
                />
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8, duration: 0.6 }}
                className="absolute -left-8 top-1/4 glass-card p-4 rounded-2xl shadow-xl"
              >
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-orange-400 flex items-center justify-center">
                    <Film className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold">New Content</p>
                    <p className="text-sm text-muted-foreground">Added daily</p>
                  </div>
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1, duration: 0.6 }}
                className="absolute -right-4 bottom-1/4 glass-card p-4 rounded-2xl shadow-xl"
              >
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-400 flex items-center justify-center">
                    <Sparkles className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold">HD Streaming</p>
                    <p className="text-sm text-muted-foreground">Premium streams</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
