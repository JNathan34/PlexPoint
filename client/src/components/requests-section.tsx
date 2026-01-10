import { Search, Clock, Star, PlusCircle, HelpCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { scrollToSection } from "@/lib/constants";

const features = [
  {
    icon: Search,
    title: "Easy Search",
    description: "Search for any movie or TV show using our intuitive interface"
  },
  {
    icon: Clock,
    title: "Quick Processing",
    description: "Most requests are fulfilled within 24-48 hours"
  },
  {
    icon: Star,
    title: "Quality Assured",
    description: "All content is verified for quality before adding"
  }
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

export default function RequestsSection() {
  const handleMakeRequest = () => {
    window.open('https://overseerr.movierequest.work/', '_blank');
  };

  return (
    <section id="requests" className="py-10 md:py-24 relative overflow-hidden" data-testid="requests-section">
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-6 md:space-y-8"
          >
            <div className="space-y-4 md:space-y-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="inline-flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-full glass text-xs md:text-sm font-medium"
              >
                <PlusCircle className="h-3 w-3 md:h-4 md:w-4 text-primary" />
                <span>Content Requests</span>
              </motion.div>
              
              <h2 className="text-3xl md:text-4xl lg:text-6xl font-bold">
                Request New <span className="text-gradient">Content</span>
              </h2>
              <p className="text-base md:text-xl text-muted-foreground leading-relaxed max-w-xl">
                Can't find what you're looking for? Use our integrated Overseerr system to request movies and TV shows.
              </p>
            </div>

            <motion.div
              variants={container}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="flex flex-col gap-3 md:gap-4"
            >
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  variants={item}
                  className="glass-card rounded-xl md:rounded-2xl p-4 md:p-5 group hover:border-primary/30 active:border-primary/50 transition-all"
                >
                  <div className="flex items-start gap-3 md:gap-4">
                    <div className="h-10 w-10 md:h-12 md:w-12 rounded-lg md:rounded-xl bg-gradient-to-br from-primary to-orange-400 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                      <feature.icon className="h-5 w-5 md:h-6 md:w-6 text-white" />
                    </div>
                    <div>
                      <h5 className="font-semibold mb-1 text-sm md:text-base">{feature.title}</h5>
                      <p className="text-muted-foreground text-xs md:text-sm leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-3 md:gap-4"
            >
              <Button
                size="lg"
                className="btn-primary-gradient px-6 md:px-8 py-5 md:py-6 text-base md:text-lg rounded-xl group min-h-[48px]"
                onClick={handleMakeRequest}
                data-testid="make-request-button"
              >
                <PlusCircle className="mr-2 h-4 w-4 md:h-5 md:w-5" />
                Make a Request
                <ArrowRight className="ml-2 h-4 w-4 md:h-5 md:w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="px-6 md:px-8 py-5 md:py-6 text-base md:text-lg rounded-xl border-border hover:border-primary/50 hover:bg-primary/10 active:bg-primary/20 transition-all min-h-[48px]"
                onClick={() => scrollToSection('tutorials')}
                data-testid="how-it-works-button"
              >
                <HelpCircle className="mr-2 h-4 w-4 md:h-5 md:w-5" />
                How It Works
              </Button>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative hidden lg:block"
          >
            <div className="relative">
              <motion.div
                animate={{
                  y: [0, -8, 0],
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
                  src="/request.jpg" 
                  alt="Overseerr request interface" 
                  className="w-full h-auto rounded-3xl object-cover"
                  data-testid="request-interface-image"
                />
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 }}
                  className="absolute inset-0 flex items-center justify-center z-20"
                >
                  <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-primary to-orange-400 flex items-center justify-center shadow-2xl animate-pulse-glow">
                    <PlusCircle className="h-10 w-10 text-white" />
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
