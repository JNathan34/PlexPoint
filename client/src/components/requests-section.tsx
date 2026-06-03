import { ArrowRight, CheckCircle2, Clock, ExternalLink, Film, HelpCircle, PlusCircle, Search, Send } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { scrollToSection } from "@/lib/constants";

const requestSteps = [
  {
    icon: Search,
    title: "Search first",
    description: "Check the current PlexPoint library before sending a new request.",
  },
  {
    icon: PlusCircle,
    title: "Send the request",
    description: "Use Overseerr to request the exact film or show you want added.",
  },
  {
    icon: Clock,
    title: "Track the queue",
    description: "Requests are handled by tier priority and availability.",
  },
];

export default function RequestsSection() {
  const handleMakeRequest = () => {
    window.open("https://overseerr.movierequest.work/", "_blank");
  };

  return (
    <section id="requests" className="py-16 md:py-24" data-testid="requests-section">
      <div className="container mx-auto px-4">
        <div className="grid gap-8 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
            className="space-y-7"
          >
            <div>
              <h2 className="max-w-2xl text-3xl font-semibold tracking-normal text-white md:text-5xl">
                Request the missing title without chasing messages.
              </h2>
              <p className="mt-4 max-w-xl text-base leading-7 text-muted-foreground">
                Overseerr handles the queue, PlexPoint handles the library, and you can always jump to the setup guide
                if you are joining for the first time.
              </p>
            </div>

            <div className="grid gap-3">
              {requestSteps.map(({ icon: Icon, title, description }) => (
                <div key={title} className="glass-card rounded-2xl p-4">
                  <div className="flex gap-4">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/[0.05] text-primary">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div>
                      <h3 className="font-semibold text-white">{title}</h3>
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">{description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                variant="glass"
                size="lg"
                className="h-12 rounded-xl px-6 font-semibold"
                onClick={handleMakeRequest}
                data-testid="make-request-button"
              >
                <Send className="h-4 w-4" />
                Make a request
                <ExternalLink className="h-4 w-4" />
              </Button>
              <Button
                variant="glass"
                size="lg"
                className="h-12 rounded-xl px-6 font-semibold"
                onClick={() => scrollToSection("tutorials")}
                data-testid="how-it-works-button"
              >
                <HelpCircle className="h-4 w-4" />
                Setup guide
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 22, scale: 0.98 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.08 }}
            className="relative"
          >
            <div className="glass-card overflow-hidden rounded-[1.75rem] p-3">
              <div className="relative overflow-hidden rounded-2xl">
                <img
                  src="/request.jpg"
                  alt="Overseerr request interface"
                  className="h-[320px] w-full object-cover md:h-[520px]"
                  data-testid="request-interface-image"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5 md:p-7">
                  <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/12 bg-black/35 px-3 py-1.5 text-xs text-slate-200 backdrop-blur-xl">
                    <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                    Overseerr queue ready
                  </div>
                  <div className="grid gap-3 rounded-2xl border border-white/10 bg-black/42 p-4 backdrop-blur-xl sm:grid-cols-[1fr_auto] sm:items-center">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-white">Type a movie or TV show title...</p>
                      <p className="mt-1 text-xs text-muted-foreground">Requests go straight into the queue.</p>
                    </div>
                    <Button className="btn-primary-gradient h-10 rounded-xl px-4">
                      <Film className="h-4 w-4" />
                      Request
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
