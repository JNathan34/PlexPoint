import { useQuery } from "@tanstack/react-query";
import { User, Crown, Gem, Diamond, Zap, Award, Check, Phone, Mail, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import type { MembershipTier } from "@shared/schema";

const tierIcons = {
  "Bronze Tier": User,
  "Silver Tier": Award,
  "Gold Tier": Crown,
  "Diamond Tier": Diamond,
  "Ruby Tier": Gem,
  "Platinum Tier": Zap,
};

const tierGradients = {
  "Bronze Tier": "from-amber-700 to-amber-500",
  "Silver Tier": "from-slate-500 to-slate-300",
  "Gold Tier": "from-yellow-500 to-amber-300",
  "Diamond Tier": "from-blue-500 to-cyan-300",
  "Ruby Tier": "from-red-500 to-rose-400",
  "Platinum Tier": "from-purple-500 to-violet-400",
};

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
  hidden: { opacity: 0, y: 30 },
  show: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

export default function MembershipSection() {
  const { data: membershipTiers = [], isLoading } = useQuery<MembershipTier[]>({
    queryKey: ['/api/membership-tiers'],
  });

  const handleBankTransfer = () => {
    window.open('https://ko-fi.com/jnathan34/tiers', '_blank');
  };

  if (isLoading) {
    return (
      <section id="membership" className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full"
              />
            </div>
            <p className="text-muted-foreground">Loading membership tiers...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="membership" className="py-16 md:py-24 relative overflow-hidden" data-testid="membership-section">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] md:w-[800px] h-[400px] md:h-[800px] rounded-full bg-gradient-to-r from-primary/5 to-transparent blur-3xl" />
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
            <Crown className="h-3 w-3 md:h-4 md:w-4 text-primary" />
            <span>Choose Your Plan</span>
          </motion.div>
          
          <h2 className="text-3xl md:text-4xl lg:text-6xl font-bold mb-4 md:mb-6">
            Subscription <span className="text-gradient">Tiers</span>
          </h2>
          <p className="text-base md:text-xl text-muted-foreground max-w-2xl mx-auto mb-6 md:mb-8 px-4">
            Request Movies & Shows at the Website. Choose the plan that fits your streaming needs.
          </p>
          
          <div className="glass-card inline-flex flex-col sm:flex-row items-center gap-3 sm:gap-8 p-3 md:p-4 rounded-xl md:rounded-2xl">
            <div className="flex items-center gap-2 text-xs md:text-sm">
              <Phone className="h-3 w-3 md:h-4 md:w-4 text-primary" />
              <span className="text-muted-foreground">07481 861478</span>
            </div>
            <div className="h-px w-full sm:h-4 sm:w-px bg-border" />
            <div className="flex items-center gap-2 text-xs md:text-sm">
              <Mail className="h-3 w-3 md:h-4 md:w-4 text-primary" />
              <span className="text-muted-foreground text-xs md:text-sm break-all">jacobnathan1718@gmail.com</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 max-w-7xl mx-auto"
        >
          {membershipTiers.map((tier) => {
            const Icon = tierIcons[tier.name as keyof typeof tierIcons] || User;
            const gradient = tierGradients[tier.name as keyof typeof tierGradients] || "from-primary to-orange-400";
            const isFeatured = tier.name === "Gold Tier";
            
            return (
              <motion.div key={tier.id} variants={item}>
                <Card 
                  className={`membership-tier h-full ${isFeatured ? 'featured' : ''}`}
                  data-testid={`membership-tier-${tier.name.toLowerCase().replace(' ', '-')}`}
                >
                  <CardContent className="p-4 md:p-6 h-full flex flex-col">
                    <div className="text-center mb-4 md:mb-6 pt-4">
                      <motion.div
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        whileTap={{ scale: 0.95 }}
                        className={`inline-flex h-12 w-12 md:h-16 md:w-16 items-center justify-center rounded-xl md:rounded-2xl bg-gradient-to-br ${gradient} mb-3 md:mb-4 shadow-lg`}
                      >
                        <Icon className="h-6 w-6 md:h-8 md:w-8 text-white" />
                      </motion.div>
                      <h4 className="text-lg md:text-xl font-bold mb-2">{tier.name}</h4>
                      <div className="flex items-baseline justify-center gap-1">
                        <span className="text-3xl md:text-4xl font-bold text-gradient">
                          £{(tier.price / 100).toFixed(0)}
                        </span>
                        <span className="text-muted-foreground text-sm">/month</span>
                      </div>
                    </div>

                    <div className="flex-grow">
                      <ul className="space-y-2 md:space-y-3 mb-4 md:mb-6">
                        {tier.features.map((feature, featureIndex) => (
                          <motion.li
                            key={featureIndex}
                            initial={{ opacity: 0, x: -10 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: featureIndex * 0.05 }}
                            className="flex items-start gap-2 md:gap-3"
                          >
                            <div className="h-4 w-4 md:h-5 md:w-5 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <Check className="h-2.5 w-2.5 md:h-3 md:w-3 text-green-500" />
                            </div>
                            <span className="text-xs md:text-sm text-muted-foreground">{feature}</span>
                          </motion.li>
                        ))}
                      </ul>
                    </div>

                    <Button
                      className={`w-full group min-h-[44px] ${isFeatured ? 'btn-primary-gradient' : 'bg-muted hover:bg-muted/80 active:bg-muted/70'}`}
                      onClick={handleBankTransfer}
                      data-testid={`join-button-${tier.name.toLowerCase().replace(' ', '-')}`}
                    >
                      <span>Get Started</span>
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
