// StudentAnalytics.jsx
// Student-specific analytics module — imported into StudentDashboard.jsx
// Uses CSS variables from StudentDashboard.css + studentAnalytics.css

import { useState, useEffect } from "react";
import {
  ChevronLeft, ChevronRight, TrendingUp, BarChart2,
  Users, Clock, Award, Target, Flame, Download,
  Filter, BookOpen, Star, Activity, Zap
} from "lucide-react";

// ─── DATA ────────────────────────────────────────────────────────
const WEEKS = ["W5", "W6", "W7", "W8", "W9", "W10", "W11"];

const MY_SCORE_TREND = {
  OS:     [65, 70, 72, 78, 82, 79, 84],
  DBMS:   [58, 62, 65, 70, 73, 76, 78],
  ML:     [50, 55, 58, 60, 63, 65, 68],
  CN:     [70, 72, 74, 76, 78, 80, 82],
  Crypto: [40, 44, 46, 50, 52, 55, 58],
};

const CLASS_SCORE_TREND = {
  OS:     [62, 65, 68, 71, 72, 74, 74],
  DBMS:   [55, 58, 60, 63, 65, 67, 68],
  ML:     [48, 50, 52, 55, 57, 59, 61],
  CN:     [65, 67, 70, 72, 74, 76, 77],
  Crypto: [38, 40, 42, 45, 47, 49, 52],
};

const QUIZ_HISTORY = [
  { name: "OS – Process Scheduling", score: 92, classAvg: 74, rank: 3,  total: 112, date: "Week 9" },
  { name: "DBMS – Normalization",    score: 85, classAvg: 68, rank: 8,  total: 112, date: "Week 8" },
  { name: "CN – OSI Layers",         score: 78, classAvg: 72, rank: 14, total: 112, date: "Week 8" },
  { name: "ML – Linear Regression",  score: 71, classAvg: 65, rank: 22, total: 112, date: "Week 7" },
  { name: "Crypto – Symmetric Keys", score: 58, classAvg: 55, rank: 51, total: 112, date: "Week 6" },
  { name: "OS – Memory Management",  score: 76, classAvg: 70, rank: 18, total: 112, date: "Week 6" },
  { name: "DBMS – Transactions",     score: 80, classAvg: 66, rank: 11, total: 112, date: "Week 5" },
];

const SKILL_TREND = [
  { label: "DSA",             scores: [72, 74, 76, 78, 80, 81, 82], color: "var(--teal)"     },
  { label: "Python",          scores: [65, 67, 68, 70, 72, 73, 74], color: "var(--indigo-l)" },
  { label: "SQL",             scores: [58, 60, 62, 64, 65, 67, 68], color: "var(--violet)"   },
  { label: "Machine Learning",scores: [44, 47, 49, 51, 53, 54, 55], color: "var(--amber)"    },
  { label: "System Design",   scores: [30, 33, 35, 37, 39, 40, 41], color: "var(--rose)"     },
];

const ATTENDANCE_BY_COURSE = [
  { course: "OS",     pct: 88, classes: 37, attended: 33, color: "var(--indigo-l)" },
  { course: "DBMS",   pct: 76, classes: 28, attended: 21, color: "var(--teal)"     },
  { course: "ML",     pct: 81, classes: 27, attended: 22, color: "var(--amber)"    },
  { course: "CN",     pct: 84, classes: 30, attended: 25, color: "var(--violet)"   },
  { course: "Crypto", pct: 71, classes: 24, attended: 17, color: "var(--rose)"     },
];

const PLACEMENT_BREAKDOWN = [
  { label: "DSA & Algorithms",   score: 82, weight: 30, color: "var(--teal)"     },
  { label: "Core CS Subjects",   score: 74, weight: 25, color: "var(--indigo-l)" },
  { label: "Communication",      score: 77, weight: 20, color: "var(--violet)"   },
  { label: "Projects",           score: 65, weight: 15, color: "var(--amber)"    },
  { label: "Competitive Coding", score: 58, weight: 10, color: "var(--rose)"     },
];

const ACHIEVEMENTS = [
  { icon: "🏆", label: "Top 3% in OS Quiz",    sub: "Process Scheduling · Week 9", color: "var(--amber)"    },
  { icon: "⚡", label: "7-Day Study Streak",    sub: "Consistent daily activity",   color: "var(--teal)"     },
  { icon: "🎯", label: "DBMS Full Marks",       sub: "ER Diagram Assignment",       color: "var(--indigo-ll)"},
  { icon: "📈", label: "Most Improved",         sub: "Cryptography +18pts",         color: "var(--violet)"   },
];

const COLOR_MAP = {
  OS:     "var(--indigo-l)",
  DBMS:   "var(--teal)",
  ML:     "var(--amber)",
  CN:     "var(--violet)",
  Crypto: "var(--rose)",
};

const ATT_HEAT    = [
  [1, 1, 1, 0, 1, 1, 1, 1],
  [1, 0, 1, 1, 1, 1, 0, 1],
  [1, 1, 0, 1, 0, 1, 1, 1],
  [1, 1, 1, 1, 1, 0, 1, 1],
  [0, 1, 1, 0, 1, 1, 1, 0],
];
const ATT_COURSES = ["OS", "DBMS", "ML", "CN", "Crypto"];
const ATT_WEEKS   = ["W4", "W5", "W6", "W7", "W8", "W9", "W10", "W11"];

const TABS = [
  { id: "performance", label: "Performance", Icon: TrendingUp  },
  { id: "attendance",  label: "Attendance",  Icon: Users       },
  { id: "skills",      label: "Skills",      Icon: BarChart2   },
  { id: "placement",   label: "Placement",   Icon: Target      },
];

const PERIODS = ["This Week", "Last 30 Days", "Semester"];

// ─── SHARED HELPERS ───────────────────────────────────────────────
function AnimBar({ pct, color, height = 4, delay = 400 }) {
  const [w, setW] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setW(pct), delay);
    return () => clearTimeout(t);
  }, [pct, delay]);
  return (
    <div style={{ height, background: "var(--surface3)", borderRadius: 3, overflow: "hidden" }}>
      <div style={{
        height: "100%", width: `${w}%`, background: color, borderRadius: 3,
        transition: "width 1.1s cubic-bezier(.16,1,.3,1)"
      }} />
    </div>
  );
}

// ─── LINE CHART ───────────────────────────────────────────────────
function LineChart({ datasets, labels, height = 150, showGrid = true }) {
  const W = 560, H = height;
  const PAD = { t: 16, r: 12, b: 28, l: 36 };
  const inner = { w: W - PAD.l - PAD.r, h: H - PAD.t - PAD.b };
  const allVals = datasets.flatMap(d => d.values);
  const minV = Math.min(...allVals) - 5;
  const maxV = Math.max(...allVals) + 5;
  const cx = (i) => PAD.l + (i / (labels.length - 1)) * inner.w;
  const cy = (v) => PAD.t + inner.h - ((v - minV) / (maxV - minV)) * inner.h;
  const pathD = (vals) => vals.map((v, i) => `${i === 0 ? "M" : "L"}${cx(i).toFixed(1)},${cy(v).toFixed(1)}`).join(" ");
  const areaD = (vals) => `${pathD(vals)} L${cx(vals.length - 1)},${(PAD.t + inner.h).toFixed(1)} L${PAD.l},${(PAD.t + inner.h).toFixed(1)} Z`;
  const gridVals = [minV, minV + (maxV - minV) * 0.33, minV + (maxV - minV) * 0.66, maxV].map(Math.round);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ overflow: "visible", display: "block" }}>
      {showGrid && gridVals.map((v, i) => (
        <g key={i}>
          <line x1={PAD.l} y1={cy(v)} x2={W - PAD.r} y2={cy(v)}
            stroke="rgba(255,255,255,.045)" strokeWidth="1" strokeDasharray="4 4" />
          <text x={PAD.l - 6} y={cy(v)} fill="rgba(255,255,255,.3)" fontSize="8"
            textAnchor="end" dominantBaseline="middle">{v}%</text>
        </g>
      ))}
      {labels.map((l, i) => (
        <text key={i} x={cx(i)} y={H - 6} fill="rgba(255,255,255,.3)"
          fontSize="9" textAnchor="middle">{l}</text>
      ))}
      {datasets.map((d, di) => (
        <path key={`a${di}`} d={areaD(d.values)} fill={d.color} opacity="0.07" />
      ))}
      {datasets.map((d, di) => (
        <path key={`l${di}`} d={pathD(d.values)} fill="none" stroke={d.color}
          strokeWidth={d.bold ? 2.4 : 1.8} strokeLinecap="round" strokeLinejoin="round"
          strokeDasharray={d.dashed ? "5 3" : undefined} />
      ))}
      {datasets.map((d, di) =>
        d.values.map((v, i) => (
          <circle key={`${di}-${i}`} cx={cx(i)} cy={cy(v)}
            r={d.bold ? 3.5 : 2.5} fill={d.color}
            stroke="var(--surface)" strokeWidth="1.5" />
        ))
      )}
    </svg>
  );
}

// ─── DONUT ────────────────────────────────────────────────────────
function Donut({ segments, size = 88, stroke = 12 }) {
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;

  const segmentData = segments.reduce((acc, seg) => {
    const dashLength = (seg.pct / 100) * circumference;
    const offset = acc.length > 0 ? acc[acc.length - 1].nextOffset : 0;
    acc.push({ dashLength, offset, nextOffset: offset + dashLength, color: seg.color });
    return acc;
  }, []);

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}
      style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke="var(--surface3)" strokeWidth={stroke} />
      {segmentData.map((item, i) => (
        <circle key={i} cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke={item.color} strokeWidth={stroke}
          strokeDasharray={`${item.dashLength} ${circumference - item.dashLength}`}
          strokeDashoffset={-item.offset} strokeLinecap="butt" />
      ))}
    </svg>
  );
}

// ─── RADAR CHART ──────────────────────────────────────────────────
function RadarChart({ data, size = 200 }) {
  const cx = size / 2, cy = size / 2, r = size * 0.38;
  const n = data.length;
  const angle = (i) => (i / n) * 2 * Math.PI - Math.PI / 2;
  const px = (i, rad) => cx + Math.cos(angle(i)) * rad;
  const py = (i, rad) => cy + Math.sin(angle(i)) * rad;
  const gridLevels = [0.25, 0.5, 0.75, 1.0];

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {gridLevels.map((lvl, li) => (
        <polygon key={li}
          points={data.map((_, i) => `${px(i, r * lvl).toFixed(1)},${py(i, r * lvl).toFixed(1)}`).join(" ")}
          fill="none" stroke="rgba(255,255,255,.07)" strokeWidth="1" />
      ))}
      {data.map((_, i) => (
        <line key={i} x1={cx} y1={cy} x2={px(i, r)} y2={py(i, r)}
          stroke="rgba(255,255,255,.07)" strokeWidth="1" />
      ))}
      <polygon
        points={data.map((d, i) => `${px(i, r * (d.pct / 100)).toFixed(1)},${py(i, r * (d.pct / 100)).toFixed(1)}`).join(" ")}
        fill="rgba(91,78,248,.18)" stroke="var(--indigo-l)" strokeWidth="1.8" />
      {data.map((d, i) => (
        <circle key={i} cx={px(i, r * (d.pct / 100))} cy={py(i, r * (d.pct / 100))}
          r="3.5" fill="var(--indigo-l)" stroke="var(--surface)" strokeWidth="1.5" />
      ))}
      {data.map((d, i) => (
        <text key={i} x={px(i, r * 1.18)} y={py(i, r * 1.18)}
          textAnchor="middle" dominantBaseline="middle"
          fill="rgba(255,255,255,.5)" fontSize="9.5" fontWeight="500">
          {d.label}
        </text>
      ))}
    </svg>
  );
}

// ─── SPARK LINE ───────────────────────────────────────────────────
function SparkLine({ values, color, width = 60, height = 24 }) {
  const min = Math.min(...values), max = Math.max(...values);
  const cx = (i) => (i / (values.length - 1)) * (width - 6) + 3;
  const cy = (v) => height - 4 - ((v - min) / (max - min || 1)) * (height - 8);
  const d = values.map((v, i) => `${i === 0 ? "M" : "L"}${cx(i).toFixed(1)},${cy(v).toFixed(1)}`).join(" ");
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <path d={d} fill="none" stroke={color} strokeWidth="1.8"
        strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={cx(values.length - 1)} cy={cy(values[values.length - 1])}
        r="2.5" fill={color} />
    </svg>
  );
}

// ─── ATTENDANCE HEATMAP ───────────────────────────────────────────
function AttendHeatmap() {
  return (
    <div className="att-heatmap">
      <div className="att-hm-header">
        <span className="att-hm-corner" />
        {ATT_WEEKS.map(w => <span key={w} className="att-hm-wlbl">{w}</span>)}
      </div>
      {ATT_HEAT.map((row, ri) => (
        <div key={ri} className="att-hm-row">
          <span className="att-hm-clbl" style={{ color: COLOR_MAP[ATT_COURSES[ri]] }}>
            {ATT_COURSES[ri]}
          </span>
          {row.map((v, ci) => (
            <div key={ci}
              className={`att-hm-cell ${v ? "present" : "absent"}`}
              style={v ? { background: COLOR_MAP[ATT_COURSES[ri]], opacity: 0.7 } : {}}
              title={`${ATT_COURSES[ri]} ${ATT_WEEKS[ci]}: ${v ? "Present" : "Absent"}`}
            />
          ))}
        </div>
      ))}
      <div className="att-hm-legend">
        <span className="att-hm-leg-item"><span className="att-hm-leg-dot present" /> Present</span>
        <span className="att-hm-leg-item"><span className="att-hm-leg-dot absent" /> Absent</span>
      </div>
    </div>
  );
}

// ─── PERFORMANCE TAB ─────────────────────────────────────────────
function TabPerformance({ activeCourse, setActiveCourse }) {
  const courses = Object.keys(MY_SCORE_TREND);

  return (
    <div className="san-tab-content">
      {/* KPI row */}
      <div className="san-kpi-grid">
        {[
          { cls: "sc-teal",   val: "8.4",    lbl: "Current CGPA",   delta: "+0.2 vs last sem",  up: true  },
          { cls: "sc-indigo", val: "3rd",    lbl: "Class Rank (OS)", delta: "Up from 8th",       up: true  },
          { cls: "sc-amber",  val: "74%",    lbl: "Avg Quiz Score",  delta: "+6% this month",    up: true  },
          { cls: "sc-violet", val: "Top 15%",lbl: "Batch Standing",  delta: "Stable",            up: null  },
        ].map(({ cls, val, lbl, delta, up }) => (
          <div key={lbl} className={`san-kpi-card ${cls}`}>
            <div className="san-kpi-val">{val}</div>
            <div className="san-kpi-lbl">{lbl}</div>
            <span className={`stat-delta ${up === true ? "delta-up" : up === false ? "delta-dn" : "delta-neu"}`}>
              {up === true  && <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="18 15 12 9 6 15"/></svg>}
              {up === false && <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>}
              {up === null  && <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>}
              {delta}
            </span>
          </div>
        ))}
      </div>

      {/* Score vs Class chart */}
      <div className="panel" style={{ marginBottom: 16 }}>
        <div className="panel-hd">
          <div className="panel-ttl">
            <TrendingUp size={14} style={{ color: "var(--indigo-ll)" }} />
            My Score vs Class Average
            <span>Weekly · All courses</span>
          </div>
          <div className="san-legend">
            <span className="san-legend-item">
              <span className="san-legend-dot" style={{ background: "var(--indigo-l)" }} />Me
            </span>
            <span className="san-legend-item san-legend-dashed">
              <span className="san-legend-dot" style={{ background: "rgba(255,255,255,.25)" }} />Class Avg
            </span>
          </div>
        </div>
        <div className="panel-body">
          <div className="san-course-pills">
            {courses.map(c => (
              <button key={c}
                className={`san-course-pill ${activeCourse === c ? "active" : ""}`}
                style={activeCourse === c ? { borderColor: COLOR_MAP[c], color: COLOR_MAP[c] } : {}}
                onClick={() => setActiveCourse(c)}>
                <span className="san-cp-dot" style={{ background: COLOR_MAP[c] }} />
                {c}
              </button>
            ))}
          </div>
          <LineChart
            datasets={[
              { label: "Me",        values: MY_SCORE_TREND[activeCourse],    color: COLOR_MAP[activeCourse], bold: true },
              { label: "Class Avg", values: CLASS_SCORE_TREND[activeCourse], color: "rgba(255,255,255,.25)", dashed: true },
            ]}
            labels={WEEKS} height={155}
          />
        </div>
      </div>

      {/* Quiz history + all-course trends */}
      <div className="san-two-col">
        <div className="panel">
          <div className="panel-hd">
            <div className="panel-ttl">
              <Clock size={14} style={{ color: "var(--indigo-ll)" }} />
              Quiz History
              <span>Last 7 quizzes</span>
            </div>
          </div>
          <div className="panel-body" style={{ padding: 0 }}>
            <div className="qh-table">
              <div className="qh-head">
                <span>Quiz</span>
                <span>My Score</span>
                <span>Avg</span>
                <span>Rank</span>
              </div>
              {QUIZ_HISTORY.map((q, i) => (
                <div key={i} className="qh-row">
                  <span className="qh-name">
                    <span className="qh-name-text">{q.name}</span>
                    <span className="qh-date">{q.date}</span>
                  </span>
                  <span className="qh-my"
                    style={{ color: q.score >= 80 ? "var(--teal)" : q.score >= 65 ? "var(--indigo-ll)" : "var(--amber)" }}>
                    {q.score}%
                  </span>
                  <span className="qh-avg">{q.classAvg}%</span>
                  <span className="qh-rank">#{q.rank}<span className="qh-total">/{q.total}</span></span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="panel">
          <div className="panel-hd">
            <div className="panel-ttl">
              <BarChart2 size={14} style={{ color: "var(--indigo-ll)" }} />
              Score Trend — All Courses
            </div>
          </div>
          <div className="panel-body">
            <div className="all-course-trends">
              {Object.entries(MY_SCORE_TREND).map(([course, vals]) => {
                const latest = vals[vals.length - 1];
                const prev   = vals[vals.length - 2] ?? latest;
                const delta  = latest - prev;
                return (
                  <div key={course} className="act-row">
                    <span className="act-course" style={{ color: COLOR_MAP[course] }}>{course}</span>
                    <div className="act-sparkline">
                      <SparkLine values={vals} color={COLOR_MAP[course]} width={72} height={28} />
                    </div>
                    <span className="act-score" style={{ color: COLOR_MAP[course] }}>{latest}%</span>
                    <span className={`act-delta ${delta > 0 ? "up" : delta < 0 ? "dn" : "neu"}`}>
                      {delta > 0 ? "+" : ""}{delta}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── ATTENDANCE TAB ───────────────────────────────────────────────
function TabAttendance() {
  const total    = ATTENDANCE_BY_COURSE.reduce((a, c) => a + c.classes,  0);
  const attended = ATTENDANCE_BY_COURSE.reduce((a, c) => a + c.attended, 0);
  const overallPct = Math.round((attended / total) * 100);

  return (
    <div className="san-tab-content">
      <div className="san-attend-hero">
        <div className="sah-donut">
          <Donut
            segments={[
              { pct: overallPct,       color: "var(--teal)"    },
              { pct: 100 - overallPct, color: "var(--surface3)" },
            ]}
            size={110} stroke={14}
          />
          <div className="sah-donut-label">
            <div className="sah-val">{overallPct}%</div>
            <div className="sah-sub">Overall</div>
          </div>
        </div>
        <div className="sah-info">
          <div className="sah-title">Attendance Overview</div>
          <div className="sah-meta">Semester 5 · {total} classes total</div>
          <div className="sah-stats">
            <div className="sah-stat">
              <span className="sah-stat-val teal">{attended}</span>
              <span className="sah-stat-lbl">Attended</span>
            </div>
            <div className="sah-stat">
              <span className="sah-stat-val rose">{total - attended}</span>
              <span className="sah-stat-lbl">Missed</span>
            </div>
            <div className="sah-stat">
              <span className={`sah-stat-val ${overallPct >= 75 ? "teal" : "rose"}`}>
                {overallPct >= 75 ? "Safe" : "At Risk"}
              </span>
              <span className="sah-stat-lbl">Status</span>
            </div>
          </div>
          <div className="sah-warn">
            {overallPct < 75
              ? <span className="sah-warn-bad">
                  ⚠️ Below 75% minimum — attend {Math.ceil((75 * total - attended * 100) / 25)} more classes
                </span>
              : <span className="sah-warn-ok">
                  ✅ You can miss {Math.floor((attended * 100 / 75) - total)} more classes safely
                </span>
            }
          </div>
        </div>
      </div>

      <div className="panel" style={{ marginBottom: 16 }}>
        <div className="panel-hd">
          <div className="panel-ttl">
            <Users size={14} style={{ color: "var(--indigo-ll)" }} />
            Per-Course Breakdown
          </div>
        </div>
        <div className="panel-body">
          <div className="attend-list">
            {ATTENDANCE_BY_COURSE.map((a, i) => (
              <div key={i} className="attend-item">
                <span className="att-course" style={{ color: a.color }}>{a.course}</span>
                <div className="att-bar-wrap">
                  <AnimBar pct={a.pct} color={a.color} height={6} delay={400 + i * 100} />
                </div>
                <span className="att-pct"
                  style={{ color: a.pct >= 85 ? "var(--teal)" : a.pct >= 75 ? "var(--amber)" : "var(--rose)" }}>
                  {a.pct}%
                </span>
                <span className="att-count">{a.attended}/{a.classes}</span>
                <span className={`att-status ${a.pct >= 85 ? "safe" : a.pct >= 75 ? "ok" : "risk"}`}>
                  {a.pct >= 85 ? "Safe" : a.pct >= 75 ? "OK" : "Risk"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-hd">
          <div className="panel-ttl">
            <Clock size={14} style={{ color: "var(--indigo-ll)" }} />
            Weekly Attendance Pattern
            <span>Last 8 weeks</span>
          </div>
        </div>
        <div className="panel-body">
          <AttendHeatmap />
        </div>
      </div>
    </div>
  );
}

// ─── SKILLS TAB ───────────────────────────────────────────────────
function TabSkills() {
  const radarData = [
    { label: "DSA",        pct: 82 },
    { label: "Python",     pct: 74 },
    { label: "SQL",        pct: 68 },
    { label: "ML",         pct: 55 },
    { label: "Sys Design", pct: 41 },
    { label: "Comms",      pct: 77 },
  ];

  return (
    <div className="san-tab-content">
      <div className="san-two-col">
        <div className="panel">
          <div className="panel-hd">
            <div className="panel-ttl">
              <Target size={14} style={{ color: "var(--indigo-ll)" }} />
              Skill Radar
            </div>
          </div>
          <div className="panel-body" style={{ display: "flex", justifyContent: "center", paddingTop: 8 }}>
            <RadarChart data={radarData} size={220} />
          </div>
        </div>

        <div className="panel">
          <div className="panel-hd">
            <div className="panel-ttl">
              <TrendingUp size={14} style={{ color: "var(--indigo-ll)" }} />
              Skill Growth — Semester
            </div>
          </div>
          <div className="panel-body">
            <div className="skill-trend-list">
              {SKILL_TREND.map((s, i) => {
                const start = s.scores[0];
                const end   = s.scores[s.scores.length - 1];
                const gain  = end - start;
                return (
                  <div key={i} className="stl-item">
                    <div className="stl-top">
                      <span className="stl-label">{s.label}</span>
                      <span className="stl-sparkline">
                        <SparkLine values={s.scores} color={s.color} width={60} height={22} />
                      </span>
                      <span className="stl-score" style={{ color: s.color }}>{end}%</span>
                      <span className={`stl-gain ${gain > 0 ? "up" : "neu"}`}>+{gain}</span>
                    </div>
                    <AnimBar pct={end} color={s.color} height={5} delay={400 + i * 100} />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-hd">
          <div className="panel-ttl">
            <TrendingUp size={14} style={{ color: "var(--indigo-ll)" }} />
            Skill Progression — All Skills
            <span>Weekly · Semester 5</span>
          </div>
          <div className="san-legend">
            {SKILL_TREND.map(s => (
              <span key={s.label} className="san-legend-item">
                <span className="san-legend-dot" style={{ background: s.color }} />{s.label}
              </span>
            ))}
          </div>
        </div>
        <div className="panel-body">
          <LineChart
            datasets={SKILL_TREND.map(s => ({ label: s.label, values: s.scores, color: s.color }))}
            labels={WEEKS} height={155}
          />
        </div>
      </div>

      <div className="panel">
        <div className="panel-hd">
          <div className="panel-ttl">
            <Award size={14} style={{ color: "var(--indigo-ll)" }} />
            Achievements
            <span>{ACHIEVEMENTS.length} unlocked</span>
          </div>
        </div>
        <div className="panel-body">
          <div className="achieve-grid">
            {ACHIEVEMENTS.map((a, i) => (
              <div key={i} className="achieve-card" style={{ borderColor: `${a.color}22` }}>
                <div className="achieve-icon"
                  style={{ background: `${a.color}14`, border: `1px solid ${a.color}33` }}>
                  {a.icon}
                </div>
                <div className="achieve-info">
                  <div className="achieve-label" style={{ color: a.color }}>{a.label}</div>
                  <div className="achieve-sub">{a.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── PLACEMENT TAB ────────────────────────────────────────────────
function TabPlacement() {
  const pri      = 72;
  const target   = 85;
  const weighted = PLACEMENT_BREAKDOWN
    .reduce((a, c) => a + c.score * (c.weight / 100), 0)
    .toFixed(1);

  return (
    <div className="san-tab-content">
      {/* PRI hero */}
      <div className="pri-hero">
        <div className="pri-donut-wrap">
          <Donut
            segments={[
              { pct: pri,            color: "var(--indigo-l)"          },
              { pct: target - pri,   color: "rgba(91,78,248,.15)"       },
              { pct: 100 - target,   color: "var(--surface3)"           },
            ]}
            size={120} stroke={14}
          />
          <div className="pri-donut-label">
            <div className="pri-val">{pri}</div>
            <div className="pri-sub">/ 100</div>
          </div>
        </div>
        <div className="pri-info">
          <div className="pri-title">Placement Readiness Index</div>
          <div className="pri-grade">Good Tier · <em>13 points to Excellent</em></div>
          <div className="pri-target-row">
            <span>Current</span>
            <div className="pri-target-bar">
              <div className="pri-bar-fill" style={{ width: `${pri}%` }} />
              <div className="pri-target-marker" style={{ left: `${target}%` }} />
            </div>
            <span>Target {target}</span>
          </div>
          <div className="pri-tiers">
            {[
              ["Beginner",   "0",   "rose"     ],
              ["Developing", "40",  "amber"    ],
              ["Good",       "60",  "indigo-ll"],
              ["Excellent",  "80",  "teal"     ],
            ].map(([t, min, c]) => (
              <span key={t}
                className={`pri-tier ${pri >= Number(min) ? "active" : ""}`}
                style={pri >= Number(min)
                  ? { color: `var(--${c})`, background: `rgba(var(--${c}-rgb, 255,255,255),.1)` }
                  : {}}>
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="san-two-col">
        {/* Breakdown */}
        <div className="panel">
          <div className="panel-hd">
            <div className="panel-ttl">
              <Target size={14} style={{ color: "var(--indigo-ll)" }} />
              PRI Component Breakdown
            </div>
          </div>
          <div className="panel-body">
            {PLACEMENT_BREAKDOWN.map((b, i) => (
              <div key={i} className="plc-item">
                <div className="plc-top">
                  <span className="plc-label">{b.label}</span>
                  <span className="plc-weight">{b.weight}% weight</span>
                  <span className="plc-score" style={{ color: b.color }}>{b.score}%</span>
                </div>
                <AnimBar pct={b.score} color={b.color} height={5} delay={400 + i * 100} />
              </div>
            ))}
            <div className="plc-total">
              <span>Weighted PRI Score</span>
              <span style={{ color: "var(--indigo-ll)", fontWeight: 700 }}>{weighted}</span>
            </div>
          </div>
        </div>

        {/* Suggestions */}
        <div className="panel">
          <div className="panel-hd">
            <div className="panel-ttl">
              <Flame size={14} style={{ color: "var(--rose)" }} />
              Improvement Suggestions
            </div>
          </div>
          <div className="panel-body">
            <div className="improve-list">
              {[
                { area: "Cryptography",  action: "Focus on RSA & AES algorithms",    impact: "+4 PRI", color: "var(--rose)"     },
                { area: "System Design", action: "Complete 2 mock design problems",   impact: "+3 PRI", color: "var(--amber)"    },
                { area: "Projects",      action: "Add 1 more DBMS project",           impact: "+2 PRI", color: "var(--violet)"   },
                { area: "ML",            action: "Finish SVM & Clustering modules",   impact: "+2 PRI", color: "var(--indigo-l)" },
              ].map((s, i) => (
                <div key={i} className="improve-item">
                  <div className="imp-dot" style={{ background: s.color }} />
                  <div className="imp-body">
                    <div className="imp-area" style={{ color: s.color }}>{s.area}</div>
                    <div className="imp-action">{s.action}</div>
                  </div>
                  <span className="imp-impact">{s.impact}</span>
                </div>
              ))}
            </div>
            <div className="improve-cta">
              <div className="icta-title">Estimated PRI after improvements</div>
              <div className="icta-val">83 <span>→ Excellent Tier 🎯</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* Company tier eligibility */}
      <div className="panel">
        <div className="panel-hd">
          <div className="panel-ttl">
            <Award size={14} style={{ color: "var(--indigo-ll)" }} />
            Eligibility by Company Tier
            <span>Based on current PRI</span>
          </div>
        </div>
        <div className="panel-body">
          <div className="tier-grid">
            {[
              { tier: "Tier 1 (FAANG+)",  minPRI: 90, minCGPA: 9.0, eligible: false },
              { tier: "Tier 2 (Product)",  minPRI: 80, minCGPA: 8.5, eligible: false },
              { tier: "Tier 3 (Service)",  minPRI: 70, minCGPA: 8.0, eligible: true  },
              { tier: "Tier 4 (Startup)",  minPRI: 55, minCGPA: 7.5, eligible: true  },
            ].map((t, i) => (
              <div key={i} className={`tier-card ${t.eligible ? "eligible" : "locked"}`}>
                <div className="tc-tier">{t.tier}</div>
                <div className="tc-reqs">
                  <span>PRI ≥ {t.minPRI}</span>
                  <span>CGPA ≥ {t.minCGPA}</span>
                </div>
                <div className={`tc-status ${t.eligible ? "yes" : "no"}`}>
                  {t.eligible ? "✅ Eligible" : "🔒 Not yet"}
                </div>
                {!t.eligible && (
                  <div className="tc-gap">Need +{Math.max(t.minPRI - pri, 0)} PRI</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN EXPORT ─────────────────────────────────────────────────
export default function StudentAnalytics({ onBack }) {
  const [tab,          setTab]          = useState("performance");
  const [period,       setPeriod]       = useState("Semester");
  const [activeCourse, setActiveCourse] = useState("OS");

  return (
    <div className="san-root">

      {/* ── Page header ── */}
      <div className="san-page-hd">
        <div className="san-back-row">
          <button className="san-back-btn" onClick={onBack}>
            <ChevronLeft size={13} /> Dashboard
          </button>
          <div className="san-breadcrumb">
            <span>Dashboard</span>
            <ChevronRight size={11} style={{ color: "var(--text3)" }} />
            <span className="san-bc-active">Analytics</span>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginTop: 10 }}>
          <div>
            <div className="greet-tag" style={{ marginBottom: 8 }}>
              <div className="greet-pip" />
              <span className="greet-pip-txt">Semester 5 · Week 11 · Personal Analytics</span>
            </div>
            <h1 className="greet-title">My <em>Analytics</em></h1>
            <p className="greet-sub">Your personal performance breakdown across courses, skills & placement readiness.</p>
          </div>
          <div className="san-hd-actions">
            <div className="san-period-pills">
              {PERIODS.map(p => (
                <button key={p}
                  className={`san-period-pill ${period === p ? "active" : ""}`}
                  onClick={() => setPeriod(p)}>
                  {p}
                </button>
              ))}
            </div>
            <button className="an-icon-btn" title="Export"><Download size={13} /></button>
            <button className="an-icon-btn" title="Filter"><Filter size={13} /></button>
          </div>
        </div>
      </div>

      {/* ── Tab bar ── */}
      <div className="san-tabs">
        {TABS.map(({ id, label, Icon }) => (
          <button key={id}
            className={`san-tab ${tab === id ? "active" : ""}`}
            onClick={() => setTab(id)}>
            <Icon size={13} />
            {label}
          </button>
        ))}
      </div>

      {/* ── Tab content ── */}
      {tab === "performance" && (
        <TabPerformance activeCourse={activeCourse} setActiveCourse={setActiveCourse} />
      )}
      {tab === "attendance" && <TabAttendance />}
      {tab === "skills"     && <TabSkills />}
      {tab === "placement"  && <TabPlacement />}
    </div>
  );
}