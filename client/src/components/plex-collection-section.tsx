import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import type { LucideIcon } from "lucide-react";
import { CalendarRange, Clapperboard, Clock3, RefreshCcw, Search, Sparkles, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type PlexCollectionMovie = {
  id: string;
  title: string;
  year: number | null;
  rating: number | null;
  posterPath: string | null;
  summary: string | null;
  durationMinutes: number | null;
  genres: string[];
  contentRating: string | null;
  studio: string | null;
};

type QuestionOption = {
  value: string;
  label: string;
  description: string;
};

type QuizAnswers = {
  genre: string;
  runtime: string;
  era: string;
};

type RecommendedMovie = PlexCollectionMovie & {
  matchReasons: string[];
};

const INITIAL_VISIBLE_MOVIES = 36;
const VISIBLE_MOVIE_STEP = 36;
const MAX_GENRE_OPTIONS = 6;

const runtimeOptions: QuestionOption[] = [
  { value: "any", label: "Any length", description: "No runtime preference" },
  { value: "short", label: "Quick watch", description: "Under 100 minutes" },
  { value: "standard", label: "Movie night", description: "100 to 130 minutes" },
  { value: "epic", label: "Go big", description: "130+ minutes" },
];

const eraOptions: QuestionOption[] = [
  { value: "any", label: "Any era", description: "No release-year preference" },
  { value: "classic", label: "Throwback", description: "Released before 2000" },
  { value: "modern", label: "Modern pick", description: "Released from 2000 to 2019" },
  { value: "recent", label: "Fresh release", description: "Released in 2020 or later" },
];

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

async function fetchPlexMovies(): Promise<PlexCollectionMovie[]> {
  const res = await fetch("/api/plex/movies");
  const contentType = res.headers.get("content-type") || "";

  if (!contentType.includes("application/json")) {
    const text = (await res.text().catch(() => "")) || res.statusText;
    throw new Error(
      `Expected JSON from /api/plex/movies. Run the full app with 'npm run dev' or deploy the Pages Functions on Cloudflare. Response: ${text.slice(0, 120)}`,
    );
  }

  const body = (await res.json().catch(() => null)) as { message?: string } | PlexCollectionMovie[] | null;
  if (!res.ok) {
    throw new Error(
      body && typeof body === "object" && "message" in body && typeof body.message === "string"
        ? body.message
        : res.statusText,
    );
  }

  if (!body || !Array.isArray(body)) {
    throw new Error("Invalid Plex movie library response.");
  }

  return body;
}

function truncateText(value: string | null, maxLength: number) {
  if (!value) return null;
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength - 1).trimEnd()}\u2026`;
}

function formatRuntime(durationMinutes: number | null) {
  if (durationMinutes == null || !Number.isFinite(durationMinutes) || durationMinutes <= 0) return null;
  if (durationMinutes < 60) return `${durationMinutes}m`;
  const hours = Math.floor(durationMinutes / 60);
  const minutes = durationMinutes % 60;
  return minutes ? `${hours}h ${minutes}m` : `${hours}h`;
}

function toRuntimeBucket(durationMinutes: number | null) {
  if (durationMinutes == null) return null;
  if (durationMinutes < 100) return "short";
  if (durationMinutes <= 130) return "standard";
  return "epic";
}

function toEraBucket(year: number | null) {
  if (year == null) return null;
  if (year < 2000) return "classic";
  if (year < 2020) return "modern";
  return "recent";
}

function seededValue(input: string) {
  let hash = 2166136261;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0) / 4294967295;
}

function questionDescriptionForValue(value: string, options: QuestionOption[]) {
  return options.find((option) => option.value === value)?.label ?? value;
}

function pickDiverseRecommendations(scored: Array<RecommendedMovie & { score: number }>, take: number) {
  const selected: Array<RecommendedMovie & { score: number }> = [];

  for (const candidate of scored) {
    if (selected.length === 0) {
      selected.push(candidate);
      if (selected.length >= take) break;
      continue;
    }

    const sharedGenres = selected.reduce((count, existing) => {
      const overlap = candidate.genres.filter((genre) =>
        existing.genres.some((existingGenre) => existingGenre.toLowerCase() === genre.toLowerCase()),
      );
      return count + overlap.length;
    }, 0);

    const penalty = Math.min(4, sharedGenres) * 0.9;
    const adjustedScore = candidate.score - penalty;

    if (adjustedScore < selected[selected.length - 1].score - 2.5) continue;
    selected.push(candidate);
    if (selected.length >= take) break;
  }

  if (selected.length < take) {
    for (const candidate of scored) {
      if (selected.length >= take) break;
      if (selected.some((movie) => movie.id === candidate.id)) continue;
      selected.push(candidate);
    }
  }

  return selected.slice(0, take);
}

function buildRecommendations(
  items: PlexCollectionMovie[],
  answers: QuizAnswers,
  round: number,
  excludeIds: string[] = [],
): RecommendedMovie[] {
  const excluded = new Set(excludeIds);
  const candidates = items.filter((item) => !excluded.has(item.id));
  const pool = candidates.length >= 3 ? candidates : items;

  const scored = pool
    .map((item, index) => {
      const genreMatch =
        answers.genre === "surprise" ||
        item.genres.some((genre) => genre.toLowerCase() === answers.genre.toLowerCase());
      const runtimeMatch = answers.runtime === "any" || toRuntimeBucket(item.durationMinutes) === answers.runtime;
      const eraMatch = answers.era === "any" || toEraBucket(item.year) === answers.era;

      const matchReasons = [
        genreMatch ? (answers.genre === "surprise" ? "Any genre" : answers.genre) : null,
        answers.runtime !== "any" && runtimeMatch ? questionDescriptionForValue(answers.runtime, runtimeOptions) : null,
        answers.era !== "any" && eraMatch ? questionDescriptionForValue(answers.era, eraOptions) : null,
      ].filter((reason): reason is string => Boolean(reason));

      const score =
        (answers.genre === "surprise" ? 2.5 : genreMatch ? 7 : 0) +
        (answers.runtime === "any" ? 1 : runtimeMatch ? 3 : 0) +
        (answers.era === "any" ? 1 : eraMatch ? 2 : 0) +
        ((item.rating ?? 0) / 10) +
        seededValue(`${round}-${item.id}`) * 0.5 -
        index / 100_000;

      return {
        ...item,
        matchReasons,
        score,
      };
    })
    .sort((left, right) => right.score - left.score);

  return pickDiverseRecommendations(scored, 3).map(({ score: _score, ...movie }) => movie);
}

function QuestionGroup(props: {
  title: string;
  description: string;
  icon: LucideIcon;
  value: string;
  options: QuestionOption[];
  onChange: (value: string) => void;
  actions?: ReactNode;
}) {
  const { title, description, icon: Icon, value, options, onChange, actions } = props;

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3 min-w-0">
          <div className="rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 p-2 text-primary border border-primary/20 shrink-0">
            <Icon className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <h4 className="font-semibold">{title}</h4>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </div>

        {actions ? (
          <div className="flex flex-wrap items-center gap-2 sm:justify-end sm:pt-0.5 shrink-0">
            {actions}
          </div>
        ) : null}
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        {options.map((option) => {
          const isActive = value === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={`rounded-xl border px-3 py-2.5 text-left transition-all sm:rounded-2xl sm:px-4 sm:py-3 ${
                isActive
                  ? "border-orange-400/70 ring-2 ring-orange-400/25 bg-gradient-to-r from-orange-500/10 to-primary/5 shadow-[0_0_30px_hsla(25,100%,55%,0.15)]"
                  : "border-border/70 bg-background/40 hover:border-primary/40 hover:bg-primary/5"
              }`}
            >
              <div className="font-medium text-[15px] sm:text-base">{option.label}</div>
              <div className="text-xs text-muted-foreground sm:text-sm">{option.description}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function PlexCollectionSection() {
  const [visibleMovies, setVisibleMovies] = useState(INITIAL_VISIBLE_MOVIES);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("all");
  const [sortBy, setSortBy] = useState("library");

  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [quizStep, setQuizStep] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswers>({ genre: "", runtime: "", era: "" });
  const [recommendationRound, setRecommendationRound] = useState(0);
  const [excludedRecommendationIds, setExcludedRecommendationIds] = useState<string[]>([]);
  const [hasGeneratedRecommendations, setHasGeneratedRecommendations] = useState(false);

  const [activeMovie, setActiveMovie] = useState<PlexCollectionMovie | null>(null);

  const { data: movies, isLoading, error } = useQuery<PlexCollectionMovie[]>({
    queryKey: ["/api/plex/movies"],
    queryFn: fetchPlexMovies,
  });

  const items = movies ?? [];

  const resetMovieControls = () => {
    setSearchQuery("");
    setSelectedGenre("all");
    setSortBy("library");
  };

  useEffect(() => {
    setVisibleMovies(INITIAL_VISIBLE_MOVIES);
  }, [searchQuery, selectedGenre, sortBy]);

  const genreFilterOptions = useMemo(() => {
    const counts = new Map<string, number>();

    for (const item of items) {
      for (const genre of item.genres) {
        counts.set(genre, (counts.get(genre) ?? 0) + 1);
      }
    }

    return Array.from(counts.entries())
      .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
      .map(([genre, count]) => ({ genre, count }));
  }, [items]);

  const filteredMovies = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const genreNeedle = selectedGenre.trim().toLowerCase();

    const results = items.filter((movie) => {
      if (selectedGenre !== "all" && !movie.genres.some((genre) => genre.toLowerCase() === genreNeedle)) {
        return false;
      }

      if (!query) return true;
      if (movie.title.toLowerCase().includes(query)) return true;
      if (movie.year != null && String(movie.year).includes(query)) return true;
      if (movie.genres.some((genre) => genre.toLowerCase().includes(query))) return true;
      return false;
    });

    const sorted = [...results];
    const ratingValue = (movie: PlexCollectionMovie) => (typeof movie.rating === "number" ? movie.rating : -1);
    const yearValue = (movie: PlexCollectionMovie) => (typeof movie.year === "number" ? movie.year : 0);
    const runtimeValue = (movie: PlexCollectionMovie) =>
      typeof movie.durationMinutes === "number" ? movie.durationMinutes : Number.POSITIVE_INFINITY;

    switch (sortBy) {
      case "rating-desc":
        sorted.sort((a, b) => ratingValue(b) - ratingValue(a) || a.title.localeCompare(b.title));
        break;
      case "rating-asc":
        sorted.sort((a, b) => ratingValue(a) - ratingValue(b) || a.title.localeCompare(b.title));
        break;
      case "year-desc":
        sorted.sort((a, b) => yearValue(b) - yearValue(a) || a.title.localeCompare(b.title));
        break;
      case "year-asc":
        sorted.sort((a, b) => yearValue(a) - yearValue(b) || a.title.localeCompare(b.title));
        break;
      case "title-desc":
        sorted.sort((a, b) => b.title.localeCompare(a.title));
        break;
      case "runtime-asc":
        sorted.sort((a, b) => runtimeValue(a) - runtimeValue(b) || a.title.localeCompare(b.title));
        break;
      case "runtime-desc":
        sorted.sort((a, b) => runtimeValue(b) - runtimeValue(a) || a.title.localeCompare(b.title));
        break;
      case "title-asc":
        sorted.sort((a, b) => a.title.localeCompare(b.title));
        break;
      default:
        break;
    }

    return sorted;
  }, [items, searchQuery, selectedGenre, sortBy]);

  const displayedMovies = useMemo(
    () => filteredMovies.slice(0, visibleMovies),
    [filteredMovies, visibleMovies],
  );

  const genreOptions = useMemo<QuestionOption[]>(() => {
    const counts = new Map<string, number>();

    for (const item of items) {
      for (const genre of item.genres) {
        counts.set(genre, (counts.get(genre) ?? 0) + 1);
      }
    }

    const mostCommonGenres = Array.from(counts.entries())
      .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
      .slice(0, MAX_GENRE_OPTIONS)
      .map(([genre, count]) => ({
        value: genre,
        label: genre,
        description: `${count} movie${count === 1 ? "" : "s"} in your library`,
      }));

    return [{ value: "surprise", label: "Surprise me", description: "Keep the genre open" }, ...mostCommonGenres];
  }, [items]);

  const quizSteps = useMemo(
    () => [
      {
        key: "genre" as const,
        title: "What genre sounds right?",
        description: "Pick one vibe to start with.",
        icon: Clapperboard,
        options: genreOptions,
      },
      {
        key: "runtime" as const,
        title: "How long do you want to watch?",
        description: "Choose the runtime for tonight.",
        icon: Clock3,
        options: runtimeOptions,
      },
      {
        key: "era" as const,
        title: "What release era fits?",
        description: "Go classic, modern, or fresh.",
        icon: CalendarRange,
        options: eraOptions,
      },
    ],
    [genreOptions],
  );

  const canGenerateRecommendations = Boolean(answers.genre && answers.runtime && answers.era);

  const recommendations = useMemo(() => {
    if (!hasGeneratedRecommendations) return [];
    if (!canGenerateRecommendations) return [];
    return buildRecommendations(items, answers, recommendationRound, excludedRecommendationIds);
  }, [answers, canGenerateRecommendations, excludedRecommendationIds, hasGeneratedRecommendations, items, recommendationRound]);

  const resetQuiz = () => {
    setAnswers({ genre: "", runtime: "", era: "" });
    setQuizStep(0);
    setExcludedRecommendationIds([]);
    setHasGeneratedRecommendations(false);
  };

  const openQuiz = () => {
    resetQuiz();
    setIsQuizOpen(true);
  };

  const generateRecommendations = () => {
    if (!canGenerateRecommendations) return;
    setExcludedRecommendationIds(recommendations.map((movie) => movie.id));
    setRecommendationRound((current) => current + 1);
    setHasGeneratedRecommendations(true);
  };

  const activeQuizStep = quizSteps[Math.min(quizStep, quizSteps.length - 1)];

  const answerActiveQuizStep = (value: string) => {
    const step = quizSteps[quizStep];
    if (!step) return;

    const nextAnswers = { ...answers, [step.key]: value };
    setAnswers(nextAnswers);
    setHasGeneratedRecommendations(false);

    if (quizStep < quizSteps.length - 1) {
      setQuizStep((current) => Math.min(current + 1, quizSteps.length - 1));
      return;
    }

    setExcludedRecommendationIds([]);
    setRecommendationRound((current) => current + 1);
    setHasGeneratedRecommendations(true);
  };

  if (!isLoading && !error && !movies) return null;

    return (
    <section
      id="movies"
      className="pt-[calc(5rem+1.5rem)] md:pt-[calc(5rem+2.5rem)] pb-16 md:pb-20 section-gradient !border-t-0"
      data-testid="plex-collection-section"
    >
      <div className="container mx-auto px-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between mb-6">
          <div className="space-y-4">
            <div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold flex items-center gap-3">
                <Clapperboard className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
                What&apos;s on PlexPoint
              </h2>
            </div>
          </div>

           {!isLoading && movies && (
             <div className="flex justify-start lg:justify-end">
              <Button
                variant="glass"
                size="default"
                className="w-full sm:w-auto rounded-xl border-primary/20 bg-background/20 hover:bg-background/30 px-5"
                onClick={openQuiz}
                data-testid="open-movie-quiz"
              >
                <Sparkles className="h-4 w-4 text-primary" />
                Not sure what to watch? Take the quiz
              </Button>
             </div>
           )}
         </div>

        {error && (
          <div className="glass-card rounded-xl p-4 md:p-5 mb-8 border border-border/50" data-testid="plex-collection-error">
            <p className="text-sm text-muted-foreground">{error instanceof Error ? error.message : "Failed to load your Plex library."}</p>
          </div>
        )}

        {isLoading && (
          <div className="grid gap-6" aria-busy="true">
            <div className="glass-card rounded-3xl border border-border/50 p-6 space-y-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="h-20 rounded-2xl bg-card/60 animate-pulse" />
              ))}
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8 gap-3">
              {Array.from({ length: 24 }).map((_, index) => (
                <div key={index} className="rounded-xl bg-card/50 border border-border/50 aspect-[2/3] animate-pulse" />
              ))}
            </div>
          </div>
        )}

        {!isLoading && movies && (
          <>
              <Dialog
                open={isQuizOpen}
                onOpenChange={(open) => {
                   setIsQuizOpen(open);
                   if (!open) resetQuiz();
                 }}
               >
              <DialogContent className="w-[92vw] sm:w-[95vw] max-w-5xl max-h-[88vh] p-0 overflow-hidden glass-card rounded-2xl sm:rounded-3xl border border-border/50 flex flex-col gap-0">
                <DialogHeader className="sr-only">
                  <DialogTitle>Movie quiz</DialogTitle>
                  <DialogDescription>Answer questions to get 3 picks.</DialogDescription>
                </DialogHeader>

                <Card className="rounded-none sm:rounded-3xl border-0 bg-transparent shadow-none flex flex-col flex-1 min-h-0">
                  <CardHeader className="relative overflow-hidden rounded-none sm:rounded-t-3xl border-b border-border/40 bg-gradient-to-br from-primary/15 via-background/0 to-purple-500/10 p-4 sm:p-6 pb-4 sm:pb-5 shrink-0">
                    <CardTitle className="text-xl sm:text-2xl">Pick 3 movies for me</CardTitle>
                    <CardDescription>
                      Answer one question at a time and we&apos;ll pull three matches from your Plex library.
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4 p-4 sm:p-6 pt-4 sm:pt-4 overflow-y-auto flex-1 min-h-0">
                    {!hasGeneratedRecommendations ? (
                      <>
                        <QuestionGroup
                          title={activeQuizStep.title}
                          description={activeQuizStep.description}
                          icon={activeQuizStep.icon}
                          value={answers[activeQuizStep.key]}
                          options={activeQuizStep.options}
                          onChange={answerActiveQuizStep}
                          actions={
                            <>
                              {quizStep > 0 && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="rounded-xl border-border/70 bg-background/40 hover:border-primary/40 hover:bg-primary/5"
                                  onClick={() => setQuizStep((current) => Math.max(0, current - 1))}
                                  data-testid="quiz-back"
                                >
                                  Back
                                </Button>
                              )}

                              {activeQuizStep.key !== "genre" && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="rounded-xl border-border/70 bg-background/40 hover:border-primary/40 hover:bg-primary/5"
                                  onClick={() => answerActiveQuizStep("any")}
                                  data-testid="quiz-skip"
                                >
                                  Skip
                                </Button>
                              )}

                              <Button
                                variant="outline"
                                size="sm"
                                className="rounded-xl border-border/70 bg-background/40 hover:border-primary/40 hover:bg-primary/5"
                                onClick={resetQuiz}
                                data-testid="quiz-restart"
                              >
                                Restart
                              </Button>
                            </>
                          }
                        />
                      </>
                    ) : (
                      <>
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div className="space-y-2">
                            <h4 className="font-semibold">Your PlexPoint picks</h4>
                            <div className="flex flex-wrap gap-2">
                              <Badge variant="secondary" className="bg-primary/10 text-primary border border-primary/20">
                                {answers.genre === "surprise" ? "Any genre" : answers.genre}
                              </Badge>
                              <Badge variant="secondary" className="bg-primary/10 text-primary border border-primary/20">
                                {questionDescriptionForValue(answers.runtime, runtimeOptions)}
                              </Badge>
                              <Badge variant="secondary" className="bg-primary/10 text-primary border border-primary/20">
                                {questionDescriptionForValue(answers.era, eraOptions)}
                              </Badge>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="rounded-xl border-border/70 bg-background/40 hover:border-primary/40 hover:bg-primary/5"
                              onClick={() => {
                                setHasGeneratedRecommendations(false);
                                setQuizStep(0);
                              }}
                              data-testid="quiz-edit-answers"
                            >
                              Edit answers
                            </Button>

                            <Button
                              variant="outline"
                              size="sm"
                              className="rounded-xl border-border/70 bg-background/40 hover:border-primary/40 hover:bg-primary/5"
                              onClick={generateRecommendations}
                              data-testid="shuffle-movie-recommendations"
                            >
                              <RefreshCcw className="h-4 w-4" />
                              Shuffle another 3
                            </Button>
                          </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-3">
                          {recommendations.map((movie) => (
                            <div
                              key={movie.id}
                              className="rounded-2xl border border-border/70 bg-background/35 p-3 cursor-pointer hover:border-primary/30 hover:bg-primary/5 transition-colors"
                              data-testid={`recommended-movie-${movie.id}`}
                              role="button"
                              tabIndex={0}
                              onClick={() => setActiveMovie(movie)}
                              onKeyDown={(event) => {
                                if (event.key === "Enter" || event.key === " ") {
                                  event.preventDefault();
                                  setActiveMovie(movie);
                                }
                              }}
                            >
                              <div className="flex gap-3">
                                <img
                                  {...posterSrcSet(movie.posterPath, { width: 120, height: 180 })}
                                  alt={`${movie.title} poster`}
                                  className="h-28 w-20 rounded-xl object-cover shrink-0"
                                  loading="lazy"
                                  decoding="async"
                                  width={120}
                                  height={180}
                                />

                                <div className="min-w-0 flex-1">
                                  <div className="flex flex-wrap items-start justify-between gap-2">
                                    <div>
                                      <h5 className="font-semibold leading-tight">{movie.title}</h5>
                                      <p className="text-sm text-muted-foreground">
                                        {[movie.year].filter(Boolean).join(" \u2022 ")}
                                      </p>
                                    </div>

                                    {typeof movie.rating === "number" && (
                                      <div className="glass px-2 py-1 rounded-lg flex items-center gap-1 text-xs">
                                        <Star className="h-3.5 w-3.5 text-yellow-400" />
                                        <span className="font-semibold">{movie.rating.toFixed(1)}</span>
                                      </div>
                                    )}
                                  </div>

                                  {movie.matchReasons.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-3">
                                      {movie.matchReasons.map((reason) => (
                                        <Badge
                                          key={`${movie.id}-${reason}`}
                                          variant="secondary"
                                          className="bg-primary/10 text-primary border border-primary/20"
                                        >
                                          {reason}
                                        </Badge>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>

                              {movie.summary && (
                                <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
                                  {truncateText(movie.summary, 160)}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </DialogContent>
            </Dialog>

            <Dialog open={Boolean(activeMovie)} onOpenChange={(open) => (!open ? setActiveMovie(null) : null)}>
              {activeMovie && (
                <DialogContent className="w-[92vw] max-w-3xl max-h-[88vh] glass-card rounded-2xl sm:rounded-3xl border border-border/50 p-0 overflow-hidden flex flex-col gap-0">
                  <DialogHeader className="sr-only">
                    <DialogTitle>{activeMovie.title}</DialogTitle>
                    <DialogDescription>Movie details</DialogDescription>
                  </DialogHeader>

                  <div className="flex flex-col sm:grid sm:grid-cols-[220px_1fr] gap-0 flex-1 min-h-0 overflow-y-auto">
                    <div className="bg-background/20">
                      <div className="w-full h-[40vh] sm:h-auto sm:aspect-[2/3]">
                        <img
                          {...posterSrcSet(activeMovie.posterPath, { width: 440, height: 660 })}
                          alt={`${activeMovie.title} poster`}
                          className="h-full w-full object-cover"
                          loading="lazy"
                          decoding="async"
                          width={440}
                          height={660}
                        />
                      </div>
                    </div>

                    <div className="p-4 sm:p-6 space-y-4">
                      <div className="min-w-0 space-y-1">
                        <h4 className="text-xl font-bold leading-tight">{activeMovie.title}</h4>
                        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                          <span>
                            {[activeMovie.year, formatRuntime(activeMovie.durationMinutes), activeMovie.contentRating]
                              .filter(Boolean)
                              .join(" \u2022 ")}
                          </span>
                          {typeof activeMovie.rating === "number" && (
                            <span className="glass px-2 py-1 rounded-lg inline-flex items-center gap-1 text-xs text-foreground">
                              <Star className="h-3.5 w-3.5 text-yellow-400" />
                              <span className="font-semibold">{activeMovie.rating.toFixed(1)}</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {activeMovie.studio && (
                        <div className="text-sm text-muted-foreground">
                          <span className="font-medium text-foreground">Studio:</span> {activeMovie.studio}
                        </div>
                      )}

                      {activeMovie.genres.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {activeMovie.genres.slice(0, 8).map((genre) => (
                            <Badge
                              key={`${activeMovie.id}-${genre}`}
                              variant="secondary"
                              className="bg-primary/10 text-primary border border-primary/20"
                            >
                              {genre}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {activeMovie.summary && (
                        <p className="text-sm text-muted-foreground leading-relaxed">{activeMovie.summary}</p>
                      )}
                    </div>
                  </div>
                </DialogContent>
              )}
            </Dialog>

            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder={`Search movies (title, year, genre)\u2026`}
                    className="pl-9 rounded-xl bg-card border-border text-foreground"
                    data-testid="plex-movie-search"
                  />
                </div>

                {(searchQuery.trim().length > 0 ||
                  selectedGenre !== "all" ||
                  sortBy !== "library") && (
                  <Button
                    variant="outline"
                    className="rounded-xl border-border bg-card hover:border-primary/40 hover:bg-primary/5"
                    onClick={resetMovieControls}
                    data-testid="reset-plex-movie-controls"
                  >
                    Reset
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-row">
                <Select value={selectedGenre} onValueChange={setSelectedGenre}>
                  <SelectTrigger
                    className="w-full sm:w-72 rounded-xl bg-card border-border text-foreground hover:border-border/80 focus:ring-1 focus:ring-border focus:ring-offset-0"
                    data-testid="movie-filter-genre"
                  >
                    <SelectValue placeholder="Genre" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All genres</SelectItem>
                    {genreFilterOptions.map(({ genre, count }) => (
                      <SelectItem key={genre} value={genre}>
                        {genre} ({count})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger
                    className="w-full sm:w-72 rounded-xl bg-card border-border text-foreground hover:border-border/80 focus:ring-1 focus:ring-border focus:ring-offset-0"
                    data-testid="movie-sort-by"
                  >
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="library">Library order</SelectItem>
                    <SelectItem value="rating-desc">Rating (high → low)</SelectItem>
                    <SelectItem value="rating-asc">Rating (low → high)</SelectItem>
                    <SelectItem value="year-desc">Year (new → old)</SelectItem>
                    <SelectItem value="year-asc">Year (old → new)</SelectItem>
                    <SelectItem value="title-asc">Title (A → Z)</SelectItem>
                    <SelectItem value="title-desc">Title (Z → A)</SelectItem>
                    <SelectItem value="runtime-asc">Runtime (short → long)</SelectItem>
                    <SelectItem value="runtime-desc">Runtime (long → short)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {filteredMovies.length === 0 ? (
                <div className="glass-card rounded-2xl border border-border/50 bg-background/30 px-5 py-6 text-sm text-muted-foreground">
                  No movies match that search. Try a title, year, or genre.
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8 gap-3">
                    {displayedMovies.map((movie, index) => (
                      <Card
                        key={movie.id}
                        className="media-card rounded-xl overflow-hidden cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                        data-testid={`collection-movie-${movie.id}`}
                        role="button"
                        tabIndex={0}
                        onClick={() => setActiveMovie(movie)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            setActiveMovie(movie);
                          }
                        }}
                      >
                        <div className="aspect-[2/3] relative overflow-hidden">
                          <img
                            {...posterSrcSet(movie.posterPath, { width: 200, height: 300 })}
                            alt={`${movie.title} poster`}
                            className="w-full h-full object-cover"
                            loading={index < 12 ? "eager" : "lazy"}
                            fetchPriority={index < 4 ? "high" : "auto"}
                            decoding="async"
                            width={200}
                            height={300}
                          />

                          {typeof movie.rating === "number" && (
                            <div className="absolute top-1 left-1 glass px-1.5 py-1 rounded-md flex items-center gap-1 text-[11px]">
                              <Star className="h-3 w-3 text-yellow-400" />
                              <span className="font-semibold">{movie.rating.toFixed(1)}</span>
                            </div>
                          )}
                        </div>

                        <CardContent className="p-2">
                          <h6 className="font-semibold text-xs truncate">{movie.title}</h6>
                          <p className="text-[11px] text-muted-foreground truncate">
                            {[movie.year, movie.genres[0] ?? null].filter(Boolean).join(" \u2022 ")}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {visibleMovies < filteredMovies.length && (
                    <div className="flex justify-center pt-3">
                      <Button
                        variant="outline"
                        className="rounded-xl border-border/70 bg-background/40 hover:border-primary/40 hover:bg-primary/5"
                        onClick={() => setVisibleMovies((current) => Math.min(current + VISIBLE_MOVIE_STEP, filteredMovies.length))}
                        data-testid="show-more-collection-movies"
                      >
                        Show more movies
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
