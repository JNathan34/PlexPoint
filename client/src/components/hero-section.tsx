import { Clapperboard, Crown, Film, Gift, PlusCircle, Tv, Users } from "lucide-react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { scrollToSection } from "@/lib/constants";
import { SERVER_STATS } from "@/lib/static-data";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.15,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

const highlights = [
  { icon: Film, label: "Movies", value: SERVER_STATS.totalMovies },
  { icon: Tv, label: "Shows", value: SERVER_STATS.totalTvShows },
  { icon: Users, label: "Uptime", value: SERVER_STATS.uptime },
];

const heroPosterWall = [
  { src: "/plex-posters/42269.jpg", alt: "2 Fast 2 Furious poster" },
  { src: "/plex-posters/28641.jpg", alt: "6 Underground poster" },
  { src: "/plex-posters/38138.jpg", alt: "10 Things I Hate About You poster" },
  { src: "/plex-posters/38140.jpg", alt: "17 Again poster" },
  { src: "/plex-posters/23239.jpg", alt: "57 Seconds poster" },
  { src: "/plex-posters/40555.jpg", alt: "PlexPoint movie poster" },
  { src: "/plex-posters/39477.jpg", alt: "PlexPoint movie poster" },
  { src: "/plex-posters/38995.jpg", alt: "PlexPoint movie poster" },
  { src: "/plex-posters/38494.jpg", alt: "PlexPoint movie poster" },
  { src: "/plex-posters/36035.jpg", alt: "PlexPoint movie poster" },
  { src: "/plex-posters/35770.jpg", alt: "PlexPoint movie poster" },
  { src: "/plex-posters/10252.jpg", alt: "PlexPoint movie poster" },
];

export default function HeroSection() {
  const [, setLocation] = useLocation();

  return (
    <section
      id="home"
      className="hero-section relative min-h-[calc(100vh-1px)] overflow-hidden pt-24"
      data-testid="hero-section"
    >
      <div className="absolute inset-0 -z-10">
        <img
          src="/homepage.png"
          alt=""
          className="h-full w-full object-cover opacity-25"
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,hsl(222,34%,5%)_0%,hsla(222,34%,5%,0.9)_36%,hsla(222,34%,5%,0.55)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-background to-transparent" />
      </div>

      <div className="container relative z-10 mx-auto px-4 pb-12 pt-8 md:pb-16 md:pt-16">
        <div className="grid min-h-[calc(100vh-9rem)] items-center gap-10 lg:grid-cols-[0.95fr_1.05fr]">
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="max-w-3xl space-y-8 lg:-translate-y-10"
          >
            <div className="space-y-5">
              <motion.h1
                variants={item}
                className="max-w-3xl text-4xl font-semibold leading-[1.02] tracking-normal text-white sm:text-5xl md:text-6xl lg:text-7xl"
              >
                Welcome to PlexPoint
              </motion.h1>

              <motion.p variants={item} className="max-w-2xl text-base leading-8 text-slate-300 md:text-lg">
                Browse what is available, choose the subscription that fits your household, and request new films or
                shows from one clean PlexPoint hub.
              </motion.p>
            </div>

            <motion.div variants={item} className="grid max-w-2xl gap-3 sm:grid-cols-3">
              <Button
                variant="glass"
                size="lg"
                className="h-12 rounded-xl px-4 text-sm font-semibold"
                onClick={() => scrollToSection("membership")}
                data-testid="view-subscriptions-button"
              >
                <Crown className="h-4 w-4" />
                View subscriptions
              </Button>
              <Button
                variant="glass"
                size="lg"
                className="h-12 rounded-xl px-4 text-sm font-semibold"
                onClick={() => {
                  setLocation("/movies");
                  requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "smooth" }));
                }}
                data-testid="whats-on-plexpoint-button"
              >
                <Clapperboard className="h-4 w-4" />
                What&apos;s on PlexPoint
              </Button>
              <Button
                variant="glass"
                size="lg"
                className="h-12 rounded-xl px-4 text-sm font-semibold"
                onClick={() => scrollToSection("requests")}
                data-testid="browse-library-button"
              >
                <PlusCircle className="h-4 w-4" />
                Request content
              </Button>
            </motion.div>

            <motion.div variants={item} className="grid max-w-2xl grid-cols-3 gap-3">
              {highlights.map(({ icon: Icon, label, value }) => (
                <div key={label} className="glass-card rounded-2xl p-4">
                  <Icon className="mb-3 h-5 w-5 text-primary" />
                  <div className="text-xl font-semibold text-white md:text-2xl">{value}</div>
                  <div className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-400">{label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.75, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="relative hidden lg:block"
          >
            <div className="cinema-frame">
              <div className="hero-poster-wall" aria-label="PlexPoint movie poster collection" data-testid="hero-image">
                {heroPosterWall.map((poster, index) => (
                  <img
                    key={`${poster.src}-${index}`}
                    src={poster.src}
                    alt={poster.alt}
                    className="hero-poster-wall__image"
                    loading={index > 5 ? "lazy" : "eager"}
                  />
                ))}
              </div>
            </div>

            <div className="glass-card absolute -left-8 top-10 max-w-56 rounded-2xl p-4 shadow-2xl">
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary text-primary-foreground">
                  <Gift className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-semibold text-white">24-hour free trial</p>
                  <p className="text-sm text-slate-400">Try before subscribing</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
