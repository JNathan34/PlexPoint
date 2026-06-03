import { useState } from "react";
import { Gift, Mail, ShieldCheck } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FREE_TRIAL_URL, WHATSAPP_URL } from "@/lib/constants";

const legalSections = {
  privacy: {
    title: "Privacy Policy",
    updated: "June 2026",
    body: [
      "PlexPoint only uses the information needed to manage access, contact you about the service, and confirm payments or requests.",
      "Typical information includes your Plex username, contact details you provide, and payment-confirmation details. Plex account authentication is handled by Plex.",
      "For privacy questions, contact Jacob Nathan on WhatsApp or email.",
    ],
  },
  terms: {
    title: "Terms of Service",
    updated: "June 2026",
    body: [
      "PlexPoint provides access to a private Plex media server for personal, non-commercial viewing.",
      "Access is intended for your household unless an approved add-on says otherwise. Account sharing, redistribution, and attempts to bypass limits are not allowed.",
      "Subscriptions are paid monthly by bank transfer. Access may be suspended for non-payment or misuse of the request system.",
      "The service is provided as-is and may be interrupted by maintenance, internet issues, or platform restrictions.",
    ],
  },
};

type LegalKey = keyof typeof legalSections;

export default function Footer() {
  const [activeLegal, setActiveLegal] = useState<LegalKey | null>(null);
  const legal = activeLegal ? legalSections[activeLegal] : null;

  return (
    <footer className="relative overflow-hidden py-10 md:py-14" data-testid="footer">
      <div className="container mx-auto px-4">
        <div className="grid gap-8 md:grid-cols-[1.2fr_0.8fr_0.8fr]">
          <div>
            <div className="flex items-center gap-3">
              <img src="/plexpoint-logo.png" alt="PlexPoint" className="h-10 w-10 rounded-xl object-contain" />
              <div>
                <p className="font-semibold text-white">PlexPoint</p>
                <p className="text-sm text-muted-foreground">Private streaming, cleanly managed.</p>
              </div>
            </div>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <a
                href={FREE_TRIAL_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="glass-card inline-flex h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition hover:border-primary/40"
                data-testid="footer-free-trial-link"
              >
                <Gift className="h-4 w-4 text-primary" />
                Start 24-hour trial
              </a>
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="glass-card inline-flex h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition hover:border-emerald-400/40"
              >
                <FaWhatsapp className="h-4 w-4 text-emerald-400" />
                WhatsApp
              </a>
            </div>
          </div>

          <div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">Explore</p>
            <div className="grid gap-2 text-sm">
              <a href="/movies" className="text-muted-foreground transition hover:text-primary">What's on PlexPoint</a>
              <a href="#membership" className="text-muted-foreground transition hover:text-primary">Subscriptions</a>
              <a href="#requests" className="text-muted-foreground transition hover:text-primary">Requests</a>
              <a href="#tutorials" className="text-muted-foreground transition hover:text-primary">Setup guide</a>
            </div>
          </div>

          <div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">Support</p>
            <div className="grid gap-2 text-sm">
              <a href="mailto:jacobnathan1718@gmail.com" className="inline-flex items-center gap-2 text-muted-foreground transition hover:text-primary">
                <Mail className="h-4 w-4" />
                Email Jacob
              </a>
              <button
                type="button"
                onClick={() => setActiveLegal("privacy")}
                className="inline-flex items-center gap-2 text-left text-muted-foreground transition hover:text-primary"
                data-testid="privacy-policy-button"
              >
                <ShieldCheck className="h-4 w-4" />
                Privacy Policy
              </button>
              <button
                type="button"
                onClick={() => setActiveLegal("terms")}
                className="text-left text-muted-foreground transition hover:text-primary"
                data-testid="terms-of-service-button"
              >
                Terms of Service
              </button>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-2 pt-5 text-xs text-muted-foreground md:flex-row md:items-center md:justify-between">
          <p>&copy; {new Date().getFullYear()} PlexPoint. All rights reserved.</p>
          <p>Independent private server. Not affiliated with Plex Inc.</p>
        </div>
      </div>

      <Dialog open={Boolean(activeLegal)} onOpenChange={(open) => (!open ? setActiveLegal(null) : null)}>
        {legal ? (
          <DialogContent className="glass-card max-h-[82vh] max-w-lg overflow-y-auto rounded-2xl border-border/50">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">{legal.title}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 text-sm leading-7 text-muted-foreground">
              <p>
                <strong className="text-foreground">Last updated:</strong> {legal.updated}
              </p>
              {legal.body.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </DialogContent>
        ) : null}
      </Dialog>
    </footer>
  );
}
