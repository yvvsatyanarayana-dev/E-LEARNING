// StudentAnalytics.jsx
// Student-specific analytics module — imported into StudentDashboard.jsx
// Uses CSS variables from StudentDashboard.css + studentAnalytics.css

import { useState, useEffect, useCallback } from "react";
import api from "../../../utils/api";
// ─── ICONS ───────────────────────────────────────────────────────
const IcoTrendingUp   = (p) => <svg {...p} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>;
const IcoTrendingDown = (p) => <svg {...p} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6" /><polyline points="17 18 23 18 23 12" /></svg>;
const IcoMinus        = (p) => <svg {...p} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12" /></svg>;
const IcoUsers        = (p) => <svg {...p} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>;
const IcoBarChart     = (p) => <svg {...p} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>;
const IcoTarget       = (p) => <svg {...p} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></svg>;
const IcoClock        = (p) => <svg {...p} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>;
const IcoAward        = (p) => <svg {...p} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="6" /><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" /></svg>;
const IcoFlame        = (p) => <svg {...p} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.5 3.5 6.5 1 1.5 1 2.5 1 3.25a6.5 6.5 0 1 1-13 0c0-1.5 1-3 2.5-4 .5 1.5 1.5 3 1.5 5.25n0 0z"/></svg>;
const IcoDownload     = (p) => <svg {...p} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>;
const IcoFilter       = (p) => <svg {...p} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>;
const IcoBookOpen     = (p) => <svg {...p} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>;
const IcoStar         = (p) => <svg {...p} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
const IcoActivity     = (p) => <svg {...p} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>;
const IcoZap          = (p) => <svg {...p} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>;
const IcoChevronLeft  = (p) => <svg {...p} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>;
const IcoChevronRight = (p) => <svg {...p} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>;

// ─── TABS ──────────────────────────────────────────────────────────
const TABS = [
  { id: "performance", label: "Performance", Icon: IcoTrendingUp },
  { id: "attendance", label: "Attendance", Icon: IcoUsers },
  { id: "skills", label: "Skills", Icon: IcoBarChart },
  { id: "placement", label: "Placement", Icon: IcoTarget },
];

const PERIODS = ["This Week", "Last 30 Days", "Semester"];

const COLOR_MAP = {
  OS: "var(--indigo-l)",
  DBMS: "var(--teal)",
  ML: "var(--amber)",
  CN: "var(--violet)",
  Crypto: "var(--rose)",
};


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
function AttendHeatmap({ heatmap, courses, weeks }) {
  return (
    <div className="att-heatmap">
      <div className="att-hm-header">
        <span className="att-hm-corner" />
        {weeks.map(w => <span key={w} className="att-hm-wlbl">{w}</span>)}
      </div>
      {heatmap.map((row, ri) => (
        <div key={ri} className="att-hm-row">
          <span className="att-hm-clbl" style={{ color: COLOR_MAP[courses[ri]] }}>
            {courses[ri]}
          </span>
          {row.map((v, ci) => (
            <div key={ci}
              className={`att-hm-cell ${v ? "present" : "absent"}`}
              style={v ? { background: COLOR_MAP[courses[ri]], opacity: 0.7 } : {}}
              title={`${courses[ri]} ${weeks[ci]}: ${v ? "Present" : "Absent"}`}
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
function TabPerformance({ activeCourse, setActiveCourse, performance }) {
  const courses = Object.keys(performance.my_score_trend);

  return (
    <div className="san-tab-content">
      {/* KPI row */}
      <div className="san-kpi-grid">
        {performance.kpis.map(({ cls, val, lbl, delta, up }) => (
          <div key={lbl} className={`san-kpi-card ${cls}`}>
            <div className="san-kpi-val">{val}</div>
            <div className="san-kpi-lbl">{lbl}</div>
            <span className={`stat-delta ${up === true ? "delta-up" : up === false ? "delta-dn" : "delta-neu"}`}>
              {up === true && <IcoTrendingUp size={9} strokeWidth={2.5} />}
              {up === false && <IcoTrendingDown size={9} strokeWidth={2.5} />}
              {up === null && <IcoMinus size={9} strokeWidth={2.5} />}
              {delta}
            </span>
          </div>
        ))}
      </div>


      {/* Score vs Class chart */}
      <div className="panel" style={{ marginBottom: 16 }}>
        <div className="panel-hd">
          <div className="panel-ttl">
            <IcoTrendingUp size={14} style={{ color: "var(--indigo-ll)" }} />
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
              { label: "Me", values: performance.my_score_trend[activeCourse], color: COLOR_MAP[activeCourse], bold: true },
              { label: "Class Avg", values: performance.class_score_trend[activeCourse], color: "rgba(255,255,255,.25)", dashed: true },
            ]}
            labels={performance.weeks} height={155}
          />
        </div>
      </div>

      {/* Quiz history + all-course trends */}
      <div className="san-two-col">
        <div className="panel">
          <div className="panel-hd">
            <div className="panel-ttl">
              <IcoClock size={14} style={{ color: "var(--indigo-ll)" }} />
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
              {performance.quiz_history.map((q, i) => (
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
              <IcoBarChart size={14} style={{ color: "var(--indigo-ll)" }} />
              Score Trend — All Courses
            </div>
          </div>
          <div className="panel-body">
            <div className="all-course-trends">
              {Object.entries(performance.my_score_trend).map(([course, vals]) => {
                const latest = vals[vals.length - 1];
                const prev = vals[vals.length - 2] ?? latest;
                const delta = latest - prev;
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
function TabAttendance({ attendance }) {
  const { overall_pct, total_classes, attended_classes, breakdown, heatmap, weeks, courses } = attendance;

  return (
    <div className="san-tab-content">
      <div className="san-attend-hero">
        <div className="sah-donut">
          <Donut
            segments={[
              { pct: overall_pct, color: "var(--teal)" },
              { pct: 100 - overall_pct, color: "var(--surface3)" },
            ]}
            size={110} stroke={14}
          />
          <div className="sah-donut-label">
            <div className="sah-val">{overall_pct}%</div>
            <div className="sah-sub">Overall</div>
          </div>
        </div>
        <div className="sah-info">
          <div className="sah-title">Attendance Overview</div>
          <div className="sah-meta">Semester 5 · {total_classes} classes total</div>
          <div className="sah-stats">
            <div className="sah-stat">
              <span className="sah-stat-val teal">{attended_classes}</span>
              <span className="sah-stat-lbl">Attended</span>
            </div>
            <div className="sah-stat">
              <span className="sah-stat-val rose">{total_classes - attended_classes}</span>
              <span className="sah-stat-lbl">Missed</span>
            </div>
            <div className="sah-stat">
              <span className={`sah-stat-val ${overall_pct >= 75 ? "teal" : "rose"}`}>
                {overall_pct >= 75 ? "Safe" : "At Risk"}
              </span>
              <span className="sah-stat-lbl">Status</span>
            </div>
          </div>
          <div className="sah-warn">
            {overall_pct < 75
              ? <span className="sah-warn-bad">
                ⚠️ Below 75% minimum — attend {Math.ceil((75 * total_classes - attended_classes * 100) / 25)} more classes
              </span>
              : <span className="sah-warn-ok">
                ✅ You can miss {Math.floor((attended_classes * 100 / 75) - total_classes)} more classes safely
              </span>
            }
          </div>
        </div>
      </div>


      <div className="panel" style={{ marginBottom: 16 }}>
        <div className="panel-hd">
          <div className="panel-ttl">
            <IcoUsers size={14} style={{ color: "var(--indigo-ll)" }} />
            Per-Course Breakdown
          </div>
        </div>
        <div className="panel-body">
          <div className="attend-list">
            {breakdown.map((a, i) => (
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
            <IcoClock size={14} style={{ color: "var(--indigo-ll)" }} />
            Weekly Attendance Pattern
            <span>Last 8 weeks</span>
          </div>
        </div>
        <div className="panel-body">
          <AttendHeatmap heatmap={heatmap} courses={courses} weeks={weeks} />
        </div>
      </div>
    </div>
  );
}

// ─── SKILLS TAB ───────────────────────────────────────────────────
function TabSkills({ skills, weeks }) {
  const { radar, progression, achievements } = skills;


  return (
    <div className="san-tab-content">
      <div className="san-two-col">
        <div className="panel">
          <div className="panel-hd">
            <div className="panel-ttl">
              <IcoTarget size={14} style={{ color: "var(--indigo-ll)" }} />
              Skill Radar
            </div>
          </div>
          <div className="panel-body" style={{ display: "flex", justifyContent: "center", paddingTop: 8 }}>
            <RadarChart data={radar} size={220} />
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
              {progression.map((s, i) => {
                const start = s.scores[0];
                const end = s.scores[s.scores.length - 1];
                const gain = end - start;
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
            <IcoTrendingUp size={14} style={{ color: "var(--indigo-ll)" }} />
            Skill Progression — All Skills
            <span>Weekly · {data.semester}</span>
          </div>
          <div className="san-legend">
            {progression.map(s => (
              <span key={s.label} className="san-legend-item">
                <span className="san-legend-dot" style={{ background: s.color }} />{s.label}
              </span>
            ))}
          </div>
        </div>
        <div className="panel-body">
          <LineChart
            datasets={progression.map(s => ({ label: s.label, values: s.scores, color: s.color }))}
            labels={weeks} height={155}
          />
        </div>
      </div>

      <div className="panel">
        <div className="panel-hd">
          <div className="panel-ttl">
            <IcoAward size={14} style={{ color: "var(--indigo-ll)" }} />
            Achievements
            <span>{achievements.length} unlocked</span>
          </div>
        </div>
        <div className="panel-body">
          <div className="achieve-grid">
            {achievements.map((a, i) => (
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
function TabPlacement({ placement }) {
  const { pri, target, breakdown, suggestions, eligibility } = placement;
  const weighted = breakdown
    .reduce((a, c) => a + c.score * (c.weight / 100), 0)
    .toFixed(1);

  const getPRIInfo = (p) => {
    if (p >= 80) return { tier: "Excellent", msg: "Excellent Tier · Top readiness" };
    if (p >= 60) return { tier: "Good",      msg: `Good Tier · ${80 - p} pts to Excellent` };
    if (p >= 40) return { tier: "Developing",msg: `Developing · ${60 - p} pts to Good tier` };
    return { tier: "Beginner", msg: `Beginner · ${40 - p} pts to Developing` };
  };
  const priInfo = getPRIInfo(pri);

  return (
    <div className="san-tab-content">
      {/* PRI hero */}
      <div className="pri-hero">
        <div className="pri-donut-wrap">
          <Donut
            segments={[
              { pct: pri, color: "var(--indigo-l)" },
              { pct: target - pri, color: "rgba(91,78,248,.15)" },
              { pct: 100 - target, color: "var(--surface3)" },
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
          <div className="pri-grade">{priInfo.msg}</div>
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
              ["Beginner", "0", "rose"],
              ["Developing", "40", "amber"],
              ["Good", "60", "indigo-ll"],
              ["Excellent", "80", "teal"],
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
              <IcoTarget size={14} style={{ color: "var(--indigo-ll)" }} />
              PRI Component Breakdown
            </div>
          </div>
          <div className="panel-body">
            {breakdown.map((b, i) => (
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
              <IcoFlame size={14} style={{ color: "var(--rose)" }} />
              Improvement Suggestions
            </div>
          </div>
          <div className="panel-body">
            <div className="improve-list">
              {suggestions.map((s, i) => (
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
              <div className="icta-val">{pri + suggestions.reduce((acc, s) => acc + parseInt(s.impact), 0)} <span>→ {pri + suggestions.reduce((acc, s) => acc + parseInt(s.impact), 0) >= 80 ? "Excellent" : "Advanced"} Tier 🎯</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* Company tier eligibility */}
      <div className="panel">
        <div className="panel-hd">
          <div className="panel-ttl">
            <IcoAward size={14} style={{ color: "var(--indigo-ll)" }} />
            Eligibility by Company Tier
            <span>Based on current PRI</span>
          </div>
        </div>
        <div className="panel-body">
          <div className="tier-grid">
            {eligibility.map((t, i) => (
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
  const [tab, setTab] = useState("performance");
  const [period, setPeriod] = useState("Semester");
  const [activeCourse, setActiveCourse] = useState("OS");

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/student/analytics");
      setData(res);
    } catch (err) {
      console.error("Failed to fetch analytics:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) return <div className="san-root" style={{ padding: 40, textAlign: "center" }}>Loading Analytics...</div>;
  if (!data) return <div className="san-root" style={{ padding: 40, textAlign: "center" }}>Failed to load analytics data.</div>;


  return (
    <div className="san-root">

      {/* ── Page header ── */}
      <div className="san-page-hd">
        <div className="san-back-row">
          <button className="san-back-btn" onClick={onBack}>
            <IcoChevronLeft size={13} /> Dashboard
          </button>
          <div className="san-breadcrumb">
            <span>Dashboard</span>
            <IcoChevronRight size={11} style={{ color: "var(--text3)" }} />
            <span className="san-bc-active">Analytics</span>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginTop: 10 }}>
          <div>
            <div className="greet-tag" style={{ marginBottom: 8 }}>
              <div className="greet-pip" />
              <span className="greet-pip-txt">{data.semester} · Week {data.current_week} · Personal Analytics</span>
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
            <button className="an-icon-btn" title="Export"><IcoDownload size={14} /></button>
            <button className="an-icon-btn" title="Filter"><IcoFilter size={14} /></button>
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
        <TabPerformance
          activeCourse={activeCourse}
          setActiveCourse={setActiveCourse}
          performance={data.performance}
        />
      )}
      {tab === "attendance" && <TabAttendance attendance={data.attendance} />}
      {tab === "skills" && <TabSkills skills={data.skills} weeks={data.performance.weeks} />}
      {tab === "placement" && <TabPlacement placement={data.placement} />}
    </div>
  );
}