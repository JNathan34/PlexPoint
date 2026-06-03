import {
  CheckCircle2,
  Download,
  ExternalLink,
  Mail,
  Monitor,
  Phone,
  Smartphone,
  Tv,
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { PLEZY_URL, WHATSAPP_URL } from "@/lib/constants";

const appStoreLinks = [
  {
    name: "iPhone/iPad",
    icon: Smartphone,
    url: "https://apps.apple.com/app/plex/id383457673",
  },
  {
    name: "Android",
    icon: Smartphone,
    url: "https://play.google.com/store/apps/details?id=com.plexapp.android",
  },
  {
    name: "Windows/Mac",
    icon: Monitor,
    url: "https://www.plex.tv/media-server-downloads/#plex-app",
  },
  {
    name: "Smart TV",
    icon: Tv,
    url: "https://www.plex.tv/apps-devices/",
  },
];

const setupSteps = [
  {
    title: "Download Plex",
    description: "Install Plex on the device you actually watch on: phone, laptop, TV, console, or streaming stick.",
  },
  {
    title: "Create a Plex account",
    description: "Sign up with an email address you can access and keep your Plex username handy.",
  },
  {
    title: "Message Jacob on WhatsApp",
    description: "Tell Jacob which plan you want, send payment, and he will send your PlexPoint invite link.",
    action: {
      label: "Message Jacob",
      url: WHATSAPP_URL,
      icon: FaWhatsapp,
    },
  },
];

export default function TutorialsSection() {
  return (
    <section id="tutorials" className="section-gradient py-16 md:py-24" data-testid="tutorials-section">
      <div className="container mx-auto px-4">
        <div className="mb-10 grid gap-6 lg:grid-cols-[0.92fr_1.08fr] lg:items-end">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="max-w-3xl text-3xl font-semibold tracking-normal text-white md:text-5xl">
              Get set up and ready to stream in three steps.
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
              Download Plex, create your account, then message Jacob with your chosen plan after sending payment. He will
              send the invite link.
            </p>
          </motion.div>

          <div className="glass-card rounded-2xl p-4">
            <p className="text-sm font-medium text-white">Need help?</p>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <Button asChild variant="glass" className="h-10 rounded-xl">
                <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
                  <FaWhatsapp className="h-4 w-4 text-emerald-400" />
                  WhatsApp
                </a>
              </Button>
              <Button asChild variant="glass" className="h-10 rounded-xl">
                <a href="tel:+447481861478">
                  <Phone className="h-4 w-4" />
                  Call
                </a>
              </Button>
              <Button asChild variant="glass" className="h-10 rounded-xl">
                <a href="mailto:jacobnathan1718@gmail.com">
                  <Mail className="h-4 w-4" />
                  Email
                </a>
              </Button>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[0.75fr_1.25fr]">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="glass-card rounded-[1.75rem] p-5"
          >
            <h3 className="text-lg font-semibold text-white">Plex app links</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Install Plex first so your invite is ready to use as soon as Jacob sends the link.
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              {appStoreLinks.map((store) => (
                <a
                  key={store.name}
                  href={store.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex min-h-12 items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm transition hover:border-primary/35 hover:bg-primary/[0.06]"
                  data-testid={`download-${store.name.toLowerCase().replace("/", "-")}`}
                >
                  <span className="flex items-center gap-3">
                    <store.icon className="h-4 w-4 text-primary" />
                    {store.name}
                  </span>
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                </a>
              ))}
            </div>

            <div className="mt-5 rounded-2xl border border-primary/20 bg-primary/[0.06] p-4">
              <div className="flex items-start gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary">
                  <Download className="h-5 w-5" />
                </span>
                <div>
                  <h4 className="font-semibold text-white">Want downloads?</h4>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    Use Plezy if you want access to downloads. It is free on PC, but costs {"\u00a35"} on other devices
                    like TV and mobile.
                  </p>
                  <Button asChild variant="glass" className="mt-3 h-10 rounded-xl">
                    <a href={PLEZY_URL} target="_blank" rel="noopener noreferrer" data-testid="plezy-app-link">
                      Open Plezy
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>

          <div className="grid gap-3">
            {setupSteps.map((step, index) => {
              const ActionIcon = step.action?.icon;
              return (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45, delay: index * 0.04 }}
                  className="glass-card rounded-2xl p-4"
                >
                  <div className="grid gap-4 sm:grid-cols-[auto_1fr_auto] sm:items-center">
                    <span className="grid h-11 w-11 place-items-center rounded-xl border border-white/10 bg-white/[0.05] text-sm font-semibold text-primary">
                      {index + 1}
                    </span>
                    <div>
                      <h3 className="font-semibold text-white">{step.title}</h3>
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">{step.description}</p>
                    </div>
                    {step.action && ActionIcon ? (
                      <Button asChild className="h-10 rounded-xl btn-primary-gradient">
                        <a href={step.action.url} target="_blank" rel="noopener noreferrer">
                          <ActionIcon className="h-4 w-4" />
                          {step.action.label}
                        </a>
                      </Button>
                    ) : (
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
