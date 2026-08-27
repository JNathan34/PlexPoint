var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __name = (target, value) =>
  __defProp(target, "name", { value, configurable: true });
var __esm = (fn, res, err) =>
  function __init() {
    if (err) throw err[0];
    try {
      return (fn && (res = (0, fn[__getOwnPropNames(fn)[0]])((fn = 0))), res);
    } catch (e) {
      throw ((err = [e]), e);
    }
  };
var __commonJS = (cb, mod) =>
  function __require() {
    try {
      return (
        mod ||
          (0, cb[__getOwnPropNames(cb)[0]])(
            (mod = { exports: {} }).exports,
            mod,
          ),
        mod.exports
      );
    } catch (e) {
      throw ((mod = 0), e);
    }
  };
var __copyProps = (to, from, except, desc) => {
  if ((from && typeof from === "object") || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, {
          get: () => from[key],
          enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable,
        });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (
  (target = mod != null ? __create(__getProtoOf(mod)) : {}),
  __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule
      ? __defProp(target, "default", { value: mod, enumerable: true })
      : target,
    mod,
  )
);

// ../node_modules/unenv/dist/runtime/_internal/utils.mjs
// @__NO_SIDE_EFFECTS__
function createNotImplementedError(name) {
  return new Error(`[unenv] ${name} is not implemented yet!`);
}
// @__NO_SIDE_EFFECTS__
function notImplemented(name) {
  const fn = /* @__PURE__ */ __name(() => {
    throw /* @__PURE__ */ createNotImplementedError(name);
  }, "fn");
  return Object.assign(fn, { __unenv__: true });
}
// @__NO_SIDE_EFFECTS__
function notImplementedClass(name) {
  return class {
    __unenv__ = true;
    constructor() {
      throw new Error(`[unenv] ${name} is not implemented yet!`);
    }
  };
}
var init_utils = __esm({
  "../node_modules/unenv/dist/runtime/_internal/utils.mjs"() {
    init_functionsRoutes_0_5277810449847653();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    __name(createNotImplementedError, "createNotImplementedError");
    __name(notImplemented, "notImplemented");
    __name(notImplementedClass, "notImplementedClass");
  },
});

// ../node_modules/unenv/dist/runtime/node/internal/perf_hooks/performance.mjs
var _timeOrigin,
  _performanceNow,
  nodeTiming,
  PerformanceEntry,
  PerformanceMark,
  PerformanceMeasure,
  PerformanceResourceTiming,
  PerformanceObserverEntryList,
  Performance,
  PerformanceObserver,
  performance;
var init_performance = __esm({
  "../node_modules/unenv/dist/runtime/node/internal/perf_hooks/performance.mjs"() {
    init_functionsRoutes_0_5277810449847653();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    init_utils();
    _timeOrigin = globalThis.performance?.timeOrigin ?? Date.now();
    _performanceNow = globalThis.performance?.now
      ? globalThis.performance.now.bind(globalThis.performance)
      : () => Date.now() - _timeOrigin;
    nodeTiming = {
      name: "node",
      entryType: "node",
      startTime: 0,
      duration: 0,
      nodeStart: 0,
      v8Start: 0,
      bootstrapComplete: 0,
      environment: 0,
      loopStart: 0,
      loopExit: 0,
      idleTime: 0,
      uvMetricsInfo: {
        loopCount: 0,
        events: 0,
        eventsWaiting: 0,
      },
      detail: void 0,
      toJSON() {
        return this;
      },
    };
    PerformanceEntry = class {
      static {
        __name(this, "PerformanceEntry");
      }
      __unenv__ = true;
      detail;
      entryType = "event";
      name;
      startTime;
      constructor(name, options) {
        this.name = name;
        this.startTime = options?.startTime || _performanceNow();
        this.detail = options?.detail;
      }
      get duration() {
        return _performanceNow() - this.startTime;
      }
      toJSON() {
        return {
          name: this.name,
          entryType: this.entryType,
          startTime: this.startTime,
          duration: this.duration,
          detail: this.detail,
        };
      }
    };
    PerformanceMark = class PerformanceMark2 extends PerformanceEntry {
      static {
        __name(this, "PerformanceMark");
      }
      entryType = "mark";
      constructor() {
        super(...arguments);
      }
      get duration() {
        return 0;
      }
    };
    PerformanceMeasure = class extends PerformanceEntry {
      static {
        __name(this, "PerformanceMeasure");
      }
      entryType = "measure";
    };
    PerformanceResourceTiming = class extends PerformanceEntry {
      static {
        __name(this, "PerformanceResourceTiming");
      }
      entryType = "resource";
      serverTiming = [];
      connectEnd = 0;
      connectStart = 0;
      decodedBodySize = 0;
      domainLookupEnd = 0;
      domainLookupStart = 0;
      encodedBodySize = 0;
      fetchStart = 0;
      initiatorType = "";
      name = "";
      nextHopProtocol = "";
      redirectEnd = 0;
      redirectStart = 0;
      requestStart = 0;
      responseEnd = 0;
      responseStart = 0;
      secureConnectionStart = 0;
      startTime = 0;
      transferSize = 0;
      workerStart = 0;
      responseStatus = 0;
    };
    PerformanceObserverEntryList = class {
      static {
        __name(this, "PerformanceObserverEntryList");
      }
      __unenv__ = true;
      getEntries() {
        return [];
      }
      getEntriesByName(_name, _type) {
        return [];
      }
      getEntriesByType(type) {
        return [];
      }
    };
    Performance = class {
      static {
        __name(this, "Performance");
      }
      __unenv__ = true;
      timeOrigin = _timeOrigin;
      eventCounts = /* @__PURE__ */ new Map();
      _entries = [];
      _resourceTimingBufferSize = 0;
      navigation = void 0;
      timing = void 0;
      timerify(_fn, _options) {
        throw createNotImplementedError("Performance.timerify");
      }
      get nodeTiming() {
        return nodeTiming;
      }
      eventLoopUtilization() {
        return {};
      }
      markResourceTiming() {
        return new PerformanceResourceTiming("");
      }
      onresourcetimingbufferfull = null;
      now() {
        if (this.timeOrigin === _timeOrigin) {
          return _performanceNow();
        }
        return Date.now() - this.timeOrigin;
      }
      clearMarks(markName) {
        this._entries = markName
          ? this._entries.filter((e) => e.name !== markName)
          : this._entries.filter((e) => e.entryType !== "mark");
      }
      clearMeasures(measureName) {
        this._entries = measureName
          ? this._entries.filter((e) => e.name !== measureName)
          : this._entries.filter((e) => e.entryType !== "measure");
      }
      clearResourceTimings() {
        this._entries = this._entries.filter(
          (e) => e.entryType !== "resource" || e.entryType !== "navigation",
        );
      }
      getEntries() {
        return this._entries;
      }
      getEntriesByName(name, type) {
        return this._entries.filter(
          (e) => e.name === name && (!type || e.entryType === type),
        );
      }
      getEntriesByType(type) {
        return this._entries.filter((e) => e.entryType === type);
      }
      mark(name, options) {
        const entry = new PerformanceMark(name, options);
        this._entries.push(entry);
        return entry;
      }
      measure(measureName, startOrMeasureOptions, endMark) {
        let start;
        let end;
        if (typeof startOrMeasureOptions === "string") {
          start = this.getEntriesByName(startOrMeasureOptions, "mark")[0]
            ?.startTime;
          end = this.getEntriesByName(endMark, "mark")[0]?.startTime;
        } else {
          start = Number.parseFloat(startOrMeasureOptions?.start) || this.now();
          end = Number.parseFloat(startOrMeasureOptions?.end) || this.now();
        }
        const entry = new PerformanceMeasure(measureName, {
          startTime: start,
          detail: {
            start,
            end,
          },
        });
        this._entries.push(entry);
        return entry;
      }
      setResourceTimingBufferSize(maxSize) {
        this._resourceTimingBufferSize = maxSize;
      }
      addEventListener(type, listener, options) {
        throw createNotImplementedError("Performance.addEventListener");
      }
      removeEventListener(type, listener, options) {
        throw createNotImplementedError("Performance.removeEventListener");
      }
      dispatchEvent(event) {
        throw createNotImplementedError("Performance.dispatchEvent");
      }
      toJSON() {
        return this;
      }
    };
    PerformanceObserver = class {
      static {
        __name(this, "PerformanceObserver");
      }
      __unenv__ = true;
      static supportedEntryTypes = [];
      _callback = null;
      constructor(callback) {
        this._callback = callback;
      }
      takeRecords() {
        return [];
      }
      disconnect() {
        throw createNotImplementedError("PerformanceObserver.disconnect");
      }
      observe(options) {
        throw createNotImplementedError("PerformanceObserver.observe");
      }
      bind(fn) {
        return fn;
      }
      runInAsyncScope(fn, thisArg, ...args) {
        return fn.call(thisArg, ...args);
      }
      asyncId() {
        return 0;
      }
      triggerAsyncId() {
        return 0;
      }
      emitDestroy() {
        return this;
      }
    };
    performance =
      globalThis.performance && "addEventListener" in globalThis.performance
        ? globalThis.performance
        : new Performance();
  },
});

// ../node_modules/unenv/dist/runtime/node/perf_hooks.mjs
var init_perf_hooks = __esm({
  "../node_modules/unenv/dist/runtime/node/perf_hooks.mjs"() {
    init_functionsRoutes_0_5277810449847653();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    init_performance();
  },
});

// ../node_modules/@cloudflare/unenv-preset/dist/runtime/polyfill/performance.mjs
var init_performance2 = __esm({
  "../node_modules/@cloudflare/unenv-preset/dist/runtime/polyfill/performance.mjs"() {
    init_perf_hooks();
    if (!("__unenv__" in performance)) {
      const proto = Performance.prototype;
      for (const key of Object.getOwnPropertyNames(proto)) {
        if (key !== "constructor" && !(key in performance)) {
          const desc = Object.getOwnPropertyDescriptor(proto, key);
          if (desc) {
            Object.defineProperty(performance, key, desc);
          }
        }
      }
    }
    globalThis.performance = performance;
    globalThis.Performance = Performance;
    globalThis.PerformanceEntry = PerformanceEntry;
    globalThis.PerformanceMark = PerformanceMark;
    globalThis.PerformanceMeasure = PerformanceMeasure;
    globalThis.PerformanceObserver = PerformanceObserver;
    globalThis.PerformanceObserverEntryList = PerformanceObserverEntryList;
    globalThis.PerformanceResourceTiming = PerformanceResourceTiming;
  },
});

// ../node_modules/unenv/dist/runtime/mock/noop.mjs
var noop_default;
var init_noop = __esm({
  "../node_modules/unenv/dist/runtime/mock/noop.mjs"() {
    init_functionsRoutes_0_5277810449847653();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    noop_default = Object.assign(() => {}, { __unenv__: true });
  },
});

// ../node_modules/unenv/dist/runtime/node/console.mjs
import { Writable } from "node:stream";
var _console,
  _ignoreErrors,
  _stderr,
  _stdout,
  log,
  info,
  trace,
  debug,
  table,
  error,
  warn,
  createTask,
  clear,
  count,
  countReset,
  dir,
  dirxml,
  group,
  groupEnd,
  groupCollapsed,
  profile,
  profileEnd,
  time,
  timeEnd,
  timeLog,
  timeStamp,
  Console,
  _times,
  _stdoutErrorHandler,
  _stderrErrorHandler;
var init_console = __esm({
  "../node_modules/unenv/dist/runtime/node/console.mjs"() {
    init_functionsRoutes_0_5277810449847653();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    init_noop();
    init_utils();
    _console = globalThis.console;
    _ignoreErrors = true;
    _stderr = new Writable();
    _stdout = new Writable();
    log = _console?.log ?? noop_default;
    info = _console?.info ?? log;
    trace = _console?.trace ?? info;
    debug = _console?.debug ?? log;
    table = _console?.table ?? log;
    error = _console?.error ?? log;
    warn = _console?.warn ?? error;
    createTask =
      _console?.createTask ??
      /* @__PURE__ */ notImplemented("console.createTask");
    clear = _console?.clear ?? noop_default;
    count = _console?.count ?? noop_default;
    countReset = _console?.countReset ?? noop_default;
    dir = _console?.dir ?? noop_default;
    dirxml = _console?.dirxml ?? noop_default;
    group = _console?.group ?? noop_default;
    groupEnd = _console?.groupEnd ?? noop_default;
    groupCollapsed = _console?.groupCollapsed ?? noop_default;
    profile = _console?.profile ?? noop_default;
    profileEnd = _console?.profileEnd ?? noop_default;
    time = _console?.time ?? noop_default;
    timeEnd = _console?.timeEnd ?? noop_default;
    timeLog = _console?.timeLog ?? noop_default;
    timeStamp = _console?.timeStamp ?? noop_default;
    Console =
      _console?.Console ??
      /* @__PURE__ */ notImplementedClass("console.Console");
    _times = /* @__PURE__ */ new Map();
    _stdoutErrorHandler = noop_default;
    _stderrErrorHandler = noop_default;
  },
});

// ../node_modules/@cloudflare/unenv-preset/dist/runtime/node/console.mjs
var workerdConsole,
  assert,
  clear2,
  context,
  count2,
  countReset2,
  createTask2,
  debug2,
  dir2,
  dirxml2,
  error2,
  group2,
  groupCollapsed2,
  groupEnd2,
  info2,
  log2,
  profile2,
  profileEnd2,
  table2,
  time2,
  timeEnd2,
  timeLog2,
  timeStamp2,
  trace2,
  warn2,
  console_default;
var init_console2 = __esm({
  "../node_modules/@cloudflare/unenv-preset/dist/runtime/node/console.mjs"() {
    init_functionsRoutes_0_5277810449847653();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    init_console();
    workerdConsole = globalThis["console"];
    ({
      assert,
      clear: clear2,
      context:
        // @ts-expect-error undocumented public API
        context,
      count: count2,
      countReset: countReset2,
      createTask:
        // @ts-expect-error undocumented public API
        createTask2,
      debug: debug2,
      dir: dir2,
      dirxml: dirxml2,
      error: error2,
      group: group2,
      groupCollapsed: groupCollapsed2,
      groupEnd: groupEnd2,
      info: info2,
      log: log2,
      profile: profile2,
      profileEnd: profileEnd2,
      table: table2,
      time: time2,
      timeEnd: timeEnd2,
      timeLog: timeLog2,
      timeStamp: timeStamp2,
      trace: trace2,
      warn: warn2,
    } = workerdConsole);
    Object.assign(workerdConsole, {
      Console,
      _ignoreErrors,
      _stderr,
      _stderrErrorHandler,
      _stdout,
      _stdoutErrorHandler,
      _times,
    });
    console_default = workerdConsole;
  },
});

// ../node_modules/wrangler/_virtual_unenv_global_polyfill-@cloudflare-unenv-preset-node-console
var init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console =
  __esm({
    "../node_modules/wrangler/_virtual_unenv_global_polyfill-@cloudflare-unenv-preset-node-console"() {
      init_console2();
      globalThis.console = console_default;
    },
  });

// ../node_modules/unenv/dist/runtime/node/internal/process/hrtime.mjs
var hrtime;
var init_hrtime = __esm({
  "../node_modules/unenv/dist/runtime/node/internal/process/hrtime.mjs"() {
    init_functionsRoutes_0_5277810449847653();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    hrtime = /* @__PURE__ */ Object.assign(
      /* @__PURE__ */ __name(function hrtime2(startTime) {
        const now = Date.now();
        const seconds = Math.trunc(now / 1e3);
        const nanos = (now % 1e3) * 1e6;
        if (startTime) {
          let diffSeconds = seconds - startTime[0];
          let diffNanos = nanos - startTime[0];
          if (diffNanos < 0) {
            diffSeconds = diffSeconds - 1;
            diffNanos = 1e9 + diffNanos;
          }
          return [diffSeconds, diffNanos];
        }
        return [seconds, nanos];
      }, "hrtime"),
      {
        bigint: /* @__PURE__ */ __name(function bigint() {
          return BigInt(Date.now() * 1e6);
        }, "bigint"),
      },
    );
  },
});

// ../node_modules/unenv/dist/runtime/node/internal/tty/read-stream.mjs
var ReadStream;
var init_read_stream = __esm({
  "../node_modules/unenv/dist/runtime/node/internal/tty/read-stream.mjs"() {
    init_functionsRoutes_0_5277810449847653();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    ReadStream = class {
      static {
        __name(this, "ReadStream");
      }
      fd;
      isRaw = false;
      isTTY = false;
      constructor(fd) {
        this.fd = fd;
      }
      setRawMode(mode) {
        this.isRaw = mode;
        return this;
      }
    };
  },
});

// ../node_modules/unenv/dist/runtime/node/internal/tty/write-stream.mjs
var WriteStream;
var init_write_stream = __esm({
  "../node_modules/unenv/dist/runtime/node/internal/tty/write-stream.mjs"() {
    init_functionsRoutes_0_5277810449847653();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    WriteStream = class {
      static {
        __name(this, "WriteStream");
      }
      fd;
      columns = 80;
      rows = 24;
      isTTY = false;
      constructor(fd) {
        this.fd = fd;
      }
      clearLine(dir3, callback) {
        callback && callback();
        return false;
      }
      clearScreenDown(callback) {
        callback && callback();
        return false;
      }
      cursorTo(x, y, callback) {
        callback && typeof callback === "function" && callback();
        return false;
      }
      moveCursor(dx, dy, callback) {
        callback && callback();
        return false;
      }
      getColorDepth(env2) {
        return 1;
      }
      hasColors(count3, env2) {
        return false;
      }
      getWindowSize() {
        return [this.columns, this.rows];
      }
      write(str, encoding, cb) {
        if (str instanceof Uint8Array) {
          str = new TextDecoder().decode(str);
        }
        try {
          console.log(str);
        } catch {}
        cb && typeof cb === "function" && cb();
        return false;
      }
    };
  },
});

// ../node_modules/unenv/dist/runtime/node/tty.mjs
var init_tty = __esm({
  "../node_modules/unenv/dist/runtime/node/tty.mjs"() {
    init_functionsRoutes_0_5277810449847653();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    init_read_stream();
    init_write_stream();
  },
});

// ../node_modules/unenv/dist/runtime/node/internal/process/node-version.mjs
var NODE_VERSION;
var init_node_version = __esm({
  "../node_modules/unenv/dist/runtime/node/internal/process/node-version.mjs"() {
    init_functionsRoutes_0_5277810449847653();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    NODE_VERSION = "22.14.0";
  },
});

// ../node_modules/unenv/dist/runtime/node/internal/process/process.mjs
import { EventEmitter } from "node:events";
var Process;
var init_process = __esm({
  "../node_modules/unenv/dist/runtime/node/internal/process/process.mjs"() {
    init_functionsRoutes_0_5277810449847653();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    init_tty();
    init_utils();
    init_node_version();
    Process = class _Process extends EventEmitter {
      static {
        __name(this, "Process");
      }
      env;
      hrtime;
      nextTick;
      constructor(impl) {
        super();
        this.env = impl.env;
        this.hrtime = impl.hrtime;
        this.nextTick = impl.nextTick;
        for (const prop of [
          ...Object.getOwnPropertyNames(_Process.prototype),
          ...Object.getOwnPropertyNames(EventEmitter.prototype),
        ]) {
          const value = this[prop];
          if (typeof value === "function") {
            this[prop] = value.bind(this);
          }
        }
      }
      // --- event emitter ---
      emitWarning(warning, type, code) {
        console.warn(
          `${code ? `[${code}] ` : ""}${type ? `${type}: ` : ""}${warning}`,
        );
      }
      emit(...args) {
        return super.emit(...args);
      }
      listeners(eventName) {
        return super.listeners(eventName);
      }
      // --- stdio (lazy initializers) ---
      #stdin;
      #stdout;
      #stderr;
      get stdin() {
        return (this.#stdin ??= new ReadStream(0));
      }
      get stdout() {
        return (this.#stdout ??= new WriteStream(1));
      }
      get stderr() {
        return (this.#stderr ??= new WriteStream(2));
      }
      // --- cwd ---
      #cwd = "/";
      chdir(cwd2) {
        this.#cwd = cwd2;
      }
      cwd() {
        return this.#cwd;
      }
      // --- dummy props and getters ---
      arch = "";
      platform = "";
      argv = [];
      argv0 = "";
      execArgv = [];
      execPath = "";
      title = "";
      pid = 200;
      ppid = 100;
      get version() {
        return `v${NODE_VERSION}`;
      }
      get versions() {
        return { node: NODE_VERSION };
      }
      get allowedNodeEnvironmentFlags() {
        return /* @__PURE__ */ new Set();
      }
      get sourceMapsEnabled() {
        return false;
      }
      get debugPort() {
        return 0;
      }
      get throwDeprecation() {
        return false;
      }
      get traceDeprecation() {
        return false;
      }
      get features() {
        return {};
      }
      get release() {
        return {};
      }
      get connected() {
        return false;
      }
      get config() {
        return {};
      }
      get moduleLoadList() {
        return [];
      }
      constrainedMemory() {
        return 0;
      }
      availableMemory() {
        return 0;
      }
      uptime() {
        return 0;
      }
      resourceUsage() {
        return {};
      }
      // --- noop methods ---
      ref() {}
      unref() {}
      // --- unimplemented methods ---
      umask() {
        throw createNotImplementedError("process.umask");
      }
      getBuiltinModule() {
        return void 0;
      }
      getActiveResourcesInfo() {
        throw createNotImplementedError("process.getActiveResourcesInfo");
      }
      exit() {
        throw createNotImplementedError("process.exit");
      }
      reallyExit() {
        throw createNotImplementedError("process.reallyExit");
      }
      kill() {
        throw createNotImplementedError("process.kill");
      }
      abort() {
        throw createNotImplementedError("process.abort");
      }
      dlopen() {
        throw createNotImplementedError("process.dlopen");
      }
      setSourceMapsEnabled() {
        throw createNotImplementedError("process.setSourceMapsEnabled");
      }
      loadEnvFile() {
        throw createNotImplementedError("process.loadEnvFile");
      }
      disconnect() {
        throw createNotImplementedError("process.disconnect");
      }
      cpuUsage() {
        throw createNotImplementedError("process.cpuUsage");
      }
      setUncaughtExceptionCaptureCallback() {
        throw createNotImplementedError(
          "process.setUncaughtExceptionCaptureCallback",
        );
      }
      hasUncaughtExceptionCaptureCallback() {
        throw createNotImplementedError(
          "process.hasUncaughtExceptionCaptureCallback",
        );
      }
      initgroups() {
        throw createNotImplementedError("process.initgroups");
      }
      openStdin() {
        throw createNotImplementedError("process.openStdin");
      }
      assert() {
        throw createNotImplementedError("process.assert");
      }
      binding() {
        throw createNotImplementedError("process.binding");
      }
      // --- attached interfaces ---
      permission = {
        has: /* @__PURE__ */ notImplemented("process.permission.has"),
      };
      report = {
        directory: "",
        filename: "",
        signal: "SIGUSR2",
        compact: false,
        reportOnFatalError: false,
        reportOnSignal: false,
        reportOnUncaughtException: false,
        getReport: /* @__PURE__ */ notImplemented("process.report.getReport"),
        writeReport: /* @__PURE__ */ notImplemented(
          "process.report.writeReport",
        ),
      };
      finalization = {
        register: /* @__PURE__ */ notImplemented(
          "process.finalization.register",
        ),
        unregister: /* @__PURE__ */ notImplemented(
          "process.finalization.unregister",
        ),
        registerBeforeExit: /* @__PURE__ */ notImplemented(
          "process.finalization.registerBeforeExit",
        ),
      };
      memoryUsage = Object.assign(
        () => ({
          arrayBuffers: 0,
          rss: 0,
          external: 0,
          heapTotal: 0,
          heapUsed: 0,
        }),
        { rss: /* @__PURE__ */ __name(() => 0, "rss") },
      );
      // --- undefined props ---
      mainModule = void 0;
      domain = void 0;
      // optional
      send = void 0;
      exitCode = void 0;
      channel = void 0;
      getegid = void 0;
      geteuid = void 0;
      getgid = void 0;
      getgroups = void 0;
      getuid = void 0;
      setegid = void 0;
      seteuid = void 0;
      setgid = void 0;
      setgroups = void 0;
      setuid = void 0;
      // internals
      _events = void 0;
      _eventsCount = void 0;
      _exiting = void 0;
      _maxListeners = void 0;
      _debugEnd = void 0;
      _debugProcess = void 0;
      _fatalException = void 0;
      _getActiveHandles = void 0;
      _getActiveRequests = void 0;
      _kill = void 0;
      _preload_modules = void 0;
      _rawDebug = void 0;
      _startProfilerIdleNotifier = void 0;
      _stopProfilerIdleNotifier = void 0;
      _tickCallback = void 0;
      _disconnect = void 0;
      _handleQueue = void 0;
      _pendingMessage = void 0;
      _channel = void 0;
      _send = void 0;
      _linkedBinding = void 0;
    };
  },
});

// ../node_modules/@cloudflare/unenv-preset/dist/runtime/node/process.mjs
var globalProcess,
  getBuiltinModule,
  workerdProcess,
  unenvProcess,
  exit,
  features,
  platform,
  _channel,
  _debugEnd,
  _debugProcess,
  _disconnect,
  _events,
  _eventsCount,
  _exiting,
  _fatalException,
  _getActiveHandles,
  _getActiveRequests,
  _handleQueue,
  _kill,
  _linkedBinding,
  _maxListeners,
  _pendingMessage,
  _preload_modules,
  _rawDebug,
  _send,
  _startProfilerIdleNotifier,
  _stopProfilerIdleNotifier,
  _tickCallback,
  abort,
  addListener,
  allowedNodeEnvironmentFlags,
  arch,
  argv,
  argv0,
  assert2,
  availableMemory,
  binding,
  channel,
  chdir,
  config,
  connected,
  constrainedMemory,
  cpuUsage,
  cwd,
  debugPort,
  disconnect,
  dlopen,
  domain,
  emit,
  emitWarning,
  env,
  eventNames,
  execArgv,
  execPath,
  exitCode,
  finalization,
  getActiveResourcesInfo,
  getegid,
  geteuid,
  getgid,
  getgroups,
  getMaxListeners,
  getuid,
  hasUncaughtExceptionCaptureCallback,
  hrtime3,
  initgroups,
  kill,
  listenerCount,
  listeners,
  loadEnvFile,
  mainModule,
  memoryUsage,
  moduleLoadList,
  nextTick,
  off,
  on,
  once,
  openStdin,
  permission,
  pid,
  ppid,
  prependListener,
  prependOnceListener,
  rawListeners,
  reallyExit,
  ref,
  release,
  removeAllListeners,
  removeListener,
  report,
  resourceUsage,
  send,
  setegid,
  seteuid,
  setgid,
  setgroups,
  setMaxListeners,
  setSourceMapsEnabled,
  setuid,
  setUncaughtExceptionCaptureCallback,
  sourceMapsEnabled,
  stderr,
  stdin,
  stdout,
  throwDeprecation,
  title,
  traceDeprecation,
  umask,
  unref,
  uptime,
  version,
  versions,
  _process,
  process_default;
var init_process2 = __esm({
  "../node_modules/@cloudflare/unenv-preset/dist/runtime/node/process.mjs"() {
    init_functionsRoutes_0_5277810449847653();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    init_hrtime();
    init_process();
    globalProcess = globalThis["process"];
    getBuiltinModule = globalProcess.getBuiltinModule;
    workerdProcess = getBuiltinModule("node:process");
    unenvProcess = new Process({
      env: globalProcess.env,
      hrtime,
      // `nextTick` is available from workerd process v1
      nextTick: workerdProcess.nextTick,
    });
    ({ exit, features, platform } = workerdProcess);
    ({
      _channel,
      _debugEnd,
      _debugProcess,
      _disconnect,
      _events,
      _eventsCount,
      _exiting,
      _fatalException,
      _getActiveHandles,
      _getActiveRequests,
      _handleQueue,
      _kill,
      _linkedBinding,
      _maxListeners,
      _pendingMessage,
      _preload_modules,
      _rawDebug,
      _send,
      _startProfilerIdleNotifier,
      _stopProfilerIdleNotifier,
      _tickCallback,
      abort,
      addListener,
      allowedNodeEnvironmentFlags,
      arch,
      argv,
      argv0,
      assert: assert2,
      availableMemory,
      binding,
      channel,
      chdir,
      config,
      connected,
      constrainedMemory,
      cpuUsage,
      cwd,
      debugPort,
      disconnect,
      dlopen,
      domain,
      emit,
      emitWarning,
      env,
      eventNames,
      execArgv,
      execPath,
      exitCode,
      finalization,
      getActiveResourcesInfo,
      getegid,
      geteuid,
      getgid,
      getgroups,
      getMaxListeners,
      getuid,
      hasUncaughtExceptionCaptureCallback,
      hrtime: hrtime3,
      initgroups,
      kill,
      listenerCount,
      listeners,
      loadEnvFile,
      mainModule,
      memoryUsage,
      moduleLoadList,
      nextTick,
      off,
      on,
      once,
      openStdin,
      permission,
      pid,
      ppid,
      prependListener,
      prependOnceListener,
      rawListeners,
      reallyExit,
      ref,
      release,
      removeAllListeners,
      removeListener,
      report,
      resourceUsage,
      send,
      setegid,
      seteuid,
      setgid,
      setgroups,
      setMaxListeners,
      setSourceMapsEnabled,
      setuid,
      setUncaughtExceptionCaptureCallback,
      sourceMapsEnabled,
      stderr,
      stdin,
      stdout,
      throwDeprecation,
      title,
      traceDeprecation,
      umask,
      unref,
      uptime,
      version,
      versions,
    } = unenvProcess);
    _process = {
      abort,
      addListener,
      allowedNodeEnvironmentFlags,
      hasUncaughtExceptionCaptureCallback,
      setUncaughtExceptionCaptureCallback,
      loadEnvFile,
      sourceMapsEnabled,
      arch,
      argv,
      argv0,
      chdir,
      config,
      connected,
      constrainedMemory,
      availableMemory,
      cpuUsage,
      cwd,
      debugPort,
      dlopen,
      disconnect,
      emit,
      emitWarning,
      env,
      eventNames,
      execArgv,
      execPath,
      exit,
      finalization,
      features,
      getBuiltinModule,
      getActiveResourcesInfo,
      getMaxListeners,
      hrtime: hrtime3,
      kill,
      listeners,
      listenerCount,
      memoryUsage,
      nextTick,
      on,
      off,
      once,
      pid,
      platform,
      ppid,
      prependListener,
      prependOnceListener,
      rawListeners,
      release,
      removeAllListeners,
      removeListener,
      report,
      resourceUsage,
      setMaxListeners,
      setSourceMapsEnabled,
      stderr,
      stdin,
      stdout,
      title,
      throwDeprecation,
      traceDeprecation,
      umask,
      uptime,
      version,
      versions,
      // @ts-expect-error old API
      domain,
      initgroups,
      moduleLoadList,
      reallyExit,
      openStdin,
      assert: assert2,
      binding,
      send,
      exitCode,
      channel,
      getegid,
      geteuid,
      getgid,
      getgroups,
      getuid,
      setegid,
      seteuid,
      setgid,
      setgroups,
      setuid,
      permission,
      mainModule,
      _events,
      _eventsCount,
      _exiting,
      _maxListeners,
      _debugEnd,
      _debugProcess,
      _fatalException,
      _getActiveHandles,
      _getActiveRequests,
      _kill,
      _preload_modules,
      _rawDebug,
      _startProfilerIdleNotifier,
      _stopProfilerIdleNotifier,
      _tickCallback,
      _disconnect,
      _handleQueue,
      _pendingMessage,
      _channel,
      _send,
      _linkedBinding,
    };
    process_default = _process;
  },
});

// ../node_modules/wrangler/_virtual_unenv_global_polyfill-@cloudflare-unenv-preset-node-process
var init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process =
  __esm({
    "../node_modules/wrangler/_virtual_unenv_global_polyfill-@cloudflare-unenv-preset-node-process"() {
      init_process2();
      globalThis.process = process_default;
    },
  });

// ../node_modules/fast-xml-parser/src/util.js
var require_util = __commonJS({
  "../node_modules/fast-xml-parser/src/util.js"(exports) {
    "use strict";
    init_functionsRoutes_0_5277810449847653();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    var nameStartChar =
      ":A-Za-z_\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD";
    var nameChar =
      nameStartChar + "\\-.\\d\\u00B7\\u0300-\\u036F\\u203F-\\u2040";
    var nameRegexp = "[" + nameStartChar + "][" + nameChar + "]*";
    var regexName = new RegExp("^" + nameRegexp + "$");
    var getAllMatches = /* @__PURE__ */ __name(function (string, regex) {
      const matches = [];
      let match2 = regex.exec(string);
      while (match2) {
        const allmatches = [];
        allmatches.startIndex = regex.lastIndex - match2[0].length;
        const len = match2.length;
        for (let index = 0; index < len; index++) {
          allmatches.push(match2[index]);
        }
        matches.push(allmatches);
        match2 = regex.exec(string);
      }
      return matches;
    }, "getAllMatches");
    var isName = /* @__PURE__ */ __name(function (string) {
      const match2 = regexName.exec(string);
      return !(match2 === null || typeof match2 === "undefined");
    }, "isName");
    exports.isExist = function (v) {
      return typeof v !== "undefined";
    };
    exports.isEmptyObject = function (obj) {
      return Object.keys(obj).length === 0;
    };
    exports.merge = function (target, a, arrayMode) {
      if (a) {
        const keys = Object.keys(a);
        const len = keys.length;
        for (let i = 0; i < len; i++) {
          if (arrayMode === "strict") {
            target[keys[i]] = [a[keys[i]]];
          } else {
            target[keys[i]] = a[keys[i]];
          }
        }
      }
    };
    exports.getValue = function (v) {
      if (exports.isExist(v)) {
        return v;
      } else {
        return "";
      }
    };
    var DANGEROUS_PROPERTY_NAMES = [
      // '__proto__',
      // 'constructor',
      // 'prototype',
      "hasOwnProperty",
      "toString",
      "valueOf",
      "__defineGetter__",
      "__defineSetter__",
      "__lookupGetter__",
      "__lookupSetter__",
    ];
    var criticalProperties = ["__proto__", "constructor", "prototype"];
    exports.isName = isName;
    exports.getAllMatches = getAllMatches;
    exports.nameRegexp = nameRegexp;
    exports.DANGEROUS_PROPERTY_NAMES = DANGEROUS_PROPERTY_NAMES;
    exports.criticalProperties = criticalProperties;
  },
});

// ../node_modules/fast-xml-parser/src/validator.js
var require_validator = __commonJS({
  "../node_modules/fast-xml-parser/src/validator.js"(exports) {
    "use strict";
    init_functionsRoutes_0_5277810449847653();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    var util = require_util();
    var defaultOptions = {
      allowBooleanAttributes: false,
      //A tag can have attributes without any value
      unpairedTags: [],
    };
    exports.validate = function (xmlData, options) {
      options = Object.assign({}, defaultOptions, options);
      const tags = [];
      let tagFound = false;
      let reachedRoot = false;
      if (xmlData[0] === "\uFEFF") {
        xmlData = xmlData.substr(1);
      }
      for (let i = 0; i < xmlData.length; i++) {
        if (xmlData[i] === "<" && xmlData[i + 1] === "?") {
          i += 2;
          i = readPI(xmlData, i);
          if (i.err) return i;
        } else if (xmlData[i] === "<") {
          let tagStartPos = i;
          i++;
          if (xmlData[i] === "!") {
            i = readCommentAndCDATA(xmlData, i);
            continue;
          } else {
            let closingTag = false;
            if (xmlData[i] === "/") {
              closingTag = true;
              i++;
            }
            let tagName = "";
            for (
              ;
              i < xmlData.length &&
              xmlData[i] !== ">" &&
              xmlData[i] !== " " &&
              xmlData[i] !== "	" &&
              xmlData[i] !== "\n" &&
              xmlData[i] !== "\r";
              i++
            ) {
              tagName += xmlData[i];
            }
            tagName = tagName.trim();
            if (tagName[tagName.length - 1] === "/") {
              tagName = tagName.substring(0, tagName.length - 1);
              i--;
            }
            if (!validateTagName(tagName)) {
              let msg;
              if (tagName.trim().length === 0) {
                msg = "Invalid space after '<'.";
              } else {
                msg = "Tag '" + tagName + "' is an invalid name.";
              }
              return getErrorObject(
                "InvalidTag",
                msg,
                getLineNumberForPosition(xmlData, i),
              );
            }
            const result = readAttributeStr(xmlData, i);
            if (result === false) {
              return getErrorObject(
                "InvalidAttr",
                "Attributes for '" + tagName + "' have open quote.",
                getLineNumberForPosition(xmlData, i),
              );
            }
            let attrStr = result.value;
            i = result.index;
            if (attrStr[attrStr.length - 1] === "/") {
              const attrStrStart = i - attrStr.length;
              attrStr = attrStr.substring(0, attrStr.length - 1);
              const isValid = validateAttributeString(attrStr, options);
              if (isValid === true) {
                tagFound = true;
              } else {
                return getErrorObject(
                  isValid.err.code,
                  isValid.err.msg,
                  getLineNumberForPosition(
                    xmlData,
                    attrStrStart + isValid.err.line,
                  ),
                );
              }
            } else if (closingTag) {
              if (!result.tagClosed) {
                return getErrorObject(
                  "InvalidTag",
                  "Closing tag '" + tagName + "' doesn't have proper closing.",
                  getLineNumberForPosition(xmlData, i),
                );
              } else if (attrStr.trim().length > 0) {
                return getErrorObject(
                  "InvalidTag",
                  "Closing tag '" +
                    tagName +
                    "' can't have attributes or invalid starting.",
                  getLineNumberForPosition(xmlData, tagStartPos),
                );
              } else if (tags.length === 0) {
                return getErrorObject(
                  "InvalidTag",
                  "Closing tag '" + tagName + "' has not been opened.",
                  getLineNumberForPosition(xmlData, tagStartPos),
                );
              } else {
                const otg = tags.pop();
                if (tagName !== otg.tagName) {
                  let openPos = getLineNumberForPosition(
                    xmlData,
                    otg.tagStartPos,
                  );
                  return getErrorObject(
                    "InvalidTag",
                    "Expected closing tag '" +
                      otg.tagName +
                      "' (opened in line " +
                      openPos.line +
                      ", col " +
                      openPos.col +
                      ") instead of closing tag '" +
                      tagName +
                      "'.",
                    getLineNumberForPosition(xmlData, tagStartPos),
                  );
                }
                if (tags.length == 0) {
                  reachedRoot = true;
                }
              }
            } else {
              const isValid = validateAttributeString(attrStr, options);
              if (isValid !== true) {
                return getErrorObject(
                  isValid.err.code,
                  isValid.err.msg,
                  getLineNumberForPosition(
                    xmlData,
                    i - attrStr.length + isValid.err.line,
                  ),
                );
              }
              if (reachedRoot === true) {
                return getErrorObject(
                  "InvalidXml",
                  "Multiple possible root nodes found.",
                  getLineNumberForPosition(xmlData, i),
                );
              } else if (options.unpairedTags.indexOf(tagName) !== -1) {
              } else {
                tags.push({ tagName, tagStartPos });
              }
              tagFound = true;
            }
            for (i++; i < xmlData.length; i++) {
              if (xmlData[i] === "<") {
                if (xmlData[i + 1] === "!") {
                  i++;
                  i = readCommentAndCDATA(xmlData, i);
                  continue;
                } else if (xmlData[i + 1] === "?") {
                  i = readPI(xmlData, ++i);
                  if (i.err) return i;
                } else {
                  break;
                }
              } else if (xmlData[i] === "&") {
                const afterAmp = validateAmpersand(xmlData, i);
                if (afterAmp == -1)
                  return getErrorObject(
                    "InvalidChar",
                    "char '&' is not expected.",
                    getLineNumberForPosition(xmlData, i),
                  );
                i = afterAmp;
              } else {
                if (reachedRoot === true && !isWhiteSpace(xmlData[i])) {
                  return getErrorObject(
                    "InvalidXml",
                    "Extra text at the end",
                    getLineNumberForPosition(xmlData, i),
                  );
                }
              }
            }
            if (xmlData[i] === "<") {
              i--;
            }
          }
        } else {
          if (isWhiteSpace(xmlData[i])) {
            continue;
          }
          return getErrorObject(
            "InvalidChar",
            "char '" + xmlData[i] + "' is not expected.",
            getLineNumberForPosition(xmlData, i),
          );
        }
      }
      if (!tagFound) {
        return getErrorObject("InvalidXml", "Start tag expected.", 1);
      } else if (tags.length == 1) {
        return getErrorObject(
          "InvalidTag",
          "Unclosed tag '" + tags[0].tagName + "'.",
          getLineNumberForPosition(xmlData, tags[0].tagStartPos),
        );
      } else if (tags.length > 0) {
        return getErrorObject(
          "InvalidXml",
          "Invalid '" +
            JSON.stringify(
              tags.map((t) => t.tagName),
              null,
              4,
            ).replace(/\r?\n/g, "") +
            "' found.",
          { line: 1, col: 1 },
        );
      }
      return true;
    };
    function isWhiteSpace(char) {
      return char === " " || char === "	" || char === "\n" || char === "\r";
    }
    __name(isWhiteSpace, "isWhiteSpace");
    function readPI(xmlData, i) {
      const start = i;
      for (; i < xmlData.length; i++) {
        if (xmlData[i] == "?" || xmlData[i] == " ") {
          const tagname = xmlData.substr(start, i - start);
          if (i > 5 && tagname === "xml") {
            return getErrorObject(
              "InvalidXml",
              "XML declaration allowed only at the start of the document.",
              getLineNumberForPosition(xmlData, i),
            );
          } else if (xmlData[i] == "?" && xmlData[i + 1] == ">") {
            i++;
            break;
          } else {
            continue;
          }
        }
      }
      return i;
    }
    __name(readPI, "readPI");
    function readCommentAndCDATA(xmlData, i) {
      if (
        xmlData.length > i + 5 &&
        xmlData[i + 1] === "-" &&
        xmlData[i + 2] === "-"
      ) {
        for (i += 3; i < xmlData.length; i++) {
          if (
            xmlData[i] === "-" &&
            xmlData[i + 1] === "-" &&
            xmlData[i + 2] === ">"
          ) {
            i += 2;
            break;
          }
        }
      } else if (
        xmlData.length > i + 8 &&
        xmlData[i + 1] === "D" &&
        xmlData[i + 2] === "O" &&
        xmlData[i + 3] === "C" &&
        xmlData[i + 4] === "T" &&
        xmlData[i + 5] === "Y" &&
        xmlData[i + 6] === "P" &&
        xmlData[i + 7] === "E"
      ) {
        let angleBracketsCount = 1;
        for (i += 8; i < xmlData.length; i++) {
          if (xmlData[i] === "<") {
            angleBracketsCount++;
          } else if (xmlData[i] === ">") {
            angleBracketsCount--;
            if (angleBracketsCount === 0) {
              break;
            }
          }
        }
      } else if (
        xmlData.length > i + 9 &&
        xmlData[i + 1] === "[" &&
        xmlData[i + 2] === "C" &&
        xmlData[i + 3] === "D" &&
        xmlData[i + 4] === "A" &&
        xmlData[i + 5] === "T" &&
        xmlData[i + 6] === "A" &&
        xmlData[i + 7] === "["
      ) {
        for (i += 8; i < xmlData.length; i++) {
          if (
            xmlData[i] === "]" &&
            xmlData[i + 1] === "]" &&
            xmlData[i + 2] === ">"
          ) {
            i += 2;
            break;
          }
        }
      }
      return i;
    }
    __name(readCommentAndCDATA, "readCommentAndCDATA");
    var doubleQuote = '"';
    var singleQuote = "'";
    function readAttributeStr(xmlData, i) {
      let attrStr = "";
      let startChar = "";
      let tagClosed = false;
      for (; i < xmlData.length; i++) {
        if (xmlData[i] === doubleQuote || xmlData[i] === singleQuote) {
          if (startChar === "") {
            startChar = xmlData[i];
          } else if (startChar !== xmlData[i]) {
          } else {
            startChar = "";
          }
        } else if (xmlData[i] === ">") {
          if (startChar === "") {
            tagClosed = true;
            break;
          }
        }
        attrStr += xmlData[i];
      }
      if (startChar !== "") {
        return false;
      }
      return {
        value: attrStr,
        index: i,
        tagClosed,
      };
    }
    __name(readAttributeStr, "readAttributeStr");
    var validAttrStrRegxp = new RegExp(
      `(\\s*)([^\\s=]+)(\\s*=)?(\\s*(['"])(([\\s\\S])*?)\\5)?`,
      "g",
    );
    function validateAttributeString(attrStr, options) {
      const matches = util.getAllMatches(attrStr, validAttrStrRegxp);
      const attrNames = {};
      for (let i = 0; i < matches.length; i++) {
        if (matches[i][1].length === 0) {
          return getErrorObject(
            "InvalidAttr",
            "Attribute '" + matches[i][2] + "' has no space in starting.",
            getPositionFromMatch(matches[i]),
          );
        } else if (matches[i][3] !== void 0 && matches[i][4] === void 0) {
          return getErrorObject(
            "InvalidAttr",
            "Attribute '" + matches[i][2] + "' is without value.",
            getPositionFromMatch(matches[i]),
          );
        } else if (
          matches[i][3] === void 0 &&
          !options.allowBooleanAttributes
        ) {
          return getErrorObject(
            "InvalidAttr",
            "boolean attribute '" + matches[i][2] + "' is not allowed.",
            getPositionFromMatch(matches[i]),
          );
        }
        const attrName = matches[i][2];
        if (!validateAttrName(attrName)) {
          return getErrorObject(
            "InvalidAttr",
            "Attribute '" + attrName + "' is an invalid name.",
            getPositionFromMatch(matches[i]),
          );
        }
        if (!attrNames.hasOwnProperty(attrName)) {
          attrNames[attrName] = 1;
        } else {
          return getErrorObject(
            "InvalidAttr",
            "Attribute '" + attrName + "' is repeated.",
            getPositionFromMatch(matches[i]),
          );
        }
      }
      return true;
    }
    __name(validateAttributeString, "validateAttributeString");
    function validateNumberAmpersand(xmlData, i) {
      let re = /\d/;
      if (xmlData[i] === "x") {
        i++;
        re = /[\da-fA-F]/;
      }
      for (; i < xmlData.length; i++) {
        if (xmlData[i] === ";") return i;
        if (!xmlData[i].match(re)) break;
      }
      return -1;
    }
    __name(validateNumberAmpersand, "validateNumberAmpersand");
    function validateAmpersand(xmlData, i) {
      i++;
      if (xmlData[i] === ";") return -1;
      if (xmlData[i] === "#") {
        i++;
        return validateNumberAmpersand(xmlData, i);
      }
      let count3 = 0;
      for (; i < xmlData.length; i++, count3++) {
        if (xmlData[i].match(/\w/) && count3 < 20) continue;
        if (xmlData[i] === ";") break;
        return -1;
      }
      return i;
    }
    __name(validateAmpersand, "validateAmpersand");
    function getErrorObject(code, message, lineNumber) {
      return {
        err: {
          code,
          msg: message,
          line: lineNumber.line || lineNumber,
          col: lineNumber.col,
        },
      };
    }
    __name(getErrorObject, "getErrorObject");
    function validateAttrName(attrName) {
      return util.isName(attrName);
    }
    __name(validateAttrName, "validateAttrName");
    function validateTagName(tagname) {
      return util.isName(tagname);
    }
    __name(validateTagName, "validateTagName");
    function getLineNumberForPosition(xmlData, index) {
      const lines = xmlData.substring(0, index).split(/\r?\n/);
      return {
        line: lines.length,
        // column number is last line's length + 1, because column numbering starts at 1:
        col: lines[lines.length - 1].length + 1,
      };
    }
    __name(getLineNumberForPosition, "getLineNumberForPosition");
    function getPositionFromMatch(match2) {
      return match2.startIndex + match2[1].length;
    }
    __name(getPositionFromMatch, "getPositionFromMatch");
  },
});

// ../node_modules/fast-xml-parser/src/xmlparser/OptionsBuilder.js
var require_OptionsBuilder = __commonJS({
  "../node_modules/fast-xml-parser/src/xmlparser/OptionsBuilder.js"(exports) {
    init_functionsRoutes_0_5277810449847653();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    var { DANGEROUS_PROPERTY_NAMES, criticalProperties } = require_util();
    var defaultOnDangerousProperty = /* @__PURE__ */ __name((name) => {
      if (DANGEROUS_PROPERTY_NAMES.includes(name)) {
        return "__" + name;
      }
      return name;
    }, "defaultOnDangerousProperty");
    var defaultOptions = {
      preserveOrder: false,
      attributeNamePrefix: "@_",
      attributesGroupName: false,
      textNodeName: "#text",
      ignoreAttributes: true,
      removeNSPrefix: false,
      // remove NS from tag name or attribute name if true
      allowBooleanAttributes: false,
      //a tag can have attributes without any value
      //ignoreRootElement : false,
      parseTagValue: true,
      parseAttributeValue: false,
      trimValues: true,
      //Trim string values of tag and attributes
      cdataPropName: false,
      numberParseOptions: {
        hex: true,
        leadingZeros: true,
        eNotation: true,
      },
      tagValueProcessor: /* @__PURE__ */ __name(function (tagName, val) {
        return val;
      }, "tagValueProcessor"),
      attributeValueProcessor: /* @__PURE__ */ __name(function (attrName, val) {
        return val;
      }, "attributeValueProcessor"),
      stopNodes: [],
      //nested tags will not be parsed even for errors
      alwaysCreateTextNode: false,
      isArray: /* @__PURE__ */ __name(() => false, "isArray"),
      commentPropName: false,
      unpairedTags: [],
      processEntities: true,
      htmlEntities: false,
      ignoreDeclaration: false,
      ignorePiTags: false,
      transformTagName: false,
      transformAttributeName: false,
      updateTag: /* @__PURE__ */ __name(function (tagName, jPath, attrs) {
        return tagName;
      }, "updateTag"),
      // skipEmptyListItem: false
      captureMetaData: false,
      maxNestedTags: 100,
      strictReservedNames: true,
      onDangerousProperty: defaultOnDangerousProperty,
    };
    function validatePropertyName(propertyName, optionName) {
      if (typeof propertyName !== "string") {
        return;
      }
      const normalized = propertyName.toLowerCase();
      if (
        DANGEROUS_PROPERTY_NAMES.some(
          (dangerous) => normalized === dangerous.toLowerCase(),
        )
      ) {
        throw new Error(
          `[SECURITY] Invalid ${optionName}: "${propertyName}" is a reserved JavaScript keyword that could cause prototype pollution`,
        );
      }
      if (
        criticalProperties.some(
          (dangerous) => normalized === dangerous.toLowerCase(),
        )
      ) {
        throw new Error(
          `[SECURITY] Invalid ${optionName}: "${propertyName}" is a reserved JavaScript keyword that could cause prototype pollution`,
        );
      }
    }
    __name(validatePropertyName, "validatePropertyName");
    function normalizeProcessEntities(value) {
      if (typeof value === "boolean") {
        return {
          enabled: value,
          // true or false
          maxEntitySize: 1e4,
          maxExpansionDepth: 10,
          maxTotalExpansions: 1e3,
          maxExpandedLength: 1e5,
          allowedTags: null,
          tagFilter: null,
        };
      }
      if (typeof value === "object" && value !== null) {
        return {
          enabled: value.enabled !== false,
          maxEntitySize: Math.max(1, value.maxEntitySize ?? 1e4),
          maxExpansionDepth: Math.max(1, value.maxExpansionDepth ?? 1e4),
          maxTotalExpansions: Math.max(1, value.maxTotalExpansions ?? Infinity),
          maxExpandedLength: Math.max(1, value.maxExpandedLength ?? 1e5),
          maxEntityCount: Math.max(1, value.maxEntityCount ?? 1e3),
          allowedTags: value.allowedTags ?? null,
          tagFilter: value.tagFilter ?? null,
        };
      }
      return normalizeProcessEntities(true);
    }
    __name(normalizeProcessEntities, "normalizeProcessEntities");
    var buildOptions = /* @__PURE__ */ __name(function (options) {
      const built = Object.assign({}, defaultOptions, options);
      const propertyNameOptions = [
        { value: built.attributeNamePrefix, name: "attributeNamePrefix" },
        { value: built.attributesGroupName, name: "attributesGroupName" },
        { value: built.textNodeName, name: "textNodeName" },
        { value: built.cdataPropName, name: "cdataPropName" },
        { value: built.commentPropName, name: "commentPropName" },
      ];
      for (const { value, name } of propertyNameOptions) {
        if (value) {
          validatePropertyName(value, name);
        }
      }
      if (built.onDangerousProperty === null) {
        built.onDangerousProperty = defaultOnDangerousProperty;
      }
      built.processEntities = normalizeProcessEntities(built.processEntities);
      return built;
    }, "buildOptions");
    exports.buildOptions = buildOptions;
    exports.defaultOptions = defaultOptions;
  },
});

// ../node_modules/fast-xml-parser/src/xmlparser/xmlNode.js
var require_xmlNode = __commonJS({
  "../node_modules/fast-xml-parser/src/xmlparser/xmlNode.js"(exports, module) {
    "use strict";
    init_functionsRoutes_0_5277810449847653();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    var XmlNode = class {
      static {
        __name(this, "XmlNode");
      }
      constructor(tagname) {
        this.tagname = tagname;
        this.child = [];
        this[":@"] = {};
      }
      add(key, val) {
        if (key === "__proto__") key = "#__proto__";
        this.child.push({ [key]: val });
      }
      addChild(node) {
        if (node.tagname === "__proto__") node.tagname = "#__proto__";
        if (node[":@"] && Object.keys(node[":@"]).length > 0) {
          this.child.push({ [node.tagname]: node.child, [":@"]: node[":@"] });
        } else {
          this.child.push({ [node.tagname]: node.child });
        }
      }
    };
    module.exports = XmlNode;
  },
});

// ../node_modules/fast-xml-parser/src/xmlparser/DocTypeReader.js
var require_DocTypeReader = __commonJS({
  "../node_modules/fast-xml-parser/src/xmlparser/DocTypeReader.js"(
    exports,
    module,
  ) {
    init_functionsRoutes_0_5277810449847653();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    var util = require_util();
    var DocTypeReader = class {
      static {
        __name(this, "DocTypeReader");
      }
      constructor(options) {
        this.suppressValidationErr = !options;
        this.options = options || {};
      }
      readDocType(xmlData, i) {
        const entities = /* @__PURE__ */ Object.create(null);
        let entityCount = 0;
        if (
          xmlData[i + 3] === "O" &&
          xmlData[i + 4] === "C" &&
          xmlData[i + 5] === "T" &&
          xmlData[i + 6] === "Y" &&
          xmlData[i + 7] === "P" &&
          xmlData[i + 8] === "E"
        ) {
          i = i + 9;
          let angleBracketsCount = 1;
          let hasBody = false,
            comment = false;
          let exp = "";
          for (; i < xmlData.length; i++) {
            if (xmlData[i] === "<" && !comment) {
              if (hasBody && hasSeq(xmlData, "!ENTITY", i)) {
                i += 7;
                let entityName, val;
                [entityName, val, i] = this.readEntityExp(
                  xmlData,
                  i + 1,
                  this.suppressValidationErr,
                );
                if (val.indexOf("&") === -1) {
                  if (
                    this.options.enabled !== false &&
                    this.options.maxEntityCount != null &&
                    entityCount >= this.options.maxEntityCount
                  ) {
                    throw new Error(
                      `Entity count (${entityCount + 1}) exceeds maximum allowed (${this.options.maxEntityCount})`,
                    );
                  }
                  const escaped = entityName.replace(
                    /[.*+?^${}()|[\]\\]/g,
                    "\\$&",
                  );
                  entities[entityName] = {
                    regx: RegExp(`&${escaped};`, "g"),
                    val,
                  };
                  entityCount++;
                }
              } else if (hasBody && hasSeq(xmlData, "!ELEMENT", i)) {
                i += 8;
                const { index } = this.readElementExp(xmlData, i + 1);
                i = index;
              } else if (hasBody && hasSeq(xmlData, "!ATTLIST", i)) {
                i += 8;
              } else if (hasBody && hasSeq(xmlData, "!NOTATION", i)) {
                i += 9;
                const { index } = this.readNotationExp(
                  xmlData,
                  i + 1,
                  this.suppressValidationErr,
                );
                i = index;
              } else if (hasSeq(xmlData, "!--", i)) {
                comment = true;
              } else {
                throw new Error(`Invalid DOCTYPE`);
              }
              angleBracketsCount++;
              exp = "";
            } else if (xmlData[i] === ">") {
              if (comment) {
                if (xmlData[i - 1] === "-" && xmlData[i - 2] === "-") {
                  comment = false;
                  angleBracketsCount--;
                }
              } else {
                angleBracketsCount--;
              }
              if (angleBracketsCount === 0) {
                break;
              }
            } else if (xmlData[i] === "[") {
              hasBody = true;
            } else {
              exp += xmlData[i];
            }
          }
          if (angleBracketsCount !== 0) {
            throw new Error(`Unclosed DOCTYPE`);
          }
        } else {
          throw new Error(`Invalid Tag instead of DOCTYPE`);
        }
        return { entities, i };
      }
      readEntityExp(xmlData, i) {
        i = skipWhitespace(xmlData, i);
        let entityName = "";
        while (
          i < xmlData.length &&
          !/\s/.test(xmlData[i]) &&
          xmlData[i] !== '"' &&
          xmlData[i] !== "'"
        ) {
          entityName += xmlData[i];
          i++;
        }
        validateEntityName(entityName);
        i = skipWhitespace(xmlData, i);
        if (!this.suppressValidationErr) {
          if (xmlData.substring(i, i + 6).toUpperCase() === "SYSTEM") {
            throw new Error("External entities are not supported");
          } else if (xmlData[i] === "%") {
            throw new Error("Parameter entities are not supported");
          }
        }
        let entityValue = "";
        [i, entityValue] = this.readIdentifierVal(xmlData, i, "entity");
        if (
          this.options.enabled !== false &&
          this.options.maxEntitySize != null &&
          entityValue.length > this.options.maxEntitySize
        ) {
          throw new Error(
            `Entity "${entityName}" size (${entityValue.length}) exceeds maximum allowed size (${this.options.maxEntitySize})`,
          );
        }
        i--;
        return [entityName, entityValue, i];
      }
      readNotationExp(xmlData, i) {
        i = skipWhitespace(xmlData, i);
        let notationName = "";
        while (i < xmlData.length && !/\s/.test(xmlData[i])) {
          notationName += xmlData[i];
          i++;
        }
        !this.suppressValidationErr && validateEntityName(notationName);
        i = skipWhitespace(xmlData, i);
        const identifierType = xmlData.substring(i, i + 6).toUpperCase();
        if (
          !this.suppressValidationErr &&
          identifierType !== "SYSTEM" &&
          identifierType !== "PUBLIC"
        ) {
          throw new Error(
            `Expected SYSTEM or PUBLIC, found "${identifierType}"`,
          );
        }
        i += identifierType.length;
        i = skipWhitespace(xmlData, i);
        let publicIdentifier = null;
        let systemIdentifier = null;
        if (identifierType === "PUBLIC") {
          [i, publicIdentifier] = this.readIdentifierVal(
            xmlData,
            i,
            "publicIdentifier",
          );
          i = skipWhitespace(xmlData, i);
          if (xmlData[i] === '"' || xmlData[i] === "'") {
            [i, systemIdentifier] = this.readIdentifierVal(
              xmlData,
              i,
              "systemIdentifier",
            );
          }
        } else if (identifierType === "SYSTEM") {
          [i, systemIdentifier] = this.readIdentifierVal(
            xmlData,
            i,
            "systemIdentifier",
          );
          if (!this.suppressValidationErr && !systemIdentifier) {
            throw new Error(
              "Missing mandatory system identifier for SYSTEM notation",
            );
          }
        }
        return { notationName, publicIdentifier, systemIdentifier, index: --i };
      }
      readIdentifierVal(xmlData, i, type) {
        let identifierVal = "";
        const startChar = xmlData[i];
        if (startChar !== '"' && startChar !== "'") {
          throw new Error(`Expected quoted string, found "${startChar}"`);
        }
        i++;
        while (i < xmlData.length && xmlData[i] !== startChar) {
          identifierVal += xmlData[i];
          i++;
        }
        if (xmlData[i] !== startChar) {
          throw new Error(`Unterminated ${type} value`);
        }
        i++;
        return [i, identifierVal];
      }
      readElementExp(xmlData, i) {
        i = skipWhitespace(xmlData, i);
        let elementName = "";
        while (i < xmlData.length && !/\s/.test(xmlData[i])) {
          elementName += xmlData[i];
          i++;
        }
        if (!this.suppressValidationErr && !util.isName(elementName)) {
          throw new Error(`Invalid element name: "${elementName}"`);
        }
        i = skipWhitespace(xmlData, i);
        let contentModel = "";
        if (xmlData[i] === "E" && hasSeq(xmlData, "MPTY", i)) {
          i += 4;
        } else if (xmlData[i] === "A" && hasSeq(xmlData, "NY", i)) {
          i += 2;
        } else if (xmlData[i] === "(") {
          i++;
          while (i < xmlData.length && xmlData[i] !== ")") {
            contentModel += xmlData[i];
            i++;
          }
          if (xmlData[i] !== ")") {
            throw new Error("Unterminated content model");
          }
        } else if (!this.suppressValidationErr) {
          throw new Error(`Invalid Element Expression, found "${xmlData[i]}"`);
        }
        return {
          elementName,
          contentModel: contentModel.trim(),
          index: i,
        };
      }
      readAttlistExp(xmlData, i) {
        i = skipWhitespace(xmlData, i);
        let elementName = "";
        while (i < xmlData.length && !/\s/.test(xmlData[i])) {
          elementName += xmlData[i];
          i++;
        }
        validateEntityName(elementName);
        i = skipWhitespace(xmlData, i);
        let attributeName = "";
        while (i < xmlData.length && !/\s/.test(xmlData[i])) {
          attributeName += xmlData[i];
          i++;
        }
        if (!validateEntityName(attributeName)) {
          throw new Error(`Invalid attribute name: "${attributeName}"`);
        }
        i = skipWhitespace(xmlData, i);
        let attributeType = "";
        if (xmlData.substring(i, i + 8).toUpperCase() === "NOTATION") {
          attributeType = "NOTATION";
          i += 8;
          i = skipWhitespace(xmlData, i);
          if (xmlData[i] !== "(") {
            throw new Error(`Expected '(', found "${xmlData[i]}"`);
          }
          i++;
          let allowedNotations = [];
          while (i < xmlData.length && xmlData[i] !== ")") {
            let notation = "";
            while (
              i < xmlData.length &&
              xmlData[i] !== "|" &&
              xmlData[i] !== ")"
            ) {
              notation += xmlData[i];
              i++;
            }
            notation = notation.trim();
            if (!validateEntityName(notation)) {
              throw new Error(`Invalid notation name: "${notation}"`);
            }
            allowedNotations.push(notation);
            if (xmlData[i] === "|") {
              i++;
              i = skipWhitespace(xmlData, i);
            }
          }
          if (xmlData[i] !== ")") {
            throw new Error("Unterminated list of notations");
          }
          i++;
          attributeType += " (" + allowedNotations.join("|") + ")";
        } else {
          while (i < xmlData.length && !/\s/.test(xmlData[i])) {
            attributeType += xmlData[i];
            i++;
          }
          const validTypes = [
            "CDATA",
            "ID",
            "IDREF",
            "IDREFS",
            "ENTITY",
            "ENTITIES",
            "NMTOKEN",
            "NMTOKENS",
          ];
          if (
            !this.suppressValidationErr &&
            !validTypes.includes(attributeType.toUpperCase())
          ) {
            throw new Error(`Invalid attribute type: "${attributeType}"`);
          }
        }
        i = skipWhitespace(xmlData, i);
        let defaultValue = "";
        if (xmlData.substring(i, i + 8).toUpperCase() === "#REQUIRED") {
          defaultValue = "#REQUIRED";
          i += 8;
        } else if (xmlData.substring(i, i + 7).toUpperCase() === "#IMPLIED") {
          defaultValue = "#IMPLIED";
          i += 7;
        } else {
          [i, defaultValue] = this.readIdentifierVal(xmlData, i, "ATTLIST");
        }
        return {
          elementName,
          attributeName,
          attributeType,
          defaultValue,
          index: i,
        };
      }
    };
    var skipWhitespace = /* @__PURE__ */ __name((data, index) => {
      while (index < data.length && /\s/.test(data[index])) {
        index++;
      }
      return index;
    }, "skipWhitespace");
    function hasSeq(data, seq, i) {
      for (let j = 0; j < seq.length; j++) {
        if (seq[j] !== data[i + j + 1]) return false;
      }
      return true;
    }
    __name(hasSeq, "hasSeq");
    function validateEntityName(name) {
      if (util.isName(name)) return name;
      else throw new Error(`Invalid entity name ${name}`);
    }
    __name(validateEntityName, "validateEntityName");
    module.exports = DocTypeReader;
  },
});

// ../node_modules/strnum/strnum.js
var require_strnum = __commonJS({
  "../node_modules/strnum/strnum.js"(exports, module) {
    init_functionsRoutes_0_5277810449847653();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    var hexRegex = /^[-+]?0x[a-fA-F0-9]+$/;
    var numRegex = /^([\-\+])?(0*)([0-9]*(\.[0-9]*)?)$/;
    var consider = {
      hex: true,
      // oct: false,
      leadingZeros: true,
      decimalPoint: ".",
      eNotation: true,
      //skipLike: /regex/
    };
    function toNumber(str, options = {}) {
      options = Object.assign({}, consider, options);
      if (!str || typeof str !== "string") return str;
      let trimmedStr = str.trim();
      if (options.skipLike !== void 0 && options.skipLike.test(trimmedStr))
        return str;
      else if (str === "0") return 0;
      else if (options.hex && hexRegex.test(trimmedStr)) {
        return parse_int(trimmedStr, 16);
      } else if (trimmedStr.search(/[eE]/) !== -1) {
        const notation = trimmedStr.match(
          /^([-\+])?(0*)([0-9]*(\.[0-9]*)?[eE][-\+]?[0-9]+)$/,
        );
        if (notation) {
          if (options.leadingZeros) {
            trimmedStr = (notation[1] || "") + notation[3];
          } else {
            if (notation[2] === "0" && notation[3][0] === ".") {
            } else {
              return str;
            }
          }
          return options.eNotation ? Number(trimmedStr) : str;
        } else {
          return str;
        }
      } else {
        const match2 = numRegex.exec(trimmedStr);
        if (match2) {
          const sign = match2[1];
          const leadingZeros = match2[2];
          let numTrimmedByZeros = trimZeros(match2[3]);
          if (
            !options.leadingZeros &&
            leadingZeros.length > 0 &&
            sign &&
            trimmedStr[2] !== "."
          )
            return str;
          else if (
            !options.leadingZeros &&
            leadingZeros.length > 0 &&
            !sign &&
            trimmedStr[1] !== "."
          )
            return str;
          else if (options.leadingZeros && leadingZeros === str) return 0;
          else {
            const num = Number(trimmedStr);
            const numStr = "" + num;
            if (numStr.search(/[eE]/) !== -1) {
              if (options.eNotation) return num;
              else return str;
            } else if (trimmedStr.indexOf(".") !== -1) {
              if (numStr === "0" && numTrimmedByZeros === "") return num;
              else if (numStr === numTrimmedByZeros) return num;
              else if (sign && numStr === "-" + numTrimmedByZeros) return num;
              else return str;
            }
            if (leadingZeros) {
              return numTrimmedByZeros === numStr ||
                sign + numTrimmedByZeros === numStr
                ? num
                : str;
            } else {
              return trimmedStr === numStr || trimmedStr === sign + numStr
                ? num
                : str;
            }
          }
        } else {
          return str;
        }
      }
    }
    __name(toNumber, "toNumber");
    function trimZeros(numStr) {
      if (numStr && numStr.indexOf(".") !== -1) {
        numStr = numStr.replace(/0+$/, "");
        if (numStr === ".") numStr = "0";
        else if (numStr[0] === ".") numStr = "0" + numStr;
        else if (numStr[numStr.length - 1] === ".")
          numStr = numStr.substr(0, numStr.length - 1);
        return numStr;
      }
      return numStr;
    }
    __name(trimZeros, "trimZeros");
    function parse_int(numStr, base) {
      if (parseInt) return parseInt(numStr, base);
      else if (Number.parseInt) return Number.parseInt(numStr, base);
      else if (window && window.parseInt) return window.parseInt(numStr, base);
      else
        throw new Error(
          "parseInt, Number.parseInt, window.parseInt are not supported",
        );
    }
    __name(parse_int, "parse_int");
    module.exports = toNumber;
  },
});

// ../node_modules/fast-xml-parser/src/ignoreAttributes.js
var require_ignoreAttributes = __commonJS({
  "../node_modules/fast-xml-parser/src/ignoreAttributes.js"(exports, module) {
    init_functionsRoutes_0_5277810449847653();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    function getIgnoreAttributesFn(ignoreAttributes) {
      if (typeof ignoreAttributes === "function") {
        return ignoreAttributes;
      }
      if (Array.isArray(ignoreAttributes)) {
        return (attrName) => {
          for (const pattern of ignoreAttributes) {
            if (typeof pattern === "string" && attrName === pattern) {
              return true;
            }
            if (pattern instanceof RegExp && pattern.test(attrName)) {
              return true;
            }
          }
        };
      }
      return () => false;
    }
    __name(getIgnoreAttributesFn, "getIgnoreAttributesFn");
    module.exports = getIgnoreAttributesFn;
  },
});

// ../node_modules/fast-xml-parser/src/xmlparser/OrderedObjParser.js
var require_OrderedObjParser = __commonJS({
  "../node_modules/fast-xml-parser/src/xmlparser/OrderedObjParser.js"(
    exports,
    module,
  ) {
    "use strict";
    init_functionsRoutes_0_5277810449847653();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    var util = require_util();
    var xmlNode = require_xmlNode();
    var DocTypeReader = require_DocTypeReader();
    var toNumber = require_strnum();
    var getIgnoreAttributesFn = require_ignoreAttributes();
    var OrderedObjParser = class {
      static {
        __name(this, "OrderedObjParser");
      }
      constructor(options) {
        this.options = options;
        this.currentNode = null;
        this.tagsNodeStack = [];
        this.docTypeEntities = {};
        this.lastEntities = {
          apos: { regex: /&(apos|#39|#x27);/g, val: "'" },
          gt: { regex: /&(gt|#62|#x3E);/g, val: ">" },
          lt: { regex: /&(lt|#60|#x3C);/g, val: "<" },
          quot: { regex: /&(quot|#34|#x22);/g, val: '"' },
        };
        this.ampEntity = { regex: /&(amp|#38|#x26);/g, val: "&" };
        this.htmlEntities = {
          space: { regex: /&(nbsp|#160);/g, val: " " },
          // "lt" : { regex: /&(lt|#60);/g, val: "<" },
          // "gt" : { regex: /&(gt|#62);/g, val: ">" },
          // "amp" : { regex: /&(amp|#38);/g, val: "&" },
          // "quot" : { regex: /&(quot|#34);/g, val: "\"" },
          // "apos" : { regex: /&(apos|#39);/g, val: "'" },
          cent: { regex: /&(cent|#162);/g, val: "\xA2" },
          pound: { regex: /&(pound|#163);/g, val: "\xA3" },
          yen: { regex: /&(yen|#165);/g, val: "\xA5" },
          euro: { regex: /&(euro|#8364);/g, val: "\u20AC" },
          copyright: { regex: /&(copy|#169);/g, val: "\xA9" },
          reg: { regex: /&(reg|#174);/g, val: "\xAE" },
          inr: { regex: /&(inr|#8377);/g, val: "\u20B9" },
          num_dec: {
            regex: /&#([0-9]{1,7});/g,
            val: /* @__PURE__ */ __name(
              (_, str) => fromCodePoint(str, 10, "&#"),
              "val",
            ),
          },
          num_hex: {
            regex: /&#x([0-9a-fA-F]{1,6});/g,
            val: /* @__PURE__ */ __name(
              (_, str) => fromCodePoint(str, 16, "&#x"),
              "val",
            ),
          },
        };
        this.addExternalEntities = addExternalEntities;
        this.parseXml = parseXml;
        this.parseTextData = parseTextData;
        this.resolveNameSpace = resolveNameSpace;
        this.buildAttributesMap = buildAttributesMap;
        this.isItStopNode = isItStopNode;
        this.replaceEntitiesValue = replaceEntitiesValue;
        this.readStopNodeData = readStopNodeData;
        this.saveTextToParentTag = saveTextToParentTag;
        this.addChild = addChild;
        this.ignoreAttributesFn = getIgnoreAttributesFn(
          this.options.ignoreAttributes,
        );
        this.entityExpansionCount = 0;
        this.currentExpandedLength = 0;
        if (this.options.stopNodes && this.options.stopNodes.length > 0) {
          this.stopNodesExact = /* @__PURE__ */ new Set();
          this.stopNodesWildcard = /* @__PURE__ */ new Set();
          for (let i = 0; i < this.options.stopNodes.length; i++) {
            const stopNodeExp = this.options.stopNodes[i];
            if (typeof stopNodeExp !== "string") continue;
            if (stopNodeExp.startsWith("*.")) {
              this.stopNodesWildcard.add(stopNodeExp.substring(2));
            } else {
              this.stopNodesExact.add(stopNodeExp);
            }
          }
        }
      }
    };
    function addExternalEntities(externalEntities) {
      const entKeys = Object.keys(externalEntities);
      for (let i = 0; i < entKeys.length; i++) {
        const ent = entKeys[i];
        const escaped = ent.replace(/[.\-+*:]/g, "\\.");
        this.lastEntities[ent] = {
          regex: new RegExp("&" + escaped + ";", "g"),
          val: externalEntities[ent],
        };
      }
    }
    __name(addExternalEntities, "addExternalEntities");
    function parseTextData(
      val,
      tagName,
      jPath,
      dontTrim,
      hasAttributes,
      isLeafNode,
      escapeEntities,
    ) {
      if (val !== void 0) {
        if (this.options.trimValues && !dontTrim) {
          val = val.trim();
        }
        if (val.length > 0) {
          if (!escapeEntities)
            val = this.replaceEntitiesValue(val, tagName, jPath);
          const newval = this.options.tagValueProcessor(
            tagName,
            val,
            jPath,
            hasAttributes,
            isLeafNode,
          );
          if (newval === null || newval === void 0) {
            return val;
          } else if (typeof newval !== typeof val || newval !== val) {
            return newval;
          } else if (this.options.trimValues) {
            return parseValue(
              val,
              this.options.parseTagValue,
              this.options.numberParseOptions,
            );
          } else {
            const trimmedVal = val.trim();
            if (trimmedVal === val) {
              return parseValue(
                val,
                this.options.parseTagValue,
                this.options.numberParseOptions,
              );
            } else {
              return val;
            }
          }
        }
      }
    }
    __name(parseTextData, "parseTextData");
    function resolveNameSpace(tagname) {
      if (this.options.removeNSPrefix) {
        const tags = tagname.split(":");
        const prefix = tagname.charAt(0) === "/" ? "/" : "";
        if (tags[0] === "xmlns") {
          return "";
        }
        if (tags.length === 2) {
          tagname = prefix + tags[1];
        }
      }
      return tagname;
    }
    __name(resolveNameSpace, "resolveNameSpace");
    var attrsRegx = new RegExp(
      `([^\\s=]+)\\s*(=\\s*(['"])([\\s\\S]*?)\\3)?`,
      "gm",
    );
    function buildAttributesMap(attrStr, jPath, tagName) {
      if (
        this.options.ignoreAttributes !== true &&
        typeof attrStr === "string"
      ) {
        const matches = util.getAllMatches(attrStr, attrsRegx);
        const len = matches.length;
        const attrs = {};
        for (let i = 0; i < len; i++) {
          const attrName = this.resolveNameSpace(matches[i][1]);
          if (this.ignoreAttributesFn(attrName, jPath)) {
            continue;
          }
          let oldVal = matches[i][4];
          let aName = this.options.attributeNamePrefix + attrName;
          if (attrName.length) {
            if (this.options.transformAttributeName) {
              aName = this.options.transformAttributeName(aName);
            }
            aName = sanitizeName(aName, this.options);
            if (oldVal !== void 0) {
              if (this.options.trimValues) {
                oldVal = oldVal.trim();
              }
              oldVal = this.replaceEntitiesValue(oldVal, tagName, jPath);
              const newVal = this.options.attributeValueProcessor(
                attrName,
                oldVal,
                jPath,
              );
              if (newVal === null || newVal === void 0) {
                attrs[aName] = oldVal;
              } else if (typeof newVal !== typeof oldVal || newVal !== oldVal) {
                attrs[aName] = newVal;
              } else {
                attrs[aName] = parseValue(
                  oldVal,
                  this.options.parseAttributeValue,
                  this.options.numberParseOptions,
                );
              }
            } else if (this.options.allowBooleanAttributes) {
              attrs[aName] = true;
            }
          }
        }
        if (!Object.keys(attrs).length) {
          return;
        }
        if (this.options.attributesGroupName) {
          const attrCollection = {};
          attrCollection[this.options.attributesGroupName] = attrs;
          return attrCollection;
        }
        return attrs;
      }
    }
    __name(buildAttributesMap, "buildAttributesMap");
    var parseXml = /* @__PURE__ */ __name(function (xmlData) {
      xmlData = xmlData.replace(/\r\n?/g, "\n");
      const xmlObj = new xmlNode("!xml");
      let currentNode = xmlObj;
      let textData = "";
      let jPath = "";
      this.entityExpansionCount = 0;
      this.currentExpandedLength = 0;
      const docTypeReader = new DocTypeReader(this.options.processEntities);
      for (let i = 0; i < xmlData.length; i++) {
        const ch = xmlData[i];
        if (ch === "<") {
          if (xmlData[i + 1] === "/") {
            const closeIndex = findClosingIndex(
              xmlData,
              ">",
              i,
              "Closing Tag is not closed.",
            );
            let tagName = xmlData.substring(i + 2, closeIndex).trim();
            if (this.options.removeNSPrefix) {
              const colonIndex = tagName.indexOf(":");
              if (colonIndex !== -1) {
                tagName = tagName.substr(colonIndex + 1);
              }
            }
            if (this.options.transformTagName) {
              tagName = this.options.transformTagName(tagName);
            }
            if (currentNode) {
              textData = this.saveTextToParentTag(textData, currentNode, jPath);
            }
            const lastTagName = jPath.substring(jPath.lastIndexOf(".") + 1);
            if (tagName && this.options.unpairedTags.indexOf(tagName) !== -1) {
              throw new Error(
                `Unpaired tag can not be used as closing tag: </${tagName}>`,
              );
            }
            let propIndex = 0;
            if (
              lastTagName &&
              this.options.unpairedTags.indexOf(lastTagName) !== -1
            ) {
              propIndex = jPath.lastIndexOf(".", jPath.lastIndexOf(".") - 1);
              this.tagsNodeStack.pop();
            } else {
              propIndex = jPath.lastIndexOf(".");
            }
            jPath = jPath.substring(0, propIndex);
            currentNode = this.tagsNodeStack.pop();
            textData = "";
            i = closeIndex;
          } else if (xmlData[i + 1] === "?") {
            let tagData = readTagExp(xmlData, i, false, "?>");
            if (!tagData) throw new Error("Pi Tag is not closed.");
            textData = this.saveTextToParentTag(textData, currentNode, jPath);
            if (
              (this.options.ignoreDeclaration && tagData.tagName === "?xml") ||
              this.options.ignorePiTags
            ) {
            } else {
              const childNode = new xmlNode(tagData.tagName);
              childNode.add(this.options.textNodeName, "");
              if (
                tagData.tagName !== tagData.tagExp &&
                tagData.attrExpPresent
              ) {
                childNode[":@"] = this.buildAttributesMap(
                  tagData.tagExp,
                  jPath,
                  tagData.tagName,
                );
              }
              this.addChild(currentNode, childNode, jPath, i);
            }
            i = tagData.closeIndex + 1;
          } else if (xmlData.substr(i + 1, 3) === "!--") {
            const endIndex = findClosingIndex(
              xmlData,
              "-->",
              i + 4,
              "Comment is not closed.",
            );
            if (this.options.commentPropName) {
              const comment = xmlData.substring(i + 4, endIndex - 2);
              textData = this.saveTextToParentTag(textData, currentNode, jPath);
              currentNode.add(this.options.commentPropName, [
                { [this.options.textNodeName]: comment },
              ]);
            }
            i = endIndex;
          } else if (xmlData.substr(i + 1, 2) === "!D") {
            const result = docTypeReader.readDocType(xmlData, i);
            this.docTypeEntities = result.entities;
            i = result.i;
          } else if (xmlData.substr(i + 1, 2) === "![") {
            const closeIndex =
              findClosingIndex(xmlData, "]]>", i, "CDATA is not closed.") - 2;
            const tagExp = xmlData.substring(i + 9, closeIndex);
            textData = this.saveTextToParentTag(textData, currentNode, jPath);
            let val = this.parseTextData(
              tagExp,
              currentNode.tagname,
              jPath,
              true,
              false,
              true,
              true,
            );
            if (val == void 0) val = "";
            if (this.options.cdataPropName) {
              currentNode.add(this.options.cdataPropName, [
                { [this.options.textNodeName]: tagExp },
              ]);
            } else {
              currentNode.add(this.options.textNodeName, val);
            }
            i = closeIndex + 2;
          } else {
            let result = readTagExp(xmlData, i, this.options.removeNSPrefix);
            let tagName = result.tagName;
            const rawTagName = result.rawTagName;
            let tagExp = result.tagExp;
            let attrExpPresent = result.attrExpPresent;
            let closeIndex = result.closeIndex;
            if (this.options.transformTagName) {
              const newTagName = this.options.transformTagName(tagName);
              if (tagExp === tagName) {
                tagExp = newTagName;
              }
              tagName = newTagName;
            }
            if (
              this.options.strictReservedNames &&
              (tagName === this.options.commentPropName ||
                tagName === this.options.cdataPropName ||
                tagName === this.options.textNodeName ||
                tagName === this.options.attributesGroupName)
            ) {
              throw new Error(`Invalid tag name: ${tagName}`);
            }
            if (currentNode && textData) {
              if (currentNode.tagname !== "!xml") {
                textData = this.saveTextToParentTag(
                  textData,
                  currentNode,
                  jPath,
                  false,
                );
              }
            }
            const lastTag = currentNode;
            if (
              lastTag &&
              this.options.unpairedTags.indexOf(lastTag.tagname) !== -1
            ) {
              currentNode = this.tagsNodeStack.pop();
              jPath = jPath.substring(0, jPath.lastIndexOf("."));
            }
            if (tagName !== xmlObj.tagname) {
              jPath += jPath ? "." + tagName : tagName;
            }
            const startIndex = i;
            if (
              this.isItStopNode(
                this.stopNodesExact,
                this.stopNodesWildcard,
                jPath,
                tagName,
              )
            ) {
              let tagContent = "";
              if (
                tagExp.length > 0 &&
                tagExp.lastIndexOf("/") === tagExp.length - 1
              ) {
                if (tagName[tagName.length - 1] === "/") {
                  tagName = tagName.substr(0, tagName.length - 1);
                  jPath = jPath.substr(0, jPath.length - 1);
                  tagExp = tagName;
                } else {
                  tagExp = tagExp.substr(0, tagExp.length - 1);
                }
                i = result.closeIndex;
              } else if (this.options.unpairedTags.indexOf(tagName) !== -1) {
                i = result.closeIndex;
              } else {
                const result2 = this.readStopNodeData(
                  xmlData,
                  rawTagName,
                  closeIndex + 1,
                );
                if (!result2)
                  throw new Error(`Unexpected end of ${rawTagName}`);
                i = result2.i;
                tagContent = result2.tagContent;
              }
              const childNode = new xmlNode(tagName);
              if (tagName !== tagExp && attrExpPresent) {
                childNode[":@"] = this.buildAttributesMap(
                  tagExp,
                  jPath,
                  tagName,
                );
              }
              if (tagContent) {
                tagContent = this.parseTextData(
                  tagContent,
                  tagName,
                  jPath,
                  true,
                  attrExpPresent,
                  true,
                  true,
                );
              }
              jPath = jPath.substr(0, jPath.lastIndexOf("."));
              childNode.add(this.options.textNodeName, tagContent);
              this.addChild(currentNode, childNode, jPath, startIndex);
            } else {
              if (
                tagExp.length > 0 &&
                tagExp.lastIndexOf("/") === tagExp.length - 1
              ) {
                if (tagName[tagName.length - 1] === "/") {
                  tagName = tagName.substr(0, tagName.length - 1);
                  jPath = jPath.substr(0, jPath.length - 1);
                  tagExp = tagName;
                } else {
                  tagExp = tagExp.substr(0, tagExp.length - 1);
                }
                if (this.options.transformTagName) {
                  const newTagName = this.options.transformTagName(tagName);
                  if (tagExp === tagName) {
                    tagExp = newTagName;
                  }
                  tagName = newTagName;
                }
                const childNode = new xmlNode(tagName);
                if (tagName !== tagExp && attrExpPresent) {
                  childNode[":@"] = this.buildAttributesMap(
                    tagExp,
                    jPath,
                    tagName,
                  );
                }
                this.addChild(currentNode, childNode, jPath, startIndex);
                jPath = jPath.substr(0, jPath.lastIndexOf("."));
              } else if (this.options.unpairedTags.indexOf(tagName) !== -1) {
                const childNode = new xmlNode(tagName);
                if (tagName !== tagExp && attrExpPresent) {
                  childNode[":@"] = this.buildAttributesMap(tagExp, jPath);
                }
                this.addChild(currentNode, childNode, jPath, startIndex);
                jPath = jPath.substr(0, jPath.lastIndexOf("."));
                i = result.closeIndex;
                continue;
              } else {
                const childNode = new xmlNode(tagName);
                if (this.tagsNodeStack.length > this.options.maxNestedTags) {
                  throw new Error("Maximum nested tags exceeded");
                }
                this.tagsNodeStack.push(currentNode);
                if (tagName !== tagExp && attrExpPresent) {
                  childNode[":@"] = this.buildAttributesMap(
                    tagExp,
                    jPath,
                    tagName,
                  );
                }
                this.addChild(currentNode, childNode, jPath);
                currentNode = childNode;
              }
              textData = "";
              i = closeIndex;
            }
          }
        } else {
          textData += xmlData[i];
        }
      }
      return xmlObj.child;
    }, "parseXml");
    function addChild(currentNode, childNode, jPath, startIndex) {
      if (!this.options.captureMetaData) startIndex = void 0;
      const result = this.options.updateTag(
        childNode.tagname,
        jPath,
        childNode[":@"],
      );
      if (result === false) {
      } else if (typeof result === "string") {
        childNode.tagname = result;
        currentNode.addChild(childNode, startIndex);
      } else {
        currentNode.addChild(childNode, startIndex);
      }
    }
    __name(addChild, "addChild");
    var replaceEntitiesValue = /* @__PURE__ */ __name(function (
      val,
      tagName,
      jPath,
    ) {
      if (val.indexOf("&") === -1) {
        return val;
      }
      const entityConfig = this.options.processEntities;
      if (!entityConfig.enabled) {
        return val;
      }
      if (entityConfig.allowedTags) {
        if (!entityConfig.allowedTags.includes(tagName)) {
          return val;
        }
      }
      if (entityConfig.tagFilter) {
        if (!entityConfig.tagFilter(tagName, jPath)) {
          return val;
        }
      }
      for (let entityName in this.docTypeEntities) {
        const entity = this.docTypeEntities[entityName];
        const matches = val.match(entity.regx);
        if (matches) {
          this.entityExpansionCount += matches.length;
          if (
            entityConfig.maxTotalExpansions &&
            this.entityExpansionCount > entityConfig.maxTotalExpansions
          ) {
            throw new Error(
              `Entity expansion limit exceeded: ${this.entityExpansionCount} > ${entityConfig.maxTotalExpansions}`,
            );
          }
          const lengthBefore = val.length;
          val = val.replace(entity.regx, entity.val);
          if (entityConfig.maxExpandedLength) {
            this.currentExpandedLength += val.length - lengthBefore;
            if (this.currentExpandedLength > entityConfig.maxExpandedLength) {
              throw new Error(
                `Total expanded content size exceeded: ${this.currentExpandedLength} > ${entityConfig.maxExpandedLength}`,
              );
            }
          }
        }
      }
      if (val.indexOf("&") === -1) return val;
      for (const entityName of Object.keys(this.lastEntities)) {
        const entity = this.lastEntities[entityName];
        const matches = val.match(entity.regex);
        if (matches) {
          this.entityExpansionCount += matches.length;
          if (
            entityConfig.maxTotalExpansions &&
            this.entityExpansionCount > entityConfig.maxTotalExpansions
          ) {
            throw new Error(
              `Entity expansion limit exceeded: ${this.entityExpansionCount} > ${entityConfig.maxTotalExpansions}`,
            );
          }
        }
        val = val.replace(entity.regex, entity.val);
      }
      if (val.indexOf("&") === -1) return val;
      if (this.options.htmlEntities) {
        for (const entityName of Object.keys(this.htmlEntities)) {
          const entity = this.htmlEntities[entityName];
          const matches = val.match(entity.regex);
          if (matches) {
            this.entityExpansionCount += matches.length;
            if (
              entityConfig.maxTotalExpansions &&
              this.entityExpansionCount > entityConfig.maxTotalExpansions
            ) {
              throw new Error(
                `Entity expansion limit exceeded: ${this.entityExpansionCount} > ${entityConfig.maxTotalExpansions}`,
              );
            }
          }
          val = val.replace(entity.regex, entity.val);
        }
      }
      val = val.replace(this.ampEntity.regex, this.ampEntity.val);
      return val;
    }, "replaceEntitiesValue");
    function saveTextToParentTag(textData, parentNode, jPath, isLeafNode) {
      if (textData) {
        if (isLeafNode === void 0) isLeafNode = parentNode.child.length === 0;
        textData = this.parseTextData(
          textData,
          parentNode.tagname,
          jPath,
          false,
          parentNode[":@"] ? Object.keys(parentNode[":@"]).length !== 0 : false,
          isLeafNode,
        );
        if (textData !== void 0 && textData !== "")
          parentNode.add(this.options.textNodeName, textData);
        textData = "";
      }
      return textData;
    }
    __name(saveTextToParentTag, "saveTextToParentTag");
    function isItStopNode(
      stopNodesExact,
      stopNodesWildcard,
      jPath,
      currentTagName,
    ) {
      if (stopNodesWildcard && stopNodesWildcard.has(currentTagName))
        return true;
      if (stopNodesExact && stopNodesExact.has(jPath)) return true;
      return false;
    }
    __name(isItStopNode, "isItStopNode");
    function tagExpWithClosingIndex(xmlData, i, closingChar = ">") {
      let attrBoundary;
      let tagExp = "";
      for (let index = i; index < xmlData.length; index++) {
        let ch = xmlData[index];
        if (attrBoundary) {
          if (ch === attrBoundary) attrBoundary = "";
        } else if (ch === '"' || ch === "'") {
          attrBoundary = ch;
        } else if (ch === closingChar[0]) {
          if (closingChar[1]) {
            if (xmlData[index + 1] === closingChar[1]) {
              return {
                data: tagExp,
                index,
              };
            }
          } else {
            return {
              data: tagExp,
              index,
            };
          }
        } else if (ch === "	") {
          ch = " ";
        }
        tagExp += ch;
      }
    }
    __name(tagExpWithClosingIndex, "tagExpWithClosingIndex");
    function findClosingIndex(xmlData, str, i, errMsg) {
      const closingIndex = xmlData.indexOf(str, i);
      if (closingIndex === -1) {
        throw new Error(errMsg);
      } else {
        return closingIndex + str.length - 1;
      }
    }
    __name(findClosingIndex, "findClosingIndex");
    function readTagExp(xmlData, i, removeNSPrefix, closingChar = ">") {
      const result = tagExpWithClosingIndex(xmlData, i + 1, closingChar);
      if (!result) return;
      let tagExp = result.data;
      const closeIndex = result.index;
      const separatorIndex = tagExp.search(/\s/);
      let tagName = tagExp;
      let attrExpPresent = true;
      if (separatorIndex !== -1) {
        tagName = tagExp.substring(0, separatorIndex);
        tagExp = tagExp.substring(separatorIndex + 1).trimStart();
      }
      const rawTagName = tagName;
      if (removeNSPrefix) {
        const colonIndex = tagName.indexOf(":");
        if (colonIndex !== -1) {
          tagName = tagName.substr(colonIndex + 1);
          attrExpPresent = tagName !== result.data.substr(colonIndex + 1);
        }
      }
      return {
        tagName,
        tagExp,
        closeIndex,
        attrExpPresent,
        rawTagName,
      };
    }
    __name(readTagExp, "readTagExp");
    function readStopNodeData(xmlData, tagName, i) {
      const startIndex = i;
      let openTagCount = 1;
      for (; i < xmlData.length; i++) {
        if (xmlData[i] === "<") {
          if (xmlData[i + 1] === "/") {
            const closeIndex = findClosingIndex(
              xmlData,
              ">",
              i,
              `${tagName} is not closed`,
            );
            let closeTagName = xmlData.substring(i + 2, closeIndex).trim();
            if (closeTagName === tagName) {
              openTagCount--;
              if (openTagCount === 0) {
                return {
                  tagContent: xmlData.substring(startIndex, i),
                  i: closeIndex,
                };
              }
            }
            i = closeIndex;
          } else if (xmlData[i + 1] === "?") {
            const closeIndex = findClosingIndex(
              xmlData,
              "?>",
              i + 1,
              "StopNode is not closed.",
            );
            i = closeIndex;
          } else if (xmlData.substr(i + 1, 3) === "!--") {
            const closeIndex = findClosingIndex(
              xmlData,
              "-->",
              i + 3,
              "StopNode is not closed.",
            );
            i = closeIndex;
          } else if (xmlData.substr(i + 1, 2) === "![") {
            const closeIndex =
              findClosingIndex(xmlData, "]]>", i, "StopNode is not closed.") -
              2;
            i = closeIndex;
          } else {
            const tagData = readTagExp(xmlData, i, ">");
            if (tagData) {
              const openTagName = tagData && tagData.tagName;
              if (
                openTagName === tagName &&
                tagData.tagExp[tagData.tagExp.length - 1] !== "/"
              ) {
                openTagCount++;
              }
              i = tagData.closeIndex;
            }
          }
        }
      }
    }
    __name(readStopNodeData, "readStopNodeData");
    function parseValue(val, shouldParse, options) {
      if (shouldParse && typeof val === "string") {
        const newval = val.trim();
        if (newval === "true") return true;
        else if (newval === "false") return false;
        else return toNumber(val, options);
      } else {
        if (util.isExist(val)) {
          return val;
        } else {
          return "";
        }
      }
    }
    __name(parseValue, "parseValue");
    function fromCodePoint(str, base, prefix) {
      const codePoint = Number.parseInt(str, base);
      if (codePoint >= 0 && codePoint <= 1114111) {
        return String.fromCodePoint(codePoint);
      } else {
        return prefix + str + ";";
      }
    }
    __name(fromCodePoint, "fromCodePoint");
    function sanitizeName(name, options) {
      if (util.criticalProperties.includes(name)) {
        throw new Error(
          `[SECURITY] Invalid name: "${name}" is a reserved JavaScript keyword that could cause prototype pollution`,
        );
      } else if (util.DANGEROUS_PROPERTY_NAMES.includes(name)) {
        return options.onDangerousProperty(name);
      }
      return name;
    }
    __name(sanitizeName, "sanitizeName");
    module.exports = OrderedObjParser;
  },
});

// ../node_modules/fast-xml-parser/src/xmlparser/node2json.js
var require_node2json = __commonJS({
  "../node_modules/fast-xml-parser/src/xmlparser/node2json.js"(exports) {
    "use strict";
    init_functionsRoutes_0_5277810449847653();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    function prettify(node, options) {
      return compress(node, options);
    }
    __name(prettify, "prettify");
    function compress(arr, options, jPath) {
      let text;
      const compressedObj = {};
      for (let i = 0; i < arr.length; i++) {
        const tagObj = arr[i];
        const property = propName(tagObj);
        let newJpath = "";
        if (jPath === void 0) newJpath = property;
        else newJpath = jPath + "." + property;
        if (property === options.textNodeName) {
          if (text === void 0) text = tagObj[property];
          else text += "" + tagObj[property];
        } else if (property === void 0) {
          continue;
        } else if (tagObj[property]) {
          let val = compress(tagObj[property], options, newJpath);
          const isLeaf = isLeafTag(val, options);
          if (tagObj[":@"]) {
            assignAttributes(val, tagObj[":@"], newJpath, options);
          } else if (
            Object.keys(val).length === 1 &&
            val[options.textNodeName] !== void 0 &&
            !options.alwaysCreateTextNode
          ) {
            val = val[options.textNodeName];
          } else if (Object.keys(val).length === 0) {
            if (options.alwaysCreateTextNode) val[options.textNodeName] = "";
            else val = "";
          }
          if (
            compressedObj[property] !== void 0 &&
            compressedObj.hasOwnProperty(property)
          ) {
            if (!Array.isArray(compressedObj[property])) {
              compressedObj[property] = [compressedObj[property]];
            }
            compressedObj[property].push(val);
          } else {
            if (options.isArray(property, newJpath, isLeaf)) {
              compressedObj[property] = [val];
            } else {
              compressedObj[property] = val;
            }
          }
        }
      }
      if (typeof text === "string") {
        if (text.length > 0) compressedObj[options.textNodeName] = text;
      } else if (text !== void 0) compressedObj[options.textNodeName] = text;
      return compressedObj;
    }
    __name(compress, "compress");
    function propName(obj) {
      const keys = Object.keys(obj);
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        if (key !== ":@") return key;
      }
    }
    __name(propName, "propName");
    function assignAttributes(obj, attrMap, jpath, options) {
      if (attrMap) {
        const keys = Object.keys(attrMap);
        const len = keys.length;
        for (let i = 0; i < len; i++) {
          const atrrName = keys[i];
          if (options.isArray(atrrName, jpath + "." + atrrName, true, true)) {
            obj[atrrName] = [attrMap[atrrName]];
          } else {
            obj[atrrName] = attrMap[atrrName];
          }
        }
      }
    }
    __name(assignAttributes, "assignAttributes");
    function isLeafTag(obj, options) {
      const { textNodeName } = options;
      const propCount = Object.keys(obj).length;
      if (propCount === 0) {
        return true;
      }
      if (
        propCount === 1 &&
        (obj[textNodeName] ||
          typeof obj[textNodeName] === "boolean" ||
          obj[textNodeName] === 0)
      ) {
        return true;
      }
      return false;
    }
    __name(isLeafTag, "isLeafTag");
    exports.prettify = prettify;
  },
});

// ../node_modules/fast-xml-parser/src/xmlparser/XMLParser.js
var require_XMLParser = __commonJS({
  "../node_modules/fast-xml-parser/src/xmlparser/XMLParser.js"(
    exports,
    module,
  ) {
    init_functionsRoutes_0_5277810449847653();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    var { buildOptions } = require_OptionsBuilder();
    var OrderedObjParser = require_OrderedObjParser();
    var { prettify } = require_node2json();
    var validator = require_validator();
    var XMLParser2 = class {
      static {
        __name(this, "XMLParser");
      }
      constructor(options) {
        this.externalEntities = {};
        this.options = buildOptions(options);
      }
      /**
       * Parse XML dats to JS object
       * @param {string|Buffer} xmlData
       * @param {boolean|Object} validationOption
       */
      parse(xmlData, validationOption) {
        if (typeof xmlData === "string") {
        } else if (xmlData.toString) {
          xmlData = xmlData.toString();
        } else {
          throw new Error("XML data is accepted in String or Bytes[] form.");
        }
        if (validationOption) {
          if (validationOption === true) validationOption = {};
          const result = validator.validate(xmlData, validationOption);
          if (result !== true) {
            throw Error(
              `${result.err.msg}:${result.err.line}:${result.err.col}`,
            );
          }
        }
        const orderedObjParser = new OrderedObjParser(this.options);
        orderedObjParser.addExternalEntities(this.externalEntities);
        const orderedResult = orderedObjParser.parseXml(xmlData);
        if (this.options.preserveOrder || orderedResult === void 0)
          return orderedResult;
        else return prettify(orderedResult, this.options);
      }
      /**
       * Add Entity which is not by default supported by this library
       * @param {string} key
       * @param {string} value
       */
      addEntity(key, value) {
        if (value.indexOf("&") !== -1) {
          throw new Error("Entity value can't have '&'");
        } else if (key.indexOf("&") !== -1 || key.indexOf(";") !== -1) {
          throw new Error(
            "An entity must be set without '&' and ';'. Eg. use '#xD' for '&#xD;'",
          );
        } else if (value === "&") {
          throw new Error("An entity with value '&' is not permitted");
        } else {
          this.externalEntities[key] = value;
        }
      }
    };
    module.exports = XMLParser2;
  },
});

// ../node_modules/fast-xml-parser/src/xmlbuilder/orderedJs2Xml.js
var require_orderedJs2Xml = __commonJS({
  "../node_modules/fast-xml-parser/src/xmlbuilder/orderedJs2Xml.js"(
    exports,
    module,
  ) {
    init_functionsRoutes_0_5277810449847653();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    var EOL = "\n";
    function toXml(jArray, options) {
      let indentation = "";
      if (options.format && options.indentBy.length > 0) {
        indentation = EOL;
      }
      return arrToStr(jArray, options, "", indentation);
    }
    __name(toXml, "toXml");
    function arrToStr(arr, options, jPath, indentation) {
      let xmlStr = "";
      let isPreviousElementTag = false;
      if (!Array.isArray(arr)) {
        if (arr !== void 0 && arr !== null) {
          let text = arr.toString();
          text = replaceEntitiesValue(text, options);
          return text;
        }
        return "";
      }
      for (let i = 0; i < arr.length; i++) {
        const tagObj = arr[i];
        const tagName = propName(tagObj);
        if (tagName === void 0) continue;
        let newJPath = "";
        if (jPath.length === 0) newJPath = tagName;
        else newJPath = `${jPath}.${tagName}`;
        if (tagName === options.textNodeName) {
          let tagText = tagObj[tagName];
          if (!isStopNode(newJPath, options)) {
            tagText = options.tagValueProcessor(tagName, tagText);
            tagText = replaceEntitiesValue(tagText, options);
          }
          if (isPreviousElementTag) {
            xmlStr += indentation;
          }
          xmlStr += tagText;
          isPreviousElementTag = false;
          continue;
        } else if (tagName === options.cdataPropName) {
          if (isPreviousElementTag) {
            xmlStr += indentation;
          }
          xmlStr += `<![CDATA[${tagObj[tagName][0][options.textNodeName]}]]>`;
          isPreviousElementTag = false;
          continue;
        } else if (tagName === options.commentPropName) {
          xmlStr +=
            indentation + `<!--${tagObj[tagName][0][options.textNodeName]}-->`;
          isPreviousElementTag = true;
          continue;
        } else if (tagName[0] === "?") {
          const attStr2 = attr_to_str(tagObj[":@"], options);
          const tempInd = tagName === "?xml" ? "" : indentation;
          let piTextNodeName = tagObj[tagName][0][options.textNodeName];
          piTextNodeName =
            piTextNodeName.length !== 0 ? " " + piTextNodeName : "";
          xmlStr += tempInd + `<${tagName}${piTextNodeName}${attStr2}?>`;
          isPreviousElementTag = true;
          continue;
        }
        let newIdentation = indentation;
        if (newIdentation !== "") {
          newIdentation += options.indentBy;
        }
        const attStr = attr_to_str(tagObj[":@"], options);
        const tagStart = indentation + `<${tagName}${attStr}`;
        const tagValue = arrToStr(
          tagObj[tagName],
          options,
          newJPath,
          newIdentation,
        );
        if (options.unpairedTags.indexOf(tagName) !== -1) {
          if (options.suppressUnpairedNode) xmlStr += tagStart + ">";
          else xmlStr += tagStart + "/>";
        } else if (
          (!tagValue || tagValue.length === 0) &&
          options.suppressEmptyNode
        ) {
          xmlStr += tagStart + "/>";
        } else if (tagValue && tagValue.endsWith(">")) {
          xmlStr += tagStart + `>${tagValue}${indentation}</${tagName}>`;
        } else {
          xmlStr += tagStart + ">";
          if (
            tagValue &&
            indentation !== "" &&
            (tagValue.includes("/>") || tagValue.includes("</"))
          ) {
            xmlStr += indentation + options.indentBy + tagValue + indentation;
          } else {
            xmlStr += tagValue;
          }
          xmlStr += `</${tagName}>`;
        }
        isPreviousElementTag = true;
      }
      return xmlStr;
    }
    __name(arrToStr, "arrToStr");
    function propName(obj) {
      const keys = Object.keys(obj);
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        if (!Object.prototype.hasOwnProperty.call(obj, key)) continue;
        if (key !== ":@") return key;
      }
    }
    __name(propName, "propName");
    function attr_to_str(attrMap, options) {
      let attrStr = "";
      if (attrMap && !options.ignoreAttributes) {
        for (let attr in attrMap) {
          if (!Object.prototype.hasOwnProperty.call(attrMap, attr)) continue;
          let attrVal = options.attributeValueProcessor(attr, attrMap[attr]);
          attrVal = replaceEntitiesValue(attrVal, options);
          if (attrVal === true && options.suppressBooleanAttributes) {
            attrStr += ` ${attr.substr(options.attributeNamePrefix.length)}`;
          } else {
            attrStr += ` ${attr.substr(options.attributeNamePrefix.length)}="${attrVal}"`;
          }
        }
      }
      return attrStr;
    }
    __name(attr_to_str, "attr_to_str");
    function isStopNode(jPath, options) {
      jPath = jPath.substr(0, jPath.length - options.textNodeName.length - 1);
      let tagName = jPath.substr(jPath.lastIndexOf(".") + 1);
      for (let index in options.stopNodes) {
        if (
          options.stopNodes[index] === jPath ||
          options.stopNodes[index] === "*." + tagName
        )
          return true;
      }
      return false;
    }
    __name(isStopNode, "isStopNode");
    function replaceEntitiesValue(textValue, options) {
      if (textValue && textValue.length > 0 && options.processEntities) {
        for (let i = 0; i < options.entities.length; i++) {
          const entity = options.entities[i];
          textValue = textValue.replace(entity.regex, entity.val);
        }
      }
      return textValue;
    }
    __name(replaceEntitiesValue, "replaceEntitiesValue");
    module.exports = toXml;
  },
});

// ../node_modules/fast-xml-parser/src/xmlbuilder/json2xml.js
var require_json2xml = __commonJS({
  "../node_modules/fast-xml-parser/src/xmlbuilder/json2xml.js"(
    exports,
    module,
  ) {
    "use strict";
    init_functionsRoutes_0_5277810449847653();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    var buildFromOrderedJs = require_orderedJs2Xml();
    var getIgnoreAttributesFn = require_ignoreAttributes();
    var defaultOptions = {
      attributeNamePrefix: "@_",
      attributesGroupName: false,
      textNodeName: "#text",
      ignoreAttributes: true,
      cdataPropName: false,
      format: false,
      indentBy: "  ",
      suppressEmptyNode: false,
      suppressUnpairedNode: true,
      suppressBooleanAttributes: true,
      tagValueProcessor: /* @__PURE__ */ __name(function (key, a) {
        return a;
      }, "tagValueProcessor"),
      attributeValueProcessor: /* @__PURE__ */ __name(function (attrName, a) {
        return a;
      }, "attributeValueProcessor"),
      preserveOrder: false,
      commentPropName: false,
      unpairedTags: [],
      entities: [
        { regex: new RegExp("&", "g"), val: "&amp;" },
        //it must be on top
        { regex: new RegExp(">", "g"), val: "&gt;" },
        { regex: new RegExp("<", "g"), val: "&lt;" },
        { regex: new RegExp("'", "g"), val: "&apos;" },
        { regex: new RegExp('"', "g"), val: "&quot;" },
      ],
      processEntities: true,
      stopNodes: [],
      // transformTagName: false,
      // transformAttributeName: false,
      oneListGroup: false,
    };
    function Builder(options) {
      this.options = Object.assign({}, defaultOptions, options);
      if (
        this.options.ignoreAttributes === true ||
        this.options.attributesGroupName
      ) {
        this.isAttribute = function () {
          return false;
        };
      } else {
        this.ignoreAttributesFn = getIgnoreAttributesFn(
          this.options.ignoreAttributes,
        );
        this.attrPrefixLen = this.options.attributeNamePrefix.length;
        this.isAttribute = isAttribute;
      }
      this.processTextOrObjNode = processTextOrObjNode;
      if (this.options.format) {
        this.indentate = indentate;
        this.tagEndChar = ">\n";
        this.newLine = "\n";
      } else {
        this.indentate = function () {
          return "";
        };
        this.tagEndChar = ">";
        this.newLine = "";
      }
    }
    __name(Builder, "Builder");
    Builder.prototype.build = function (jObj) {
      if (this.options.preserveOrder) {
        return buildFromOrderedJs(jObj, this.options);
      } else {
        if (
          Array.isArray(jObj) &&
          this.options.arrayNodeName &&
          this.options.arrayNodeName.length > 1
        ) {
          jObj = {
            [this.options.arrayNodeName]: jObj,
          };
        }
        return this.j2x(jObj, 0, []).val;
      }
    };
    Builder.prototype.j2x = function (jObj, level, ajPath) {
      let attrStr = "";
      let val = "";
      const jPath = ajPath.join(".");
      for (let key in jObj) {
        if (!Object.prototype.hasOwnProperty.call(jObj, key)) continue;
        if (typeof jObj[key] === "undefined") {
          if (this.isAttribute(key)) {
            val += "";
          }
        } else if (jObj[key] === null) {
          if (this.isAttribute(key)) {
            val += "";
          } else if (key === this.options.cdataPropName) {
            val += "";
          } else if (key[0] === "?") {
            val += this.indentate(level) + "<" + key + "?" + this.tagEndChar;
          } else {
            val += this.indentate(level) + "<" + key + "/" + this.tagEndChar;
          }
        } else if (jObj[key] instanceof Date) {
          val += this.buildTextValNode(jObj[key], key, "", level);
        } else if (typeof jObj[key] !== "object") {
          const attr = this.isAttribute(key);
          if (attr && !this.ignoreAttributesFn(attr, jPath)) {
            attrStr += this.buildAttrPairStr(attr, "" + jObj[key]);
          } else if (!attr) {
            if (key === this.options.textNodeName) {
              let newval = this.options.tagValueProcessor(key, "" + jObj[key]);
              val += this.replaceEntitiesValue(newval);
            } else {
              val += this.buildTextValNode(jObj[key], key, "", level);
            }
          }
        } else if (Array.isArray(jObj[key])) {
          const arrLen = jObj[key].length;
          let listTagVal = "";
          let listTagAttr = "";
          for (let j = 0; j < arrLen; j++) {
            const item = jObj[key][j];
            if (typeof item === "undefined") {
            } else if (item === null) {
              if (key[0] === "?")
                val +=
                  this.indentate(level) + "<" + key + "?" + this.tagEndChar;
              else
                val +=
                  this.indentate(level) + "<" + key + "/" + this.tagEndChar;
            } else if (typeof item === "object") {
              if (this.options.oneListGroup) {
                const result = this.j2x(item, level + 1, ajPath.concat(key));
                listTagVal += result.val;
                if (
                  this.options.attributesGroupName &&
                  item.hasOwnProperty(this.options.attributesGroupName)
                ) {
                  listTagAttr += result.attrStr;
                }
              } else {
                listTagVal += this.processTextOrObjNode(
                  item,
                  key,
                  level,
                  ajPath,
                );
              }
            } else {
              if (this.options.oneListGroup) {
                let textValue = this.options.tagValueProcessor(key, item);
                textValue = this.replaceEntitiesValue(textValue);
                listTagVal += textValue;
              } else {
                listTagVal += this.buildTextValNode(item, key, "", level);
              }
            }
          }
          if (this.options.oneListGroup) {
            listTagVal = this.buildObjectNode(
              listTagVal,
              key,
              listTagAttr,
              level,
            );
          }
          val += listTagVal;
        } else {
          if (
            this.options.attributesGroupName &&
            key === this.options.attributesGroupName
          ) {
            const Ks = Object.keys(jObj[key]);
            const L = Ks.length;
            for (let j = 0; j < L; j++) {
              attrStr += this.buildAttrPairStr(Ks[j], "" + jObj[key][Ks[j]]);
            }
          } else {
            val += this.processTextOrObjNode(jObj[key], key, level, ajPath);
          }
        }
      }
      return { attrStr, val };
    };
    Builder.prototype.buildAttrPairStr = function (attrName, val) {
      val = this.options.attributeValueProcessor(attrName, "" + val);
      val = this.replaceEntitiesValue(val);
      if (this.options.suppressBooleanAttributes && val === "true") {
        return " " + attrName;
      } else return " " + attrName + '="' + val + '"';
    };
    function processTextOrObjNode(object, key, level, ajPath) {
      const result = this.j2x(object, level + 1, ajPath.concat(key));
      if (
        object[this.options.textNodeName] !== void 0 &&
        Object.keys(object).length === 1
      ) {
        return this.buildTextValNode(
          object[this.options.textNodeName],
          key,
          result.attrStr,
          level,
        );
      } else {
        return this.buildObjectNode(result.val, key, result.attrStr, level);
      }
    }
    __name(processTextOrObjNode, "processTextOrObjNode");
    Builder.prototype.buildObjectNode = function (val, key, attrStr, level) {
      if (val === "") {
        if (key[0] === "?")
          return (
            this.indentate(level) + "<" + key + attrStr + "?" + this.tagEndChar
          );
        else {
          return (
            this.indentate(level) +
            "<" +
            key +
            attrStr +
            this.closeTag(key) +
            this.tagEndChar
          );
        }
      } else {
        let tagEndExp = "</" + key + this.tagEndChar;
        let piClosingChar = "";
        if (key[0] === "?") {
          piClosingChar = "?";
          tagEndExp = "";
        }
        if ((attrStr || attrStr === "") && val.indexOf("<") === -1) {
          return (
            this.indentate(level) +
            "<" +
            key +
            attrStr +
            piClosingChar +
            ">" +
            val +
            tagEndExp
          );
        } else if (
          this.options.commentPropName !== false &&
          key === this.options.commentPropName &&
          piClosingChar.length === 0
        ) {
          return this.indentate(level) + `<!--${val}-->` + this.newLine;
        } else {
          return (
            this.indentate(level) +
            "<" +
            key +
            attrStr +
            piClosingChar +
            this.tagEndChar +
            val +
            this.indentate(level) +
            tagEndExp
          );
        }
      }
    };
    Builder.prototype.closeTag = function (key) {
      let closeTag = "";
      if (this.options.unpairedTags.indexOf(key) !== -1) {
        if (!this.options.suppressUnpairedNode) closeTag = "/";
      } else if (this.options.suppressEmptyNode) {
        closeTag = "/";
      } else {
        closeTag = `></${key}`;
      }
      return closeTag;
    };
    Builder.prototype.buildTextValNode = function (val, key, attrStr, level) {
      if (
        this.options.cdataPropName !== false &&
        key === this.options.cdataPropName
      ) {
        return this.indentate(level) + `<![CDATA[${val}]]>` + this.newLine;
      } else if (
        this.options.commentPropName !== false &&
        key === this.options.commentPropName
      ) {
        return this.indentate(level) + `<!--${val}-->` + this.newLine;
      } else if (key[0] === "?") {
        return (
          this.indentate(level) + "<" + key + attrStr + "?" + this.tagEndChar
        );
      } else {
        let textValue = this.options.tagValueProcessor(key, val);
        textValue = this.replaceEntitiesValue(textValue);
        if (textValue === "") {
          return (
            this.indentate(level) +
            "<" +
            key +
            attrStr +
            this.closeTag(key) +
            this.tagEndChar
          );
        } else {
          return (
            this.indentate(level) +
            "<" +
            key +
            attrStr +
            ">" +
            textValue +
            "</" +
            key +
            this.tagEndChar
          );
        }
      }
    };
    Builder.prototype.replaceEntitiesValue = function (textValue) {
      if (textValue && textValue.length > 0 && this.options.processEntities) {
        for (let i = 0; i < this.options.entities.length; i++) {
          const entity = this.options.entities[i];
          textValue = textValue.replace(entity.regex, entity.val);
        }
      }
      return textValue;
    };
    function indentate(level) {
      return this.options.indentBy.repeat(level);
    }
    __name(indentate, "indentate");
    function isAttribute(name) {
      if (
        name.startsWith(this.options.attributeNamePrefix) &&
        name !== this.options.textNodeName
      ) {
        return name.substr(this.attrPrefixLen);
      } else {
        return false;
      }
    }
    __name(isAttribute, "isAttribute");
    module.exports = Builder;
  },
});

// ../node_modules/fast-xml-parser/src/fxp.js
var require_fxp = __commonJS({
  "../node_modules/fast-xml-parser/src/fxp.js"(exports, module) {
    "use strict";
    init_functionsRoutes_0_5277810449847653();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    var validator = require_validator();
    var XMLParser2 = require_XMLParser();
    var XMLBuilder = require_json2xml();
    module.exports = {
      XMLParser: XMLParser2,
      XMLValidator: validator,
      XMLBuilder,
    };
  },
});

// ../shared/plex-client.ts
function toArray(value) {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}
function getRequiredEnv(env2, name) {
  const value = env2[name];
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}
function cachePrefix(env2) {
  return `${env2.PLEX_URL ?? "missing-url"}::${env2.PLEX_COLLECTION_ID ?? env2.PLEX_COLLECTION_TITLE ?? "no-collection"}`;
}
function normalizeBaseUrl(raw) {
  const url = new URL(raw);
  if (!url.pathname.endsWith("/")) url.pathname += "/";
  return url;
}
function plexFetchTimeoutMs(env2) {
  const configured2 = Number(env2.PLEX_FETCH_TIMEOUT_MS);
  if (!Number.isFinite(configured2) || configured2 <= 0)
    return DEFAULT_PLEX_FETCH_TIMEOUT_MS;
  return Math.max(1e3, Math.min(3e4, Math.trunc(configured2)));
}
async function fetchWithTimeout(input, init, timeoutMs) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(input, {
      ...init,
      signal: controller.signal,
    });
  } catch (error3) {
    if (error3 instanceof Error && error3.name === "AbortError") {
      throw new Error(`Plex request timed out after ${timeoutMs}ms`);
    }
    throw error3;
  } finally {
    clearTimeout(timeout);
  }
}
async function cached(key, ttlMs, fn) {
  const now = Date.now();
  const existing = cache.get(key);
  if (existing && existing.expiresAt > now) return existing.value;
  const value = await fn();
  cache.set(key, { expiresAt: now + ttlMs, value });
  return value;
}
function parseNumber(value) {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value !== "string" && typeof value !== "boolean") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}
function parseString(value) {
  if (typeof value === "string") return value.length ? value : null;
  if (typeof value === "number" || typeof value === "boolean")
    return String(value);
  return null;
}
function pickFirstString(obj, keys) {
  for (const key of keys) {
    const value = parseString(obj[key]);
    if (value) return value;
  }
  return null;
}
function pickFirstNumber(obj, keys) {
  for (const key of keys) {
    const value = parseNumber(obj[key]);
    if (value != null) return value;
  }
  return null;
}
function parseUnixTimestamp(value) {
  const parsed = parseNumber(value);
  if (parsed == null) return null;
  const timestamp = parsed > 1e12 ? parsed : parsed * 1e3;
  const date = new Date(timestamp);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}
function parseDurationMinutes(value) {
  const milliseconds = parseNumber(value);
  if (milliseconds == null) return null;
  return Math.max(1, Math.round(milliseconds / 6e4));
}
function extractEntryId(entry) {
  const raw =
    pickFirstString(entry, ["@_ratingKey", "ratingKey"]) ??
    pickFirstString(entry, ["@_key", "key"]);
  if (!raw) return null;
  const match2 = raw.match(/\/(\d+)(?:\/items)?(?:[/?#].*)?$/);
  return match2?.[1] ?? raw;
}
function extractTags(entry, key) {
  return toArray(entry[key])
    .map((tag) => pickFirstString(tag, ["@_tag", "tag", "@_title", "title"]))
    .filter((tag) => Boolean(tag));
}
function getMediaContainerEntries(parsed) {
  const mediaContainer = parsed.MediaContainer ?? parsed;
  return [
    ...toArray(mediaContainer?.Metadata),
    ...toArray(mediaContainer?.Video),
    ...toArray(mediaContainer?.Directory),
  ];
}
function mapPreviewItem(entry) {
  const id = extractEntryId(entry);
  const title2 = pickFirstString(entry, [
    "@_title",
    "title",
    "@_originalTitle",
    "originalTitle",
  ]);
  if (!id || !title2) return null;
  return {
    id,
    title: title2,
    year: pickFirstNumber(entry, ["@_year", "year"]),
    rating: pickFirstNumber(entry, [
      "@_audienceRating",
      "audienceRating",
      "@_rating",
      "rating",
      "@_userRating",
      "userRating",
    ]),
    posterPath: pickFirstString(entry, [
      "@_thumb",
      "thumb",
      "@_parentThumb",
      "parentThumb",
      "@_art",
      "art",
    ]),
    seasons: pickFirstNumber(entry, ["@_childCount", "childCount"]),
  };
}
function mapCollectionSummary(entry) {
  const id = extractEntryId(entry);
  const title2 = pickFirstString(entry, ["@_title", "title"]);
  if (!id || !title2) return null;
  return {
    id,
    title: title2,
    summary: pickFirstString(entry, ["@_summary", "summary"]),
    posterPath: pickFirstString(entry, [
      "@_thumb",
      "thumb",
      "@_composite",
      "composite",
    ]),
    artPath: pickFirstString(entry, ["@_art", "art"]),
    itemCount: pickFirstNumber(entry, ["@_childCount", "childCount"]),
    updatedAt: parseUnixTimestamp(entry["@_updatedAt"] ?? entry.updatedAt),
  };
}
function mapCollectionMovie(entry) {
  const id = extractEntryId(entry);
  const title2 = pickFirstString(entry, [
    "@_title",
    "title",
    "@_originalTitle",
    "originalTitle",
  ]);
  if (!id || !title2) return null;
  return {
    id,
    title: title2,
    year: pickFirstNumber(entry, ["@_year", "year"]),
    rating: pickFirstNumber(entry, [
      "@_audienceRating",
      "audienceRating",
      "@_rating",
      "rating",
      "@_userRating",
      "userRating",
    ]),
    posterPath: pickFirstString(entry, [
      "@_thumb",
      "thumb",
      "@_parentThumb",
      "parentThumb",
      "@_art",
      "art",
    ]),
    summary: pickFirstString(entry, [
      "@_summary",
      "summary",
      "@_tagline",
      "tagline",
    ]),
    durationMinutes: parseDurationMinutes(
      entry["@_duration"] ?? entry.duration,
    ),
    genres: extractTags(entry, "Genre"),
    contentRating: pickFirstString(entry, ["@_contentRating", "contentRating"]),
    studio:
      pickFirstString(entry, ["@_studio", "studio"]) ??
      extractTags(entry, "Studio")[0] ??
      null,
  };
}
function mapLibraryShow(entry) {
  const item = mapCollectionMovie(entry);
  if (!item) return null;
  return {
    id: item.id,
    title: item.title,
    year: item.year,
    rating: item.rating,
    posterPath: item.posterPath,
    summary: item.summary,
    genres: item.genres,
    seasons: pickFirstNumber(entry, ["@_childCount", "childCount"]),
    contentRating: item.contentRating,
    studio: item.studio,
  };
}
async function plexRequest(env2, pathname, params) {
  const baseUrl = normalizeBaseUrl(getRequiredEnv(env2, "PLEX_URL"));
  const token = getRequiredEnv(env2, "PLEX_TOKEN");
  const url = new URL(pathname.replace(/^\//, ""), baseUrl);
  url.searchParams.set("X-Plex-Token", token);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, String(value));
    }
  }
  const res = await fetchWithTimeout(
    url,
    {
      headers: {
        Accept: "application/json, text/xml, application/xml;q=0.9, */*;q=0.8",
      },
    },
    plexFetchTimeoutMs(env2),
  );
  if (!res.ok) {
    const body = (await res.text().catch(() => "")) || res.statusText;
    throw new Error(`Plex request failed (${res.status}): ${body}`);
  }
  const contentType = res.headers.get("content-type") || "";
  const text = await res.text();
  if (contentType.includes("application/json")) {
    return JSON.parse(text);
  }
  return parser.parse(text);
}
async function plexFetchImage(env2, path, options = {}) {
  const baseUrl = normalizeBaseUrl(getRequiredEnv(env2, "PLEX_URL"));
  const token = getRequiredEnv(env2, "PLEX_TOKEN");
  const safePath = path.startsWith("/") ? path : `/${path}`;
  const width = options.width;
  const height = options.height;
  const url =
    width || height
      ? (() => {
          const transcodeUrl = new URL("photo/:/transcode", baseUrl);
          if (width) transcodeUrl.searchParams.set("width", String(width));
          if (height) transcodeUrl.searchParams.set("height", String(height));
          transcodeUrl.searchParams.set("minSize", "1");
          transcodeUrl.searchParams.set("upscale", "1");
          transcodeUrl.searchParams.set("url", safePath);
          return transcodeUrl;
        })()
      : new URL(safePath.slice(1), baseUrl);
  url.searchParams.set("X-Plex-Token", token);
  return fetchWithTimeout(url, {}, plexFetchTimeoutMs(env2));
}
async function getPlexSections(env2) {
  const key = `${cachePrefix(env2)}::sections`;
  return cached(key, 6e4, async () => {
    const parsed = await plexRequest(env2, "/library/sections");
    const mediaContainer = parsed.MediaContainer ?? parsed;
    const directories = toArray(mediaContainer?.Directory);
    return directories
      .map((directory) => ({
        key: pickFirstString(directory, ["@_key", "key"]) ?? "",
        title: pickFirstString(directory, ["@_title", "title"]) ?? "",
        type: pickFirstString(directory, ["@_type", "type"]) ?? "",
      }))
      .filter(
        (directory) =>
          directory.key &&
          directory.title &&
          (directory.type === "movie" || directory.type === "show"),
      );
  });
}
async function resolveSectionId(env2, forType) {
  const envKey =
    forType === "tv" ? "PLEX_TV_SECTION_ID" : "PLEX_MOVIE_SECTION_ID";
  const explicit = env2[envKey]?.trim();
  if (explicit) return explicit;
  const sections = await getPlexSections(env2);
  const desired = forType === "tv" ? "show" : "movie";
  const desiredTitle = DEFAULT_LIBRARY_TITLES[forType].toLowerCase();
  const matchingSections = sections.filter(
    (section) => section.type === desired,
  );
  const match2 =
    matchingSections.find(
      (section) => section.title.trim().toLowerCase() === desiredTitle,
    ) ?? matchingSections[0];
  if (!match2) {
    throw new Error(
      `Could not auto-detect Plex ${forType} library. Set ${envKey} to the library section id.`,
    );
  }
  return match2.key;
}
async function resolveCountSectionIds(env2, forType) {
  return [await resolveSectionId(env2, forType)];
}
async function getLibrarySectionItemCount(env2, type, sectionId) {
  const plexType = type === "tv" ? 2 : 1;
  const key = `${cachePrefix(env2)}::libraryCount:${type}:${sectionId}`;
  return cached(key, 6e4, async () => {
    const parsed = await plexRequest(
      env2,
      `/library/sections/${sectionId}/all`,
      {
        type: plexType,
        "X-Plex-Container-Start": 0,
        "X-Plex-Container-Size": 1,
      },
    );
    const mediaContainer = parsed.MediaContainer ?? parsed;
    const total =
      pickFirstNumber(mediaContainer, [
        "@_totalSize",
        "totalSize",
        "@_size",
        "size",
      ]) ?? getMediaContainerEntries(parsed).length;
    return total;
  });
}
async function getLibraryItemCount(env2, type) {
  const sectionIds = await resolveCountSectionIds(env2, type);
  const counts = await Promise.all(
    sectionIds.map((sectionId) =>
      getLibrarySectionItemCount(env2, type, sectionId),
    ),
  );
  return counts.reduce((total, count3) => total + count3, 0);
}
async function getPlexLibraryCounts(env2) {
  const safeCount = /* @__PURE__ */ __name(async (type) => {
    try {
      return await getLibraryItemCount(env2, type);
    } catch {
      return null;
    }
  }, "safeCount");
  const [movies, shows] = await Promise.all([
    safeCount("movie"),
    safeCount("tv"),
  ]);
  return { movies, shows };
}
async function getTopRated(env2, options) {
  const { type, limit } = options;
  const sectionId = await resolveSectionId(env2, type);
  const plexType = type === "tv" ? 2 : 1;
  const key = `${cachePrefix(env2)}::topRated:${type}:${limit}:${sectionId}`;
  return cached(key, 6e4, async () => {
    const parsed = await plexRequest(
      env2,
      `/library/sections/${sectionId}/all`,
      {
        type: plexType,
        sort: "audienceRating:desc",
        "X-Plex-Container-Start": 0,
        "X-Plex-Container-Size": limit,
      },
    );
    return getMediaContainerEntries(parsed)
      .map(mapPreviewItem)
      .filter((item) => Boolean(item))
      .slice(0, limit);
  });
}
function normalizeLibraryLimit(limit) {
  if (limit == null || !Number.isFinite(limit)) return null;
  return Math.max(1, Math.min(1e4, Math.trunc(limit)));
}
async function getPlexMovies(env2, options = {}) {
  const sectionId = await resolveSectionId(env2, "movie");
  const limit = normalizeLibraryLimit(options.limit);
  const key = `${cachePrefix(env2)}::movies:${sectionId}:${limit ?? "all"}`;
  return cached(key, 6e4, async () => {
    const pageSize = 200;
    const items = [];
    let start = 0;
    let totalSize = null;
    while (true) {
      const remaining =
        limit == null ? pageSize : Math.min(pageSize, limit - items.length);
      if (remaining <= 0) break;
      const parsed = await plexRequest(
        env2,
        `/library/sections/${sectionId}/all`,
        {
          type: 1,
          "X-Plex-Container-Start": start,
          "X-Plex-Container-Size": remaining,
        },
      );
      const mediaContainer = parsed.MediaContainer ?? parsed;
      const pageItems = getMediaContainerEntries(parsed)
        .map(mapCollectionMovie)
        .filter((item) => Boolean(item));
      items.push(...pageItems);
      totalSize =
        pickFirstNumber(mediaContainer, ["@_totalSize", "totalSize"]) ??
        totalSize;
      if (pageItems.length === 0) break;
      start += pageItems.length;
      if (limit != null && items.length >= limit) break;
      if (totalSize != null && start >= totalSize) break;
      if (pageItems.length < remaining) break;
    }
    return items;
  });
}
async function getPlexShows(env2, options = {}) {
  const sectionId = await resolveSectionId(env2, "tv");
  const limit = normalizeLibraryLimit(options.limit);
  const key = `${cachePrefix(env2)}::shows:${sectionId}:${limit ?? "all"}`;
  return cached(key, 6e4, async () => {
    const pageSize = 200;
    const items = [];
    let start = 0;
    let totalSize = null;
    while (true) {
      const remaining =
        limit == null ? pageSize : Math.min(pageSize, limit - items.length);
      if (remaining <= 0) break;
      const parsed = await plexRequest(
        env2,
        `/library/sections/${sectionId}/all`,
        {
          type: 2,
          "X-Plex-Container-Start": start,
          "X-Plex-Container-Size": remaining,
        },
      );
      const mediaContainer = parsed?.MediaContainer ?? parsed;
      const pageItems = getMediaContainerEntries(parsed)
        .map(mapLibraryShow)
        .filter((item) => Boolean(item));
      items.push(...pageItems);
      totalSize =
        pickFirstNumber(mediaContainer, ["@_totalSize", "totalSize"]) ??
        totalSize;
      if (pageItems.length === 0) break;
      start += pageItems.length;
      if (limit != null && items.length >= limit) break;
      if (totalSize != null && start >= totalSize) break;
      if (pageItems.length < remaining) break;
    }
    return items;
  });
}
async function getPlexCollections(env2, options = {}) {
  const sectionId =
    options.sectionId ?? (await resolveSectionId(env2, "movie"));
  const key = `${cachePrefix(env2)}::collections:${sectionId}`;
  return cached(key, 6e4, async () => {
    const parsed = await plexRequest(
      env2,
      `/library/sections/${sectionId}/collections`,
    );
    return getMediaContainerEntries(parsed)
      .map(mapCollectionSummary)
      .filter((collection) => Boolean(collection));
  });
}
async function getCollectionMetadata(env2, collectionId) {
  const key = `${cachePrefix(env2)}::collectionMeta:${collectionId}`;
  return cached(key, 6e4, async () => {
    const parsed = await plexRequest(env2, `/library/metadata/${collectionId}`);
    const [entry] = getMediaContainerEntries(parsed);
    return entry ? mapCollectionSummary(entry) : null;
  });
}
async function getCollectionItems(env2, collectionId) {
  const key = `${cachePrefix(env2)}::collectionItems:${collectionId}`;
  return cached(key, 6e4, async () => {
    const pageSize = 100;
    const items = [];
    let start = 0;
    let totalSize = null;
    while (true) {
      const parsed = await plexRequest(
        env2,
        `/library/collections/${collectionId}/items`,
        {
          "X-Plex-Container-Start": start,
          "X-Plex-Container-Size": pageSize,
        },
      );
      const mediaContainer = parsed.MediaContainer ?? parsed;
      const pageItems = getMediaContainerEntries(parsed)
        .map(mapCollectionMovie)
        .filter((item) => Boolean(item));
      items.push(...pageItems);
      totalSize =
        pickFirstNumber(mediaContainer, ["@_totalSize", "totalSize"]) ??
        totalSize;
      if (pageItems.length === 0) break;
      start += pageItems.length;
      if (totalSize != null && start >= totalSize) break;
      if (pageItems.length < pageSize) break;
    }
    return items;
  });
}
function normalizeLimit(limit) {
  if (limit == null || !Number.isFinite(limit)) return null;
  return Math.max(1, Math.min(500, Math.trunc(limit)));
}
function normalizeText(value) {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}
async function resolveFeaturedCollectionTarget(env2, options) {
  const desiredId = normalizeText(
    options.collectionId ?? env2.PLEX_COLLECTION_ID,
  );
  const desiredTitle = normalizeText(
    options.collectionTitle ?? env2.PLEX_COLLECTION_TITLE,
  );
  if (!desiredId && !desiredTitle) {
    throw new Error(
      "Set PLEX_COLLECTION_ID or PLEX_COLLECTION_TITLE to choose which Plex collection to display.",
    );
  }
  const collections = await getPlexCollections(env2);
  if (desiredId) {
    const summary2 =
      collections.find((collection) => collection.id === desiredId) ?? null;
    return { collectionId: desiredId, summary: summary2 };
  }
  const summary =
    collections.find(
      (collection) =>
        collection.title.trim().toLowerCase() === desiredTitle.toLowerCase(),
    ) ?? null;
  if (!summary) {
    throw new Error(
      `Could not find Plex collection '${desiredTitle}'. Check /api/plex/collections or set PLEX_COLLECTION_ID.`,
    );
  }
  return { collectionId: summary.id, summary };
}
async function getFeaturedCollection(env2, options = {}) {
  const { collectionId, summary } = await resolveFeaturedCollectionTarget(
    env2,
    options,
  );
  const limit = normalizeLimit(options.limit);
  const [metadata, allItems] = await Promise.all([
    summary
      ? Promise.resolve(summary)
      : getCollectionMetadata(env2, collectionId),
    getCollectionItems(env2, collectionId),
  ]);
  const resolvedSummary = metadata ?? summary;
  const items = limit == null ? allItems : allItems.slice(0, limit);
  return {
    id: collectionId,
    title:
      resolvedSummary?.title ??
      normalizeText(options.collectionTitle ?? env2.PLEX_COLLECTION_TITLE) ??
      "Featured Collection",
    summary: resolvedSummary?.summary ?? null,
    posterPath: resolvedSummary?.posterPath ?? null,
    artPath: resolvedSummary?.artPath ?? null,
    itemCount: resolvedSummary?.itemCount ?? allItems.length,
    updatedAt: resolvedSummary?.updatedAt ?? null,
    items,
  };
}
var import_fast_xml_parser,
  parser,
  cache,
  DEFAULT_PLEX_FETCH_TIMEOUT_MS,
  DEFAULT_LIBRARY_TITLES;
var init_plex_client = __esm({
  "../shared/plex-client.ts"() {
    init_functionsRoutes_0_5277810449847653();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    import_fast_xml_parser = __toESM(require_fxp(), 1);
    parser = new import_fast_xml_parser.XMLParser({
      ignoreAttributes: false,
    });
    cache = /* @__PURE__ */ new Map();
    DEFAULT_PLEX_FETCH_TIMEOUT_MS = 8e3;
    DEFAULT_LIBRARY_TITLES = {
      movie: "Movies",
      tv: "Shows",
    };
    __name(toArray, "toArray");
    __name(getRequiredEnv, "getRequiredEnv");
    __name(cachePrefix, "cachePrefix");
    __name(normalizeBaseUrl, "normalizeBaseUrl");
    __name(plexFetchTimeoutMs, "plexFetchTimeoutMs");
    __name(fetchWithTimeout, "fetchWithTimeout");
    __name(cached, "cached");
    __name(parseNumber, "parseNumber");
    __name(parseString, "parseString");
    __name(pickFirstString, "pickFirstString");
    __name(pickFirstNumber, "pickFirstNumber");
    __name(parseUnixTimestamp, "parseUnixTimestamp");
    __name(parseDurationMinutes, "parseDurationMinutes");
    __name(extractEntryId, "extractEntryId");
    __name(extractTags, "extractTags");
    __name(getMediaContainerEntries, "getMediaContainerEntries");
    __name(mapPreviewItem, "mapPreviewItem");
    __name(mapCollectionSummary, "mapCollectionSummary");
    __name(mapCollectionMovie, "mapCollectionMovie");
    __name(mapLibraryShow, "mapLibraryShow");
    __name(plexRequest, "plexRequest");
    __name(plexFetchImage, "plexFetchImage");
    __name(getPlexSections, "getPlexSections");
    __name(resolveSectionId, "resolveSectionId");
    __name(resolveCountSectionIds, "resolveCountSectionIds");
    __name(getLibrarySectionItemCount, "getLibrarySectionItemCount");
    __name(getLibraryItemCount, "getLibraryItemCount");
    __name(getPlexLibraryCounts, "getPlexLibraryCounts");
    __name(getTopRated, "getTopRated");
    __name(normalizeLibraryLimit, "normalizeLibraryLimit");
    __name(getPlexMovies, "getPlexMovies");
    __name(getPlexShows, "getPlexShows");
    __name(getPlexCollections, "getPlexCollections");
    __name(getCollectionMetadata, "getCollectionMetadata");
    __name(getCollectionItems, "getCollectionItems");
    __name(normalizeLimit, "normalizeLimit");
    __name(normalizeText, "normalizeText");
    __name(resolveFeaturedCollectionTarget, "resolveFeaturedCollectionTarget");
    __name(getFeaturedCollection, "getFeaturedCollection");
  },
});

// _lib/pages.ts
function json(data, init = {}) {
  const headers = new Headers(init.headers);
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json; charset=utf-8");
  }
  return new Response(JSON.stringify(data), {
    ...init,
    headers,
  });
}
function errorMessage(error3, fallback) {
  return error3 instanceof Error ? error3.message : fallback;
}
function cloneWithHeader(response, name, value) {
  const headers = new Headers(response.headers);
  headers.set(name, value);
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
function cachedJsonResponse(data, cacheStatus) {
  return json(data, {
    headers: {
      "Cache-Control":
        "public, max-age=60, s-maxage=86400, stale-while-revalidate=86400",
      "X-PlexPoint-Cache": cacheStatus,
      "X-PlexPoint-Cached-At": /* @__PURE__ */ new Date().toISOString(),
    },
  });
}
async function cachedJson(context2, options) {
  const cache2 = await caches.open(options.cacheName);
  const cacheUrl = new URL(String(options.cacheKey));
  cacheUrl.searchParams.set("__plexpoint_cache", PLEX_API_CACHE_VERSION);
  const cacheKey = new Request(cacheUrl.toString(), { method: "GET" });
  const cached2 = await cache2.match(cacheKey);
  if (cached2) {
    context2.waitUntil(
      options
        .load()
        .then((data) =>
          cache2.put(cacheKey, cachedJsonResponse(data, "refresh")),
        )
        .catch(() => void 0),
    );
    return cloneWithHeader(cached2, "X-PlexPoint-Cache", "hit");
  }
  try {
    const data = await options.load();
    const response = cachedJsonResponse(data, "miss");
    context2.waitUntil(cache2.put(cacheKey, response.clone()));
    return response;
  } catch (error3) {
    return json(
      {
        message: errorMessage(error3, options.fallbackMessage),
      },
      { status: 501 },
    );
  }
}
var PLEX_API_CACHE_VERSION;
var init_pages = __esm({
  "_lib/pages.ts"() {
    init_functionsRoutes_0_5277810449847653();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    PLEX_API_CACHE_VERSION = "v4-optional-limit-parsing";
    __name(json, "json");
    __name(errorMessage, "errorMessage");
    __name(cloneWithHeader, "cloneWithHeader");
    __name(cachedJsonResponse, "cachedJsonResponse");
    __name(cachedJson, "cachedJson");
  },
});

// api/plex/collections.ts
async function onRequestGet(context2) {
  const url = new URL(context2.request.url);
  const sectionId = url.searchParams.get("sectionId") ?? void 0;
  return cachedJson(context2, {
    cacheName: "plex-api",
    cacheKey: context2.request.url,
    load: /* @__PURE__ */ __name(
      () => getPlexCollections(context2.env, { sectionId }),
      "load",
    ),
    fallbackMessage:
      "Plex integration not configured (set PLEX_URL and PLEX_TOKEN)",
  });
}
var init_collections = __esm({
  "api/plex/collections.ts"() {
    init_functionsRoutes_0_5277810449847653();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    init_plex_client();
    init_pages();
    __name(onRequestGet, "onRequestGet");
  },
});

// api/plex/counts.ts
async function onRequestGet2(context2) {
  return cachedJson(context2, {
    cacheName: "plex-api",
    cacheKey: context2.request.url,
    load: /* @__PURE__ */ __name(
      () => getPlexLibraryCounts(context2.env),
      "load",
    ),
    fallbackMessage:
      "Plex integration not configured (set PLEX_URL and PLEX_TOKEN)",
  });
}
var init_counts = __esm({
  "api/plex/counts.ts"() {
    init_functionsRoutes_0_5277810449847653();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    init_plex_client();
    init_pages();
    __name(onRequestGet2, "onRequestGet");
  },
});

// api/plex/featured-collection.ts
async function onRequestGet3(context2) {
  const url = new URL(context2.request.url);
  const collectionId = url.searchParams.get("id") ?? void 0;
  const collectionTitle = url.searchParams.get("title") ?? void 0;
  const limitParam = url.searchParams.get("limit");
  const limitRaw = limitParam == null ? NaN : Number(limitParam);
  const limit = Number.isFinite(limitRaw)
    ? Math.max(1, Math.min(500, Math.trunc(limitRaw)))
    : void 0;
  return cachedJson(context2, {
    cacheName: "plex-api",
    cacheKey: context2.request.url,
    load: /* @__PURE__ */ __name(
      () =>
        getFeaturedCollection(context2.env, {
          collectionId,
          collectionTitle,
          limit,
        }),
      "load",
    ),
    fallbackMessage:
      "Plex integration not configured (set PLEX_URL, PLEX_TOKEN, and a collection id or title)",
  });
}
var init_featured_collection = __esm({
  "api/plex/featured-collection.ts"() {
    init_functionsRoutes_0_5277810449847653();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    init_plex_client();
    init_pages();
    __name(onRequestGet3, "onRequestGet");
  },
});

// api/plex/image.ts
async function onRequestGet4(context2) {
  try {
    const url = new URL(context2.request.url);
    const path = url.searchParams.get("path");
    if (typeof path !== "string" || !path.startsWith("/")) {
      return json(
        { message: "Query param 'path' must be a Plex path starting with '/'" },
        { status: 400 },
      );
    }
    const widthRaw = Number(url.searchParams.get("w"));
    const heightRaw = Number(url.searchParams.get("h"));
    const width =
      Number.isFinite(widthRaw) && widthRaw > 0
        ? Math.max(40, Math.min(2e3, Math.trunc(widthRaw)))
        : void 0;
    const height =
      Number.isFinite(heightRaw) && heightRaw > 0
        ? Math.max(40, Math.min(2e3, Math.trunc(heightRaw)))
        : void 0;
    const cacheKey = new Request(url.toString(), context2.request);
    const cache2 = await caches.open("plex-images");
    const cached2 = await cache2.match(cacheKey);
    if (cached2) return cached2;
    const upstream = await plexFetchImage(context2.env, path, {
      width,
      height,
    });
    if (!upstream.ok) {
      const body =
        (await upstream.text().catch(() => "")) || upstream.statusText;
      return new Response(body, {
        status: upstream.status,
        headers: upstream.headers,
      });
    }
    const headers = new Headers(upstream.headers);
    headers.set(
      "Cache-Control",
      "public, max-age=604800, stale-while-revalidate=86400, immutable",
    );
    const response = new Response(upstream.body, {
      status: upstream.status,
      headers,
    });
    context2.waitUntil(cache2.put(cacheKey, response.clone()));
    return response;
  } catch (error3) {
    return json(
      {
        message: errorMessage(
          error3,
          "Plex integration not configured (set PLEX_URL and PLEX_TOKEN)",
        ),
      },
      { status: 501 },
    );
  }
}
var init_image = __esm({
  "api/plex/image.ts"() {
    init_functionsRoutes_0_5277810449847653();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    init_plex_client();
    init_pages();
    __name(onRequestGet4, "onRequestGet");
  },
});

// api/plex/movies.ts
async function onRequestGet5(context2) {
  const url = new URL(context2.request.url);
  const limitParam = url.searchParams.get("limit");
  const limitRaw = limitParam == null ? NaN : Number(limitParam);
  const limit = Number.isFinite(limitRaw)
    ? Math.max(1, Math.min(1e4, Math.trunc(limitRaw)))
    : void 0;
  return cachedJson(context2, {
    cacheName: "plex-api",
    cacheKey: context2.request.url,
    load: /* @__PURE__ */ __name(
      () => getPlexMovies(context2.env, { limit }),
      "load",
    ),
    fallbackMessage:
      "Plex integration not configured (set PLEX_URL and PLEX_TOKEN)",
  });
}
var init_movies = __esm({
  "api/plex/movies.ts"() {
    init_functionsRoutes_0_5277810449847653();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    init_plex_client();
    init_pages();
    __name(onRequestGet5, "onRequestGet");
  },
});

// api/plex/sections.ts
async function onRequestGet6(context2) {
  return cachedJson(context2, {
    cacheName: "plex-api",
    cacheKey: context2.request.url,
    load: /* @__PURE__ */ __name(() => getPlexSections(context2.env), "load"),
    fallbackMessage:
      "Plex integration not configured (set PLEX_URL and PLEX_TOKEN)",
  });
}
var init_sections = __esm({
  "api/plex/sections.ts"() {
    init_functionsRoutes_0_5277810449847653();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    init_plex_client();
    init_pages();
    __name(onRequestGet6, "onRequestGet");
  },
});

// api/plex/shows.ts
async function onRequestGet7(context2) {
  const url = new URL(context2.request.url);
  const limitParam = url.searchParams.get("limit");
  const limitRaw = limitParam == null ? NaN : Number(limitParam);
  const limit = Number.isFinite(limitRaw)
    ? Math.max(1, Math.min(1e4, Math.trunc(limitRaw)))
    : void 0;
  return cachedJson(context2, {
    cacheName: "plex-api",
    cacheKey: context2.request.url,
    load: /* @__PURE__ */ __name(
      () => getPlexShows(context2.env, { limit }),
      "load",
    ),
    fallbackMessage:
      "Plex integration not configured (set PLEX_URL and PLEX_TOKEN)",
  });
}
var init_shows = __esm({
  "api/plex/shows.ts"() {
    init_functionsRoutes_0_5277810449847653();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    init_plex_client();
    init_pages();
    __name(onRequestGet7, "onRequestGet");
  },
});

// api/plex/status.ts
function configured(value) {
  return Boolean(value && value.trim().length > 0);
}
function publicMessage(error3) {
  if (!(error3 instanceof Error)) {
    return "Cloudflare could not reach Plex.";
  }
  if (error3.message.startsWith("Missing required env var:")) {
    return error3.message;
  }
  return "Cloudflare could not reach Plex. Check that PLEX_URL is reachable from Cloudflare and PLEX_TOKEN is valid.";
}
async function onRequestGet8(context2) {
  const startedAt = Date.now();
  const envStatus = {
    plexUrl: configured(context2.env.PLEX_URL),
    plexToken: configured(context2.env.PLEX_TOKEN),
    movieSectionId: configured(context2.env.PLEX_MOVIE_SECTION_ID),
    tvSectionId: configured(context2.env.PLEX_TV_SECTION_ID),
    collectionId: configured(context2.env.PLEX_COLLECTION_ID),
    collectionTitle: configured(context2.env.PLEX_COLLECTION_TITLE),
  };
  try {
    const [sections, counts] = await Promise.all([
      getPlexSections(context2.env),
      getPlexLibraryCounts(context2.env),
    ]);
    return json({
      ok: true,
      reachable: true,
      env: envStatus,
      sections: {
        movies: sections.filter((section) => section.type === "movie").length,
        shows: sections.filter((section) => section.type === "show").length,
      },
      counts,
      durationMs: Date.now() - startedAt,
    });
  } catch (error3) {
    return json(
      {
        ok: false,
        reachable: false,
        env: envStatus,
        message: publicMessage(error3),
        durationMs: Date.now() - startedAt,
      },
      { status: 503 },
    );
  }
}
var init_status = __esm({
  "api/plex/status.ts"() {
    init_functionsRoutes_0_5277810449847653();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    init_plex_client();
    init_pages();
    __name(configured, "configured");
    __name(publicMessage, "publicMessage");
    __name(onRequestGet8, "onRequestGet");
  },
});

// api/plex/top-rated.ts
async function onRequestGet9(context2) {
  const url = new URL(context2.request.url);
  const typeParam = String(url.searchParams.get("type") ?? "tv").toLowerCase();
  const type = typeParam === "movie" ? "movie" : "tv";
  const limitParam = url.searchParams.get("limit");
  const limitRaw = limitParam == null ? NaN : Number(limitParam);
  const limit = Number.isFinite(limitRaw)
    ? Math.max(1, Math.min(30, Math.trunc(limitRaw)))
    : 12;
  return cachedJson(context2, {
    cacheName: "plex-api",
    cacheKey: context2.request.url,
    load: /* @__PURE__ */ __name(
      () => getTopRated(context2.env, { type, limit }),
      "load",
    ),
    fallbackMessage:
      "Plex integration not configured (set PLEX_URL and PLEX_TOKEN)",
  });
}
var init_top_rated = __esm({
  "api/plex/top-rated.ts"() {
    init_functionsRoutes_0_5277810449847653();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    init_plex_client();
    init_pages();
    __name(onRequestGet9, "onRequestGet");
  },
});

// ../.wrangler/tmp/pages-KKAamF/functionsRoutes-0.5277810449847653.mjs
var routes;
var init_functionsRoutes_0_5277810449847653 = __esm({
  "../.wrangler/tmp/pages-KKAamF/functionsRoutes-0.5277810449847653.mjs"() {
    init_collections();
    init_counts();
    init_featured_collection();
    init_image();
    init_movies();
    init_sections();
    init_shows();
    init_status();
    init_top_rated();
    routes = [
      {
        routePath: "/api/plex/collections",
        mountPath: "/api/plex",
        method: "GET",
        middlewares: [],
        modules: [onRequestGet],
      },
      {
        routePath: "/api/plex/counts",
        mountPath: "/api/plex",
        method: "GET",
        middlewares: [],
        modules: [onRequestGet2],
      },
      {
        routePath: "/api/plex/featured-collection",
        mountPath: "/api/plex",
        method: "GET",
        middlewares: [],
        modules: [onRequestGet3],
      },
      {
        routePath: "/api/plex/image",
        mountPath: "/api/plex",
        method: "GET",
        middlewares: [],
        modules: [onRequestGet4],
      },
      {
        routePath: "/api/plex/movies",
        mountPath: "/api/plex",
        method: "GET",
        middlewares: [],
        modules: [onRequestGet5],
      },
      {
        routePath: "/api/plex/sections",
        mountPath: "/api/plex",
        method: "GET",
        middlewares: [],
        modules: [onRequestGet6],
      },
      {
        routePath: "/api/plex/shows",
        mountPath: "/api/plex",
        method: "GET",
        middlewares: [],
        modules: [onRequestGet7],
      },
      {
        routePath: "/api/plex/status",
        mountPath: "/api/plex",
        method: "GET",
        middlewares: [],
        modules: [onRequestGet8],
      },
      {
        routePath: "/api/plex/top-rated",
        mountPath: "/api/plex",
        method: "GET",
        middlewares: [],
        modules: [onRequestGet9],
      },
    ];
  },
});

// ../node_modules/wrangler/templates/pages-template-worker.ts
init_functionsRoutes_0_5277810449847653();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();

// ../node_modules/path-to-regexp/dist.es2015/index.js
init_functionsRoutes_0_5277810449847653();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
function lexer(str) {
  var tokens = [];
  var i = 0;
  while (i < str.length) {
    var char = str[i];
    if (char === "*" || char === "+" || char === "?") {
      tokens.push({ type: "MODIFIER", index: i, value: str[i++] });
      continue;
    }
    if (char === "\\") {
      tokens.push({ type: "ESCAPED_CHAR", index: i++, value: str[i++] });
      continue;
    }
    if (char === "{") {
      tokens.push({ type: "OPEN", index: i, value: str[i++] });
      continue;
    }
    if (char === "}") {
      tokens.push({ type: "CLOSE", index: i, value: str[i++] });
      continue;
    }
    if (char === ":") {
      var name = "";
      var j = i + 1;
      while (j < str.length) {
        var code = str.charCodeAt(j);
        if (
          // `0-9`
          (code >= 48 && code <= 57) || // `A-Z`
          (code >= 65 && code <= 90) || // `a-z`
          (code >= 97 && code <= 122) || // `_`
          code === 95
        ) {
          name += str[j++];
          continue;
        }
        break;
      }
      if (!name) throw new TypeError("Missing parameter name at ".concat(i));
      tokens.push({ type: "NAME", index: i, value: name });
      i = j;
      continue;
    }
    if (char === "(") {
      var count3 = 1;
      var pattern = "";
      var j = i + 1;
      if (str[j] === "?") {
        throw new TypeError('Pattern cannot start with "?" at '.concat(j));
      }
      while (j < str.length) {
        if (str[j] === "\\") {
          pattern += str[j++] + str[j++];
          continue;
        }
        if (str[j] === ")") {
          count3--;
          if (count3 === 0) {
            j++;
            break;
          }
        } else if (str[j] === "(") {
          count3++;
          if (str[j + 1] !== "?") {
            throw new TypeError(
              "Capturing groups are not allowed at ".concat(j),
            );
          }
        }
        pattern += str[j++];
      }
      if (count3) throw new TypeError("Unbalanced pattern at ".concat(i));
      if (!pattern) throw new TypeError("Missing pattern at ".concat(i));
      tokens.push({ type: "PATTERN", index: i, value: pattern });
      i = j;
      continue;
    }
    tokens.push({ type: "CHAR", index: i, value: str[i++] });
  }
  tokens.push({ type: "END", index: i, value: "" });
  return tokens;
}
__name(lexer, "lexer");
function parse(str, options) {
  if (options === void 0) {
    options = {};
  }
  var tokens = lexer(str);
  var _a = options.prefixes,
    prefixes = _a === void 0 ? "./" : _a,
    _b = options.delimiter,
    delimiter = _b === void 0 ? "/#?" : _b;
  var result = [];
  var key = 0;
  var i = 0;
  var path = "";
  var tryConsume = /* @__PURE__ */ __name(function (type) {
    if (i < tokens.length && tokens[i].type === type) return tokens[i++].value;
  }, "tryConsume");
  var mustConsume = /* @__PURE__ */ __name(function (type) {
    var value2 = tryConsume(type);
    if (value2 !== void 0) return value2;
    var _a2 = tokens[i],
      nextType = _a2.type,
      index = _a2.index;
    throw new TypeError(
      "Unexpected "
        .concat(nextType, " at ")
        .concat(index, ", expected ")
        .concat(type),
    );
  }, "mustConsume");
  var consumeText = /* @__PURE__ */ __name(function () {
    var result2 = "";
    var value2;
    while ((value2 = tryConsume("CHAR") || tryConsume("ESCAPED_CHAR"))) {
      result2 += value2;
    }
    return result2;
  }, "consumeText");
  var isSafe = /* @__PURE__ */ __name(function (value2) {
    for (var _i = 0, delimiter_1 = delimiter; _i < delimiter_1.length; _i++) {
      var char2 = delimiter_1[_i];
      if (value2.indexOf(char2) > -1) return true;
    }
    return false;
  }, "isSafe");
  var safePattern = /* @__PURE__ */ __name(function (prefix2) {
    var prev = result[result.length - 1];
    var prevText = prefix2 || (prev && typeof prev === "string" ? prev : "");
    if (prev && !prevText) {
      throw new TypeError(
        'Must have text between two parameters, missing text after "'.concat(
          prev.name,
          '"',
        ),
      );
    }
    if (!prevText || isSafe(prevText))
      return "[^".concat(escapeString(delimiter), "]+?");
    return "(?:(?!"
      .concat(escapeString(prevText), ")[^")
      .concat(escapeString(delimiter), "])+?");
  }, "safePattern");
  while (i < tokens.length) {
    var char = tryConsume("CHAR");
    var name = tryConsume("NAME");
    var pattern = tryConsume("PATTERN");
    if (name || pattern) {
      var prefix = char || "";
      if (prefixes.indexOf(prefix) === -1) {
        path += prefix;
        prefix = "";
      }
      if (path) {
        result.push(path);
        path = "";
      }
      result.push({
        name: name || key++,
        prefix,
        suffix: "",
        pattern: pattern || safePattern(prefix),
        modifier: tryConsume("MODIFIER") || "",
      });
      continue;
    }
    var value = char || tryConsume("ESCAPED_CHAR");
    if (value) {
      path += value;
      continue;
    }
    if (path) {
      result.push(path);
      path = "";
    }
    var open = tryConsume("OPEN");
    if (open) {
      var prefix = consumeText();
      var name_1 = tryConsume("NAME") || "";
      var pattern_1 = tryConsume("PATTERN") || "";
      var suffix = consumeText();
      mustConsume("CLOSE");
      result.push({
        name: name_1 || (pattern_1 ? key++ : ""),
        pattern: name_1 && !pattern_1 ? safePattern(prefix) : pattern_1,
        prefix,
        suffix,
        modifier: tryConsume("MODIFIER") || "",
      });
      continue;
    }
    mustConsume("END");
  }
  return result;
}
__name(parse, "parse");
function match(str, options) {
  var keys = [];
  var re = pathToRegexp(str, keys, options);
  return regexpToFunction(re, keys, options);
}
__name(match, "match");
function regexpToFunction(re, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.decode,
    decode =
      _a === void 0
        ? function (x) {
            return x;
          }
        : _a;
  return function (pathname) {
    var m = re.exec(pathname);
    if (!m) return false;
    var path = m[0],
      index = m.index;
    var params = /* @__PURE__ */ Object.create(null);
    var _loop_1 = /* @__PURE__ */ __name(function (i2) {
      if (m[i2] === void 0) return "continue";
      var key = keys[i2 - 1];
      if (key.modifier === "*" || key.modifier === "+") {
        params[key.name] = m[i2]
          .split(key.prefix + key.suffix)
          .map(function (value) {
            return decode(value, key);
          });
      } else {
        params[key.name] = decode(m[i2], key);
      }
    }, "_loop_1");
    for (var i = 1; i < m.length; i++) {
      _loop_1(i);
    }
    return { path, index, params };
  };
}
__name(regexpToFunction, "regexpToFunction");
function escapeString(str) {
  return str.replace(/([.+*?=^!:${}()[\]|/\\])/g, "\\$1");
}
__name(escapeString, "escapeString");
function flags(options) {
  return options && options.sensitive ? "" : "i";
}
__name(flags, "flags");
function regexpToRegexp(path, keys) {
  if (!keys) return path;
  var groupsRegex = /\((?:\?<(.*?)>)?(?!\?)/g;
  var index = 0;
  var execResult = groupsRegex.exec(path.source);
  while (execResult) {
    keys.push({
      // Use parenthesized substring match if available, index otherwise
      name: execResult[1] || index++,
      prefix: "",
      suffix: "",
      modifier: "",
      pattern: "",
    });
    execResult = groupsRegex.exec(path.source);
  }
  return path;
}
__name(regexpToRegexp, "regexpToRegexp");
function arrayToRegexp(paths, keys, options) {
  var parts = paths.map(function (path) {
    return pathToRegexp(path, keys, options).source;
  });
  return new RegExp("(?:".concat(parts.join("|"), ")"), flags(options));
}
__name(arrayToRegexp, "arrayToRegexp");
function stringToRegexp(path, keys, options) {
  return tokensToRegexp(parse(path, options), keys, options);
}
__name(stringToRegexp, "stringToRegexp");
function tokensToRegexp(tokens, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.strict,
    strict = _a === void 0 ? false : _a,
    _b = options.start,
    start = _b === void 0 ? true : _b,
    _c = options.end,
    end = _c === void 0 ? true : _c,
    _d = options.encode,
    encode =
      _d === void 0
        ? function (x) {
            return x;
          }
        : _d,
    _e = options.delimiter,
    delimiter = _e === void 0 ? "/#?" : _e,
    _f = options.endsWith,
    endsWith = _f === void 0 ? "" : _f;
  var endsWithRe = "[".concat(escapeString(endsWith), "]|$");
  var delimiterRe = "[".concat(escapeString(delimiter), "]");
  var route = start ? "^" : "";
  for (var _i = 0, tokens_1 = tokens; _i < tokens_1.length; _i++) {
    var token = tokens_1[_i];
    if (typeof token === "string") {
      route += escapeString(encode(token));
    } else {
      var prefix = escapeString(encode(token.prefix));
      var suffix = escapeString(encode(token.suffix));
      if (token.pattern) {
        if (keys) keys.push(token);
        if (prefix || suffix) {
          if (token.modifier === "+" || token.modifier === "*") {
            var mod = token.modifier === "*" ? "?" : "";
            route += "(?:"
              .concat(prefix, "((?:")
              .concat(token.pattern, ")(?:")
              .concat(suffix)
              .concat(prefix, "(?:")
              .concat(token.pattern, "))*)")
              .concat(suffix, ")")
              .concat(mod);
          } else {
            route += "(?:"
              .concat(prefix, "(")
              .concat(token.pattern, ")")
              .concat(suffix, ")")
              .concat(token.modifier);
          }
        } else {
          if (token.modifier === "+" || token.modifier === "*") {
            throw new TypeError(
              'Can not repeat "'.concat(
                token.name,
                '" without a prefix and suffix',
              ),
            );
          }
          route += "(".concat(token.pattern, ")").concat(token.modifier);
        }
      } else {
        route += "(?:"
          .concat(prefix)
          .concat(suffix, ")")
          .concat(token.modifier);
      }
    }
  }
  if (end) {
    if (!strict) route += "".concat(delimiterRe, "?");
    route += !options.endsWith ? "$" : "(?=".concat(endsWithRe, ")");
  } else {
    var endToken = tokens[tokens.length - 1];
    var isEndDelimited =
      typeof endToken === "string"
        ? delimiterRe.indexOf(endToken[endToken.length - 1]) > -1
        : endToken === void 0;
    if (!strict) {
      route += "(?:".concat(delimiterRe, "(?=").concat(endsWithRe, "))?");
    }
    if (!isEndDelimited) {
      route += "(?=".concat(delimiterRe, "|").concat(endsWithRe, ")");
    }
  }
  return new RegExp(route, flags(options));
}
__name(tokensToRegexp, "tokensToRegexp");
function pathToRegexp(path, keys, options) {
  if (path instanceof RegExp) return regexpToRegexp(path, keys);
  if (Array.isArray(path)) return arrayToRegexp(path, keys, options);
  return stringToRegexp(path, keys, options);
}
__name(pathToRegexp, "pathToRegexp");

// ../node_modules/wrangler/templates/pages-template-worker.ts
var escapeRegex = /[.+?^${}()|[\]\\]/g;
function* executeRequest(request) {
  const requestPath = new URL(request.url).pathname;
  for (const route of [...routes].reverse()) {
    if (route.method && route.method !== request.method) {
      continue;
    }
    const routeMatcher = match(route.routePath.replace(escapeRegex, "\\$&"), {
      end: false,
    });
    const mountMatcher = match(route.mountPath.replace(escapeRegex, "\\$&"), {
      end: false,
    });
    const matchResult = routeMatcher(requestPath);
    const mountMatchResult = mountMatcher(requestPath);
    if (matchResult && mountMatchResult) {
      for (const handler of route.middlewares.flat()) {
        yield {
          handler,
          params: matchResult.params,
          path: mountMatchResult.path,
        };
      }
    }
  }
  for (const route of routes) {
    if (route.method && route.method !== request.method) {
      continue;
    }
    const routeMatcher = match(route.routePath.replace(escapeRegex, "\\$&"), {
      end: true,
    });
    const mountMatcher = match(route.mountPath.replace(escapeRegex, "\\$&"), {
      end: false,
    });
    const matchResult = routeMatcher(requestPath);
    const mountMatchResult = mountMatcher(requestPath);
    if (matchResult && mountMatchResult && route.modules.length) {
      for (const handler of route.modules.flat()) {
        yield {
          handler,
          params: matchResult.params,
          path: matchResult.path,
        };
      }
      break;
    }
  }
}
__name(executeRequest, "executeRequest");
var pages_template_worker_default = {
  async fetch(originalRequest, env2, workerContext) {
    let request = originalRequest;
    const handlerIterator = executeRequest(request);
    let data = {};
    let isFailOpen = false;
    const next = /* @__PURE__ */ __name(async (input, init) => {
      if (input !== void 0) {
        let url = input;
        if (typeof input === "string") {
          url = new URL(input, request.url).toString();
        }
        request = new Request(url, init);
      }
      const result = handlerIterator.next();
      if (result.done === false) {
        const { handler, params, path } = result.value;
        const context2 = {
          request: new Request(request.clone()),
          functionPath: path,
          next,
          params,
          get data() {
            return data;
          },
          set data(value) {
            if (typeof value !== "object" || value === null) {
              throw new Error("context.data must be an object");
            }
            data = value;
          },
          env: env2,
          waitUntil: workerContext.waitUntil.bind(workerContext),
          passThroughOnException: /* @__PURE__ */ __name(() => {
            isFailOpen = true;
          }, "passThroughOnException"),
        };
        const response = await handler(context2);
        if (!(response instanceof Response)) {
          throw new Error("Your Pages function should return a Response");
        }
        return cloneResponse(response);
      } else if ("ASSETS") {
        const response = await env2["ASSETS"].fetch(request);
        return cloneResponse(response);
      } else {
        const response = await fetch(request);
        return cloneResponse(response);
      }
    }, "next");
    try {
      return await next();
    } catch (error3) {
      if (isFailOpen) {
        const response = await env2["ASSETS"].fetch(request);
        return cloneResponse(response);
      }
      throw error3;
    }
  },
};
var cloneResponse = /* @__PURE__ */ __name(
  (response) =>
    // https://fetch.spec.whatwg.org/#null-body-status
    new Response(
      [101, 204, 205, 304].includes(response.status) ? null : response.body,
      response,
    ),
  "cloneResponse",
);
export { pages_template_worker_default as default };
