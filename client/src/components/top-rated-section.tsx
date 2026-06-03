import { useEffect, useMemo, useState } from "react";
import { Star, Tv } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

type PlexPreviewItem = {
  id: string;
  title: string;
  year: number | null;
  rating: number | null;
  posterPath: string | null;
  posterUrl?: string | null;
  seasons: number | null;
};

function posterSrc(posterPath: string | null, options: { width?: number; height?: number } = {}) {
  if (!posterPath) return "/plexpoint-logo.png";
  if (posterPath.startsWith("http://") || posterPath.startsWith("https://")) return posterPath;
  const params = new URLSearchParams({ path: posterPath });
  if (options.width) params.set("w", String(options.width));
  if (options.height) params.set("h", String(options.height));
  return `/api/plex/image?${params.toString()}`;
}

function posterSrcSet(posterPath: string | null, options: { width?: number; height?: number }) {
  const src = posterSrc(posterPath, options);
  if (!posterPath || posterPath.startsWith("http://") || posterPath.startsWith("https://")) return { src };
  if (!options.width && !options.height) return { src };

  const width2x = options.width ? Math.min(2000, options.width * 2) : undefined;
  const height2x = options.height ? Math.min(2000, options.height * 2) : undefined;
  const src2x = posterSrc(posterPath, { width: width2x, height: height2x });

  return { src, srcSet: `${src} 1x, ${src2x} 2x` };
}

type PreviewFile = {
  generatedAt: string;
  tv: PlexPreviewItem[];
};

export default function TopRatedSection() {
  const [preview, setPreview] = useState<PreviewFile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    (async () => {
      try {
        setIsLoading(true);
        setError(null);

        const res = await fetch("/plex-preview.json", {
          signal: controller.signal,
        });

        const contentType = res.headers.get("content-type") || "";
        if (!contentType.includes("application/json")) {
          const text = (await res.text().catch(() => "")) || res.statusText;
          throw new Error(
            `Expected JSON from /plex-preview.json but got '${contentType || "unknown"}'. ` +
              `Generate it with 'npm run generate:plex-preview'. ` +
              `Response: ${text.slice(0, 120)}`,
          );
        }

        if (!res.ok) {
          const text = (await res.text().catch(() => "")) || res.statusText;
          throw new Error(`${res.status}: ${text}`);
        }

        const data = (await res.json()) as PreviewFile;
        setPreview(data && typeof data === "object" ? data : null);
      } catch (e) {
        if (e instanceof DOMException && e.name === "AbortError") return;
        setPreview(null);
        setError(e instanceof Error ? e.message : "Failed to load Plex preview");
      } finally {
        setIsLoading(false);
      }
    })();

    return () => controller.abort();
  }, []);

  const items = preview?.tv ?? [];
  const hasItems = items.length > 0;
  const noun = "shows";

  const subtext = useMemo(() => {
    if (isLoading) return "Loading from your Plex server...";
    if (error) return `Connect Plex to show your top-rated ${noun}.`;
    return preview?.generatedAt
      ? `Updated ${new Date(preview.generatedAt).toLocaleString()}.`
      : "Updated recently.";
  }, [error, hasItems, isLoading, noun, preview?.generatedAt]);

  if (!isLoading && !error && !hasItems) return null;

  return (
    <section id="top-rated" className="py-16 md:py-20 section-gradient" data-testid="top-rated-section">
      <div className="container mx-auto px-4">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold flex items-center gap-3">
              <Tv className="h-7 w-7 text-primary" />
              Top Rated TV Shows
            </h2>
            <p className="text-muted-foreground mt-2">{subtext}</p>
          </div>
        </div>

        {error && (
          <div className="glass-card rounded-xl p-4 md:p-5 mb-8 border border-border/50" data-testid="top-rated-error">
            <p className="text-sm text-muted-foreground">
              {error}
            </p>
          </div>
        )}

        {isLoading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4" aria-busy="true">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="rounded-lg bg-card/50 border border-border/50 aspect-[2/3] animate-pulse" />
            ))}
          </div>
        )}

        {!isLoading && hasItems && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {items.map((item, index) => (
              <Card key={item.id} className="media-card rounded-lg overflow-hidden" data-testid={`top-rated-${item.id}`}>
                <div className="aspect-[2/3] relative overflow-hidden">
                  <img
                    {...(item.posterUrl ? { src: item.posterUrl } : posterSrcSet(item.posterPath, { width: 200, height: 300 }))}
                    alt={`${item.title} poster`}
                    className="w-full h-full object-cover"
                    loading={index < 6 ? "eager" : "lazy"}
                    fetchPriority={index < 2 ? "high" : "auto"}
                    decoding="async"
                    width={200}
                    height={300}
                  />
                  {typeof item.rating === "number" && (
                    <div className="absolute top-2 left-2 glass px-2 py-1 rounded-lg flex items-center gap-1 text-xs">
                      <Star className="h-3.5 w-3.5 text-yellow-400" />
                      <span className="font-semibold">{item.rating.toFixed(1)}</span>
                    </div>
                  )}
                </div>
                <CardContent className="p-3">
                  <h6 className="font-bold text-sm truncate mb-1">{item.title}</h6>
                  <p className="text-xs text-muted-foreground">
                    {item.seasons != null ? `${item.seasons} season${item.seasons === 1 ? "" : "s"}` : item.year ?? ""}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
