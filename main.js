/**
 * engine-hopper — 引擎接力
 * 在同一对话中随时切换引擎与模型：从宿主 app.db 只读提取统一时间线，
 * 智能分层生成交接上下文，经宿主 agent 管线在新引擎开/续会话并自动跳转。
 * 单文件 ESM：禁止任何 import；组件一律用 ctx.react.createElement。
 */

/* ============================== i18n ============================== */

const ZH = {
  chip: "接力",
  chipTitle: "切换引擎/模型并承接完整对话上下文",
  popTitle: "切换引擎 / 模型",
  currentLabel: "当前会话",
  currentUnknown: "未识别（先打开一个已有会话，或切换一次会话标签）",
  currentEmpty: "当前会话还没有对话内容，可直接用宿主新建会话选择目标引擎。",
  targetEngine: "目标引擎",
  targetModel: "模型",
  modelDefault: "引擎默认（沿用该引擎当前模型）",
  noEngines: "宿主未返回可用引擎。",
  resumeTitle: "该引擎在接力链中已有会话",
  resumeExisting: "续接既有会话（只交接新增内容）",
  resumeNew: "新建会话（完整交接）",
  modeTitle: "交接方式",
  modeLayered: "智能分层（近期原文 + 早期压缩）",
  modeFull: "全文原样交接",
  start: "开始接力",
  cancel: "关闭",
  busyExtract: "正在读取对话记录…",
  busyStart: "正在启动新引擎会话…",
  busyJump: "正在跳转…",
  errNeedSession: "未识别当前会话，无法接力。",
  errSameEngine: "目标引擎与当前相同；同引擎换模型请直接用输入框上方宿主选择器，历史天然连续。",
  errEngineDown: "目标引擎不可用或未启用。",
  errNoMessages: "当前（链）没有可交接的对话内容。",
  okJumped: "已跳转到新会话，引擎正在吸收上下文。",
  okJumpOnly: "无新增内容，已直接跳回该会话。",
  runningWarn: "当前会话正在生成回复，交接将不含这次未完成的回答。",
  handoffLogTitle: "接力记录",
  chainTitle: "接力链",
  chainEmpty: "当前会话不在任何接力链中。完成一次接力后，这里会列出整条链。",
  hopNow: "当前",
  hopJump: "跳转",
  hopMsgs: "条消息",
  settingsTitle: "引擎接力",
  stDbPath: "宿主数据文件 app.db 路径（留空 = 自动探测）",
  stLayering: "长对话启用智能分层（关闭则始终全文交接）",
  stRecent: "近期原文保留条数",
  stMaxChars: "交接上下文最大字符数",
  stPerOld: "早期消息每条压缩上限（字符）",
  stSave: "保存设置",
  stSaved: "已保存。",
  stDbDetected: "自动探测结果",
  stDbFail: "自动探测失败，请手动填写 app.db 绝对路径。",
  statusChain: "接力",
  cmdPrev: "引擎接力：跳回接力链上一会话",
  cmdSettings: "引擎接力：打开设置",
  privacyNote: "数据边界：对话内容只在本地读取与拼接，经宿主引擎管线发送给你自己选择的目标引擎；本插件不发起任何网络请求。",
  sameEngineHint: "提示：同引擎换模型不需要接力，宿主选择器原生支持且历史连续。",
  colTime: "时间",
  colFromTo: "路径",
  colChars: "交接字符",
};

const EN = {
  chip: "Hop",
  chipTitle: "Switch engine/model with full conversation carry-over",
  popTitle: "Switch engine / model",
  currentLabel: "Current session",
  currentUnknown: "Unknown (open an existing session or switch tabs once)",
  currentEmpty: "Current session has no messages yet; just start a new host session on the target engine.",
  targetEngine: "Target engine",
  targetModel: "Model",
  modelDefault: "Engine default (keep its current model)",
  noEngines: "Host returned no usable engines.",
  resumeTitle: "This engine already has a session in the relay chain",
  resumeExisting: "Resume it (incremental handoff)",
  resumeNew: "Start a new session (full handoff)",
  modeTitle: "Handoff mode",
  modeLayered: "Smart layered (recent verbatim + earlier compacted)",
  modeFull: "Full verbatim",
  start: "Start hop",
  cancel: "Close",
  busyExtract: "Reading conversation…",
  busyStart: "Starting session on new engine…",
  busyJump: "Jumping…",
  errNeedSession: "Current session unknown; cannot hop.",
  errSameEngine: "Same engine. For model-only changes use the host composer selector; history continues natively.",
  errEngineDown: "Target engine unavailable or disabled.",
  errNoMessages: "Nothing to hand off in the current chain.",
  okJumped: "Jumped to the new session; the engine is absorbing the context.",
  okJumpOnly: "No new messages; jumped back directly.",
  runningWarn: "The current session is still generating; the in-flight reply will not be included.",
  handoffLogTitle: "Handoff log",
  chainTitle: "Relay chain",
  chainEmpty: "Current session is not in any relay chain. It appears here after your first hop.",
  hopNow: "current",
  hopJump: "Jump",
  hopMsgs: "messages",
  settingsTitle: "Engine Hopper",
  stDbPath: "Path to host app.db (empty = auto-detect)",
  stLayering: "Smart layering for long conversations (off = always verbatim)",
  stRecent: "Recent messages kept verbatim",
  stMaxChars: "Max handoff characters",
  stPerOld: "Per-message cap for compacted messages (chars)",
  stSave: "Save settings",
  stSaved: "Saved.",
  stDbDetected: "Auto-detect result",
  stDbFail: "Auto-detect failed; enter the absolute path of app.db.",
  statusChain: "Relay",
  cmdPrev: "Engine Hopper: jump to previous session in chain",
  cmdSettings: "Engine Hopper: open settings",
  privacyNote: "Data boundary: messages are read and assembled locally only, then sent through the host engine pipeline to the engine you chose. This plugin makes no network requests.",
  sameEngineHint: "Tip: model-only switches within one engine need no hop; the host selector keeps history natively.",
  colTime: "Time",
  colFromTo: "Path",
  colChars: "Chars",
};

function pickT(locale) {
  return (locale || "").toLowerCase().startsWith("zh") ? ZH : EN;
}

/* ====================== pure helpers (unit-testable) ====================== */

/** 合成交接消息的稳定前缀：用于在再次接力时识别并剔除，避免上下文自我嵌套。 */
const MARKER = "⟦ENGINE-HOP v1⟧";

function sessionKey(engine, sessionId) {
  return engine + "/" + sessionId;
}

function isSyntheticText(text) {
  return typeof text === "string" && text.startsWith(MARKER);
}

/**
 * 过滤一条会话消息列表中的合成内容：
 * 剔除交接消息本身，以及紧随其后引擎自动生成的那条确认回复（ack）。
 */
function organicMessages(messages) {
  const out = [];
  const list = Array.isArray(messages) ? messages : [];
  for (let i = 0; i < list.length; i++) {
    const m = list[i];
    if (m && isSyntheticText(m.text)) {
      if (list[i + 1] && list[i + 1].role === "assistant") i++;
      continue;
    }
    if (m && typeof m.text === "string" && m.text.length > 0) out.push(m);
  }
  return out;
}

/**
 * 装配接力链全局时间线：按 hop 顺序拼接各会话的自然消息，
 * 每条标注来源引擎/模型/hop 序号。
 * hopDatas: [{ hop:{engine,model}, messages:[...] }, ...] 按链顺序。
 */
function assembleTimeline(hopDatas) {
  const timeline = [];
  (hopDatas || []).forEach((hd, idx) => {
    for (const m of organicMessages(hd && hd.messages)) {
      timeline.push({
        role: m.role || "user",
        text: m.text,
        ts: typeof m.ts_ms === "number" ? m.ts_ms : (typeof m.ts === "number" ? m.ts : 0),
        engine: hd && hd.hop ? hd.hop.engine : "",
        model: hd && hd.hop ? hd.hop.model || "" : "",
        hop: idx,
      });
    }
  });
  return timeline;
}

function truncateMiddle(text, cap) {
  if (typeof text !== "string") return "";
  if (text.length <= cap) return text;
  if (cap < 24) return text.slice(0, cap);
  const head = Math.floor(cap * 0.6);
  const tail = cap - head - 12;
  return text.slice(0, head) + " …⟦…⟧… " + text.slice(text.length - tail);
}

function roleLabel(role, zh) {
  if (role === "user") return zh ? "用户" : "user";
  if (role === "assistant") return zh ? "助手" : "assistant";
  return role || "msg";
}

/**
 * 生成交接提示词。
 * opts: {
 *   toEngine, toModel, chainDesc, incrementalFromLabel,
 *   timeline, settings:{layering,recentTurns,maxChars,perOld}, zh
 * }
 * 返回 { prompt, stats:{total, verbatim, compacted, omitted, chars} }
 */
function buildHandoff(opts) {
  const zh = opts.zh !== false;
  const st = opts.settings || {};
  const maxChars = Math.max(2000, st.maxChars || 24000);
  const recentTurns = Math.max(1, st.recentTurns || 6);
  const layering = st.layering !== false;
  let perOld = Math.max(120, st.perOld || 500);
  const tl = Array.isArray(opts.timeline) ? opts.timeline : [];

  const header =
    MARKER + (zh
      ? " 这是一条由「引擎接力」插件自动生成的跨引擎上下文交接消息，不是你的用户刚刚输入的新指令。\n"
      : " This is an automated cross-engine context handoff generated by the Engine Hopper plugin, not a fresh instruction from the user.\n");
  const chainLine = (zh ? "【接力链】" : "[Chain] ") + (opts.chainDesc || "") + "\n";
  const roleLine = zh
    ? "【你的角色】你现在是引擎 " + opts.toEngine + (opts.toModel ? "，模型 " + opts.toModel : "") + "。请基于以下上下文无缝继续之前的任务。\n"
    : "[Your role] You are now engine " + opts.toEngine + (opts.toModel ? " with model " + opts.toModel : "") + ". Continue the previous task seamlessly from the context below.\n";
  const incLine = opts.incrementalFromLabel
    ? (zh ? "【交接范围】增量交接：仅包含自 " + opts.incrementalFromLabel + " 之后的新增对话。\n"
         : "[Scope] Incremental: only messages after " + opts.incrementalFromLabel + ".\n")
    : (zh ? "【交接范围】完整交接：包含接力链全部自然对话。\n"
         : "[Scope] Full handoff: every organic message in the relay chain.\n");
  // 只交接用户可见对话（user/assistant）；thinking/tool 属引擎内部过程，计数后在范围行透明标注
  const skippedInternal = tl.filter((m) => m.role !== "user" && m.role !== "assistant").length;
  const skipLine = skippedInternal > 0
    ? (zh ? "【说明】源会话另有 " + skippedInternal + " 条工具调用/思考过程记录，属引擎内部过程，未包含在交接中。\n"
         : "[Note] " + skippedInternal + " tool/thinking records were engine-internal and are not included.\n")
    : "";
  const work0 = tl.filter((m) => m.role === "user" || m.role === "assistant");
  const footer = zh
    ? "\n═══ 交接结束 ═══\n请先用不超过 200 字向用户确认三件事：①你理解的当前进展 ②未完成事项 ③关键约束；然后停下来等待用户继续。不要在此刻擅自开始执行任务本身。"
    : "\n═══ End of handoff ═══\nFirst confirm to the user in under 200 words: 1) progress as you understand it, 2) what remains, 3) key constraints. Then stop and wait for the user. Do not start executing the task itself yet.";

  // 预算自适应：超限就逐级压缩 perOld，再不行才省略最早的消息
  let omitted = 0;
  let work = work0;
  for (;;) {
    const verbatimCount = layering ? Math.min(recentTurns, work.length) : work.length;
    const split = work.length - verbatimCount;
    const parts = [header, chainLine, roleLine, incLine, skipLine];
    if (layering && split > 0) {
      parts.push(zh ? "\n═══ 早期对话（已压缩） ═══\n" : "\n=== Earlier messages (compacted) ===\n");
      work.slice(0, split).forEach((m, i) => {
        parts.push("[#" + (i + 1) + " " + roleLabel(m.role, zh) + (m.engine ? " · " + m.engine : "") + "] " + truncateMiddle(m.text, perOld) + "\n");
      });
      if (verbatimCount > 0) parts.push(zh ? "═══ 最近对话（原文） ═══\n" : "=== Recent messages (verbatim) ===\n");
    } else {
      parts.push(zh ? "\n═══ 对话记录（原文） ═══\n" : "\n=== Conversation (verbatim) ===\n");
    }
    work.slice(split).forEach((m, i) => {
      parts.push("[#" + (split + i + 1) + " " + roleLabel(m.role, zh) + (m.engine ? " · " + m.engine : "") + "] " + m.text + "\n");
    });
    const body = parts.join("");
    const prompt = body + footer;
    if (prompt.length <= maxChars) {
      return { prompt, stats: { total: work0.length, skippedInternal, verbatim: work.length - split, compacted: split, omitted, chars: prompt.length } };
    }
    if (perOld > 160) { perOld = Math.floor(perOld / 2); continue; }
    if (work.length > recentTurns + 1) {
      // 省略最早一条（保留近期原文）
      omitted += 1;
      work = work.slice(1);
      continue;
    }
    // 近期原文本身就超预算：硬截断正文
    const hard = body.slice(0, Math.max(0, maxChars - footer.length - 40)) + (zh ? "\n…⟦因预算限制后续内容被截断⟧" : "\n…[truncated for budget]");
    return { prompt: hard + footer, stats: { total: work0.length, skippedInternal, verbatim: 0, compacted: 0, omitted, chars: hard.length + footer.length } };
  }
}

/** 计算相对某 hop 的增量时间线：该 hop 之后各 hop（含当前会话）的自然消息。 */
function incrementalTimeline(hopDatas, fromHopIndex) {
  return assembleTimeline((hopDatas || []).slice(fromHopIndex + 1));
}

/* ============ node helper（经 exec:node 只读 app.db，无 fs 直读能力） ============ */
/* 注意：此字符串内禁止出现反引号与 ${，避免与外层模板冲突。 */
const HELPER_JS = [
  "const fs=require('node:fs'),os=require('node:os'),path=require('node:path');",
  "const mode=process.argv[1]||'detect';",
  "function out(o){process.stdout.write(JSON.stringify(o));}",
  "function fail(m){process.stderr.write(String(m));process.exit(2);}",
  "function readable(p){try{fs.accessSync(p,fs.constants.R_OK);return true;}catch(e){return false;}}",
  "function candidates(){",
  "  const list=[];",
  "  try{const pj=JSON.parse(fs.readFileSync(path.join(process.cwd(),'portable-data.json'),'utf8'));if(pj.appHome)list.push(path.join(pj.appHome,'app.db'));}catch(e){}",
  "  if(process.env.APPDATA)list.push(path.join(process.env.APPDATA,'com.zhukunpenglinyutong.ccgui','app.db'));",
  "  list.push(path.join(os.homedir(),'.ccgui-next','app.db'));",
  "  return list;",
  "}",
  "let DatabaseSync=null;",
  "try{DatabaseSync=require('node:sqlite').DatabaseSync;}catch(e){}",
  "if(!DatabaseSync){",
  "  if(process.env.EH_R!=='1'&&process.env.EH_SRC){",
  "    const r=require('node:child_process').spawnSync(process.execPath,['--experimental-sqlite','-e',process.env.EH_SRC].concat(process.argv.slice(1)),{stdio:'inherit',env:Object.assign({},process.env,{EH_R:'1'})});",
  "    process.exit(r.status==null?1:r.status);",
  "  }",
  "  fail('node:sqlite unavailable (need node >=22.5)');",
  "}",
  "function openDb(p){",
  "  try{return new DatabaseSync(p,{readOnly:true});}",
  "  catch(e){return new DatabaseSync(p);}",
  "}",
  "function readSession(db,engine,sid){",
  "  let s=null;",
  "  try{s=db.prepare('SELECT engine,session_id,workspace_path,title,created_at,updated_at,message_count FROM sessions WHERE engine=? AND session_id=?').get(engine,sid)||null;}catch(e){}",
  "  let msgs=[];",
  "  try{msgs=db.prepare('SELECT seq,role,text,ts_ms FROM session_messages WHERE engine=? AND session_id=? ORDER BY seq').all(engine,sid);}catch(e){}",
  "  let effort=null,model=null,providerId=null;",
  "  try{const r=db.prepare('SELECT effort FROM session_efforts WHERE engine=? AND session_id=?').get(engine,sid);effort=r?r.effort:null;}catch(e){}",
  "  try{const r=db.prepare('SELECT model FROM session_models WHERE engine=? AND session_id=?').get(engine,sid);model=r?r.model:null;}catch(e){}",
  "  try{const r=db.prepare('SELECT provider_id FROM session_providers WHERE engine=? AND session_id=?').get(engine,sid);providerId=r?r.provider_id:null;}catch(e){}",
  "  return {session:s,messages:msgs,effort:effort,model:model,providerId:providerId};",
  "}",
  "if(mode==='detect'){",
  "  const ov=process.argv[2];",
  "  if(ov&&ov!=='auto'){if(!readable(ov))fail('db not readable: '+ov);out({ok:true,dbPath:ov});process.exit(0);}",
  "  const cs=candidates();for(let i=0;i<cs.length;i++){if(readable(cs[i])){out({ok:true,dbPath:cs[i]});process.exit(0);}}",
  "  fail('no app.db found in: '+cs.join(' | '));",
  "}else if(mode==='session'){",
  "  const db=openDb(process.argv[2]);",
  "  out({ok:true,data:readSession(db,process.argv[3],process.argv[4])});",
  "  try{db.close();}catch(e){}",
  "}else if(mode==='chain'){",
  "  const db=openDb(process.argv[2]);",
  "  const pairs=JSON.parse(process.argv[3]);",
  "  const data=[];",
  "  for(let i=0;i<pairs.length;i++){data.push({engine:pairs[i][0],sessionId:pairs[i][1],data:readSession(db,pairs[i][0],pairs[i][1])});}",
  "  out({ok:true,data:data});",
  "  try{db.close();}catch(e){}",
  "}else fail('unknown mode: '+mode);",
].join("\n");

/* ============================== store ============================== */

const DEFAULT_SETTINGS = {
  dbPath: "",
  layering: true,
  recentTurns: 6,
  maxChars: 24000,
  perOld: 500,
};

class HopStore {
  constructor(ctx, t) {
    this.ctx = ctx;
    this.t = t;
    this.listeners = new Set();
    this.disposed = false;
    this.state = {
      loaded: false,
      busy: "",           // "" | "extract" | "start" | "jump"
      error: "",
      notice: "",
      current: null,      // {engine, sessionId}
      running: {},        // sessionKey -> true（有未完成 run）
      engines: [],        // [{id,name,available,enabled,models:[{id,name}]}]
      catalogError: "",
      chain: null,        // {id, hops:[{engine,sessionId,workspacePath,model,at,msgCount,chars}]}
      settings: { ...DEFAULT_SETTINGS },
      dbPathDetected: "",
      log: [],            // [{at, from, to, chars}]
    };
    this.bySession = {};  // sessionKey -> chainId
    this.chains = {};     // chainId -> chain
    this.subscribe = (fn) => { this.listeners.add(fn); return () => this.listeners.delete(fn); };
    this.getSnapshot = () => this.state;
  }

  set(patch) {
    if (this.disposed) return;
    this.state = { ...this.state, ...patch };
    for (const fn of this.listeners) fn();
  }

  async init() {
    try {
      const [settings, chains, log] = await Promise.all([
        this.ctx.storage.get("settings"),
        this.ctx.storage.get("chains"),
        this.ctx.storage.get("handoffLog"),
      ]);
      if (settings && typeof settings === "object") {
        this.set({ settings: { ...DEFAULT_SETTINGS, ...settings } });
      }
      if (chains && typeof chains === "object") {
        this.chains = chains.chains || {};
        this.bySession = chains.bySession || {};
      }
      if (Array.isArray(log)) this.set({ log: log.slice(-50) });
    } catch (e) {
      this.set({ error: String(e && e.message || e) });
    }
    await this.refreshCatalog();
    await this.detectDb();
    this.set({ loaded: true });
  }

  async detectDb() {
    const override = this.state.settings.dbPath;
    try {
      const r = await this.runHelper(["detect", override || "auto"]);
      this.set({ dbPathDetected: r.dbPath || "", error: "" });
    } catch (e) {
      this.set({ dbPathDetected: "", error: this.t.stDbFail + " " + errText(e) });
    }
  }

  dbPath() {
    return this.state.settings.dbPath || this.state.dbPathDetected;
  }

  async runHelper(args, timeoutMs) {
    const r = await this.ctx.bridge.invoke("plugin_exec_run", {
      bin: "node",
      args: ["-e", HELPER_JS].concat(args),
      env: { EH_SRC: HELPER_JS },
      timeoutMs: timeoutMs || 20000,
    });
    if (!r || r.code !== 0) {
      throw new Error("helper exit " + (r ? r.code : "?") + ": " + (r && r.stderr || "").slice(0, 400));
    }
    return JSON.parse(r.stdout);
  }

  async refreshCatalog() {
    try {
      const res = await this.ctx.models.catalog({ refreshProviders: false });
      const engines = [];
      for (const g of (res && res.engines) || []) {
        const seen = new Set();
        const models = [];
        for (const src of g.sources || []) {
          for (const m of src.models || []) {
            if (!m || typeof m.id !== "string" || !m.id || seen.has(m.id)) continue;
            seen.add(m.id);
            models.push({ id: m.id, name: m.name || m.id });
          }
        }
        engines.push({
          id: g.engine.id,
          name: g.engine.name || g.engine.id,
          available: g.engine.available !== false,
          enabled: g.engine.enabled !== false,
          models,
        });
      }
      this.set({ engines, catalogError: "" });
    } catch (e) {
      this.set({ catalogError: errText(e) });
    }
  }

  onSessionActivated(data) {
    const d = data || {};
    const current = d.engine && d.sessionId ? { engine: d.engine, sessionId: d.sessionId } : null;
    const chain = current ? (this.chains[this.bySession[sessionKey(current.engine, current.sessionId)]] || null) : null;
    this.set({ current, chain: chain ? { ...chain } : null, notice: "", error: "" });
  }

  onUsage(data, kind) {
    const d = data || {};
    if (!d.engine || !d.sessionId) return;
    const key = sessionKey(d.engine, d.sessionId);
    const running = { ...this.state.running };
    if (kind === "done") delete running[key]; else running[key] = true;
    this.set({ running });
  }

  currentRunning() {
    const c = this.state.current;
    return !!(c && this.state.running[sessionKey(c.engine, c.sessionId)]);
  }

  hopForEngine(engine) {
    const ch = this.state.chain;
    if (!ch) return null;
    for (let i = ch.hops.length - 1; i >= 0; i--) {
      if (ch.hops[i].engine === engine) return { hop: ch.hops[i], index: i };
    }
    return null;
  }

  /**
   * 主流程：接力到目标引擎。
   * target: { engine, model|null, resume: "auto"|"existing"|"new", mode: "layered"|"full" }
   */
  async hop(target) {
    const t = this.t;
    const cur = this.state.current;
    if (!cur) { this.set({ error: t.errNeedSession }); return; }
    if (target.engine === cur.engine) { this.set({ error: t.errSameEngine }); return; }
    const eng = this.state.engines.find((e) => e.id === target.engine);
    if (eng && (!eng.available || !eng.enabled)) { this.set({ error: t.errEngineDown }); return; }
    const db = this.dbPath();
    if (!db) { this.set({ error: t.stDbFail }); return; }

    this.set({ busy: "extract", error: "", notice: "" });
    try {
      const chain = this.state.chain;
      const zh = this.t === ZH;
      let hopDatas;
      if (chain) {
        const pairs = chain.hops.map((h) => [h.engine, h.sessionId]);
        // 当前会话未必已入链（链以最后一次接力为准），确保当前会话也在数据集中
        if (!chain.hops.some((h) => h.engine === cur.engine && h.sessionId === cur.sessionId)) {
          pairs.push([cur.engine, cur.sessionId]);
        }
        const res = await this.runHelper(["chain", db, JSON.stringify(pairs)]);
        hopDatas = res.data.map((d, i) => ({
          hop: { engine: d.engine, sessionId: d.sessionId, model: (chain.hops[i] && chain.hops[i].model) || (d.data && d.data.model) || "" },
          messages: (d.data && d.data.messages) || [],
          session: d.data && d.data.session,
          effort: d.data && d.data.effort,
        }));
      } else {
        const res = await this.runHelper(["session", db, cur.engine, cur.sessionId]);
        hopDatas = [{
          hop: { engine: cur.engine, sessionId: cur.sessionId, model: (res.data && res.data.model) || "" },
          messages: (res.data && res.data.messages) || [],
          session: res.data && res.data.session,
          effort: res.data && res.data.effort,
        }];
      }

      const workspacePath = (hopDatas[hopDatas.length - 1].session && hopDatas[hopDatas.length - 1].session.workspace_path) || "";
      const srcEffort = hopDatas[hopDatas.length - 1].effort || "";

      // 目标：续接既有 or 新建
      const existing = this.hopForEngine(target.engine);
      const useExisting = target.resume === "existing" && existing;
      let timeline;
      let incrementalFromLabel = "";
      if (useExisting) {
        timeline = incrementalTimeline(hopDatas, existing.index);
        incrementalFromLabel = existing.hop.engine + " / " + (existing.hop.model || "?");
      } else {
        timeline = assembleTimeline(hopDatas);
      }

      if (timeline.length === 0 && !useExisting) { this.set({ busy: "", error: t.errNoMessages }); return; }

      // 无增量：直接跳回，不产生任何 run
      if (useExisting && timeline.length === 0) {
        this.set({ busy: "jump" });
        await this.ctx.sessions.selectSession(existing.hop.engine, existing.hop.sessionId, existing.hop.workspacePath || workspacePath);
        this.set({ busy: "", notice: t.okJumpOnly });
        return;
      }

      const chainDesc = this.describeChain(hopDatas, target);
      const { prompt, stats } = buildHandoff({
        toEngine: target.engine,
        toModel: target.model || "",
        chainDesc,
        incrementalFromLabel,
        timeline,
        zh,
        settings: {
          layering: target.mode === "full" ? false : this.state.settings.layering,
          recentTurns: this.state.settings.recentTurns,
          maxChars: this.state.settings.maxChars,
          perOld: this.state.settings.perOld,
        },
      });

      this.set({ busy: "start" });
      const run = await this.ctx.agent.start({
        engine: target.engine,
        prompt,
        workspacePath,
        model: target.model || undefined,
        sessionId: useExisting ? existing.hop.sessionId : undefined,
      });
      const newSid = run && run.sessionId ? run.sessionId : (useExisting ? existing.hop.sessionId : "");

      // 记账：链与日志
      const now = Date.now();
      let chainId = chain ? chain.id : "chain-" + now.toString(36);
      let hops = chain ? chain.hops.slice() : [];
      // 当前会话若尚未入链，先补记为链首
      if (!hops.some((h) => h.engine === cur.engine && h.sessionId === cur.sessionId)) {
        hops.push({ engine: cur.engine, sessionId: cur.sessionId, workspacePath, model: hopDatas[hopDatas.length - 1].hop.model || "", at: now, msgCount: organicMessages(hopDatas[hopDatas.length - 1].messages).length, chars: 0 });
      }
      if (newSid && !hops.some((h) => h.engine === target.engine && h.sessionId === newSid)) {
        hops.push({ engine: target.engine, sessionId: newSid, workspacePath, model: target.model || "", at: now, msgCount: timeline.length, chars: stats.chars });
      }
      const newChain = { id: chainId, hops };
      this.chains[chainId] = newChain;
      for (const h of hops) this.bySession[sessionKey(h.engine, h.sessionId)] = chainId;
      const log = this.state.log.concat([{
        at: now,
        from: cur.engine + "/" + cur.sessionId.slice(0, 8),
        to: target.engine + "/" + (newSid || "?").slice(0, 8),
        chars: stats.chars,
      }]).slice(-50);
      await Promise.all([
        this.ctx.storage.set("chains", { chains: this.chains, bySession: this.bySession }),
        this.ctx.storage.set("handoffLog", log),
      ]);

      // 档位随链携带（尽力而为）
      if (srcEffort && newSid) {
        try { await this.ctx.sessions.setEffort(target.engine, newSid, workspacePath, srcEffort); } catch (e) { /* 忽略 */ }
      }

      this.set({ busy: "jump", log, chain: { ...newChain } });
      if (newSid) {
        await this.ctx.sessions.selectSession(target.engine, newSid, workspacePath);
        try { await this.ctx.sessions.refresh(); } catch (e) { /* 忽略 */ }
        this.set({ busy: "", notice: t.okJumped });
      } else {
        this.set({ busy: "", notice: zh ? "会话已启动但未返回 id，请在侧栏手动打开新会话。" : "Session started without an id; open it from the sidebar." });
      }
    } catch (e) {
      this.set({ busy: "", error: errText(e) });
    }
  }

  describeChain(hopDatas, target) {
    const parts = hopDatas.map((hd) => hd.hop.engine + (hd.hop.model ? "(" + hd.hop.model + ")" : ""));
    parts.push((this.t === ZH ? "你（" : "you (") + target.engine + (target.model ? "(" + target.model + ")" : "") + (this.t === ZH ? "）" : ")"));
    return parts.join(" → ");
  }

  async jumpTo(hop) {
    try {
      await this.ctx.sessions.selectSession(hop.engine, hop.sessionId, hop.workspacePath || "");
      this.set({ error: "" });
    } catch (e) {
      this.set({ error: errText(e) });
    }
  }

  async jumpPrev() {
    const ch = this.state.chain;
    const cur = this.state.current;
    if (!ch || !cur) return;
    const idx = ch.hops.findIndex((h) => h.engine === cur.engine && h.sessionId === cur.sessionId);
    if (idx > 0) await this.jumpTo(ch.hops[idx - 1]);
    else if (idx === -1 && ch.hops.length > 0) await this.jumpTo(ch.hops[ch.hops.length - 1]);
  }

  async saveSettings(next) {
    const settings = { ...this.state.settings, ...next };
    await this.ctx.storage.set("settings", settings);
    this.set({ settings, notice: this.t.stSaved });
    if (next.dbPath !== undefined) await this.detectDb();
  }

  dispose() {
    this.disposed = true;
    this.listeners.clear();
  }
}

function errText(e) {
  return e instanceof Error ? e.message : String(e);
}

function fmtTime(ts, locale) {
  try { return new Date(ts).toLocaleString(locale, { hour12: false }); }
  catch (e) { return new Date(ts).toISOString(); }
}

/* ============================== UI ============================== */

function ChipView(ctx, store, t) {
  const R = ctx.react;
  return function Chip() {
    const s = R.useSyncExternalStore(store.subscribe, store.getSnapshot);
    const [open, setOpen] = R.useState(false);
    const [engineId, setEngineId] = R.useState("");
    const [modelId, setModelId] = R.useState("");
    const [resume, setResume] = R.useState("existing");
    const [mode, setMode] = R.useState("layered");

    const usable = s.engines.filter((e) => e.available && e.enabled);
    const cur = s.current;
    const target = usable.find((e) => e.id === engineId) || null;
    const existing = engineId ? store.hopForEngine(engineId) : null;
    const busyText = s.busy === "extract" ? t.busyExtract : s.busy === "start" ? t.busyStart : s.busy === "jump" ? t.busyJump : "";

    R.useEffect(() => {
      if (open && !engineId && cur) {
        const first = usable.find((e) => e.id !== cur.engine);
        if (first) setEngineId(first.id);
      }
    }, [open]);

    const startHop = () => {
      if (!engineId) return;
      store.hop({
        engine: engineId,
        model: modelId || null,
        resume: existing ? resume : "new",
        mode,
      });
    };

    const pop = !open ? null : R.createElement("div", { className: "eh-pop", role: "dialog" },
      R.createElement("h3", null, t.popTitle),
      R.createElement("div", { className: "eh-row" },
        R.createElement("label", null, t.currentLabel),
        R.createElement("div", null, cur
          ? cur.engine + " / " + cur.sessionId.slice(0, 10) + "…"
          : t.currentUnknown)),
      cur && store.currentRunning() ? R.createElement("p", { className: "eh-warn" }, t.runningWarn) : null,
      R.createElement("div", { className: "eh-row" },
        R.createElement("label", null, t.targetEngine),
        R.createElement("select", {
          className: "eh-select",
          value: engineId,
          onChange: (e) => { setEngineId(e.target.value); setModelId(""); },
        },
          !engineId ? R.createElement("option", { value: "" }, "—") : null,
          usable.map((e) => R.createElement("option", { key: e.id, value: e.id },
            e.name + " (" + e.models.length + ")" + (cur && e.id === cur.engine ? " ·" : ""))))),
      target ? R.createElement("div", { className: "eh-row" },
        R.createElement("label", null, t.targetModel),
        R.createElement("select", {
          className: "eh-select",
          value: modelId,
          onChange: (e) => setModelId(e.target.value),
        },
          R.createElement("option", { value: "" }, t.modelDefault),
          target.models.map((m) => R.createElement("option", { key: m.id, value: m.id }, m.name)))) : null,
      existing ? R.createElement("div", { className: "eh-row" },
        R.createElement("label", null, t.resumeTitle),
        R.createElement("label", { className: "eh-radio" },
          R.createElement("input", { type: "radio", checked: resume === "existing", onChange: () => setResume("existing") }),
          t.resumeExisting),
        R.createElement("label", { className: "eh-radio" },
          R.createElement("input", { type: "radio", checked: resume === "new", onChange: () => setResume("new") }),
          t.resumeNew)) : null,
      R.createElement("div", { className: "eh-row" },
        R.createElement("label", null, t.modeTitle),
        R.createElement("label", { className: "eh-radio" },
          R.createElement("input", { type: "radio", checked: mode === "layered", onChange: () => setMode("layered") }),
          t.modeLayered),
        R.createElement("label", { className: "eh-radio" },
          R.createElement("input", { type: "radio", checked: mode === "full", onChange: () => setMode("full") }),
          t.modeFull)),
      cur && target && target.id === cur.engine ? R.createElement("p", { className: "eh-note" }, t.sameEngineHint) : null,
      s.error ? R.createElement("p", { className: "eh-error", role: "alert" }, s.error) : null,
      s.notice ? R.createElement("p", { className: "eh-ok" }, s.notice) : null,
      busyText ? R.createElement("p", { className: "eh-note" }, busyText) : null,
      R.createElement("div", { className: "eh-actions" },
        R.createElement("button", { type: "button", className: "eh-button", onClick: () => setOpen(false) }, t.cancel),
        R.createElement("button", {
          type: "button",
          className: "eh-button eh-button-primary",
          disabled: !!s.busy || !cur || !engineId,
          onClick: startHop,
        }, t.start)),
      R.createElement("p", { className: "eh-note" }, t.privacyNote));

    return R.createElement("span", { className: "eh-chip-wrap" },
      R.createElement("button", {
        type: "button",
        className: "eh-chip" + (s.busy ? " eh-chip-busy" : ""),
        title: t.chipTitle,
        onClick: () => setOpen(!open),
      }, "⇄ " + t.chip + (s.chain ? " ×" + s.chain.hops.length : "")),
      pop);
  };
}

function PanelView(ctx, store, t) {
  const R = ctx.react;
  return function Panel() {
    const s = R.useSyncExternalStore(store.subscribe, store.getSnapshot);
    const ch = s.chain;
    const cur = s.current;
    return R.createElement("div", { className: "eh-panel" },
      R.createElement("h2", null, t.popTitle),
      R.createElement("section", { className: "eh-card" },
        R.createElement("h3", null, t.chainTitle),
        !ch ? R.createElement("p", { className: "eh-note" }, t.chainEmpty)
          : ch.hops.map((h, i) => {
              const isCur = cur && h.engine === cur.engine && h.sessionId === cur.sessionId;
              return R.createElement("div", { key: h.engine + "/" + h.sessionId, className: "eh-hop" + (isCur ? " eh-hop-current" : "") },
                R.createElement("span", { className: "eh-badge" }, String(i + 1)),
                R.createElement("div", { className: "eh-hop-main" },
                  R.createElement("span", { className: "eh-hop-title" },
                    h.engine + (h.model ? " / " + h.model : ""),
                    isCur ? " · " + t.hopNow : ""),
                  R.createElement("span", { className: "eh-hop-meta" },
                    fmtTime(h.at, ctx.host.locale) + " · " + h.msgCount + " " + t.hopMsgs + (h.chars ? " · " + h.chars + " chars" : ""))),
                isCur ? null : R.createElement("button", {
                  type: "button", className: "eh-button",
                  onClick: () => void store.jumpTo(h),
                }, t.hopJump));
            })),
      R.createElement("section", { className: "eh-card" },
        R.createElement("h3", null, t.handoffLogTitle),
        s.log.length === 0 ? R.createElement("p", { className: "eh-note" }, "—")
          : R.createElement("div", { className: "eh-log" },
              s.log.slice().reverse().map((row, i) => R.createElement("div", { className: "eh-log-row", key: i },
                R.createElement("span", null, fmtTime(row.at, ctx.host.locale)),
                R.createElement("span", null, row.from + " → " + row.to),
                R.createElement("span", null, String(row.chars)))))),
      R.createElement("p", { className: "eh-note" }, t.privacyNote));
  };
}

function SettingsView(ctx, store, t) {
  const R = ctx.react;
  return function Settings() {
    const s = R.useSyncExternalStore(store.subscribe, store.getSnapshot);
    const st = s.settings;
    const num = (v, dft) => {
      const n = parseInt(v, 10);
      return Number.isFinite(n) && n > 0 ? n : dft;
    };
    return R.createElement("div", { className: "eh-settings" },
      R.createElement("h2", null, t.settingsTitle),
      R.createElement("div", { className: "eh-field" },
        R.createElement("span", null, t.stDbPath),
        R.createElement("input", {
          className: "eh-input",
          value: st.dbPath,
          placeholder: s.dbPathDetected || "app.db",
          onChange: (e) => void store.saveSettings({ dbPath: e.target.value.trim() }),
        }),
        R.createElement("span", null, t.stDbDetected + ": " + (s.dbPathDetected || "—"))),
      R.createElement("label", { className: "eh-check" },
        R.createElement("input", {
          type: "checkbox",
          checked: st.layering !== false,
          onChange: (e) => void store.saveSettings({ layering: e.target.checked }),
        }),
        t.stLayering),
      R.createElement("div", { className: "eh-field" },
        R.createElement("span", null, t.stRecent),
        R.createElement("input", {
          className: "eh-input", type: "number", min: "1", max: "50", value: String(st.recentTurns),
          onChange: (e) => void store.saveSettings({ recentTurns: num(e.target.value, DEFAULT_SETTINGS.recentTurns) }),
        })),
      R.createElement("div", { className: "eh-field" },
        R.createElement("span", null, t.stMaxChars),
        R.createElement("input", {
          className: "eh-input", type: "number", min: "2000", step: "1000", value: String(st.maxChars),
          onChange: (e) => void store.saveSettings({ maxChars: num(e.target.value, DEFAULT_SETTINGS.maxChars) }),
        })),
      R.createElement("div", { className: "eh-field" },
        R.createElement("span", null, t.stPerOld),
        R.createElement("input", {
          className: "eh-input", type: "number", min: "120", step: "50", value: String(st.perOld),
          onChange: (e) => void store.saveSettings({ perOld: num(e.target.value, DEFAULT_SETTINGS.perOld) }),
        })),
      s.notice ? R.createElement("p", { className: "eh-ok" }, s.notice) : null,
      s.error ? R.createElement("p", { className: "eh-error", role: "alert" }, s.error) : null);
  };
}

function StatusView(ctx, store, t) {
  const R = ctx.react;
  return function Status() {
    const s = R.useSyncExternalStore(store.subscribe, store.getSnapshot);
    if (!s.chain) return null;
    return R.createElement("button", {
      type: "button",
      className: "eh-status",
      title: t.settingsTitle,
      onClick: () => ctx.ui.openSettings("engine-hopper"),
    }, "⇄ " + t.statusChain + " ×" + s.chain.hops.length);
  };
}

/* ============================== activate ============================== */

function activate(ctx) {
  const t = pickT(ctx.host.locale);
  const store = new HopStore(ctx, t);

  store.init();

  ctx.events.on("session://activated", (d) => store.onSessionActivated(d));
  ctx.events.on("usage://updated", (d) => store.onUsage(d, "updated"));
  ctx.events.on("usage://done", (d) => store.onUsage(d, "done"));

  ctx.i18n.addBundle("zh-CN", "engine-hopper", { ...ZH });
  ctx.i18n.addBundle("en", "engine-hopper", { ...EN });

  ctx.ui.registerComposerStatusItem({
    key: "engine-hopper",
    component: ChipView(ctx, store, t),
    order: 30,
  });
  ctx.ui.registerPanelTab({
    key: "engine-hopper",
    label: () => t.popTitle,
    component: PanelView(ctx, store, t),
  });
  ctx.ui.registerSettingsSection({
    key: "engine-hopper",
    label: () => t.settingsTitle,
    component: SettingsView(ctx, store, t),
  });
  ctx.ui.registerStatusBarItem({
    key: "engine-hopper",
    component: StatusView(ctx, store, t),
    zone: "end",
  });
  ctx.ui.registerCommand({
    key: "engine-hopper.jump-prev",
    title: () => t.cmdPrev,
    keywords: () => ["engine", "hop", "relay", "prev", "接力", "上一会话"],
    run: () => void store.jumpPrev(),
  });
  ctx.ui.registerCommand({
    key: "engine-hopper.settings",
    title: () => t.cmdSettings,
    keywords: () => ["engine", "hop", "settings", "接力", "设置"],
    run: () => ctx.ui.openSettings("engine-hopper"),
  });

  return () => { store.dispose(); };
}

export default activate;
export {
  MARKER,
  sessionKey,
  isSyntheticText,
  organicMessages,
  assembleTimeline,
  incrementalTimeline,
  truncateMiddle,
  buildHandoff,
  HELPER_JS,
  DEFAULT_SETTINGS,
  pickT,
};
