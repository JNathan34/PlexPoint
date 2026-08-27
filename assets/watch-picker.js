const WATCH_PICKER_HISTORY_KEY = "plexpoint-watch-picker-history-v1";
const WATCH_PICKER_MAX_HISTORY = 5000;

const watchPickerState = {
  movies: null,
  loadPromise: null,
  loadError: null,
  step: 0,
  view: "question",
  answers: { genre: "surprise", runtime: "any", era: "any" },
  currentPicks: [],
  history: new Set(),
  shuffle: 0,
  trigger: null,
  previousBodyOverflow: "",
};

const runtimeOptions = [
  { value: "any", label: "Any length", description: "Keep the evening flexible", icon: "shuffle" },
  { value: "short", label: "Quick watch", description: "Under 100 minutes", icon: "timer" },
  { value: "standard", label: "Movie night", description: "100–130 minutes", icon: "clock" },
  { value: "epic", label: "Go big", description: "More than 130 minutes", icon: "hourglass" },
];

const eraOptions = [
  { value: "any", label: "Any era", description: "Let the picker decide", icon: "shuffle" },
  { value: "classic", label: "Throwback", description: "Released before 2000", icon: "history" },
  { value: "modern", label: "Modern", description: "Released from 2000–2019", icon: "calendar" },
  { value: "recent", label: "Fresh", description: "Released in 2020 or later", icon: "sunrise" },
];

const genreIcons = {
  action: "bolt",
  adventure: "compass",
  animation: "wand",
  comedy: "smile",
  crime: "shield",
  documentary: "file",
  drama: "theatre",
  family: "users",
  fantasy: "sparkles",
  horror: "ghost",
  mystery: "search",
  romance: "heart",
  "science fiction": "orbit",
  thriller: "alert",
};

function pickerElement(tagName, { className = "", text = "", attributes = {} } = {}) {
  const element = document.createElement(tagName);
  if (className) element.className = className;
  if (text !== "") element.textContent = text;
  for (const [name, value] of Object.entries(attributes)) {
    element.setAttribute(name, String(value));
  }
  return element;
}

const pickerIconMarkup = {
  shuffle: '<path d="m16 3 5 0 0 5"/><path d="M4 20 21 3"/><path d="m21 16 0 5-5 0"/><path d="m15 15 6 6"/><path d="m4 4 5 5"/>',
  timer: '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 1.5M9 2h6M12 2v3"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  hourglass: '<path d="M7 3h10M7 21h10M8 3c0 4 1.5 6 4 9-2.5 3-4 5-4 9M16 3c0 4-1.5 6-4 9 2.5 3 4 5 4 9"/>',
  history: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5M12 7v5l3 2"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 10h18M8 14h.01M12 14h.01M16 14h.01M8 17h.01M12 17h.01"/>',
  sunrise: '<path d="M4 18h16M6 14a6 6 0 0 1 12 0M12 2v3M4.2 6.2l2.1 2.1M19.8 6.2l-2.1 2.1M2 14h2M20 14h2"/>',
  bolt: '<path d="m13 2-8 12h7l-1 8 8-12h-7l1-8Z"/>',
  compass: '<circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2 5-5 2 2-5 5-2Z"/>',
  wand: '<path d="m4 20 10-10M12 4l1-2 1 2 2 1-2 1-1 2-1-2-2-1 2-1ZM18 11l.8-1.5.7 1.5 1.5.7-1.5.8-.7 1.5-.8-1.5-1.5-.8 1.5-.7Z"/>',
  smile: '<circle cx="12" cy="12" r="9"/><path d="M8.5 10h.01M15.5 10h.01M8 14c1 2 2.3 3 4 3s3-1 4-3"/>',
  shield: '<path d="M12 3 5 6v5c0 4.7 2.8 8.1 7 10 4.2-1.9 7-5.3 7-10V6l-7-3Z"/><path d="m9 12 2 2 4-4"/>',
  file: '<path d="M6 3h8l4 4v14H6V3Z"/><path d="M14 3v5h4M9 13h6M9 17h6"/>',
  theatre: '<path d="M4 5c3-1 5-1 8 0v6c0 3-1.6 5-4 6-2.4-1-4-3-4-6V5Z"/><path d="M12 7c3-1 5-1 8 0v6c0 3-1.6 5-4 6-1.1-.5-2-1.1-2.7-2M6.5 9h.01M9.5 9h.01M6 13c1 .8 3 .8 4 0M14.5 11h.01M17.5 11h.01M14 15c1-.8 3-.8 4 0"/>',
  users: '<path d="M16 20v-2c0-2-1.8-3.5-4-3.5S8 16 8 18v2M12 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM18 8a2.5 2.5 0 0 1 0 5M19 15c1.5.4 2.5 1.5 2.5 3v2M6 8a2.5 2.5 0 0 0 0 5M5 15c-1.5.4-2.5 1.5-2.5 3v2"/>',
  sparkles: '<path d="m12 3 1.2 3.3L16.5 7.5l-3.3 1.2L12 12l-1.2-3.3-3.3-1.2 3.3-1.2L12 3ZM18.5 13l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8.8-2.2ZM6 14l.7 1.8 1.8.7-1.8.7L6 19l-.7-1.8-1.8-.7 1.8-.7L6 14Z"/>',
  ghost: '<path d="M5 20V11a7 7 0 0 1 14 0v9l-3-2-2 2-2-2-2 2-2-2-3 2Z"/><path d="M9.5 11h.01M14.5 11h.01"/>',
  search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m15.5 15.5 5 5"/>',
  heart: '<path d="M20.8 5.8a5.5 5.5 0 0 0-7.8 0L12 6.9l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 22l8.8-8.4a5.5 5.5 0 0 0 0-7.8Z"/>',
  orbit: '<circle cx="12" cy="12" r="2"/><path d="M19.5 4.5c2.2 2.2-1.6 9.6-6.7 14.7-3.2 3.2-6.2 4.7-7.5 3.4-1.3-1.3.2-4.3 3.4-7.5 5.1-5.1 12.5-8.9 14.7-6.7M4.5 4.5c-2.2 2.2 1.6 9.6 6.7 14.7 3.2 3.2 6.2 4.7 7.5 3.4"/>',
  alert: '<path d="M12 3 2.5 20h19L12 3Z"/><path d="M12 9v5M12 17h.01"/>',
  film: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 4v16M17 4v16M3 9h4M17 9h4M3 15h4M17 15h4"/>',
  close: '<path d="M18 6 6 18M6 6l12 12"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  star: '<path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2-4.5-4.4 6.2-.9L12 3Z"/>',
  refresh: '<path d="M20 6v5h-5M4 18v-5h5M6.1 9a7 7 0 0 1 11.8-2.6L20 11M4 13l2.1 4.6A7 7 0 0 0 17.9 15"/>',
};

function pickerIcon(name, className = "") {
  const icon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  icon.setAttribute("viewBox", "0 0 24 24");
  icon.setAttribute("fill", "none");
  icon.setAttribute("stroke", "currentColor");
  icon.setAttribute("stroke-width", "1.8");
  icon.setAttribute("stroke-linecap", "round");
  icon.setAttribute("stroke-linejoin", "round");
  icon.setAttribute("aria-hidden", "true");
  icon.classList.add("pp-picker-icon");
  if (className) icon.classList.add(...className.split(/\s+/).filter(Boolean));
  icon.innerHTML = pickerIconMarkup[name] || pickerIconMarkup.film;
  return icon;
}

function pickerNumber(value) {
  if (value == null || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function normalizePickerMovie(item) {
  if (!item || typeof item !== "object") return null;
  const id = String(item.id ?? "").trim();
  const title = String(item.title ?? "").trim();
  if (!id || !title) return null;

  return {
    id,
    title,
    year: pickerNumber(item.year),
    rating: pickerNumber(item.rating),
    durationMinutes: pickerNumber(item.durationMinutes),
    genres: Array.isArray(item.genres)
      ? item.genres.filter((genre) => typeof genre === "string" && genre.trim())
      : [],
    summary: typeof item.summary === "string" ? item.summary.trim() : "",
    posterPath: typeof item.posterPath === "string" ? item.posterPath : null,
    posterUrl: typeof item.posterUrl === "string" ? item.posterUrl : null,
    contentRating: typeof item.contentRating === "string" ? item.contentRating : null,
  };
}

function pickerMovieKey(movie) {
  return `${movie.title.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim()}::${movie.year ?? ""}`;
}

function uniquePickerMovies(items) {
  const seenIds = new Set();
  const seenTitles = new Set();
  const movies = [];

  for (const item of items) {
    const movie = normalizePickerMovie(item);
    if (!movie) continue;
    const titleKey = pickerMovieKey(movie);
    if (seenIds.has(movie.id) || seenTitles.has(titleKey)) continue;
    seenIds.add(movie.id);
    seenTitles.add(titleKey);
    movies.push(movie);
  }

  return movies;
}

function readPickerHistory() {
  try {
    const saved =
      localStorage.getItem(WATCH_PICKER_HISTORY_KEY) ||
      sessionStorage.getItem(WATCH_PICKER_HISTORY_KEY) ||
      "[]";
    const stored = JSON.parse(saved);
    if (Array.isArray(stored)) {
      watchPickerState.history = new Set(
        stored.filter((item) => typeof item === "string").slice(-WATCH_PICKER_MAX_HISTORY),
      );
    }
  } catch {
    watchPickerState.history = new Set();
  }
}

function savePickerHistory() {
  try {
    const serialized = JSON.stringify([...watchPickerState.history].slice(-WATCH_PICKER_MAX_HISTORY));
    localStorage.setItem(
      WATCH_PICKER_HISTORY_KEY,
      serialized,
    );
    sessionStorage.setItem(WATCH_PICKER_HISTORY_KEY, serialized);
  } catch {
    // The picker still works when browser storage is unavailable.
  }
}

async function loadPickerMovies() {
  if (watchPickerState.movies) return watchPickerState.movies;
  if (watchPickerState.loadPromise) return watchPickerState.loadPromise;

  watchPickerState.loadError = null;
  watchPickerState.loadPromise = (async () => {
    let items = null;
    try {
      const response = await fetch("/api/plex/movies?limit=10000");
      if (!response.ok) throw new Error("The live movie library is unavailable");
      const data = await response.json();
      if (!Array.isArray(data)) throw new Error("The movie response is invalid");
      items = data;
    } catch {
      const response = await fetch("/plex-preview.json", { cache: "no-store" });
      if (!response.ok) throw new Error("The movie preview is unavailable");
      const data = await response.json();
      if (!Array.isArray(data?.movies)) throw new Error("The movie preview is invalid");
      items = data.movies;
    }

    const movies = uniquePickerMovies(items);
    if (movies.length < 3) throw new Error("Not enough movies are available to make three picks");
    watchPickerState.movies = movies;
    return movies;
  })();

  try {
    return await watchPickerState.loadPromise;
  } catch (error) {
    watchPickerState.loadError =
      error instanceof Error ? error.message : "The movie picker could not be loaded";
    throw error;
  } finally {
    watchPickerState.loadPromise = null;
  }
}

function pickerPosterUrl(movie) {
  if (movie.posterUrl) return movie.posterUrl;
  if (!movie.posterPath) return "/plexpoint-logo.png";
  if (/^https?:\/\//i.test(movie.posterPath) || movie.posterPath.startsWith("/plex-posters/")) {
    return movie.posterPath;
  }

  const params = new URLSearchParams({ path: movie.posterPath, w: "420", h: "630" });
  return `/api/plex/image?${params.toString()}`;
}

function pickerRuntimeBucket(minutes) {
  if (minutes == null) return null;
  if (minutes < 100) return "short";
  if (minutes <= 130) return "standard";
  return "epic";
}

function pickerEraBucket(year) {
  if (year == null) return null;
  if (year < 2000) return "classic";
  if (year < 2020) return "modern";
  return "recent";
}

function pickerRuntimeLabel(minutes) {
  if (minutes == null || minutes <= 0) return null;
  if (minutes < 60) return `${Math.trunc(minutes)}m`;
  const hours = Math.floor(minutes / 60);
  const remainder = Math.trunc(minutes % 60);
  return remainder ? `${hours}h ${remainder}m` : `${hours}h`;
}

function pickerOptionLabel(value, options) {
  return options.find((option) => option.value === value)?.label ?? value;
}

function pickerGenreOptions() {
  const counts = new Map();
  for (const movie of watchPickerState.movies || []) {
    for (const genre of movie.genres) counts.set(genre, (counts.get(genre) || 0) + 1);
  }

  const genres = [...counts.entries()]
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
    .slice(0, 7)
    .map(([genre, count]) => ({
      value: genre,
      label: genre,
      description: `${count.toLocaleString()} ${count === 1 ? "movie" : "movies"} available`,
      icon: genreIcons[genre.toLowerCase()] || "film",
    }));

  return [
    { value: "surprise", label: "Surprise me", description: "Open up the whole library", icon: "shuffle" },
    ...genres,
  ];
}

function pickerQuestions() {
  return [
    {
      key: "genre",
      eyebrow: "Set the mood",
      title: "What kind of film sounds good?",
      description: "Choose a genre or keep every option open.",
      options: pickerGenreOptions(),
    },
    {
      key: "runtime",
      eyebrow: "Plan the evening",
      title: "How much time do you have?",
      description: "We’ll favour films that fit your night.",
      options: runtimeOptions,
    },
    {
      key: "era",
      eyebrow: "Choose the flavour",
      title: "Which era are you feeling?",
      description: "Go nostalgic, modern, or straight to something new.",
      options: eraOptions,
    },
  ];
}

function pickerHash(value) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0) / 4294967295;
}

function pickerScore(movie) {
  const { genre, runtime, era } = watchPickerState.answers;
  const genreMatch =
    genre === "surprise" || movie.genres.some((item) => item.toLowerCase() === genre.toLowerCase());
  const runtimeMatch = runtime === "any" || pickerRuntimeBucket(movie.durationMinutes) === runtime;
  const eraMatch = era === "any" || pickerEraBucket(movie.year) === era;

  let score = 0;
  score += genre === "surprise" ? 8 : genreMatch ? 48 : -18;
  score += runtime === "any" ? 5 : runtimeMatch ? 22 : -7;
  score += era === "any" ? 4 : eraMatch ? 16 : -5;
  score += Math.max(0, Math.min(10, movie.rating ?? 5));
  score += pickerHash(`${watchPickerState.shuffle}:${movie.id}:${movie.title}`) * 13;

  return { score, genreMatch, runtimeMatch, eraMatch };
}

function pickerMatchesAnswers(movie) {
  const { genre, runtime, era } = watchPickerState.answers;
  const genreMatch =
    genre === "surprise" || movie.genres.some((item) => item.toLowerCase() === genre.toLowerCase());
  const runtimeMatch = runtime === "any" || pickerRuntimeBucket(movie.durationMinutes) === runtime;
  const eraMatch = era === "any" || pickerEraBucket(movie.year) === era;
  return genreMatch && runtimeMatch && eraMatch;
}

function pickerUnseenMatchingMovies() {
  return (watchPickerState.movies || []).filter(
    (movie) => pickerMatchesAnswers(movie) && !watchPickerState.history.has(pickerMovieKey(movie)),
  );
}

function pickerMatchReasons(movie) {
  const { genre, runtime, era } = watchPickerState.answers;
  const scored = pickerScore(movie);
  const reasons = [];

  if (genre !== "surprise" && scored.genreMatch) reasons.push(genre);
  if (runtime !== "any" && scored.runtimeMatch) reasons.push(pickerOptionLabel(runtime, runtimeOptions));
  if (era !== "any" && scored.eraMatch) reasons.push(pickerOptionLabel(era, eraOptions));
  if (reasons.length === 0 && movie.rating != null) reasons.push(`${movie.rating.toFixed(1)} rated`);
  if (reasons.length === 0) reasons.push("Fresh wildcard");
  return reasons.slice(0, 3);
}

function selectDiversePickerMovies(candidates, count) {
  const remaining = candidates.map((movie) => ({ movie, ...pickerScore(movie) }));
  const selected = [];

  while (selected.length < count && remaining.length > 0) {
    remaining.sort((left, right) => {
      const overlapPenalty = (entry) =>
        selected.reduce((total, picked) => {
          const overlap = entry.movie.genres.filter((genre) =>
            picked.genres.some((pickedGenre) => pickedGenre.toLowerCase() === genre.toLowerCase()),
          ).length;
          return total + Math.min(3, overlap) * 3.5;
        }, 0);
      return right.score - overlapPenalty(right) - (left.score - overlapPenalty(left));
    });
    selected.push(remaining.shift().movie);
  }

  return selected;
}

function generatePickerRecommendations() {
  const candidates = pickerUnseenMatchingMovies();
  if (candidates.length === 0) {
    watchPickerState.currentPicks = [];
    watchPickerState.view = "exhausted";
    return;
  }

  watchPickerState.shuffle += 1;
  watchPickerState.currentPicks = selectDiversePickerMovies(candidates, Math.min(3, candidates.length));
  for (const movie of watchPickerState.currentPicks) {
    watchPickerState.history.add(pickerMovieKey(movie));
  }
  savePickerHistory();
  watchPickerState.view = "results";
}

function injectWatchPickerStyles() {
  if (document.getElementById("plex-watch-picker-styles")) return;

  const style = pickerElement("style", { attributes: { id: "plex-watch-picker-styles" } });
  style.textContent = `
    [data-testid="open-movie-quiz"][data-plex-watch-picker-trigger] {
      position: relative;
      isolation: isolate;
      overflow: clip;
      border-color: rgba(255, 125, 35, .32) !important;
      background: linear-gradient(135deg, rgba(255, 118, 28, .12), rgba(255, 255, 255, .035)) !important;
      box-shadow: inset 0 1px 0 rgba(255,255,255,.06), 0 12px 35px rgba(0,0,0,.18);
    }
    [data-testid="open-movie-quiz"][data-plex-watch-picker-trigger]:hover {
      border-color: rgba(255, 135, 55, .58) !important;
      transform: translateY(-1px);
    }
    .pp-picker-backdrop {
      position: fixed;
      inset: 0;
      z-index: 10000;
      display: grid;
      place-items: center;
      padding: 14px;
      background: rgba(3, 6, 12, .82);
      -webkit-backdrop-filter: blur(18px);
      backdrop-filter: blur(18px);
      animation: pp-picker-fade .18s ease-out;
    }
    .pp-picker-shell {
      position: relative;
      display: grid;
      grid-template-columns: minmax(0, 1fr);
      grid-template-rows: auto minmax(0, 1fr);
      width: min(940px, 96vw);
      height: min(700px, calc(100dvh - 28px));
      max-height: min(700px, calc(100dvh - 28px));
      overflow: clip;
      border: 1px solid rgba(255,255,255,.11);
      border-radius: 28px;
      color: #f8fafc;
      background:
        radial-gradient(circle at 80% 0%, rgba(255, 113, 20, .10), transparent 35%),
        linear-gradient(145deg, #11151d 0%, #090c12 72%);
      box-shadow: 0 30px 100px rgba(0,0,0,.58), inset 0 1px 0 rgba(255,255,255,.055);
      animation: pp-picker-rise .24s cubic-bezier(.2,.8,.2,1);
    }
    .pp-picker-close {
      position: absolute;
      top: 16px;
      right: 16px;
      z-index: 4;
      display: grid;
      width: 40px;
      height: 40px;
      place-items: center;
      border: 1px solid rgba(255,255,255,.12);
      border-radius: 13px;
      color: #d9e0ea;
      background: rgba(7,10,15,.62);
      font-size: 22px;
      line-height: 1;
      transition: .18s ease;
    }
    .pp-picker-close:hover { border-color: rgba(255,132,52,.5); color: #fff; background: rgba(255,113,20,.12); }
    .pp-picker-icon { display: block; width: 18px; height: 18px; flex: 0 0 auto; }
    .pp-picker-aside {
      position: relative;
      display: block;
      min-height: 0;
      overflow: clip;
      padding: 20px 28px 17px;
      border-bottom: 1px solid rgba(255,255,255,.08);
      background:
        radial-gradient(circle at 0% 0%, rgba(255,126,37,.28), transparent 38%),
        radial-gradient(circle at 100% 100%, rgba(123,45,255,.14), transparent 42%),
        rgba(255,255,255,.018);
    }
    .pp-picker-brand, .pp-picker-content { position: relative; z-index: 1; }
    .pp-picker-kicker {
      display: inline-flex;
      align-items: center;
      align-self: flex-start;
      gap: 8px;
      padding: 7px 10px;
      border: 1px solid rgba(255,146,72,.26);
      border-radius: 999px;
      color: #ff9a54;
      background: rgba(255,119,25,.09);
      font-size: 10px;
      font-weight: 750;
      letter-spacing: .16em;
      text-transform: uppercase;
    }
    .pp-picker-kicker-dot { width: 6px; height: 6px; border-radius: 50%; background: #ff7a1a; box-shadow: 0 0 14px #ff7a1a; }
    .pp-picker-aside h2 { margin: 9px 56px 0 0; max-width: none; font-size: clamp(25px, 3vw, 31px); line-height: 1.04; letter-spacing: -.035em; font-weight: 720; }
    .pp-picker-aside-copy, .pp-picker-steps, .pp-picker-surprise { display: none; }
    .pp-picker-steps { gap: 10px; margin: 30px 0 0; }
    .pp-picker-step {
      display: grid;
      grid-template-columns: 30px 1fr;
      align-items: center;
      gap: 11px;
      min-height: 50px;
      padding: 9px 10px;
      border: 1px solid transparent;
      border-radius: 15px;
      color: #718096;
      transition: .2s ease;
    }
    .pp-picker-step-number { display: grid; width: 30px; height: 30px; place-items: center; border: 1px solid rgba(255,255,255,.11); border-radius: 10px; background: rgba(255,255,255,.035); font-size: 12px; font-weight: 750; }
    .pp-picker-step strong, .pp-picker-step small { display: block; }
    .pp-picker-step strong { color: #9ba7b8; font-size: 12px; font-weight: 700; }
    .pp-picker-step small { margin-top: 1px; overflow: hidden; color: #667286; font-size: 11px; text-overflow: ellipsis; white-space: nowrap; }
    .pp-picker-step.is-current { border-color: rgba(255,126,40,.22); color: #ff8c3a; background: rgba(255,119,25,.065); }
    .pp-picker-step.is-current strong, .pp-picker-step.is-done strong { color: #fff; }
    .pp-picker-step.is-current .pp-picker-step-number, .pp-picker-step.is-done .pp-picker-step-number { border-color: rgba(255,135,51,.36); color: #ff9a54; background: rgba(255,118,25,.12); }
    .pp-picker-surprise {
      position: relative;
      z-index: 1;
      display: none;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      width: 100%;
      min-height: 50px;
      margin-top: auto;
      padding: 12px 14px;
      border: 1px solid rgba(255,255,255,.1);
      border-radius: 15px;
      color: #f7f8fa;
      background: rgba(255,255,255,.04);
      text-align: left;
      transition: .18s ease;
    }
    .pp-picker-surprise:hover { border-color: rgba(255,135,51,.4); background: rgba(255,118,25,.09); }
    .pp-picker-surprise strong, .pp-picker-surprise small { display: block; }
    .pp-picker-surprise strong { font-size: 12px; }
    .pp-picker-surprise small { margin-top: 2px; color: #8490a2; font-size: 10px; }
    .pp-picker-surprise > .pp-picker-icon { width: 19px; height: 19px; color: #ff8b39; }
    .pp-picker-main { min-width: 0; min-height: 0; overflow-y: auto; padding: 28px 34px 32px; }
    .pp-picker-content { min-height: 0; }
    .pp-picker-progress { display: flex; align-items: center; gap: 12px; margin-bottom: 22px; padding-right: 44px; }
    .pp-picker-progress-track { height: 4px; flex: 1; overflow: hidden; border-radius: 999px; background: rgba(255,255,255,.07); }
    .pp-picker-progress-fill { height: 100%; border-radius: inherit; background: linear-gradient(90deg, #ff6818, #ffad5e); box-shadow: 0 0 16px rgba(255,112,24,.3); transition: width .28s ease; }
    .pp-picker-progress-label { color: #7f8a9c; font-size: 11px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; }
    .pp-picker-eyebrow { margin: 0 0 8px; color: #ff8f43; font-size: 11px; font-weight: 750; letter-spacing: .13em; text-transform: uppercase; }
    .pp-picker-title { margin: 0; max-width: 660px; color: #fff; font-size: clamp(26px, 3.3vw, 38px); line-height: 1.12; letter-spacing: -.035em; font-weight: 720; }
    .pp-picker-description { margin: 10px 0 0; max-width: 600px; color: #929daf; font-size: 14px; line-height: 1.65; }
    .pp-picker-options { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; margin-top: 22px; }
    .pp-picker-option {
      position: relative;
      display: grid;
      grid-template-columns: 42px 1fr 18px;
      align-items: center;
      gap: 12px;
      min-height: 74px;
      padding: 14px;
      border: 1px solid rgba(255,255,255,.09);
      border-radius: 18px;
      color: #f4f6f8;
      background: rgba(255,255,255,.027);
      text-align: left;
      transition: transform .18s ease, border-color .18s ease, background .18s ease;
    }
    .pp-picker-option:hover { transform: translateY(-2px); border-color: rgba(255,133,49,.38); background: rgba(255,119,26,.065); }
    .pp-picker-option-icon { display: grid; width: 42px; height: 42px; place-items: center; border: 1px solid rgba(255,255,255,.085); border-radius: 13px; color: #ff9b55; background: rgba(255,255,255,.035); }
    .pp-picker-option strong, .pp-picker-option small { display: block; }
    .pp-picker-option strong { font-size: 14px; font-weight: 700; }
    .pp-picker-option small { margin-top: 3px; color: #7f8a9c; font-size: 11px; line-height: 1.35; }
    .pp-picker-option-radio { width: 16px; height: 16px; border: 1px solid rgba(255,255,255,.18); border-radius: 50%; }
    .pp-picker-option.is-selected { border-color: rgba(255,132,44,.58); background: linear-gradient(135deg, rgba(255,115,20,.13), rgba(255,255,255,.035)); box-shadow: inset 0 1px 0 rgba(255,255,255,.05); }
    .pp-picker-option.is-selected .pp-picker-option-radio { border: 4px solid #ff862f; background: #fff; }
    .pp-picker-actions { display: flex; align-items: center; gap: 10px; margin-top: 28px; }
    .pp-picker-button { display: inline-flex; min-height: 43px; align-items: center; justify-content: center; gap: 8px; padding: 0 16px; border: 1px solid rgba(255,255,255,.11); border-radius: 13px; color: #e7ebf1; background: rgba(255,255,255,.035); font-size: 12px; font-weight: 700; transition: .18s ease; }
    .pp-picker-button:hover { border-color: rgba(255,137,53,.38); background: rgba(255,120,28,.075); }
    .pp-picker-button:disabled { cursor: not-allowed; opacity: .58; transform: none; }
    .pp-picker-button--primary { border-color: rgba(255,133,46,.44); color: #fff; background: linear-gradient(135deg, #f66a16, #ff8c31); box-shadow: 0 12px 25px rgba(245,102,19,.19); }
    .pp-picker-button--primary:hover { background: linear-gradient(135deg, #ff7420, #ff9a45); }
    .pp-picker-results-head { display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; gap: 18px; }
    .pp-picker-answer-chips { display: flex; flex-wrap: wrap; gap: 7px; margin-top: 15px; }
    .pp-picker-chip { padding: 6px 9px; border: 1px solid rgba(255,136,54,.22); border-radius: 999px; color: #ff9c58; background: rgba(255,119,24,.075); font-size: 10px; font-weight: 700; }
    .pp-picker-results { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 13px; margin-top: 24px; }
    .pp-picker-result { min-width: 0; overflow: hidden; border: 1px solid rgba(255,255,255,.09); border-radius: 19px; background: rgba(255,255,255,.026); cursor: pointer; transition: transform .18s ease, border-color .18s ease; }
    .pp-picker-result:hover { transform: translateY(-3px); border-color: rgba(255,135,49,.34); }
    .pp-picker-result:focus-visible { outline: 2px solid rgba(255,132,44,.75); outline-offset: 3px; }
    .pp-picker-poster { position: relative; aspect-ratio: 2 / 2.72; overflow: hidden; background: #141923; }
    .pp-picker-poster img { width: 100%; height: 100%; object-fit: cover; }
    .pp-picker-poster::after { content: ""; position: absolute; inset: 45% 0 0; background: linear-gradient(transparent, rgba(7,9,14,.88)); pointer-events: none; }
    .pp-picker-rating { position: absolute; top: 10px; right: 10px; z-index: 1; display: flex; align-items: center; gap: 4px; padding: 5px 7px; border: 1px solid rgba(255,255,255,.14); border-radius: 9px; color: #fff; background: rgba(7,9,13,.72); -webkit-backdrop-filter: blur(10px); backdrop-filter: blur(10px); font-size: 10px; font-weight: 750; }
    .pp-picker-rating .pp-picker-icon { width: 12px; height: 12px; color: #ffc857; }
    .pp-picker-result-body { padding: 13px 13px 15px; }
    .pp-picker-result h4 { margin: 0; overflow: hidden; color: #fff; font-size: 13px; font-weight: 720; text-overflow: ellipsis; white-space: nowrap; }
    .pp-picker-meta { margin: 4px 0 0; color: #778296; font-size: 10px; }
    .pp-picker-reasons { display: flex; flex-wrap: wrap; gap: 5px; margin-top: 10px; }
    .pp-picker-reason { padding: 4px 6px; border-radius: 7px; color: #ff9a53; background: rgba(255,119,24,.085); font-size: 9px; font-weight: 700; }
    .pp-picker-summary { display: -webkit-box; min-height: 47px; margin: 10px 0 0; overflow: hidden; color: #8792a4; font-size: 10px; line-height: 1.55; -webkit-box-orient: vertical; -webkit-line-clamp: 3; }
    .pp-picker-empty { display: grid; min-height: 380px; place-items: center; text-align: center; }
    .pp-picker-empty-icon { display: grid; width: 52px; height: 52px; margin: 0 auto 17px; place-items: center; border: 1px solid rgba(255,137,53,.25); border-radius: 16px; color: #ff9450; background: rgba(255,119,24,.075); }
    .pp-picker-empty-icon .pp-picker-icon { width: 23px; height: 23px; }
    .pp-picker-spinner { width: 32px; height: 32px; margin: 0 auto 18px; border: 3px solid rgba(255,255,255,.1); border-top-color: #ff812d; border-radius: 50%; animation: pp-picker-spin .8s linear infinite; }
    .pp-picker-empty h3 { margin: 0; color: #fff; font-size: 21px; }
    .pp-picker-empty p { max-width: 380px; margin: 8px auto 0; color: #8792a4; font-size: 13px; line-height: 1.6; }
    @keyframes pp-picker-fade { from { opacity: 0; } }
    @keyframes pp-picker-rise { from { opacity: 0; transform: translateY(12px) scale(.985); } }
    @keyframes pp-picker-spin { to { transform: rotate(360deg); } }
    @media (max-width: 760px) {
      .pp-picker-backdrop { align-items: stretch; padding: 0; }
      .pp-picker-shell {
        display: grid;
        grid-template-columns: minmax(0, 1fr);
        grid-template-rows: auto minmax(0, 1fr);
        width: 100%;
        height: 100dvh;
        max-height: 100dvh;
        border-width: 0;
        border-radius: 0;
        overflow: hidden;
      }
      .pp-picker-close { position: fixed; top: 10px; right: 10px; width: 42px; height: 42px; border-radius: 14px; }
      .pp-picker-aside { min-height: 0; padding: 12px 14px 10px; border-right: 0; border-bottom: 1px solid rgba(255,255,255,.08); }
      .pp-picker-kicker { padding: 5px 8px; font-size: 9px; }
      .pp-picker-aside h2 { max-width: none; margin: 8px 50px 0 0; font-size: 21px; line-height: 1.08; }
      .pp-picker-aside-copy { display: none; }
      .pp-picker-steps, .pp-picker-surprise { display: none; }
      .pp-picker-main { min-height: 0; overflow-y: auto; padding: 14px 14px max(22px, env(safe-area-inset-bottom)); overscroll-behavior: contain; }
      .pp-picker-content { min-height: 0; }
      .pp-picker-progress { margin-bottom: 13px; padding-right: 0; }
      .pp-picker-progress-label { font-size: 9px; }
      .pp-picker-eyebrow { display: none; }
      .pp-picker-title { font-size: clamp(23px, 7.2vw, 28px); line-height: 1.1; }
      .pp-picker-description { margin-top: 7px; font-size: 12px; line-height: 1.45; }
      .pp-picker-options { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; margin-top: 14px; }
      .pp-picker-option { grid-template-columns: 32px minmax(0, 1fr); gap: 8px; min-height: 56px; padding: 9px; border-radius: 15px; }
      .pp-picker-option:hover { transform: none; }
      .pp-picker-option-icon { width: 32px; height: 32px; border-radius: 10px; }
      .pp-picker-option-icon .pp-picker-icon { width: 16px; height: 16px; }
      .pp-picker-option-copy { min-width: 0; }
      .pp-picker-option strong { overflow: hidden; font-size: 12px; text-overflow: ellipsis; white-space: nowrap; }
      .pp-picker-option small, .pp-picker-option-radio { display: none; }
      .pp-picker-actions { gap: 8px; margin-top: 18px; }
      .pp-picker-actions .pp-picker-button { flex: 1; }
      .pp-picker-results-head { display: block; }
      .pp-picker-results-head .pp-picker-button { width: 100%; margin-top: 13px; }
      .pp-picker-results-head .pp-picker-description, .pp-picker-answer-chips { display: none; }
      .pp-picker-results { grid-template-columns: 1fr; gap: 10px; margin-top: 12px; }
      .pp-picker-result { display: grid; grid-template-columns: 80px minmax(0, 1fr); min-height: 112px; }
      .pp-picker-result:hover { transform: none; }
      .pp-picker-poster { height: 100%; min-height: 112px; aspect-ratio: auto; }
      .pp-picker-result-body { align-self: center; padding: 12px; }
      .pp-picker-result h4 { font-size: 13px; }
      .pp-picker-reasons, .pp-picker-summary { display: none; }
      .pp-picker-empty { min-height: 320px; }
    }
    @media (max-width: 350px) {
      .pp-picker-option small { display: none; }
      .pp-picker-aside h2 { font-size: 20px; }
    }
    @media (prefers-reduced-motion: reduce) {
      .pp-picker-backdrop, .pp-picker-shell, .pp-picker-spinner { animation: none; }
      .pp-picker-option, .pp-picker-result, .pp-picker-button { transition: none; }
    }
  `;
  document.head.append(style);
}

function createPickerProgress() {
  const progress = pickerElement("div", { className: "pp-picker-progress" });
  const track = pickerElement("div", { className: "pp-picker-progress-track" });
  const fill = pickerElement("div", { className: "pp-picker-progress-fill" });
  const questions = pickerQuestions();
  const complete = watchPickerState.view === "results" || watchPickerState.view === "exhausted";
  fill.style.width = `${complete ? 100 : ((watchPickerState.step + 1) / questions.length) * 100}%`;
  track.append(fill);
  progress.append(
    track,
    pickerElement("span", {
      className: "pp-picker-progress-label",
      text:
        watchPickerState.view === "exhausted"
          ? "No more matches"
          : complete
            ? "Your picks"
            : `${watchPickerState.step + 1} of ${questions.length}`,
    }),
  );
  return progress;
}

function updatePickerAside() {
  const modal = document.querySelector("[data-plex-watch-picker]");
  const list = modal?.querySelector("[data-picker-steps]");
  if (!list) return;

  const labels = { genre: "Genre", runtime: "Length", era: "Era" };
  const options = { genre: pickerGenreOptions(), runtime: runtimeOptions, era: eraOptions };
  list.replaceChildren();
  pickerQuestions().forEach((question, index) => {
    const finished = watchPickerState.view === "results" || watchPickerState.view === "exhausted";
    const answered = finished || index < watchPickerState.step;
    const current = !finished && index === watchPickerState.step;
    const step = pickerElement("div", {
      className: `pp-picker-step${current ? " is-current" : ""}${answered ? " is-done" : ""}`,
    });
    const number = pickerElement("span", { className: "pp-picker-step-number" });
    if (answered) number.append(pickerIcon("check"));
    else number.textContent = String(index + 1);
    const copy = pickerElement("div");
    copy.append(
      pickerElement("strong", { text: labels[question.key] }),
      pickerElement("small", {
        text: answered || current
          ? pickerOptionLabel(watchPickerState.answers[question.key], options[question.key])
          : "Up next",
      }),
    );
    step.append(number, copy);
    list.append(step);
  });
}

function renderPickerLoading(content) {
  const empty = pickerElement("div", { className: "pp-picker-empty" });
  const wrapper = pickerElement("div");
  wrapper.append(
    pickerElement("div", { className: "pp-picker-spinner", attributes: { "aria-hidden": "true" } }),
    pickerElement("h3", { text: "Scanning the PlexPoint library" }),
    pickerElement("p", { text: "Building a fresh set of choices from the films available right now…" }),
  );
  empty.append(wrapper);
  content.append(empty);
}

function renderPickerError(content) {
  const empty = pickerElement("div", { className: "pp-picker-empty" });
  const wrapper = pickerElement("div");
  wrapper.append(
    pickerElement("h3", { text: "The picker needs a moment" }),
    pickerElement("p", {
      text: watchPickerState.loadError || "The movie library could not be loaded. Please try again shortly.",
    }),
  );
  const retry = pickerElement("button", {
    className: "pp-picker-button pp-picker-button--primary",
    text: "Try again",
    attributes: { type: "button" },
  });
  retry.style.marginTop = "18px";
  retry.addEventListener("click", async () => {
    watchPickerState.loadError = null;
    renderWatchPicker();
    try {
      await loadPickerMovies();
    } catch {
      // The error state is rendered below.
    }
    renderWatchPicker();
  });
  wrapper.append(retry);
  empty.append(wrapper);
  content.append(empty);
}

function renderPickerQuestion(content) {
  const questions = pickerQuestions();
  const question = questions[watchPickerState.step];
  if (!question) return;

  content.append(
    pickerElement("p", { className: "pp-picker-eyebrow", text: question.eyebrow }),
    pickerElement("h3", { className: "pp-picker-title", text: question.title }),
    pickerElement("p", { className: "pp-picker-description", text: question.description }),
  );

  const options = pickerElement("div", { className: "pp-picker-options" });
  for (const option of question.options) {
    const selected = watchPickerState.answers[question.key] === option.value;
    const button = pickerElement("button", {
      className: `pp-picker-option${selected ? " is-selected" : ""}`,
      attributes: {
        type: "button",
        "data-testid": `watch-picker-option-${option.value.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
        "aria-pressed": String(selected),
      },
    });
    const copy = pickerElement("span", { className: "pp-picker-option-copy" });
    copy.append(
      pickerElement("strong", { text: option.label }),
      pickerElement("small", { text: option.description }),
    );
    const optionIcon = pickerElement("span", { className: "pp-picker-option-icon" });
    optionIcon.append(pickerIcon(option.icon));
    button.append(
      optionIcon,
      copy,
      pickerElement("span", { className: "pp-picker-option-radio", attributes: { "aria-hidden": "true" } }),
    );
    button.addEventListener("click", () => {
      watchPickerState.answers[question.key] = option.value;
      if (watchPickerState.step < questions.length - 1) {
        watchPickerState.step += 1;
        watchPickerState.view = "question";
      } else {
        generatePickerRecommendations();
      }
      renderWatchPicker();
    });
    options.append(button);
  }
  content.append(options);

  if (watchPickerState.step > 0) {
    const actions = pickerElement("div", { className: "pp-picker-actions" });
    const back = pickerElement("button", {
      className: "pp-picker-button",
      text: "Back",
      attributes: { type: "button", "data-testid": "watch-picker-back" },
    });
    back.addEventListener("click", () => {
      watchPickerState.step -= 1;
      renderWatchPicker();
    });
    actions.append(back);
    content.append(actions);
  }
}

function createPickerResultCard(movie, index) {
  const card = pickerElement("article", {
    className: "pp-picker-result",
    attributes: {
      "data-testid": `watch-picker-result-${movie.id}`,
      role: "button",
      tabindex: "0",
      "aria-label": `View details for ${movie.title}`,
    },
  });
  const openDetails = () =>
    window.dispatchEvent(
      new CustomEvent("plexpoint:open-media-preview", {
        detail: { item: movie, mediaType: "movie" },
      }),
    );
  card.addEventListener("click", openDetails);
  card.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    openDetails();
  });
  const poster = pickerElement("div", { className: "pp-picker-poster" });
  poster.append(
    pickerElement("img", {
      attributes: {
        src: pickerPosterUrl(movie),
        alt: `${movie.title} poster`,
        loading: index === 0 ? "eager" : "lazy",
        decoding: "async",
        width: "420",
        height: "630",
      },
    }),
  );
  if (movie.rating != null) {
    const rating = pickerElement("span", { className: "pp-picker-rating" });
    rating.append(pickerIcon("star"), document.createTextNode(movie.rating.toFixed(1)));
    poster.append(rating);
  }

  const body = pickerElement("div", { className: "pp-picker-result-body" });
  const metadata = [movie.year ? String(Math.trunc(movie.year)) : null, pickerRuntimeLabel(movie.durationMinutes)]
    .filter(Boolean)
    .join(" • ");
  const reasons = pickerElement("div", { className: "pp-picker-reasons" });
  for (const reason of pickerMatchReasons(movie)) {
    reasons.append(pickerElement("span", { className: "pp-picker-reason", text: reason }));
  }
  body.append(
    pickerElement("h4", { text: movie.title }),
    pickerElement("p", { className: "pp-picker-meta", text: metadata || "Movie" }),
    reasons,
  );
  if (movie.summary) body.append(pickerElement("p", { className: "pp-picker-summary", text: movie.summary }));
  card.append(poster, body);
  return card;
}

function renderPickerResults(content) {
  const remainingMatches = pickerUnseenMatchingMovies().length;
  const pickCount = watchPickerState.currentPicks.length;
  const head = pickerElement("div", { className: "pp-picker-results-head" });
  const copy = pickerElement("div");
  copy.append(
    pickerElement("p", { className: "pp-picker-eyebrow", text: "Fresh from your library" }),
    pickerElement("h3", {
      className: "pp-picker-title",
      text: pickCount === 3 ? "Three picks. No repeats." : `${pickCount} final ${pickCount === 1 ? "pick" : "picks"}.`,
    }),
    pickerElement("p", {
      className: "pp-picker-description",
      text:
        remainingMatches === 0
          ? "There are no more unseen movies matching these choices. Change the choices or clear the seen list to begin again."
          : `${watchPickerState.history.size.toLocaleString()} different ${
              watchPickerState.history.size === 1 ? "film has" : "films have"
            } been recommended recently, and these picks avoid repeats.`,
    }),
  );
  const another = pickerElement("button", {
    className: "pp-picker-button pp-picker-button--primary",
    attributes: {
      type: "button",
      "data-testid": "watch-picker-another",
      ...(remainingMatches === 0 ? { disabled: "disabled" } : {}),
    },
  });
  const anotherLabel =
    remainingMatches === 0
      ? "No more matches"
      : remainingMatches < 3
        ? `Show final ${remainingMatches}`
        : "Another 3";
  another.append(
    pickerIcon(remainingMatches === 0 ? "search" : "refresh"),
    document.createTextNode(anotherLabel),
  );
  another.addEventListener("click", () => {
    generatePickerRecommendations();
    renderWatchPicker();
  });
  head.append(copy, another);
  content.append(head);

  const chips = pickerElement("div", { className: "pp-picker-answer-chips" });
  chips.append(
    pickerElement("span", {
      className: "pp-picker-chip",
      text:
        watchPickerState.answers.genre === "surprise" ? "Any genre" : watchPickerState.answers.genre,
    }),
    pickerElement("span", {
      className: "pp-picker-chip",
      text: pickerOptionLabel(watchPickerState.answers.runtime, runtimeOptions),
    }),
    pickerElement("span", {
      className: "pp-picker-chip",
      text: pickerOptionLabel(watchPickerState.answers.era, eraOptions),
    }),
  );
  content.append(chips);

  const results = pickerElement("div", { className: "pp-picker-results" });
  watchPickerState.currentPicks.forEach((movie, index) => results.append(createPickerResultCard(movie, index)));
  content.append(results);

  const actions = pickerElement("div", { className: "pp-picker-actions" });
  const edit = pickerElement("button", {
    className: "pp-picker-button",
    text: "Tweak choices",
    attributes: { type: "button", "data-testid": "watch-picker-edit" },
  });
  edit.addEventListener("click", () => {
    watchPickerState.step = 0;
    watchPickerState.view = "question";
    renderWatchPicker();
  });
  const reset = pickerElement("button", {
    className: "pp-picker-button",
    text: "Start over",
    attributes: { type: "button", "data-testid": "watch-picker-reset" },
  });
  reset.addEventListener("click", () => {
    watchPickerState.answers = { genre: "surprise", runtime: "any", era: "any" };
    watchPickerState.step = 0;
    watchPickerState.view = "question";
    watchPickerState.currentPicks = [];
    watchPickerState.history.clear();
    savePickerHistory();
    renderWatchPicker();
  });
  actions.append(edit, reset);
  content.append(actions);
}

function renderPickerExhausted(content) {
  const empty = pickerElement("div", { className: "pp-picker-empty" });
  const wrapper = pickerElement("div");
  const icon = pickerElement("div", { className: "pp-picker-empty-icon" });
  icon.append(pickerIcon("search"));
  wrapper.append(
    icon,
    pickerElement("h3", { text: "No more matching movies" }),
    pickerElement("p", {
      text: "There are no more unseen movies matching those choices. Change the choices, or clear the seen list to recommend them again.",
    }),
  );

  const actions = pickerElement("div", { className: "pp-picker-actions" });
  actions.style.justifyContent = "center";
  const edit = pickerElement("button", {
    className: "pp-picker-button pp-picker-button--primary",
    text: "Change choices",
    attributes: { type: "button", "data-testid": "watch-picker-exhausted-edit" },
  });
  edit.addEventListener("click", () => {
    watchPickerState.step = 0;
    watchPickerState.view = "question";
    renderWatchPicker();
  });
  const clear = pickerElement("button", {
    className: "pp-picker-button",
    text: "Clear seen list",
    attributes: { type: "button", "data-testid": "watch-picker-exhausted-clear" },
  });
  clear.addEventListener("click", () => {
    watchPickerState.history.clear();
    watchPickerState.currentPicks = [];
    watchPickerState.step = 0;
    watchPickerState.view = "question";
    savePickerHistory();
    renderWatchPicker();
  });
  actions.append(edit, clear);
  wrapper.append(actions);
  empty.append(wrapper);
  content.append(empty);
}

function renderWatchPicker() {
  const modal = document.querySelector("[data-plex-watch-picker]");
  const content = modal?.querySelector("[data-picker-content]");
  if (!content) return;
  content.replaceChildren(createPickerProgress());
  updatePickerAside();

  if (watchPickerState.loadPromise && !watchPickerState.movies) {
    renderPickerLoading(content);
  } else if (watchPickerState.loadError) {
    renderPickerError(content);
  } else if (!watchPickerState.movies) {
    renderPickerLoading(content);
  } else if (watchPickerState.view === "results") {
    renderPickerResults(content);
  } else if (watchPickerState.view === "exhausted") {
    renderPickerExhausted(content);
  } else {
    renderPickerQuestion(content);
  }
}

function closeWatchPicker() {
  const modal = document.querySelector("[data-plex-watch-picker]");
  if (!modal) return;
  modal.remove();
  document.removeEventListener("keydown", handlePickerKeyboard);
  document.body.style.overflow = watchPickerState.previousBodyOverflow;
  watchPickerState.trigger?.focus?.();
  watchPickerState.trigger = null;
}

function handlePickerKeyboard(event) {
  const modal = document.querySelector("[data-plex-watch-picker]");
  if (!modal) return;
  if (event.key === "Escape") {
    event.preventDefault();
    closeWatchPicker();
    return;
  }
  if (event.key !== "Tab") return;

  const focusable = [...modal.querySelectorAll("button:not([disabled]), a[href], input, select")].filter(
    (element) => element.getClientRects().length > 0,
  );
  if (focusable.length === 0) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

async function openWatchPicker(trigger) {
  if (document.querySelector("[data-plex-watch-picker]")) return;
  injectWatchPickerStyles();
  readPickerHistory();
  watchPickerState.trigger = trigger;
  watchPickerState.step = 0;
  watchPickerState.view = "question";
  watchPickerState.currentPicks = [];
  watchPickerState.previousBodyOverflow = document.body.style.overflow;
  document.body.style.overflow = "hidden";

  const backdrop = pickerElement("div", {
    className: "pp-picker-backdrop",
    attributes: { "data-plex-watch-picker": "true" },
  });
  const shell = pickerElement("section", {
    className: "pp-picker-shell",
    attributes: {
      role: "dialog",
      "aria-modal": "true",
      "aria-labelledby": "plex-watch-picker-title",
      "data-testid": "plex-watch-picker",
    },
  });
  const close = pickerElement("button", {
    className: "pp-picker-close",
    attributes: { type: "button", "aria-label": "Close watch picker", "data-testid": "watch-picker-close" },
  });
  close.append(pickerIcon("close"));
  close.addEventListener("click", closeWatchPicker);

  const aside = pickerElement("aside", { className: "pp-picker-aside" });
  const brand = pickerElement("div", { className: "pp-picker-brand" });
  const kicker = pickerElement("div", { className: "pp-picker-kicker" });
  kicker.append(
    pickerElement("span", { className: "pp-picker-kicker-dot", attributes: { "aria-hidden": "true" } }),
    pickerElement("span", { text: "PlexPoint picker" }),
  );
  brand.append(
    kicker,
    pickerElement("h2", { text: "Find tonight’s winner", attributes: { id: "plex-watch-picker-title" } }),
    pickerElement("p", {
      className: "pp-picker-aside-copy",
      text: "Three quick choices, then fresh recommendations from what’s actually available on PlexPoint.",
    }),
  );
  const steps = pickerElement("div", { className: "pp-picker-steps", attributes: { "data-picker-steps": "true" } });
  const surprise = pickerElement("button", {
    className: "pp-picker-surprise",
    attributes: { type: "button", "data-testid": "watch-picker-instant" },
  });
  const surpriseCopy = pickerElement("span");
  surpriseCopy.append(
    pickerElement("strong", { text: "Skip the questions" }),
    pickerElement("small", { text: "Give me three wildcards" }),
  );
  surprise.append(surpriseCopy, pickerIcon("shuffle"));
  surprise.addEventListener("click", () => {
    watchPickerState.answers = { genre: "surprise", runtime: "any", era: "any" };
    generatePickerRecommendations();
    renderWatchPicker();
  });
  aside.append(brand, steps, surprise);

  const main = pickerElement("main", { className: "pp-picker-main" });
  const content = pickerElement("div", {
    className: "pp-picker-content",
    attributes: { "data-picker-content": "true" },
  });
  main.append(content);
  shell.append(close, aside, main);
  backdrop.append(shell);
  backdrop.addEventListener("click", (event) => {
    if (event.target === backdrop) closeWatchPicker();
  });
  document.body.append(backdrop);
  document.addEventListener("keydown", handlePickerKeyboard);
  renderWatchPicker();
  close.focus();

  try {
    await loadPickerMovies();
  } catch {
    // The picker renders a recoverable error state.
  }
  renderWatchPicker();
}

function enhanceWatchPickerTrigger() {
  const trigger = document.querySelector('[data-testid="open-movie-quiz"]');
  if (!trigger) return;
  trigger.dataset.plexWatchPickerTrigger = "true";
  trigger.setAttribute("aria-haspopup", "dialog");
  trigger.title = "Get three fresh movie recommendations";

  for (const node of trigger.childNodes) {
    if (node.nodeType !== Node.TEXT_NODE) continue;
    if (node.textContent?.includes("Not sure what to watch?")) node.textContent = "Pick something for me";
  }
}

document.addEventListener(
  "click",
  (event) => {
    const trigger = event.target.closest?.('[data-testid="open-movie-quiz"]');
    if (!trigger) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    void openWatchPicker(trigger);
  },
  true,
);

injectWatchPickerStyles();
enhanceWatchPickerTrigger();
new MutationObserver(enhanceWatchPickerTrigger).observe(document.body, { childList: true, subtree: true });
