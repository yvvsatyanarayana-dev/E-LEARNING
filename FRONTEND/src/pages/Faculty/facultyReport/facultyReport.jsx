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

const REPORT_TYPES = [
  { id:"attendance",  icon:<IcoUsers style={{width:18,height:18}}/>, title:"Attendance Logs",      desc:"Detailed session tracking",    cls:"sc-teal"   },
  { id:"grades",      icon:<IcoBar   style={{width:18,height:18}}/>, title:"Grade Distribution",   desc:"Score & grade breakdown",     cls:"sc-indigo" },
  { id:"performance", icon:<IcoTrend style={{width:18,height:18}}/>, title:"Performance Trends",  desc:"Activity & score momentum",   cls:"sc-violet" },
  { id:"quiz",        icon:<IcoClock style={{width:18,height:18}}/>, title:"Quiz Analytics",      desc:"Attempts & error patterns",   cls:"sc-amber"  },
  { id:"course",      icon:<IcoFile  style={{width:18,height:18}}/>, title:"Syllabus Progress",   desc:"Coverage & completions",      cls:"sc-rose"   },
  { id:"custom",      icon:<IcoBar   style={{width:18,height:18}}/>, title:"Custom Extract",       desc:"Select courses & date",        cls:"sc-teal"   },
];

function Sparkline({ data, color }) {
  if (!data || data.length === 0) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const h = 32, w = 80;
  const pts = data.map((d,i) => {
    const x = (i/(data.length-1))*(w-4)+2;
    const y = h - ((d-min)/(max-min||1))*(h-12)-6;
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{overflow:"visible"}}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx={pts.split(" ").pop().split(",")[0]} cy={pts.split(" ").pop().split(",")[1]} r="2.2" fill={color}/>
    </svg>
  );
}

export default function Reports({ onBack }) {
  const [selected, setSelected] = useState(null);
  const [generating, setGenerating] = useState(null);
  const [data, setData] = useState({ stats: [], courses: [], week_scores: [] });
  const [loading, setLoading] = useState(true);

  const maxScore = 100;

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

  const handleDownload = async (id) => {
    try {
      setGenerating(id);
      const blob = await api.download(`/faculty/reports/export/${id}`);
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${id}_report_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download failed:", err);
      alert("Failed to export report. Please try again.");
    } finally {
      setGenerating(null);
    }
  };

  if (loading) return (
    <div className="loading-state">
      <div className="spinner"></div>
      <span className="loading-text">Collecting Faculty Intelligence...</span>
    </div>
  );

  return (
    <div className="rp-page">
      <header className="rp-header">
        <div className="rp-hd-left">
          <button className="rp-back-pill" onClick={onBack}>
            <IcoChevL style={{width:12,height:12}}/> Dashboard
          </button>
          <h1 className="rp-main-title">Faculty Reports <span className="pro-tag">Analytics</span></h1>
          <p className="rp-subtitle">Extract real-time academic data and student progress metrics</p>
        </div>
        <button className="rp-export-all" onClick={() => handleDownload("performance")}>
          <IcoDownload style={{width:14,height:14}}/> Export Comprehensive Data
        </button>
      </header>

      <section className="rp-summary">
        {data.stats.map(({ label, value, cls }) => (
          <div key={label} className={`summary-tile ${cls}`}>
            <div className="tile-inner">
               <span className="tile-val">{value}</span>
               <span className="tile-lbl">{label}</span>
            </div>
            <div className="tile-bg-icon"><IcoTrend/></div>
          </div>
        ))}
      </section>

      <div className="rp-content-grid">
        <div className="rp-reports-main">
          <h2 className="section-hdr">Available Reports</h2>
          <div className="report-tiles">
            {REPORT_TYPES.map(r => (
              <div key={r.id} className={`report-tile ${selected===r.id?'active':''}`} onClick={()=>setSelected(r.id)}>
                <div className={`tile-icon-box ${r.cls}`}>{r.icon}</div>
                <div className="tile-body">
                  <h3 className="tile-title">{r.title}</h3>
                  <p className="tile-desc">{r.desc}</p>
                </div>
                <button 
                  className={`tile-dl-btn ${generating===r.id?'loading':''}`}
                  onClick={(e) => { e.stopPropagation(); handleDownload(r.id); }}
                  disabled={generating !== null}
                >
                  {generating === r.id ? "..." : <IcoDownload style={{width:14,height:14}}/>}
                </button>
              </div>
            ))}
          </div>
        </div>

        <aside className="rp-side-analytics">
          <div className="context-card">
            <div className="card-hd">Live Course Pulse</div>
            <div className="course-rows">
              {data.courses.map(c => (
                <div key={c.id} className="course-insight">
                  <div className="insight-top">
                    <span className="course-code" style={{color:c.color}}>{c.code}</span>
                    <Sparkline data={c.sparkline} color={c.color}/>
                  </div>
                  <div className="insight-metrics">
                    <div className="mini-metric">
                      <span className="mm-val">{c.avgScore}%</span>
                      <span className="mm-lbl">Avg Score</span>
                    </div>
                    <div className="mini-metric">
                      <span className="mm-val">{c.attendance}%</span>
                      <span className="mm-lbl">Attendance</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="trend-viz">
              <div className="card-hd" style={{marginBottom:12}}>Score Momentum (5W)</div>
              <div className="momentum-grid">
                {data.week_scores.map(w => (
                  <div key={w.week} className="momentum-row">
                    <div className="m-bars">
                      {data.courses.map(c => (
                        <div key={c.id} className="m-bar" style={{height:`${(w[c.id]/maxScore)*100}%`, background:c.color}}/>
                      ))}
                    </div>
                    <span className="m-week">{w.week}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}