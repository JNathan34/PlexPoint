import { useState } from "react";
import {
  ArrowRight,
  Check,
  CheckCircle,
  Copy,
  Crown,
  Film,
  Gift,
  Gem,
  Mail,
  ShieldCheck,
  Sparkles,
  Tv,
  User,
  Users,
  Zap,
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FREE_TRIAL_URL } from "@/lib/constants";
import { MEMBERSHIP_ADD_ONS, MEMBERSHIP_TIERS, type MembershipAddOn, type MembershipTier } from "@/lib/static-data";

const POUND = "\u00a3";

const tierIcons = {
  "Bronze Tier": User,
  "Silver Tier": ShieldCheck,
  "Gold Tier": Crown,
  "Diamond Tier": Gem,
  "Ruby Tier": Sparkles,
  "Platinum Tier": Zap,
};

const addOnIcons = {
  "extra-season": Tv,
  "extra-movie": Film,
  "extra-household-member": Users,
};

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 22 },
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

function formatGbp(pence: number) {
  const pounds = pence / 100;
  return Number.isInteger(pounds) ? pounds.toFixed(0) : pounds.toFixed(2);
}

function cleanFeature(feature: string) {
  return feature
    .replace("Access to Plex", "PlexPoint server access")
    .replace("Enjoy all the movies and shows already available on Plex", "Browse the full current library")
    .replace("Processing time", "processing time")
    .replace("Requests are processed within", "Requests processed within");
}

function PaymentDialog(props: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedTier: MembershipTier | null;
  selectedAddOn: MembershipAddOn | null;
}) {
  const { open, onOpenChange, selectedTier, selectedAddOn } = props;
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const paymentItemLabel = selectedTier
    ? `${selectedTier.name} (${POUND}${formatGbp(selectedTier.price)}/month)`
    : selectedAddOn
      ? `${selectedAddOn.name} (${POUND}${formatGbp(selectedAddOn.price)}${
          selectedAddOn.billing === "month" ? "/month" : " each"
        })`
      : "PlexPoint";

  const whatsappMessage = `Hi Jacob, I'd like to pay for ${paymentItemLabel}. Can you confirm and add it to my account please?`;
  const whatsappUrl = `https://wa.me/447481861478?text=${encodeURIComponent(whatsappMessage)}`;

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    window.setTimeout(() => setCopiedField(null), 1800);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card w-[calc(100%-2rem)] max-w-md rounded-2xl border-border/50">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {selectedTier
              ? `Subscribe to ${selectedTier.name}`
              : selectedAddOn
                ? `Add ${selectedAddOn.name}`
                : "Bank transfer details"}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Use the details below, then send a WhatsApp message so access can be confirmed.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-2 space-y-4">
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
            {Object.entries(BANK_DETAILS).map(([field, value]) => (
              <div key={field} className="flex items-center justify-between gap-4 border-b border-white/10 py-3 first:pt-0 last:border-b-0 last:pb-0">
                <div>
                  <p className="text-xs capitalize text-muted-foreground">{field === "sortCode" ? "Sort code" : field}</p>
                  <p className="font-mono text-sm font-semibold text-foreground sm:text-base">{value}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-xl"
                  onClick={() => copyToClipboard(value, field)}
                  aria-label={`Copy ${field}`}
                >
                  {copiedField === field ? (
                    <CheckCircle className="h-4 w-4 text-emerald-400" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <Button variant="outline" className="h-11 flex-1 rounded-xl" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            <Button asChild className="btn-whatsapp-gradient h-11 flex-1 rounded-xl">
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                <FaWhatsapp className="h-4 w-4" />
                WhatsApp
              </a>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function MembershipSection() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTier, setSelectedTier] = useState<MembershipTier | null>(null);
  const [selectedAddOn, setSelectedAddOn] = useState<MembershipAddOn | null>(null);

  const featuredTierId = "gold";
  const openTierDialog = (tier: MembershipTier) => {
    setSelectedTier(tier);
    setSelectedAddOn(null);
    setIsDialogOpen(true);
  };

  const openAddOnDialog = (addOn: MembershipAddOn) => {
    setSelectedAddOn(addOn);
    setSelectedTier(null);
    setIsDialogOpen(true);
  };

  return (
    <section id="membership" className="section-gradient py-16 md:py-24" data-testid="membership-section">
      <div className="container mx-auto px-4">
        <div className="mb-10">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl"
          >
            <h2 className="text-3xl font-semibold tracking-normal text-white md:text-5xl">
              Subscription tiers that scale with your watchlist.
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
              Choose access, request allowance, and processing priority without needing a live backend on the website.
            </p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-8 overflow-hidden rounded-[1.75rem] border border-primary/25 bg-primary/[0.06]"
        >
          <div className="grid gap-5 p-5 md:grid-cols-[auto_1fr_auto] md:items-center md:p-6">
            <span className="grid h-14 w-14 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-[0_18px_50px_hsla(24,100%,55%,0.25)]">
              <Gift className="h-6 w-6" />
            </span>
            <div>
              <h3 className="text-xl font-semibold text-white">Try PlexPoint first with a one-time 24-hour free trial.</h3>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Send the trial invite, get set up, and use the 24 hours to see whether the library fits before subscribing.
              </p>
            </div>
            <Button asChild className="btn-primary-gradient h-11 rounded-xl px-5">
              <a href={FREE_TRIAL_URL} target="_blank" rel="noopener noreferrer" data-testid="membership-free-trial-link">
                Start 24-hour trial
                <ArrowRight className="h-4 w-4" />
              </a>
            </Button>
          </div>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
        >
          {MEMBERSHIP_TIERS.map((tier) => {
            const Icon = tierIcons[tier.name as keyof typeof tierIcons] || User;
            const isFeatured = tier.id === featuredTierId;

            return (
              <motion.div key={tier.id} variants={item}>
                <Card
                  className={`membership-tier h-full ${isFeatured ? "featured" : ""}`}
                  data-testid={`membership-tier-${tier.name.toLowerCase().replace(" ", "-")}`}
                >
                  <CardContent className="flex h-full flex-col p-5 md:p-6">
                    <div className="mb-5 flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-xl font-semibold text-white">{tier.name.replace(" Tier", "")}</h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {tier.maxStreams === -1 ? "Unlimited streams" : `${tier.maxStreams} stream${tier.maxStreams === 1 ? "" : "s"}`}
                        </p>
                      </div>
                      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/[0.05] text-primary">
                        <Icon className="h-5 w-5" />
                      </span>
                    </div>

                    <div className="mb-6">
                      <span className="text-4xl font-semibold text-white">{POUND}{formatGbp(tier.price)}</span>
                      <span className="ml-1 text-sm text-muted-foreground">/month</span>
                    </div>

                    <ul className="mb-6 flex-1 space-y-3">
                      {tier.features.slice(0, 5).map((feature) => (
                        <li key={feature} className="flex gap-3 text-sm leading-6 text-muted-foreground">
                          <Check className="mt-1 h-4 w-4 shrink-0 text-primary" />
                          <span>{cleanFeature(feature)}</span>
                        </li>
                      ))}
                    </ul>

                    <Button
                      variant={isFeatured ? "default" : "glass"}
                      className={`h-11 w-full rounded-xl ${isFeatured ? "btn-primary-gradient" : ""}`}
                      onClick={() => openTierDialog(tier)}
                      data-testid={`join-button-${tier.name.toLowerCase().replace(" ", "-")}`}
                    >
                      Get started
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

        <div id="addons" data-testid="addons-section" className="mt-16">
          <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h3 className="text-2xl font-semibold text-white md:text-4xl">Add-ons</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Available from Silver tier and up. Buy them when you need a little extra room.
              </p>
            </div>
            <div className="flex gap-3">
              <a
                href="https://wa.me/447481861478"
                target="_blank"
                rel="noopener noreferrer"
                className="glass-card inline-flex h-11 items-center gap-2 rounded-xl px-4 text-sm transition hover:border-emerald-400/40"
              >
                <FaWhatsapp className="h-4 w-4 text-emerald-400" />
                WhatsApp
              </a>
              <a
                href="mailto:jacobnathan1718@gmail.com"
                className="glass-card inline-flex h-11 items-center gap-2 rounded-xl px-4 text-sm transition hover:border-primary/40"
              >
                <Mail className="h-4 w-4 text-primary" />
                Email
              </a>
            </div>
          </div>

          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid gap-4 md:grid-cols-3"
          >
            {MEMBERSHIP_ADD_ONS.map((addOn) => {
              const Icon = addOnIcons[addOn.id as keyof typeof addOnIcons] || Check;

              return (
                <motion.div key={addOn.id} variants={item} data-testid={`addons-card-${addOn.id}`}>
                  <Card className="membership-tier addon h-full">
                    <CardContent className="flex h-full flex-col p-5">
                      <Icon className="mb-5 h-6 w-6 text-primary" />
                      <h4 className="text-lg font-semibold text-white">{addOn.name}</h4>
                      <p className="mt-2 flex-1 text-sm leading-6 text-muted-foreground">{addOn.description}</p>
                      <div className="mt-5 flex items-center justify-between gap-3">
                        <div>
                          <span className="text-2xl font-semibold text-white">{POUND}{formatGbp(addOn.price)}</span>
                          <span className="text-sm text-muted-foreground">
                            {addOn.billing === "month" ? "/month" : " each"}
                          </span>
                        </div>
                        <Button
                          variant="glass"
                          className="h-10 rounded-xl"
                          onClick={() => openAddOnDialog(addOn)}
                          data-testid={`addons-cta-${addOn.id}`}
                        >
                          Ask to add
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>

      <PaymentDialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            setSelectedTier(null);
            setSelectedAddOn(null);
          }
        }}
        selectedTier={selectedTier}
        selectedAddOn={selectedAddOn}
      />
    </section>
  );
}
