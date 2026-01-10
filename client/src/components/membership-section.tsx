import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { User, Crown, Gem, Star, Zap, Award, Check, Mail, ArrowRight, X, Copy, CheckCircle, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import type { MembershipTier } from "@shared/schema";

const tierIcons = {
  "Bronze Tier": User,
  "Silver Tier": Award,
  "Gold Tier": Crown,
  "Diamond Tier": Star,
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

const BANK_DETAILS = {
  name: "Jacob Nathan",
  account: "58925008",
  sortCode: "09-01-28",
};

export default function MembershipSection() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTier, setSelectedTier] = useState<MembershipTier | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  
  const { data: membershipTiers = [], isLoading } = useQuery<MembershipTier[]>({
    queryKey: ['/api/membership-tiers'],
  });

  const handleBankTransfer = (tier: MembershipTier) => {
    setSelectedTier(tier);
    setIsDialogOpen(true);
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
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
    <section id="membership" className="py-12 md:py-24 relative overflow-hidden" data-testid="membership-section">
            
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-6 md:mb-16"
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
          
          <div className="inline-flex flex-row items-center justify-center gap-4 sm:gap-6">
            <a href="https://wa.me/447481861478" target="_blank" rel="noopener noreferrer" className="glass-card flex items-center gap-2 px-4 py-2.5 rounded-xl hover:border-green-500/50 transition-all">
              <MessageCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm text-muted-foreground">WhatsApp</span>
            </a>
            <a href="mailto:jacobnathan1718@gmail.com" className="glass-card flex items-center gap-2 px-4 py-2.5 rounded-xl hover:border-primary/50 transition-all">
              <Mail className="h-4 w-4 text-primary" />
              <span className="text-sm text-muted-foreground hidden sm:inline">jacobnathan1718@gmail.com</span>
              <span className="text-sm text-muted-foreground sm:hidden">Email</span>
            </a>
          </div>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4 md:gap-6 max-w-7xl mx-auto"
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
                  <CardContent className="p-2.5 sm:p-4 md:p-6 h-full flex flex-col">
                    <div className="text-center mb-2 sm:mb-4 md:mb-6 pt-2 sm:pt-4">
                      <motion.div
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        whileTap={{ scale: 0.95 }}
                        className={`inline-flex h-9 w-9 sm:h-12 sm:w-12 md:h-16 md:w-16 items-center justify-center rounded-lg sm:rounded-xl md:rounded-2xl bg-gradient-to-br ${gradient} mb-2 sm:mb-3 md:mb-4 shadow-lg`}
                      >
                        <Icon className="h-4 w-4 sm:h-6 sm:w-6 md:h-8 md:w-8 text-white" />
                      </motion.div>
                      <h4 className="text-sm sm:text-lg md:text-xl font-bold mb-1 sm:mb-2">{tier.name}</h4>
                      <div className="flex items-baseline justify-center gap-0.5 sm:gap-1">
                        <span className="text-xl sm:text-3xl md:text-4xl font-bold text-gradient">
                          £{(tier.price / 100).toFixed(0)}
                        </span>
                        <span className="text-muted-foreground text-[10px] sm:text-sm">/month</span>
                      </div>
                    </div>

                    <div className="flex-grow">
                      <ul className="space-y-1 sm:space-y-2 md:space-y-3 mb-2 sm:mb-4 md:mb-6">
                        {tier.features.map((feature, featureIndex) => (
                          <motion.li
                            key={featureIndex}
                            initial={{ opacity: 0, x: -10 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: featureIndex * 0.05 }}
                            className="flex items-start gap-1.5 sm:gap-2 md:gap-3"
                          >
                            <div className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <Check className="h-2 w-2 sm:h-2.5 sm:w-2.5 md:h-3 md:w-3 text-green-500" />
                            </div>
                            <span className="text-[10px] sm:text-xs md:text-sm text-muted-foreground line-clamp-2">{feature}</span>
                          </motion.li>
                        ))}
                      </ul>
                    </div>

                    <Button
                      className={`w-full group min-h-[36px] sm:min-h-[44px] text-xs sm:text-sm ${isFeatured ? 'btn-primary-gradient' : 'bg-muted hover:bg-muted/80 active:bg-muted/70'}`}
                      onClick={() => handleBankTransfer(tier)}
                      data-testid={`join-button-${tier.name.toLowerCase().replace(' ', '-')}`}
                    >
                      <span className="hidden sm:inline">Get Started</span>
                      <span className="sm:hidden">Join</span>
                      <ArrowRight className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="glass-card border-border/50 w-[calc(100%-2rem)] max-w-md rounded-2xl sm:rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl font-bold">
              {selectedTier ? `Subscribe to ${selectedTier.name}` : 'Bank Transfer Details'}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-sm">
              {selectedTier && (
                <span className="text-primary font-semibold">£{(selectedTier.price / 100).toFixed(0)}/month</span>
              )}
              {' '}- Use the bank details below to set up your payment.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-3 sm:space-y-4 mt-3 sm:mt-4">
            <div className="glass p-3 sm:p-4 rounded-xl space-y-2 sm:space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Name</p>
                  <p className="font-semibold text-sm sm:text-base">{BANK_DETAILS.name}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-9 w-9 p-0 rounded-xl"
                  onClick={() => copyToClipboard(BANK_DETAILS.name, 'name')}
                >
                  {copiedField === 'name' ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              
              <div className="h-px bg-border/50" />
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Account Number</p>
                  <p className="font-semibold font-mono text-sm sm:text-base">{BANK_DETAILS.account}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-9 w-9 p-0 rounded-xl"
                  onClick={() => copyToClipboard(BANK_DETAILS.account, 'account')}
                >
                  {copiedField === 'account' ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              
              <div className="h-px bg-border/50" />
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Sort Code</p>
                  <p className="font-semibold font-mono text-sm sm:text-base">{BANK_DETAILS.sortCode}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-9 w-9 p-0 rounded-xl"
                  onClick={() => copyToClipboard(BANK_DETAILS.sortCode, 'sortCode')}
                >
                  {copiedField === 'sortCode' ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            
            <p className="text-xs text-muted-foreground text-center px-2">
              After making the transfer, message Jacob on WhatsApp to confirm.
            </p>
            
            <div className="flex gap-2 sm:gap-3">
              <Button
                variant="outline"
                className="flex-1 min-h-[44px] rounded-xl"
                onClick={() => setIsDialogOpen(false)}
              >
                Close
              </Button>
              <Button
                className="flex-1 btn-primary-gradient min-h-[44px] rounded-xl"
                onClick={() => window.open('https://wa.me/447481861478', '_blank')}
              >
                <MessageCircle className="mr-2 h-4 w-4" />
                WhatsApp
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
