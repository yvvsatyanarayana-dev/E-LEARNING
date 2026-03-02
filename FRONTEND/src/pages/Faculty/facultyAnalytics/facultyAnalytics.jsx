// facultyAnalytics.jsx
// Can be rendered inside FacultyDashboard when the Analytics page is active

import { useState, useEffect } from "react";
import "./facultyAnalytics.css";

// ─── ICONS (same set as FacultyDashboard) ────────────────────────
const IcoBar     = (p) => <svg {...p} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>;
const IcoBook    = (p) => <svg {...p} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>;
const IcoUsers   = (p) => <svg {...p} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const IcoClock   = (p) => <svg {...p} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const IcoTrend   = (p) => <svg {...p} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>;
const IcoChevUp  = (p) => <svg {...p} width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="18 15 12 9 6 15"/></svg>;
const IcoChevDn  = (p) => <svg {...p} width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>;
const IcoMinus   = (p) => <svg {...p} width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const IcoChevR   = (p) => <svg {...p} width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>;
const IcoAward   = (p) => <svg {...p} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>;
const IcoAlert   = (p) => <svg {...p} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;
const IcoFilter  = (p) => <svg {...p} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>;
const IcoDownload= (p) => <svg {...p} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>;
const IcoRefresh = (p) => <svg {...p} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>;

// ─── DATA ────────────────────────────────────────────────────────

const WEEKLY_SCORES = {
  "CS501": [62, 68, 71, 74, 78, 74, 77],
  "CS502": [55, 60, 63, 65, 68, 71, 68],
  "CS503": [70, 73, 75, 78, 79, 82, 79],
};
const WEEKS = ["W5", "W6", "W7", "W8", "W9", "W10", "W11"];

const ATTENDANCE_WEEKLY = {
  "CS501": [84, 81, 86, 83, 88, 81, 85],
  "CS502": [78, 74, 72, 76, 79, 76, 74],
  "CS503": [90, 88, 91, 87, 92, 89, 91],
};

const SCORE_DIST = [
  { range: "90–100", count: 8,  pct: 7  },
  { range: "80–89",  count: 22, pct: 20 },
  { range: "70–79",  count: 34, pct: 30 },
  { range: "60–69",  count: 28, pct: 25 },
  { range: "50–59",  count: 14, pct: 13 },
  { range: "< 50",   count: 6,  pct: 5  },
];

const ENGAGEMENT = [
  { label: "Mon", lectures: 88, submissions: 42, quizzes: 12 },
  { label: "Tue", lectures: 79, submissions: 68, quizzes: 34 },
  { label: "Wed", lectures: 91, submissions: 55, quizzes: 8  },
  { label: "Thu", lectures: 84, submissions: 72, quizzes: 45 },
  { label: "Fri", lectures: 76, submissions: 84, quizzes: 28 },
  { label: "Sat", lectures: 34, submissions: 22, quizzes: 6  },
  { label: "Sun", lectures: 18, submissions: 10, quizzes: 2  },
];

const TOP_PERFORMERS = [
  { name: "Arjun Reddy",  roll: "21CS047", os: 92, dbms: 88, ca: 85, avg: 88.3, trend: "up"    },
  { name: "Priya Nair",   roll: "21CS031", os: 88, dbms: 91, ca: 82, avg: 87.0, trend: "up"    },
  { name: "Rohan Mehta",  roll: "21CS019", os: 84, dbms: 79, ca: 88, avg: 83.7, trend: "up"    },
  { name: "Sneha Sharma", roll: "21CS062", os: 86, dbms: 80, ca: 81, avg: 82.3, trend: "stable" },
  { name: "Dev Iyer",     roll: "21CS008", os: 78, dbms: 82, ca: 79, avg: 79.7, trend: "down"  },
  { name: "Kavya Singh",  roll: "21CS055", os: 75, dbms: 80, ca: 84, avg: 79.7, trend: "up"    },
];

const AT_RISK = [
  { name: "Raj Kumar",    roll: "21CS072", attendance: 62, avgScore: 41, missed: 3, risk: "high"   },
  { name: "Anita Verma",  roll: "21CS044", attendance: 68, avgScore: 48, missed: 2, risk: "high"   },
  { name: "Suresh P.",    roll: "21CS083", attendance: 72, avgScore: 52, missed: 2, risk: "medium" },
  { name: "Meena S.",     roll: "21CS016", attendance: 74, avgScore: 55, missed: 1, risk: "medium" },
];

const COURSE_SUMMARY = [
  { code: "CS501", name: "Operating Systems",    color: "var(--indigo-l)", colorRaw: "#7b6ffa",
    enrolled: 112, avgScore: 74, avgAttend: 81, completion: 79,
    quizCount: 4, asgmtCount: 4, highestScore: 98, lowestScore: 32 },
  { code: "CS502", name: "Database Mgmt. Sys.",  color: "var(--teal)",     colorRaw: "#27c9b0",
    enrolled: 108, avgScore: 68, avgAttend: 76, completion: 61,
    quizCount: 3, asgmtCount: 3, highestScore: 95, lowestScore: 28 },
  { code: "CS503", name: "Computer Architecture",color: "var(--violet)",   colorRaw: "#9f7aea",
    enrolled: 96,  avgScore: 79, avgAttend: 88, completion: 78,
    quizCount: 3, asgmtCount: 3, highestScore: 100, lowestScore: 44 },
];

const WEAK_TOPIC_TREND = [
  { topic: "Deadlock Detection",      course: "CS501", week9: 38, week10: 32, week11: 30, change: -8 },
  { topic: "Transaction Isolation",   course: "CS502", week9: 44, week10: 40, week11: 38, change: -6 },
  { topic: "Page Replacement Algos",  course: "CS501", week9: 28, week10: 26, week11: 25, change: -3 },
  { topic: "B+ Tree Indexing",        course: "CS502", week9: 22, week10: 21, week11: 20, change: -2 },
  { topic: "Cache Coherence",         course: "CS503", week9: 18, week10: 20, week11: 20, change: +2 },
];

const TABS = [
  { id: "overview",    label: "Overview",    icon: <IcoBar    width={13} height={13} /> },
  { id: "courses",     label: "Courses",     icon: <IcoBook   width={13} height={13} /> },
  { id: "students",    label: "Students",    icon: <IcoUsers  width={13} height={13} /> },
  { id: "engagement",  label: "Engagement",  icon: <IcoClock  width={13} height={13} /> },
];

const PERIODS = ["This Week", "Last 30 Days", "Semester"];

// ─── HELPERS ─────────────────────────────────────────────────────
function AnimBar({ pct, color, height = 4, delay = 400, animate = true }) {
  const [w, setW] = useState(animate ? 0 : pct);
  useEffect(() => {
    if (!animate) return;
    const t = setTimeout(() => setW(pct), delay);
    return () => clearTimeout(t);
  }, [pct, delay, animate]);
  return (
    <div style={{ height, background: "var(--surface3)", borderRadius: 3, overflow: "hidden" }}>
      <div style={{ height: "100%", width: `${w}%`, background: color, borderRadius: 3, transition: "width 1.1s cubic-bezier(.16,1,.3,1)" }} />
    </div>
  );
}

// ── SVG line-chart (pure, no library) ──
function LineChart({ datasets, labels, height = 140 }) {
  const W = 560, H = height, PAD = { t: 16, r: 12, b: 28, l: 36 };
  const inner = { w: W - PAD.l - PAD.r, h: H - PAD.t - PAD.b };

  const allVals = datasets.flatMap(d => d.values);
  const minV = Math.min(...allVals) - 4;
  const maxV = Math.max(...allVals) + 4;

  const cx = (i) => PAD.l + (i / (labels.length - 1)) * inner.w;
  const cy = (v) => PAD.t + inner.h - ((v - minV) / (maxV - minV)) * inner.h;

  const pathD = (vals) => vals.map((v, i) => `${i === 0 ? "M" : "L"}${cx(i).toFixed(1)},${cy(v).toFixed(1)}`).join(" ");
  const areaD = (vals) => `${pathD(vals)} L${cx(vals.length - 1)},${(PAD.t + inner.h).toFixed(1)} L${PAD.l},${(PAD.t + inner.h).toFixed(1)} Z`;

  const gridVals = [minV, minV + (maxV - minV) * 0.33, minV + (maxV - minV) * 0.66, maxV].map(Math.round);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ overflow: "visible", display: "block" }}>
      {/* Grid lines */}
      {gridVals.map((v, i) => (
        <g key={i}>
          <line x1={PAD.l} y1={cy(v)} x2={W - PAD.r} y2={cy(v)}
            stroke="rgba(255,255,255,.045)" strokeWidth="1" strokeDasharray="4 4" />
          <text x={PAD.l - 6} y={cy(v)} fill="rgba(255,255,255,.3)"
            fontSize="8" textAnchor="end" dominantBaseline="middle">{v}%</text>
        </g>
      ))}
      {/* X labels */}
      {labels.map((l, i) => (
        <text key={i} x={cx(i)} y={H - 6} fill="rgba(255,255,255,.3)"
          fontSize="9" textAnchor="middle">{l}</text>
      ))}
      {/* Area fills */}
      {datasets.map((d, di) => (
        <path key={`a${di}`} d={areaD(d.values)} fill={d.color} opacity="0.07" />
      ))}
      {/* Lines */}
      {datasets.map((d, di) => (
        <path key={`l${di}`} d={pathD(d.values)} fill="none"
          stroke={d.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      ))}
      {/* Dots */}
      {datasets.map((d, di) =>
        d.values.map((v, i) => (
          <circle key={`${di}-${i}`} cx={cx(i)} cy={cy(v)} r="3"
            fill={d.color} stroke="var(--surface)" strokeWidth="1.5" />
        ))
      )}
    </svg>
  );
}

// ── SVG horizontal bar chart ──
function HBarChart({ data }) {
  const max = Math.max(...data.map(d => d.count));
  return (
    <div className="hbar-list">
      {data.map((d, i) => (
        <div key={i} className="hbar-row">
          <span className="hbar-label">{d.range}</span>
          <div className="hbar-track">
            <AnimBar pct={(d.count / max) * 100} color={
              i === 0 ? "var(--teal)" : i === 1 ? "var(--indigo-l)" :
              i === 2 ? "var(--violet)" : i === 3 ? "var(--amber)" :
              i === 4 ? "var(--rose)" : "rgba(242,68,92,.5)"
            } height={10} delay={300 + i * 80} />
          </div>
          <span className="hbar-count">{d.count}</span>
          <span className="hbar-pct">{d.pct}%</span>
        </div>
      ))}
    </div>
  );
}

// ── SVG donut chart ──
function Donut({ segments, size = 88, stroke = 14 }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke="var(--surface3)" strokeWidth={stroke} />
      {segments.map((s, i) => {
        const dash = (s.pct / 100) * circ;
        const gap  = circ - dash;
        const offset = segments.slice(0, i).reduce((acc, seg) => acc + (seg.pct / 100) * circ, 0);
        return (
          <circle key={i} cx={size / 2} cy={size / 2} r={r} fill="none"
            stroke={s.color} strokeWidth={stroke}
            strokeDasharray={`${dash} ${gap}`}
            strokeDashoffset={-offset}
            strokeLinecap="butt" />
        );
      })}
    </svg>
  );
}

// ── Grouped bar chart (SVG) ──
function GroupedBar({ data, keys, colors, height = 130 }) {
  const W = 520, H = height, PAD = { t: 10, r: 10, b: 24, l: 28 };
  const inner = { w: W - PAD.l - PAD.r, h: H - PAD.t - PAD.b };
  const maxV = Math.max(...data.flatMap(d => keys.map(k => d[k])));
  const bw = (inner.w / data.length) * 0.55;
  const gap = bw / keys.length * 0.15;
  const bPerGroup = bw / keys.length;

  const barX = (gi, ki) => PAD.l + (gi + 0.5) * (inner.w / data.length) - bw / 2 + ki * (bPerGroup + gap);
  const barH = (v) => (v / maxV) * inner.h;
  const barY = (v) => PAD.t + inner.h - barH(v);

  const gridLines = [0, 25, 50, 75, 100];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ overflow: "visible", display: "block" }}>
      {gridLines.map(v => (
        <g key={v}>
          <line x1={PAD.l} y1={PAD.t + inner.h - (v / maxV) * inner.h}
            x2={W - PAD.r} y2={PAD.t + inner.h - (v / maxV) * inner.h}
            stroke="rgba(255,255,255,.04)" strokeWidth="1" />
          <text x={PAD.l - 4} y={PAD.t + inner.h - (v / maxV) * inner.h}
            fill="rgba(255,255,255,.25)" fontSize="7.5" textAnchor="end" dominantBaseline="middle">{v}</text>
        </g>
      ))}
      {data.map((d, gi) => (
        <g key={gi}>
          {keys.map((k, ki) => (
            <rect key={ki}
              x={barX(gi, ki)} y={barY(d[k])}
              width={bPerGroup} height={barH(d[k])}
              rx="2" fill={colors[ki]} opacity="0.85" />
          ))}
          <text x={PAD.l + (gi + 0.5) * (inner.w / data.length)} y={H - 6}
            fill="rgba(255,255,255,.3)" fontSize="8.5" textAnchor="middle">{d.label}</text>
        </g>
      ))}
    </svg>
  );
}

// ─── OVERVIEW TAB ─────────────────────────────────────────────────
function TabOverview() {
  const scoreDatasets = [
    { label: "CS501", values: WEEKLY_SCORES["CS501"], color: "var(--indigo-l)" },
    { label: "CS502", values: WEEKLY_SCORES["CS502"], color: "var(--teal)" },
    { label: "CS503", values: WEEKLY_SCORES["CS503"], color: "var(--violet)" },
  ];
  const attendDatasets = [
    { label: "CS501", values: ATTENDANCE_WEEKLY["CS501"], color: "var(--indigo-l)" },
    { label: "CS502", values: ATTENDANCE_WEEKLY["CS502"], color: "var(--teal)" },
    { label: "CS503", values: ATTENDANCE_WEEKLY["CS503"], color: "var(--violet)" },
  ];

  return (
    <div className="an-tab-content">
      {/* KPI row */}
      <div className="an-kpi-grid">
        {[
          { cls: "sc-teal",   val: "316", lbl: "Total Students", delta: <><IcoChevUp/>+12</>, dc: "delta-up",  icon: <IcoUsers  width={17} height={17}/> },
          { cls: "sc-indigo", val: "73%", lbl: "Avg Class Score", delta: <><IcoChevUp/>+2%</>, dc: "delta-up",  icon: <IcoAward  width={17} height={17}/> },
          { cls: "sc-amber",  val: "82%", lbl: "Avg Attendance",  delta: <><IcoChevDn/>−3%</>, dc: "delta-dn",  icon: <IcoUsers  width={17} height={17}/> },
          { cls: "sc-violet", val: "78%", lbl: "Course Progress", delta: <><IcoChevUp/>+5%</>, dc: "delta-up",  icon: <IcoBook   width={17} height={17}/> },
          { cls: "sc-rose",   val: "4",   lbl: "At-Risk Students",delta: <><IcoMinus/>Unchanged</>, dc: "delta-neu", icon: <IcoAlert  width={17} height={17}/> },
          { cls: "sc-indigo", val: "84",  lbl: "Quizzes Graded",  delta: <><IcoChevUp/>+18</>, dc: "delta-up",  icon: <IcoClock  width={17} height={17}/> },
        ].map(({ cls, val, lbl, delta, dc, icon }) => (
          <div key={lbl} className={`an-kpi-card ${cls}`}>
            <div className="an-kpi-ic">{icon}</div>
            <div className="an-kpi-val">{val}</div>
            <div className="an-kpi-lbl">{lbl}</div>
            <span className={`stat-delta ${dc}`}>{delta}</span>
          </div>
        ))}
      </div>

      {/* Two charts row */}
      <div className="an-chart-row">
        <div className="panel an-chart-panel">
          <div className="panel-hd">
            <div className="panel-ttl">
              <IcoTrend width={14} height={14} style={{ color: "var(--indigo-ll)" }} />
              Average Score Trend
              <span>Weekly · All Courses</span>
            </div>
            <div className="an-legend">
              {scoreDatasets.map(d => (
                <span key={d.label} className="an-legend-item">
                  <span className="an-legend-dot" style={{ background: d.color }} />
                  {d.label}
                </span>
              ))}
            </div>
          </div>
          <div className="panel-body an-chart-body">
            <LineChart datasets={scoreDatasets} labels={WEEKS} height={150} />
          </div>
        </div>

        <div className="panel an-chart-panel">
          <div className="panel-hd">
            <div className="panel-ttl">
              <IcoUsers width={14} height={14} style={{ color: "var(--indigo-ll)" }} />
              Attendance Trend
              <span>Weekly · All Courses</span>
            </div>
            <div className="an-legend">
              {attendDatasets.map(d => (
                <span key={d.label} className="an-legend-item">
                  <span className="an-legend-dot" style={{ background: d.color }} />
                  {d.label}
                </span>
              ))}
            </div>
          </div>
          <div className="panel-body an-chart-body">
            <LineChart datasets={attendDatasets} labels={WEEKS} height={150} />
          </div>
        </div>
      </div>

      {/* Score distribution + at-risk */}
      <div className="an-chart-row">
        <div className="panel an-chart-panel">
          <div className="panel-hd">
            <div className="panel-ttl">
              <IcoBar width={14} height={14} style={{ color: "var(--indigo-ll)" }} />
              Score Distribution
              <span>All courses combined</span>
            </div>
          </div>
          <div className="panel-body">
            <HBarChart data={SCORE_DIST} />
            <div className="dist-summary">
              <div className="ds-item">
                <span className="ds-dot" style={{ background: "var(--teal)" }} />
                <span className="ds-lbl">Above 80%</span>
                <span className="ds-val teal">27%</span>
              </div>
              <div className="ds-item">
                <span className="ds-dot" style={{ background: "var(--amber)" }} />
                <span className="ds-lbl">60–79%</span>
                <span className="ds-val amber">55%</span>
              </div>
              <div className="ds-item">
                <span className="ds-dot" style={{ background: "var(--rose)" }} />
                <span className="ds-lbl">Below 60%</span>
                <span className="ds-val rose">18%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="panel an-chart-panel">
          <div className="panel-hd">
            <div className="panel-ttl">
              <IcoAlert width={14} height={14} style={{ color: "var(--rose)" }} />
              At-Risk Students
              <span style={{ color: "var(--rose)" }}>{AT_RISK.length} flagged</span>
            </div>
            <a href="#" className="panel-act" onClick={e => e.preventDefault()}>
              Notify all <IcoChevR />
            </a>
          </div>
          <div className="panel-body">
            <div className="risk-list">
              {AT_RISK.map((s, i) => (
                <div key={i} className={`risk-item risk-${s.risk}`}>
                  <div className={`risk-badge ${s.risk}`}>{s.risk}</div>
                  <div className="risk-info">
                    <div className="risk-name">{s.name}</div>
                    <div className="risk-roll">{s.roll}</div>
                  </div>
                  <div className="risk-stats">
                    <div className="risk-stat">
                      <span className="risk-stat-lbl">Attend</span>
                      <span className={`risk-stat-val ${s.attendance < 70 ? "rose" : "amber"}`}>{s.attendance}%</span>
                    </div>
                    <div className="risk-stat">
                      <span className="risk-stat-lbl">Avg</span>
                      <span className={`risk-stat-val ${s.avgScore < 50 ? "rose" : "amber"}`}>{s.avgScore}%</span>
                    </div>
                    <div className="risk-stat">
                      <span className="risk-stat-lbl">Missed</span>
                      <span className="risk-stat-val rose">{s.missed}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Weak topic trend */}
      <div className="panel">
        <div className="panel-hd">
          <div className="panel-ttl">
            <IcoAlert width={14} height={14} style={{ color: "var(--amber)" }} />
            Weak Topic Improvement Tracker
            <span>Weeks 9→11</span>
          </div>
          <a href="#" className="panel-act" onClick={e => e.preventDefault()}>
            Generate remedials <IcoChevR />
          </a>
        </div>
        <div className="panel-body">
          <div className="wtt-table">
            <div className="wtt-head">
              <span>Topic</span>
              <span>Course</span>
              <span>W9</span>
              <span>W10</span>
              <span>W11</span>
              <span>Change</span>
              <span>Trend</span>
            </div>
            {WEAK_TOPIC_TREND.map((w, i) => (
              <div key={i} className="wtt-row">
                <span className="wtt-topic">{w.topic}</span>
                <span className="wtt-course">{w.course}</span>
                <span className="wtt-val">{w.week9}%</span>
                <span className="wtt-val">{w.week10}%</span>
                <span className="wtt-val">{w.week11}%</span>
                <span className={`wtt-change ${w.change < 0 ? "good" : "bad"}`}>
                  {w.change > 0 ? "+" : ""}{w.change}%
                </span>
                <span className="wtt-spark">
                  <SparkLine values={[w.week9, w.week10, w.week11]}
                    color={w.change < 0 ? "var(--teal)" : "var(--rose)"} />
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Tiny sparkline ──
function SparkLine({ values, color }) {
  const W = 48, H = 20;
  const min = Math.min(...values); const max = Math.max(...values);
  const cx = (i) => (i / (values.length - 1)) * (W - 4) + 2;
  const cy = (v) => H - 4 - ((v - min) / (max - min || 1)) * (H - 8);
  const d  = values.map((v, i) => `${i === 0 ? "M" : "L"}${cx(i).toFixed(1)},${cy(v).toFixed(1)}`).join(" ");
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      <path d={d} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      {values.map((v, i) => (
        <circle key={i} cx={cx(i)} cy={cy(v)} r="2" fill={color} />
      ))}
    </svg>
  );
}

// ─── COURSES TAB ──────────────────────────────────────────────────
function TabCourses() {
  const [selected, setSelected] = useState(0);
  const c = COURSE_SUMMARY[selected];

  return (
    <div className="an-tab-content">
      {/* Course selector pills */}
      <div className="course-pills">
        {COURSE_SUMMARY.map((cs, i) => (
          <button key={i}
            className={`course-pill ${selected === i ? "active" : ""}`}
            style={selected === i ? { borderColor: cs.colorRaw, color: cs.colorRaw, background: `${cs.colorRaw}14` } : {}}
            onClick={() => setSelected(i)}>
            <span className="cp-dot" style={{ background: cs.color }} />
            {cs.code}
          </button>
        ))}
      </div>

      {/* Course header */}
      <div className="course-header-card">
        <div className="chc-left">
          <div className="chc-code">{c.code}</div>
          <div className="chc-name">{c.name}</div>
          <div className="chc-chips">
            <span className="chc-chip">{c.enrolled} Students</span>
            <span className="chc-chip">{c.quizCount} Quizzes</span>
            <span className="chc-chip">{c.asgmtCount} Assignments</span>
          </div>
        </div>
        <div className="chc-stats">
          {[
            { lbl: "Avg Score", val: `${c.avgScore}%`, color: c.color },
            { lbl: "Attendance", val: `${c.avgAttend}%`, color: c.avgAttend >= 85 ? "var(--teal)" : c.avgAttend >= 75 ? "var(--amber)" : "var(--rose)" },
            { lbl: "Highest", val: `${c.highestScore}%`, color: "var(--teal)" },
            { lbl: "Lowest",  val: `${c.lowestScore}%`,  color: "var(--rose)" },
          ].map(({ lbl, val, color }) => (
            <div key={lbl} className="chc-stat">
              <div className="chc-stat-val" style={{ color }}>{val}</div>
              <div className="chc-stat-lbl">{lbl}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Charts */}
      <div className="an-chart-row">
        <div className="panel an-chart-panel">
          <div className="panel-hd">
            <div className="panel-ttl">
              <IcoTrend width={14} height={14} style={{ color: "var(--indigo-ll)" }} />
              Score Trend — {c.code}
            </div>
          </div>
          <div className="panel-body an-chart-body">
            <LineChart
              datasets={[{ label: c.code, values: WEEKLY_SCORES[c.code] || WEEKLY_SCORES["CS501"], color: c.color }]}
              labels={WEEKS} height={150} />
          </div>
        </div>
        <div className="panel an-chart-panel">
          <div className="panel-hd">
            <div className="panel-ttl">
              <IcoUsers width={14} height={14} style={{ color: "var(--indigo-ll)" }} />
              Attendance Trend — {c.code}
            </div>
          </div>
          <div className="panel-body an-chart-body">
            <LineChart
              datasets={[{ label: c.code, values: ATTENDANCE_WEEKLY[c.code] || ATTENDANCE_WEEKLY["CS501"], color: c.color }]}
              labels={WEEKS} height={150} />
          </div>
        </div>
      </div>

      <div className="an-chart-row">
        <div className="panel an-chart-panel">
          <div className="panel-hd">
            <div className="panel-ttl">
              <IcoBar width={14} height={14} style={{ color: "var(--indigo-ll)" }} />
              Score Distribution — {c.code}
            </div>
          </div>
          <div className="panel-body">
            <HBarChart data={SCORE_DIST} />
          </div>
        </div>
        <div className="panel an-chart-panel">
          <div className="panel-hd">
            <div className="panel-ttl">
              <IcoAward width={14} height={14} style={{ color: "var(--indigo-ll)" }} />
              Course Completion
            </div>
          </div>
          <div className="panel-body">
            <div className="donut-wrap">
              <Donut segments={[
                { pct: c.completion, color: c.color },
                { pct: 100 - c.completion, color: "var(--surface3)" },
              ]} size={96} stroke={14} />
              <div className="donut-label">
                <div className="donut-val" style={{ color: c.color }}>{c.completion}%</div>
                <div className="donut-sub">Complete</div>
              </div>
            </div>
            <div className="completion-detail">
              <AnimBar pct={c.avgAttend} color={c.color} height={6} delay={500} />
              <div className="cd-lbl">
                <span>Avg Attendance</span>
                <span style={{ color: c.color }}>{c.avgAttend}%</span>
              </div>
              <AnimBar pct={c.avgScore} color="var(--violet)" height={6} delay={600} />
              <div className="cd-lbl">
                <span>Avg Score</span>
                <span style={{ color: "var(--violet)" }}>{c.avgScore}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── STUDENTS TAB ─────────────────────────────────────────────────
function TabStudents() {
  const [sort, setSort] = useState("avg");

  const sorted = [...TOP_PERFORMERS].sort((a, b) =>
    sort === "avg" ? b.avg - a.avg :
    sort === "os"  ? b.os  - a.os  :
    sort === "dbms"? b.dbms - a.dbms : b.ca - a.ca
  );

  return (
    <div className="an-tab-content">
      {/* Donut overview row */}
      <div className="student-donut-row">
        {[
          { label: "Top Performers", val: 28, pct: 25,  color: "var(--teal)",    sub: "Score ≥ 80%" },
          { label: "On Track",       val: 190, pct: 60, color: "var(--indigo-l)", sub: "Score 60–79%" },
          { label: "Needs Support",  val: 57, pct: 18,  color: "var(--amber)",   sub: "Score 40–59%" },
          { label: "At Risk",        val: 4,  pct: 4,   color: "var(--rose)",    sub: "Score < 40% or Attend < 70%" },
        ].map((s) => (
          <div key={s.label} className="sdr-card">
            <div className="sdr-donut-wrap">
              <Donut segments={[{ pct: s.pct, color: s.color }, { pct: 100 - s.pct, color: "var(--surface3)" }]} size={72} stroke={10} />
              <div className="sdr-val" style={{ color: s.color }}>{s.val}</div>
            </div>
            <div className="sdr-label">{s.label}</div>
            <div className="sdr-sub">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Leaderboard */}
      <div className="panel">
        <div className="panel-hd">
          <div className="panel-ttl">
            <IcoAward width={14} height={14} style={{ color: "var(--indigo-ll)" }} />
            Student Leaderboard
            <span>All courses</span>
          </div>
          <div className="sort-pills">
            {[["avg","Overall"],["os","CS501"],["dbms","CS502"],["ca","CS503"]].map(([k, l]) => (
              <button key={k} className={`sort-pill ${sort === k ? "active" : ""}`} onClick={() => setSort(k)}>{l}</button>
            ))}
          </div>
        </div>
        <div className="panel-body" style={{ padding: 0 }}>
          <div className="lb-table">
            <div className="lb-head">
              <span>#</span>
              <span>Student</span>
              <span>CS501</span>
              <span>CS502</span>
              <span>CS503</span>
              <span>Overall</span>
              <span>Trend</span>
            </div>
            {sorted.map((s, i) => (
              <div key={i} className={`lb-row ${i === 0 ? "lb-first" : ""}`}>
                <span className={`lb-rank rank-${i + 1}`}>
                  {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : i + 1}
                </span>
                <span className="lb-name-cell">
                  <div className="lb-avatar">{s.name.split(" ").map(x => x[0]).join("")}</div>
                  <div>
                    <div className="lb-name">{s.name}</div>
                    <div className="lb-roll">{s.roll}</div>
                  </div>
                </span>
                <span className="lb-score">{s.os}%</span>
                <span className="lb-score">{s.dbms}%</span>
                <span className="lb-score">{s.ca}%</span>
                <span className="lb-avg" style={{ color: s.avg >= 85 ? "var(--teal)" : s.avg >= 75 ? "var(--indigo-ll)" : "var(--amber)" }}>
                  {s.avg.toFixed(1)}%
                </span>
                <span className={`lb-trend trend-${s.trend}`}>
                  {s.trend === "up" ? <IcoChevUp /> : s.trend === "down" ? <IcoChevDn /> : <IcoMinus />}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* At-risk detail */}
      <div className="panel">
        <div className="panel-hd">
          <div className="panel-ttl">
            <IcoAlert width={14} height={14} style={{ color: "var(--rose)" }} />
            At-Risk Student Detail
          </div>
        </div>
        <div className="panel-body">
          <div className="risk-grid">
            {AT_RISK.map((s, i) => (
              <div key={i} className={`risk-detail-card risk-${s.risk}`}>
                <div className="rdc-top">
                  <div className="rdc-avatar">{s.name.split(" ").map(x => x[0]).join("")}</div>
                  <div>
                    <div className="rdc-name">{s.name}</div>
                    <div className="rdc-roll">{s.roll}</div>
                  </div>
                  <span className={`rdc-badge ${s.risk}`}>{s.risk} risk</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 10 }}>
                  <div>
                    <div className="rdc-bar-lbl"><span>Attendance</span><span style={{ color: s.attendance < 70 ? "var(--rose)" : "var(--amber)" }}>{s.attendance}%</span></div>
                    <AnimBar pct={s.attendance} color={s.attendance < 70 ? "var(--rose)" : "var(--amber)"} height={5} delay={400 + i * 100} />
                  </div>
                  <div>
                    <div className="rdc-bar-lbl"><span>Avg Score</span><span style={{ color: s.avgScore < 50 ? "var(--rose)" : "var(--amber)" }}>{s.avgScore}%</span></div>
                    <AnimBar pct={s.avgScore} color={s.avgScore < 50 ? "var(--rose)" : "var(--amber)"} height={5} delay={500 + i * 100} />
                  </div>
                </div>
                <div className="rdc-footer">
                  {s.missed} assignments missed
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── ENGAGEMENT TAB ───────────────────────────────────────────────
function TabEngagement() {
  return (
    <div className="an-tab-content">
      {/* Grouped bar */}
      <div className="panel">
        <div className="panel-hd">
          <div className="panel-ttl">
            <IcoClock width={14} height={14} style={{ color: "var(--indigo-ll)" }} />
            Weekly Activity Breakdown
            <span>Lectures · Submissions · Quizzes</span>
          </div>
          <div className="an-legend">
            {[["Lectures","var(--indigo-l)"],["Submissions","var(--teal)"],["Quizzes","var(--amber)"]].map(([l, c]) => (
              <span key={l} className="an-legend-item">
                <span className="an-legend-dot" style={{ background: c }} />{l}
              </span>
            ))}
          </div>
        </div>
        <div className="panel-body an-chart-body" style={{ paddingTop: 14 }}>
          <GroupedBar
            data={ENGAGEMENT}
            keys={["lectures", "submissions", "quizzes"]}
            colors={["var(--indigo-l)", "var(--teal)", "var(--amber)"]}
            height={150} />
        </div>
      </div>

      {/* Engagement KPIs */}
      <div className="an-eng-kpi-grid">
        {[
          { label: "Video Watch Rate",    val: "68%", sub: "Avg per lecture",   color: "var(--indigo-ll)", pct: 68 },
          { label: "Quiz Completion",     val: "91%", sub: "Of assigned quizzes",color: "var(--teal)",    pct: 91 },
          { label: "Assignment Submit",   val: "84%", sub: "On-time submissions", color: "var(--violet)",  pct: 84 },
          { label: "Discussion Posts",    val: "2.4", sub: "Avg posts per student",color: "var(--amber)", pct: 48 },
          { label: "AI Mentor Sessions",  val: "187", sub: "This week",          color: "var(--rose)",    pct: 62 },
          { label: "Avg Session Time",    val: "34m", sub: "Per student per day", color: "var(--teal)",   pct: 57 },
        ].map((e) => (
          <div key={e.label} className="eng-kpi-card">
            <div className="eng-kpi-val" style={{ color: e.color }}>{e.val}</div>
            <div className="eng-kpi-lbl">{e.label}</div>
            <div className="eng-kpi-sub">{e.sub}</div>
            <AnimBar pct={e.pct} color={e.color} height={3} delay={400} />
          </div>
        ))}
      </div>

      {/* Heatmap simulation */}
      <div className="panel">
        <div className="panel-hd">
          <div className="panel-ttl">
            <IcoClock width={14} height={14} style={{ color: "var(--indigo-ll)" }} />
            Activity Heatmap
            <span>Submissions by hour · This week</span>
          </div>
        </div>
        <div className="panel-body">
          <HeatMap />
        </div>
      </div>
    </div>
  );
}

// ── Simple heatmap (7 days × 8 slots) ──
const HEAT_DATA = [
  [2,  4,  8, 14, 22, 18, 12, 6 ],
  [1,  3,  6, 12, 28, 24, 16, 8 ],
  [0,  2,  5, 18, 32, 26, 14, 7 ],
  [3,  5,  9, 16, 24, 30, 20, 9 ],
  [2,  6, 10, 20, 26, 28, 18, 10],
  [1,  2,  4,  8, 12,  6,  4,  2],
  [0,  1,  2,  4,  6,  4,  2,  1],
];
const HEAT_DAYS  = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
const HEAT_HOURS = ["8am","10am","12pm","2pm","4pm","6pm","8pm","10pm"];

function HeatMap() {
  const maxVal = Math.max(...HEAT_DATA.flat());
  const getColor = (v) => {
    const t = v / maxVal;
    if (t < 0.1) return "rgba(91,78,248,.04)";
    if (t < 0.3) return "rgba(91,78,248,.15)";
    if (t < 0.5) return "rgba(91,78,248,.30)";
    if (t < 0.7) return "rgba(91,78,248,.50)";
    if (t < 0.9) return "rgba(91,78,248,.70)";
    return "rgba(91,78,248,.92)";
  };
  return (
    <div className="heatmap-wrap">
      <div className="heatmap-hours">
        <span className="hm-corner" />
        {HEAT_HOURS.map(h => <span key={h} className="hm-hour">{h}</span>)}
      </div>
      {HEAT_DATA.map((row, ri) => (
        <div key={ri} className="heatmap-row">
          <span className="hm-day">{HEAT_DAYS[ri]}</span>
          {row.map((v, ci) => (
            <div key={ci} className="hm-cell" style={{ background: getColor(v) }}
              title={`${HEAT_DAYS[ri]} ${HEAT_HOURS[ci]}: ${v} submissions`} />
          ))}
        </div>
      ))}
      <div className="hm-legend">
        <span>Low</span>
        <div className="hm-grad" />
        <span>High</span>
      </div>
    </div>
  );
}

// ─── MAIN ANALYTICS MODULE ────────────────────────────────────────
export default function FacultyAnalytics({ onBack }) {
  const [tab, setTab]       = useState("overview");
  const [period, setPeriod] = useState("Last 30 Days");
  const [spinning, setSpinning] = useState(false);

  const refresh = () => {
    setSpinning(true);
    setTimeout(() => setSpinning(false), 800);
  };

  return (
    <div className="an-root">
      {/* Page header with back button */}
      <div className="an-page-hd">
        <div>
          {onBack && (
            <button onClick={onBack} style={{ background: "none", border: "none", marginBottom: 12, color: "var(--text2)", cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", gap: 6 }}>
              <IcoChevR style={{ transform: "rotate(180deg)" }} /> Back
            </button>
          )}
          <div className="greet-tag" style={{ marginBottom: 8 }}>
            <div className="greet-pip" />
            <span className="greet-pip-txt">Semester 5 · Week 11 · Live Data</span>
          </div>
          <h1 className="greet-title">Analytics <em>&amp; Insights</em></h1>
          <p className="greet-sub">Comprehensive performance overview across all your courses and students.</p>
        </div>
        <div className="an-hd-actions">
          {/* Period selector */}
          <div className="period-pills">
            {PERIODS.map(p => (
              <button key={p} className={`period-pill ${period === p ? "active" : ""}`}
                onClick={() => setPeriod(p)}>{p}</button>
            ))}
          </div>
          <button className={`an-icon-btn ${spinning ? "spinning" : ""}`} onClick={refresh} title="Refresh">
            <IcoRefresh />
          </button>
          <button className="an-icon-btn" title="Export report">
            <IcoDownload />
          </button>
          <button className="an-icon-btn" title="Filter">
            <IcoFilter />
          </button>
        </div>
      </div>

      {/* Tab bar */}
      <div className="an-tabs">
        {TABS.map(t => (
          <button key={t.id}
            className={`an-tab ${tab === t.id ? "active" : ""}`}
            onClick={() => setTab(t.id)}>
            {t.icon}{t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === "overview"   && <TabOverview />}
      {tab === "courses"    && <TabCourses />}
      {tab === "students"   && <TabStudents />}
      {tab === "engagement" && <TabEngagement />}
    </div>
  );
}