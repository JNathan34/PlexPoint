import { useState } from "react";
import { ChevronLeft, ChevronRight, Monitor, Smartphone, Tablet, Tv } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

type PreviewDevice = "phone" | "tablet" | "desktop" | "tv";

type PreviewScreen = {
  src: string;
  title: string;
  alt: string;
};

const deviceTabs: Array<{ id: PreviewDevice; label: string; icon: typeof Smartphone }> = [
  { id: "phone", label: "Phone", icon: Smartphone },
  { id: "tablet", label: "Tablet", icon: Tablet },
  { id: "desktop", label: "Desktop", icon: Monitor },
  { id: "tv", label: "TV", icon: Tv },
];

const previewScreens: Record<PreviewDevice, PreviewScreen[]> = {
  phone: [
    {
      src: "/preview-pictures/phone-home.SM7zECzK.avif",
      title: "Home",
      alt: "Phone preview of the PlexPoint home screen",
    },
    {
      src: "/preview-pictures/phone-library.zUSigU8d.avif",
      title: "Library",
      alt: "Phone preview of the PlexPoint library screen",
    },
    {
      src: "/preview-pictures/phone-md.Cs7-8pOx.avif",
      title: "Details",
      alt: "Phone preview of a PlexPoint media details screen",
    },
    {
      src: "/preview-pictures/phone-search.Emae2dz0.avif",
      title: "Search",
      alt: "Phone preview of the PlexPoint search screen",
    },
  ],
  tablet: [
    {
      src: "/preview-pictures/tablet-home.CrdB11vu.avif",
      title: "Home",
      alt: "Tablet preview of the PlexPoint home screen",
    },
    {
      src: "/preview-pictures/tablet-library.DoKL6xiL.avif",
      title: "Library",
      alt: "Tablet preview of the PlexPoint library screen",
    },
    {
      src: "/preview-pictures/tablet-md.CyWaOy2i.avif",
      title: "Details",
      alt: "Tablet preview of a PlexPoint media details screen",
    },
    {
      src: "/preview-pictures/tablet-player.BpinqgYs.avif",
      title: "Player",
      alt: "Tablet preview of the PlexPoint player screen",
    },
  ],
  desktop: [
    {
      src: "/preview-pictures/desktop-home.BmZmeulL.avif",
      title: "Home",
      alt: "Desktop preview of the PlexPoint home screen",
    },
    {
      src: "/preview-pictures/desktop-library.DZI9fyUp.avif",
      title: "Library",
      alt: "Desktop preview of the PlexPoint library screen",
    },
    {
      src: "/preview-pictures/desktop-md.DRYrMkRM.avif",
      title: "Details",
      alt: "Desktop preview of a PlexPoint media details screen",
    },
    {
      src: "/preview-pictures/desktop-player.DLyIhpxh.avif",
      title: "Player",
      alt: "Desktop preview of the PlexPoint player screen",
    },
  ],
  tv: [
    {
      src: "/preview-pictures/tv-home.PS5BN0n3.avif",
      title: "Home",
      alt: "TV preview of the PlexPoint home screen",
    },
    {
      src: "/preview-pictures/tv-library.DhaaGOXC.avif",
      title: "Library",
      alt: "TV preview of the PlexPoint library screen",
    },
    {
      src: "/preview-pictures/tv-md.Bal7yVfh.avif",
      title: "Details",
      alt: "TV preview of a PlexPoint media details screen",
    },
    {
      src: "/preview-pictures/tv-player.By1fXIu5.avif",
      title: "Player",
      alt: "TV preview of the PlexPoint player screen",
    },
  ],
};

export default function PreviewSection() {
  const [activeDevice, setActiveDevice] = useState<PreviewDevice>("phone");
  const activeIndex = deviceTabs.findIndex((device) => device.id === activeDevice);

  const moveDevice = (direction: -1 | 1) => {
    const nextIndex = (activeIndex + direction + deviceTabs.length) % deviceTabs.length;
    setActiveDevice(deviceTabs[nextIndex].id);
  };

  return (
    <section id="preview" className="preview-section py-16 md:py-24" data-testid="preview-section">
      <div className="container mx-auto px-4">
        <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <p className="mb-3 text-sm font-medium uppercase text-primary">Preview</p>
            <h2 className="max-w-3xl text-3xl font-semibold tracking-normal text-white md:text-5xl">
              Designed with care
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
              A clean PlexPoint experience that feels right at home on your phone, tablet, desktop, and TV.
            </p>
          </motion.div>

          <div className="flex items-center gap-3">
            <Button
              variant="glass"
              size="icon"
              className="h-10 w-10 rounded-xl"
              aria-label="Previous preview"
              onClick={() => moveDevice(-1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="glass"
              size="icon"
              className="h-10 w-10 rounded-xl"
              aria-label="Next preview"
              onClick={() => moveDevice(1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="mb-10 inline-flex max-w-full gap-1 overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.04] p-1">
          {deviceTabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveDevice(id)}
              className={`inline-flex h-11 shrink-0 items-center gap-2 rounded-xl px-4 text-sm transition ${
                activeDevice === id
                  ? "bg-white/10 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
                  : "text-slate-300 hover:bg-white/[0.06] hover:text-white"
              }`}
              aria-pressed={activeDevice === id}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>

        <div className="preview-stage">
          <motion.div
            key={activeDevice}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
            className={`preview-picture-grid preview-picture-grid--${activeDevice}`}
          >
            {previewScreens[activeDevice].map((screen, index) => (
              <figure key={screen.src} className="preview-picture-card">
                <img
                  src={screen.src}
                  alt={screen.alt}
                  className="preview-picture-card__image"
                  loading={index > 1 ? "lazy" : "eager"}
                  decoding="async"
                />
                <figcaption>{screen.title}</figcaption>
              </figure>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
