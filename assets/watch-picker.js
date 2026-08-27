const WATCH_PICKER_HISTORY_KEY = "plexpoint-watch-picker-history-v1";
const WATCH_PICKER_MAX_HISTORY = 120;

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
  { value: "any", label: "Any length", description: "Keep the evening flexible", icon: "✦" },
  { value: "short", label: "Quick watch", description: "Under 100 minutes", icon: "↗" },
  { value: "standard", label: "Movie night", description: "100–130 minutes", icon: "◒" },
  { value: "epic", label: "Go big", description: "More than 130 minutes", icon: "◆" },
];

const eraOptions = [
  { value: "any", label: "Any era", description: "Let the picker decide", icon: "✦" },
  { value: "classic", label: "Throwback", description: "Released before 2000", icon: "◴" },
  { value: "modern", label: "Modern", description: "Released from 2000–2019", icon: "◫" },
  { value: "recent", label: "Fresh", description: "Released in 2020 or later", icon: "●" },
];

const genreIcons = {
  action: "⚡",
  adventure: "⌁",
  animation: "◇",
  comedy: "☺",
  crime: "◎",
  documentary: "▣",
  drama: "◐",
  family: "♡",
  fantasy: "✧",
  horror: "◑",
  mystery: "?",
  romance: "♥",
  "science fiction": "◉",
  thriller: "△",
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
    const stored = JSON.parse(sessionStorage.getItem(WATCH_PICKER_HISTORY_KEY) || "[]");
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
    sessionStorage.setItem(
      WATCH_PICKER_HISTORY_KEY,
      JSON.stringify([...watchPickerState.history].slice(-WATCH_PICKER_MAX_HISTORY)),
    );
  } catch {
    // The picker still works when session storage is unavailable.
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
      icon: genreIcons[genre.toLowerCase()] || "○",
    }));

  return [
    { value: "surprise", label: "Surprise me", description: "Open up the whole library", icon: "✦" },
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
  const movies = watchPickerState.movies || [];
  const currentKeys = new Set(watchPickerState.currentPicks.map(pickerMovieKey));
  let candidates = movies.filter(
    (movie) => !watchPickerState.history.has(pickerMovieKey(movie)) && !currentKeys.has(pickerMovieKey(movie)),
  );

  if (candidates.length < 3) {
    watchPickerState.history = new Set(currentKeys);
    candidates = movies.filter((movie) => !currentKeys.has(pickerMovieKey(movie)));
  }
  if (candidates.length < 3) candidates = movies;

  watchPickerState.shuffle += 1;
  watchPickerState.currentPicks = selectDiversePickerMovies(candidates, 3);
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
      grid-template-columns: minmax(250px, 310px) minmax(0, 1fr);
      width: min(1080px, 96vw);
      height: min(760px, calc(100dvh - 28px));
      max-height: min(760px, calc(100dvh - 28px));
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
    .pp-picker-aside {
      position: relative;
      display: flex;
      min-height: 590px;
      flex-direction: column;
      overflow: clip;
      padding: 32px 28px 28px;
      border-right: 1px solid rgba(255,255,255,.08);
      background:
        radial-gradient(circle at 0% 0%, rgba(255,126,37,.28), transparent 38%),
        radial-gradient(circle at 100% 100%, rgba(123,45,255,.14), transparent 42%),
        rgba(255,255,255,.018);
    }
    .pp-picker-aside::after {
      content: "";
      position: absolute;
      right: -80px;
      bottom: -95px;
      width: 260px;
      height: 260px;
      border: 52px solid rgba(255,123,25,.055);
      border-radius: 50%;
      pointer-events: none;
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
    .pp-picker-aside h2 { margin: 22px 0 10px; max-width: 250px; font-size: clamp(28px, 3vw, 40px); line-height: 1.04; letter-spacing: -.035em; font-weight: 720; }
    .pp-picker-aside-copy { max-width: 250px; color: #aeb8c7; font-size: 14px; line-height: 1.65; }
    .pp-picker-steps { display: grid; gap: 10px; margin: 30px 0 0; }
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
      display: flex;
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
    .pp-picker-surprise span:last-child { color: #ff8b39; font-size: 19px; }
    .pp-picker-main { min-width: 0; min-height: 0; overflow-y: auto; padding: 46px 42px 36px; }
    .pp-picker-content { min-height: 500px; }
    .pp-picker-progress { display: flex; align-items: center; gap: 12px; margin-bottom: 30px; padding-right: 44px; }
    .pp-picker-progress-track { height: 4px; flex: 1; overflow: hidden; border-radius: 999px; background: rgba(255,255,255,.07); }
    .pp-picker-progress-fill { height: 100%; border-radius: inherit; background: linear-gradient(90deg, #ff6818, #ffad5e); box-shadow: 0 0 16px rgba(255,112,24,.3); transition: width .28s ease; }
    .pp-picker-progress-label { color: #7f8a9c; font-size: 11px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; }
    .pp-picker-eyebrow { margin: 0 0 8px; color: #ff8f43; font-size: 11px; font-weight: 750; letter-spacing: .13em; text-transform: uppercase; }
    .pp-picker-title { margin: 0; max-width: 660px; color: #fff; font-size: clamp(26px, 3.3vw, 38px); line-height: 1.12; letter-spacing: -.035em; font-weight: 720; }
    .pp-picker-description { margin: 10px 0 0; max-width: 600px; color: #929daf; font-size: 14px; line-height: 1.65; }
    .pp-picker-options { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; margin-top: 27px; }
    .pp-picker-option {
      position: relative;
      display: grid;
      grid-template-columns: 42px 1fr 18px;
      align-items: center;
      gap: 12px;
      min-height: 82px;
      padding: 14px;
      border: 1px solid rgba(255,255,255,.09);
      border-radius: 18px;
      color: #f4f6f8;
      background: rgba(255,255,255,.027);
      text-align: left;
      transition: transform .18s ease, border-color .18s ease, background .18s ease;
    }
    .pp-picker-option:hover { transform: translateY(-2px); border-color: rgba(255,133,49,.38); background: rgba(255,119,26,.065); }
    .pp-picker-option-icon { display: grid; width: 42px; height: 42px; place-items: center; border: 1px solid rgba(255,255,255,.085); border-radius: 13px; color: #ff9b55; background: rgba(255,255,255,.035); font-size: 17px; }
    .pp-picker-option strong, .pp-picker-option small { display: block; }
    .pp-picker-option strong { font-size: 14px; font-weight: 700; }
    .pp-picker-option small { margin-top: 3px; color: #7f8a9c; font-size: 11px; line-height: 1.35; }
    .pp-picker-option-radio { width: 16px; height: 16px; border: 1px solid rgba(255,255,255,.18); border-radius: 50%; }
    .pp-picker-option.is-selected { border-color: rgba(255,132,44,.58); background: linear-gradient(135deg, rgba(255,115,20,.13), rgba(255,255,255,.035)); box-shadow: inset 0 1px 0 rgba(255,255,255,.05); }
    .pp-picker-option.is-selected .pp-picker-option-radio { border: 4px solid #ff862f; background: #fff; }
    .pp-picker-actions { display: flex; align-items: center; gap: 10px; margin-top: 28px; }
    .pp-picker-button { display: inline-flex; min-height: 43px; align-items: center; justify-content: center; gap: 8px; padding: 0 16px; border: 1px solid rgba(255,255,255,.11); border-radius: 13px; color: #e7ebf1; background: rgba(255,255,255,.035); font-size: 12px; font-weight: 700; transition: .18s ease; }
    .pp-picker-button:hover { border-color: rgba(255,137,53,.38); background: rgba(255,120,28,.075); }
    .pp-picker-button--primary { border-color: rgba(255,133,46,.44); color: #fff; background: linear-gradient(135deg, #f66a16, #ff8c31); box-shadow: 0 12px 25px rgba(245,102,19,.19); }
    .pp-picker-button--primary:hover { background: linear-gradient(135deg, #ff7420, #ff9a45); }
    .pp-picker-results-head { display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; gap: 18px; }
    .pp-picker-answer-chips { display: flex; flex-wrap: wrap; gap: 7px; margin-top: 15px; }
    .pp-picker-chip { padding: 6px 9px; border: 1px solid rgba(255,136,54,.22); border-radius: 999px; color: #ff9c58; background: rgba(255,119,24,.075); font-size: 10px; font-weight: 700; }
    .pp-picker-results { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 13px; margin-top: 24px; }
    .pp-picker-result { min-width: 0; overflow: hidden; border: 1px solid rgba(255,255,255,.09); border-radius: 19px; background: rgba(255,255,255,.026); transition: transform .18s ease, border-color .18s ease; }
    .pp-picker-result:hover { transform: translateY(-3px); border-color: rgba(255,135,49,.34); }
    .pp-picker-poster { position: relative; aspect-ratio: 2 / 2.72; overflow: hidden; background: #141923; }
    .pp-picker-poster img { width: 100%; height: 100%; object-fit: cover; }
    .pp-picker-poster::after { content: ""; position: absolute; inset: 45% 0 0; background: linear-gradient(transparent, rgba(7,9,14,.88)); pointer-events: none; }
    .pp-picker-rating { position: absolute; top: 10px; right: 10px; z-index: 1; display: flex; align-items: center; gap: 4px; padding: 5px 7px; border: 1px solid rgba(255,255,255,.14); border-radius: 9px; color: #fff; background: rgba(7,9,13,.72); -webkit-backdrop-filter: blur(10px); backdrop-filter: blur(10px); font-size: 10px; font-weight: 750; }
    .pp-picker-result-body { padding: 13px 13px 15px; }
    .pp-picker-result h4 { margin: 0; overflow: hidden; color: #fff; font-size: 13px; font-weight: 720; text-overflow: ellipsis; white-space: nowrap; }
    .pp-picker-meta { margin: 4px 0 0; color: #778296; font-size: 10px; }
    .pp-picker-reasons { display: flex; flex-wrap: wrap; gap: 5px; margin-top: 10px; }
    .pp-picker-reason { padding: 4px 6px; border-radius: 7px; color: #ff9a53; background: rgba(255,119,24,.085); font-size: 9px; font-weight: 700; }
    .pp-picker-summary { display: -webkit-box; min-height: 47px; margin: 10px 0 0; overflow: hidden; color: #8792a4; font-size: 10px; line-height: 1.55; -webkit-box-orient: vertical; -webkit-line-clamp: 3; }
    .pp-picker-empty { display: grid; min-height: 380px; place-items: center; text-align: center; }
    .pp-picker-spinner { width: 32px; height: 32px; margin: 0 auto 18px; border: 3px solid rgba(255,255,255,.1); border-top-color: #ff812d; border-radius: 50%; animation: pp-picker-spin .8s linear infinite; }
    .pp-picker-empty h3 { margin: 0; color: #fff; font-size: 21px; }
    .pp-picker-empty p { max-width: 380px; margin: 8px auto 0; color: #8792a4; font-size: 13px; line-height: 1.6; }
    @keyframes pp-picker-fade { from { opacity: 0; } }
    @keyframes pp-picker-rise { from { opacity: 0; transform: translateY(12px) scale(.985); } }
    @keyframes pp-picker-spin { to { transform: rotate(360deg); } }
    @media (max-width: 760px) {
      .pp-picker-backdrop { padding: 8px; align-items: end; }
      .pp-picker-shell { display: block; width: 100%; height: auto; max-height: calc(100dvh - 8px); border-radius: 24px 24px 0 0; overflow-y: auto; }
      .pp-picker-aside { min-height: 0; padding: 24px 20px 18px; border-right: 0; border-bottom: 1px solid rgba(255,255,255,.08); }
      .pp-picker-aside h2 { max-width: none; margin: 14px 45px 6px 0; font-size: 28px; }
      .pp-picker-aside-copy { max-width: 520px; font-size: 12px; }
      .pp-picker-steps { grid-template-columns: repeat(3, 1fr); gap: 6px; margin-top: 18px; }
      .pp-picker-step { display: flex; min-width: 0; min-height: 38px; gap: 7px; padding: 5px; }
      .pp-picker-step-number { width: 27px; height: 27px; flex: 0 0 auto; }
      .pp-picker-step strong { font-size: 10px; }
      .pp-picker-step small { display: none; }
      .pp-picker-surprise { display: none; }
      .pp-picker-main { overflow: visible; padding: 24px 18px 26px; }
      .pp-picker-content { min-height: 0; }
      .pp-picker-progress { margin-bottom: 22px; padding-right: 0; }
      .pp-picker-options { grid-template-columns: 1fr; gap: 9px; margin-top: 21px; }
      .pp-picker-option { min-height: 70px; }
      .pp-picker-results-head { display: block; }
      .pp-picker-results-head .pp-picker-button { margin-top: 15px; }
      .pp-picker-results { grid-template-columns: 1fr; }
      .pp-picker-result { display: grid; grid-template-columns: 88px 1fr; }
      .pp-picker-poster { height: 100%; min-height: 132px; aspect-ratio: auto; }
      .pp-picker-result-body { align-self: center; }
      .pp-picker-summary { min-height: 0; -webkit-line-clamp: 2; }
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
  const complete = watchPickerState.view === "results";
  fill.style.width = `${complete ? 100 : ((watchPickerState.step + 1) / questions.length) * 100}%`;
  track.append(fill);
  progress.append(
    track,
    pickerElement("span", {
      className: "pp-picker-progress-label",
      text: complete ? "Your picks" : `${watchPickerState.step + 1} of ${questions.length}`,
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
    const answered = watchPickerState.view === "results" || index < watchPickerState.step;
    const current = watchPickerState.view !== "results" && index === watchPickerState.step;
    const step = pickerElement("div", {
      className: `pp-picker-step${current ? " is-current" : ""}${answered ? " is-done" : ""}`,
    });
    const number = pickerElement("span", {
      className: "pp-picker-step-number",
      text: answered ? "✓" : String(index + 1),
    });
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
    const copy = pickerElement("span");
    copy.append(
      pickerElement("strong", { text: option.label }),
      pickerElement("small", { text: option.description }),
    );
    button.append(
      pickerElement("span", { className: "pp-picker-option-icon", text: option.icon }),
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
      text: "← Back",
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
    attributes: { "data-testid": `watch-picker-result-${movie.id}` },
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
    poster.append(
      pickerElement("span", {
        className: "pp-picker-rating",
        text: `★ ${movie.rating.toFixed(1)}`,
      }),
    );
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
  const head = pickerElement("div", { className: "pp-picker-results-head" });
  const copy = pickerElement("div");
  copy.append(
    pickerElement("p", { className: "pp-picker-eyebrow", text: "Fresh from your library" }),
    pickerElement("h3", { className: "pp-picker-title", text: "Three picks. No repeats." }),
    pickerElement("p", {
      className: "pp-picker-description",
      text: `${watchPickerState.history.size.toLocaleString()} different ${
        watchPickerState.history.size === 1 ? "film has" : "films have"
      } been recommended this session.`,
    }),
  );
  const another = pickerElement("button", {
    className: "pp-picker-button pp-picker-button--primary",
    text: "↻ Another 3",
    attributes: { type: "button", "data-testid": "watch-picker-another" },
  });
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
    text: "×",
    attributes: { type: "button", "aria-label": "Close watch picker", "data-testid": "watch-picker-close" },
  });
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
  surprise.append(surpriseCopy, pickerElement("span", { text: "✦", attributes: { "aria-hidden": "true" } }));
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
