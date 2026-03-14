/* ActivityLog.css */
@import "./ActivityLog.css";

.al-root { animation: reveal-in .5s ease both; }

.al-live-badge { display:flex; align-items:center; gap:6px; padding:5px 12px; background:rgba(39,201,176,.08); border:1px solid rgba(39,201,176,.2); border-radius:99px; font-size:11px; font-weight:700; color:var(--teal); letter-spacing:.06em; }
.al-live-dot { width:6px; height:6px; border-radius:50%; background:var(--teal); animation:pip-pulse 2s infinite; }

.al-stats { display:grid; grid-template-columns:repeat(4,1fr); gap:12px; margin-bottom:18px; }
.al-stat { background:var(--surface); border:1px solid var(--border); border-radius:14px; padding:18px 20px; transition:transform .25s; }
.al-stat:hover { transform:translateY(-2px); }
.al-stat.sc-indigo { border-top:2px solid var(--indigo-l); }
.al-stat.sc-rose   { border-top:2px solid var(--rose); }
.al-stat.sc-teal   { border-top:2px solid var(--teal); }
.al-stat.sc-amber  { border-top:2px solid var(--amber); }
.al-stat-val { font-family:'Fraunces',serif; font-size:28px; font-weight:400; margin-bottom:4px; }
.al-stat-lbl { font-size:11px; color:var(--text3); }

.al-feed { padding:6px 0; }
.al-item { border-bottom:1px solid var(--border); transition:background .15s; animation:reveal-in .4s ease both; }
.al-item:last-child { border-bottom:none; }
.al-item-main { display:flex; align-items:center; gap:12px; padding:13px 20px; cursor:pointer; user-select:none; }
.al-item-main:hover { background:rgba(255,255,255,.018); }
.al-icon { width:34px; height:34px; border-radius:9px; display:flex; align-items:center; justify-content:center; font-size:16px; flex-shrink:0; }
.log-teal   { background:rgba(39,201,176,.1);  border:1px solid rgba(39,201,176,.18); }
.log-indigo { background:rgba(91,78,248,.1);   border:1px solid rgba(91,78,248,.18); }
.log-rose   { background:rgba(242,68,92,.1);   border:1px solid rgba(242,68,92,.2); }
.log-violet { background:rgba(159,122,234,.1); border:1px solid rgba(159,122,234,.2); }
.log-amber  { background:rgba(244,165,53,.1);  border:1px solid rgba(244,165,53,.2); }
.al-body { flex:1; min-width:0; }
.al-action { font-size:12px; font-weight:500; color:var(--text); margin-bottom:5px; line-height:1.4; }
.al-meta { display:flex; align-items:center; gap:6px; flex-wrap:wrap; }
.al-user { font-size:11px; font-weight:600; color:var(--text2); }
.al-sep  { color:var(--text3); }
.al-time { font-size:10px; color:var(--text3); }
.al-type-badge { font-size:9px; font-weight:700; letter-spacing:.06em; text-transform:uppercase; padding:3px 8px; border-radius:5px; background:var(--surface2); color:var(--text3); border:1px solid var(--border); flex-shrink:0; }
.al-chevron { color:var(--text3); flex-shrink:0; transition:transform .25s; }
.al-chevron-open { transform:rotate(180deg); }
.al-detail { padding:0 20px 14px 66px; display:flex; flex-direction:column; gap:8px; }
.al-detail-row { display:flex; align-items:center; justify-content:space-between; font-size:11px; max-width:400px; }
.al-detail-row span:first-child { color:var(--text3); }
.al-detail-row span:last-child { color:var(--text2); font-weight:500; }

@media (max-width:700px) {
  .al-stats { grid-template-columns:repeat(2,1fr); }
}