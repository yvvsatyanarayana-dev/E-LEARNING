import { useState, useEffect, useRef, useCallback } from "react";

/* ─── GLOBAL STYLES injected once ─────────────────── */
const GLOBAL_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400&family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,500;1,9..144,300;1,9..144,400&display=swap');

:root {
  --bg:#020209; --bg2:#05050f; --surface:#0b0b1c; --surface2:#111128; --surface3:#18182e;
  --border:rgba(255,255,255,.042); --border2:rgba(255,255,255,.076); --border3:rgba(255,255,255,.12);
  --indigo:#5b4ef8; --indigo-l:#7b6ffa; --indigo-ll:#a89fff;
  --teal:#27c9b0; --amber:#f4a535; --rose:#f2445c; --violet:#9f7aea;
  --text:#ddddf0; --text2:#9898b8; --text3:#60608a; --muted:#44445e;
  --sw:242px;
}
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
html,body{scroll-behavior:smooth;background:var(--bg);color:var(--text);font-family:'Plus Jakarta Sans',sans-serif;overflow-x:hidden;line-height:1;cursor:none;min-height:100vh;}
::-webkit-scrollbar{width:5px;}
::-webkit-scrollbar-thumb{background:var(--border2);border-radius:5px;}

.sc-cursor{position:fixed;width:9px;height:9px;background:var(--indigo-l);border-radius:50%;pointer-events:none;z-index:9999;transform:translate(-50%,-50%);mix-blend-mode:screen;transition:width .16s,height .16s,background .16s;}
.sc-cursor-ring{position:fixed;width:30px;height:30px;border:1.5px solid rgba(91,78,248,.4);border-radius:50%;pointer-events:none;z-index:9998;transform:translate(-50%,-50%);transition:width .2s,height .2s;}
body.c-hover .sc-cursor{width:18px;height:18px;background:var(--indigo-ll);}
body.c-hover .sc-cursor-ring{width:46px;height:46px;}
body.c-click .sc-cursor{width:5px;height:5px;background:#fff;}

.sc-noise{position:fixed;inset:0;pointer-events:none;z-index:5000;opacity:.024;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.82' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");}

@keyframes pip-pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.35;transform:scale(.7)}}
@keyframes fab-glow{0%,100%{box-shadow:0 8px 32px rgba(91,78,248,.5)}50%{box-shadow:0 8px 48px rgba(91,78,248,.75),0 0 0 12px rgba(91,78,248,.06)}}
@keyframes fab-ring{0%,100%{transform:scale(1);opacity:.6}50%{transform:scale(1.2);opacity:0}}
@keyframes orb-ring{0%,100%{transform:scale(1);opacity:.6}50%{transform:scale(1.16);opacity:0}}
@keyframes msg-in{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
@keyframes dot-bounce{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-5px)}}
@keyframes ripple-out{to{transform:scale(4);opacity:0}}
@keyframes reveal-in{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}

.app{display:flex;min-height:100vh;}

/* SIDEBAR */
.sidebar{width:var(--sw);background:var(--bg2);border-right:1px solid var(--border);display:flex;flex-direction:column;position:fixed;top:0;left:0;bottom:0;z-index:100;}
.sb-top{padding:20px 18px 16px;border-bottom:1px solid var(--border);flex-shrink:0;}
.sb-brand{display:flex;align-items:center;gap:10px;text-decoration:none;}
.sb-mark{width:30px;height:30px;border-radius:8px;background:linear-gradient(140deg,var(--indigo),var(--violet));display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:800;color:#fff;letter-spacing:.04em;flex-shrink:0;}
.sb-name{font-size:13px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;color:var(--text);}
.sb-user{display:flex;align-items:center;gap:10px;padding:14px 18px;border-bottom:1px solid var(--border);flex-shrink:0;}
.sb-avatar{width:36px;height:36px;border-radius:50%;flex-shrink:0;background:linear-gradient(135deg,rgba(91,78,248,.35),rgba(159,122,234,.25));border:1.5px solid rgba(91,78,248,.28);display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;color:var(--indigo-ll);}
.sb-uname{font-size:12.5px;font-weight:600;}
.sb-urole{font-size:10px;color:var(--text3);margin-top:3px;font-weight:300;}
.sb-nav{flex:1;overflow-y:auto;padding:10px;}
.sb-nav::-webkit-scrollbar{width:3px;}
.sb-nav::-webkit-scrollbar-thumb{background:var(--border2);border-radius:3px;}
.sb-sec-label{font-size:9px;font-weight:700;letter-spacing:.15em;text-transform:uppercase;color:var(--text3);padding:10px 8px 5px;}
.sb-link{display:flex;align-items:center;gap:9px;padding:9px 10px;border-radius:8px;text-decoration:none;color:var(--text2);font-size:12.5px;font-weight:500;transition:all .18s;cursor:none;margin-bottom:1px;border:1px solid transparent;}
.sb-link:hover{color:var(--text);background:rgba(255,255,255,.04);}
.sb-link.active{color:var(--indigo-ll);background:rgba(91,78,248,.1);border-color:rgba(91,78,248,.13);}
.sb-link svg{opacity:.65;flex-shrink:0;transition:opacity .18s;}
.sb-link.active svg{opacity:1;color:var(--indigo-l);}
.sb-link:hover svg{opacity:.9;}
.sb-badge{margin-left:auto;font-size:9px;font-weight:700;padding:2px 7px;border-radius:10px;background:rgba(91,78,248,.14);color:var(--indigo-ll);border:1px solid rgba(91,78,248,.2);}
.sb-badge.rose{background:rgba(242,68,92,.12);color:var(--rose);border-color:rgba(242,68,92,.22);}
.sb-badge.teal{background:rgba(39,201,176,.1);color:var(--teal);border-color:rgba(39,201,176,.2);}
.sb-bottom{padding:12px 10px;border-top:1px solid var(--border);flex-shrink:0;}
.sb-pri{background:linear-gradient(135deg,rgba(91,78,248,.09),rgba(39,201,176,.05));border:1px solid rgba(91,78,248,.16);border-radius:10px;padding:12px 14px;margin-bottom:6px;}
.sb-pri-lbl{font-size:9px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--text3);margin-bottom:6px;}
.sb-pri-val{font-family:'Fraunces',serif;font-size:24px;font-weight:400;color:var(--teal);line-height:1;}
.sb-pri-sub{font-size:9.5px;color:var(--text3);margin-top:3px;}
.sb-pri-bar{height:3px;background:var(--surface3);border-radius:2px;margin-top:10px;overflow:hidden;}
.sb-pri-fill{height:100%;background:linear-gradient(90deg,var(--indigo),var(--teal));border-radius:2px;transition:width 1.2s ease;}

/* MAIN */
.main{margin-left:var(--sw);flex:1;display:flex;flex-direction:column;}

/* TOPBAR */
.topbar{position:sticky;top:0;z-index:90;height:58px;padding:0 30px;display:flex;align-items:center;gap:14px;background:rgba(2,2,9,.88);backdrop-filter:blur(24px) saturate(1.5);border-bottom:1px solid var(--border);}
.tb-page{font-size:14px;font-weight:600;}
.tb-sep{width:1px;height:20px;background:var(--border2);}
.tb-search{display:flex;align-items:center;gap:8px;padding:0 12px;background:var(--surface2);border:1px solid var(--border);border-radius:8px;height:34px;flex:0 0 220px;transition:border-color .2s;}
.tb-search:focus-within{border-color:rgba(91,78,248,.4);}
.tb-search input{background:none;border:none;outline:none;font-family:'Plus Jakarta Sans',sans-serif;font-size:12px;color:var(--text);width:100%;cursor:text;}
.tb-search input::placeholder{color:var(--text3);}
.tb-right{display:flex;align-items:center;gap:8px;margin-left:auto;}
.tb-icon-btn{width:34px;height:34px;border-radius:8px;background:var(--surface2);border:1px solid var(--border);display:flex;align-items:center;justify-content:center;cursor:none;transition:background .2s,border-color .2s;position:relative;color:var(--text2);}
.tb-icon-btn:hover{background:var(--surface3);border-color:var(--border2);}
.notif-dot{position:absolute;top:6px;right:6px;width:6px;height:6px;border-radius:50%;background:var(--rose);border:1.5px solid var(--bg);animation:pip-pulse 2.2s infinite;}
.tb-date{font-size:11px;color:var(--text3);font-weight:300;}

/* CONTENT */
.content{padding:26px 30px 80px;flex:1;}

/* GREETING */
.greet-row{margin-bottom:26px;animation:reveal-in .5s ease both;}
.greet-tag{display:inline-flex;align-items:center;gap:7px;padding:4px 12px 4px 7px;border-radius:99px;border:1px solid rgba(91,78,248,.22);background:rgba(91,78,248,.06);margin-bottom:10px;}
.greet-pip{width:16px;height:16px;border-radius:50%;background:rgba(91,78,248,.18);border:1px solid rgba(91,78,248,.4);display:flex;align-items:center;justify-content:center;}
.greet-pip::after{content:'';width:5px;height:5px;border-radius:50%;background:var(--indigo-l);display:block;animation:pip-pulse 2.2s infinite;}
.greet-pip-txt{font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--indigo-ll);}
.greet-title{font-family:'Fraunces',serif;font-size:28px;font-weight:400;line-height:1.1;color:var(--text);}
.greet-title em{font-style:italic;color:var(--indigo-ll);}
.greet-sub{font-size:13px;color:var(--text2);font-weight:300;margin-top:6px;line-height:1.6;}
.greet-actions{display:flex;gap:8px;margin-top:14px;}

/* STATS */
.stat-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:18px;}
.stat-card{background:var(--surface);border:1px solid var(--border);border-radius:14px;padding:18px 20px;position:relative;overflow:hidden;transition:border-color .25s,transform .25s;cursor:default;animation:reveal-in .5s ease both;}
.stat-card:hover{border-color:var(--border2);transform:translateY(-2px);}
.stat-card::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;border-radius:2px 2px 0 0;}
.sc-indigo::before{background:var(--indigo-l);} .sc-teal::before{background:var(--teal);}
.sc-amber::before{background:var(--amber);} .sc-violet::before{background:var(--violet);}
.stat-ic{width:34px;height:34px;border-radius:9px;display:flex;align-items:center;justify-content:center;margin-bottom:12px;}
.sc-indigo .stat-ic{background:rgba(91,78,248,.12);color:var(--indigo-ll);}
.sc-teal   .stat-ic{background:rgba(39,201,176,.1);color:var(--teal);}
.sc-amber  .stat-ic{background:rgba(244,165,53,.1);color:var(--amber);}
.sc-violet .stat-ic{background:rgba(159,122,234,.1);color:var(--violet);}
.stat-val{font-family:'Fraunces',serif;font-size:28px;font-weight:400;line-height:1;margin-bottom:4px;}
.stat-lbl{font-size:11px;color:var(--text3);margin-bottom:8px;}
.stat-delta{font-size:10px;font-weight:600;padding:2px 7px;border-radius:5px;display:inline-flex;align-items:center;gap:3px;}
.delta-up{background:rgba(39,201,176,.1);color:var(--teal);}
.delta-dn{background:rgba(242,68,92,.1);color:var(--rose);}
.delta-neu{background:rgba(244,165,53,.1);color:var(--amber);}

/* PANEL */
.panel{background:var(--surface);border:1px solid var(--border);border-radius:14px;overflow:hidden;margin-bottom:16px;animation:reveal-in .5s ease both;}
.panel-hd{display:flex;align-items:center;justify-content:space-between;padding:15px 20px;border-bottom:1px solid var(--border);}
.panel-ttl{font-size:13px;font-weight:600;display:flex;align-items:center;gap:8px;}
.panel-ttl span{font-size:10px;color:var(--text3);font-weight:400;}
.panel-act{font-size:11px;color:var(--indigo-ll);cursor:none;transition:color .2s;display:flex;align-items:center;gap:4px;text-decoration:none;}
.panel-act:hover{color:var(--indigo-l);}
.panel-body{padding:16px 20px;}

/* COURSES */
.course-list{display:flex;flex-direction:column;gap:9px;}
.course-item{display:flex;align-items:center;gap:13px;padding:12px 14px;border-radius:10px;border:1px solid var(--border);background:var(--surface2);transition:border-color .2s,background .2s;cursor:default;}
.course-item:hover{border-color:rgba(91,78,248,.18);background:var(--surface3);}
.ci-badge{width:36px;height:36px;border-radius:9px;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.ci-info{flex:1;min-width:0;}
.ci-name{font-size:12.5px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.ci-meta{font-size:10.5px;color:var(--text3);margin-top:2px;}
.ci-prog{margin-top:7px;}
.ci-prog-bar{height:3px;background:var(--surface3);border-radius:2px;overflow:hidden;}
.ci-prog-fill{height:100%;border-radius:2px;transition:width 1.1s ease;}
.ci-prog-lbl{display:flex;justify-content:space-between;margin-top:4px;}
.ci-prog-pct{font-size:9.5px;font-weight:600;}
.ci-prog-next{font-size:9.5px;color:var(--text3);}
.ci-right{flex-shrink:0;text-align:right;}
.ci-grade{font-size:11px;font-weight:700;padding:3px 8px;border-radius:6px;display:inline-block;}
.ci-due{font-size:9px;color:var(--text3);margin-top:5px;white-space:nowrap;}

/* BOTTOM GRID */
.bottom-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;}

/* SCHEDULE */
.sched-list{display:flex;flex-direction:column;gap:8px;}
.sched-item{display:flex;gap:12px;align-items:stretch;padding:11px 13px;border-radius:10px;border:1px solid var(--border);background:var(--surface2);transition:border-color .2s;cursor:default;}
.sched-item:hover{border-color:rgba(91,78,248,.18);}
.sched-time{text-align:center;flex-shrink:0;width:44px;}
.st-from{font-size:10px;font-weight:600;}
.st-to{font-size:9px;color:var(--text3);margin-top:2px;}
.sched-div{width:2px;border-radius:2px;flex-shrink:0;}
.sched-info{flex:1;}
.si-name{font-size:12px;font-weight:600;margin-bottom:2px;}
.si-room{font-size:10px;color:var(--text3);}
.si-tag{font-size:9px;font-weight:600;padding:2px 7px;border-radius:4px;margin-top:5px;display:inline-block;}

/* QUIZ */
.quiz-list{display:flex;flex-direction:column;gap:8px;}
.quiz-item{padding:12px 13px;border-radius:10px;border:1px solid var(--border);background:var(--surface2);transition:border-color .2s;cursor:default;}
.quiz-item:hover{border-color:rgba(91,78,248,.18);}
.qi-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;}
.qi-name{font-size:12px;font-weight:600;}
.qi-score{font-size:11px;font-weight:700;padding:2px 8px;border-radius:5px;}
.qi-bar{height:3px;background:var(--surface3);border-radius:2px;overflow:hidden;margin-bottom:5px;}
.qi-fill{height:100%;border-radius:2px;}
.qi-meta{display:flex;justify-content:space-between;font-size:9.5px;color:var(--text3);}

/* SKILLS */
.skill-list{display:flex;flex-direction:column;gap:9px;}
.skill-item{display:flex;align-items:center;gap:10px;}
.sk-label{font-size:11.5px;color:var(--text2);width:92px;flex-shrink:0;}
.sk-track{flex:1;height:5px;background:var(--surface3);border-radius:3px;overflow:hidden;}
.sk-fill{height:100%;border-radius:3px;transition:width 1.2s cubic-bezier(.16,1,.3,1);}
.sk-pct{font-size:10px;font-weight:600;width:32px;text-align:right;}
.skill-summary{margin-top:14px;padding:12px;background:linear-gradient(135deg,rgba(91,78,248,.08),rgba(39,201,176,.04));border:1px solid rgba(91,78,248,.14);border-radius:10px;}
.ss-ttl{font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--text3);margin-bottom:8px;}
.ss-pri{display:flex;align-items:center;gap:8px;}
.ss-pri-val{font-family:'Fraunces',serif;font-size:30px;font-weight:400;color:var(--teal);line-height:1;}
.ss-pri-info{flex:1;}
.ss-pri-bar{height:4px;background:var(--surface3);border-radius:2px;overflow:hidden;}
.ss-pri-fill{height:100%;border-radius:2px;background:linear-gradient(90deg,var(--indigo),var(--teal));transition:width 1.2s ease;}
.ss-pri-lbl{font-size:9.5px;color:var(--text3);margin-top:4px;}

/* BUTTONS */
.btn{font-family:'Plus Jakarta Sans',sans-serif;font-size:12px;font-weight:600;padding:8px 18px;border-radius:8px;cursor:none;transition:all .2s;letter-spacing:.02em;border:none;display:inline-flex;align-items:center;gap:6px;position:relative;overflow:hidden;}
.btn-solid{background:var(--indigo);color:#fff;box-shadow:0 0 18px rgba(91,78,248,.3);}
.btn-solid:hover{background:var(--indigo-l);transform:translateY(-1px);box-shadow:0 0 26px rgba(91,78,248,.45);}
.btn-ghost{background:var(--surface2);border:1px solid var(--border2);color:var(--text2);}
.btn-ghost:hover{border-color:var(--border3);color:var(--text);background:var(--surface3);}
.btn:active{transform:scale(.96)!important;}
.ripple{position:absolute;border-radius:50%;background:rgba(255,255,255,.18);transform:scale(0);animation:ripple-out .55s ease-out forwards;pointer-events:none;}

/* LUCYNA FAB */
.lucyna-fab{position:fixed;bottom:28px;right:28px;z-index:800;width:60px;height:60px;border-radius:50%;border:none;cursor:none;background:linear-gradient(140deg,var(--indigo),var(--violet));display:flex;align-items:center;justify-content:center;box-shadow:0 8px 32px rgba(91,78,248,.5);transition:transform .22s cubic-bezier(.16,1,.3,1);animation:fab-glow 3s ease-in-out infinite;}
.lucyna-fab:hover{transform:scale(1.1);}
.lucyna-fab:active{transform:scale(.92);}
.lucyna-fab-ring{position:absolute;inset:-7px;border-radius:50%;border:1.5px solid rgba(91,78,248,.38);animation:fab-ring 2.6s ease-in-out infinite;pointer-events:none;}
.lucyna-fab-tip{position:absolute;right:72px;top:50%;transform:translateY(-50%) translateX(6px);background:var(--surface);border:1px solid var(--border2);border-radius:8px;padding:6px 12px;white-space:nowrap;font-size:11px;font-weight:600;color:var(--indigo-ll);opacity:0;pointer-events:none;transition:opacity .2s,transform .2s;}
.lucyna-fab:hover .lucyna-fab-tip{opacity:1;transform:translateY(-50%) translateX(0);}
.lucyna-fab-dot{position:absolute;top:4px;right:4px;width:9px;height:9px;border-radius:50%;background:var(--teal);border:1.5px solid var(--bg);animation:pip-pulse 2s infinite;}

/* LUCYNA PANEL */
.lucyna-panel{position:fixed;bottom:104px;right:28px;z-index:850;width:370px;background:var(--surface);border:1px solid var(--border2);border-radius:22px;box-shadow:0 40px 120px rgba(0,0,0,.75),0 0 0 1px rgba(91,78,248,.07);display:flex;flex-direction:column;transform:translateY(18px) scale(.95);opacity:0;pointer-events:none;transition:transform .34s cubic-bezier(.16,1,.3,1),opacity .26s ease;overflow:hidden;}
.lucyna-panel::before{content:'';position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,var(--indigo),var(--teal),transparent);opacity:.5;z-index:1;}
.lucyna-panel.open{transform:translateY(0) scale(1);opacity:1;pointer-events:all;}
.lp-header{padding:14px 16px 13px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:10px;background:linear-gradient(135deg,rgba(91,78,248,.07),rgba(159,122,234,.03));flex-shrink:0;}
.lp-orb{width:38px;height:38px;border-radius:50%;flex-shrink:0;background:linear-gradient(135deg,var(--indigo),var(--violet));display:flex;align-items:center;justify-content:center;position:relative;box-shadow:0 0 20px rgba(91,78,248,.38);}
.lp-orb::after{content:'';position:absolute;inset:6px;border-radius:50%;background:radial-gradient(circle,rgba(255,255,255,.24) 0%,transparent 70%);}
.lp-orb svg{position:relative;z-index:1;}
.lp-orb-ring{position:absolute;inset:-5px;border-radius:50%;border:1px solid rgba(91,78,248,.32);animation:orb-ring 2.6s ease-in-out infinite;}
.lp-name{font-size:13px;font-weight:700;color:var(--indigo-ll);}
.lp-status{font-size:9.5px;color:var(--text3);margin-top:2px;display:flex;align-items:center;gap:5px;}
.lp-dot{width:5px;height:5px;border-radius:50%;background:var(--teal);animation:pip-pulse 2s infinite;}
.lp-close{margin-left:auto;width:28px;height:28px;border-radius:7px;background:var(--surface2);border:1px solid var(--border);display:flex;align-items:center;justify-content:center;cursor:none;color:var(--text3);transition:background .2s,color .2s;flex-shrink:0;}
.lp-close:hover{background:var(--surface3);color:var(--text);}
.lp-messages{flex:1;padding:14px 14px 10px;display:flex;flex-direction:column;gap:10px;max-height:300px;overflow-y:auto;}
.lp-messages::-webkit-scrollbar{width:3px;}
.lp-messages::-webkit-scrollbar-thumb{background:var(--border2);border-radius:3px;}
.lp-msg{display:flex;gap:8px;animation:msg-in .28s ease both;}
.lp-msg.user{flex-direction:row-reverse;}
.msg-av{width:26px;height:26px;border-radius:50%;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;}
.ai-av{background:linear-gradient(135deg,var(--indigo),var(--violet));color:#fff;}
.usr-av{background:rgba(91,78,248,.2);color:var(--indigo-ll);border:1px solid rgba(91,78,248,.3);}
.msg-bubble{max-width:83%;padding:9px 13px;border-radius:12px;font-size:11.5px;line-height:1.6;font-weight:300;}
.msg-bubble.ai{background:var(--surface2);border:1px solid var(--border);color:var(--text2);border-radius:4px 12px 12px 12px;}
.msg-bubble.user{background:rgba(91,78,248,.12);border:1px solid rgba(91,78,248,.2);color:var(--text);border-radius:12px 4px 12px 12px;}
.msg-bubble strong{font-weight:600;}
.lp-suggestions{padding:0 14px 10px;display:flex;flex-wrap:wrap;gap:6px;}
.lp-chip{font-size:10.5px;font-weight:500;padding:5px 12px;border-radius:20px;background:var(--surface2);border:1px solid var(--border2);color:var(--text2);cursor:none;transition:all .18s;}
.lp-chip:hover{border-color:rgba(91,78,248,.3);color:var(--indigo-ll);background:rgba(91,78,248,.07);}
.lp-input-row{padding:11px 12px;border-top:1px solid var(--border);display:flex;gap:7px;align-items:center;flex-shrink:0;}
.lp-input{flex:1;background:var(--surface2);border:1px solid var(--border);border-radius:9px;padding:9px 12px;font-family:'Plus Jakarta Sans',sans-serif;font-size:12px;color:var(--text);outline:none;transition:border-color .2s;cursor:text;}
.lp-input::placeholder{color:var(--text3);}
.lp-input:focus{border-color:rgba(91,78,248,.42);}
.lp-send{width:36px;height:36px;border-radius:9px;flex-shrink:0;background:var(--indigo);border:none;cursor:none;display:flex;align-items:center;justify-content:center;color:#fff;transition:background .2s,transform .15s;box-shadow:0 0 14px rgba(91,78,248,.35);}
.lp-send:hover{background:var(--indigo-l);transform:scale(1.08);}
.typing-dots{display:flex;gap:4px;align-items:center;padding:4px 2px;}
.typing-dots span{width:5px;height:5px;border-radius:50%;background:var(--text3);display:block;animation:dot-bounce .9s ease-in-out infinite;}
.typing-dots span:nth-child(2){animation-delay:.18s;}
.typing-dots span:nth-child(3){animation-delay:.36s;}
`;

/* ─── SVG ICONS ───────────────────────────────────── */
const Icon = ({ d, size = 16, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    {Array.isArray(d) ? d.map((p, i) => <path key={i} d={p} />) : <path d={d} />}
  </svg>
);
const IcoDashboard = (p) => <svg {...p} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>;
const IcoBar    = (p) => <svg {...p} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>;
const IcoBook   = (p) => <svg {...p} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>;
const IcoVideo  = (p) => <svg {...p} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>;
const IcoFile   = (p) => <svg {...p} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="15" y2="17"/></svg>;
const IcoClock  = (p) => <svg {...p} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const IcoSun    = (p) => <svg {...p} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/></svg>;
const IcoUsers  = (p) => <svg {...p} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const IcoCal    = (p) => <svg {...p} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const IcoAward  = (p) => <svg {...p} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>;
const IcoBrief  = (p) => <svg {...p} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>;
const IcoPen    = (p) => <svg {...p} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>;
const IcoSettings=(p)=><svg {...p} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 1 0 0 14.14"/><path d="M19.07 4.93L16 8"/></svg>;
const IcoBell   = (p) => <svg {...p} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>;
const IcoUser   = (p) => <svg {...p} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M6 20v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/></svg>;
const IcoSearch = (p) => <svg {...p} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const IcoChevR  = (p) => <svg {...p} width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>;
const IcoChevUp = (p) => <svg {...p} width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="18 15 12 9 6 15"/></svg>;
const IcoChevDn = (p) => <svg {...p} width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>;
const IcoMinus  = (p) => <svg {...p} width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const IcoPlus   = (p) => <svg {...p} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const IcoPlay   = (p) => <svg {...p} width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>;
const IcoSend   = (p) => <svg {...p} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2" fill="#fff" stroke="none"/></svg>;
const IcoClose  = (p) => <svg {...p} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const IcoBrain  = (p) => <svg {...p} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-1.66Z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-1.66Z"/></svg>;

/* ─── DATA ────────────────────────────────────────── */
const COURSES = [
  { name:"Operating Systems", meta:"Dr. S. Prakash · 42 lectures", pct:78, color:"var(--indigo-l)", grade:"A", gradeStyle:{background:"rgba(39,201,176,.1)",color:"var(--teal)"}, due:"Quiz · Today",
    icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>,
    badgeStyle:{background:"rgba(91,78,248,.12)",color:"var(--indigo-ll)"}, pctColor:"var(--indigo-ll)", next:"Next: Memory Mgmt" },
  { name:"Database Management Systems", meta:"Prof. R. Nair · 38 lectures", pct:61, color:"var(--teal)", grade:"A−", gradeStyle:{background:"rgba(91,78,248,.1)",color:"var(--indigo-ll)"}, due:"Asgmt · 2 days",
    icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>,
    badgeStyle:{background:"rgba(39,201,176,.1)",color:"var(--teal)"}, pctColor:"var(--teal)", next:"Next: Transactions" },
  { name:"Machine Learning Fundamentals", meta:"Dr. A. Kumar · 36 lectures", pct:44, color:"var(--amber)", grade:"B+", gradeStyle:{background:"rgba(244,165,53,.1)",color:"var(--amber)"}, due:"Project · 5 days",
    icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>,
    badgeStyle:{background:"rgba(244,165,53,.1)",color:"var(--amber)"}, pctColor:"var(--amber)", next:"Next: SVM Classifiers" },
  { name:"Computer Networks", meta:"Prof. T. Mehta · 40 lectures", pct:55, color:"var(--violet)", grade:"A", gradeStyle:{background:"rgba(159,122,234,.1)",color:"var(--violet)"}, due:"Lab · Tomorrow",
    icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/></svg>,
    badgeStyle:{background:"rgba(159,122,234,.1)",color:"var(--violet)"}, pctColor:"var(--violet)", next:"Next: TCP/IP Stack" },
  { name:"Cryptography & Network Security", meta:"Dr. P. Sharma · 34 lectures", pct:32, color:"var(--rose)", grade:"B", gradeStyle:{background:"rgba(242,68,92,.1)",color:"var(--rose)"}, due:"Asgmt · Today",
    icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
    badgeStyle:{background:"rgba(242,68,92,.1)",color:"var(--rose)"}, pctColor:"var(--rose)", next:"Next: RSA Algorithm" },
];

const SCHEDULE = [
  { from:"09:00", to:"10:00", name:"Operating Systems", room:"Room 301 · Dr. Prakash", tag:"Lecture", color:"var(--teal)", tagStyle:{background:"rgba(39,201,176,.1)",color:"var(--teal)"} },
  { from:"10:30", to:"11:30", name:"OS Quiz — Unit III", room:"Exam Hall B", tag:"Quiz Today", color:"var(--amber)", tagStyle:{background:"rgba(244,165,53,.12)",color:"var(--amber)"} },
  { from:"13:00", to:"14:30", name:"DBMS Lab", room:"Lab 2 · Prof. Nair", tag:"Lab", color:"var(--indigo-l)", tagStyle:{background:"rgba(91,78,248,.1)",color:"var(--indigo-ll)"} },
  { from:"15:00", to:"16:00", name:"ML — SVM Classifiers", room:"Room 204 · Dr. Kumar", tag:"Lecture", color:"var(--violet)", tagStyle:{background:"rgba(159,122,234,.1)",color:"var(--violet)"} },
  { from:"16:30", to:"17:00", name:"Mock Interview Session", room:"Placement Cell · AI Sim", tag:"Career", color:"var(--rose)", tagStyle:{background:"rgba(242,68,92,.1)",color:"var(--rose)"} },
];

const QUIZZES = [
  { name:"OS – Process Scheduling",   score:"92%", pct:92, scoreStyle:{background:"rgba(39,201,176,.1)",color:"var(--teal)"},      bar:"var(--teal)",     answered:"20/20 answered", rank:"Rank 3rd / 112" },
  { name:"DBMS – Normalization",      score:"85%", pct:85, scoreStyle:{background:"rgba(91,78,248,.1)",color:"var(--indigo-ll)"},   bar:"var(--indigo-l)", answered:"17/20 answered", rank:"Rank 8th / 112" },
  { name:"CN – OSI Layers",           score:"78%", pct:78, scoreStyle:{background:"rgba(159,122,234,.1)",color:"var(--violet)"},   bar:"var(--violet)",   answered:"15/20 answered", rank:"Rank 14th / 112" },
  { name:"ML – Linear Regression",    score:"71%", pct:71, scoreStyle:{background:"rgba(244,165,53,.1)",color:"var(--amber)"},     bar:"var(--amber)",    answered:"14/20 answered", rank:"Rank 22nd / 112" },
  { name:"Crypto – Symmetric Keys",   score:"58%", pct:58, scoreStyle:{background:"rgba(242,68,92,.1)",color:"var(--rose)"},       bar:"var(--rose)",     answered:"11/20 answered", rank:"Rank 51st / 112" },
];

const SKILLS = [
  { label:"DSA",             pct:82, color:"var(--teal)",     pctColor:"var(--teal)" },
  { label:"Python",          pct:74, color:"var(--indigo-l)", pctColor:"var(--indigo-ll)" },
  { label:"SQL",             pct:68, color:"var(--violet)",   pctColor:"var(--violet)" },
  { label:"Machine Learning",pct:55, color:"var(--amber)",    pctColor:"var(--amber)" },
  { label:"System Design",   pct:41, color:"var(--rose)",     pctColor:"var(--rose)" },
  { label:"Communication",   pct:77, color:"linear-gradient(90deg,var(--indigo),var(--teal))", pctColor:"var(--indigo-ll)" },
];

const NAV_ITEMS = [
  { section:"Overview", links:[
    { label:"Dashboard",    icon:<IcoDashboard/>, active:true },
    { label:"Analytics",    icon:<IcoBar/>,      badge:"New" },
  ]},
  { section:"Learning", links:[
    { label:"My Courses",   icon:<IcoBook/>,  badge:"6" },
    { label:"Video Lectures",icon:<IcoVideo/> },
    { label:"Assignments",  icon:<IcoFile/>,  badge:"3", badgeClass:"rose" },
    { label:"Quizzes",      icon:<IcoClock/> },
  ]},
  { section:"Campus", links:[
    { label:"Innovation Hub",icon:<IcoSun/>   },
    { label:"Study Groups",  icon:<IcoUsers/> },
    { label:"Schedule",      icon:<IcoCal/>   },
  ]},
  { section:"Career", links:[
    { label:"Placement Prep",icon:<IcoAward/> },
    { label:"Internships",   icon:<IcoBrief/> },
    { label:"Mock Interviews",icon:<IcoPen/>  },
  ]},
];

const AI_RESPONSES = [
  "Great question! Process scheduling determines which process gets CPU time and for how long. 🎓",
  "Based on your history, your <strong style='color:var(--rose)'>weakest area</strong> is Cryptography at 58%. Want a focused drill?",
  "For <strong style='color:var(--teal)'>deadlock detection</strong>, remember: Mutual Exclusion, Hold & Wait, No Preemption, and Circular Wait.",
  "I've prepared 5 MCQs on Round Robin. Your predicted score: <strong style='color:var(--amber)'>76–84%</strong> based on past patterns. Ready? ✨",
  "Your CGPA of 8.4 puts you in the <strong style='color:var(--teal)'>top 15%</strong>. Improving Crypto would push you to the top 10%.",
];

/* ─── RIPPLE HANDLER ──────────────────────────────── */
function addRipple(e, el) {
  const r = document.createElement("span");
  r.className = "ripple";
  const rect = el.getBoundingClientRect();
  const s = Math.max(rect.width, rect.height);
  r.style.cssText = `width:${s}px;height:${s}px;left:${e.clientX - rect.left - s / 2}px;top:${e.clientY - rect.top - s / 2}px`;
  el.appendChild(r);
  r.addEventListener("animationend", () => r.remove());
}

/* ─── CUSTOM CURSOR HOOK ──────────────────────────── */
function useCursor() {
  useEffect(() => {
    const cur = document.getElementById("sc-cursor");
    const ring = document.getElementById("sc-ring");
    if (!cur || !ring) return;
    let mx = 0, my = 0, rx = 0, ry = 0, rafId;
    const onMove = (e) => { mx = e.clientX; my = e.clientY; };
    const tick = () => {
      cur.style.left = mx + "px"; cur.style.top = my + "px";
      rx += (mx - rx) * 0.12; ry += (my - ry) * 0.12;
      ring.style.left = rx + "px"; ring.style.top = ry + "px";
      rafId = requestAnimationFrame(tick);
    };
    const onDown = () => document.body.classList.add("c-click");
    const onUp   = () => document.body.classList.remove("c-click");
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("mouseup", onUp);
    rafId = requestAnimationFrame(tick);
    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("mouseup", onUp);
      cancelAnimationFrame(rafId);
    };
  }, []);
}

/* ─── HOVERABLE WRAPPER ───────────────────────────── */
function Hoverable({ children, className = "", style, ...rest }) {
  const enter = () => document.body.classList.add("c-hover");
  const leave = () => document.body.classList.remove("c-hover");
  return <div className={className} style={style} onMouseEnter={enter} onMouseLeave={leave} {...rest}>{children}</div>;
}

/* ─── BUTTON WITH RIPPLE ──────────────────────────── */
function Btn({ children, className = "", onClick, style }) {
  const ref = useRef();
  const enter = () => document.body.classList.add("c-hover");
  const leave = () => document.body.classList.remove("c-hover");
  return (
    <button ref={ref} className={`btn ${className}`} style={style}
      onMouseEnter={enter} onMouseLeave={leave}
      onClick={(e) => { addRipple(e, ref.current); onClick && onClick(e); }}>
      {children}
    </button>
  );
}

/* ─── PROGRESS BAR (animated) ────────────────────── */
function AnimBar({ pct, color, height = 3 }) {
  const [w, setW] = useState(0);
  useEffect(() => { const t = setTimeout(() => setW(pct), 500); return () => clearTimeout(t); }, [pct]);
  return (
    <div style={{ height, background:"var(--surface3)", borderRadius:2, overflow:"hidden" }}>
      <div style={{ height:"100%", width:`${w}%`, background:color, borderRadius:2, transition:"width 1.1s ease" }} />
    </div>
  );
}

/* ─── SIDEBAR ─────────────────────────────────────── */
function Sidebar() {
  const [priW, setPriW] = useState(0);
  useEffect(() => { const t = setTimeout(() => setPriW(72), 600); return () => clearTimeout(t); }, []);
  const enter = () => document.body.classList.add("c-hover");
  const leave = () => document.body.classList.remove("c-hover");
  return (
    <aside className="sidebar">
      <div className="sb-top">
        <a href="#" className="sb-brand" onMouseEnter={enter} onMouseLeave={leave}>
          <div className="sb-mark">SC</div>
          <span className="sb-name">SmartCampus</span>
        </a>
      </div>
      <div className="sb-user">
        <div className="sb-avatar">AR</div>
        <div>
          <div className="sb-uname">Arjun Reddy</div>
          <div className="sb-urole">CSE · Sem 5 · Roll 21CS047</div>
        </div>
      </div>
      <nav className="sb-nav">
        {NAV_ITEMS.map(({ section, links }) => (
          <div key={section}>
            <div className="sb-sec-label">{section}</div>
            {links.map(({ label, icon, active, badge, badgeClass }) => (
              <a key={label} href="#" className={`sb-link ${active ? "active" : ""}`}
                onMouseEnter={enter} onMouseLeave={leave}
                onClick={e => e.preventDefault()}>
                {icon}
                {label}
                {badge && <span className={`sb-badge ${badgeClass || ""}`}>{badge}</span>}
              </a>
            ))}
          </div>
        ))}
      </nav>
      <div className="sb-bottom">
        <div className="sb-pri">
          <div className="sb-pri-lbl">Placement Readiness Index</div>
          <div className="sb-pri-val">72</div>
          <div className="sb-pri-sub">Good · 13 pts to Excellent</div>
          <div className="sb-pri-bar">
            <div className="sb-pri-fill" style={{ width: `${priW}%` }} />
          </div>
        </div>
        <a href="#" className="sb-link" onMouseEnter={enter} onMouseLeave={leave}
          onClick={e => e.preventDefault()}>
          <IcoSettings /> Settings
        </a>
      </div>
    </aside>
  );
}

/* ─── TOPBAR ──────────────────────────────────────── */
function Topbar() {
  const enter = () => document.body.classList.add("c-hover");
  const leave = () => document.body.classList.remove("c-hover");
  const date = new Date().toLocaleDateString("en-IN", { weekday:"short", day:"numeric", month:"short" });
  return (
    <div className="topbar">
      <span className="tb-page">Dashboard</span>
      <div className="tb-sep" />
      <div className="tb-search">
        <IcoSearch style={{ color:"var(--text3)", flexShrink:0 }} />
        <input type="text" placeholder="Search courses, topics, people…" />
      </div>
      <div className="tb-right">
        <span className="tb-date">{date}</span>
        <div className="tb-icon-btn" onMouseEnter={enter} onMouseLeave={leave}>
          <IcoBell /> <div className="notif-dot" />
        </div>
        <div className="tb-icon-btn" onMouseEnter={enter} onMouseLeave={leave}>
          <IcoUser />
        </div>
        <Btn className="btn-solid" style={{ padding:"7px 16px", fontSize:11, gap:5 }}>
          <IcoPlus /> Resume
        </Btn>
      </div>
    </div>
  );
}

/* ─── LUCYNA PANEL ────────────────────────────────── */
function LucynaPanel({ open, onClose }) {
  const [messages, setMessages] = useState([
    { role:"ai",  html:"Hey Arjun! 👋 You have an <strong style='color:var(--indigo-ll)'>OS quiz</strong> today. Want a quick recap on <strong style='color:var(--teal)'>Process Scheduling</strong>?" },
    { role:"user",html:"Yes! Especially Round Robin and Priority Scheduling." },
    { role:"ai",  html:"<strong style='color:var(--teal)'>Round Robin</strong> uses a fixed time quantum (10–20ms). Each process gets equal CPU time — no starvation, but higher avg turnaround for long jobs.<br/><br/>Your quiz has 3 questions on this. Want a practice set? 🎯" },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [showChips, setShowChips] = useState(true);
  const [aiIdx, setAiIdx] = useState(0);
  const msgRef = useRef();
  const enter = () => document.body.classList.add("c-hover");
  const leave = () => document.body.classList.remove("c-hover");

  useEffect(() => {
    if (msgRef.current) msgRef.current.scrollTop = msgRef.current.scrollHeight;
  }, [messages, typing]);

  const send = useCallback((text) => {
    const val = text || input.trim();
    if (!val) return;
    setMessages(m => [...m, { role:"user", html:val }]);
    setInput("");
    setShowChips(false);
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMessages(m => [...m, { role:"ai", html:AI_RESPONSES[aiIdx % AI_RESPONSES.length] }]);
      setAiIdx(i => i + 1);
    }, 950);
  }, [input, aiIdx]);

  return (
    <div className={`lucyna-panel ${open ? "open" : ""}`}>
      <div className="lp-header">
        <div className="lp-orb">
          <div className="lp-orb-ring" />
          <IcoBrain width={17} height={17} />
        </div>
        <div>
          <div className="lp-name">Lucyna AI Mentor</div>
          <div className="lp-status"><div className="lp-dot" />Online · Always available</div>
        </div>
        <button className="lp-close" onClick={onClose} onMouseEnter={enter} onMouseLeave={leave}>
          <IcoClose />
        </button>
      </div>

      <div className="lp-messages" ref={msgRef}>
        {messages.map((m, i) => (
          <div key={i} className={`lp-msg ${m.role === "user" ? "user" : ""}`}>
            <div className={`msg-av ${m.role === "ai" ? "ai-av" : "usr-av"}`}>{m.role === "ai" ? "L" : "A"}</div>
            <div className={`msg-bubble ${m.role}`} dangerouslySetInnerHTML={{ __html: m.html }} />
          </div>
        ))}
        {typing && (
          <div className="lp-msg">
            <div className="msg-av ai-av">L</div>
            <div className="msg-bubble ai"><div className="typing-dots"><span/><span/><span/></div></div>
          </div>
        )}
      </div>

      {showChips && (
        <div className="lp-suggestions">
          {["Practice MCQs","Explain Deadlock","My weak topics","Quick summary"].map(c => (
            <span key={c} className="lp-chip" onMouseEnter={enter} onMouseLeave={leave}
              onClick={() => send(c)}>{c}</span>
          ))}
        </div>
      )}

      <div className="lp-input-row">
        <input className="lp-input" value={input} placeholder="Ask anything about your coursework…"
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && send()} />
        <button className="lp-send" onClick={() => send()} onMouseEnter={enter} onMouseLeave={leave}>
          <IcoSend />
        </button>
      </div>
    </div>
  );
}

/* ─── LUCYNA FAB ──────────────────────────────────── */
function LucynaFab({ onClick }) {
  const enter = () => document.body.classList.add("c-hover");
  const leave = () => document.body.classList.remove("c-hover");
  return (
    <button className="lucyna-fab" onClick={onClick} onMouseEnter={enter} onMouseLeave={leave}
      aria-label="Open Lucyna AI">
      <div className="lucyna-fab-ring" />
      <div className="lucyna-fab-dot" />
      <IcoBrain />
      <span className="lucyna-fab-tip">Ask Lucyna AI</span>
    </button>
  );
}

/* ─── MAIN DASHBOARD ──────────────────────────────── */
export default function StudentDashboard() {
  const [aiOpen, setAiOpen] = useState(false);
  useCursor();

  /* inject global styles once */
  useEffect(() => {
    const id = "sc-global-styles";
    if (document.getElementById(id)) return;
    const s = document.createElement("style");
    s.id = id; s.textContent = GLOBAL_CSS;
    document.head.appendChild(s);
    return () => { /* keep styles for hot-reload friendliness */ };
  }, []);

  /* close panel on Escape */
  useEffect(() => {
    const h = (e) => { if (e.key === "Escape") setAiOpen(false); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, []);

  return (
    <>
      {/* Custom cursor */}
      <div className="sc-cursor" id="sc-cursor" />
      <div className="sc-cursor-ring" id="sc-ring" />
      <div className="sc-noise" />

      {/* Lucyna floating UI */}
      <LucynaFab onClick={() => setAiOpen(o => !o)} />
      <LucynaPanel open={aiOpen} onClose={() => setAiOpen(false)} />

      <div className="app">
        <Sidebar />
        <main className="main">
          <Topbar />
          <div className="content">

            {/* ── GREETING ── */}
            <div className="greet-row">
              <div className="greet-tag">
                <div className="greet-pip" />
                <span className="greet-pip-txt">Semester 5 · Week 11</span>
              </div>
              <h1 className="greet-title">Good morning, <em>Arjun</em></h1>
              <p className="greet-sub">You have 3 pending assignments and 1 quiz due today. Let's get ahead.</p>
              <div className="greet-actions">
                <Btn className="btn-solid"><IcoPlay /> Continue Learning</Btn>
                <Btn className="btn-ghost"><IcoCal /> View Schedule</Btn>
              </div>
            </div>

            {/* ── STATS ── */}
            <div className="stat-grid">
              {[
                { cls:"sc-indigo", icon:<IcoBook width={18} height={18}/>, val:"6",   lbl:"Active Courses",      delta:<><IcoChevUp/>2 this semester</>,   dc:"delta-up" },
                { cls:"sc-teal",   icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>, val:"8.4", lbl:"Current CGPA", delta:<><IcoChevUp/>+0.2 vs last sem</>, dc:"delta-up" },
                { cls:"sc-amber",  icon:<IcoUsers width={18} height={18}/>, val:"83%",lbl:"Attendance Rate",      delta:<><IcoChevDn/>Min 75% required</>,  dc:"delta-dn" },
                { cls:"sc-violet", icon:<IcoAward width={18} height={18}/>, val:"72", lbl:"Placement Readiness",  delta:<><IcoMinus/>Improving steadily</>, dc:"delta-neu" },
              ].map(({ cls, icon, val, lbl, delta, dc }, i) => (
                <Hoverable key={lbl} className={`stat-card ${cls}`} style={{ animationDelay:`${(i+1)*0.07}s` }}>
                  <div className="stat-ic">{icon}</div>
                  <div className="stat-val">{val}</div>
                  <div className="stat-lbl">{lbl}</div>
                  <span className={`stat-delta ${dc}`}>{delta}</span>
                </Hoverable>
              ))}
            </div>

            {/* ── COURSES ── */}
            <div className="panel" style={{ animationDelay:"0.07s" }}>
              <div className="panel-hd">
                <div className="panel-ttl">
                  <IcoBook width={14} height={14} style={{ color:"var(--indigo-ll)" }} />
                  Active Courses <span>6 enrolled</span>
                </div>
                <a href="#" className="panel-act"
                  onMouseEnter={() => document.body.classList.add("c-hover")}
                  onMouseLeave={() => document.body.classList.remove("c-hover")}
                  onClick={e => e.preventDefault()}>
                  View all <IcoChevR />
                </a>
              </div>
              <div className="panel-body">
                <div className="course-list">
                  {COURSES.map((c) => (
                    <Hoverable key={c.name} className="course-item">
                      <div className="ci-badge" style={c.badgeStyle}>{c.icon}</div>
                      <div className="ci-info">
                        <div className="ci-name">{c.name}</div>
                        <div className="ci-meta">{c.meta}</div>
                        <div className="ci-prog">
                          <AnimBar pct={c.pct} color={c.color} />
                          <div className="ci-prog-lbl">
                            <span className="ci-prog-pct" style={{ color:c.pctColor }}>{c.pct}%</span>
                            <span className="ci-prog-next">{c.next}</span>
                          </div>
                        </div>
                      </div>
                      <div className="ci-right">
                        <div className="ci-grade" style={c.gradeStyle}>{c.grade}</div>
                        <div className="ci-due">{c.due}</div>
                      </div>
                    </Hoverable>
                  ))}
                </div>
              </div>
            </div>

            {/* ── BOTTOM GRID ── */}
            <div className="bottom-grid">

              {/* Schedule */}
              <div className="panel" style={{ animationDelay:"0.07s" }}>
                <div className="panel-hd">
                  <div className="panel-ttl">
                    <IcoCal width={14} height={14} style={{ color:"var(--indigo-ll)" }} />
                    Today's Schedule <span>Fri, 28 Feb</span>
                  </div>
                  <a href="#" className="panel-act"
                    onMouseEnter={() => document.body.classList.add("c-hover")}
                    onMouseLeave={() => document.body.classList.remove("c-hover")}
                    onClick={e => e.preventDefault()}>Full week <IcoChevR /></a>
                </div>
                <div className="panel-body">
                  <div className="sched-list">
                    {SCHEDULE.map((s) => (
                      <Hoverable key={s.from} className="sched-item">
                        <div className="sched-time">
                          <div className="st-from" style={{ color:s.color }}>{s.from}</div>
                          <div className="st-to">{s.to}</div>
                        </div>
                        <div className="sched-div" style={{ background:s.color }} />
                        <div className="sched-info">
                          <div className="si-name">{s.name}</div>
                          <div className="si-room">{s.room}</div>
                          <span className="si-tag" style={s.tagStyle}>{s.tag}</span>
                        </div>
                      </Hoverable>
                    ))}
                  </div>
                </div>
              </div>

              {/* Quiz */}
              <div className="panel" style={{ animationDelay:"0.12s" }}>
                <div className="panel-hd">
                  <div className="panel-ttl">
                    <IcoClock width={14} height={14} style={{ color:"var(--indigo-ll)" }} />
                    Quiz Performance <span>Last 30 days</span>
                  </div>
                  <a href="#" className="panel-act"
                    onMouseEnter={() => document.body.classList.add("c-hover")}
                    onMouseLeave={() => document.body.classList.remove("c-hover")}
                    onClick={e => e.preventDefault()}>History <IcoChevR /></a>
                </div>
                <div className="panel-body">
                  <div className="quiz-list">
                    {QUIZZES.map((q) => (
                      <Hoverable key={q.name} className="quiz-item">
                        <div className="qi-top">
                          <span className="qi-name">{q.name}</span>
                          <span className="qi-score" style={q.scoreStyle}>{q.score}</span>
                        </div>
                        <div className="qi-bar">
                          <div className="qi-fill" style={{ width:`${q.pct}%`, background:q.bar }} />
                        </div>
                        <div className="qi-meta">
                          <span>{q.answered}</span><span>{q.rank}</span>
                        </div>
                      </Hoverable>
                    ))}
                  </div>
                </div>
              </div>

              {/* Skills */}
              <div className="panel" style={{ animationDelay:"0.18s" }}>
                <div className="panel-hd">
                  <div className="panel-ttl">
                    <IcoBar width={14} height={14} style={{ color:"var(--indigo-ll)" }} />
                    Skill Tracker
                  </div>
                  <a href="#" className="panel-act"
                    onMouseEnter={() => document.body.classList.add("c-hover")}
                    onMouseLeave={() => document.body.classList.remove("c-hover")}
                    onClick={e => e.preventDefault()}>Full report <IcoChevR /></a>
                </div>
                <div className="panel-body">
                  <div className="skill-list">
                    {SKILLS.map((s) => {
                      const [w, setW] = useState(0);
                      useEffect(() => { const t = setTimeout(() => setW(s.pct), 600); return () => clearTimeout(t); }, []);
                      return (
                        <Hoverable key={s.label} className="skill-item">
                          <span className="sk-label">{s.label}</span>
                          <div className="sk-track">
                            <div className="sk-fill" style={{ width:`${w}%`, background:s.color }} />
                          </div>
                          <span className="sk-pct" style={{ color:s.pctColor }}>{s.pct}%</span>
                        </Hoverable>
                      );
                    })}
                  </div>
                  <div className="skill-summary">
                    <div className="ss-ttl">Placement Readiness Index</div>
                    <div className="ss-pri">
                      <div className="ss-pri-val">72</div>
                      <div className="ss-pri-info">
                        <div className="ss-pri-bar">
                          <PriBar />
                        </div>
                        <div className="ss-pri-lbl">Good · Target 85 for excellent tier</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>{/* /bottom-grid */}
          </div>{/* /content */}
        </main>
      </div>
    </>
  );
}

/* small helper to avoid hook-in-loop for PRI bar */
function PriBar() {
  const [w, setW] = useState(0);
  useEffect(() => { const t = setTimeout(() => setW(72), 700); return () => clearTimeout(t); }, []);
  return <div className="ss-pri-fill" style={{ width:`${w}%` }} />;
}