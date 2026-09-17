var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __esm = (fn, res, err) => function __init() {
  if (err) throw err[0];
  try {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  } catch (e) {
    throw err = [e], e;
  }
};
var __commonJS = (cb, mod) => function __require() {
  try {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  } catch (e) {
    throw mod = 0, e;
  }
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

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
    init_functionsRoutes_0_9741670341706992();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    __name(createNotImplementedError, "createNotImplementedError");
    __name(notImplemented, "notImplemented");
    __name(notImplementedClass, "notImplementedClass");
  }
});

// ../node_modules/unenv/dist/runtime/node/internal/perf_hooks/performance.mjs
var _timeOrigin, _performanceNow, nodeTiming, PerformanceEntry, PerformanceMark, PerformanceMeasure, PerformanceResourceTiming, PerformanceObserverEntryList, Performance, PerformanceObserver, performance;
var init_performance = __esm({
  "../node_modules/unenv/dist/runtime/node/internal/perf_hooks/performance.mjs"() {
    init_functionsRoutes_0_9741670341706992();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    init_utils();
    _timeOrigin = globalThis.performance?.timeOrigin ?? Date.now();
    _performanceNow = globalThis.performance?.now ? globalThis.performance.now.bind(globalThis.performance) : () => Date.now() - _timeOrigin;
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
        eventsWaiting: 0
      },
      detail: void 0,
      toJSON() {
        return this;
      }
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
          detail: this.detail
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
        this._entries = markName ? this._entries.filter((e) => e.name !== markName) : this._entries.filter((e) => e.entryType !== "mark");
      }
      clearMeasures(measureName) {
        this._entries = measureName ? this._entries.filter((e) => e.name !== measureName) : this._entries.filter((e) => e.entryType !== "measure");
      }
      clearResourceTimings() {
        this._entries = this._entries.filter((e) => e.entryType !== "resource" || e.entryType !== "navigation");
      }
      getEntries() {
        return this._entries;
      }
      getEntriesByName(name, type) {
        return this._entries.filter((e) => e.name === name && (!type || e.entryType === type));
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
        let start2;
        let end;
        if (typeof startOrMeasureOptions === "string") {
          start2 = this.getEntriesByName(startOrMeasureOptions, "mark")[0]?.startTime;
          end = this.getEntriesByName(endMark, "mark")[0]?.startTime;
        } else {
          start2 = Number.parseFloat(startOrMeasureOptions?.start) || this.now();
          end = Number.parseFloat(startOrMeasureOptions?.end) || this.now();
        }
        const entry = new PerformanceMeasure(measureName, {
          startTime: start2,
          detail: {
            start: start2,
            end
          }
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
    performance = globalThis.performance && "addEventListener" in globalThis.performance ? globalThis.performance : new Performance();
  }
});

// ../node_modules/unenv/dist/runtime/node/perf_hooks.mjs
var init_perf_hooks = __esm({
  "../node_modules/unenv/dist/runtime/node/perf_hooks.mjs"() {
    init_functionsRoutes_0_9741670341706992();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    init_performance();
  }
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
  }
});

// ../node_modules/unenv/dist/runtime/mock/noop.mjs
var noop_default;
var init_noop = __esm({
  "../node_modules/unenv/dist/runtime/mock/noop.mjs"() {
    init_functionsRoutes_0_9741670341706992();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    noop_default = Object.assign(() => {
    }, { __unenv__: true });
  }
});

// ../node_modules/unenv/dist/runtime/node/console.mjs
import { Writable } from "node:stream";
var _console, _ignoreErrors, _stderr, _stdout, log, info, trace, debug, table, error, warn, createTask, clear, count, countReset, dir, dirxml, group, groupEnd, groupCollapsed, profile, profileEnd, time, timeEnd, timeLog, timeStamp, Console, _times, _stdoutErrorHandler, _stderrErrorHandler;
var init_console = __esm({
  "../node_modules/unenv/dist/runtime/node/console.mjs"() {
    init_functionsRoutes_0_9741670341706992();
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
    createTask = _console?.createTask ?? /* @__PURE__ */ notImplemented("console.createTask");
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
    Console = _console?.Console ?? /* @__PURE__ */ notImplementedClass("console.Console");
    _times = /* @__PURE__ */ new Map();
    _stdoutErrorHandler = noop_default;
    _stderrErrorHandler = noop_default;
  }
});

// ../node_modules/@cloudflare/unenv-preset/dist/runtime/node/console.mjs
var workerdConsole, assert, clear2, context, count2, countReset2, createTask2, debug2, dir2, dirxml2, error2, group2, groupCollapsed2, groupEnd2, info2, log2, profile2, profileEnd2, table2, time2, timeEnd2, timeLog2, timeStamp2, trace2, warn2, console_default;
var init_console2 = __esm({
  "../node_modules/@cloudflare/unenv-preset/dist/runtime/node/console.mjs"() {
    init_functionsRoutes_0_9741670341706992();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    init_console();
    workerdConsole = globalThis["console"];
    ({
      assert,
      clear: clear2,
      context: (
        // @ts-expect-error undocumented public API
        context
      ),
      count: count2,
      countReset: countReset2,
      createTask: (
        // @ts-expect-error undocumented public API
        createTask2
      ),
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
      warn: warn2
    } = workerdConsole);
    Object.assign(workerdConsole, {
      Console,
      _ignoreErrors,
      _stderr,
      _stderrErrorHandler,
      _stdout,
      _stdoutErrorHandler,
      _times
    });
    console_default = workerdConsole;
  }
});

// ../node_modules/wrangler/_virtual_unenv_global_polyfill-@cloudflare-unenv-preset-node-console
var init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console = __esm({
  "../node_modules/wrangler/_virtual_unenv_global_polyfill-@cloudflare-unenv-preset-node-console"() {
    init_console2();
    globalThis.console = console_default;
  }
});

// ../node_modules/unenv/dist/runtime/node/internal/process/hrtime.mjs
var hrtime;
var init_hrtime = __esm({
  "../node_modules/unenv/dist/runtime/node/internal/process/hrtime.mjs"() {
    init_functionsRoutes_0_9741670341706992();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    hrtime = /* @__PURE__ */ Object.assign(/* @__PURE__ */ __name(function hrtime2(startTime) {
      const now = Date.now();
      const seconds = Math.trunc(now / 1e3);
      const nanos = now % 1e3 * 1e6;
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
    }, "hrtime"), { bigint: /* @__PURE__ */ __name(function bigint() {
      return BigInt(Date.now() * 1e6);
    }, "bigint") });
  }
});

// ../node_modules/unenv/dist/runtime/node/internal/tty/read-stream.mjs
var ReadStream;
var init_read_stream = __esm({
  "../node_modules/unenv/dist/runtime/node/internal/tty/read-stream.mjs"() {
    init_functionsRoutes_0_9741670341706992();
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
  }
});

// ../node_modules/unenv/dist/runtime/node/internal/tty/write-stream.mjs
var WriteStream;
var init_write_stream = __esm({
  "../node_modules/unenv/dist/runtime/node/internal/tty/write-stream.mjs"() {
    init_functionsRoutes_0_9741670341706992();
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
      hasColors(count4, env2) {
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
        } catch {
        }
        cb && typeof cb === "function" && cb();
        return false;
      }
    };
  }
});

// ../node_modules/unenv/dist/runtime/node/tty.mjs
var init_tty = __esm({
  "../node_modules/unenv/dist/runtime/node/tty.mjs"() {
    init_functionsRoutes_0_9741670341706992();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    init_read_stream();
    init_write_stream();
  }
});

// ../node_modules/unenv/dist/runtime/node/internal/process/node-version.mjs
var NODE_VERSION;
var init_node_version = __esm({
  "../node_modules/unenv/dist/runtime/node/internal/process/node-version.mjs"() {
    init_functionsRoutes_0_9741670341706992();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    NODE_VERSION = "22.14.0";
  }
});

// ../node_modules/unenv/dist/runtime/node/internal/process/process.mjs
import { EventEmitter } from "node:events";
var Process;
var init_process = __esm({
  "../node_modules/unenv/dist/runtime/node/internal/process/process.mjs"() {
    init_functionsRoutes_0_9741670341706992();
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
        for (const prop of [...Object.getOwnPropertyNames(_Process.prototype), ...Object.getOwnPropertyNames(EventEmitter.prototype)]) {
          const value = this[prop];
          if (typeof value === "function") {
            this[prop] = value.bind(this);
          }
        }
      }
      // --- event emitter ---
      emitWarning(warning, type, code) {
        console.warn(`${code ? `[${code}] ` : ""}${type ? `${type}: ` : ""}${warning}`);
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
        return this.#stdin ??= new ReadStream(0);
      }
      get stdout() {
        return this.#stdout ??= new WriteStream(1);
      }
      get stderr() {
        return this.#stderr ??= new WriteStream(2);
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
      ref() {
      }
      unref() {
      }
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
        throw createNotImplementedError("process.setUncaughtExceptionCaptureCallback");
      }
      hasUncaughtExceptionCaptureCallback() {
        throw createNotImplementedError("process.hasUncaughtExceptionCaptureCallback");
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
      permission = { has: /* @__PURE__ */ notImplemented("process.permission.has") };
      report = {
        directory: "",
        filename: "",
        signal: "SIGUSR2",
        compact: false,
        reportOnFatalError: false,
        reportOnSignal: false,
        reportOnUncaughtException: false,
        getReport: /* @__PURE__ */ notImplemented("process.report.getReport"),
        writeReport: /* @__PURE__ */ notImplemented("process.report.writeReport")
      };
      finalization = {
        register: /* @__PURE__ */ notImplemented("process.finalization.register"),
        unregister: /* @__PURE__ */ notImplemented("process.finalization.unregister"),
        registerBeforeExit: /* @__PURE__ */ notImplemented("process.finalization.registerBeforeExit")
      };
      memoryUsage = Object.assign(() => ({
        arrayBuffers: 0,
        rss: 0,
        external: 0,
        heapTotal: 0,
        heapUsed: 0
      }), { rss: /* @__PURE__ */ __name(() => 0, "rss") });
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
  }
});

// ../node_modules/@cloudflare/unenv-preset/dist/runtime/node/process.mjs
var globalProcess, getBuiltinModule, workerdProcess, unenvProcess, exit, features, platform, _channel, _debugEnd, _debugProcess, _disconnect, _events, _eventsCount, _exiting, _fatalException, _getActiveHandles, _getActiveRequests, _handleQueue, _kill, _linkedBinding, _maxListeners, _pendingMessage, _preload_modules, _rawDebug, _send, _startProfilerIdleNotifier, _stopProfilerIdleNotifier, _tickCallback, abort, addListener, allowedNodeEnvironmentFlags, arch, argv, argv0, assert2, availableMemory, binding, channel, chdir, config, connected, constrainedMemory, cpuUsage, cwd, debugPort, disconnect, dlopen, domain, emit, emitWarning, env, eventNames, execArgv, execPath, exitCode, finalization, getActiveResourcesInfo, getegid, geteuid, getgid, getgroups, getMaxListeners, getuid, hasUncaughtExceptionCaptureCallback, hrtime3, initgroups, kill, listenerCount, listeners, loadEnvFile, mainModule, memoryUsage, moduleLoadList, nextTick, off, on, once, openStdin, permission, pid, ppid, prependListener, prependOnceListener, rawListeners, reallyExit, ref, release, removeAllListeners, removeListener, report, resourceUsage, send, setegid, seteuid, setgid, setgroups, setMaxListeners, setSourceMapsEnabled, setuid, setUncaughtExceptionCaptureCallback, sourceMapsEnabled, stderr, stdin, stdout, throwDeprecation, title, traceDeprecation, umask, unref, uptime, version, versions, _process, process_default;
var init_process2 = __esm({
  "../node_modules/@cloudflare/unenv-preset/dist/runtime/node/process.mjs"() {
    init_functionsRoutes_0_9741670341706992();
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
      nextTick: workerdProcess.nextTick
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
      versions
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
      _linkedBinding
    };
    process_default = _process;
  }
});

// ../node_modules/wrangler/_virtual_unenv_global_polyfill-@cloudflare-unenv-preset-node-process
var init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process = __esm({
  "../node_modules/wrangler/_virtual_unenv_global_polyfill-@cloudflare-unenv-preset-node-process"() {
    init_process2();
    globalThis.process = process_default;
  }
});

// ../shared/portal/auth.js
function cookieName(request) {
  return new URL(request.url).protocol === "https:" ? "__Host-plexpoint_session" : "plexpoint_local_session";
}
function sessionCookie(request, token, seconds = SESSION_SECONDS) {
  const secure = new URL(request.url).protocol === "https:" ? "; Secure" : "";
  return `${cookieName(request)}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${seconds}${secure}`;
}
function readToken(request) {
  const prefix = `${cookieName(request)}=`;
  const matches = (request.headers.get("Cookie") || "").split(";").map((part) => part.trim()).filter((part) => part.startsWith(prefix));
  const token = matches.length === 1 ? matches[0].slice(prefix.length) : "";
  return /^[a-f0-9]{64}$/.test(token) ? token : null;
}
function reply(data, status = 200, headers = {}) {
  return Response.json(data, { status, headers: {
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
    "Vary": "Cookie",
    ...headers
  } });
}
async function readBody(request) {
  const url = new URL(request.url);
  if (request.headers.get("Origin") !== url.origin || request.headers.get("X-PlexPoint-Request") !== "1" || request.headers.get("Sec-Fetch-Site") === "cross-site") {
    throw new AuthError(403, "Please submit this form from My PlexPoint.");
  }
  if (request.headers.get("Content-Type")?.split(";")[0].trim().toLowerCase() !== "application/json") {
    throw new AuthError(415, "Please send a JSON request.");
  }
  if (Number(request.headers.get("Content-Length")) > 4096) throw new AuthError(413, "The request is too large.");
  const reader = request.body?.getReader();
  if (!reader) throw new AuthError(400, "Please complete the form.");
  let size = 0;
  const chunks = [];
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 4096) {
        await reader.cancel();
        throw new AuthError(413, "The request is too large.");
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  try {
    const data = JSON.parse(new TextDecoder().decode(bytes));
    if (!data || typeof data !== "object" || Array.isArray(data)) throw new Error();
    return data;
  } catch {
    throw new AuthError(400, "Please complete the form with valid values.");
  }
}
function credentials(body, registering) {
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = body.password;
  if (email.length > 254 || !/^[^\s@\x00-\x1f\x7f]+@[^\s@\x00-\x1f\x7f]+\.[^\s@\x00-\x1f\x7f]+$/.test(email)) {
    throw new AuthError(400, "Enter a valid email address.");
  }
  if (typeof password !== "string" || password.length < (registering ? 15 : 1) || password.length > 128) {
    throw new AuthError(400, registering ? "Use a password between 15 and 128 characters." : "Enter your email and password.");
  }
  const displayName = typeof body.displayName === "string" ? body.displayName.trim() : "";
  if (registering && (!displayName || displayName.length > 100 || /[\x00-\x1f\x7f]/.test(displayName))) {
    throw new AuthError(400, "Enter a display name between 1 and 100 characters.");
  }
  return { email, password, displayName };
}
async function passwordHash(password, salt, iterations = ITERATIONS) {
  const key = await crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, ["deriveBits"]);
  const saltBytes = Uint8Array.from(salt.match(/../g), (pair) => parseInt(pair, 16));
  return hex(await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt: saltBytes, iterations }, key, 256));
}
function equalHash(left, right) {
  let difference = left.length ^ right.length;
  for (let i = 0; i < left.length; i++) difference |= left.charCodeAt(i) ^ (right.charCodeAt(i) || 0);
  return difference === 0;
}
async function rateLimit(db, request, action, email, now) {
  const ip = request.headers.get("CF-Connecting-IP") || "local";
  const buckets = [[`${action}:ip:${ip}`, action === "register" ? 10 : 30]];
  if (email !== null) buckets.push([`${action}:email:${email}`, 10]);
  const keys = await Promise.all(buckets.map(async ([key, limit]) => [await digest(key), limit]));
  const results = await db.batch(keys.map(([key]) => db.prepare(`
    INSERT INTO auth_rate_limits(key_hash, attempts, expires_at) VALUES (?, 1, ?)
    ON CONFLICT(key_hash) DO UPDATE SET
      attempts = CASE WHEN expires_at <= ? THEN 1 ELSE attempts + 1 END,
      expires_at = CASE WHEN expires_at <= ? THEN excluded.expires_at ELSE expires_at END
    RETURNING attempts`).bind(key, now + WINDOW_MS, now, now)));
  if (results.some((result, index) => result.results[0].attempts > keys[index][1])) {
    throw new AuthError(429, "Too many attempts. Please try again in 15 minutes.");
  }
}
function isAdminEmail(value) {
  return typeof value === "string" && value.trim().toLowerCase() === ADMIN_EMAIL;
}
function publicUser(row, proxyAvatar = false) {
  return {
    id: row.id,
    email: row.email,
    displayName: row.display_name,
    createdAt: row.created_at,
    ...isAdminEmail(row.email) ? { isAdmin: true } : {},
    ...proxyAvatar ? { avatarUrl: "/api/portal/avatar" } : {},
    ...row.plex_username ? { plex: {
      username: row.plex_username,
      ...row.plex_avatar_url ? { avatarUrl: row.plex_avatar_url } : {}
    } } : {}
  };
}
async function plexAvatarColumnAvailable(db) {
  try {
    return Boolean(await db.prepare("SELECT name FROM pragma_table_info('plex_identities') WHERE name = 'avatar_url'").first());
  } catch {
    return false;
  }
}
async function withPlexAvatar(db, row) {
  if (!row?.id || !row.plex_username || !await plexAvatarColumnAvailable(db)) return row;
  const identity = await db.prepare("SELECT avatar_url FROM plex_identities WHERE user_id = ?").bind(row.id).first();
  return { ...row, plex_avatar_url: identity?.avatar_url || null };
}
async function sessionStatements(db, request, userId, now) {
  const token = randomHex(32);
  const statements = [db.prepare("INSERT INTO auth_sessions(token_hash, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)").bind(await digest(token), userId, now, now + SESSION_SECONDS * 1e3)];
  const previous = readToken(request);
  if (previous) statements.push(db.prepare("DELETE FROM auth_sessions WHERE token_hash = ?").bind(await digest(previous)));
  statements.push(db.prepare("DELETE FROM auth_sessions WHERE expires_at <= ?").bind(now));
  statements.push(db.prepare("DELETE FROM auth_rate_limits WHERE expires_at <= ?").bind(now));
  return { token, statements };
}
async function register(db, request, body, now) {
  const { email, password, displayName } = credentials(body, true);
  await rateLimit(db, request, "register", email, now);
  const salt = randomHex(16);
  const hash = await passwordHash(password, salt);
  const unavailable = /* @__PURE__ */ __name(() => new AuthError(400, "Unable to create this account. Try signing in, or contact support."), "unavailable");
  if (await db.prepare("SELECT id FROM users WHERE email = ?").bind(email).first()) throw unavailable();
  const id = crypto.randomUUID();
  const session = await sessionStatements(db, request, id, now);
  try {
    await db.batch([
      db.prepare("INSERT INTO users(id, email, display_name, role, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)").bind(id, email, displayName, isAdminEmail(email) ? "admin" : "user", now, now),
      db.prepare("INSERT INTO password_credentials(user_id, salt, password_hash, iterations, created_at) VALUES (?, ?, ?, ?, ?)").bind(id, salt, hash, ITERATIONS, now),
      ...session.statements
    ]);
  } catch (error3) {
    if (await db.prepare("SELECT id FROM users WHERE email = ?").bind(email).first()) throw unavailable();
    throw error3;
  }
  return reply(
    { user: publicUser({ id, email, display_name: displayName, created_at: now }) },
    201,
    { "Set-Cookie": sessionCookie(request, session.token) }
  );
}
async function login(db, request, body, now) {
  const { email, password } = credentials(body, false);
  await rateLimit(db, request, "login", email, now);
  const row = await db.prepare(`SELECT u.id, u.email, u.display_name, u.created_at, u.account_status,
    c.salt, c.password_hash, c.iterations, p.username AS plex_username FROM users u
    LEFT JOIN password_credentials c ON c.user_id = u.id
    LEFT JOIN plex_identities p ON p.user_id = u.id WHERE u.email = ?`).bind(email).first();
  const hash = await passwordHash(password, row?.salt || "00".repeat(16), row?.iterations || ITERATIONS);
  if (!equalHash(hash, row?.password_hash || "00".repeat(32)) || row?.account_status !== "enabled") {
    throw new AuthError(401, "Email or password is incorrect.");
  }
  const session = await sessionStatements(db, request, row.id, now);
  await db.batch(session.statements);
  return reply({ user: publicUser(await withPlexAvatar(db, row)) }, 200, { "Set-Cookie": sessionCookie(request, session.token) });
}
async function sessionUser(db, request, now = Date.now()) {
  const token = readToken(request);
  return token ? await db.prepare(`SELECT u.id, u.email, u.display_name, u.created_at,
    p.plex_id, p.username AS plex_username, l.tautulli_user_id
    FROM auth_sessions s JOIN users u ON u.id = s.user_id
    LEFT JOIN plex_identities p ON p.user_id = u.id
    LEFT JOIN plex_account_links l ON l.user_id = u.id
    WHERE s.token_hash = ? AND s.expires_at > ? AND u.account_status = 'enabled'`).bind(await digest(token), now).first() : null;
}
async function currentSession(db, request, now) {
  const row = await sessionUser(db, request, now);
  return reply(
    { user: row ? publicUser(await withPlexAvatar(db, row), true) : null },
    200,
    !row && readToken(request) ? { "Set-Cookie": sessionCookie(request, "", 0) } : {}
  );
}
async function authResponse(request, env2, action) {
  try {
    const url = new URL(request.url);
    if (url.protocol !== "https:" && !["localhost", "127.0.0.1", "[::1]"].includes(url.hostname)) {
      throw new AuthError(400, "Account access requires HTTPS.");
    }
    if (!["register", "login", "session", "logout"].includes(action)) throw new AuthError(404, "Not found.");
    const method = action === "session" ? "GET" : "POST";
    if (request.method !== method) return reply({ message: "Method not allowed." }, 405, { Allow: method });
    const body = method === "POST" ? await readBody(request) : null;
    if (!env2.PORTAL_DB) throw new AuthError(503, "Account services are not configured yet. Please try again later.");
    const db = env2.PORTAL_DB;
    const now = Date.now();
    if (action === "register") return await register(db, request, body, now);
    if (action === "login") return await login(db, request, body, now);
    if (action === "session") return await currentSession(db, request, now);
    const token = readToken(request);
    if (token) await db.prepare("DELETE FROM auth_sessions WHERE token_hash = ?").bind(await digest(token)).run();
    return reply({ user: null }, 200, { "Set-Cookie": sessionCookie(request, "", 0) });
  } catch (error3) {
    if (!(error3 instanceof AuthError)) console.error(JSON.stringify({ event: "portal_auth_error", action, errorType: error3?.name || "UnknownError" }));
    return reply(
      { message: error3 instanceof AuthError ? error3.message : "Account services are temporarily unavailable. Please try again later." },
      error3 instanceof AuthError ? error3.status : 503,
      error3.status === 429 ? { "Retry-After": "900" } : {}
    );
  }
}
var SESSION_SECONDS, ITERATIONS, WINDOW_MS, ADMIN_EMAIL, encoder, hex, randomHex, digest, AuthError;
var init_auth = __esm({
  "../shared/portal/auth.js"() {
    init_functionsRoutes_0_9741670341706992();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    SESSION_SECONDS = 7 * 24 * 60 * 60;
    ITERATIONS = 1e5;
    WINDOW_MS = 15 * 60 * 1e3;
    ADMIN_EMAIL = "jacobnathan1718@gmail.com";
    encoder = new TextEncoder();
    hex = /* @__PURE__ */ __name((bytes) => Array.from(new Uint8Array(bytes), (value) => value.toString(16).padStart(2, "0")).join(""), "hex");
    randomHex = /* @__PURE__ */ __name((length) => hex(crypto.getRandomValues(new Uint8Array(length))), "randomHex");
    digest = /* @__PURE__ */ __name(async (value) => hex(await crypto.subtle.digest("SHA-256", encoder.encode(value))), "digest");
    AuthError = class extends Error {
      static {
        __name(this, "AuthError");
      }
      constructor(status, message) {
        super(message);
        this.status = status;
      }
    };
    __name(cookieName, "cookieName");
    __name(sessionCookie, "sessionCookie");
    __name(readToken, "readToken");
    __name(reply, "reply");
    __name(readBody, "readBody");
    __name(credentials, "credentials");
    __name(passwordHash, "passwordHash");
    __name(equalHash, "equalHash");
    __name(rateLimit, "rateLimit");
    __name(isAdminEmail, "isAdminEmail");
    __name(publicUser, "publicUser");
    __name(plexAvatarColumnAvailable, "plexAvatarColumnAvailable");
    __name(withPlexAvatar, "withPlexAvatar");
    __name(sessionStatements, "sessionStatements");
    __name(register, "register");
    __name(login, "login");
    __name(sessionUser, "sessionUser");
    __name(currentSession, "currentSession");
    __name(authResponse, "authResponse");
  }
});

// ../shared/portal/billing.js
function ensureHttps(request) {
  const url = new URL(request.url);
  if (url.protocol !== "https:" && !["localhost", "127.0.0.1", "[::1]"].includes(url.hostname)) {
    throw new AuthError(400, "Account access requires HTTPS.");
  }
  return url;
}
function identifier(value, label = "account") {
  if (typeof value !== "string" || !value || value.length > 128 || /[\x00-\x1f\x7f]/.test(value)) {
    throw new AuthError(400, `Select a valid ${label}.`);
  }
  return value;
}
function dateTimestamp(value, label) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new AuthError(400, `Enter a valid ${label}.`);
  }
  const timestamp = Date.parse(`${value}T00:00:00.000Z`);
  if (!Number.isSafeInteger(timestamp) || timestamp < 0 || new Date(timestamp).toISOString().slice(0, 10) !== value) {
    throw new AuthError(400, `Enter a valid ${label}.`);
  }
  return timestamp;
}
function paymentState(period, now = Date.now()) {
  if (!period) return "none";
  if (period.status === "void") return "void";
  if (period.outstandingMinor === 0) return "paid";
  if (period.pendingMinor > 0) return "awaiting_confirmation";
  if (now >= period.endsAt) return "overdue";
  if (period.endsAt - now <= 7 * DAY_MS) return "due_soon";
  return period.confirmedMinor > 0 ? "partially_paid" : "unpaid";
}
function mapPeriod(row, now) {
  const amountDueMinor = Number(row.amount_due_minor);
  const confirmedMinor = Number(row.confirmed_minor || 0);
  const pendingMinor = Number(row.pending_minor || 0);
  const period = {
    id: row.id,
    tierId: row.tier_id,
    tier: row.tier_name,
    startsAt: Number(row.starts_at),
    endsAt: Number(row.ends_at),
    amountDueMinor,
    currency: row.currency,
    status: row.status,
    confirmedMinor,
    pendingMinor,
    outstandingMinor: row.status === "void" ? 0 : Math.max(0, amountDueMinor - confirmedMinor),
    creditMinor: Math.max(0, confirmedMinor - amountDueMinor)
  };
  return { ...period, paymentStatus: paymentState(period, now) };
}
function mapPayment(row) {
  return {
    id: row.id,
    amountMinor: Number(row.amount_minor),
    currency: row.currency,
    status: row.status,
    method: row.method,
    receivedAt: row.received_at == null ? null : Number(row.received_at),
    reference: row.provider_payment_id || null,
    periodStartsAt: Number(row.period_starts_at),
    periodEndsAt: Number(row.period_ends_at)
  };
}
async function billingForUser(db, userId, { includeVoided = false, now = Date.now() } = {}) {
  const subscription = await db.prepare(`SELECT
    s.id, s.tier_id, s.access_status, s.starts_at, s.ends_at,
    t.name AS tier_name, t.monthly_price_minor, t.currency
    FROM subscriptions s JOIN subscription_tiers t ON t.id = s.tier_id
    WHERE s.user_id = ?`).bind(userId).first();
  if (!subscription) return { subscription: null, currentPeriod: null, payments: [] };
  const periodResult = await db.prepare(`SELECT
    bp.id, bp.tier_id, t.name AS tier_name, bp.starts_at, bp.ends_at,
    bp.amount_due_minor, bp.currency, bp.status,
    COALESCE(SUM(CASE WHEN p.status = 'confirmed' THEN p.amount_minor ELSE 0 END), 0) AS confirmed_minor,
    COALESCE(SUM(CASE WHEN p.status = 'pending' THEN p.amount_minor ELSE 0 END), 0) AS pending_minor
    FROM billing_periods bp
    JOIN subscription_tiers t ON t.id = bp.tier_id
    LEFT JOIN payments p ON p.billing_period_id = bp.id
    WHERE bp.subscription_id = ?
    GROUP BY bp.id, bp.tier_id, t.name, bp.starts_at, bp.ends_at, bp.amount_due_minor, bp.currency, bp.status
    ORDER BY bp.starts_at DESC LIMIT 24`).bind(subscription.id).all();
  const periods = (periodResult.results || []).map((row) => mapPeriod(row, now));
  const currentPeriod = periods.find((period) => period.status === "open" && period.startsAt === Number(subscription.starts_at) && period.endsAt === Number(subscription.ends_at)) || periods.find((period) => period.status === "open") || null;
  const paymentResult = await db.prepare(`SELECT
    p.id, p.amount_minor, p.currency, p.status, p.method, p.received_at, p.provider_payment_id,
    bp.starts_at AS period_starts_at, bp.ends_at AS period_ends_at
    FROM payments p
    JOIN billing_periods bp ON bp.id = p.billing_period_id
    WHERE bp.subscription_id = ? ${includeVoided ? "" : "AND p.status != 'void'"}
    ORDER BY COALESCE(p.received_at, p.created_at) DESC, p.created_at DESC LIMIT 50`).bind(subscription.id).all();
  const payments = (paymentResult.results || []).map(mapPayment);
  const lastPayment = payments.find((payment) => payment.status === "confirmed") || null;
  return {
    subscription: {
      id: subscription.id,
      tierId: subscription.tier_id,
      tier: subscription.tier_name,
      accessStatus: subscription.access_status,
      startsAt: subscription.starts_at == null ? null : Number(subscription.starts_at),
      endsAt: subscription.ends_at == null ? null : Number(subscription.ends_at),
      monthlyPriceMinor: Number(subscription.monthly_price_minor),
      currency: subscription.currency
    },
    currentPeriod,
    lastPayment,
    payments
  };
}
async function authenticated(request, env2, admin = false) {
  ensureHttps(request);
  if (!env2.PORTAL_DB) throw new AuthError(503, "Account services are not configured yet. Please try again later.");
  const current = await sessionUser(env2.PORTAL_DB, request);
  if (!current) throw new AuthError(401, "Please sign in to continue.");
  if (admin && !isAdminEmail(current.email)) throw new AuthError(403, "Administrator access is required.");
  return current;
}
async function targetUser(db, userId) {
  const row = await db.prepare("SELECT id, email, display_name, account_status FROM users WHERE id = ?").bind(identifier(userId)).first();
  if (!row) throw new AuthError(404, "That user account could not be found.");
  return { id: row.id, email: row.email, displayName: row.display_name, accountStatus: row.account_status };
}
async function adminDetail(db, userId, now = Date.now()) {
  const account = await targetUser(db, userId);
  const tiersResult = await db.prepare(`SELECT id, name, monthly_price_minor, currency
    FROM subscription_tiers WHERE enabled = 1 ORDER BY sort_order, name`).all();
  return {
    account,
    tiers: (tiersResult.results || []).map((tier) => ({
      id: tier.id,
      name: tier.name,
      monthlyPriceMinor: Number(tier.monthly_price_minor),
      currency: tier.currency
    })),
    billing: await billingForUser(db, userId, { includeVoided: true, now })
  };
}
async function savePlan(db, actor, body, now) {
  const userId = identifier(body.userId);
  await targetUser(db, userId);
  const tierId = identifier(body.tierId, "plan");
  const tier = await db.prepare(`SELECT id, name, monthly_price_minor, currency
    FROM subscription_tiers WHERE id = ? AND enabled = 1`).bind(tierId).first();
  if (!tier) throw new AuthError(400, "Select an available plan.");
  const accessStatus = typeof body.accessStatus === "string" ? body.accessStatus : "";
  if (!ACCESS_STATUSES.has(accessStatus)) throw new AuthError(400, "Select a valid access status.");
  const startsAt = dateTimestamp(body.startsOn, "plan start date");
  const endsAt = dateTimestamp(body.nextDueOn, "next payment due date");
  if (endsAt <= startsAt) throw new AuthError(400, "The next payment date must be after the plan start date.");
  const existing = await db.prepare("SELECT id FROM subscriptions WHERE user_id = ?").bind(userId).first();
  const subscriptionId = existing?.id || crypto.randomUUID();
  const periodId = crypto.randomUUID();
  const reference = `manual:${subscriptionId}:${startsAt}`;
  const details = JSON.stringify({
    tierId,
    tier: tier.name,
    accessStatus,
    startsAt,
    endsAt,
    amountDueMinor: Number(tier.monthly_price_minor),
    currency: tier.currency
  });
  await db.batch([
    db.prepare(`INSERT INTO subscriptions
      (id, user_id, tier_id, access_status, starts_at, ends_at, provider, version, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, 'manual', 1, ?, ?)
      ON CONFLICT(user_id) DO UPDATE SET tier_id = excluded.tier_id, access_status = excluded.access_status,
        starts_at = excluded.starts_at, ends_at = excluded.ends_at, version = subscriptions.version + 1,
        updated_at = excluded.updated_at`).bind(subscriptionId, userId, tierId, accessStatus, startsAt, endsAt, now, now),
    db.prepare(`INSERT INTO billing_periods
      (id, subscription_id, tier_id, starts_at, ends_at, amount_due_minor, currency, status, reference, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'open', ?, ?)
      ON CONFLICT(reference) DO UPDATE SET tier_id = excluded.tier_id, ends_at = excluded.ends_at,
        amount_due_minor = excluded.amount_due_minor, currency = excluded.currency, status = 'open'`).bind(periodId, subscriptionId, tierId, startsAt, endsAt, Number(tier.monthly_price_minor), tier.currency, reference, now),
    db.prepare(`INSERT INTO audit_events(id, actor_id, subject_user_id, action, details_json, created_at)
      VALUES (?, ?, ?, 'billing.plan_updated', ?, ?)`).bind(crypto.randomUUID(), actor.id, userId, details, now)
  ]);
  return adminDetail(db, userId, now);
}
async function recordPayment(db, actor, body, now) {
  const userId = identifier(body.userId);
  await targetUser(db, userId);
  const amountMinor = body.amountMinor;
  if (!Number.isSafeInteger(amountMinor) || amountMinor < 1 || amountMinor > 1e8) {
    throw new AuthError(400, "Enter a payment amount between \xA30.01 and \xA31,000,000.");
  }
  const method = typeof body.method === "string" ? body.method : "";
  if (!PAYMENT_METHODS.has(method)) throw new AuthError(400, "Select a valid payment method.");
  const receivedAt = dateTimestamp(body.receivedOn, "payment date");
  const today = new Date(now);
  const todayStart = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
  if (receivedAt > todayStart) throw new AuthError(400, "The payment date cannot be in the future.");
  const reference = typeof body.reference === "string" ? body.reference.trim() : "";
  if (reference.length > 80 || /[\x00-\x1f\x7f]/.test(reference)) {
    throw new AuthError(400, "Keep the payment reference under 80 characters.");
  }
  if (reference && await db.prepare("SELECT id FROM payments WHERE provider = 'manual' AND provider_payment_id = ?").bind(reference).first()) throw new AuthError(409, "That payment reference has already been used.");
  const period = await db.prepare(`SELECT bp.id, bp.currency
    FROM subscriptions s JOIN billing_periods bp ON bp.subscription_id = s.id
    WHERE s.user_id = ? AND bp.status = 'open' AND bp.starts_at = s.starts_at AND bp.ends_at = s.ends_at
    ORDER BY bp.starts_at DESC LIMIT 1`).bind(userId).first();
  if (!period) throw new AuthError(409, "Assign a plan and billing dates before recording a payment.");
  const paymentId = crypto.randomUUID();
  const details = JSON.stringify({
    paymentId,
    amountMinor,
    currency: period.currency,
    method,
    receivedAt,
    ...reference ? { reference } : {}
  });
  await db.batch([
    db.prepare(`INSERT INTO payments
      (id, billing_period_id, amount_minor, currency, status, method, received_at, confirmed_at,
       recorded_by, provider, provider_payment_id, idempotency_key, created_at)
      VALUES (?, ?, ?, ?, 'confirmed', ?, ?, ?, ?, 'manual', ?, ?, ?)`).bind(
      paymentId,
      period.id,
      amountMinor,
      period.currency,
      method,
      receivedAt,
      now,
      actor.id,
      reference || null,
      `manual:${paymentId}`,
      now
    ),
    db.prepare(`INSERT INTO audit_events(id, actor_id, subject_user_id, action, details_json, created_at)
      VALUES (?, ?, ?, 'billing.payment_recorded', ?, ?)`).bind(crypto.randomUUID(), actor.id, userId, details, now)
  ]);
  return adminDetail(db, userId, now);
}
async function voidPayment(db, actor, body, now) {
  const userId = identifier(body.userId);
  const paymentId = identifier(body.paymentId, "payment");
  await targetUser(db, userId);
  const payment = await db.prepare(`SELECT p.id FROM payments p
    JOIN billing_periods bp ON bp.id = p.billing_period_id
    JOIN subscriptions s ON s.id = bp.subscription_id
    WHERE p.id = ? AND s.user_id = ? AND p.status != 'void'`).bind(paymentId, userId).first();
  if (!payment) throw new AuthError(404, "That payment could not be found or is already void.");
  await db.batch([
    db.prepare("UPDATE payments SET status = 'void' WHERE id = ? AND status != 'void'").bind(paymentId),
    db.prepare(`INSERT INTO audit_events(id, actor_id, subject_user_id, action, details_json, created_at)
      VALUES (?, ?, ?, 'billing.payment_voided', ?, ?)`).bind(crypto.randomUUID(), actor.id, userId, JSON.stringify({ paymentId }), now)
  ]);
  return adminDetail(db, userId, now);
}
function errorResponse(error3) {
  return reply(
    { message: error3 instanceof AuthError ? error3.message : "Billing services are temporarily unavailable. Please try again later." },
    error3 instanceof AuthError ? error3.status : 503
  );
}
async function billingResponse(request, env2) {
  try {
    if (request.method !== "GET") return reply({ message: "Method not allowed." }, 405, { Allow: "GET" });
    const current = await authenticated(request, env2);
    return reply({ billing: await billingForUser(env2.PORTAL_DB, current.id) });
  } catch (error3) {
    return errorResponse(error3);
  }
}
async function adminBillingResponse(request, env2) {
  try {
    const url = ensureHttps(request);
    if (!["GET", "POST"].includes(request.method)) return reply({ message: "Method not allowed." }, 405, { Allow: "GET, POST" });
    const current = await authenticated(request, env2, true);
    const now = Date.now();
    if (request.method === "GET") return reply(await adminDetail(env2.PORTAL_DB, url.searchParams.get("userId"), now));
    const body = await readBody(request);
    if (body.action === "save_plan") return reply(await savePlan(env2.PORTAL_DB, current, body, now));
    if (body.action === "record_payment") return reply(await recordPayment(env2.PORTAL_DB, current, body, now));
    if (body.action === "void_payment") return reply(await voidPayment(env2.PORTAL_DB, current, body, now));
    throw new AuthError(400, "Select a valid billing action.");
  } catch (error3) {
    return errorResponse(error3);
  }
}
var DAY_MS, ACCESS_STATUSES, PAYMENT_METHODS;
var init_billing = __esm({
  "../shared/portal/billing.js"() {
    init_functionsRoutes_0_9741670341706992();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    init_auth();
    DAY_MS = 864e5;
    ACCESS_STATUSES = /* @__PURE__ */ new Set(["pending", "enabled", "suspended", "cancelled"]);
    PAYMENT_METHODS = /* @__PURE__ */ new Set(["bank_transfer", "cash", "card", "paypal", "other"]);
    __name(ensureHttps, "ensureHttps");
    __name(identifier, "identifier");
    __name(dateTimestamp, "dateTimestamp");
    __name(paymentState, "paymentState");
    __name(mapPeriod, "mapPeriod");
    __name(mapPayment, "mapPayment");
    __name(billingForUser, "billingForUser");
    __name(authenticated, "authenticated");
    __name(targetUser, "targetUser");
    __name(adminDetail, "adminDetail");
    __name(savePlan, "savePlan");
    __name(recordPayment, "recordPayment");
    __name(voidPayment, "voidPayment");
    __name(errorResponse, "errorResponse");
    __name(billingResponse, "billingResponse");
    __name(adminBillingResponse, "adminBillingResponse");
  }
});

// api/portal/admin/billing.js
async function onRequest({ request, env: env2 }) {
  return adminBillingResponse(request, env2);
}
var init_billing2 = __esm({
  "api/portal/admin/billing.js"() {
    init_functionsRoutes_0_9741670341706992();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    init_billing();
    __name(onRequest, "onRequest");
  }
});

// ../shared/portal/admin.js
function adminUser(row, now) {
  const signInMethods = [];
  if (row.has_password) signInMethods.push("Email");
  if (row.plex_username) signInMethods.push("Plex");
  return {
    id: row.id,
    displayName: row.display_name,
    email: row.email,
    isAdmin: isAdminEmail(row.email),
    accountStatus: row.account_status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    signInMethods,
    ...row.plex_username ? { plexUsername: row.plex_username } : {},
    plexAvatarUrl: `/api/portal/avatar?userId=${encodeURIComponent(row.id)}`,
    subscription: row.tier_name ? {
      tier: row.tier_name,
      status: row.subscription_status,
      startsAt: row.starts_at,
      endsAt: row.ends_at
    } : null,
    billing: row.billing_period_id ? (() => {
      const amountDueMinor = Number(row.amount_due_minor);
      const confirmedMinor = Number(row.confirmed_minor || 0);
      const period = {
        status: "open",
        endsAt: Number(row.billing_ends_at),
        outstandingMinor: Math.max(0, amountDueMinor - confirmedMinor),
        confirmedMinor,
        pendingMinor: Number(row.pending_minor || 0)
      };
      return {
        status: paymentState(period, now),
        nextDueAt: period.endsAt,
        amountDueMinor,
        outstandingMinor: period.outstandingMinor,
        currency: row.billing_currency
      };
    })() : null
  };
}
async function adminUsersResponse(request, env2) {
  try {
    const url = new URL(request.url);
    if (url.protocol !== "https:" && !["localhost", "127.0.0.1", "[::1]"].includes(url.hostname)) {
      throw new AuthError(400, "Account access requires HTTPS.");
    }
    if (request.method !== "GET") return reply({ message: "Method not allowed." }, 405, { Allow: "GET" });
    if (!env2.PORTAL_DB) throw new AuthError(503, "Account services are not configured yet. Please try again later.");
    const current = await sessionUser(env2.PORTAL_DB, request);
    if (!current) throw new AuthError(401, "Please sign in to continue.");
    if (!isAdminEmail(current.email)) throw new AuthError(403, "Administrator access is required.");
    const avatarSelect = await plexAvatarColumnAvailable(env2.PORTAL_DB) ? "p.avatar_url AS plex_avatar_url" : "NULL AS plex_avatar_url";
    const result = await env2.PORTAL_DB.prepare(`SELECT
      u.id, u.email, u.display_name, u.account_status, u.created_at, u.updated_at,
      CASE WHEN c.user_id IS NULL THEN 0 ELSE 1 END AS has_password,
      p.username AS plex_username, ${avatarSelect},
      s.access_status AS subscription_status, s.starts_at, s.ends_at,
      t.name AS tier_name,
      bp.id AS billing_period_id, bp.ends_at AS billing_ends_at,
      bp.amount_due_minor, bp.currency AS billing_currency,
      COALESCE(pt.confirmed_minor, 0) AS confirmed_minor,
      COALESCE(pt.pending_minor, 0) AS pending_minor
      FROM users u
      LEFT JOIN password_credentials c ON c.user_id = u.id
      LEFT JOIN plex_identities p ON p.user_id = u.id
      LEFT JOIN subscriptions s ON s.user_id = u.id
      LEFT JOIN subscription_tiers t ON t.id = s.tier_id
      LEFT JOIN billing_periods bp ON bp.subscription_id = s.id AND bp.status = 'open'
        AND bp.starts_at = s.starts_at AND bp.ends_at = s.ends_at
      LEFT JOIN (
        SELECT billing_period_id,
          SUM(CASE WHEN status = 'confirmed' THEN amount_minor ELSE 0 END) AS confirmed_minor,
          SUM(CASE WHEN status = 'pending' THEN amount_minor ELSE 0 END) AS pending_minor
        FROM payments GROUP BY billing_period_id
      ) pt ON pt.billing_period_id = bp.id
      ORDER BY u.created_at DESC, u.email ASC`).all();
    const now = Date.now();
    const users = (result.results || []).map((row) => adminUser(row, now));
    return reply({
      users,
      summary: {
        total: users.length,
        enabled: users.filter((user) => user.accountStatus === "enabled").length,
        disabled: users.filter((user) => user.accountStatus === "disabled").length,
        subscribed: users.filter((user) => user.subscription).length,
        overdue: users.filter((user) => user.billing?.status === "overdue").length
      }
    });
  } catch (error3) {
    return reply(
      { message: error3 instanceof AuthError ? error3.message : "Account services are temporarily unavailable. Please try again later." },
      error3 instanceof AuthError ? error3.status : 503
    );
  }
}
var init_admin = __esm({
  "../shared/portal/admin.js"() {
    init_functionsRoutes_0_9741670341706992();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    init_auth();
    init_billing();
    __name(adminUser, "adminUser");
    __name(adminUsersResponse, "adminUsersResponse");
  }
});

// api/portal/admin/users.js
async function onRequest2({ request, env: env2 }) {
  return adminUsersResponse(request, env2);
}
var init_users = __esm({
  "api/portal/admin/users.js"() {
    init_functionsRoutes_0_9741670341706992();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    init_admin();
    __name(onRequest2, "onRequest");
  }
});

// api/portal/auth/[action].js
async function onRequest3({ request, env: env2, params }) {
  return authResponse(request, env2, params.action);
}
var init_action = __esm({
  "api/portal/auth/[action].js"() {
    init_functionsRoutes_0_9741670341706992();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    init_auth();
    __name(onRequest3, "onRequest");
  }
});

// ../shared/portal/plex-auth.js
function stateName(request) {
  return new URL(request.url).protocol === "https:" ? "__Host-plexpoint_plex" : "plexpoint_local_plex";
}
function stateCookie(request, state, seconds = MAX_AGE) {
  return `${stateName(request)}=${state}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${seconds}${new URL(request.url).protocol === "https:" ? "; Secure" : ""}`;
}
function readState(request) {
  const prefix = `${stateName(request)}=`;
  const values = (request.headers.get("Cookie") || "").split(";").map((part) => part.trim()).filter((part) => part.startsWith(prefix));
  const value = values.length === 1 ? values[0].slice(prefix.length) : "";
  return /^[a-f0-9]{64}$/.test(value) ? value : null;
}
function expired() {
  return new AuthError(410, "This Plex sign-in has expired or was cancelled. Please start again.");
}
async function plexRequest(fetcher, path, clientId, { method = "GET", token, body } = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8e3);
  try {
    const response = await fetcher(`https://plex.tv/api/v2/${path}`, {
      // Workers does not implement redirect:"error". Manual mode preserves the
      // no-redirect boundary and lets the status check below reject every 3xx.
      method,
      redirect: "manual",
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        "X-Plex-Product": "PlexPoint",
        "X-Plex-Version": "1.0",
        "X-Plex-Client-Identifier": clientId,
        ...token ? { "X-Plex-Token": token } : {},
        ...body ? { "Content-Type": "application/x-www-form-urlencoded" } : {}
      },
      ...body ? { body } : {}
    });
    if (response.status === 404 || response.status === 410) throw expired();
    if (!response.ok) throw new AuthError(502, "Plex could not complete sign-in. Please try again shortly.");
    return await response.json();
  } catch (error3) {
    if (error3 instanceof AuthError) throw error3;
    console.error(JSON.stringify({
      event: "plex_auth_upstream_error",
      errorType: error3 instanceof Error ? error3.name : typeof error3,
      causeCode: typeof error3?.cause?.code === "string" ? error3.cause.code : void 0
    }));
    throw new AuthError(502, "Plex is not responding. Please try again shortly.");
  } finally {
    clearTimeout(timeout);
  }
}
async function start(request, db, fetcher) {
  const now = Date.now();
  await rateLimit(db, request, "plex-start", null, now);
  const current = await sessionUser(db, request, now);
  const clientId = crypto.randomUUID();
  const pin = await plexRequest(fetcher, "pins", clientId, { method: "POST", body: "strong=true" });
  if (!Number.isSafeInteger(pin.id) || pin.id < 1 || typeof pin.code !== "string" || !/^[a-zA-Z0-9_-]{4,128}$/.test(pin.code) || !Number.isFinite(pin.expiresIn) || pin.expiresIn <= 0) {
    throw new AuthError(502, "Plex returned an invalid sign-in request. Please try again.");
  }
  const seconds = Math.max(1, Math.min(MAX_AGE, Math.floor(pin.expiresIn)));
  const expiresAt = now + seconds * 1e3;
  const state = randomHex(32);
  const previous = readState(request);
  await db.batch([
    db.prepare("DELETE FROM plex_login_attempts WHERE expires_at <= ? OR state_hash = ?").bind(now, previous ? await digest(previous) : ""),
    db.prepare(`INSERT INTO plex_login_attempts(state_hash, pin_id, pin_code, client_id, user_id, session_hash, expires_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)`).bind(
      await digest(state),
      pin.id,
      pin.code,
      clientId,
      current?.id || null,
      current ? await digest(readToken(request)) : null,
      expiresAt
    )
  ]);
  const forward = new URL("/account/?plex=return#account", request.url);
  const query = new URLSearchParams({ clientID: clientId, code: pin.code, "context[device][product]": "PlexPoint", forwardUrl: forward.href });
  return reply(
    { authorizationUrl: `https://app.plex.tv/auth#?${query}`, expiresAt },
    200,
    { "Set-Cookie": stateCookie(request, state, seconds) }
  );
}
function profileIdentity(profile3) {
  const id = String(profile3.id ?? "");
  const username = typeof profile3.username === "string" ? profile3.username.trim() : "";
  const email = typeof profile3.email === "string" ? profile3.email.trim().toLowerCase() : "";
  if (!/^[1-9][0-9]{0,19}$/.test(id) || !username || username.length > 100 || /[\x00-\x1f\x7f]/.test(username)) {
    throw new AuthError(502, "Plex did not return a valid account identity.");
  }
  let avatarUrl = "";
  if (typeof profile3.thumb === "string" && profile3.thumb.length <= 2048) {
    try {
      const candidate = new URL(profile3.thumb);
      if (candidate.protocol === "https:" && !candidate.username && !candidate.password) avatarUrl = candidate.href;
    } catch {
    }
  }
  return { id, username, email, avatarUrl };
}
async function complete(request, db, fetcher) {
  const state = readState(request);
  if (!state) throw expired();
  const stateHash = await digest(state);
  const now = Date.now();
  const attempt = await db.prepare("SELECT * FROM plex_login_attempts WHERE state_hash = ? AND expires_at > ?").bind(stateHash, now).first();
  if (!attempt) throw expired();
  const current = await sessionUser(db, request, now);
  if (attempt.user_id ? !current || current.id !== attempt.user_id || await digest(readToken(request)) !== attempt.session_hash : Boolean(current)) {
    throw new AuthError(409, "Your portal session changed during Plex sign-in. Please start again.");
  }
  const poll = await db.prepare("UPDATE plex_login_attempts SET last_poll_at = ? WHERE state_hash = ? AND last_poll_at <= ? RETURNING state_hash").bind(now, stateHash, now - 2e3).first();
  if (!poll) return reply({ pending: true }, 202, { "Retry-After": "2" });
  const pin = await plexRequest(fetcher, `pins/${attempt.pin_id}?code=${encodeURIComponent(attempt.pin_code)}`, attempt.client_id);
  if (pin.id !== attempt.pin_id || pin.code !== attempt.pin_code) throw new AuthError(502, "Plex returned a different sign-in request. Please start again.");
  if (!pin.authToken) return reply({ pending: true }, 202, { "Retry-After": "2" });
  if (typeof pin.authToken !== "string" || pin.authToken.length > 2048) throw new AuthError(502, "Plex returned an invalid authorization.");
  const profile3 = profileIdentity(await plexRequest(fetcher, "user", attempt.client_id, { token: pin.authToken }));
  const linked = await db.prepare(`SELECT u.id, u.email, u.display_name, u.created_at, u.account_status
    FROM plex_identities p JOIN users u ON u.id = p.user_id WHERE p.plex_id = ?`).bind(profile3.id).first();
  if (linked?.account_status === "disabled") throw new AuthError(403, "This portal account is disabled. Please contact support.");
  if (current && linked && current.id !== linked.id) throw new AuthError(409, "That Plex account is already connected to another portal account.");
  const existingIdentity = current ? await db.prepare("SELECT plex_id FROM plex_identities WHERE user_id = ?").bind(current.id).first() : null;
  if (existingIdentity && existingIdentity.plex_id !== profile3.id) throw new AuthError(409, "Your portal account already has a different Plex account connected.");
  if (!current && !linked) {
    if (profile3.email.length > 254 || !/^[^\s@\x00-\x1f\x7f]+@[^\s@\x00-\x1f\x7f]+\.[^\s@\x00-\x1f\x7f]+$/.test(profile3.email)) {
      throw new AuthError(400, "Add an email address to your Plex account before signing in here.");
    }
    if (await db.prepare("SELECT id FROM users WHERE email = ?").bind(profile3.email).first()) {
      throw new AuthError(409, "A portal account already uses this email. Sign in with your portal password, then choose Connect Plex.");
    }
  }
  const consumed = await db.prepare("DELETE FROM plex_login_attempts WHERE state_hash = ? AND expires_at > ? RETURNING state_hash").bind(stateHash, Date.now()).first();
  if (!consumed) throw expired();
  const row = current || linked || { id: crypto.randomUUID(), email: profile3.email, display_name: profile3.username, created_at: now };
  const session = await sessionStatements(db, request, row.id, now);
  const avatarSupported = await plexAvatarColumnAvailable(db);
  const statements = [];
  if (!current && !linked) statements.push(db.prepare("INSERT INTO users(id, email, display_name, role, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)").bind(row.id, row.email, row.display_name, isAdminEmail(row.email) ? "admin" : "user", now, now));
  if (!linked) statements.push(avatarSupported ? db.prepare("INSERT INTO plex_identities(plex_id, user_id, username, linked_at, avatar_url) VALUES (?, ?, ?, ?, ?)").bind(profile3.id, row.id, profile3.username, now, profile3.avatarUrl || null) : db.prepare("INSERT INTO plex_identities(plex_id, user_id, username, linked_at) VALUES (?, ?, ?, ?)").bind(profile3.id, row.id, profile3.username, now));
  else statements.push(avatarSupported ? db.prepare("UPDATE plex_identities SET username = ?, avatar_url = ? WHERE plex_id = ?").bind(profile3.username, profile3.avatarUrl || null, profile3.id) : db.prepare("UPDATE plex_identities SET username = ? WHERE plex_id = ?").bind(profile3.username, profile3.id));
  try {
    await db.batch([...statements, ...session.statements]);
  } catch {
    throw new AuthError(409, "The account could not be connected. Please start sign-in again or contact support.");
  }
  const response = reply(
    { user: publicUser({ ...row, plex_username: profile3.username, plex_avatar_url: profile3.avatarUrl }, true) },
    200,
    { "Set-Cookie": sessionCookie(request, session.token) }
  );
  response.headers.append("Set-Cookie", stateCookie(request, "", 0));
  return response;
}
async function plexAuthResponse(request, env2, action, fetcher = fetch) {
  try {
    const url = new URL(request.url);
    if (url.protocol !== "https:" && !["localhost", "127.0.0.1", "[::1]"].includes(url.hostname)) throw new AuthError(400, "Account access requires HTTPS.");
    if (!["start", "complete", "cancel"].includes(action)) throw new AuthError(404, "Not found.");
    if (request.method !== "POST") return reply({ message: "Method not allowed." }, 405, { Allow: "POST" });
    await readBody(request);
    if (!env2.PORTAL_DB) throw new AuthError(503, "Account services are not configured yet. Please try again later.");
    if (action === "start") return await start(request, env2.PORTAL_DB, fetcher);
    if (action === "complete") return await complete(request, env2.PORTAL_DB, fetcher);
    const state = readState(request);
    if (state) await env2.PORTAL_DB.prepare("DELETE FROM plex_login_attempts WHERE state_hash = ?").bind(await digest(state)).run();
    return reply({ cancelled: true }, 200, { "Set-Cookie": stateCookie(request, "", 0) });
  } catch (error3) {
    return reply(
      { message: error3 instanceof AuthError ? error3.message : "Plex sign-in is temporarily unavailable. Please try again later." },
      error3 instanceof AuthError ? error3.status : 503,
      error3.status === 429 ? { "Retry-After": "900" } : {}
    );
  }
}
var MAX_AGE;
var init_plex_auth = __esm({
  "../shared/portal/plex-auth.js"() {
    init_functionsRoutes_0_9741670341706992();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    init_auth();
    MAX_AGE = 600;
    __name(stateName, "stateName");
    __name(stateCookie, "stateCookie");
    __name(readState, "readState");
    __name(expired, "expired");
    __name(plexRequest, "plexRequest");
    __name(start, "start");
    __name(profileIdentity, "profileIdentity");
    __name(complete, "complete");
    __name(plexAuthResponse, "plexAuthResponse");
  }
});

// api/portal/plex/[action].js
async function onRequest4({ request, env: env2, params }) {
  return plexAuthResponse(request, env2, params.action);
}
var init_action2 = __esm({
  "api/portal/plex/[action].js"() {
    init_functionsRoutes_0_9741670341706992();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    init_plex_auth();
    __name(onRequest4, "onRequest");
  }
});

// ../node_modules/fast-xml-parser/src/util.js
var require_util = __commonJS({
  "../node_modules/fast-xml-parser/src/util.js"(exports) {
    "use strict";
    init_functionsRoutes_0_9741670341706992();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    var nameStartChar = ":A-Za-z_\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD";
    var nameChar = nameStartChar + "\\-.\\d\\u00B7\\u0300-\\u036F\\u203F-\\u2040";
    var nameRegexp = "[" + nameStartChar + "][" + nameChar + "]*";
    var regexName = new RegExp("^" + nameRegexp + "$");
    var getAllMatches = /* @__PURE__ */ __name(function(string, regex) {
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
    var isName = /* @__PURE__ */ __name(function(string) {
      const match2 = regexName.exec(string);
      return !(match2 === null || typeof match2 === "undefined");
    }, "isName");
    exports.isExist = function(v) {
      return typeof v !== "undefined";
    };
    exports.isEmptyObject = function(obj) {
      return Object.keys(obj).length === 0;
    };
    exports.merge = function(target, a, arrayMode) {
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
    exports.getValue = function(v) {
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
      "__lookupSetter__"
    ];
    var criticalProperties = ["__proto__", "constructor", "prototype"];
    exports.isName = isName;
    exports.getAllMatches = getAllMatches;
    exports.nameRegexp = nameRegexp;
    exports.DANGEROUS_PROPERTY_NAMES = DANGEROUS_PROPERTY_NAMES;
    exports.criticalProperties = criticalProperties;
  }
});

// ../node_modules/fast-xml-parser/src/validator.js
var require_validator = __commonJS({
  "../node_modules/fast-xml-parser/src/validator.js"(exports) {
    "use strict";
    init_functionsRoutes_0_9741670341706992();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    var util = require_util();
    var defaultOptions = {
      allowBooleanAttributes: false,
      //A tag can have attributes without any value
      unpairedTags: []
    };
    exports.validate = function(xmlData, options) {
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
            for (; i < xmlData.length && xmlData[i] !== ">" && xmlData[i] !== " " && xmlData[i] !== "	" && xmlData[i] !== "\n" && xmlData[i] !== "\r"; i++) {
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
              return getErrorObject("InvalidTag", msg, getLineNumberForPosition(xmlData, i));
            }
            const result = readAttributeStr(xmlData, i);
            if (result === false) {
              return getErrorObject("InvalidAttr", "Attributes for '" + tagName + "' have open quote.", getLineNumberForPosition(xmlData, i));
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
                return getErrorObject(isValid.err.code, isValid.err.msg, getLineNumberForPosition(xmlData, attrStrStart + isValid.err.line));
              }
            } else if (closingTag) {
              if (!result.tagClosed) {
                return getErrorObject("InvalidTag", "Closing tag '" + tagName + "' doesn't have proper closing.", getLineNumberForPosition(xmlData, i));
              } else if (attrStr.trim().length > 0) {
                return getErrorObject("InvalidTag", "Closing tag '" + tagName + "' can't have attributes or invalid starting.", getLineNumberForPosition(xmlData, tagStartPos));
              } else if (tags.length === 0) {
                return getErrorObject("InvalidTag", "Closing tag '" + tagName + "' has not been opened.", getLineNumberForPosition(xmlData, tagStartPos));
              } else {
                const otg = tags.pop();
                if (tagName !== otg.tagName) {
                  let openPos = getLineNumberForPosition(xmlData, otg.tagStartPos);
                  return getErrorObject(
                    "InvalidTag",
                    "Expected closing tag '" + otg.tagName + "' (opened in line " + openPos.line + ", col " + openPos.col + ") instead of closing tag '" + tagName + "'.",
                    getLineNumberForPosition(xmlData, tagStartPos)
                  );
                }
                if (tags.length == 0) {
                  reachedRoot = true;
                }
              }
            } else {
              const isValid = validateAttributeString(attrStr, options);
              if (isValid !== true) {
                return getErrorObject(isValid.err.code, isValid.err.msg, getLineNumberForPosition(xmlData, i - attrStr.length + isValid.err.line));
              }
              if (reachedRoot === true) {
                return getErrorObject("InvalidXml", "Multiple possible root nodes found.", getLineNumberForPosition(xmlData, i));
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
                  return getErrorObject("InvalidChar", "char '&' is not expected.", getLineNumberForPosition(xmlData, i));
                i = afterAmp;
              } else {
                if (reachedRoot === true && !isWhiteSpace(xmlData[i])) {
                  return getErrorObject("InvalidXml", "Extra text at the end", getLineNumberForPosition(xmlData, i));
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
          return getErrorObject("InvalidChar", "char '" + xmlData[i] + "' is not expected.", getLineNumberForPosition(xmlData, i));
        }
      }
      if (!tagFound) {
        return getErrorObject("InvalidXml", "Start tag expected.", 1);
      } else if (tags.length == 1) {
        return getErrorObject("InvalidTag", "Unclosed tag '" + tags[0].tagName + "'.", getLineNumberForPosition(xmlData, tags[0].tagStartPos));
      } else if (tags.length > 0) {
        return getErrorObject("InvalidXml", "Invalid '" + JSON.stringify(tags.map((t) => t.tagName), null, 4).replace(/\r?\n/g, "") + "' found.", { line: 1, col: 1 });
      }
      return true;
    };
    function isWhiteSpace(char) {
      return char === " " || char === "	" || char === "\n" || char === "\r";
    }
    __name(isWhiteSpace, "isWhiteSpace");
    function readPI(xmlData, i) {
      const start2 = i;
      for (; i < xmlData.length; i++) {
        if (xmlData[i] == "?" || xmlData[i] == " ") {
          const tagname = xmlData.substr(start2, i - start2);
          if (i > 5 && tagname === "xml") {
            return getErrorObject("InvalidXml", "XML declaration allowed only at the start of the document.", getLineNumberForPosition(xmlData, i));
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
      if (xmlData.length > i + 5 && xmlData[i + 1] === "-" && xmlData[i + 2] === "-") {
        for (i += 3; i < xmlData.length; i++) {
          if (xmlData[i] === "-" && xmlData[i + 1] === "-" && xmlData[i + 2] === ">") {
            i += 2;
            break;
          }
        }
      } else if (xmlData.length > i + 8 && xmlData[i + 1] === "D" && xmlData[i + 2] === "O" && xmlData[i + 3] === "C" && xmlData[i + 4] === "T" && xmlData[i + 5] === "Y" && xmlData[i + 6] === "P" && xmlData[i + 7] === "E") {
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
      } else if (xmlData.length > i + 9 && xmlData[i + 1] === "[" && xmlData[i + 2] === "C" && xmlData[i + 3] === "D" && xmlData[i + 4] === "A" && xmlData[i + 5] === "T" && xmlData[i + 6] === "A" && xmlData[i + 7] === "[") {
        for (i += 8; i < xmlData.length; i++) {
          if (xmlData[i] === "]" && xmlData[i + 1] === "]" && xmlData[i + 2] === ">") {
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
        tagClosed
      };
    }
    __name(readAttributeStr, "readAttributeStr");
    var validAttrStrRegxp = new RegExp(`(\\s*)([^\\s=]+)(\\s*=)?(\\s*(['"])(([\\s\\S])*?)\\5)?`, "g");
    function validateAttributeString(attrStr, options) {
      const matches = util.getAllMatches(attrStr, validAttrStrRegxp);
      const attrNames = {};
      for (let i = 0; i < matches.length; i++) {
        if (matches[i][1].length === 0) {
          return getErrorObject("InvalidAttr", "Attribute '" + matches[i][2] + "' has no space in starting.", getPositionFromMatch(matches[i]));
        } else if (matches[i][3] !== void 0 && matches[i][4] === void 0) {
          return getErrorObject("InvalidAttr", "Attribute '" + matches[i][2] + "' is without value.", getPositionFromMatch(matches[i]));
        } else if (matches[i][3] === void 0 && !options.allowBooleanAttributes) {
          return getErrorObject("InvalidAttr", "boolean attribute '" + matches[i][2] + "' is not allowed.", getPositionFromMatch(matches[i]));
        }
        const attrName = matches[i][2];
        if (!validateAttrName(attrName)) {
          return getErrorObject("InvalidAttr", "Attribute '" + attrName + "' is an invalid name.", getPositionFromMatch(matches[i]));
        }
        if (!attrNames.hasOwnProperty(attrName)) {
          attrNames[attrName] = 1;
        } else {
          return getErrorObject("InvalidAttr", "Attribute '" + attrName + "' is repeated.", getPositionFromMatch(matches[i]));
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
        if (xmlData[i] === ";")
          return i;
        if (!xmlData[i].match(re))
          break;
      }
      return -1;
    }
    __name(validateNumberAmpersand, "validateNumberAmpersand");
    function validateAmpersand(xmlData, i) {
      i++;
      if (xmlData[i] === ";")
        return -1;
      if (xmlData[i] === "#") {
        i++;
        return validateNumberAmpersand(xmlData, i);
      }
      let count4 = 0;
      for (; i < xmlData.length; i++, count4++) {
        if (xmlData[i].match(/\w/) && count4 < 20)
          continue;
        if (xmlData[i] === ";")
          break;
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
          col: lineNumber.col
        }
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
        col: lines[lines.length - 1].length + 1
      };
    }
    __name(getLineNumberForPosition, "getLineNumberForPosition");
    function getPositionFromMatch(match2) {
      return match2.startIndex + match2[1].length;
    }
    __name(getPositionFromMatch, "getPositionFromMatch");
  }
});

// ../node_modules/fast-xml-parser/src/xmlparser/OptionsBuilder.js
var require_OptionsBuilder = __commonJS({
  "../node_modules/fast-xml-parser/src/xmlparser/OptionsBuilder.js"(exports) {
    init_functionsRoutes_0_9741670341706992();
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
        eNotation: true
      },
      tagValueProcessor: /* @__PURE__ */ __name(function(tagName, val) {
        return val;
      }, "tagValueProcessor"),
      attributeValueProcessor: /* @__PURE__ */ __name(function(attrName, val) {
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
      updateTag: /* @__PURE__ */ __name(function(tagName, jPath, attrs) {
        return tagName;
      }, "updateTag"),
      // skipEmptyListItem: false
      captureMetaData: false,
      maxNestedTags: 100,
      strictReservedNames: true,
      onDangerousProperty: defaultOnDangerousProperty
    };
    function validatePropertyName(propertyName, optionName) {
      if (typeof propertyName !== "string") {
        return;
      }
      const normalized3 = propertyName.toLowerCase();
      if (DANGEROUS_PROPERTY_NAMES.some((dangerous) => normalized3 === dangerous.toLowerCase())) {
        throw new Error(
          `[SECURITY] Invalid ${optionName}: "${propertyName}" is a reserved JavaScript keyword that could cause prototype pollution`
        );
      }
      if (criticalProperties.some((dangerous) => normalized3 === dangerous.toLowerCase())) {
        throw new Error(
          `[SECURITY] Invalid ${optionName}: "${propertyName}" is a reserved JavaScript keyword that could cause prototype pollution`
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
          tagFilter: null
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
          tagFilter: value.tagFilter ?? null
        };
      }
      return normalizeProcessEntities(true);
    }
    __name(normalizeProcessEntities, "normalizeProcessEntities");
    var buildOptions = /* @__PURE__ */ __name(function(options) {
      const built = Object.assign({}, defaultOptions, options);
      const propertyNameOptions = [
        { value: built.attributeNamePrefix, name: "attributeNamePrefix" },
        { value: built.attributesGroupName, name: "attributesGroupName" },
        { value: built.textNodeName, name: "textNodeName" },
        { value: built.cdataPropName, name: "cdataPropName" },
        { value: built.commentPropName, name: "commentPropName" }
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
  }
});

// ../node_modules/fast-xml-parser/src/xmlparser/xmlNode.js
var require_xmlNode = __commonJS({
  "../node_modules/fast-xml-parser/src/xmlparser/xmlNode.js"(exports, module) {
    "use strict";
    init_functionsRoutes_0_9741670341706992();
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
  }
});

// ../node_modules/fast-xml-parser/src/xmlparser/DocTypeReader.js
var require_DocTypeReader = __commonJS({
  "../node_modules/fast-xml-parser/src/xmlparser/DocTypeReader.js"(exports, module) {
    init_functionsRoutes_0_9741670341706992();
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
        if (xmlData[i + 3] === "O" && xmlData[i + 4] === "C" && xmlData[i + 5] === "T" && xmlData[i + 6] === "Y" && xmlData[i + 7] === "P" && xmlData[i + 8] === "E") {
          i = i + 9;
          let angleBracketsCount = 1;
          let hasBody = false, comment = false;
          let exp = "";
          for (; i < xmlData.length; i++) {
            if (xmlData[i] === "<" && !comment) {
              if (hasBody && hasSeq(xmlData, "!ENTITY", i)) {
                i += 7;
                let entityName, val;
                [entityName, val, i] = this.readEntityExp(xmlData, i + 1, this.suppressValidationErr);
                if (val.indexOf("&") === -1) {
                  if (this.options.enabled !== false && this.options.maxEntityCount != null && entityCount >= this.options.maxEntityCount) {
                    throw new Error(
                      `Entity count (${entityCount + 1}) exceeds maximum allowed (${this.options.maxEntityCount})`
                    );
                  }
                  const escaped = entityName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
                  entities[entityName] = {
                    regx: RegExp(`&${escaped};`, "g"),
                    val
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
                const { index } = this.readNotationExp(xmlData, i + 1, this.suppressValidationErr);
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
        while (i < xmlData.length && !/\s/.test(xmlData[i]) && xmlData[i] !== '"' && xmlData[i] !== "'") {
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
        if (this.options.enabled !== false && this.options.maxEntitySize != null && entityValue.length > this.options.maxEntitySize) {
          throw new Error(
            `Entity "${entityName}" size (${entityValue.length}) exceeds maximum allowed size (${this.options.maxEntitySize})`
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
        if (!this.suppressValidationErr && identifierType !== "SYSTEM" && identifierType !== "PUBLIC") {
          throw new Error(`Expected SYSTEM or PUBLIC, found "${identifierType}"`);
        }
        i += identifierType.length;
        i = skipWhitespace(xmlData, i);
        let publicIdentifier = null;
        let systemIdentifier = null;
        if (identifierType === "PUBLIC") {
          [i, publicIdentifier] = this.readIdentifierVal(xmlData, i, "publicIdentifier");
          i = skipWhitespace(xmlData, i);
          if (xmlData[i] === '"' || xmlData[i] === "'") {
            [i, systemIdentifier] = this.readIdentifierVal(xmlData, i, "systemIdentifier");
          }
        } else if (identifierType === "SYSTEM") {
          [i, systemIdentifier] = this.readIdentifierVal(xmlData, i, "systemIdentifier");
          if (!this.suppressValidationErr && !systemIdentifier) {
            throw new Error("Missing mandatory system identifier for SYSTEM notation");
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
          index: i
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
            while (i < xmlData.length && xmlData[i] !== "|" && xmlData[i] !== ")") {
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
          const validTypes = ["CDATA", "ID", "IDREF", "IDREFS", "ENTITY", "ENTITIES", "NMTOKEN", "NMTOKENS"];
          if (!this.suppressValidationErr && !validTypes.includes(attributeType.toUpperCase())) {
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
          index: i
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
      if (util.isName(name))
        return name;
      else
        throw new Error(`Invalid entity name ${name}`);
    }
    __name(validateEntityName, "validateEntityName");
    module.exports = DocTypeReader;
  }
});

// ../node_modules/strnum/strnum.js
var require_strnum = __commonJS({
  "../node_modules/strnum/strnum.js"(exports, module) {
    init_functionsRoutes_0_9741670341706992();
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
      eNotation: true
      //skipLike: /regex/
    };
    function toNumber(str, options = {}) {
      options = Object.assign({}, consider, options);
      if (!str || typeof str !== "string") return str;
      let trimmedStr = str.trim();
      if (options.skipLike !== void 0 && options.skipLike.test(trimmedStr)) return str;
      else if (str === "0") return 0;
      else if (options.hex && hexRegex.test(trimmedStr)) {
        return parse_int(trimmedStr, 16);
      } else if (trimmedStr.search(/[eE]/) !== -1) {
        const notation = trimmedStr.match(/^([-\+])?(0*)([0-9]*(\.[0-9]*)?[eE][-\+]?[0-9]+)$/);
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
          if (!options.leadingZeros && leadingZeros.length > 0 && sign && trimmedStr[2] !== ".") return str;
          else if (!options.leadingZeros && leadingZeros.length > 0 && !sign && trimmedStr[1] !== ".") return str;
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
              return numTrimmedByZeros === numStr || sign + numTrimmedByZeros === numStr ? num : str;
            } else {
              return trimmedStr === numStr || trimmedStr === sign + numStr ? num : str;
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
        else if (numStr[numStr.length - 1] === ".") numStr = numStr.substr(0, numStr.length - 1);
        return numStr;
      }
      return numStr;
    }
    __name(trimZeros, "trimZeros");
    function parse_int(numStr, base) {
      if (parseInt) return parseInt(numStr, base);
      else if (Number.parseInt) return Number.parseInt(numStr, base);
      else if (window && window.parseInt) return window.parseInt(numStr, base);
      else throw new Error("parseInt, Number.parseInt, window.parseInt are not supported");
    }
    __name(parse_int, "parse_int");
    module.exports = toNumber;
  }
});

// ../node_modules/fast-xml-parser/src/ignoreAttributes.js
var require_ignoreAttributes = __commonJS({
  "../node_modules/fast-xml-parser/src/ignoreAttributes.js"(exports, module) {
    init_functionsRoutes_0_9741670341706992();
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
  }
});

// ../node_modules/fast-xml-parser/src/xmlparser/OrderedObjParser.js
var require_OrderedObjParser = __commonJS({
  "../node_modules/fast-xml-parser/src/xmlparser/OrderedObjParser.js"(exports, module) {
    "use strict";
    init_functionsRoutes_0_9741670341706992();
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
          "apos": { regex: /&(apos|#39|#x27);/g, val: "'" },
          "gt": { regex: /&(gt|#62|#x3E);/g, val: ">" },
          "lt": { regex: /&(lt|#60|#x3C);/g, val: "<" },
          "quot": { regex: /&(quot|#34|#x22);/g, val: '"' }
        };
        this.ampEntity = { regex: /&(amp|#38|#x26);/g, val: "&" };
        this.htmlEntities = {
          "space": { regex: /&(nbsp|#160);/g, val: " " },
          // "lt" : { regex: /&(lt|#60);/g, val: "<" },
          // "gt" : { regex: /&(gt|#62);/g, val: ">" },
          // "amp" : { regex: /&(amp|#38);/g, val: "&" },
          // "quot" : { regex: /&(quot|#34);/g, val: "\"" },
          // "apos" : { regex: /&(apos|#39);/g, val: "'" },
          "cent": { regex: /&(cent|#162);/g, val: "\xA2" },
          "pound": { regex: /&(pound|#163);/g, val: "\xA3" },
          "yen": { regex: /&(yen|#165);/g, val: "\xA5" },
          "euro": { regex: /&(euro|#8364);/g, val: "\u20AC" },
          "copyright": { regex: /&(copy|#169);/g, val: "\xA9" },
          "reg": { regex: /&(reg|#174);/g, val: "\xAE" },
          "inr": { regex: /&(inr|#8377);/g, val: "\u20B9" },
          "num_dec": { regex: /&#([0-9]{1,7});/g, val: /* @__PURE__ */ __name((_, str) => fromCodePoint(str, 10, "&#"), "val") },
          "num_hex": { regex: /&#x([0-9a-fA-F]{1,6});/g, val: /* @__PURE__ */ __name((_, str) => fromCodePoint(str, 16, "&#x"), "val") }
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
        this.ignoreAttributesFn = getIgnoreAttributesFn(this.options.ignoreAttributes);
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
          val: externalEntities[ent]
        };
      }
    }
    __name(addExternalEntities, "addExternalEntities");
    function parseTextData(val, tagName, jPath, dontTrim, hasAttributes, isLeafNode, escapeEntities) {
      if (val !== void 0) {
        if (this.options.trimValues && !dontTrim) {
          val = val.trim();
        }
        if (val.length > 0) {
          if (!escapeEntities) val = this.replaceEntitiesValue(val, tagName, jPath);
          const newval = this.options.tagValueProcessor(tagName, val, jPath, hasAttributes, isLeafNode);
          if (newval === null || newval === void 0) {
            return val;
          } else if (typeof newval !== typeof val || newval !== val) {
            return newval;
          } else if (this.options.trimValues) {
            return parseValue(val, this.options.parseTagValue, this.options.numberParseOptions);
          } else {
            const trimmedVal = val.trim();
            if (trimmedVal === val) {
              return parseValue(val, this.options.parseTagValue, this.options.numberParseOptions);
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
    var attrsRegx = new RegExp(`([^\\s=]+)\\s*(=\\s*(['"])([\\s\\S]*?)\\3)?`, "gm");
    function buildAttributesMap(attrStr, jPath, tagName) {
      if (this.options.ignoreAttributes !== true && typeof attrStr === "string") {
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
              const newVal = this.options.attributeValueProcessor(attrName, oldVal, jPath);
              if (newVal === null || newVal === void 0) {
                attrs[aName] = oldVal;
              } else if (typeof newVal !== typeof oldVal || newVal !== oldVal) {
                attrs[aName] = newVal;
              } else {
                attrs[aName] = parseValue(
                  oldVal,
                  this.options.parseAttributeValue,
                  this.options.numberParseOptions
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
    var parseXml = /* @__PURE__ */ __name(function(xmlData) {
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
            const closeIndex = findClosingIndex(xmlData, ">", i, "Closing Tag is not closed.");
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
              throw new Error(`Unpaired tag can not be used as closing tag: </${tagName}>`);
            }
            let propIndex = 0;
            if (lastTagName && this.options.unpairedTags.indexOf(lastTagName) !== -1) {
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
            if (this.options.ignoreDeclaration && tagData.tagName === "?xml" || this.options.ignorePiTags) {
            } else {
              const childNode = new xmlNode(tagData.tagName);
              childNode.add(this.options.textNodeName, "");
              if (tagData.tagName !== tagData.tagExp && tagData.attrExpPresent) {
                childNode[":@"] = this.buildAttributesMap(tagData.tagExp, jPath, tagData.tagName);
              }
              this.addChild(currentNode, childNode, jPath, i);
            }
            i = tagData.closeIndex + 1;
          } else if (xmlData.substr(i + 1, 3) === "!--") {
            const endIndex = findClosingIndex(xmlData, "-->", i + 4, "Comment is not closed.");
            if (this.options.commentPropName) {
              const comment = xmlData.substring(i + 4, endIndex - 2);
              textData = this.saveTextToParentTag(textData, currentNode, jPath);
              currentNode.add(this.options.commentPropName, [{ [this.options.textNodeName]: comment }]);
            }
            i = endIndex;
          } else if (xmlData.substr(i + 1, 2) === "!D") {
            const result = docTypeReader.readDocType(xmlData, i);
            this.docTypeEntities = result.entities;
            i = result.i;
          } else if (xmlData.substr(i + 1, 2) === "![") {
            const closeIndex = findClosingIndex(xmlData, "]]>", i, "CDATA is not closed.") - 2;
            const tagExp = xmlData.substring(i + 9, closeIndex);
            textData = this.saveTextToParentTag(textData, currentNode, jPath);
            let val = this.parseTextData(tagExp, currentNode.tagname, jPath, true, false, true, true);
            if (val == void 0) val = "";
            if (this.options.cdataPropName) {
              currentNode.add(this.options.cdataPropName, [{ [this.options.textNodeName]: tagExp }]);
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
            if (this.options.strictReservedNames && (tagName === this.options.commentPropName || tagName === this.options.cdataPropName || tagName === this.options.textNodeName || tagName === this.options.attributesGroupName)) {
              throw new Error(`Invalid tag name: ${tagName}`);
            }
            if (currentNode && textData) {
              if (currentNode.tagname !== "!xml") {
                textData = this.saveTextToParentTag(textData, currentNode, jPath, false);
              }
            }
            const lastTag = currentNode;
            if (lastTag && this.options.unpairedTags.indexOf(lastTag.tagname) !== -1) {
              currentNode = this.tagsNodeStack.pop();
              jPath = jPath.substring(0, jPath.lastIndexOf("."));
            }
            if (tagName !== xmlObj.tagname) {
              jPath += jPath ? "." + tagName : tagName;
            }
            const startIndex = i;
            if (this.isItStopNode(this.stopNodesExact, this.stopNodesWildcard, jPath, tagName)) {
              let tagContent = "";
              if (tagExp.length > 0 && tagExp.lastIndexOf("/") === tagExp.length - 1) {
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
                const result2 = this.readStopNodeData(xmlData, rawTagName, closeIndex + 1);
                if (!result2) throw new Error(`Unexpected end of ${rawTagName}`);
                i = result2.i;
                tagContent = result2.tagContent;
              }
              const childNode = new xmlNode(tagName);
              if (tagName !== tagExp && attrExpPresent) {
                childNode[":@"] = this.buildAttributesMap(tagExp, jPath, tagName);
              }
              if (tagContent) {
                tagContent = this.parseTextData(tagContent, tagName, jPath, true, attrExpPresent, true, true);
              }
              jPath = jPath.substr(0, jPath.lastIndexOf("."));
              childNode.add(this.options.textNodeName, tagContent);
              this.addChild(currentNode, childNode, jPath, startIndex);
            } else {
              if (tagExp.length > 0 && tagExp.lastIndexOf("/") === tagExp.length - 1) {
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
                  childNode[":@"] = this.buildAttributesMap(tagExp, jPath, tagName);
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
                  childNode[":@"] = this.buildAttributesMap(tagExp, jPath, tagName);
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
      const result = this.options.updateTag(childNode.tagname, jPath, childNode[":@"]);
      if (result === false) {
      } else if (typeof result === "string") {
        childNode.tagname = result;
        currentNode.addChild(childNode, startIndex);
      } else {
        currentNode.addChild(childNode, startIndex);
      }
    }
    __name(addChild, "addChild");
    var replaceEntitiesValue = /* @__PURE__ */ __name(function(val, tagName, jPath) {
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
          if (entityConfig.maxTotalExpansions && this.entityExpansionCount > entityConfig.maxTotalExpansions) {
            throw new Error(
              `Entity expansion limit exceeded: ${this.entityExpansionCount} > ${entityConfig.maxTotalExpansions}`
            );
          }
          const lengthBefore = val.length;
          val = val.replace(entity.regx, entity.val);
          if (entityConfig.maxExpandedLength) {
            this.currentExpandedLength += val.length - lengthBefore;
            if (this.currentExpandedLength > entityConfig.maxExpandedLength) {
              throw new Error(
                `Total expanded content size exceeded: ${this.currentExpandedLength} > ${entityConfig.maxExpandedLength}`
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
          if (entityConfig.maxTotalExpansions && this.entityExpansionCount > entityConfig.maxTotalExpansions) {
            throw new Error(
              `Entity expansion limit exceeded: ${this.entityExpansionCount} > ${entityConfig.maxTotalExpansions}`
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
            if (entityConfig.maxTotalExpansions && this.entityExpansionCount > entityConfig.maxTotalExpansions) {
              throw new Error(
                `Entity expansion limit exceeded: ${this.entityExpansionCount} > ${entityConfig.maxTotalExpansions}`
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
          isLeafNode
        );
        if (textData !== void 0 && textData !== "")
          parentNode.add(this.options.textNodeName, textData);
        textData = "";
      }
      return textData;
    }
    __name(saveTextToParentTag, "saveTextToParentTag");
    function isItStopNode(stopNodesExact, stopNodesWildcard, jPath, currentTagName) {
      if (stopNodesWildcard && stopNodesWildcard.has(currentTagName)) return true;
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
                index
              };
            }
          } else {
            return {
              data: tagExp,
              index
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
        rawTagName
      };
    }
    __name(readTagExp, "readTagExp");
    function readStopNodeData(xmlData, tagName, i) {
      const startIndex = i;
      let openTagCount = 1;
      for (; i < xmlData.length; i++) {
        if (xmlData[i] === "<") {
          if (xmlData[i + 1] === "/") {
            const closeIndex = findClosingIndex(xmlData, ">", i, `${tagName} is not closed`);
            let closeTagName = xmlData.substring(i + 2, closeIndex).trim();
            if (closeTagName === tagName) {
              openTagCount--;
              if (openTagCount === 0) {
                return {
                  tagContent: xmlData.substring(startIndex, i),
                  i: closeIndex
                };
              }
            }
            i = closeIndex;
          } else if (xmlData[i + 1] === "?") {
            const closeIndex = findClosingIndex(xmlData, "?>", i + 1, "StopNode is not closed.");
            i = closeIndex;
          } else if (xmlData.substr(i + 1, 3) === "!--") {
            const closeIndex = findClosingIndex(xmlData, "-->", i + 3, "StopNode is not closed.");
            i = closeIndex;
          } else if (xmlData.substr(i + 1, 2) === "![") {
            const closeIndex = findClosingIndex(xmlData, "]]>", i, "StopNode is not closed.") - 2;
            i = closeIndex;
          } else {
            const tagData = readTagExp(xmlData, i, ">");
            if (tagData) {
              const openTagName = tagData && tagData.tagName;
              if (openTagName === tagName && tagData.tagExp[tagData.tagExp.length - 1] !== "/") {
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
        throw new Error(`[SECURITY] Invalid name: "${name}" is a reserved JavaScript keyword that could cause prototype pollution`);
      } else if (util.DANGEROUS_PROPERTY_NAMES.includes(name)) {
        return options.onDangerousProperty(name);
      }
      return name;
    }
    __name(sanitizeName, "sanitizeName");
    module.exports = OrderedObjParser;
  }
});

// ../node_modules/fast-xml-parser/src/xmlparser/node2json.js
var require_node2json = __commonJS({
  "../node_modules/fast-xml-parser/src/xmlparser/node2json.js"(exports) {
    "use strict";
    init_functionsRoutes_0_9741670341706992();
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
          } else if (Object.keys(val).length === 1 && val[options.textNodeName] !== void 0 && !options.alwaysCreateTextNode) {
            val = val[options.textNodeName];
          } else if (Object.keys(val).length === 0) {
            if (options.alwaysCreateTextNode) val[options.textNodeName] = "";
            else val = "";
          }
          if (compressedObj[property] !== void 0 && compressedObj.hasOwnProperty(property)) {
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
      if (propCount === 1 && (obj[textNodeName] || typeof obj[textNodeName] === "boolean" || obj[textNodeName] === 0)) {
        return true;
      }
      return false;
    }
    __name(isLeafTag, "isLeafTag");
    exports.prettify = prettify;
  }
});

// ../node_modules/fast-xml-parser/src/xmlparser/XMLParser.js
var require_XMLParser = __commonJS({
  "../node_modules/fast-xml-parser/src/xmlparser/XMLParser.js"(exports, module) {
    init_functionsRoutes_0_9741670341706992();
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
            throw Error(`${result.err.msg}:${result.err.line}:${result.err.col}`);
          }
        }
        const orderedObjParser = new OrderedObjParser(this.options);
        orderedObjParser.addExternalEntities(this.externalEntities);
        const orderedResult = orderedObjParser.parseXml(xmlData);
        if (this.options.preserveOrder || orderedResult === void 0) return orderedResult;
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
          throw new Error("An entity must be set without '&' and ';'. Eg. use '#xD' for '&#xD;'");
        } else if (value === "&") {
          throw new Error("An entity with value '&' is not permitted");
        } else {
          this.externalEntities[key] = value;
        }
      }
    };
    module.exports = XMLParser2;
  }
});

// ../node_modules/fast-xml-parser/src/xmlbuilder/orderedJs2Xml.js
var require_orderedJs2Xml = __commonJS({
  "../node_modules/fast-xml-parser/src/xmlbuilder/orderedJs2Xml.js"(exports, module) {
    init_functionsRoutes_0_9741670341706992();
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
          xmlStr += indentation + `<!--${tagObj[tagName][0][options.textNodeName]}-->`;
          isPreviousElementTag = true;
          continue;
        } else if (tagName[0] === "?") {
          const attStr2 = attr_to_str(tagObj[":@"], options);
          const tempInd = tagName === "?xml" ? "" : indentation;
          let piTextNodeName = tagObj[tagName][0][options.textNodeName];
          piTextNodeName = piTextNodeName.length !== 0 ? " " + piTextNodeName : "";
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
        const tagValue = arrToStr(tagObj[tagName], options, newJPath, newIdentation);
        if (options.unpairedTags.indexOf(tagName) !== -1) {
          if (options.suppressUnpairedNode) xmlStr += tagStart + ">";
          else xmlStr += tagStart + "/>";
        } else if ((!tagValue || tagValue.length === 0) && options.suppressEmptyNode) {
          xmlStr += tagStart + "/>";
        } else if (tagValue && tagValue.endsWith(">")) {
          xmlStr += tagStart + `>${tagValue}${indentation}</${tagName}>`;
        } else {
          xmlStr += tagStart + ">";
          if (tagValue && indentation !== "" && (tagValue.includes("/>") || tagValue.includes("</"))) {
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
        if (options.stopNodes[index] === jPath || options.stopNodes[index] === "*." + tagName) return true;
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
  }
});

// ../node_modules/fast-xml-parser/src/xmlbuilder/json2xml.js
var require_json2xml = __commonJS({
  "../node_modules/fast-xml-parser/src/xmlbuilder/json2xml.js"(exports, module) {
    "use strict";
    init_functionsRoutes_0_9741670341706992();
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
      tagValueProcessor: /* @__PURE__ */ __name(function(key, a) {
        return a;
      }, "tagValueProcessor"),
      attributeValueProcessor: /* @__PURE__ */ __name(function(attrName, a) {
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
        { regex: new RegExp('"', "g"), val: "&quot;" }
      ],
      processEntities: true,
      stopNodes: [],
      // transformTagName: false,
      // transformAttributeName: false,
      oneListGroup: false
    };
    function Builder(options) {
      this.options = Object.assign({}, defaultOptions, options);
      if (this.options.ignoreAttributes === true || this.options.attributesGroupName) {
        this.isAttribute = function() {
          return false;
        };
      } else {
        this.ignoreAttributesFn = getIgnoreAttributesFn(this.options.ignoreAttributes);
        this.attrPrefixLen = this.options.attributeNamePrefix.length;
        this.isAttribute = isAttribute;
      }
      this.processTextOrObjNode = processTextOrObjNode;
      if (this.options.format) {
        this.indentate = indentate;
        this.tagEndChar = ">\n";
        this.newLine = "\n";
      } else {
        this.indentate = function() {
          return "";
        };
        this.tagEndChar = ">";
        this.newLine = "";
      }
    }
    __name(Builder, "Builder");
    Builder.prototype.build = function(jObj) {
      if (this.options.preserveOrder) {
        return buildFromOrderedJs(jObj, this.options);
      } else {
        if (Array.isArray(jObj) && this.options.arrayNodeName && this.options.arrayNodeName.length > 1) {
          jObj = {
            [this.options.arrayNodeName]: jObj
          };
        }
        return this.j2x(jObj, 0, []).val;
      }
    };
    Builder.prototype.j2x = function(jObj, level, ajPath) {
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
              if (key[0] === "?") val += this.indentate(level) + "<" + key + "?" + this.tagEndChar;
              else val += this.indentate(level) + "<" + key + "/" + this.tagEndChar;
            } else if (typeof item === "object") {
              if (this.options.oneListGroup) {
                const result = this.j2x(item, level + 1, ajPath.concat(key));
                listTagVal += result.val;
                if (this.options.attributesGroupName && item.hasOwnProperty(this.options.attributesGroupName)) {
                  listTagAttr += result.attrStr;
                }
              } else {
                listTagVal += this.processTextOrObjNode(item, key, level, ajPath);
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
            listTagVal = this.buildObjectNode(listTagVal, key, listTagAttr, level);
          }
          val += listTagVal;
        } else {
          if (this.options.attributesGroupName && key === this.options.attributesGroupName) {
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
    Builder.prototype.buildAttrPairStr = function(attrName, val) {
      val = this.options.attributeValueProcessor(attrName, "" + val);
      val = this.replaceEntitiesValue(val);
      if (this.options.suppressBooleanAttributes && val === "true") {
        return " " + attrName;
      } else return " " + attrName + '="' + val + '"';
    };
    function processTextOrObjNode(object, key, level, ajPath) {
      const result = this.j2x(object, level + 1, ajPath.concat(key));
      if (object[this.options.textNodeName] !== void 0 && Object.keys(object).length === 1) {
        return this.buildTextValNode(object[this.options.textNodeName], key, result.attrStr, level);
      } else {
        return this.buildObjectNode(result.val, key, result.attrStr, level);
      }
    }
    __name(processTextOrObjNode, "processTextOrObjNode");
    Builder.prototype.buildObjectNode = function(val, key, attrStr, level) {
      if (val === "") {
        if (key[0] === "?") return this.indentate(level) + "<" + key + attrStr + "?" + this.tagEndChar;
        else {
          return this.indentate(level) + "<" + key + attrStr + this.closeTag(key) + this.tagEndChar;
        }
      } else {
        let tagEndExp = "</" + key + this.tagEndChar;
        let piClosingChar = "";
        if (key[0] === "?") {
          piClosingChar = "?";
          tagEndExp = "";
        }
        if ((attrStr || attrStr === "") && val.indexOf("<") === -1) {
          return this.indentate(level) + "<" + key + attrStr + piClosingChar + ">" + val + tagEndExp;
        } else if (this.options.commentPropName !== false && key === this.options.commentPropName && piClosingChar.length === 0) {
          return this.indentate(level) + `<!--${val}-->` + this.newLine;
        } else {
          return this.indentate(level) + "<" + key + attrStr + piClosingChar + this.tagEndChar + val + this.indentate(level) + tagEndExp;
        }
      }
    };
    Builder.prototype.closeTag = function(key) {
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
    Builder.prototype.buildTextValNode = function(val, key, attrStr, level) {
      if (this.options.cdataPropName !== false && key === this.options.cdataPropName) {
        return this.indentate(level) + `<![CDATA[${val}]]>` + this.newLine;
      } else if (this.options.commentPropName !== false && key === this.options.commentPropName) {
        return this.indentate(level) + `<!--${val}-->` + this.newLine;
      } else if (key[0] === "?") {
        return this.indentate(level) + "<" + key + attrStr + "?" + this.tagEndChar;
      } else {
        let textValue = this.options.tagValueProcessor(key, val);
        textValue = this.replaceEntitiesValue(textValue);
        if (textValue === "") {
          return this.indentate(level) + "<" + key + attrStr + this.closeTag(key) + this.tagEndChar;
        } else {
          return this.indentate(level) + "<" + key + attrStr + ">" + textValue + "</" + key + this.tagEndChar;
        }
      }
    };
    Builder.prototype.replaceEntitiesValue = function(textValue) {
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
      if (name.startsWith(this.options.attributeNamePrefix) && name !== this.options.textNodeName) {
        return name.substr(this.attrPrefixLen);
      } else {
        return false;
      }
    }
    __name(isAttribute, "isAttribute");
    module.exports = Builder;
  }
});

// ../node_modules/fast-xml-parser/src/fxp.js
var require_fxp = __commonJS({
  "../node_modules/fast-xml-parser/src/fxp.js"(exports, module) {
    "use strict";
    init_functionsRoutes_0_9741670341706992();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    var validator = require_validator();
    var XMLParser2 = require_XMLParser();
    var XMLBuilder = require_json2xml();
    module.exports = {
      XMLParser: XMLParser2,
      XMLValidator: validator,
      XMLBuilder
    };
  }
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
  if (!Number.isFinite(configured2) || configured2 <= 0) return DEFAULT_PLEX_FETCH_TIMEOUT_MS;
  return Math.max(1e3, Math.min(3e4, Math.trunc(configured2)));
}
async function fetchWithTimeout(input, init, timeoutMs) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(input, {
      ...init,
      signal: controller.signal
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
  if (typeof value === "number" || typeof value === "boolean") return String(value);
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
  const raw = pickFirstString(entry, ["@_ratingKey", "ratingKey"]) ?? pickFirstString(entry, ["@_key", "key"]);
  if (!raw) return null;
  const match2 = raw.match(/\/(\d+)(?:\/items)?(?:[/?#].*)?$/);
  return match2?.[1] ?? raw;
}
function extractTags(entry, key) {
  return toArray(entry[key]).map((tag) => pickFirstString(tag, ["@_tag", "tag", "@_title", "title"])).filter((tag) => Boolean(tag));
}
function getMediaContainerEntries(parsed) {
  const mediaContainer = parsed.MediaContainer ?? parsed;
  return [
    ...toArray(mediaContainer?.Metadata),
    ...toArray(mediaContainer?.Video),
    ...toArray(mediaContainer?.Directory)
  ];
}
function mapPreviewItem(entry) {
  const id = extractEntryId(entry);
  const title2 = pickFirstString(entry, ["@_title", "title", "@_originalTitle", "originalTitle"]);
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
      "userRating"
    ]),
    posterPath: pickFirstString(entry, ["@_thumb", "thumb", "@_parentThumb", "parentThumb", "@_art", "art"]),
    seasons: pickFirstNumber(entry, ["@_childCount", "childCount"])
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
    posterPath: pickFirstString(entry, ["@_thumb", "thumb", "@_composite", "composite"]),
    artPath: pickFirstString(entry, ["@_art", "art"]),
    itemCount: pickFirstNumber(entry, ["@_childCount", "childCount"]),
    updatedAt: parseUnixTimestamp(entry["@_updatedAt"] ?? entry.updatedAt)
  };
}
function mapCollectionMovie(entry) {
  const id = extractEntryId(entry);
  const title2 = pickFirstString(entry, ["@_title", "title", "@_originalTitle", "originalTitle"]);
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
      "userRating"
    ]),
    posterPath: pickFirstString(entry, ["@_thumb", "thumb", "@_parentThumb", "parentThumb", "@_art", "art"]),
    summary: pickFirstString(entry, ["@_summary", "summary", "@_tagline", "tagline"]),
    durationMinutes: parseDurationMinutes(entry["@_duration"] ?? entry.duration),
    genres: extractTags(entry, "Genre"),
    contentRating: pickFirstString(entry, ["@_contentRating", "contentRating"]),
    studio: pickFirstString(entry, ["@_studio", "studio"]) ?? extractTags(entry, "Studio")[0] ?? null
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
    studio: item.studio
  };
}
async function plexRequest2(env2, pathname, params) {
  const baseUrl = normalizeBaseUrl(getRequiredEnv(env2, "PLEX_URL"));
  const token = getRequiredEnv(env2, "PLEX_TOKEN");
  const url = new URL(pathname.replace(/^\//, ""), baseUrl);
  url.searchParams.set("X-Plex-Token", token);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, String(value));
    }
  }
  const res = await fetchWithTimeout(url, {
    headers: {
      Accept: "application/json, text/xml, application/xml;q=0.9, */*;q=0.8"
    }
  }, plexFetchTimeoutMs(env2));
  if (!res.ok) {
    const body = await res.text().catch(() => "") || res.statusText;
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
  const url = width || height ? (() => {
    const transcodeUrl = new URL("photo/:/transcode", baseUrl);
    if (width) transcodeUrl.searchParams.set("width", String(width));
    if (height) transcodeUrl.searchParams.set("height", String(height));
    transcodeUrl.searchParams.set("minSize", "1");
    transcodeUrl.searchParams.set("upscale", "1");
    transcodeUrl.searchParams.set("url", safePath);
    return transcodeUrl;
  })() : new URL(safePath.slice(1), baseUrl);
  url.searchParams.set("X-Plex-Token", token);
  return fetchWithTimeout(url, {}, plexFetchTimeoutMs(env2));
}
async function getPlexSections(env2) {
  const key = `${cachePrefix(env2)}::sections`;
  return cached(key, 6e4, async () => {
    const parsed = await plexRequest2(env2, "/library/sections");
    const mediaContainer = parsed.MediaContainer ?? parsed;
    const directories = toArray(mediaContainer?.Directory);
    return directories.map((directory) => ({
      key: pickFirstString(directory, ["@_key", "key"]) ?? "",
      title: pickFirstString(directory, ["@_title", "title"]) ?? "",
      type: pickFirstString(directory, ["@_type", "type"]) ?? ""
    })).filter(
      (directory) => directory.key && directory.title && (directory.type === "movie" || directory.type === "show")
    );
  });
}
async function resolveSectionId(env2, forType) {
  const envKey = forType === "tv" ? "PLEX_TV_SECTION_ID" : "PLEX_MOVIE_SECTION_ID";
  const explicit = env2[envKey]?.trim();
  if (explicit) return explicit;
  const sections = await getPlexSections(env2);
  const desired = forType === "tv" ? "show" : "movie";
  const desiredTitle = DEFAULT_LIBRARY_TITLES[forType].toLowerCase();
  const matchingSections = sections.filter((section) => section.type === desired);
  const match2 = matchingSections.find((section) => section.title.trim().toLowerCase() === desiredTitle) ?? matchingSections[0];
  if (!match2) {
    throw new Error(`Could not auto-detect Plex ${forType} library. Set ${envKey} to the library section id.`);
  }
  return match2.key;
}
async function resolveAnimeSectionId(env2, forType) {
  const envKey = forType === "tv" ? "PLEX_ANIME_TV_SECTION_ID" : "PLEX_ANIME_MOVIE_SECTION_ID";
  const explicit = env2[envKey]?.trim();
  if (explicit) return explicit;
  const sections = await getPlexSections(env2);
  const desired = forType === "tv" ? "show" : "movie";
  const matchingSections = sections.filter(
    (section) => section.type === desired && /anime/i.test(section.title)
  );
  const preferredTitles = forType === "tv" ? ["anime shows", "anime tv", "anime"] : ["anime movies", "anime films", "anime"];
  const match2 = preferredTitles.map(
    (title2) => matchingSections.find((section) => section.title.trim().toLowerCase() === title2)
  ).find(Boolean) ?? matchingSections[0];
  if (!match2) {
    throw new Error(
      `Could not auto-detect the Plex anime ${forType} library. Set ${envKey} to its library section id.`
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
    const parsed = await plexRequest2(env2, `/library/sections/${sectionId}/all`, {
      type: plexType,
      "X-Plex-Container-Start": 0,
      "X-Plex-Container-Size": 1
    });
    const mediaContainer = parsed.MediaContainer ?? parsed;
    const total = pickFirstNumber(mediaContainer, ["@_totalSize", "totalSize", "@_size", "size"]) ?? getMediaContainerEntries(parsed).length;
    return total;
  });
}
async function getLibraryItemCount(env2, type) {
  const sectionIds = await resolveCountSectionIds(env2, type);
  const counts = await Promise.all(
    sectionIds.map((sectionId) => getLibrarySectionItemCount(env2, type, sectionId))
  );
  return counts.reduce((total, count4) => total + count4, 0);
}
async function getPlexLibraryCounts(env2) {
  const safeCount = /* @__PURE__ */ __name(async (type) => {
    try {
      return await getLibraryItemCount(env2, type);
    } catch {
      return null;
    }
  }, "safeCount");
  const [movies, shows] = await Promise.all([safeCount("movie"), safeCount("tv")]);
  return { movies, shows };
}
async function getTopRated(env2, options) {
  const { type, limit } = options;
  const sectionId = await resolveSectionId(env2, type);
  const plexType = type === "tv" ? 2 : 1;
  const key = `${cachePrefix(env2)}::topRated:${type}:${limit}:${sectionId}`;
  return cached(key, 6e4, async () => {
    const parsed = await plexRequest2(env2, `/library/sections/${sectionId}/all`, {
      type: plexType,
      sort: "audienceRating:desc",
      "X-Plex-Container-Start": 0,
      "X-Plex-Container-Size": limit
    });
    return getMediaContainerEntries(parsed).map(mapPreviewItem).filter((item) => Boolean(item)).slice(0, limit);
  });
}
function normalizeLibraryLimit(limit) {
  if (limit == null || !Number.isFinite(limit)) return null;
  return Math.max(1, Math.min(1e4, Math.trunc(limit)));
}
async function getPlexMovies(env2, options = {}) {
  const sectionId = options.sectionId ?? await resolveSectionId(env2, "movie");
  const limit = normalizeLibraryLimit(options.limit);
  const key = `${cachePrefix(env2)}::movies:${sectionId}:${limit ?? "all"}`;
  return cached(key, 6e4, async () => {
    const pageSize = 200;
    const items = [];
    let start2 = 0;
    let totalSize = null;
    while (true) {
      const remaining = limit == null ? pageSize : Math.min(pageSize, limit - items.length);
      if (remaining <= 0) break;
      const parsed = await plexRequest2(env2, `/library/sections/${sectionId}/all`, {
        type: 1,
        "X-Plex-Container-Start": start2,
        "X-Plex-Container-Size": remaining
      });
      const mediaContainer = parsed.MediaContainer ?? parsed;
      const pageItems = getMediaContainerEntries(parsed).map(mapCollectionMovie).filter((item) => Boolean(item));
      items.push(...pageItems);
      totalSize = pickFirstNumber(mediaContainer, ["@_totalSize", "totalSize"]) ?? totalSize;
      if (pageItems.length === 0) break;
      start2 += pageItems.length;
      if (limit != null && items.length >= limit) break;
      if (totalSize != null && start2 >= totalSize) break;
      if (pageItems.length < remaining) break;
    }
    return items;
  });
}
async function getPlexShows(env2, options = {}) {
  const sectionId = options.sectionId ?? await resolveSectionId(env2, "tv");
  const limit = normalizeLibraryLimit(options.limit);
  const key = `${cachePrefix(env2)}::shows:${sectionId}:${limit ?? "all"}`;
  return cached(key, 6e4, async () => {
    const pageSize = 200;
    const items = [];
    let start2 = 0;
    let totalSize = null;
    while (true) {
      const remaining = limit == null ? pageSize : Math.min(pageSize, limit - items.length);
      if (remaining <= 0) break;
      const parsed = await plexRequest2(env2, `/library/sections/${sectionId}/all`, {
        type: 2,
        "X-Plex-Container-Start": start2,
        "X-Plex-Container-Size": remaining
      });
      const mediaContainer = parsed?.MediaContainer ?? parsed;
      const pageItems = getMediaContainerEntries(parsed).map(mapLibraryShow).filter((item) => Boolean(item));
      items.push(...pageItems);
      totalSize = pickFirstNumber(mediaContainer, ["@_totalSize", "totalSize"]) ?? totalSize;
      if (pageItems.length === 0) break;
      start2 += pageItems.length;
      if (limit != null && items.length >= limit) break;
      if (totalSize != null && start2 >= totalSize) break;
      if (pageItems.length < remaining) break;
    }
    return items;
  });
}
async function getPlexAnimeMovies(env2, options = {}) {
  const sectionId = await resolveAnimeSectionId(env2, "movie");
  return getPlexMovies(env2, { ...options, sectionId });
}
async function getPlexAnimeShows(env2, options = {}) {
  const sectionId = await resolveAnimeSectionId(env2, "tv");
  return getPlexShows(env2, { ...options, sectionId });
}
async function getPlexCollections(env2, options = {}) {
  const sectionId = options.sectionId ?? await resolveSectionId(env2, "movie");
  const key = `${cachePrefix(env2)}::collections:${sectionId}`;
  return cached(key, 6e4, async () => {
    const parsed = await plexRequest2(env2, `/library/sections/${sectionId}/collections`);
    return getMediaContainerEntries(parsed).map(mapCollectionSummary).filter((collection) => Boolean(collection));
  });
}
async function getCollectionMetadata(env2, collectionId) {
  const key = `${cachePrefix(env2)}::collectionMeta:${collectionId}`;
  return cached(key, 6e4, async () => {
    const parsed = await plexRequest2(env2, `/library/metadata/${collectionId}`);
    const [entry] = getMediaContainerEntries(parsed);
    return entry ? mapCollectionSummary(entry) : null;
  });
}
async function getCollectionItems(env2, collectionId) {
  const key = `${cachePrefix(env2)}::collectionItems:${collectionId}`;
  return cached(key, 6e4, async () => {
    const pageSize = 100;
    const items = [];
    let start2 = 0;
    let totalSize = null;
    while (true) {
      const parsed = await plexRequest2(env2, `/library/collections/${collectionId}/items`, {
        "X-Plex-Container-Start": start2,
        "X-Plex-Container-Size": pageSize
      });
      const mediaContainer = parsed.MediaContainer ?? parsed;
      const pageItems = getMediaContainerEntries(parsed).map(mapCollectionMovie).filter((item) => Boolean(item));
      items.push(...pageItems);
      totalSize = pickFirstNumber(mediaContainer, ["@_totalSize", "totalSize"]) ?? totalSize;
      if (pageItems.length === 0) break;
      start2 += pageItems.length;
      if (totalSize != null && start2 >= totalSize) break;
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
  const normalized3 = value?.trim();
  return normalized3 ? normalized3 : null;
}
async function resolveFeaturedCollectionTarget(env2, options) {
  const desiredId = normalizeText(options.collectionId ?? env2.PLEX_COLLECTION_ID);
  const desiredTitle = normalizeText(options.collectionTitle ?? env2.PLEX_COLLECTION_TITLE);
  if (!desiredId && !desiredTitle) {
    throw new Error("Set PLEX_COLLECTION_ID or PLEX_COLLECTION_TITLE to choose which Plex collection to display.");
  }
  const collections = await getPlexCollections(env2);
  if (desiredId) {
    const summary2 = collections.find((collection) => collection.id === desiredId) ?? null;
    return { collectionId: desiredId, summary: summary2 };
  }
  const summary = collections.find((collection) => collection.title.trim().toLowerCase() === desiredTitle.toLowerCase()) ?? null;
  if (!summary) {
    throw new Error(`Could not find Plex collection '${desiredTitle}'. Check /api/plex/collections or set PLEX_COLLECTION_ID.`);
  }
  return { collectionId: summary.id, summary };
}
async function getFeaturedCollection(env2, options = {}) {
  const { collectionId, summary } = await resolveFeaturedCollectionTarget(env2, options);
  const limit = normalizeLimit(options.limit);
  const [metadata, allItems] = await Promise.all([
    summary ? Promise.resolve(summary) : getCollectionMetadata(env2, collectionId),
    getCollectionItems(env2, collectionId)
  ]);
  const resolvedSummary = metadata ?? summary;
  const items = limit == null ? allItems : allItems.slice(0, limit);
  return {
    id: collectionId,
    title: resolvedSummary?.title ?? normalizeText(options.collectionTitle ?? env2.PLEX_COLLECTION_TITLE) ?? "Featured Collection",
    summary: resolvedSummary?.summary ?? null,
    posterPath: resolvedSummary?.posterPath ?? null,
    artPath: resolvedSummary?.artPath ?? null,
    itemCount: resolvedSummary?.itemCount ?? allItems.length,
    updatedAt: resolvedSummary?.updatedAt ?? null,
    items
  };
}
var import_fast_xml_parser, parser, cache, DEFAULT_PLEX_FETCH_TIMEOUT_MS, DEFAULT_LIBRARY_TITLES;
var init_plex_client = __esm({
  "../shared/plex-client.ts"() {
    init_functionsRoutes_0_9741670341706992();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    import_fast_xml_parser = __toESM(require_fxp(), 1);
    parser = new import_fast_xml_parser.XMLParser({
      ignoreAttributes: false
    });
    cache = /* @__PURE__ */ new Map();
    DEFAULT_PLEX_FETCH_TIMEOUT_MS = 8e3;
    DEFAULT_LIBRARY_TITLES = {
      movie: "Movies",
      tv: "Shows"
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
    __name(plexRequest2, "plexRequest");
    __name(plexFetchImage, "plexFetchImage");
    __name(getPlexSections, "getPlexSections");
    __name(resolveSectionId, "resolveSectionId");
    __name(resolveAnimeSectionId, "resolveAnimeSectionId");
    __name(resolveCountSectionIds, "resolveCountSectionIds");
    __name(getLibrarySectionItemCount, "getLibrarySectionItemCount");
    __name(getLibraryItemCount, "getLibraryItemCount");
    __name(getPlexLibraryCounts, "getPlexLibraryCounts");
    __name(getTopRated, "getTopRated");
    __name(normalizeLibraryLimit, "normalizeLibraryLimit");
    __name(getPlexMovies, "getPlexMovies");
    __name(getPlexShows, "getPlexShows");
    __name(getPlexAnimeMovies, "getPlexAnimeMovies");
    __name(getPlexAnimeShows, "getPlexAnimeShows");
    __name(getPlexCollections, "getPlexCollections");
    __name(getCollectionMetadata, "getCollectionMetadata");
    __name(getCollectionItems, "getCollectionItems");
    __name(normalizeLimit, "normalizeLimit");
    __name(normalizeText, "normalizeText");
    __name(resolveFeaturedCollectionTarget, "resolveFeaturedCollectionTarget");
    __name(getFeaturedCollection, "getFeaturedCollection");
  }
});

// _lib/pages.ts
function json(data, init = {}) {
  const headers = new Headers(init.headers);
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json; charset=utf-8");
  }
  return new Response(JSON.stringify(data), {
    ...init,
    headers
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
    headers
  });
}
function cachedJsonResponse(data, cacheStatus) {
  return json(data, {
    headers: {
      "Cache-Control": "public, max-age=60, s-maxage=86400, stale-while-revalidate=86400",
      "X-PlexPoint-Cache": cacheStatus,
      "X-PlexPoint-Cached-At": (/* @__PURE__ */ new Date()).toISOString()
    }
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
      options.load().then((data) => cache2.put(cacheKey, cachedJsonResponse(data, "refresh"))).catch(() => void 0)
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
        message: errorMessage(error3, options.fallbackMessage)
      },
      { status: 501 }
    );
  }
}
var PLEX_API_CACHE_VERSION;
var init_pages = __esm({
  "_lib/pages.ts"() {
    init_functionsRoutes_0_9741670341706992();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    PLEX_API_CACHE_VERSION = "v4-optional-limit-parsing";
    __name(json, "json");
    __name(errorMessage, "errorMessage");
    __name(cloneWithHeader, "cloneWithHeader");
    __name(cachedJsonResponse, "cachedJsonResponse");
    __name(cachedJson, "cachedJson");
  }
});

// api/plex/anime-movies.ts
async function onRequestGet(context2) {
  const url = new URL(context2.request.url);
  const limitParam = url.searchParams.get("limit");
  const limitRaw = limitParam == null ? NaN : Number(limitParam);
  const limit = Number.isFinite(limitRaw) ? Math.max(1, Math.min(1e4, Math.trunc(limitRaw))) : void 0;
  return cachedJson(context2, {
    cacheName: "plex-api",
    cacheKey: context2.request.url,
    load: /* @__PURE__ */ __name(() => getPlexAnimeMovies(context2.env, { limit }), "load"),
    fallbackMessage: "The Plex anime movies library is not configured"
  });
}
var init_anime_movies = __esm({
  "api/plex/anime-movies.ts"() {
    init_functionsRoutes_0_9741670341706992();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    init_plex_client();
    init_pages();
    __name(onRequestGet, "onRequestGet");
  }
});

// api/plex/anime-shows.ts
async function onRequestGet2(context2) {
  const url = new URL(context2.request.url);
  const limitParam = url.searchParams.get("limit");
  const limitRaw = limitParam == null ? NaN : Number(limitParam);
  const limit = Number.isFinite(limitRaw) ? Math.max(1, Math.min(1e4, Math.trunc(limitRaw))) : void 0;
  return cachedJson(context2, {
    cacheName: "plex-api",
    cacheKey: context2.request.url,
    load: /* @__PURE__ */ __name(() => getPlexAnimeShows(context2.env, { limit }), "load"),
    fallbackMessage: "The Plex anime shows library is not configured"
  });
}
var init_anime_shows = __esm({
  "api/plex/anime-shows.ts"() {
    init_functionsRoutes_0_9741670341706992();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    init_plex_client();
    init_pages();
    __name(onRequestGet2, "onRequestGet");
  }
});

// api/plex/collections.ts
async function onRequestGet3(context2) {
  const url = new URL(context2.request.url);
  const sectionId = url.searchParams.get("sectionId") ?? void 0;
  return cachedJson(context2, {
    cacheName: "plex-api",
    cacheKey: context2.request.url,
    load: /* @__PURE__ */ __name(() => getPlexCollections(context2.env, { sectionId }), "load"),
    fallbackMessage: "Plex integration not configured (set PLEX_URL and PLEX_TOKEN)"
  });
}
var init_collections = __esm({
  "api/plex/collections.ts"() {
    init_functionsRoutes_0_9741670341706992();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    init_plex_client();
    init_pages();
    __name(onRequestGet3, "onRequestGet");
  }
});

// api/plex/counts.ts
async function onRequestGet4(context2) {
  return cachedJson(context2, {
    cacheName: "plex-api",
    cacheKey: context2.request.url,
    load: /* @__PURE__ */ __name(() => getPlexLibraryCounts(context2.env), "load"),
    fallbackMessage: "Plex integration not configured (set PLEX_URL and PLEX_TOKEN)"
  });
}
var init_counts = __esm({
  "api/plex/counts.ts"() {
    init_functionsRoutes_0_9741670341706992();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    init_plex_client();
    init_pages();
    __name(onRequestGet4, "onRequestGet");
  }
});

// api/plex/featured-collection.ts
async function onRequestGet5(context2) {
  const url = new URL(context2.request.url);
  const collectionId = url.searchParams.get("id") ?? void 0;
  const collectionTitle = url.searchParams.get("title") ?? void 0;
  const limitParam = url.searchParams.get("limit");
  const limitRaw = limitParam == null ? NaN : Number(limitParam);
  const limit = Number.isFinite(limitRaw) ? Math.max(1, Math.min(500, Math.trunc(limitRaw))) : void 0;
  return cachedJson(context2, {
    cacheName: "plex-api",
    cacheKey: context2.request.url,
    load: /* @__PURE__ */ __name(() => getFeaturedCollection(context2.env, {
      collectionId,
      collectionTitle,
      limit
    }), "load"),
    fallbackMessage: "Plex integration not configured (set PLEX_URL, PLEX_TOKEN, and a collection id or title)"
  });
}
var init_featured_collection = __esm({
  "api/plex/featured-collection.ts"() {
    init_functionsRoutes_0_9741670341706992();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    init_plex_client();
    init_pages();
    __name(onRequestGet5, "onRequestGet");
  }
});

// api/plex/image.ts
async function onRequestGet6(context2) {
  try {
    const url = new URL(context2.request.url);
    const path = url.searchParams.get("path");
    if (typeof path !== "string" || !path.startsWith("/")) {
      return json({ message: "Query param 'path' must be a Plex path starting with '/'" }, { status: 400 });
    }
    const widthRaw = Number(url.searchParams.get("w"));
    const heightRaw = Number(url.searchParams.get("h"));
    const width = Number.isFinite(widthRaw) && widthRaw > 0 ? Math.max(40, Math.min(2e3, Math.trunc(widthRaw))) : void 0;
    const height = Number.isFinite(heightRaw) && heightRaw > 0 ? Math.max(40, Math.min(2e3, Math.trunc(heightRaw))) : void 0;
    const cacheKey = new Request(url.toString(), context2.request);
    const cache2 = await caches.open("plex-images");
    const cached2 = await cache2.match(cacheKey);
    if (cached2) return cached2;
    const upstream = await plexFetchImage(context2.env, path, { width, height });
    if (!upstream.ok) {
      const body = await upstream.text().catch(() => "") || upstream.statusText;
      return new Response(body, {
        status: upstream.status,
        headers: upstream.headers
      });
    }
    const headers = new Headers(upstream.headers);
    headers.set("Cache-Control", "public, max-age=604800, stale-while-revalidate=86400, immutable");
    const response = new Response(upstream.body, {
      status: upstream.status,
      headers
    });
    context2.waitUntil(cache2.put(cacheKey, response.clone()));
    return response;
  } catch (error3) {
    return json(
      {
        message: errorMessage(error3, "Plex integration not configured (set PLEX_URL and PLEX_TOKEN)")
      },
      { status: 501 }
    );
  }
}
var init_image = __esm({
  "api/plex/image.ts"() {
    init_functionsRoutes_0_9741670341706992();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    init_plex_client();
    init_pages();
    __name(onRequestGet6, "onRequestGet");
  }
});

// api/plex/movies.ts
async function onRequestGet7(context2) {
  const url = new URL(context2.request.url);
  const limitParam = url.searchParams.get("limit");
  const limitRaw = limitParam == null ? NaN : Number(limitParam);
  const limit = Number.isFinite(limitRaw) ? Math.max(1, Math.min(1e4, Math.trunc(limitRaw))) : void 0;
  return cachedJson(context2, {
    cacheName: "plex-api",
    cacheKey: context2.request.url,
    load: /* @__PURE__ */ __name(() => getPlexMovies(context2.env, { limit }), "load"),
    fallbackMessage: "Plex integration not configured (set PLEX_URL and PLEX_TOKEN)"
  });
}
var init_movies = __esm({
  "api/plex/movies.ts"() {
    init_functionsRoutes_0_9741670341706992();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    init_plex_client();
    init_pages();
    __name(onRequestGet7, "onRequestGet");
  }
});

// api/plex/sections.ts
async function onRequestGet8(context2) {
  return cachedJson(context2, {
    cacheName: "plex-api",
    cacheKey: context2.request.url,
    load: /* @__PURE__ */ __name(() => getPlexSections(context2.env), "load"),
    fallbackMessage: "Plex integration not configured (set PLEX_URL and PLEX_TOKEN)"
  });
}
var init_sections = __esm({
  "api/plex/sections.ts"() {
    init_functionsRoutes_0_9741670341706992();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    init_plex_client();
    init_pages();
    __name(onRequestGet8, "onRequestGet");
  }
});

// api/plex/shows.ts
async function onRequestGet9(context2) {
  const url = new URL(context2.request.url);
  const limitParam = url.searchParams.get("limit");
  const limitRaw = limitParam == null ? NaN : Number(limitParam);
  const limit = Number.isFinite(limitRaw) ? Math.max(1, Math.min(1e4, Math.trunc(limitRaw))) : void 0;
  return cachedJson(context2, {
    cacheName: "plex-api",
    cacheKey: context2.request.url,
    load: /* @__PURE__ */ __name(() => getPlexShows(context2.env, { limit }), "load"),
    fallbackMessage: "Plex integration not configured (set PLEX_URL and PLEX_TOKEN)"
  });
}
var init_shows = __esm({
  "api/plex/shows.ts"() {
    init_functionsRoutes_0_9741670341706992();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    init_plex_client();
    init_pages();
    __name(onRequestGet9, "onRequestGet");
  }
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
async function onRequestGet10(context2) {
  const startedAt = Date.now();
  const envStatus = {
    plexUrl: configured(context2.env.PLEX_URL),
    plexToken: configured(context2.env.PLEX_TOKEN),
    movieSectionId: configured(context2.env.PLEX_MOVIE_SECTION_ID),
    tvSectionId: configured(context2.env.PLEX_TV_SECTION_ID),
    collectionId: configured(context2.env.PLEX_COLLECTION_ID),
    collectionTitle: configured(context2.env.PLEX_COLLECTION_TITLE)
  };
  try {
    const [sections, counts] = await Promise.all([
      getPlexSections(context2.env),
      getPlexLibraryCounts(context2.env)
    ]);
    return json({
      ok: true,
      reachable: true,
      env: envStatus,
      sections: {
        movies: sections.filter((section) => section.type === "movie").length,
        shows: sections.filter((section) => section.type === "show").length
      },
      counts,
      durationMs: Date.now() - startedAt
    });
  } catch (error3) {
    return json(
      {
        ok: false,
        reachable: false,
        env: envStatus,
        message: publicMessage(error3),
        durationMs: Date.now() - startedAt
      },
      { status: 503 }
    );
  }
}
var init_status = __esm({
  "api/plex/status.ts"() {
    init_functionsRoutes_0_9741670341706992();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    init_plex_client();
    init_pages();
    __name(configured, "configured");
    __name(publicMessage, "publicMessage");
    __name(onRequestGet10, "onRequestGet");
  }
});

// api/plex/top-rated.ts
async function onRequestGet11(context2) {
  const url = new URL(context2.request.url);
  const typeParam = String(url.searchParams.get("type") ?? "tv").toLowerCase();
  const type = typeParam === "movie" ? "movie" : "tv";
  const limitParam = url.searchParams.get("limit");
  const limitRaw = limitParam == null ? NaN : Number(limitParam);
  const limit = Number.isFinite(limitRaw) ? Math.max(1, Math.min(30, Math.trunc(limitRaw))) : 12;
  return cachedJson(context2, {
    cacheName: "plex-api",
    cacheKey: context2.request.url,
    load: /* @__PURE__ */ __name(() => getTopRated(context2.env, { type, limit }), "load"),
    fallbackMessage: "Plex integration not configured (set PLEX_URL and PLEX_TOKEN)"
  });
}
var init_top_rated = __esm({
  "api/plex/top-rated.ts"() {
    init_functionsRoutes_0_9741670341706992();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    init_plex_client();
    init_pages();
    __name(onRequestGet11, "onRequestGet");
  }
});

// ../assets/portal-content.js
var defaultLinks, defaultArticles;
var init_portal_content = __esm({
  "../assets/portal-content.js"() {
    init_functionsRoutes_0_9741670341706992();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    defaultLinks = [
      { id: "plex", title: "Open Plex", description: "Your next movie night starts here.", url: "https://app.plex.tv/" },
      { id: "requests", title: "Request a movie or show", description: "Find something new and send a request through Overseerr.", url: "https://request.plexpoint.uk/" },
      { id: "library", title: "Browse the library", description: "Explore the movies and shows available on PlexPoint.", url: "/movies" },
      { id: "setup", title: "Device setup guides", description: "Get comfortable on your TV, phone, tablet or computer.", url: "/#tutorials" },
      { id: "install", title: "Install Plex", description: "Find the Plex application for your device.", url: "https://www.plex.tv/apps-devices/" }
    ];
    defaultArticles = [
      {
        slug: "install-plex",
        title: "Install Plex on your device",
        category: "Getting started",
        summary: "Set up Plex on a TV, phone, tablet or computer.",
        body_markdown: "## Choose your device\n1. Open the application store on your device and search for Plex. You can also use the Install Plex link in Services to find supported devices.\n2. Install and open the Plex application. On a computer, you can use Open Plex in your web browser instead.\n3. Sign in with the Plex account you use for PlexPoint.\n\n## Find PlexPoint\nOpen the library or More menu and look for the libraries shared with your account. Pin the libraries you use most often. Menu names can vary between devices.\n\nIf you cannot see the shared libraries, follow the missing-library guide or contact Jacob."
      },
      {
        slug: "sign-in-to-plex",
        title: "Sign in to Plex",
        category: "Getting started",
        summary: "Use the right Plex account and connect your TV.",
        body_markdown: "## On a phone or computer\n1. Open the Plex application or choose Open Plex from Services.\n2. Sign in with the account that received your PlexPoint library invitation.\n3. Accept the library invitation if it is still pending, then reopen the application.\n\n## On a television\nFollow the sign-in instructions displayed by the Plex application. If it shows a link code, visit the address shown on the TV using your phone or computer and enter that code.\n\nYour Plex account and the My PlexPoint customer portal are separate. Creating a portal account will not automatically create a Plex account or grant library access."
      },
      {
        slug: "request-content",
        title: "Request a movie or TV show",
        category: "Requests",
        summary: "Search, request and follow progress through Overseerr.",
        body_markdown: "## Send a request\n1. Check the PlexPoint library to see whether the title is already available.\n2. Open Request a movie or show in Services and sign in to Overseerr using your Plex account.\n3. Search for the exact title and check its release year. For a show, select the seasons you want.\n4. Submit the request and check its status in Overseerr.\n\n## What happens next?\nRequest allowances and processing priority depend on your subscription tier. A request is not a guarantee of immediate availability. Check your existing request before submitting a duplicate.\n\nIf Overseerr does not recognise your account or you cannot submit a request, contact Jacob."
      },
      {
        slug: "missing-library",
        title: "I cannot see the PlexPoint library",
        category: "Troubleshooting",
        summary: "Check your invitation, account and pinned libraries.",
        body_markdown: "## Check these first\n1. Confirm that you are signed in to the Plex account that received the invitation.\n2. Check whether the library invitation still needs to be accepted.\n3. Open the More or library menu. The shared libraries may be available but not pinned to your home screen.\n4. Close and reopen Plex. Try the web application to see whether the same problem happens there.\n\n## Still missing?\nContact Jacob with your Plex username and the device you are using. Ask for your library invitation and subscription status to be checked. An available public website does not necessarily mean the Plex server is reachable."
      },
      {
        slug: "playback-help",
        title: "Buffering or playback problems",
        category: "Troubleshooting",
        summary: "Narrow down the problem before requesting help.",
        body_markdown: "## Try a few quick checks\n1. Try another movie or episode to see whether the problem affects one title or everything.\n2. Restart the Plex application and check for application updates.\n3. Check your network connection. Try a wired connection or move closer to your Wi-Fi router where possible.\n4. If your connection is struggling, try a lower playback quality in Plex.\n5. Try another device or the Plex web application.\n\n## Ask for help\nInclude the title, episode if relevant, device, approximate time of the problem and any error message. The Contact support section helps you prepare a message."
      },
      {
        slug: "payments-and-renewals",
        title: "Payments and subscription renewals",
        category: "Membership",
        summary: "Understand manual payments, confirmation and renewal dates.",
        body_markdown: "## Payments are confirmed manually\nPlexPoint currently uses manual payment confirmation. Paying by bank transfer or Revolut does not automatically update access or renew a subscription.\n\nCheck the current plan price and payment instructions on the main PlexPoint website. Include the requested payment reference or plan name and contact Jacob so the payment can be matched to your membership.\n\n## Payment and subscription status are different\nA payment awaiting confirmation has not yet been confirmed by the administrator. An expired subscription means its access period has ended. A confirmed payment and a subscription extension are separate records.\n\nIf you have paid but your access has not been updated, contact Jacob with the plan, payment date and reference. Account-specific payment history is not available in this portal preview."
      }
    ];
  }
});

// ../assets/portal-utils.js
function publicHref(value) {
  if (typeof value !== "string" || !value || value !== value.trim() || /[\s\\\u0000-\u001f\u007f]/.test(value)) return null;
  if (value.startsWith("/") && !value.startsWith("//")) return value;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || url.username || url.password) return null;
    return url.href;
  } catch {
    return null;
  }
}
function normalizeContent(content) {
  if (!content || !Array.isArray(content.links) || !Array.isArray(content.articles)) {
    throw new TypeError("Invalid portal content");
  }
  const text = /* @__PURE__ */ __name((value, limit) => typeof value === "string" && value.trim().length > 0 && value.length <= limit, "text");
  const seenLinks = /* @__PURE__ */ new Set();
  const seenArticles = /* @__PURE__ */ new Set();
  return {
    links: content.links.filter((link) => {
      if (!link || !text(link.id, 100) || seenLinks.has(link.id) || !text(link.title, 160) || !text(link.description, 1e3) || !publicHref(link.url)) return false;
      seenLinks.add(link.id);
      return true;
    }).map(({ id, title: title2, description, url }) => ({ id, title: title2, description, url: publicHref(url) })),
    articles: content.articles.filter((article) => {
      if (!article || typeof article.slug !== "string" || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(article.slug) || article.slug.length > 100 || seenArticles.has(article.slug) || !text(article.title, 160) || !text(article.summary, 1e3) || !text(article.category, 80) || !text(article.body_markdown, 5e4)) return false;
      seenArticles.add(article.slug);
      return true;
    }).map(({ slug, title: title2, summary, category, body_markdown }) => ({ slug, title: title2, summary, category, body_markdown }))
  };
}
var init_portal_utils = __esm({
  "../assets/portal-utils.js"() {
    init_functionsRoutes_0_9741670341706992();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    __name(publicHref, "publicHref");
    __name(normalizeContent, "normalizeContent");
  }
});

// ../shared/portal/content.js
async function loadPublicContent(database) {
  if (!database) {
    return { ...normalizeContent({ links: defaultLinks, articles: defaultArticles }), source: "bundled" };
  }
  const [links, articles] = await Promise.all([
    database.prepare(publicContentQueries.links).all(),
    database.prepare(publicContentQueries.articles).all()
  ]);
  if (links.success === false || articles.success === false) throw new Error("Content query failed");
  return { ...normalizeContent({ links: links.results, articles: articles.results }), source: "database" };
}
async function publicContentResponse(env2) {
  try {
    return Response.json(await loadPublicContent(env2.PORTAL_DB), {
      headers: { "Cache-Control": "public, max-age=60", "X-Content-Type-Options": "nosniff" }
    });
  } catch {
    return Response.json({ message: "Updated guides are temporarily unavailable." }, {
      status: 503,
      headers: { "Cache-Control": "no-store" }
    });
  }
}
var publicContentQueries;
var init_content = __esm({
  "../shared/portal/content.js"() {
    init_functionsRoutes_0_9741670341706992();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    init_portal_content();
    init_portal_utils();
    publicContentQueries = {
      links: "SELECT id, title, description, url FROM service_links WHERE enabled = 1 ORDER BY sort_order, title LIMIT 100",
      articles: "SELECT slug, title, summary, body_markdown, category FROM help_articles WHERE published = 1 ORDER BY sort_order, title LIMIT 200"
    };
    __name(loadPublicContent, "loadPublicContent");
    __name(publicContentResponse, "publicContentResponse");
  }
});

// api/portal/content.js
async function onRequestGet12(context2) {
  return publicContentResponse(context2.env);
}
var init_content2 = __esm({
  "api/portal/content.js"() {
    init_functionsRoutes_0_9741670341706992();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    init_content();
    __name(onRequestGet12, "onRequestGet");
  }
});

// ../shared/portal/activity.js
function configuredEndpoint(env2) {
  if (typeof env2.TAUTULLI_API_KEY !== "string" || !/^[a-zA-Z0-9_-]{16,256}$/.test(env2.TAUTULLI_API_KEY)) {
    throw new AuthError(503, "Viewing activity is not configured yet.");
  }
  let url;
  try {
    url = new URL(env2.TAUTULLI_URL || DEFAULT_TAUTULLI_URL);
  } catch {
    throw new AuthError(503, "Viewing activity is not configured yet.");
  }
  if (url.protocol !== "https:" || url.username || url.password || url.search || url.hash) {
    throw new AuthError(503, "Viewing activity is not configured yet.");
  }
  const root = url.pathname.replace(/\/+$/, "");
  url.pathname = root.endsWith("/api/v2") ? root : `${root}/api/v2`;
  return { url, apiKey: env2.TAUTULLI_API_KEY };
}
async function tautulliRequest(config2, command, parameters, fetcher) {
  const url = new URL(config2.url);
  url.searchParams.set("cmd", command);
  for (const [key, value] of Object.entries(parameters)) url.searchParams.set(key, value);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8e3);
  try {
    const response = await fetcher(url, {
      headers: { Accept: "application/json", "X-Api-Key": config2.apiKey },
      redirect: "error",
      signal: controller.signal
    });
    if (!response.ok) throw new Error("upstream status");
    const payload = await response.json();
    if (payload?.response?.result !== "success") throw new Error("upstream response");
    return payload.response.data;
  } finally {
    clearTimeout(timeout);
  }
}
function popularItems(data, statId) {
  const stats = Array.isArray(data) ? data : [data];
  const rows = stats.find((stat) => stat?.stat_id === statId)?.rows;
  if (!Array.isArray(rows)) return [];
  return rows.slice(0, 5).flatMap((row) => {
    const title2 = typeof row?.title === "string" ? row.title.trim().slice(0, 200) : "";
    if (!title2) return [];
    const year = /^\d{4}$/.test(String(row.year || "")) ? Number(row.year) : null;
    return [{ title: title2, year, plays: count3(row.total_plays), viewers: count3(row.users_watched) }];
  });
}
function watchTime(data, range) {
  if (!Array.isArray(data)) return null;
  const row = data.find((entry) => String(entry?.query_days) === range);
  return row ? { seconds: count3(row.total_time), plays: count3(row.total_plays) } : null;
}
async function tautulliUserId(config2, current, fetcher) {
  const candidate = String(current.tautulli_user_id || current.plex_id || "");
  const fallback = /^[1-9][0-9]{0,19}$/.test(candidate) ? candidate : "";
  try {
    const data = await tautulliRequest(config2, "get_users", {}, fetcher);
    const users = Array.isArray(data) ? data : [];
    const plexUsername = normalized(current.plex_username);
    const email = normalized(current.email);
    const match2 = users.find((item) => fallback && String(item?.user_id) === fallback) || users.find((item) => email && normalized(item?.email) === email) || users.find((item) => plexUsername && [item?.username, item?.friendly_name].some((value) => normalized(value) === plexUsername));
    const resolved = String(match2?.user_id || "");
    return /^[1-9][0-9]{0,19}$/.test(resolved) ? resolved : fallback;
  } catch (error3) {
    console.warn(JSON.stringify({ event: "tautulli_user_lookup_unavailable", errorType: error3 instanceof Error ? error3.name : typeof error3 }));
    return fallback;
  }
}
async function activityResponse(request, env2, fetcher = fetch) {
  try {
    const requestUrl = new URL(request.url);
    if (requestUrl.protocol !== "https:" && !["localhost", "127.0.0.1", "[::1]"].includes(requestUrl.hostname)) {
      throw new AuthError(400, "Account access requires HTTPS.");
    }
    if (request.method !== "GET") return reply({ message: "Method not allowed." }, 405, { Allow: "GET" });
    const requestedRange = requestUrl.searchParams.get("range");
    if (requestedRange && requestedRange !== ACTIVITY_RANGE) {
      throw new AuthError(400, "Viewing activity is fixed to the last 7 days.");
    }
    if (!env2.PORTAL_DB) throw new AuthError(503, "Account services are not configured yet. Please try again later.");
    const current = await sessionUser(env2.PORTAL_DB, request);
    if (!current) throw new AuthError(401, "Please sign in to view activity.");
    const config2 = configuredEndpoint(env2);
    const common = { grouping: "1", time_range: ACTIVITY_RANGE, stats_type: "plays", stats_count: "5" };
    const [moviesResult, showsResult, userId] = await Promise.all([
      tautulliRequest(config2, "get_home_stats", { ...common, stat_id: "popular_movies" }, fetcher),
      tautulliRequest(config2, "get_home_stats", { ...common, stat_id: "popular_tv" }, fetcher),
      tautulliUserId(config2, current, fetcher)
    ].map((promise) => Promise.resolve(promise).then((value) => ({ value }), (error3) => ({ error: error3 }))));
    const resolvedUserId = userId.value || "";
    let watchData = null;
    let watchError = null;
    if (resolvedUserId) {
      try {
        watchData = await tautulliRequest(
          config2,
          "get_user_watch_time_stats",
          { grouping: "1", query_days: ACTIVITY_RANGE, user_id: resolvedUserId },
          fetcher
        );
      } catch (error3) {
        watchError = error3;
      }
    }
    if (moviesResult.error && showsResult.error && (!resolvedUserId || watchError)) {
      throw moviesResult.error;
    }
    for (const [source, result] of [["movies", moviesResult], ["shows", showsResult]]) {
      if (result.error) console.warn(JSON.stringify({ event: "tautulli_partial_activity", source, errorType: result.error instanceof Error ? result.error.name : typeof result.error }));
    }
    if (watchError) console.warn(JSON.stringify({ event: "tautulli_partial_activity", source: "watch_time", errorType: watchError instanceof Error ? watchError.name : typeof watchError }));
    return reply({
      range: ACTIVITY_RANGE,
      periodLabel: ACTIVITY_LABEL,
      popularMovies: popularItems(moviesResult.value, "popular_movies"),
      popularShows: popularItems(showsResult.value, "popular_tv"),
      watchTime: resolvedUserId ? watchTime(watchData, ACTIVITY_RANGE) : null
    });
  } catch (error3) {
    if (!(error3 instanceof AuthError)) console.error(JSON.stringify({ event: "tautulli_activity_error", errorType: error3 instanceof Error ? error3.name : typeof error3 }));
    return reply(
      { message: error3 instanceof AuthError ? error3.message : "Viewing activity is temporarily unavailable. Please try again later." },
      error3 instanceof AuthError ? error3.status : 502
    );
  }
}
var DEFAULT_TAUTULLI_URL, ACTIVITY_RANGE, ACTIVITY_LABEL, count3, normalized;
var init_activity = __esm({
  "../shared/portal/activity.js"() {
    init_functionsRoutes_0_9741670341706992();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    init_auth();
    DEFAULT_TAUTULLI_URL = "https://tautulli.plexpoint.uk";
    ACTIVITY_RANGE = "7";
    ACTIVITY_LABEL = "Last 7 days";
    __name(configuredEndpoint, "configuredEndpoint");
    __name(tautulliRequest, "tautulliRequest");
    count3 = /* @__PURE__ */ __name((value) => {
      const parsed = Number(value);
      return Number.isFinite(parsed) && parsed >= 0 ? Math.floor(parsed) : 0;
    }, "count");
    __name(popularItems, "popularItems");
    __name(watchTime, "watchTime");
    normalized = /* @__PURE__ */ __name((value) => typeof value === "string" ? value.trim().toLowerCase() : "", "normalized");
    __name(tautulliUserId, "tautulliUserId");
    __name(activityResponse, "activityResponse");
  }
});

// api/portal/activity.js
async function onRequest5({ request, env: env2 }) {
  return activityResponse(request, env2);
}
var init_activity2 = __esm({
  "api/portal/activity.js"() {
    init_functionsRoutes_0_9741670341706992();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    init_activity();
    __name(onRequest5, "onRequest");
  }
});

// ../shared/portal/overseerr.js
function configuredOverseerr(env2) {
  const apiKey = typeof env2.OVERSEERR_API_KEY === "string" ? env2.OVERSEERR_API_KEY.trim() : "";
  if (!/^[A-Za-z0-9+/_=-]{16,512}$/.test(apiKey)) {
    throw new AuthError(503, "Recent requests are not configured yet.");
  }
  let root;
  try {
    root = new URL(env2.OVERSEERR_URL || DEFAULT_OVERSEERR_URL);
  } catch {
    throw new AuthError(503, "Recent requests are not configured yet.");
  }
  if (root.protocol !== "https:" || root.username || root.password || root.search || root.hash) {
    throw new AuthError(503, "Recent requests are not configured yet.");
  }
  root.pathname = root.pathname.replace(/\/+$/, "").replace(/\/api\/v1$/i, "") || "/";
  const apiBase = new URL(`${root.pathname.replace(/\/+$/, "")}/api/v1/`, root.origin);
  return { root, apiBase, apiKey };
}
async function overseerrJson(config2, path, search, fetcher) {
  const url = new URL(path.replace(/^\/+/, ""), config2.apiBase);
  for (const [key, value] of Object.entries(search || {})) url.searchParams.set(key, String(value));
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8e3);
  try {
    const response = await fetcher(url, {
      headers: { Accept: "application/json", "X-Api-Key": config2.apiKey },
      redirect: "error",
      signal: controller.signal
    });
    if (!response.ok) throw new Error("upstream status");
    const declaredLength = Number(response.headers.get("Content-Length") || 0);
    if (declaredLength > MAX_JSON_BYTES) throw new Error("upstream response too large");
    const text = await response.text();
    if (text.length > MAX_JSON_BYTES) throw new Error("upstream response too large");
    const data = JSON.parse(text);
    if (!data || typeof data !== "object") throw new Error("upstream response");
    return data;
  } finally {
    clearTimeout(timeout);
  }
}
async function findOverseerrUser(config2, account, fetcher) {
  const payload = await overseerrJson(config2, "user", { take: 100, skip: 0, sort: "created" }, fetcher);
  const users = Array.isArray(payload.results) ? payload.results : [];
  const email = normalized2(account.email);
  const plexUsername = normalized2(account.plex_username || account.plexUsername);
  return users.find((candidate) => email && normalized2(candidate?.email) === email) || users.find((candidate) => plexUsername && normalized2(candidate?.plexUsername) === plexUsername) || null;
}
function safeText(value, fallback, limit = 200) {
  const text = typeof value === "string" ? value.trim().replace(/[\x00-\x1f\x7f]/g, "") : "";
  return text ? text.slice(0, limit) : fallback;
}
function mediaType(media) {
  const type = normalized2(media?.mediaType || media?.type);
  if (type === "tv" || type === "show") return "tv";
  if (type === "movie") return "movie";
  return media?.tvdbId ? "tv" : "movie";
}
function requestStatus(request) {
  const mediaStatus = Number(request?.media?.status);
  if (mediaStatus === 5) return "added";
  if (mediaStatus === 4) return "partial";
  if (mediaStatus === 3) return "processing";
  if (mediaStatus === 6) return "removed";
  const status = Number(request?.status);
  if (status === 3) return "declined";
  if (status === 2) return "approved";
  if (status === 1) return "pending";
  return "unknown";
}
function safePoster(path) {
  return typeof path === "string" && /^\/[A-Za-z0-9._/-]{1,300}$/.test(path) ? `https://image.tmdb.org/t/p/w185${path}` : null;
}
function safeTimestamp(value) {
  const parsed = typeof value === "string" ? Date.parse(value) : NaN;
  return Number.isFinite(parsed) ? parsed : null;
}
async function requestDetails(config2, request, fetcher) {
  const media = request?.media && typeof request.media === "object" ? request.media : {};
  const type = mediaType(media);
  const tmdbId = Number(media.tmdbId);
  let details = media;
  if (Number.isInteger(tmdbId) && tmdbId > 0 && tmdbId <= 2147483647) {
    try {
      details = await overseerrJson(config2, `${type}/${tmdbId}`, {}, fetcher);
    } catch (error3) {
      console.warn(JSON.stringify({ event: "overseerr_request_detail_unavailable", mediaType: type, errorType: error3 instanceof Error ? error3.name : typeof error3 }));
    }
  }
  const title2 = safeText(
    details.title || details.name || media.title || media.name,
    type === "tv" ? "TV request" : "Movie request"
  );
  const date = details.releaseDate || details.firstAirDate || details.release_date || details.first_air_date;
  const yearMatch = typeof date === "string" ? date.match(/^\d{4}/) : null;
  return {
    id: Number.isFinite(Number(request?.id)) ? Number(request.id) : null,
    title: title2,
    type,
    year: yearMatch ? Number(yearMatch[0]) : null,
    requestedAt: safeTimestamp(request?.createdAt),
    status: requestStatus(request),
    posterUrl: safePoster(details.posterPath || details.poster_path || media.posterPath || media.poster_path)
  };
}
async function requestsResponse(request, env2, fetcher = fetch) {
  try {
    const url = new URL(request.url);
    if (url.protocol !== "https:" && !["localhost", "127.0.0.1", "[::1]"].includes(url.hostname)) {
      throw new AuthError(400, "Account access requires HTTPS.");
    }
    if (request.method !== "GET") return reply({ message: "Method not allowed." }, 405, { Allow: "GET" });
    if (!env2.PORTAL_DB) throw new AuthError(503, "Account services are not configured yet. Please try again later.");
    const current = await sessionUser(env2.PORTAL_DB, request);
    if (!current) throw new AuthError(401, "Please sign in to view requests.");
    const config2 = configuredOverseerr(env2);
    const overseerrUser = await findOverseerrUser(config2, current, fetcher);
    if (!overseerrUser || !Number.isInteger(Number(overseerrUser.id))) return reply({ requests: [] });
    const payload = await overseerrJson(config2, `user/${Number(overseerrUser.id)}/requests`, { take: 6, skip: 0 }, fetcher);
    const recent = Array.isArray(payload.results) ? payload.results.slice(0, 6) : [];
    return reply({ requests: await Promise.all(recent.map((item) => requestDetails(config2, item, fetcher))) });
  } catch (error3) {
    if (!(error3 instanceof AuthError)) console.error(JSON.stringify({ event: "overseerr_requests_error", errorType: error3 instanceof Error ? error3.name : typeof error3 }));
    return reply(
      { message: error3 instanceof AuthError ? error3.message : "Recent requests are temporarily unavailable. Please try again later." },
      error3 instanceof AuthError ? error3.status : 502
    );
  }
}
function safeAvatarSource(value, config2) {
  if (typeof value !== "string" || value.length > 2048) return null;
  try {
    const url = new URL(value, config2?.root || DEFAULT_OVERSEERR_URL);
    if (url.protocol !== "https:" || url.username || url.password || url.hash) return null;
    return url;
  } catch {
    return null;
  }
}
async function accountForAvatar(db, id) {
  const avatarSelect = await plexAvatarColumnAvailable(db) ? "p.avatar_url AS plex_avatar_url" : "NULL AS plex_avatar_url";
  return db.prepare(`SELECT u.id, u.email, p.username AS plex_username, ${avatarSelect}
    FROM users u LEFT JOIN plex_identities p ON p.user_id = u.id WHERE u.id = ?`).bind(id).first();
}
async function proxiedAvatar(source, config2, fetcher) {
  if (source.origin !== config2?.root.origin) {
    return new Response(null, { status: 302, headers: { Location: source.href, "Cache-Control": "private, no-store", Vary: "Cookie" } });
  }
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8e3);
  try {
    const response = await fetcher(source, {
      headers: { Accept: "image/avif,image/webp,image/png,image/jpeg,image/gif", "X-Api-Key": config2.apiKey },
      redirect: "error",
      signal: controller.signal
    });
    if (!response.ok) throw new Error("upstream status");
    const type = (response.headers.get("Content-Type") || "").split(";")[0].trim().toLowerCase();
    if (!(/* @__PURE__ */ new Set(["image/avif", "image/webp", "image/png", "image/jpeg", "image/gif"])).has(type)) throw new Error("unsupported avatar");
    const declaredLength = Number(response.headers.get("Content-Length") || 0);
    if (declaredLength > MAX_AVATAR_BYTES) throw new Error("avatar too large");
    const body = await response.arrayBuffer();
    if (body.byteLength > MAX_AVATAR_BYTES) throw new Error("avatar too large");
    return new Response(body, { headers: {
      "Content-Type": type,
      "Cache-Control": "private, max-age=300",
      "X-Content-Type-Options": "nosniff",
      Vary: "Cookie"
    } });
  } finally {
    clearTimeout(timeout);
  }
}
async function avatarResponse(request, env2, fetcher = fetch) {
  try {
    const url = new URL(request.url);
    if (url.protocol !== "https:" && !["localhost", "127.0.0.1", "[::1]"].includes(url.hostname)) {
      throw new AuthError(400, "Account access requires HTTPS.");
    }
    if (request.method !== "GET") return new Response(null, { status: 405, headers: { Allow: "GET" } });
    if (!env2.PORTAL_DB) throw new AuthError(503, "Account services are not configured yet. Please try again later.");
    const current = await sessionUser(env2.PORTAL_DB, request);
    if (!current) throw new AuthError(401, "Please sign in to view this profile picture.");
    const requestedId = url.searchParams.get("userId") || current.id;
    if (!/^[A-Za-z0-9-]{1,64}$/.test(requestedId)) throw new AuthError(400, "Invalid account.");
    if (requestedId !== current.id && !isAdminEmail(current.email)) throw new AuthError(403, "Administrator access is required.");
    const account = await accountForAvatar(env2.PORTAL_DB, requestedId);
    if (!account) throw new AuthError(404, "Profile picture not found.");
    let config2 = null;
    let overseerrAvatar = null;
    try {
      config2 = configuredOverseerr(env2);
      const overseerrUser = await findOverseerrUser(config2, account, fetcher);
      overseerrAvatar = safeAvatarSource(overseerrUser?.avatar, config2);
    } catch (error3) {
      console.warn(JSON.stringify({ event: "overseerr_avatar_fallback", errorType: error3 instanceof Error ? error3.name : typeof error3 }));
    }
    const source = overseerrAvatar || safeAvatarSource(account.plex_avatar_url, null);
    if (!source) throw new AuthError(404, "Profile picture not found.");
    if (source.origin === config2?.root.origin) return await proxiedAvatar(source, config2, fetcher);
    return new Response(null, { status: 302, headers: { Location: source.href, "Cache-Control": "private, no-store", Vary: "Cookie" } });
  } catch (error3) {
    if (!(error3 instanceof AuthError)) console.error(JSON.stringify({ event: "portal_avatar_error", errorType: error3 instanceof Error ? error3.name : typeof error3 }));
    return reply(
      { message: error3 instanceof AuthError ? error3.message : "Profile picture is temporarily unavailable." },
      error3 instanceof AuthError ? error3.status : 502
    );
  }
}
var DEFAULT_OVERSEERR_URL, MAX_JSON_BYTES, MAX_AVATAR_BYTES, normalized2;
var init_overseerr = __esm({
  "../shared/portal/overseerr.js"() {
    init_functionsRoutes_0_9741670341706992();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    init_auth();
    DEFAULT_OVERSEERR_URL = "https://request.plexpoint.uk";
    MAX_JSON_BYTES = 1e6;
    MAX_AVATAR_BYTES = 2e6;
    __name(configuredOverseerr, "configuredOverseerr");
    __name(overseerrJson, "overseerrJson");
    normalized2 = /* @__PURE__ */ __name((value) => typeof value === "string" ? value.trim().toLowerCase() : "", "normalized");
    __name(findOverseerrUser, "findOverseerrUser");
    __name(safeText, "safeText");
    __name(mediaType, "mediaType");
    __name(requestStatus, "requestStatus");
    __name(safePoster, "safePoster");
    __name(safeTimestamp, "safeTimestamp");
    __name(requestDetails, "requestDetails");
    __name(requestsResponse, "requestsResponse");
    __name(safeAvatarSource, "safeAvatarSource");
    __name(accountForAvatar, "accountForAvatar");
    __name(proxiedAvatar, "proxiedAvatar");
    __name(avatarResponse, "avatarResponse");
  }
});

// api/portal/avatar.js
async function onRequest6({ request, env: env2 }) {
  return avatarResponse(request, env2);
}
var init_avatar = __esm({
  "api/portal/avatar.js"() {
    init_functionsRoutes_0_9741670341706992();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    init_overseerr();
    __name(onRequest6, "onRequest");
  }
});

// api/portal/billing.js
async function onRequest7({ request, env: env2 }) {
  return billingResponse(request, env2);
}
var init_billing3 = __esm({
  "api/portal/billing.js"() {
    init_functionsRoutes_0_9741670341706992();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    init_billing();
    __name(onRequest7, "onRequest");
  }
});

// api/portal/requests.js
async function onRequest8({ request, env: env2 }) {
  return requestsResponse(request, env2);
}
var init_requests = __esm({
  "api/portal/requests.js"() {
    init_functionsRoutes_0_9741670341706992();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    init_overseerr();
    __name(onRequest8, "onRequest");
  }
});

// ../.wrangler/tmp/pages-qhwnKY/functionsRoutes-0.9741670341706992.mjs
var routes;
var init_functionsRoutes_0_9741670341706992 = __esm({
  "../.wrangler/tmp/pages-qhwnKY/functionsRoutes-0.9741670341706992.mjs"() {
    init_billing2();
    init_users();
    init_action();
    init_action2();
    init_anime_movies();
    init_anime_shows();
    init_collections();
    init_counts();
    init_featured_collection();
    init_image();
    init_movies();
    init_sections();
    init_shows();
    init_status();
    init_top_rated();
    init_content2();
    init_activity2();
    init_avatar();
    init_billing3();
    init_requests();
    routes = [
      {
        routePath: "/api/portal/admin/billing",
        mountPath: "/api/portal/admin",
        method: "",
        middlewares: [],
        modules: [onRequest]
      },
      {
        routePath: "/api/portal/admin/users",
        mountPath: "/api/portal/admin",
        method: "",
        middlewares: [],
        modules: [onRequest2]
      },
      {
        routePath: "/api/portal/auth/:action",
        mountPath: "/api/portal/auth",
        method: "",
        middlewares: [],
        modules: [onRequest3]
      },
      {
        routePath: "/api/portal/plex/:action",
        mountPath: "/api/portal/plex",
        method: "",
        middlewares: [],
        modules: [onRequest4]
      },
      {
        routePath: "/api/plex/anime-movies",
        mountPath: "/api/plex",
        method: "GET",
        middlewares: [],
        modules: [onRequestGet]
      },
      {
        routePath: "/api/plex/anime-shows",
        mountPath: "/api/plex",
        method: "GET",
        middlewares: [],
        modules: [onRequestGet2]
      },
      {
        routePath: "/api/plex/collections",
        mountPath: "/api/plex",
        method: "GET",
        middlewares: [],
        modules: [onRequestGet3]
      },
      {
        routePath: "/api/plex/counts",
        mountPath: "/api/plex",
        method: "GET",
        middlewares: [],
        modules: [onRequestGet4]
      },
      {
        routePath: "/api/plex/featured-collection",
        mountPath: "/api/plex",
        method: "GET",
        middlewares: [],
        modules: [onRequestGet5]
      },
      {
        routePath: "/api/plex/image",
        mountPath: "/api/plex",
        method: "GET",
        middlewares: [],
        modules: [onRequestGet6]
      },
      {
        routePath: "/api/plex/movies",
        mountPath: "/api/plex",
        method: "GET",
        middlewares: [],
        modules: [onRequestGet7]
      },
      {
        routePath: "/api/plex/sections",
        mountPath: "/api/plex",
        method: "GET",
        middlewares: [],
        modules: [onRequestGet8]
      },
      {
        routePath: "/api/plex/shows",
        mountPath: "/api/plex",
        method: "GET",
        middlewares: [],
        modules: [onRequestGet9]
      },
      {
        routePath: "/api/plex/status",
        mountPath: "/api/plex",
        method: "GET",
        middlewares: [],
        modules: [onRequestGet10]
      },
      {
        routePath: "/api/plex/top-rated",
        mountPath: "/api/plex",
        method: "GET",
        middlewares: [],
        modules: [onRequestGet11]
      },
      {
        routePath: "/api/portal/content",
        mountPath: "/api/portal",
        method: "GET",
        middlewares: [],
        modules: [onRequestGet12]
      },
      {
        routePath: "/api/portal/activity",
        mountPath: "/api/portal",
        method: "",
        middlewares: [],
        modules: [onRequest5]
      },
      {
        routePath: "/api/portal/avatar",
        mountPath: "/api/portal",
        method: "",
        middlewares: [],
        modules: [onRequest6]
      },
      {
        routePath: "/api/portal/billing",
        mountPath: "/api/portal",
        method: "",
        middlewares: [],
        modules: [onRequest7]
      },
      {
        routePath: "/api/portal/requests",
        mountPath: "/api/portal",
        method: "",
        middlewares: [],
        modules: [onRequest8]
      }
    ];
  }
});

// ../node_modules/wrangler/templates/pages-template-worker.ts
init_functionsRoutes_0_9741670341706992();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();

// ../node_modules/path-to-regexp/dist.es2015/index.js
init_functionsRoutes_0_9741670341706992();
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
          code >= 48 && code <= 57 || // `A-Z`
          code >= 65 && code <= 90 || // `a-z`
          code >= 97 && code <= 122 || // `_`
          code === 95
        ) {
          name += str[j++];
          continue;
        }
        break;
      }
      if (!name)
        throw new TypeError("Missing parameter name at ".concat(i));
      tokens.push({ type: "NAME", index: i, value: name });
      i = j;
      continue;
    }
    if (char === "(") {
      var count4 = 1;
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
          count4--;
          if (count4 === 0) {
            j++;
            break;
          }
        } else if (str[j] === "(") {
          count4++;
          if (str[j + 1] !== "?") {
            throw new TypeError("Capturing groups are not allowed at ".concat(j));
          }
        }
        pattern += str[j++];
      }
      if (count4)
        throw new TypeError("Unbalanced pattern at ".concat(i));
      if (!pattern)
        throw new TypeError("Missing pattern at ".concat(i));
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
  var _a = options.prefixes, prefixes = _a === void 0 ? "./" : _a, _b = options.delimiter, delimiter = _b === void 0 ? "/#?" : _b;
  var result = [];
  var key = 0;
  var i = 0;
  var path = "";
  var tryConsume = /* @__PURE__ */ __name(function(type) {
    if (i < tokens.length && tokens[i].type === type)
      return tokens[i++].value;
  }, "tryConsume");
  var mustConsume = /* @__PURE__ */ __name(function(type) {
    var value2 = tryConsume(type);
    if (value2 !== void 0)
      return value2;
    var _a2 = tokens[i], nextType = _a2.type, index = _a2.index;
    throw new TypeError("Unexpected ".concat(nextType, " at ").concat(index, ", expected ").concat(type));
  }, "mustConsume");
  var consumeText = /* @__PURE__ */ __name(function() {
    var result2 = "";
    var value2;
    while (value2 = tryConsume("CHAR") || tryConsume("ESCAPED_CHAR")) {
      result2 += value2;
    }
    return result2;
  }, "consumeText");
  var isSafe = /* @__PURE__ */ __name(function(value2) {
    for (var _i = 0, delimiter_1 = delimiter; _i < delimiter_1.length; _i++) {
      var char2 = delimiter_1[_i];
      if (value2.indexOf(char2) > -1)
        return true;
    }
    return false;
  }, "isSafe");
  var safePattern = /* @__PURE__ */ __name(function(prefix2) {
    var prev = result[result.length - 1];
    var prevText = prefix2 || (prev && typeof prev === "string" ? prev : "");
    if (prev && !prevText) {
      throw new TypeError('Must have text between two parameters, missing text after "'.concat(prev.name, '"'));
    }
    if (!prevText || isSafe(prevText))
      return "[^".concat(escapeString(delimiter), "]+?");
    return "(?:(?!".concat(escapeString(prevText), ")[^").concat(escapeString(delimiter), "])+?");
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
        modifier: tryConsume("MODIFIER") || ""
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
        modifier: tryConsume("MODIFIER") || ""
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
  var _a = options.decode, decode = _a === void 0 ? function(x) {
    return x;
  } : _a;
  return function(pathname) {
    var m = re.exec(pathname);
    if (!m)
      return false;
    var path = m[0], index = m.index;
    var params = /* @__PURE__ */ Object.create(null);
    var _loop_1 = /* @__PURE__ */ __name(function(i2) {
      if (m[i2] === void 0)
        return "continue";
      var key = keys[i2 - 1];
      if (key.modifier === "*" || key.modifier === "+") {
        params[key.name] = m[i2].split(key.prefix + key.suffix).map(function(value) {
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
  if (!keys)
    return path;
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
      pattern: ""
    });
    execResult = groupsRegex.exec(path.source);
  }
  return path;
}
__name(regexpToRegexp, "regexpToRegexp");
function arrayToRegexp(paths, keys, options) {
  var parts = paths.map(function(path) {
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
  var _a = options.strict, strict = _a === void 0 ? false : _a, _b = options.start, start2 = _b === void 0 ? true : _b, _c = options.end, end = _c === void 0 ? true : _c, _d = options.encode, encode = _d === void 0 ? function(x) {
    return x;
  } : _d, _e = options.delimiter, delimiter = _e === void 0 ? "/#?" : _e, _f = options.endsWith, endsWith = _f === void 0 ? "" : _f;
  var endsWithRe = "[".concat(escapeString(endsWith), "]|$");
  var delimiterRe = "[".concat(escapeString(delimiter), "]");
  var route = start2 ? "^" : "";
  for (var _i = 0, tokens_1 = tokens; _i < tokens_1.length; _i++) {
    var token = tokens_1[_i];
    if (typeof token === "string") {
      route += escapeString(encode(token));
    } else {
      var prefix = escapeString(encode(token.prefix));
      var suffix = escapeString(encode(token.suffix));
      if (token.pattern) {
        if (keys)
          keys.push(token);
        if (prefix || suffix) {
          if (token.modifier === "+" || token.modifier === "*") {
            var mod = token.modifier === "*" ? "?" : "";
            route += "(?:".concat(prefix, "((?:").concat(token.pattern, ")(?:").concat(suffix).concat(prefix, "(?:").concat(token.pattern, "))*)").concat(suffix, ")").concat(mod);
          } else {
            route += "(?:".concat(prefix, "(").concat(token.pattern, ")").concat(suffix, ")").concat(token.modifier);
          }
        } else {
          if (token.modifier === "+" || token.modifier === "*") {
            throw new TypeError('Can not repeat "'.concat(token.name, '" without a prefix and suffix'));
          }
          route += "(".concat(token.pattern, ")").concat(token.modifier);
        }
      } else {
        route += "(?:".concat(prefix).concat(suffix, ")").concat(token.modifier);
      }
    }
  }
  if (end) {
    if (!strict)
      route += "".concat(delimiterRe, "?");
    route += !options.endsWith ? "$" : "(?=".concat(endsWithRe, ")");
  } else {
    var endToken = tokens[tokens.length - 1];
    var isEndDelimited = typeof endToken === "string" ? delimiterRe.indexOf(endToken[endToken.length - 1]) > -1 : endToken === void 0;
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
  if (path instanceof RegExp)
    return regexpToRegexp(path, keys);
  if (Array.isArray(path))
    return arrayToRegexp(path, keys, options);
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
      end: false
    });
    const mountMatcher = match(route.mountPath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const matchResult = routeMatcher(requestPath);
    const mountMatchResult = mountMatcher(requestPath);
    if (matchResult && mountMatchResult) {
      for (const handler of route.middlewares.flat()) {
        yield {
          handler,
          params: matchResult.params,
          path: mountMatchResult.path
        };
      }
    }
  }
  for (const route of routes) {
    if (route.method && route.method !== request.method) {
      continue;
    }
    const routeMatcher = match(route.routePath.replace(escapeRegex, "\\$&"), {
      end: true
    });
    const mountMatcher = match(route.mountPath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const matchResult = routeMatcher(requestPath);
    const mountMatchResult = mountMatcher(requestPath);
    if (matchResult && mountMatchResult && route.modules.length) {
      for (const handler of route.modules.flat()) {
        yield {
          handler,
          params: matchResult.params,
          path: matchResult.path
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
          }, "passThroughOnException")
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
  }
};
var cloneResponse = /* @__PURE__ */ __name((response) => (
  // https://fetch.spec.whatwg.org/#null-body-status
  new Response(
    [101, 204, 205, 304].includes(response.status) ? null : response.body,
    response
  )
), "cloneResponse");
export {
  pages_template_worker_default as default
};
