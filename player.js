/**
 * ═══════════════════════════════════════════════════════════════
 *  MEDIA PLAYER — YouTube Music + Spotify Style
 *  v7.0 - Fullscreen controls + Episode end timer with countdown
 * ═══════════════════════════════════════════════════════════════
 */
(function () {
  "use strict";

  /* ── State ─────────────────────────────────────────────── */
  const S = {
    playing: false,
    expanded: false,
    mode: "audio",
    mediaUrl: "",
    mediaVideo: "",
    coverUrl: "",
    coverInfo: "",
    title: "",
    detailUrl: "",
    author: "",
    queue: [],
    queueIndex: -1,
    text: "",
    subtitlesUrl: "",
    bgColor: "#111",
    allowDownload: false,
    subtitlesOn: false,
    subtitlesCues: [],
    speed: 1,
    sleepTimer: null,
    sleepMinutes: 0,
    sleepEndTime: null,
    panelOpen: null,
    duration: 0,
    currentTime: 0,
    buffered: 0,
    volume: 1,
    muted: false,
    seekDragging: false,
    repeat: false,
    shuffle: false,
    liked: false,
    episodeId: null,
    // Timer fin de episodio
    endOfEpisodeTimer: false,
    endOfEpisodeCallback: null,
    // Fullscreen controls
    fsControlsVisible: false,
    fsControlsTimeout: null,
    // Video float button state
    videoFloatVisible: false,
    videoFloatTimeout: null,
  };

  const STORAGE_KEY = "mp_player_state_v7";

  /* ── Helpers ───────────────────────────────────────────── */
  const $ = (sel, ctx) => (ctx || document).querySelector(sel);
  const $$ = (sel, ctx) => [...(ctx || document).querySelectorAll(sel)];
  const ce = (tag, cls, html) => {
    const el = document.createElement(tag);
    if (cls) el.className = cls;
    if (html) el.innerHTML = html;
    return el;
  };
  const fmt = (s) => {
    if (!s || !isFinite(s)) return "0:00";
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return m + ":" + (sec < 10 ? "0" : "") + sec;
  };
  const fmtLong = (s) => {
    if (!s || !isFinite(s)) return "0:00";
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = Math.floor(s % 60);
    if (h > 0) return `${h}:${m < 10 ? "0" : ""}${m}:${sec < 10 ? "0" : ""}${sec}`;
    return `${m}:${sec < 10 ? "0" : ""}${sec}`;
  };
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const hexToRgb = (h) => {
    h = h.replace("#", "");
    if (h.length === 3) h = h[0]+h[0]+h[1]+h[1]+h[2]+h[2];
    return [parseInt(h.substr(0,2),16), parseInt(h.substr(2,2),16), parseInt(h.substr(4,2),16)];
  };
  const darken = (hex, f) => {
    const [r,g,b] = hexToRgb(hex);
    return `rgb(${Math.round(r*f)},${Math.round(g*f)},${Math.round(b*f)})`;
  };
  const lighten = (hex, f) => {
    const [r,g,b] = hexToRgb(hex);
    return `rgb(${Math.min(255, Math.round(r*f))},${Math.min(255, Math.round(g*f))},${Math.min(255, Math.round(b*f))})`;
  };
  const luminance = (hex) => {
    const [r,g,b] = hexToRgb(hex);
    return (0.299*r + 0.587*g + 0.114*b) / 255;
  };
  const textColor = (hex) => luminance(hex) > 0.55 ? "#111" : "#fff";

  /* ── Icons (inline SVG) ────────────────────────────────── */
  const ICO = {
    play: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>`,
    pause: `<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>`,
    next: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>`,
    prev: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>`,
    vol: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0014 8.14v7.72A4.5 4.5 0 0016.5 12zM14 3.23v2.06a6.51 6.51 0 010 13.42v2.06A8.5 8.5 0 0014 3.23z"/></svg>`,
    volMute: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M16.5 12A4.5 4.5 0 0014 8.14v2.12l2.45 2.45c.03-.24.05-.48.05-.71zm2.5 0a6.45 6.45 0 01-.57 2.65l1.46 1.46A8.43 8.43 0 0021 12a8.5 8.5 0 00-7-8.77v2.06A6.51 6.51 0 0119 12zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06a8.46 8.46 0 003.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4l-1.88 1.88L12 7.76V4z"/></svg>`,
    expand: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 8l-6 6 1.41 1.41L12 10.83l4.59 4.58L18 14z"/></svg>`,
    collapse: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z"/></svg>`,
    queue: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M15 6H3v2h12V6zm0 4H3v2h12v-2zM3 16h8v-2H3v2zM17 6v8.18A3 3 0 1020 17V8h3V6h-6z"/></svg>`,
    speed: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.38 8.57l-1.23 1.85a8 8 0 01-.22 7.58H5.07A8 8 0 0115.58 6.85l1.85-1.23A10 10 0 003.35 19a2 2 0 001.72 1h13.85a2 2 0 001.74-1 10 10 0 00-.27-10.44z"/><path d="M10.59 15.41a2 2 0 002.83 0l5.66-8.49-8.49 5.66a2 2 0 000 2.83z"/></svg>`,
    timer: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M15 1H9v2h6V1zm-4 13h2V8h-2v6zm8.03-6.61l1.42-1.42A10.93 10.93 0 0012 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10c0-2.12-.66-4.08-1.78-5.7l-.19.09zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/></svg>`,
    share: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18 16.08a2.91 2.91 0 00-1.96.77L8.91 12.7A3.25 3.25 0 009 12c0-.24-.03-.47-.09-.7l7.05-4.11A2.93 2.93 0 0018 7.92a3 3 0 10-3-3c0 .24.04.47.09.7L8.04 9.74A3 3 0 006 9a3 3 0 000 6c.79 0 1.5-.31 2.04-.81l7.12 4.15c-.05.21-.08.43-.08.66 0 1.61 1.31 2.92 2.92 2.92A2.92 2.92 0 0021 19a2.92 2.92 0 00-3-2.92z"/></svg>`,
    subtitle: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V6a2 2 0 00-2-2zM4 18V6h16v12H4zm2-2h2v-2H6v2zm0-4h2v-2H6v2zm4 4h8v-2h-8v2zm0-4h8v-2h-8v2z"/></svg>`,
    close: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>`,
    download: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>`,
    videoIcon: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17 10.5V7a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h12a1 1 0 001-1v-3.5l4 4v-11l-4 4z"/></svg>`,
    audioIcon: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 3v10.55A4 4 0 1014 17V7h4V3h-6z"/></svg>`,
    repeat: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"/></svg>`,
    shuffle: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z"/></svg>`,
    rewind15: `<svg viewBox="0 0 24 24" fill="currentColor" style="width:100%;height:100%"><path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/><text x="12" y="18" text-anchor="middle" fill="currentColor" font-size="8" font-weight="bold">15</text></svg>`,
    forward15: `<svg viewBox="0 0 24 24" fill="currentColor" style="width:100%;height:100%"><path d="M12 5V1l5 5-5 5V7c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6h2c0 4.42-3.58 8-8 8s-8-3.58-8-8 3.58-8 8-8z"/><text x="12" y="18" text-anchor="middle" fill="currentColor" font-size="8" font-weight="bold">15</text></svg>`,
    like: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>`,
    liked: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="red"/></svg>`,
    fullscreen: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/></svg>`,
    exitFullscreen: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/></svg>`,
    openEpisode: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.89-2-2-2zm-7 14h-2v-4H8v-2h4V8h2v4h4v2h-4v4z"/></svg>`,
  };
  const icon = (name, size) => `<span class="mp-ico" style="width:${size||20}px;height:${size||20}px">${ICO[name]||""}</span>`;

  /* ── CSS actualizado (con mejoras para controles y temporizador) ── */
  const CSS = `
  /* Reset scoped */
  #mp-root,.mp-root *{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent}
  #mp-root{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;position:fixed;bottom:0;left:0;right:0;z-index:999999;pointer-events:none}
  #mp-root *{pointer-events:auto}
  .mp-ico{display:inline-flex;align-items:center;justify-content:center;flex-shrink:0}
  .mp-ico svg{width:100%;height:100%}

  /* Mini bar */
  .mp-mini{display:none;background:#181818;color:#fff;position:fixed;bottom:0;left:0;right:0;z-index:1000000;border-top:1px solid rgba(255,255,255,.08);transition:background .4s}
  .mp-mini.visible{display:block}
  .mp-mini-progress{height:3px;background:rgba(255,255,255,.15);cursor:pointer;position:relative}
  .mp-mini-progress-fill{height:100%;background:#fff;border-radius:0 2px 2px 0;transition:width .1s linear;position:relative}
  .mp-mini-progress-fill::after{content:'';position:absolute;right:-4px;top:50%;transform:translateY(-50%);width:10px;height:10px;background:#fff;border-radius:50%;opacity:0;transition:opacity .15s}
  .mp-mini-progress:hover .mp-mini-progress-fill::after{opacity:1}
  .mp-mini-progress-buf{position:absolute;top:0;left:0;height:100%;background:rgba(255,255,255,.15);pointer-events:none}
  .mp-mini-content{display:flex;align-items:center;justify-content:space-between;padding:10px 20px;height:80px;gap:20px}
  .mp-mini-left{display:flex;align-items:center;gap:16px;flex:0 0 360px;min-width:0}
  .mp-mini-cover{width:56px;height:56px;border-radius:8px;object-fit:cover;cursor:pointer;flex-shrink:0;box-shadow:0 4px 12px rgba(0,0,0,.3)}
  .mp-mini-info{flex:1;min-width:0;cursor:pointer}
  .mp-mini-title{font-size:14px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .mp-mini-author{font-size:12px;opacity:.65;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .mp-mini-actions{display:flex;align-items:center;gap:8px;flex-shrink:0}
  .mp-mini-queue,.mp-mini-subtitle,.mp-mini-detail{background:none;border:none;color:#fff;cursor:pointer;padding:8px;border-radius:50%;opacity:.7;transition:all .2s;display:inline-flex;align-items:center}
  .mp-mini-queue:hover,.mp-mini-subtitle:hover,.mp-mini-detail:hover{opacity:1;transform:scale(1.1)}
  .mp-mini-subtitle.active{color:#1db954;opacity:1}
  .mp-mini-center{display:flex;flex-direction:column;align-items:center;gap:6px;flex:1;justify-content:center}
  .mp-mini-controls{display:flex;align-items:center;gap:12px;justify-content:center}
  .mp-mini-btn{background:none;border:none;color:inherit;cursor:pointer;padding:8px;border-radius:50%;transition:all .15s;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0}
  .mp-mini-btn:hover{background:rgba(255,255,255,.1);transform:scale(1.05)}
  .mp-mini-btn:active{transform:scale(.95)}
  .mp-mini-play{width:44px;height:44px;background:#fff!important;color:#000!important;border-radius:50%;padding:0}
  .mp-mini-play:hover{transform:scale(1.08)}
  .mp-mini-time{display:flex;align-items:center;gap:12px;font-size:11px;color:rgba(255,255,255,.6)}
  .mp-mini-time span{min-width:40px;font-variant-numeric:tabular-nums}
  .mp-mini-time .mp-sep{flex:1;height:2px;background:rgba(255,255,255,.1);border-radius:2px;min-width:100px}
  .mp-mini-right{display:flex;align-items:center;gap:16px;flex:0 0 280px;justify-content:flex-end}
  .mp-mini-vol-wrap{display:flex;align-items:center;gap:8px}
  .mp-mini-vol-bar{width:80px;height:4px;background:rgba(255,255,255,.2);border-radius:2px;cursor:pointer;position:relative}
  .mp-mini-vol-fill{height:100%;background:#fff;border-radius:2px;pointer-events:none}
  .mp-speed-badge{padding:4px 12px;background:rgba(255,255,255,.1);border-radius:20px;font-size:12px;font-weight:600;cursor:pointer;transition:all .2s;white-space:nowrap}
  .mp-speed-badge:hover{background:rgba(255,255,255,.2)}
  .mp-like-btn{background:none;border:none;color:rgba(255,255,255,.7);cursor:pointer;padding:8px;border-radius:50%;transition:all .2s;display:inline-flex;align-items:center;flex-shrink:0}
  .mp-like-btn:hover{transform:scale(1.1)}
  .mp-like-btn.active{color:#ff4444}
  .mp-download-btn{background:none;border:none;color:#fff;cursor:pointer;padding:8px;border-radius:50%;opacity:.7;transition:all .2s;display:inline-flex;align-items:center}
  .mp-download-btn:hover{opacity:1;transform:scale(1.1)}

  /* Expanded view */
  .mp-expanded{position:fixed;bottom:80px;left:0;right:0;top:0;display:flex;transform:translateY(100%);transition:transform .38s cubic-bezier(.16,1,.3,1);overflow:hidden;z-index:999998}
  .mp-expanded.open{transform:translateY(0)}
  .mp-expanded-bg{position:absolute;top:0;left:0;right:0;bottom:0;transition:background .5s ease;z-index:0}
  .mp-exp-container{display:flex;width:100%;height:100%;transition:all .3s ease;position:relative;z-index:1}
  .mp-exp-media{flex:1;display:flex;align-items:center;justify-content:center;position:relative;transition:flex .3s ease;background:transparent}
  .mp-exp-media.with-panel{flex:0 0 60%}
  .mp-exp-cover{max-width:80%;max-height:80%;object-fit:contain;border-radius:12px;box-shadow:0 8px 40px rgba(0,0,0,.5);transition:all .3s}
  .mp-exp-video{width:100%;height:100%;object-fit:contain;background:#000;cursor:pointer}
  
  /* Subtítulos modo audio (estilo Spotify) */
  .mp-lyrics-subtitles{position:absolute;bottom:20%;left:0;right:0;text-align:center;font-size:clamp(1.8rem, 8vw, 3.5rem);font-weight:bold;color:white;text-shadow:0 0 20px rgba(0,0,0,0.5);background:transparent;padding:0 20px;margin:0 auto;pointer-events:none;z-index:10;max-width:90%;word-break:break-word;transition:all 0.2s}
  
  /* Subtítulos modo video (sobre el video) */
  .mp-exp-subs{position:absolute;bottom:80px;left:0;right:0;text-align:center;font-size:1.5rem;font-weight:bold;color:white;text-shadow:0 0 10px black;background:rgba(0,0,0,0.6);padding:8px 16px;border-radius:8px;width:fit-content;margin:0 auto;pointer-events:none;z-index:10;max-width:80%;word-break:break-word}
  
  .mp-exp-top{position:absolute;top:20px;right:20px;z-index:15;display:flex;gap:12px}
  .mp-mode-switch{display:flex;align-items:center;gap:4px;background:rgba(0,0,0,.5);backdrop-filter:blur(8px);border-radius:24px;padding:4px}
  .mp-mode-opt{background:none;border:none;color:#fff;padding:6px 14px;border-radius:20px;font-size:12px;font-weight:600;cursor:pointer;opacity:.6;transition:all .2s;display:flex;align-items:center;gap:4px}
  .mp-mode-opt.active{background:rgba(255,255,255,.2);opacity:1}
  .mp-exp-close{background:rgba(0,0,0,.5);backdrop-filter:blur(8px);border:none;color:#fff;border-radius:50%;padding:10px;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;transition:all .2s}
  .mp-exp-close:hover{background:rgba(0,0,0,.7);transform:scale(1.05)}
  
  /* Botón flotante de fullscreen (modo video normal) */
  .mp-video-fs-btn-float{position:absolute;bottom:20px;right:20px;background:rgba(0,0,0,0.7);backdrop-filter:blur(8px);border:none;color:#fff;border-radius:50%;width:48px;height:48px;cursor:pointer;display:flex;align-items:center;justify-content:center;z-index:25;transition:opacity 0.2s, transform 0.1s;opacity:0;pointer-events:none}
  .mp-video-fs-btn-float.visible{opacity:1;pointer-events:auto}
  .mp-video-fs-btn-float:hover{background:rgba(255,255,255,0.3);transform:scale(1.05)}

  /* Controles en pantalla completa (overlay sobre el video) */
  .mp-fs-overlay{position:fixed;top:0;left:0;right:0;bottom:0;background:transparent;z-index:1000001;display:flex;flex-direction:column;justify-content:space-between;pointer-events:none}
  .mp-fs-overlay.visible{pointer-events:auto}
  .mp-fs-top{position:absolute;top:0;left:0;right:0;padding:20px;background:linear-gradient(180deg, rgba(0,0,0,0.8) 0%, transparent 100%);text-align:center}
  .mp-fs-title{font-size:1.2rem;font-weight:600;color:white;text-shadow:0 1px 2px black}
  .mp-fs-center{flex:1;display:flex;align-items:center;justify-content:center;gap:40px}
  .mp-fs-btn{background:rgba(0,0,0,0.7);border:none;color:white;width:60px;height:60px;border-radius:50%;cursor:pointer;transition:all 0.2s;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(8px)}
  .mp-fs-btn:hover{background:rgba(255,255,255,0.3);transform:scale(1.1)}
  .mp-fs-play{width:80px;height:80px}
  .mp-fs-bottom{position:absolute;bottom:0;left:0;right:0;padding:20px;background:linear-gradient(0deg, rgba(0,0,0,0.8) 0%, transparent 100%)}
  .mp-fs-progress-bar{height:4px;background:rgba(255,255,255,0.3);border-radius:2px;cursor:pointer;margin-bottom:12px}
  .mp-fs-progress-fill{height:100%;background:#fff;border-radius:2px;width:0%}
  .mp-fs-time{display:flex;justify-content:space-between;font-size:12px;color:white;margin-bottom:12px}
  .mp-fs-exit{position:absolute;top:20px;right:20px;background:rgba(0,0,0,0.7);border:none;color:white;width:44px;height:44px;border-radius:50%;cursor:pointer;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(8px)}
  .mp-fs-exit:hover{background:rgba(255,255,255,0.3)}

  /* Side panel */
  .mp-exp-panel{position:fixed;right:0;top:0;bottom:0;width:40%;background:rgba(20,20,20,.98);backdrop-filter:blur(20px);transform:translateX(100%);transition:transform .3s ease;z-index:20;display:flex;flex-direction:column;border-left:1px solid rgba(255,255,255,.1)}
  .mp-exp-panel.open{transform:translateX(0)}
  .mp-panel-header{display:flex;align-items:center;justify-content:space-between;padding:20px 24px;border-bottom:1px solid rgba(255,255,255,.1)}
  .mp-panel-header h3{font-size:18px;font-weight:700}
  .mp-panel-close{background:none;border:none;color:#fff;cursor:pointer;padding:8px;border-radius:50%;transition:background .15s;display:inline-flex;align-items:center}
  .mp-panel-close:hover{background:rgba(255,255,255,.1)}
  .mp-panel-body{flex:1;overflow-y:auto;padding:16px 24px}
  .mp-queue-item{display:flex;align-items:center;gap:12px;padding:12px;border-radius:8px;cursor:pointer;transition:background .15s;margin-bottom:4px}
  .mp-queue-item:hover{background:rgba(255,255,255,.08)}
  .mp-queue-item.active{background:rgba(255,255,255,.12)}
  .mp-queue-img{width:48px;height:48px;border-radius:6px;object-fit:cover;flex-shrink:0}
  .mp-queue-info{flex:1;min-width:0}
  .mp-queue-title{font-size:14px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .mp-queue-author{font-size:12px;opacity:.6}
  .mp-speed-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}
  .mp-speed-opt{background:rgba(255,255,255,.08);border:2px solid transparent;border-radius:12px;padding:14px;text-align:center;font-size:14px;font-weight:600;cursor:pointer;transition:all .15s}
  .mp-speed-opt:hover{background:rgba(255,255,255,.12)}
  .mp-speed-opt.active{border-color:#1db954;background:rgba(29,185,84,.15)}
  
  /* Timer panel mejorado */
  .mp-timer-grid{display:flex;flex-direction:column;gap:16px}
  .mp-timer-presets{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:20px}
  .mp-timer-opt{background:rgba(255,255,255,.08);border:2px solid transparent;border-radius:12px;padding:12px;text-align:center;font-size:14px;font-weight:600;cursor:pointer;transition:all .15s}
  .mp-timer-opt:hover{background:rgba(255,255,255,.12)}
  .mp-timer-opt.active{border-color:#1db954;background:rgba(29,185,84,.15)}
  .mp-timer-end-episode{background:rgba(29,185,84,0.2);border-color:#1db954}
  .mp-timer-countdown{text-align:center;padding:20px;background:rgba(255,255,255,0.05);border-radius:16px;margin:10px 0}
  .mp-countdown-number{font-size:3rem;font-weight:bold;color:white;font-family:monospace;letter-spacing:2px}
  .mp-timer-buttons{display:flex;gap:12px;justify-content:center;margin-top:20px}
  .mp-timer-btn{background:rgba(255,255,255,.1);border:none;border-radius:40px;padding:12px 24px;font-size:14px;font-weight:600;color:white;cursor:pointer;transition:all .2s}
  .mp-timer-btn:hover{background:rgba(255,255,255,.2);transform:scale(1.02)}
  .mp-timer-btn.danger{background:rgba(255,80,80,0.3);color:#ff8888}
  .mp-timer-btn.danger:hover{background:rgba(255,80,80,0.5)}
  
  .mp-share-grid{display:flex;flex-wrap:wrap;gap:12px;justify-content:center}
  .mp-share-btn{display:flex;flex-direction:column;align-items:center;gap:8px;padding:16px;border-radius:12px;background:rgba(255,255,255,.08);border:none;color:#fff;cursor:pointer;min-width:90px;font-size:12px;transition:all .15s}
  .mp-share-btn:hover{background:rgba(255,255,255,.15);transform:translateY(-2px)}

  @media(max-width:768px){
    .mp-mini-left{flex:0 0 260px}
    .mp-mini-right{flex:0 0 180px}
    .mp-mini-vol-bar{width:50px}
    .mp-exp-panel{width:100%}
    .mp-exp-media.with-panel{flex:0 0 100%}
    .mp-mini-time .mp-sep{min-width:50px}
    .mp-lyrics-subtitles{font-size:1.8rem;bottom:15%}
    .mp-timer-presets{grid-template-columns:repeat(3,1fr)}
    .mp-countdown-number{font-size:2rem}
  }
  `;

  /* ── Build DOM ─────────────────────────────────────────── */
  function buildUI() {
    const style = document.createElement("style");
    style.textContent = CSS;
    document.head.appendChild(style);

    const root = ce("div");
    root.id = "mp-root";
    root.innerHTML = `
    <!-- EXPANDED VIEW -->
    <div class="mp-expanded" id="mp-exp">
      <div class="mp-expanded-bg" id="mp-exp-bg"></div>
      <div class="mp-exp-container" id="mp-exp-container">
        <div class="mp-exp-media" id="mp-exp-media">
          <img class="mp-exp-cover" id="mp-exp-cover" src="" alt="cover" />
          <video class="mp-exp-video" id="mp-exp-video" playsinline></video>
          <div class="mp-lyrics-subtitles" id="mp-lyrics-subs" style="display:none"></div>
          <div class="mp-exp-subs" id="mp-exp-subs" style="display:none"></div>
          <!-- Botón flotante de fullscreen (solo modo video normal) -->
          <button class="mp-video-fs-btn-float" id="mp-video-fs-float">${icon("fullscreen",24)}</button>
        </div>
      </div>
      <div class="mp-exp-top">
        <div class="mp-mode-switch" id="mp-mode-switch" style="display:none">
          <button class="mp-mode-opt active" data-mode="audio">${icon("audioIcon",16)} Audio</button>
          <button class="mp-mode-opt" data-mode="video">${icon("videoIcon",16)} Video</button>
        </div>
        <button class="mp-exp-close" id="mp-exp-close">${icon("close",24)}</button>
      </div>
      <!-- Side Panel -->
      <div class="mp-exp-panel" id="mp-side-panel">
        <div class="mp-panel-header">
          <h3 id="mp-panel-title">Cola</h3>
          <button class="mp-panel-close" id="mp-panel-close">${icon("close",24)}</button>
        </div>
        <div class="mp-panel-body" id="mp-panel-body"></div>
      </div>
    </div>

    <!-- Fullscreen overlay (controles personalizados) -->
    <div class="mp-fs-overlay" id="mp-fs-overlay" style="display:none">
      <div class="mp-fs-top">
        <div class="mp-fs-title" id="mp-fs-title"></div>
      </div>
      <div class="mp-fs-center">
        <button class="mp-fs-btn" id="mp-fs-prev">${icon("prev",32)}</button>
        <button class="mp-fs-btn mp-fs-play" id="mp-fs-play">${icon("play",40)}</button>
        <button class="mp-fs-btn" id="mp-fs-next">${icon("next",32)}</button>
      </div>
      <div class="mp-fs-bottom">
        <div class="mp-fs-progress-bar" id="mp-fs-progress">
          <div class="mp-fs-progress-fill" id="mp-fs-progress-fill"></div>
        </div>
        <div class="mp-fs-time">
          <span id="mp-fs-current">0:00</span>
          <span id="mp-fs-duration">0:00</span>
        </div>
      </div>
      <button class="mp-fs-exit" id="mp-fs-exit">${icon("exitFullscreen",24)}</button>
    </div>

    <!-- MINI BAR -->
    <div class="mp-mini" id="mp-mini">
      <div class="mp-mini-progress" id="mp-mini-prog">
        <div class="mp-mini-progress-buf" id="mp-mini-buf"></div>
        <div class="mp-mini-progress-fill" id="mp-mini-fill"></div>
      </div>
      <div class="mp-mini-content">
        <div class="mp-mini-left">
          <img class="mp-mini-cover" id="mp-mini-cover" src="" alt="" />
          <div class="mp-mini-info" id="mp-mini-info">
            <div class="mp-mini-title" id="mp-mini-title"></div>
            <div class="mp-mini-author" id="mp-mini-author"></div>
          </div>
          <div class="mp-mini-actions">
            <button class="mp-mini-detail" id="mp-detail-btn" title="Abrir episodio">${icon("openEpisode",20)}</button>
            <button class="mp-mini-queue" id="mp-queue-btn" title="Lista de reproducción">${icon("queue",20)}</button>
            <button class="mp-mini-subtitle" id="mp-subtitle-btn" title="Subtítulos">${icon("subtitle",20)}</button>
          </div>
        </div>
        
        <div class="mp-mini-center">
          <div class="mp-mini-controls">
            <button class="mp-mini-btn" id="mp-shuffle-btn" title="Aleatorio">${icon("shuffle",20)}</button>
            <button class="mp-mini-btn" id="mp-prev-btn" title="Anterior">${icon("prev",24)}</button>
            <button class="mp-mini-btn" id="mp-rewind-btn" title="Retroceder 15s">${icon("rewind15",24)}</button>
            <button class="mp-mini-btn mp-mini-play" id="mp-play-btn">${icon("play",28)}</button>
            <button class="mp-mini-btn" id="mp-forward-btn" title="Avanzar 15s">${icon("forward15",24)}</button>
            <button class="mp-mini-btn" id="mp-next-btn" title="Siguiente">${icon("next",24)}</button>
            <button class="mp-mini-btn" id="mp-repeat-btn" title="Repetir">${icon("repeat",20)}</button>
          </div>
          <div class="mp-mini-time">
            <span id="mp-cur-time">0:00</span>
            <div class="mp-sep"></div>
            <span id="mp-dur-time">0:00</span>
          </div>
        </div>
        
        <div class="mp-mini-right">
          <div class="mp-mini-vol-wrap">
            <button class="mp-mini-btn" id="mp-vol-btn">${icon("vol",20)}</button>
            <div class="mp-mini-vol-bar" id="mp-vol-bar"><div class="mp-mini-vol-fill" id="mp-vol-fill" style="width:100%"></div></div>
          </div>
          <button class="mp-speed-badge" id="mp-speed-btn">1.0x</button>
          <button class="mp-mini-btn" id="mp-timer-btn" title="Temporizador">${icon("timer",20)}</button>
          <button class="mp-like-btn" id="mp-like-btn" title="Me gusta">${icon("like",22)}</button>
          <button class="mp-download-btn" id="mp-download-btn" title="Descargar" style="display:none">${icon("download",20)}</button>
          <button class="mp-mini-btn" id="mp-expand-btn" title="Expandir">${icon("expand",24)}</button>
        </div>
      </div>
    </div>
    `;
    document.body.appendChild(root);

    const audio = document.createElement("audio");
    audio.id = "mp-audio";
    audio.preload = "auto";
    audio.style.display = "none";
    document.body.appendChild(audio);
  }

  /* ── References ─────────────────────────────────────────── */
  let els = {};
  let audioEl, videoEl;

  function refs() {
    els = {
      mini: $("#mp-mini"),
      miniCover: $("#mp-mini-cover"),
      miniTitle: $("#mp-mini-title"),
      miniAuthor: $("#mp-mini-author"),
      miniInfo: $("#mp-mini-info"),
      miniFill: $("#mp-mini-fill"),
      miniBuf: $("#mp-mini-buf"),
      miniProg: $("#mp-mini-prog"),
      curTime: $("#mp-cur-time"),
      durTime: $("#mp-dur-time"),
      playBtn: $("#mp-play-btn"),
      prevBtn: $("#mp-prev-btn"),
      nextBtn: $("#mp-next-btn"),
      rewindBtn: $("#mp-rewind-btn"),
      forwardBtn: $("#mp-forward-btn"),
      shuffleBtn: $("#mp-shuffle-btn"),
      repeatBtn: $("#mp-repeat-btn"),
      volBtn: $("#mp-vol-btn"),
      volBar: $("#mp-vol-bar"),
      volFill: $("#mp-vol-fill"),
      speedBtn: $("#mp-speed-btn"),
      timerBtn: $("#mp-timer-btn"),
      likeBtn: $("#mp-like-btn"),
      queueBtn: $("#mp-queue-btn"),
      detailBtn: $("#mp-detail-btn"),
      subtitleBtn: $("#mp-subtitle-btn"),
      downloadBtn: $("#mp-download-btn"),
      expandBtn: $("#mp-expand-btn"),
      exp: $("#mp-exp"),
      expBg: $("#mp-exp-bg"),
      expContainer: $("#mp-exp-container"),
      expMedia: $("#mp-exp-media"),
      expCover: $("#mp-exp-cover"),
      expVideo: $("#mp-exp-video"),
      lyricsSubs: $("#mp-lyrics-subs"),
      videoSubs: $("#mp-exp-subs"),
      modeSwitch: $("#mp-mode-switch"),
      expClose: $("#mp-exp-close"),
      sidePanel: $("#mp-side-panel"),
      panelTitle: $("#mp-panel-title"),
      panelBody: $("#mp-panel-body"),
      panelClose: $("#mp-panel-close"),
      videoFsFloat: $("#mp-video-fs-float"),
      fsOverlay: $("#mp-fs-overlay"),
      fsTitle: $("#mp-fs-title"),
      fsPrev: $("#mp-fs-prev"),
      fsPlay: $("#mp-fs-play"),
      fsNext: $("#mp-fs-next"),
      fsProgress: $("#mp-fs-progress"),
      fsProgressFill: $("#mp-fs-progress-fill"),
      fsCurrent: $("#mp-fs-current"),
      fsDuration: $("#mp-fs-duration"),
      fsExit: $("#mp-fs-exit"),
    };
    audioEl = $("#mp-audio");
    videoEl = els.expVideo;
  }

  function activeMedia() {
    return S.mode === "video" && S.mediaVideo ? videoEl : audioEl;
  }

  /* ── Storage ────────────────────────────────────────────── */
  function saveState() {
    if (!S.episodeId) return;
    const state = {
      episodeId: S.episodeId,
      currentTime: S.currentTime,
      playing: S.playing,
      volume: S.volume,
      muted: S.muted,
      speed: S.speed,
      mode: S.mode,
      subtitlesOn: S.subtitlesOn,
      mediaUrl: S.mediaUrl,
      mediaVideo: S.mediaVideo,
      coverUrl: S.coverUrl,
      title: S.title,
      author: S.author,
      detailUrl: S.detailUrl,
      queue: S.queue,
      queueIndex: S.queueIndex,
      bgColor: S.bgColor,
      allowDownload: S.allowDownload,
      subtitlesUrl: S.subtitlesUrl,
      liked: S.liked,
      repeat: S.repeat,
      shuffle: S.shuffle,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function restoreState() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return false;
    try {
      const state = JSON.parse(saved);
      loadEpisode(
        state.mediaUrl, state.mediaVideo, state.mode,
        state.coverUrl, "", state.title, state.detailUrl, state.author,
        state.queue, "", state.subtitlesUrl, state.bgColor,
        state.allowDownload, state.episodeId
      );
      S.currentTime = state.currentTime;
      S.volume = state.volume;
      S.muted = state.muted;
      S.speed = state.speed;
      S.subtitlesOn = state.subtitlesOn;
      S.queueIndex = state.queueIndex;
      S.liked = state.liked || false;
      S.repeat = state.repeat || false;
      S.shuffle = state.shuffle || false;
      setVolume(S.volume);
      const media = activeMedia();
      if (media) {
        media.playbackRate = S.speed;
        media.currentTime = S.currentTime;
      }
      updateSpeedUI();
      updateLikeUI();
      updateRepeatUI();
      updateShuffleUI();
      updateSubtitleUI();
      if (state.playing) playMedia();
      else pauseMedia();
      return true;
    } catch(e) { return false; }
  }

  /* ── Media Session ─────────────────────────────────────── */
  function updateMediaSession() {
    if (!navigator.mediaSession) return;
    navigator.mediaSession.metadata = new MediaMetadata({
      title: S.title || "Sin título",
      artist: S.author || "Balta Media",
      album: S.title || "",
      artwork: S.coverUrl ? [{ src: S.coverUrl, sizes: "512x512", type: "image/png" }] : []
    });
    navigator.mediaSession.setActionHandler("play", () => togglePlay());
    navigator.mediaSession.setActionHandler("pause", () => togglePlay());
    navigator.mediaSession.setActionHandler("previoustrack", () => prevTrack());
    navigator.mediaSession.setActionHandler("nexttrack", () => nextTrack());
    navigator.mediaSession.setActionHandler("seekbackward", (details) => skip(-(details.seekOffset || 15)));
    navigator.mediaSession.setActionHandler("seekforward", (details) => skip(details.seekOffset || 15));
    if ('setPositionState' in navigator.mediaSession) {
      navigator.mediaSession.setPositionState({
        duration: S.duration,
        position: S.currentTime,
        playbackRate: S.speed
      });
    }
  }

  /* ── User storage integration ──────────────────────────── */
  function syncLikedFromStorage() {
    if (window.userStorage && window.userStorage.liked && S.episodeId) {
      S.liked = window.userStorage.liked.has(S.episodeId);
      updateLikeUI();
    }
  }
  function toggleLiked() {
    if (window.userStorage && window.userStorage.liked && S.episodeId) {
      window.userStorage.liked.toggle(S.episodeId);
      S.liked = window.userStorage.liked.has(S.episodeId);
      updateLikeUI();
      saveState();
    } else {
      S.liked = !S.liked;
      updateLikeUI();
      saveState();
    }
  }
  function addToPlaylist() {
    if (window.userStorage && window.userStorage.playlist && S.episodeId) {
      const episode = {
        id: S.episodeId,
        title: S.title,
        author: S.author,
        coverUrl: S.coverUrl,
        detailUrl: S.detailUrl,
        mediaUrl: S.mediaUrl,
        mediaVideo: S.mediaVideo,
        initialMode: S.mode,
        bgColor: S.bgColor,
        allowDownload: S.allowDownload,
        subtitlesUrl: S.subtitlesUrl,
      };
      window.userStorage.playlist.add(episode);
      const btn = els.queueBtn;
      btn.style.transform = "scale(0.9)";
      setTimeout(() => btn.style.transform = "", 150);
    }
  }

  /* ── UI Update helpers ─────────────────────────────────── */
  function updateBg() {
    const c = S.bgColor || "#111";
    els.mini.style.background = `linear-gradient(90deg, ${darken(c,.35)} 0%, ${darken(c,.2)} 100%)`;
    els.expBg.style.background = `linear-gradient(135deg, ${lighten(c,1.2)} 0%, ${darken(c,.6)} 100%)`;
    const tc = textColor(c);
    els.mini.style.color = tc;
  }

  function updateMiniInfo() {
    els.miniCover.src = S.coverUrl || "";
    els.miniTitle.textContent = S.title || "";
    els.miniAuthor.textContent = S.author || "";
    els.expCover.src = S.coverUrl || "";
    if (els.fsTitle) els.fsTitle.textContent = S.title || "";
  }

  function updatePlayBtn() {
    const ic = S.playing ? ICO.pause : ICO.play;
    els.playBtn.innerHTML = `<span class="mp-ico" style="width:28px;height:28px">${ic}</span>`;
    if (els.fsPlay) els.fsPlay.innerHTML = `<span class="mp-ico" style="width:40px;height:40px">${ic}</span>`;
  }

  function updateProgress() {
    const pct = S.duration ? (S.currentTime / S.duration) * 100 : 0;
    els.miniFill.style.width = pct + "%";
    els.curTime.textContent = fmt(S.currentTime);
    els.durTime.textContent = fmt(S.duration);
    if (els.fsProgressFill) {
      els.fsProgressFill.style.width = pct + "%";
      els.fsCurrent.textContent = fmt(S.currentTime);
      els.fsDuration.textContent = fmt(S.duration);
    }
    const media = activeMedia();
    if (media && media.buffered && media.buffered.length > 0) {
      const buf = (media.buffered.end(media.buffered.length - 1) / (S.duration || 1)) * 100;
      els.miniBuf.style.width = buf + "%";
    }
    checkSleepTimer();
    checkEndOfEpisodeTimer();
    // Actualizar panel de temporizador si está abierto
    if (S.panelOpen === "timer") updateTimerPanelContent();
    if (navigator.mediaSession && 'setPositionState' in navigator.mediaSession) {
      navigator.mediaSession.setPositionState({
        duration: S.duration,
        position: S.currentTime,
        playbackRate: S.speed
      });
    }
  }

  /* ── Temporizador fin de episodio (con countdown) ──────── */
  function getRemainingTime() {
    if (!S.endOfEpisodeTimer || S.duration <= 0) return 0;
    return Math.max(0, S.duration - S.currentTime);
  }
  function checkEndOfEpisodeTimer() {
    if (S.endOfEpisodeTimer && getRemainingTime() <= 0.5) {
      pauseMedia();
      clearEndOfEpisodeTimer();
      if (S.panelOpen === "timer") updateTimerPanelContent();
    }
  }
  function clearEndOfEpisodeTimer() {
    S.endOfEpisodeTimer = false;
    if (S.endOfEpisodeCallback) {
      clearInterval(S.endOfEpisodeCallback);
      S.endOfEpisodeCallback = null;
    }
  }
  function setEndOfEpisodeTimer() {
    clearSleepTimer();
    clearEndOfEpisodeTimer();
    S.endOfEpisodeTimer = true;
    // No necesitamos intervalo, la comprobación se hace en updateProgress
  }
  function cancelEndOfEpisodeTimer() {
    clearEndOfEpisodeTimer();
    if (S.panelOpen === "timer") updateTimerPanelContent();
  }

  /* ── Temporizador de sueño (minutos) ───────────────────── */
  function checkSleepTimer() {
    if (S.sleepTimer && S.sleepEndTime) {
      const remaining = S.sleepEndTime - Date.now();
      if (remaining <= 0) {
        pauseMedia();
        clearSleepTimer();
        if (S.panelOpen === "timer") updateTimerPanelContent();
        saveState();
      }
    }
  }
  function clearSleepTimer() {
    if (S.sleepTimer) {
      clearInterval(S.sleepTimer);
      S.sleepTimer = null;
    }
    S.sleepMinutes = 0;
    S.sleepEndTime = null;
  }
  function getSleepRemaining() {
    if (S.sleepEndTime) return Math.max(0, (S.sleepEndTime - Date.now()) / 1000);
    return 0;
  }

  /* ── Subtítulos ────────────────────────────────────────── */
  function parseTime(str) {
    str = str.replace(",", ".");
    const parts = str.split(":");
    if (parts.length === 3) return parseFloat(parts[0]) * 3600 + parseFloat(parts[1]) * 60 + parseFloat(parts[2]);
    if (parts.length === 2) return parseFloat(parts[0]) * 60 + parseFloat(parts[1]);
    return parseFloat(str);
  }

  function loadSubtitles(url) {
    S.subtitlesCues = [];
    fetch(url).then(r => r.ok ? r.text() : "").then(txt => {
      if (!txt) return;
      txt = txt.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n");
      const blocks = txt.split(/\n\s*\n/);
      for (const block of blocks) {
        const lines = block.trim().split("\n");
        let timeLineIndex = -1;
        for (let i = 0; i < lines.length; i++) {
          if (lines[i].match(/\d{2}:\d{2}:\d{2}[.,]\d{3}\s*-->\s*\d{2}:\d{2}:\d{2}[.,]\d{3}/)) {
            timeLineIndex = i;
            break;
          }
        }
        if (timeLineIndex === -1) continue;
        const match = lines[timeLineIndex].match(/(\d{2}:\d{2}:\d{2}[.,]\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2}[.,]\d{3})/);
        if (match) {
          const start = parseTime(match[1]);
          const end = parseTime(match[2]);
          const text = lines.slice(timeLineIndex + 1).join(" ").replace(/<[^>]+>/g, "").trim();
          if (text) S.subtitlesCues.push({ start, end, text });
        }
      }
    }).catch(() => console.warn("Error cargando subtítulos"));
  }

  function getCurrentCue(time) {
    for (const cue of S.subtitlesCues) {
      if (time >= cue.start && time <= cue.end) return cue.text;
    }
    return "";
  }

  function updateSubtitles() {
    if (!S.subtitlesOn || !S.subtitlesCues.length) {
      if (els.lyricsSubs) els.lyricsSubs.style.display = "none";
      if (els.videoSubs) els.videoSubs.style.display = "none";
      return;
    }
    const cue = getCurrentCue(S.currentTime);
    if (!cue) {
      if (els.lyricsSubs) els.lyricsSubs.style.display = "none";
      if (els.videoSubs) els.videoSubs.style.display = "none";
      return;
    }
    if (S.mode === "audio" && S.expanded) {
      els.lyricsSubs.textContent = cue;
      els.lyricsSubs.style.display = "block";
      if (els.videoSubs) els.videoSubs.style.display = "none";
    } else if (S.mode === "video") {
      els.videoSubs.textContent = cue;
      els.videoSubs.style.display = "block";
      if (els.lyricsSubs) els.lyricsSubs.style.display = "none";
    } else {
      if (els.lyricsSubs) els.lyricsSubs.style.display = "none";
      if (els.videoSubs) els.videoSubs.style.display = "none";
    }
  }

  function toggleSubtitles() {
    S.subtitlesOn = !S.subtitlesOn;
    updateSubtitleUI();
    updateSubtitles();
    saveState();
  }
  function updateSubtitleUI() {
    els.subtitleBtn.classList.toggle("active", S.subtitlesOn);
  }

  /* ── Modo y fullscreen (con mejoras de hover/clic) ─────── */
  function updateMode() {
    const hasAudio = !!S.mediaUrl;
    const hasVideo = !!S.mediaVideo;
    const showModeSwitch = hasAudio && hasVideo;
    els.modeSwitch.style.display = showModeSwitch ? "flex" : "none";
    if (showModeSwitch) {
      $$(".mp-mode-opt", els.modeSwitch).forEach(btn => {
        btn.classList.toggle("active", btn.dataset.mode === S.mode);
      });
    }
    if (S.mode === "video" && hasVideo) {
      els.expCover.style.display = "none";
      videoEl.style.display = "block";
      els.videoFsFloat.style.display = "flex";
      // Asegurar eventos de hover y clic para el botón flotante
      bindVideoFloatEvents();
    } else {
      els.expCover.style.display = "block";
      videoEl.style.display = "none";
      els.videoFsFloat.style.display = "none";
      if (document.fullscreenElement) document.exitFullscreen();
    }
    if (!S.expanded && els.lyricsSubs) els.lyricsSubs.style.display = "none";
    updateSubtitles();
  }

  // Manejo del botón flotante de fullscreen en modo video normal
  let videoFloatTimeout;
  function showFsFloat() {
    if (S.mode !== "video" || document.fullscreenElement) return;
    els.videoFsFloat.classList.add("visible");
    if (videoFloatTimeout) clearTimeout(videoFloatTimeout);
    videoFloatTimeout = setTimeout(() => {
      if (!S.videoFloatVisible) els.videoFsFloat.classList.remove("visible");
    }, 5000);
  }
  function hideFsFloat() {
    if (!S.videoFloatVisible) {
      els.videoFsFloat.classList.remove("visible");
      if (videoFloatTimeout) clearTimeout(videoFloatTimeout);
    }
  }
  function toggleFsFloatPermanent() {
    if (els.videoFsFloat.classList.contains("visible")) {
      S.videoFloatVisible = false;
      hideFsFloat();
    } else {
      S.videoFloatVisible = true;
      els.videoFsFloat.classList.add("visible");
      if (videoFloatTimeout) clearTimeout(videoFloatTimeout);
    }
  }
  function bindVideoFloatEvents() {
    if (!videoEl) return;
    // Hover: mostrar al entrar, ocultar al salir (si no está fijado por clic)
    videoEl.addEventListener("mouseenter", () => {
      if (!S.videoFloatVisible) showFsFloat();
    });
    videoEl.addEventListener("mouseleave", () => {
      if (!S.videoFloatVisible) hideFsFloat();
    });
    // Clic en el video: fijar/desfijar el botón
    videoEl.addEventListener("click", (e) => {
      if (!document.fullscreenElement) {
        toggleFsFloatPermanent();
        e.stopPropagation();
      }
    });
    els.videoFsFloat.addEventListener("click", (e) => {
      e.stopPropagation();
      enterFullscreen();
    });
  }

  // Fullscreen y controles
  function enterFullscreen() {
    const container = els.expMedia;
    if (!container) return;
    container.requestFullscreen().catch(err => console.warn(err));
  }
  function exitFullscreen() {
    if (document.fullscreenElement) document.exitFullscreen();
  }

  let fsOverlayTimeout;
  function showFsOverlay() {
    if (!document.fullscreenElement) return;
    els.fsOverlay.style.display = "flex";
    els.fsOverlay.classList.add("visible");
    if (fsOverlayTimeout) clearTimeout(fsOverlayTimeout);
    fsOverlayTimeout = setTimeout(() => {
      if (els.fsOverlay) els.fsOverlay.classList.remove("visible");
    }, 3000);
  }
  function hideFsOverlay() {
    if (els.fsOverlay) els.fsOverlay.classList.remove("visible");
  }
  function toggleFsOverlay() {
    if (!document.fullscreenElement) return;
    if (els.fsOverlay.classList.contains("visible")) hideFsOverlay();
    else showFsOverlay();
  }

  function bindFullscreenEvents() {
    els.videoFsFloat.onclick = (e) => {
      e.stopPropagation();
      enterFullscreen();
    };
    document.addEventListener("fullscreenchange", () => {
      if (document.fullscreenElement) {
        // Entró a fullscreen
        els.videoFsFloat.classList.remove("visible");
        S.videoFloatVisible = false;
        els.fsOverlay.style.display = "flex";
        showFsOverlay();
        document.addEventListener("mousemove", showFsOverlay);
        document.addEventListener("click", toggleFsOverlay);
        videoEl.style.objectFit = "contain";
      } else {
        // Salió de fullscreen
        els.fsOverlay.style.display = "none";
        els.fsOverlay.classList.remove("visible");
        document.removeEventListener("mousemove", showFsOverlay);
        document.removeEventListener("click", toggleFsOverlay);
        if (fsOverlayTimeout) clearTimeout(fsOverlayTimeout);
      }
    });
    // Controles del overlay
    els.fsPlay.onclick = (e) => { e.stopPropagation(); togglePlay(); showFsOverlay(); };
    els.fsPrev.onclick = (e) => { e.stopPropagation(); prevTrack(); showFsOverlay(); };
    els.fsNext.onclick = (e) => { e.stopPropagation(); nextTrack(); showFsOverlay(); };
    els.fsProgress.onclick = (e) => {
      e.stopPropagation();
      const rect = els.fsProgress.getBoundingClientRect();
      const pct = (e.clientX - rect.left) / rect.width;
      seekTo(pct);
      showFsOverlay();
    };
    els.fsExit.onclick = (e) => { e.stopPropagation(); exitFullscreen(); };
    els.fsOverlay.addEventListener("click", (e) => e.stopPropagation());
  }

  /* ── Paneles ───────────────────────────────────────────── */
  let currentPanelType = null;

  function openPanelWithExpand(type) {
    if (!S.expanded) {
      S.pendingPanel = type;
      expand();
    } else {
      openPanel(type);
    }
  }

  function openPanel(type) {
    const titles = {
      queue: "A continuación",
      speed: "Velocidad de reproducción",
      timer: "Temporizador",
      share: "Compartir"
    };
    if (currentPanelType === type && els.sidePanel.classList.contains("open")) {
      closePanel();
      return;
    }
    els.panelTitle.textContent = titles[type] || "Panel";
    currentPanelType = type;
    if (type === "queue") buildQueuePanel();
    if (type === "speed") buildSpeedPanel();
    if (type === "timer") buildTimerPanel();
    if (type === "share") buildSharePanel();
    els.expMedia.classList.add("with-panel");
    els.sidePanel.classList.add("open");
    S.panelOpen = type;
  }

  function closePanel() {
    els.expMedia.classList.remove("with-panel");
    els.sidePanel.classList.remove("open");
    currentPanelType = null;
    S.panelOpen = null;
  }

  function buildSpeedPanel() {
    const speeds = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 3];
    els.panelBody.innerHTML = '<div class="mp-speed-grid">' + speeds.map(s =>
      `<div class="mp-speed-opt${S.speed===s?" active":""}" data-speed="${s}">${s}x</div>`
    ).join("") + '</div>';
    $$(".mp-speed-opt", els.panelBody).forEach(el => {
      el.onclick = () => {
        S.speed = parseFloat(el.dataset.speed);
        activeMedia().playbackRate = S.speed;
        updateSpeedUI();
        buildSpeedPanel();
        saveState();
      };
    });
  }

  function buildTimerPanel() {
    const presets = [5, 10, 15, 30, 45, 60];
    let html = `<div class="mp-timer-grid">
      <div class="mp-timer-presets">` + presets.map(m =>
        `<div class="mp-timer-opt${S.sleepMinutes===m?" active":""}" data-min="${m}">${m} min</div>`
      ).join("") + `</div>
      <div class="mp-timer-opt${S.endOfEpisodeTimer?" active end-of-episode":""}" data-end="episode">Fin del episodio</div>
    </div>`;
    html += `<div class="mp-timer-countdown" id="mp-timer-countdown"></div>`;
    html += `<div class="mp-timer-buttons">
      <button class="mp-timer-btn danger" id="mp-timer-cancel">Desactivar temporizador</button>
      <button class="mp-timer-btn" id="mp-timer-add5">Añadir 5 minutos</button>
    </div>`;
    els.panelBody.innerHTML = html;
    // Botones
    $$(".mp-timer-opt", els.panelBody).forEach(el => {
      el.onclick = () => {
        if (el.dataset.end === "episode") {
          clearSleepTimer();
          setEndOfEpisodeTimer();
          buildTimerPanel();
          saveState();
        } else {
          const m = parseInt(el.dataset.min);
          clearSleepTimer();
          cancelEndOfEpisodeTimer();
          S.sleepMinutes = m;
          if (m > 0) {
            S.sleepEndTime = Date.now() + (m * 60 * 1000);
            S.sleepTimer = setInterval(() => {
              checkSleepTimer();
              if (S.panelOpen === "timer") updateTimerPanelContent();
            }, 1000);
          }
          buildTimerPanel();
          saveState();
        }
      };
    });
    const cancelBtn = $("#mp-timer-cancel", els.panelBody);
    if (cancelBtn) cancelBtn.onclick = () => { clearSleepTimer(); cancelEndOfEpisodeTimer(); buildTimerPanel(); saveState(); };
    const add5Btn = $("#mp-timer-add5", els.panelBody);
    if (add5Btn) {
      add5Btn.onclick = () => {
        if (S.sleepEndTime) {
          S.sleepEndTime += 5 * 60 * 1000;
          if (S.sleepTimer) clearInterval(S.sleepTimer);
          S.sleepTimer = setInterval(() => {
            checkSleepTimer();
            if (S.panelOpen === "timer") updateTimerPanelContent();
          }, 1000);
          buildTimerPanel();
          saveState();
        } else if (S.endOfEpisodeTimer) {
          // No hacer nada para fin de episodio
        } else if (S.sleepMinutes === 0 && !S.endOfEpisodeTimer) {
          // Si no hay temporizador, añadir 5 minutos
          S.sleepMinutes = 5;
          S.sleepEndTime = Date.now() + (5 * 60 * 1000);
          S.sleepTimer = setInterval(() => {
            checkSleepTimer();
            if (S.panelOpen === "timer") updateTimerPanelContent();
          }, 1000);
          buildTimerPanel();
          saveState();
        }
      };
    }
    updateTimerPanelContent();
  }

  function updateTimerPanelContent() {
    const countdownDiv = $("#mp-timer-countdown", els.panelBody);
    if (!countdownDiv) return;
    let remaining = 0;
    let isEndEpisode = false;
    if (S.endOfEpisodeTimer) {
      remaining = getRemainingTime();
      isEndEpisode = true;
    } else if (S.sleepEndTime) {
      remaining = getSleepRemaining();
    }
    if (remaining > 0) {
      countdownDiv.innerHTML = `<div class="mp-countdown-number">${fmtLong(remaining)}</div><div style="font-size:0.9rem; opacity:0.8;">${isEndEpisode ? "restante del episodio" : "restantes"}</div>`;
    } else if (S.endOfEpisodeTimer) {
      countdownDiv.innerHTML = `<div class="mp-countdown-number">0:00</div><div style="font-size:0.9rem;">El episodio finalizará pronto</div>`;
    } else {
      countdownDiv.innerHTML = `<div style="opacity:0.6;">Sin temporizador activo</div>`;
    }
  }

  function buildSharePanel() {
    const url = S.detailUrl ? window.location.origin + S.detailUrl : window.location.href;
    const t = encodeURIComponent(S.title + " — " + S.author);
    const u = encodeURIComponent(url);
    const shares = [
      { name: "WhatsApp", url: `https://wa.me/?text=${t}%20${u}`, icon: "💬" },
      { name: "Twitter", url: `https://twitter.com/intent/tweet?text=${t}&url=${u}`, icon: "🐦" },
      { name: "Facebook", url: `https://www.facebook.com/sharer/sharer.php?u=${u}`, icon: "👍" },
      { name: "Telegram", url: `https://t.me/share/url?url=${u}&text=${t}`, icon: "📱" },
      { name: "Copiar", url: null, icon: "📋" },
    ];
    els.panelBody.innerHTML = '<div class="mp-share-grid">' + shares.map(s =>
      `<button class="mp-share-btn" data-url="${s.url||""}" data-name="${s.name}"><span style="font-size:28px">${s.icon}</span><span>${s.name}</span></button>`
    ).join("") + '</div>';
    $$(".mp-share-btn", els.panelBody).forEach(btn => {
      btn.onclick = () => {
        if (btn.dataset.name === "Copiar") {
          navigator.clipboard.writeText(url).then(() => {
            btn.querySelector("span:last-child").textContent = "¡Copiado!";
            setTimeout(() => btn.querySelector("span:last-child").textContent = "Copiar", 2000);
          });
        } else {
          window.open(btn.dataset.url, "_blank", "width=600,height=400");
        }
      };
    });
  }

  function buildQueuePanel() {
    if (!S.queue || !S.queue.length) {
      els.panelBody.innerHTML = '<p style="opacity:.5;padding:20px;text-align:center">No hay episodios en cola.</p>';
      return;
    }
    els.panelBody.innerHTML = S.queue.map((ep, i) =>
      `<div class="mp-queue-item${i===S.queueIndex?" active":""}" data-qi="${i}">
        <img class="mp-queue-img" src="${ep.coverUrl||""}" alt="" />
        <div class="mp-queue-info">
          <div class="mp-queue-title">${escapeHtml(ep.title||"")}</div>
          <div class="mp-queue-author">${escapeHtml(ep.author||"")}</div>
        </div>
      </div>`
    ).join("");
    $$(".mp-queue-item", els.panelBody).forEach(el => {
      el.onclick = () => {
        const idx = parseInt(el.dataset.qi);
        playQueueItem(idx);
      };
    });
  }

  function escapeHtml(str) {
    if (!str) return "";
    return str.replace(/[&<>]/g, function(m) {
      if (m === "&") return "&amp;";
      if (m === "<") return "&lt;";
      if (m === ">") return "&gt;";
      return m;
    });
  }

  function playQueueItem(idx) {
    if (!S.queue[idx]) return;
    const ep = S.queue[idx];
    S.queueIndex = idx;
    cancelEndOfEpisodeTimer();
    loadEpisode(ep.mediaUrl, ep.mediaVideo, ep.initialMode || "audio", ep.coverUrl, ep.coverInfo, ep.title, ep.detailUrl, ep.author, S.queue, ep.text, ep.subtitlesUrl, ep.bgColor, ep.allowDownload, ep.id);
    playMedia();
    buildQueuePanel();
    saveState();
  }

  /* ── Media control ─────────────────────────────────────── */
  function loadEpisode(mediaUrl, mediaVideo, initialMode, coverUrl, coverInfo, title, detailUrl, author, queue, text, subtitlesUrl, bgColor, allowDownload, episodeId) {
    pauseMedia();
    cancelEndOfEpisodeTimer();
    clearSleepTimer();

    S.mediaUrl = mediaUrl || "";
    S.mediaVideo = mediaVideo || "";
    S.coverUrl = coverUrl || coverInfo || "";
    S.coverInfo = coverInfo || coverUrl || "";
    S.title = title || "";
    S.detailUrl = detailUrl || "";
    S.author = author || "";
    S.queue = queue || [];
    S.text = text || "";
    S.subtitlesUrl = subtitlesUrl || "";
    S.bgColor = bgColor || "#111";
    S.allowDownload = allowDownload === true || allowDownload === "true";
    S.episodeId = episodeId || detailUrl;
    S.currentTime = 0;
    S.duration = 0;
    S.subtitlesOn = false;
    updateSubtitleUI();

    const hasAudio = !!S.mediaUrl;
    const hasVideo = !!S.mediaVideo;
    if (initialMode === "video" && hasVideo) S.mode = "video";
    else if (hasAudio) S.mode = "audio";
    else if (hasVideo) S.mode = "video";
    else S.mode = "audio";

    if (hasAudio) audioEl.src = S.mediaUrl;
    if (hasVideo) videoEl.src = S.mediaVideo;
    audioEl.playbackRate = S.speed;
    videoEl.playbackRate = S.speed;

    updateBg();
    updateMiniInfo();
    updatePlayBtn();
    updateMode();
    updateProgress();
    updateSpeedUI();
    updateMediaSession();
    syncLikedFromStorage();

    els.downloadBtn.style.display = S.allowDownload ? "inline-flex" : "none";
    els.mini.classList.add("visible");

    if (S.subtitlesUrl) loadSubtitles(S.subtitlesUrl);
    saveState();
  }

  function playMedia() {
    const media = activeMedia();
    if (!media || !media.src) return;
    media.play().catch(() => {});
    S.playing = true;
    updatePlayBtn();
    syncMediaStreams();
    if (navigator.mediaSession) navigator.mediaSession.playbackState = "playing";
    saveState();
  }

  function pauseMedia() {
    audioEl.pause();
    videoEl.pause();
    S.playing = false;
    updatePlayBtn();
    if (navigator.mediaSession) navigator.mediaSession.playbackState = "paused";
    saveState();
  }

  function togglePlay() {
    S.playing ? pauseMedia() : playMedia();
  }

  function syncMediaStreams() {
    if (S.mode === "video" && S.mediaVideo) {
      audioEl.pause();
      audioEl.muted = true;
      videoEl.muted = S.muted;
      videoEl.volume = S.volume;
      if (S.playing) videoEl.play().catch(() => {});
    } else {
      videoEl.pause();
      videoEl.muted = true;
      audioEl.muted = S.muted;
      audioEl.volume = S.volume;
      if (S.playing) audioEl.play().catch(() => {});
    }
  }

  function seekTo(pct) {
    const media = activeMedia();
    if (media && S.duration) {
      media.currentTime = pct * S.duration;
      S.currentTime = media.currentTime;
      updateProgress();
    }
  }

  function skip(offset) {
    const media = activeMedia();
    if (media && S.duration) {
      media.currentTime = Math.min(S.duration, Math.max(0, media.currentTime + offset));
    }
  }

  function nextTrack() {
    if (!S.queue || !S.queue.length) return;
    let next = S.queueIndex + 1;
    if (next >= S.queue.length) next = S.shuffle ? Math.floor(Math.random() * S.queue.length) : 0;
    if (S.queue[next]) playQueueItem(next);
  }

  function prevTrack() {
    if (!S.queue || !S.queue.length) return;
    let prev = S.queueIndex - 1;
    if (prev < 0) prev = S.queue.length - 1;
    if (S.queue[prev]) playQueueItem(prev);
  }

  function setVolume(v) {
    S.volume = clamp(v, 0, 1);
    S.muted = S.volume === 0;
    activeMedia().volume = S.volume;
    activeMedia().muted = S.muted;
    els.volFill.style.width = (S.volume * 100) + "%";
    els.volBtn.innerHTML = icon(S.muted ? "volMute" : "vol", 20);
    saveState();
  }

  /* ── Expand / Collapse ─────────────────────────────────── */
  function expand() {
    S.expanded = true;
    els.exp.classList.add("open");
    document.body.style.overflow = "hidden";
    updateMode();
    if (S.pendingPanel) {
      setTimeout(() => {
        openPanel(S.pendingPanel);
        S.pendingPanel = null;
      }, 400);
    }
  }

  function collapse() {
    S.expanded = false;
    els.exp.classList.remove("open");
    closePanel();
    document.body.style.overflow = "";
    S.pendingPanel = null;
    if (els.lyricsSubs) els.lyricsSubs.style.display = "none";
  }

  function toggleExpand() {
    if (S.expanded) collapse();
    else expand();
  }

  /* ── Navegación SPA (con botón dedicado) ──────────────── */
  function navigateToDetail() {
    if (!S.detailUrl) return;
    if (window.router && typeof window.router === "function") {
      window.history.pushState(null, null, S.detailUrl);
      window.router();
    } else {
      console.warn("Router no disponible, no se navega");
    }
  }

  /* ── Eventos ───────────────────────────────────────────── */
  function bindEvents() {
    els.playBtn.onclick = togglePlay;
    els.prevBtn.onclick = prevTrack;
    els.nextBtn.onclick = nextTrack;
    els.rewindBtn.onclick = () => skip(-15);
    els.forwardBtn.onclick = () => skip(15);
    els.repeatBtn.onclick = () => { S.repeat = !S.repeat; updateRepeatUI(); saveState(); };
    els.shuffleBtn.onclick = () => { S.shuffle = !S.shuffle; updateShuffleUI(); saveState(); };
    els.likeBtn.onclick = toggleLiked;
    els.queueBtn.onclick = () => openPanelWithExpand("queue");
    els.detailBtn.onclick = navigateToDetail;
    els.subtitleBtn.onclick = toggleSubtitles;
    els.downloadBtn.onclick = () => {
      const url = S.mode === "video" && S.mediaVideo ? S.mediaVideo : S.mediaUrl;
      if (url) {
        const a = document.createElement("a");
        a.href = url;
        a.download = S.title || "download";
        a.target = "_blank";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    };
    els.speedBtn.onclick = () => openPanelWithExpand("speed");
    els.timerBtn.onclick = () => openPanelWithExpand("timer");
    els.expandBtn.onclick = toggleExpand;
    els.panelClose.onclick = closePanel;
    els.expClose.onclick = collapse;

    $$(".mp-mode-opt", els.modeSwitch).forEach(btn => {
      btn.onclick = () => {
        if (btn.dataset.mode === S.mode) return;
        S.mode = btn.dataset.mode;
        const media = activeMedia();
        if (media.src) media.currentTime = S.currentTime;
        media.playbackRate = S.speed;
        syncMediaStreams();
        updateMode();
        saveState();
      };
    });

    els.miniProg.onclick = (e) => {
      const r = els.miniProg.getBoundingClientRect();
      seekTo((e.clientX - r.left) / r.width);
      saveState();
    };
    els.volBtn.onclick = () => { setVolume(S.muted ? (S.volume || 1) : 0); };
    els.volBar.onclick = (e) => {
      const r = els.volBar.getBoundingClientRect();
      setVolume((e.clientX - r.left) / r.width);
    };
    // También el clic en cover/título navega
    els.miniInfo.onclick = navigateToDetail;
    els.miniCover.onclick = navigateToDetail;

    function onTimeUpdate() {
      if (S.seekDragging) return;
      const m = activeMedia();
      S.currentTime = m.currentTime;
      S.duration = m.duration || 0;
      updateProgress();
      if (S.subtitlesUrl) updateSubtitles();
    }
    function onEnded() {
      if (S.repeat) {
        activeMedia().currentTime = 0;
        playMedia();
      } else {
        nextTrack();
      }
      saveState();
    }
    audioEl.addEventListener("timeupdate", onTimeUpdate);
    videoEl.addEventListener("timeupdate", onTimeUpdate);
    audioEl.addEventListener("loadedmetadata", () => { S.duration = audioEl.duration; updateProgress(); });
    videoEl.addEventListener("loadedmetadata", () => { S.duration = videoEl.duration; updateProgress(); });
    audioEl.addEventListener("ended", onEnded);
    videoEl.addEventListener("ended", onEnded);

    document.addEventListener("keydown", (e) => {
      if (!els.mini.classList.contains("visible")) return;
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
      if (e.code === "Space") { e.preventDefault(); togglePlay(); }
      if (e.code === "ArrowRight") skip(10);
      if (e.code === "ArrowLeft") skip(-10);
      if (e.code === "ArrowUp") { e.preventDefault(); setVolume(S.volume + 0.1); }
      if (e.code === "ArrowDown") { e.preventDefault(); setVolume(S.volume - 0.1); }
      if (e.code === "KeyF") { e.preventDefault(); enterFullscreen(); }
    });

    bindFullscreenEvents();
  }

  function updateRepeatUI() { els.repeatBtn.classList.toggle("active", S.repeat); }
  function updateShuffleUI() { els.shuffleBtn.classList.toggle("active", S.shuffle); }
  function updateSpeedUI() { els.speedBtn.textContent = S.speed + "x"; }
  function updateLikeUI() {
    els.likeBtn.innerHTML = icon(S.liked ? "liked" : "like", 22);
    if (S.liked) els.likeBtn.classList.add("active");
    else els.likeBtn.classList.remove("active");
  }

  /* ── Public API ────────────────────────────────────────── */
  window.playEpisodeExpanded = function (mediaUrl, mediaVideo, initialMode, coverUrl, coverInfo, title, detailUrl, author, queue, text, subtitlesUrl, bgColor, allowDownload, episodeId) {
    if (!els.mini) { buildUI(); refs(); bindEvents(); }
    loadEpisode(mediaUrl, mediaVideo, initialMode, coverUrl, coverInfo, title, detailUrl, author, queue, text, subtitlesUrl, bgColor, allowDownload, episodeId);
    playMedia();
    expand();
  };

  window.playEpisodeMini = function (mediaUrl, mediaVideo, initialMode, coverUrl, coverInfo, title, detailUrl, author, queue, text, subtitlesUrl, bgColor, allowDownload, episodeId) {
    if (!els.mini) { buildUI(); refs(); bindEvents(); }
    loadEpisode(mediaUrl, mediaVideo, initialMode, coverUrl, coverInfo, title, detailUrl, author, queue, text, subtitlesUrl, bgColor, allowDownload, episodeId);
    playMedia();
  };

  // Inicialización
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      buildUI(); refs(); bindEvents();
      els.mini.classList.add("visible");
      if (!restoreState()) {
        S.expanded = false;
        els.miniTitle.textContent = "Sin reproducción";
        els.miniAuthor.textContent = "Selecciona un episodio";
        els.miniCover.src = "";
      }
    });
  } else {
    buildUI(); refs(); bindEvents();
    els.mini.classList.add("visible");
    if (!restoreState()) {
      S.expanded = false;
      els.miniTitle.textContent = "Sin reproducción";
      els.miniAuthor.textContent = "Selecciona un episodio";
      els.miniCover.src = "";
    }
  }
})();
