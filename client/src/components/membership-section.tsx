import { useState } from "react";
import { User, Crown, Gem, Zap, Award, Check, Mail, ArrowRight, Copy, CheckCircle, Tv, Film, Users } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { motion } from "framer-motion";
import { MEMBERSHIP_ADD_ONS, MEMBERSHIP_TIERS, type MembershipAddOn, type MembershipTier } from "@/lib/static-data";

const tierIcons = {
  "Bronze Tier": User,
  "Silver Tier": Award,
  "Gold Tier": Crown,
  "Diamond Tier": Gem,
  "Ruby Tier": Gem,
  "Platinum Tier": Zap,
};

const tierGradients = {
  "Bronze Tier": "from-amber-700 to-amber-500",
  "Silver Tier": "from-slate-500 to-slate-300",
  "Gold Tier": "from-yellow-500 to-amber-300",
  "Diamond Tier": "from-blue-500 to-cyan-300",
  "Ruby Tier": "from-red-500 to-rose-400",
  "Platinum Tier": "from-gray-800 to-gray-600",
};

const addOnIcons = {
  "extra-season": Tv,
  "extra-movie": Film,
  "extra-household-member": Users,
};

const addOnGradients = {
  "extra-season": "from-purple-500 to-violet-400",
  "extra-movie": "from-purple-500 to-violet-400",
  "extra-household-member": "from-purple-500 to-violet-400",
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

const formatGbp = (pence: number) => {
  const pounds = pence / 100;
  return Number.isInteger(pounds) ? pounds.toFixed(0) : pounds.toFixed(2);
};

export default function MembershipSection() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTier, setSelectedTier] = useState<MembershipTier | null>(null);
  const [selectedAddOn, setSelectedAddOn] = useState<MembershipAddOn | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleBankTransfer = (tier: MembershipTier) => {
    setSelectedTier(tier);
    setSelectedAddOn(null);
    setIsDialogOpen(true);
  };

  const handleAddOnPayment = (addOn: MembershipAddOn) => {
    setSelectedAddOn(addOn);
    setSelectedTier(null);
    setIsDialogOpen(true);
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const paymentItemLabel = selectedTier
    ? `${selectedTier.name} (£${formatGbp(selectedTier.price)}/month)`
    : selectedAddOn
      ? `${selectedAddOn.name} (£${formatGbp(selectedAddOn.price)}${selectedAddOn.billing === "month" ? "/month" : " each"})`
      : "PlexPoint";

  const whatsappMessage = `Hi Jacob, I’d like to pay for ${paymentItemLabel}. Can you confirm and add it to my account please?`;
  const whatsappUrl = `https://wa.me/447481861478?text=${encodeURIComponent(whatsappMessage)}`;

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
          <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto mb-6 md:mb-8 px-4">
            Request Movies & Shows at the Website. Choose the plan that fits your streaming needs.
          </p>

          <div className="inline-flex flex-row items-center justify-center gap-4 sm:gap-6">
            <a href="https://wa.me/447481861478" target="_blank" rel="noopener noreferrer" className="glass-card flex items-center gap-2 px-4 py-2.5 rounded-xl hover:border-green-500/50 hover:text-green-500 transition-all">
              <FaWhatsapp className="h-4 w-4 text-green-500" />
              <span className="text-sm text-muted-foreground">WhatsApp</span>
            </a>
            <a href="mailto:jacobnathan1718@gmail.com" className="glass-card flex items-center gap-2 px-4 py-2.5 rounded-xl hover:border-primary/50 hover:text-primary transition-all">
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
          {MEMBERSHIP_TIERS.map((tier) => {
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
                          £{formatGbp(tier.price)}
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
                      className={`w-full group min-h-[36px] sm:min-h-[44px] text-xs sm:text-sm ${isFeatured ? 'btn-primary-gradient' : 'bg-muted btn-hover-primary-gradient active:bg-muted/70'}`}
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

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-10 md:mt-16 max-w-7xl mx-auto"
          id="addons"
          data-testid="addons-section"
        >
          <h3 className="text-3xl md:text-4xl lg:text-6xl font-bold text-center mb-2">
            Subscription <span className="text-purple-500">Addons</span>
          </h3>
          <p className="text-sm md:text-base text-muted-foreground text-center mb-5 px-4">
            Available for Silver tier and up. Addons can be bought multiple times.
          </p>

          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4 md:gap-6 max-w-7xl mx-auto"
          >
            {MEMBERSHIP_ADD_ONS.map((addOn) => {
              const Icon = addOnIcons[addOn.id as keyof typeof addOnIcons] || Check;
              const gradient = addOnGradients[addOn.id as keyof typeof addOnGradients] || "from-primary to-orange-400";
              const addOnFeatures = [
                addOn.description,
                "Available from Silver tier and up",
                ...(addOn.repeatable ? ["Can be bought multiple times"] : []),
              ];

              return (
                <motion.div key={addOn.id} variants={item} data-testid={`addons-card-${addOn.id}`}>
                  <Card className="membership-tier h-full addon">
                    <CardContent className="p-2.5 sm:p-4 md:p-6 h-full flex flex-col">
                      <div className="text-center mb-2 sm:mb-4 md:mb-6 pt-2 sm:pt-4">
                        <motion.div
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          whileTap={{ scale: 0.95 }}
                          className={`inline-flex h-9 w-9 sm:h-12 sm:w-12 md:h-16 md:w-16 items-center justify-center rounded-lg sm:rounded-xl md:rounded-2xl bg-gradient-to-br ${gradient} mb-2 sm:mb-3 md:mb-4 shadow-lg`}
                        >
                          <Icon className="h-4 w-4 sm:h-6 sm:w-6 md:h-8 md:w-8 text-white" />
                        </motion.div>

                        <h4 className="text-sm sm:text-lg md:text-xl font-bold mb-1 sm:mb-2">{addOn.name}</h4>
                        <div className="flex items-baseline justify-center gap-0.5 sm:gap-1">
                          <span className="text-xl sm:text-3xl md:text-4xl font-bold text-gradient">
                            £{formatGbp(addOn.price)}
                          </span>
                          <span className="text-muted-foreground text-[10px] sm:text-sm">
                            {addOn.billing === "month" ? "/month" : "/each"}
                          </span>
                        </div>
                      </div>

                      <div className="flex-grow">
                        <ul className="space-y-1 sm:space-y-2 md:space-y-3 mb-2 sm:mb-4 md:mb-6">
                          {addOnFeatures.map((feature, featureIndex) => (
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
                        className="w-full group min-h-[36px] sm:min-h-[44px] text-xs sm:text-sm bg-muted btn-hover-addon-gradient active:bg-muted/70"
                        onClick={() => handleAddOnPayment(addOn)}
                        data-testid={`addons-cta-${addOn.id}`}
                      >
                        Ask to Add
                        <ArrowRight className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        </motion.div>
      </div>

      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            setSelectedTier(null);
            setSelectedAddOn(null);
          }
        }}
      >
        <DialogContent className="glass-card border-border/50 w-[calc(100%-2rem)] max-w-md rounded-2xl sm:rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl font-bold">
              {selectedTier
                ? `Subscribe to ${selectedTier.name}`
                : selectedAddOn
                  ? `Add ${selectedAddOn.name}`
                  : 'Bank Transfer Details'}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-sm">
              {selectedTier ? (
                <span className="text-primary font-semibold">£{formatGbp(selectedTier.price)}/month</span>
              ) : selectedAddOn ? (
                <span className="text-primary font-semibold">
                  £{formatGbp(selectedAddOn.price)}
                  {selectedAddOn.billing === "month" ? "/month" : " each"}
                </span>
              ) : null}
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
              <Button asChild className="flex-1 btn-whatsapp-gradient min-h-[44px] rounded-xl">
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                  <FaWhatsapp className="mr-2 h-4 w-4" />
                  WhatsApp
                </a>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
