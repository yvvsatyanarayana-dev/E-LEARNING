import { useState, useEffect } from "react";
import api from "../../../utils/api";
import "./facultyReport.css";

const IcoChevL   = (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>;
const IcoDownload= (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>;
const IcoBar     = (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>;
const IcoTrend   = (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>;
const IcoUsers   = (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const IcoFile    = (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>;
const IcoClock   = (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const IcoChevR   = (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>;

const REPORT_TYPES = [
  { id:"attendance",  icon:<IcoUsers style={{width:18,height:18}}/>, title:"Attendance Report",       desc:"Overall and per-student attendance summary with trend analysis",         cls:"sc-teal",   color:"var(--teal)"     },
  { id:"grades",      icon:<IcoBar   style={{width:18,height:18}}/>, title:"Grade Distribution",      desc:"Score distribution, grade breakdown, and comparative course analysis",   cls:"sc-indigo", color:"var(--indigo-ll)" },
  { id:"performance", icon:<IcoTrend style={{width:18,height:18}}/>, title:"Performance Trends",      desc:"Week-over-week performance changes, top performers, at-risk students",   cls:"sc-violet", color:"var(--violet)"   },
  { id:"quiz",        icon:<IcoClock style={{width:18,height:18}}/>, title:"Quiz Analytics Report",   desc:"Quiz completion rates, score distributions, common mistakes",             cls:"sc-amber",  color:"var(--amber)"    },
  { id:"course",      icon:<IcoFile  style={{width:18,height:18}}/>, title:"Course Progress Report",  desc:"Lecture completion, topic coverage, syllabus status per course",          cls:"sc-rose",   color:"var(--rose)"     },
  { id:"custom",      icon:<IcoBar   style={{width:18,height:18}}/>, title:"Custom Report",           desc:"Build a custom report by selecting courses, students, date ranges",      cls:"sc-teal",   color:"var(--teal)"     },
];

function Sparkline({ data, color }) {
  if (!data || data.length === 0) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const h = 36, w = 80;
  const pts = data.map((d,i) => {
    const x = (i/(data.length-1))*(w-4)+2;
    const y = h - ((d-min)/(max-min||1))*(h-8)-4;
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx={pts.split(" ").pop().split(",")[0]} cy={pts.split(" ").pop().split(",")[1]} r="2.5" fill={color}/>
    </svg>
  );
}

function ProgressBar({ pct, color="var(--indigo-l)", height=4 }) {
  return (
    <div style={{height,borderRadius:4,background:"rgba(255,255,255,.06)",overflow:"hidden"}}>
      <div style={{height:"100%",width:`${Math.min(100,pct)}%`,background:color,borderRadius:4,transition:"width .6s ease"}}/>
    </div>
  );
}

const maxScore = 100;

export default function Reports({ onBack }) {
  const [selected, setSelected] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState({});
  const [data, setData] = useState({ stats: [], courses: [], week_scores: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get("/faculty/reports");
        setData(res);
      } catch (err) {
        console.error("Failed to fetch reports:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const generate = (id) => {
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
      setGenerated(p => ({...p, [id]: true}));
    }, 1400);
  };

  if (loading) return <div className="loading-state">Loading reports…</div>;

  return (
    <div className="rp-root">
      <div className="rp-page-hd">
        <div>
          <button className="rp-back-btn" onClick={onBack}><IcoChevL style={{width:13,height:13}}/> Dashboard</button>
          <div className="greet-title" style={{marginBottom:2}}>Reports</div>
          <div className="greet-sub">Generate and download faculty reports for all courses</div>
        </div>
        <div className="rp-hd-right">
          <button className="btn btn-ghost" style={{display:"flex",alignItems:"center",gap:6,fontSize:12}}>
            <IcoDownload style={{width:13,height:13}}/> Export All
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="rp-stat-strip">
        {data.stats.map(({ label, value, cls }) => (
          <div key={label} className={`stat-card ${cls}`}>
            <div className="stat-val">{value}</div>
            <div className="stat-label">{label}</div>
          </div>
        ))}
      </div>

      <div className="rp-layout">
        {/* Report types */}
        <div>
          <div className="rp-section-title">Report Types</div>
          <div className="rp-type-grid">
            {REPORT_TYPES.map(r => (
              <div key={r.id}
                className={`rp-type-card ${selected===r.id?"rp-type-card--active":""}`}
                onClick={()=>setSelected(r.id)}>
                <div className={`rp-type-icon ${r.cls}`}>{r.icon}</div>
                <div className="rp-type-info">
                  <div className="rp-type-title">{r.title}</div>
                  <div className="rp-type-desc">{r.desc}</div>
                </div>
                <div className="rp-type-actions">
                  {generated[r.id] && <span className="rp-generated-badge">✓ Ready</span>}
                  <button
                    className="btn btn-ghost rp-gen-btn"
                    onClick={e=>{e.stopPropagation(); generate(r.id);}}
                    disabled={generating}
                    style={{fontSize:11,display:"flex",alignItems:"center",gap:5}}>
                    {generating && selected===r.id ? "Generating…" : <><IcoDownload style={{width:11,height:11}}/> Generate</>}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick summary charts */}
        <div className="rp-quick-panel">
          <div className="rp-section-title">Course Overview</div>
          <div className="panel">
            <div className="panel-body">
              {data.courses.map((c) => (
                <div key={c.id} className="rp-course-row">
                  <div className="rp-course-info">
                    <span className="rp-course-code" style={{color:c.color}}>{c.code}</span>
                    <span className="rp-course-name">{c.name}</span>
                  </div>
                  <div className="rp-course-metrics">
                    <div className="rp-metric">
                      <span className="rp-metric-val" style={{color:c.avgScore>=75?"var(--teal)":"var(--amber)"}}>{c.avgScore}%</span>
                      <span className="rp-metric-lbl">Score</span>
                    </div>
                    <div className="rp-metric">
                      <span className="rp-metric-val" style={{color:c.attendance>=80?"var(--teal)":"var(--amber)"}}>{c.attendance}%</span>
                      <span className="rp-metric-lbl">Attend.</span>
                    </div>
                    <div className="rp-metric">
                      <span className="rp-metric-val">{c.lectures_done}/{c.lectures_total}</span>
                      <span className="rp-metric-lbl">Lectures</span>
                    </div>
                    <Sparkline data={c.sparkline} color={c.color}/>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Score trend bars */}
          <div className="rp-section-title" style={{marginTop:14}}>Score Trend (W7–W11)</div>
          <div className="panel">
            <div className="panel-body">
              {data.week_scores.map(w => (
                <div key={w.week} className="rp-week-row">
                  <span className="rp-week-lbl">{w.week}</span>
                  <div className="rp-week-bars">
                    {data.courses.map((c)=>(
                      <div key={c.id} className="rp-week-bar-wrap">
                        <div style={{height:6,borderRadius:3,background:"rgba(255,255,255,.06)",overflow:"hidden",flex:1}}>
                          <div style={{height:"100%",width:`${(w[c.id]/maxScore)*100}%`,background:c.color,borderRadius:3,transition:"width .6s"}}/>
                        </div>
                        <span style={{fontSize:9.5,color:c.color,fontWeight:700,width:28,textAlign:"right",flexShrink:0}}>{w[c.id]}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <div className="rp-legend">
                {data.courses.map((c)=>(
                  <div key={c.id} className="rp-leg-item"><span style={{width:8,height:8,borderRadius:2,background:c.color,display:"inline-block",marginRight:5}}/>{c.code}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}