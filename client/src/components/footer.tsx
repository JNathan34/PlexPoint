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
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="relative inline-flex">
              <span className="absolute -inset-2 rounded-xl bg-gradient-to-br from-primary/30 via-purple-500/20 to-cyan-500/20 blur-xl opacity-70" />
              <img 
                src="/plexpoint-logo.png" 
                alt="Plex Point Logo" 
                className="relative h-8 w-8 rounded-lg object-contain"
              />
            </span>
            <span className="text-sm font-semibold">Plex Point</span>
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
              This Privacy Policy describes how Plex Point ("we", "us", or "our") handles your information when you use our media streaming service.
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
              For privacy concerns:
              <br />
              <span className="font-semibold">Contact:</span> Jacob Nathan
              <br />
              <span className="font-semibold">WhatsApp:</span>{" "}
              <a
                href="https://wa.me/447481861478"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                07481 861478
              </a>
            </p>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showTerms} onOpenChange={setShowTerms}>
        <DialogContent className="glass-card border-border/50 max-w-lg rounded-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              PlexPoint - Terms of Service
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 text-sm text-muted-foreground">
            <p>
              <strong className="text-foreground">Last updated:</strong> February 2026
            </p>
            <p>
              By subscribing to or using Plex Point, you agree to these Terms of
              Service. Please read them carefully. If you do not agree, you must
              cancel your subscription and stop using the service.
            </p>
            <h4 className="font-semibold text-foreground">1. Service Description</h4>
            <p>
              Plex Point provides access to a private Plex media server containing
              movies and TV shows for personal, non-commercial viewing only.
            </p>
            <p>
              The service is provided independently and is not affiliated with
              Plex Inc.
            </p>
            <h4 className="font-semibold text-foreground">
              2. Account Use &amp; Household Rules
            </h4>
            <ul className="list-disc pl-5 space-y-1">
              <li>The service is for personal, non-commercial use only.</li>
              <li>Access is limited to members of the same household.</li>
              <li>
                “Household” means individuals living at the same physical address
                using the same internet connection (LAN/WiFi).
              </li>
              <li>Account sharing outside the household is strictly prohibited.</li>
              <li>
                Exception: If you purchase an approved add-on that allows an
                additional user outside your household, that access is limited to
                the specific additional person and does not permit general account
                sharing.
              </li>
              <li>
                Sharing login credentials is not allowed, except with the specific
                additional outside-household person covered by an approved add-on.
              </li>
              <li>
                Accessing the service through VPNs or remote connections outside
                the household is prohibited.
              </li>
              <li>
                For approved outside-household add-on users, remote access may be
                permitted, but VPN usage remains prohibited.
              </li>
              <li>
                Each additional outside-household person requires their own add-on
                purchase and may be removed if payments stop.
              </li>
              <li>
                Users are responsible for maintaining the security of their Plex
                account.
              </li>
              <li>Members may not submit requests on behalf of other users.</li>
            </ul>
            <h4 className="font-semibold text-foreground">3. Requests &amp; Fair Use</h4>
            <p>Abuse of the request system includes, but is not limited to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                Repeatedly requesting unavailable titles after being informed.
              </li>
              <li>Spamming requests in a short period.</li>
              <li>Asking others to submit requests for you.</li>
              <li>Attempting to bypass request limitations.</li>
            </ul>
            <p>Minor violations may result in warnings or temporary suspension.</p>
            <p>
              Major or repeated abuse may result in permanent termination without
              refund.
            </p>
            <h4 className="font-semibold text-foreground">
              4. Subscription &amp; Payments
            </h4>
            <ul className="list-disc pl-5 space-y-1">
              <li>Subscriptions are billed monthly via bank transfer.</li>
              <li>
                Payment must be made in full and on time to maintain access.
              </li>
              <li>Access may be suspended or terminated for non-payment.</li>
              <li>
                Refunds are generally not provided, including partial months.
              </li>
            </ul>
            <h4 className="font-semibold text-foreground">5. Add-ons</h4>
            <p>
              Optional add-ons may be offered to expand your plan (for example,
              additional requests or adding an additional user).
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Add-ons are only available for Silver tier and above.</li>
              <li>
                Add-ons can be purchased multiple times unless otherwise stated.
              </li>
              <li>
                Add-on availability, pricing, and eligibility may change over
                time.
              </li>
              <li>Add-ons are applied after payment is received and confirmed.</li>
              <li>Add-ons are generally non-refundable once applied.</li>
              <li>
                Outside-household add-ons (if offered) allow access for one
                additional named person outside your household. Login credentials
                may be shared with that person only.
              </li>
              <li>
                Abuse of add-ons (including attempts to share access beyond what
                was purchased) may result in termination without refund.
              </li>
            </ul>
            <h4 className="font-semibold text-foreground">
              UK/EU Cancellation Rights
            </h4>
            <p>
              New subscribers have a 14-day right to cancel from the purchase
              date.
            </p>
            <p>
              By streaming content or submitting requests during this period, you
              acknowledge and waive this cancellation right.
            </p>
            <h4 className="font-semibold text-foreground">6. Acceptable Use</h4>
            <p>You agree NOT to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Download, copy, upload, or redistribute content.</li>
              <li>Use the service for commercial purposes.</li>
              <li>Attempt to access server infrastructure or backend systems.</li>
              <li>Hack, bypass limits, or exploit the system.</li>
              <li>Redistribute or pirate content obtained through the service.</li>
            </ul>
            <h4 className="font-semibold text-foreground">7. Service Availability</h4>
            <p>The Plex server is provided “as is.”</p>
            <p>
              While reasonable efforts are made to maintain uptime, interruptions
              may occur due to:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Maintenance</li>
              <li>Technical failures</li>
              <li>Internet outages</li>
              <li>Third-party or platform restrictions</li>
            </ul>
            <p>Service availability is not guaranteed.</p>
            <h4 className="font-semibold text-foreground">
              8. Termination &amp; Enforcement
            </h4>
            <p>Accounts may be suspended or terminated for:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Account sharing outside the household</li>
              <li>Non-payment</li>
              <li>Abuse of requests</li>
              <li>Unauthorized redistribution of content</li>
              <li>Attempted system exploitation or hacking</li>
              <li>Violations of these terms</li>
            </ul>
            <p>Enforcement may include:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Warning</li>
              <li>Temporary suspension</li>
              <li>Immediate termination without refund</li>
              <li>Permanent ban for repeated or severe violations</li>
            </ul>
            <h4 className="font-semibold text-foreground">9. Service Modifications</h4>
            <p>
              Plex Point reserves the right to modify, suspend, or discontinue:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Features</li>
              <li>Content availability</li>
              <li>Server functionality</li>
            </ul>
            <p>Changes may occur without liability.</p>
            <h4 className="font-semibold text-foreground">10. Updates to Terms</h4>
            <p>These Terms may be updated periodically.</p>
            <p>
              Subscribers will be notified of significant changes via email or
              in-app notification. Continued use of the service after updates
              constitutes acceptance of the revised Terms.
            </p>
            <h4 className="font-semibold text-foreground">11. Age Requirement</h4>
            <p>Subscribers must be:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>At least 18 years old, or</li>
              <li>Have verified parental or guardian consent.</li>
            </ul>
            <h4 className="font-semibold text-foreground">12. Agreement</h4>
            <p>
              By subscribing to or using Plex Point, you confirm that you:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Have read these Terms,</li>
              <li>Understand them, and</li>
              <li>Agree to be bound by them in full.</li>
            </ul>
            <h4 className="font-semibold text-foreground">
              13. Contact Information
            </h4>
            <p>
              For questions regarding these Terms:
              <br />
              <span className="font-semibold">Contact:</span> Jacob Nathan
              <br />
              <span className="font-semibold">WhatsApp:</span>{" "}
              <a
                href="https://wa.me/447481861478"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                07481 861478
              </a>
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </footer>
  );
}
