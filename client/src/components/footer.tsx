import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";

export default function Footer() {
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  return (
    <footer className="relative py-6 md:py-8 overflow-hidden" data-testid="footer">
      <div className="absolute inset-0 bg-gradient-to-b from-background to-secondary/30" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img 
              src="/plexpoint-logo.png" 
              alt="PlexServer Logo" 
              className="h-8 w-8 rounded-lg object-contain"
            />
            <span className="text-sm font-semibold">PlexServer</span>
            <span className="text-muted-foreground text-xs md:text-sm">
              &copy; {new Date().getFullYear()}
            </span>
          </div>
          
          <div className="flex gap-4 md:gap-6">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowPrivacy(true)}
              className="text-muted-foreground hover:text-primary text-xs md:text-sm transition-colors"
              data-testid="privacy-policy-button"
            >
              Privacy Policy
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowTerms(true)}
              className="text-muted-foreground hover:text-primary text-xs md:text-sm transition-colors"
              data-testid="terms-of-service-button"
            >
              Terms of Service
            </motion.button>
          </div>
        </div>
      </div>

      <Dialog open={showPrivacy} onOpenChange={setShowPrivacy}>
        <DialogContent className="glass-card border-border/50 max-w-lg rounded-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Privacy Policy</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 text-sm text-muted-foreground">
            <p>
              <strong className="text-foreground">Last updated:</strong> January 2026
            </p>
            <p>
              This Privacy Policy describes how PlexServer ("we", "us", or "our") handles your information when you use our media streaming service.
            </p>
            <h4 className="font-semibold text-foreground">Information We Collect</h4>
            <p>
              We collect minimal information necessary to provide the service:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Your Plex username (to grant server access)</li>
              <li>Contact information you provide (phone, email)</li>
              <li>Payment information for subscription management</li>
            </ul>
            <h4 className="font-semibold text-foreground">How We Use Your Information</h4>
            <p>
              Your information is used solely to:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Provide access to the Plex media server</li>
              <li>Process subscription payments</li>
              <li>Communicate about your account and service updates</li>
            </ul>
            <h4 className="font-semibold text-foreground">Data Security</h4>
            <p>
              We take reasonable measures to protect your information. Your Plex account credentials are never stored by us - all authentication is handled directly through Plex's secure systems.
            </p>
            <h4 className="font-semibold text-foreground">Contact</h4>
            <p>
              For privacy concerns, contact Jacob Nathan via WhatsApp at 07481 861478.
            </p>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showTerms} onOpenChange={setShowTerms}>
        <DialogContent className="glass-card border-border/50 max-w-lg rounded-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Terms of Service</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 text-sm text-muted-foreground">
            <p>
              <strong className="text-foreground">Last updated:</strong> January 2026
            </p>
            <p>
              By using PlexServer, you agree to these terms. Please read them carefully.
            </p>
            <h4 className="font-semibold text-foreground">Service Description</h4>
            <p>
              PlexServer provides access to a private Plex media server containing movies and TV shows for personal, non-commercial viewing.
            </p>
            <h4 className="font-semibold text-foreground">Account Rules</h4>
            <ul className="list-disc pl-5 space-y-1">
              <li>You may not share your account with anyone outside your household</li>
              <li>You are responsible for maintaining the security of your Plex account</li>
              <li>Sharing login credentials is strictly prohibited</li>
            </ul>
            <h4 className="font-semibold text-foreground">Subscription & Payments</h4>
            <ul className="list-disc pl-5 space-y-1">
              <li>Subscriptions are billed monthly via bank transfer</li>
              <li>Access may be suspended for non-payment</li>
              <li>Refunds are not provided for partial months</li>
            </ul>
            <h4 className="font-semibold text-foreground">Acceptable Use</h4>
            <ul className="list-disc pl-5 space-y-1">
              <li>Content is for personal viewing only</li>
              <li>You may not download, copy, or redistribute content</li>
              <li>You may not attempt to access the server infrastructure</li>
            </ul>
            <h4 className="font-semibold text-foreground">Termination</h4>
            <p>
              We reserve the right to terminate access for violation of these terms or non-payment.
            </p>
            <h4 className="font-semibold text-foreground">Contact</h4>
            <p>
              For questions about these terms, contact Jacob Nathan via WhatsApp at 07481 861478.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </footer>
  );
}
