// studentSchedule.jsx
// Schedule module — rendered inside StudentDashboard
// Inherits CSS variables from StudentDashboard.css

import { useState, useEffect, useRef } from "react";
import api from "../../../utils/api";
import {
    ChevronLeft, ChevronRight, Calendar, Clock, MapPin,
    BookOpen, FlaskConical, Award, FileText,
    Users, Bell, Plus, X, Filter,
    LayoutGrid, List, ChevronDown, Bot, Brain,
    CheckCircle2, Circle, AlertTriangle, Star, Target,
    Coffee, AlarmClock, Download,
    TrendingUp, Activity
} from "lucide-react";

// ─── CONSTANTS ────────────────────────────────────────────────────
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const DAY_SHORT = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const HOURS = Array.from({ length: 14 }, (_, i) => i + 7); // 7am – 8pm
const TODAY_IDX = Math.min(Math.max(new Date().getDay() - 1, 0), 5);

const COURSE_COLORS = {
    "OS": { color: "var(--indigo-l)", rgb: "91,78,248", bg: "rgba(91,78,248,.1)" },
    "DBMS": { color: "var(--teal)", rgb: "20,184,166", bg: "rgba(20,184,166,.1)" },
    "ML": { color: "var(--amber)", rgb: "245,158,11", bg: "rgba(245,158,11,.1)" },
    "CN": { color: "var(--violet)", rgb: "139,92,246", bg: "rgba(139,92,246,.1)" },
    "Crypto": { color: "var(--rose)", rgb: "244,63,94", bg: "rgba(244,63,94,.1)" },
    "Lab": { color: "var(--teal)", rgb: "20,184,166", bg: "rgba(20,184,166,.1)" },
    "Event": { color: "var(--amber)", rgb: "245,158,11", bg: "rgba(245,158,11,.1)" },
    "Break": { color: "var(--text3)", rgb: "100,116,139", bg: "rgba(100,116,139,.1)" },
};

const EVENT_TYPES = {
    lecture: { label: "Lecture", Icon: BookOpen, color: "var(--indigo-ll)", rgb: "91,78,248" },
    lab: { label: "Lab", Icon: FlaskConical, color: "var(--teal)", rgb: "20,184,166" },
    quiz: { label: "Quiz", Icon: FileText, color: "var(--rose)", rgb: "244,63,94" },
    assignment: { label: "Due", Icon: FileText, color: "var(--amber)", rgb: "245,158,11" },
    seminar: { label: "Seminar", Icon: Users, color: "var(--violet)", rgb: "139,92,246" },
    event: { label: "Event", Icon: Star, color: "var(--amber)", rgb: "245,158,11" },
    break: { label: "Free", Icon: Coffee, color: "var(--text3)", rgb: "100,116,139" },
    exam: { label: "Exam", Icon: Award, color: "var(--rose)", rgb: "244,63,94" },
};


// ─── HELPERS ─────────────────────────────────────────────────────
function timeStr(h, m = 0) {
    const hh = h % 12 || 12;
    const mm = String(m).padStart(2, "0");
    return `${hh}:${mm} ${h >= 12 ? "PM" : "AM"}`;
}

function topOffset(startH, startM, baseH = 7) {
    return ((startH - baseH) * 60 + startM) / 60 * 64;
}

function AnimBar({ pct, color, height = 4, delay = 300 }) {
    const [w, setW] = useState(0);
    useEffect(() => { const t = setTimeout(() => setW(pct), delay); return () => clearTimeout(t); }, [pct, delay]);
    return (
        <div style={{ height, background: "var(--surface3)", borderRadius: 3, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${w}%`, background: color, borderRadius: 3, transition: "width 1s cubic-bezier(.16,1,.3,1)" }} />
        </div>
    );
}

// ─── STATS STRIP ─────────────────────────────────────────────────
function StatsStrip({ timetable }) {
    const totalClasses = timetable.filter(e => e.type === "lecture" || e.type === "lab").length;
    const totalLabs = timetable.filter(e => e.type === "lab").length;
    const quizzesWeek = timetable.filter(e => e.type === "quiz").length;
    const totalMins = timetable.reduce((s, e) => s + (e.durationMin||0), 0);
    return (
        <div className="san-kpi-grid" style={{ marginBottom: 20 }}>
            {[
                { cls: "sc-indigo", val: totalClasses, lbl: "Classes/Week", sub: "Lectures + Labs", Icon: BookOpen },
                { cls: "sc-teal", val: totalLabs, lbl: "Lab Sessions", sub: "Hands-on practicals", Icon: FlaskConical },
                { cls: "sc-amber", val: quizzesWeek, lbl: "Quizzes", sub: "Scheduled this week", Icon: FileText },
                { cls: "sc-violet", val: `${(totalMins / 60).toFixed(0)}h`, lbl: "Total Hours", sub: "In class this week", Icon: Clock },
            ].map(({ cls, val, lbl, sub, Icon }) => (
                <div key={lbl} className={`san-kpi-card ${cls}`}>
                    <div className="mc-kpi-icon"><Icon size={13} style={{ opacity: .55 }} /></div>
                    <div className="san-kpi-val">{val}</div>
                    <div className="san-kpi-lbl">{lbl}</div>
                    <span className="mc-kpi-sub">{sub}</span>
                </div>
            ))}
        </div>
    );
}

// ─── EVENT BLOCK (timetable grid cell) ───────────────────────────
function EventBlock({ event, onClick }) {
    const cc = COURSE_COLORS[event.courseKey] || COURSE_COLORS["Event"];
    const et = EVENT_TYPES[event.type] || EVENT_TYPES.lecture;
    const EIcon = et.Icon;
    const topPx = topOffset(event.startH, event.startM);
    const heightPx = (event.durationMin / 60 * 64) - 4;
    const isShort = event.durationMin <= 30;
    const isMed = event.durationMin <= 50;

    return (
        <div
            className={`sch-event-block${isShort ? " sch-event--short" : ""}`}
            style={{
                top: topPx + 2,
                height: Math.max(heightPx, 24),
                background: cc.bg,
                borderLeft: `3px solid ${cc.color}`,
                "--ev-color": cc.color,
                "--ev-rgb": cc.rgb,
            }}
            onClick={() => onClick(event)}>
            {!isShort && <div className="sch-ev-name">{event.subject}</div>}
            {isShort && <div className="sch-ev-name-short">{event.subject}</div>}
            {!isMed && <div className="sch-ev-meta"><MapPin size={8} />{event.room}</div>}
            {!isShort && <div className="sch-ev-time">{timeStr(event.startH, event.startM)}</div>}
        </div>
    );
}

// ─── EVENT DETAIL DRAWER ─────────────────────────────────────────
function EventDrawer({ event, onClose }) {
    if (!event) return null;
    const cc = COURSE_COLORS[event.courseKey] || COURSE_COLORS["Event"];
    const et = EVENT_TYPES[event.type] || EVENT_TYPES.lecture;
    const EIcon = et.Icon;
    const endH = event.startH + Math.floor((event.startM + event.durationMin) / 60);
    const endM = (event.startM + event.durationMin) % 60;

    return (
        <div className="as-drawer-overlay" onClick={onClose}>
            <div className="as-drawer" onClick={e => e.stopPropagation()} style={{ maxWidth: 420 }}>
                <div className="as-drawer-header" style={{ "--card-color": cc.color, "--card-rgb": cc.rgb }}>
                    <div className="as-drawer-header-bg" />
                    <div className="as-drawer-header-inner">
                        <div className="as-drawer-top-row">
                            <span className="as-course-chip" style={{ color: cc.color, background: `rgba(${cc.rgb},.12)` }}>
                                {event.code || event.courseKey}
                            </span>
                            <button className="as-modal-close" onClick={onClose}><X size={15} /></button>
                        </div>
                        <div className="as-drawer-title">{event.subject}</div>
                        <div className="as-drawer-chips">
                            <span className="as-type-chip" style={{ color: et.color, background: `rgba(${cc.rgb},.1)` }}>
                                <EIcon size={10} />{et.label}
                            </span>
                            <span style={{ fontSize: 11, color: "var(--text3)" }}>{DAYS[event.day]}</span>
                        </div>
                    </div>
                </div>

                <div className="as-drawer-body">
                    <div className="as-drawer-kpis">
                        {[
                            { lbl: "Starts", val: timeStr(event.startH, event.startM), icon: <Clock size={12} /> },
                            { lbl: "Duration", val: `${event.durationMin} min`, icon: <AlarmClock size={12} /> },
                            { lbl: "Room", val: event.room, icon: <MapPin size={12} /> },
                            { lbl: "Batch", val: event.batch, icon: <Users size={12} /> },
                        ].map(k => (
                            <div key={k.lbl} className="as-kpi-mini">
                                <div className="as-kpi-mini-icon" style={{ color: cc.color }}>{k.icon}</div>
                                <div className="as-kpi-mini-val" style={{ fontSize: 12 }}>{k.val}</div>
                                <div className="as-kpi-mini-lbl">{k.lbl}</div>
                            </div>
                        ))}
                    </div>

                    <div className="as-drawer-section">
                        <div className="as-drawer-sec-label"><Users size={11} />Faculty</div>
                        <div className="as-drawer-text">{event.faculty}</div>
                    </div>

                    <div className="as-drawer-section">
                        <div className="as-drawer-sec-label"><Clock size={11} />Timing</div>
                        <div className="sch-timing-bar">
                            <div style={{ color: cc.color, fontWeight: 700, fontSize: 12 }}>{timeStr(event.startH, event.startM)}</div>
                            <div style={{ flex: 1, padding: "0 10px" }}><AnimBar pct={100} color={cc.color} height={4} delay={200} /></div>
                            <div style={{ color: cc.color, fontWeight: 700, fontSize: 12 }}>{timeStr(endH, endM)}</div>
                        </div>
                    </div>

                    <div className="as-ai-hint">
                        <Bot size={14} style={{ color: "var(--indigo-ll)", flexShrink: 0 }} />
                        <div>
                            <div className="as-ai-hint-title">Lucyna Reminder</div>
                            <div className="as-ai-hint-text">
                                {event.type === "quiz" ? "Quiz today! Review your notes 30 min before. Focus on topics from the last 2 lectures."
                                    : event.type === "lab" ? "Bring your lab manual and pen drive. Review the procedure before entering the lab."
                                        : event.type === "assignment" ? "Deadline approaching! Ensure your submission is complete and correctly formatted."
                                            : "Attend regularly — below 75% attendance restricts you from final exams."}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="as-drawer-footer">
                    <button className="as-modal-btn as-modal-btn--ghost" onClick={onClose}>Close</button>
                    <button className="as-modal-btn as-modal-btn--primary" style={{ background: cc.color }}>
                        <Bell size={13} />Set Reminder
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── WEEK VIEW ────────────────────────────────────────────────────
function WeekView({ activeDay, onEventClick, timetable, weekDates = [] }) {
    const gridRef = useRef(null);
    useEffect(() => { if (gridRef.current) gridRef.current.scrollTop = (8 - 7) * 64; }, []);
    const TOTAL_H = 14;

    return (
        <div className="sch-week-view">
            {/* Day headers */}
            <div className="sch-week-header">
                <div className="sch-time-gutter" />
                {DAYS.map((d, i) => (
                    <div key={d} className={`sch-day-header${i === activeDay ? " sch-day-header--today" : ""}`}>
                        <div className="sch-day-short">{DAY_SHORT[i]}</div>
                        <div className="sch-day-num" style={i === activeDay ? { background: "var(--indigo-l)", color: "#fff", borderRadius: "50%", width: 26, height: 26, display: "flex", alignItems: "center", justifyContent: "center" } : {}}>
                            {weekDates[i] || "--"}
                        </div>
                    </div>
                ))}
            </div>

            {/* Scrollable grid */}
            <div className="sch-week-grid-scroll" ref={gridRef}>
                <div className="sch-week-grid" style={{ height: TOTAL_H * 64 }}>
                    <div className="sch-time-gutter">
                        {HOURS.map(h => (
                            <div key={h} className="sch-time-label">{timeStr(h)}</div>
                        ))}
                    </div>
                    {DAYS.map((d, di) => {
                        const dayEvents = timetable.filter(e => e.day === di);
                        return (
                            <div key={d} className={`sch-day-col${di === activeDay ? " sch-day-col--today" : ""}`}>
                                {HOURS.map(h => <div key={h} className="sch-hour-line" style={{ top: (h - 7) * 64 }} />)}
                                {HOURS.map(h => <div key={h + .5} className="sch-half-line" style={{ top: (h - 7) * 64 + 32 }} />)}
                                {dayEvents.map(ev => <EventBlock key={ev.id} event={ev} onClick={onEventClick} />)}
                                {di === activeDay && (
                                    <div className="sch-now-line" style={{ top: topOffset(new Date().getHours(), new Date().getMinutes()) }}>
                                        <div className="sch-now-dot" />
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

// ─── DAY VIEW ─────────────────────────────────────────────────────
function DayView({ dayIdx, onEventClick, timetable, weekDates = [] }) {
    const dayEvents = timetable.filter(e => e.day === dayIdx).sort((a, b) => (a.startH * 60 + a.startM) - (b.startH * 60 + b.startM));

    return (
        <div className="sch-day-view">
            <div className="sch-day-view-header">
                <div className="sch-dvh-day">{DAYS[dayIdx]}</div>
                <div className="sch-dvh-date">March {weekDates[dayIdx] || "--"}, 2026</div>
                <div className="sch-dvh-count">{dayEvents.length} session{dayEvents.length !== 1 ? "s" : ""}</div>
            </div>

            {dayEvents.length === 0 ? (
                <div className="mc-empty">
                    <Coffee size={32} style={{ color: "var(--text3)" }} />
                    <p>No classes today. Enjoy your free time!</p>
                </div>
            ) : (
                <div className="sch-day-timeline">
                    {dayEvents.map((ev, i) => {
                        const cc = COURSE_COLORS[ev.courseKey] || COURSE_COLORS["Event"];
                        const et = EVENT_TYPES[ev.type] || EVENT_TYPES.lecture;
                        const EIcon = et.Icon;
                        const endH = ev.startH + Math.floor((ev.startM + ev.durationMin) / 60);
                        const endM = (ev.startM + ev.durationMin) % 60;
                        const now = new Date().getHours() * 60 + new Date().getMinutes();
                        const isNow = dayIdx === TODAY_IDX && now >= ev.startH * 60 + ev.startM && now < endH * 60 + endM;
                        return (
                            <div key={ev.id} className={`sch-dt-item${isNow ? " sch-dt-item--now" : ""}`}
                                style={{ "--card-color": cc.color, "--card-rgb": cc.rgb }}
                                onClick={() => onEventClick(ev)}>
                                <div className="sch-dt-time">
                                    <div className="sch-dt-start" style={{ color: cc.color }}>{timeStr(ev.startH, ev.startM)}</div>
                                    <div className="sch-dt-line" style={{ background: `rgba(${cc.rgb},.2)` }} />
                                    <div className="sch-dt-end">{timeStr(endH, endM)}</div>
                                </div>
                                <div className="sch-dt-dot-col">
                                    <div className="sch-dt-dot" style={{ background: cc.color }}>
                                        {isNow && <span className="sch-dt-dot-pulse" style={{ borderColor: cc.color }} />}
                                    </div>
                                    {i < dayEvents.length - 1 && <div className="sch-dt-connector" style={{ background: `rgba(${cc.rgb},.2)` }} />}
                                </div>
                                <div className="sch-dt-card" style={{ borderColor: `rgba(${cc.rgb},.2)`, background: `rgba(${cc.rgb},.03)` }}>
                                    <div className="sch-dt-card-top">
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div className="sch-dt-subject">{ev.subject}</div>
                                            <div className="sch-dt-faculty">{ev.faculty} · {ev.room}</div>
                                        </div>
                                        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, flexShrink: 0 }}>
                                            <span className="as-type-chip" style={{ color: et.color, background: `rgba(${cc.rgb},.1)` }}>
                                                <EIcon size={9} />{et.label}
                                            </span>
                                            <span style={{ fontSize: 10.5, color: "var(--text3)" }}>{ev.durationMin} min</span>
                                        </div>
                                    </div>
                                    {isNow && (
                                        <div className="sch-dt-ongoing">
                                            <div className="sch-dt-ongoing-dot" />Ongoing now
                                        </div>
                                    )}
                                    {ev.code && <div style={{ fontSize: 10, color: `rgba(${cc.rgb},.65)`, marginTop: 4, fontWeight: 700 }}>{ev.code} · {ev.batch}</div>}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

// ─── LIST VIEW ────────────────────────────────────────────────────
function ListView({ onEventClick, timetable, weekDates = [] }) {
    return (
        <div className="sch-list-view">
            {DAYS.map((day, di) => {
                const dayEvents = timetable.filter(e => e.day === di).sort((a, b) => (a.startH * 60 + a.startM) - (b.startH * 60 + b.startM));
                return (
                    <div key={day} className="sch-lv-day">
                        <div className="sch-lv-day-header">
                            <div className={`sch-lv-day-num${di === TODAY_IDX ? " active" : ""}`}
                                style={di === TODAY_IDX ? { background: "var(--indigo-l)", color: "#fff" } : {}}>
                                {DAY_SHORT[di]} {weekDates[di] || ""}
                            </div>
                            <span style={{ fontSize: 11, color: "var(--text3)" }}>{dayEvents.length} sessions</span>
                        </div>
                        {dayEvents.length === 0
                            ? <div className="sch-lv-empty">No classes</div>
                            : dayEvents.map(ev => {
                                const cc = COURSE_COLORS[ev.courseKey] || COURSE_COLORS["Event"];
                                const et = EVENT_TYPES[ev.type] || EVENT_TYPES.lecture;
                                const EIcon = et.Icon;
                                const endH = ev.startH + Math.floor((ev.startM + ev.durationMin) / 60);
                                const endM = (ev.startM + ev.durationMin) % 60;
                                return (
                                    <div key={ev.id} className="sch-lv-item"
                                        style={{ "--card-color": cc.color, "--card-rgb": cc.rgb }}
                                        onClick={() => onEventClick(ev)}>
                                        <div className="sch-lv-strip" style={{ background: cc.color }} />
                                        <div className="sch-lv-time">
                                            <div style={{ color: cc.color, fontWeight: 700, fontSize: 12 }}>{timeStr(ev.startH, ev.startM)}</div>
                                            <div style={{ color: "var(--text3)", fontSize: 10.5 }}>{timeStr(endH, endM)}</div>
                                        </div>
                                        <div className="sch-lv-main">
                                            <div className="sch-lv-subject">{ev.subject}</div>
                                            <div className="sch-lv-detail">{ev.faculty} · {ev.room}</div>
                                        </div>
                                        <div className="sch-lv-right">
                                            <span className="as-type-chip" style={{ color: et.color, background: `rgba(${cc.rgb},.1)` }}>
                                                <EIcon size={9} />{et.label}
                                            </span>
                                            <span style={{ fontSize: 10, color: "var(--text3)" }}>{ev.durationMin} min</span>
                                        </div>
                                    </div>
                                );
                            })
                        }
                    </div>
                );
            })}
        </div>
    );
}

// ─── RIGHT SIDEBAR ────────────────────────────────────────────────
function WeeklySummary({ timetable }) {
    const perDay = DAYS.map((_, i) => timetable.filter(e => e.day === i).reduce((s, e) => s + (e.durationMin||0), 0));
    const maxMin = Math.max(...perDay);
    return (
        <div className="panel">
            <div className="panel-hd">
                <div className="panel-ttl"><TrendingUp size={13} style={{ color: "var(--teal)" }} />Weekly Load</div>
            </div>
            <div className="panel-body">
                <div className="sch-weekly-bars">
                    {DAYS.map((d, i) => {
                        const hrs = (perDay[i] / 60).toFixed(1);
                        const pct = maxMin > 0 ? Math.round((perDay[i] / maxMin) * 100) : 0;
                        return (
                            <div key={d} className={`sch-wb-col${i === TODAY_IDX ? " sch-wb-today" : ""}`}>
                                <div className="sch-wb-bar-wrap">
                                    <div className="sch-wb-bar"
                                        style={{ height: `${pct}%`, background: i === TODAY_IDX ? "var(--indigo-l)" : "var(--surface3)" }} />
                                </div>
                                <div className="sch-wb-label">{DAY_SHORT[i]}</div>
                                <div className="sch-wb-hrs" style={{ color: i === TODAY_IDX ? "var(--indigo-ll)" : "var(--text3)" }}>{hrs}h</div>
                            </div>
                        );
                    })}
                </div>
                <div style={{ fontSize: 11, color: "var(--text3)", textAlign: "center", marginTop: 8 }}>
                    {(perDay.reduce((s, v) => s + v, 0) / 60).toFixed(1)} hrs of class time this week
                </div>
            </div>
        </div>
    );
}

function RemindersPanel({ reminders }) {
    return (
        <div className="panel">
            <div className="panel-hd">
                <div className="panel-ttl"><AlertTriangle size={13} style={{ color: "var(--amber)" }} />Upcoming Deadlines</div>
            </div>
            <div className="panel-body" style={{ padding: "0 0 8px" }}>
                {reminders.map(r => {
                    const cc = COURSE_COLORS[r.courseKey] || COURSE_COLORS["Event"];
                    const et = EVENT_TYPES[r.type] || EVENT_TYPES.assignment;
                    const EIcon = et.Icon;
                    return (
                        <div key={r.id} className="sch-rem-item">
                            <div className="sch-rem-icon" style={{ background: `rgba(${cc.rgb},.1)`, color: cc.color }}>
                                <EIcon size={13} />
                            </div>
                            <div className="sch-rem-info">
                                <div className="sch-rem-title">{r.title}</div>
                                <div className="sch-rem-meta">{r.date} · {r.time}</div>
                            </div>
                            {r.urgent && <span className="sch-rem-urgent">!</span>}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function AIStudyPlan({ plan }) {
    if (!plan) return null;
    const recommendation = plan.recommendation || { title: "No Recommendation", text: "Keep up the good work!" };
    const tasks = plan.tasks || [];

    return (
        <div className="panel">
            <div className="panel-hd">
                <div className="panel-ttl"><Brain size={13} style={{ color: "var(--indigo-ll)" }} />Lucyna Study Plan</div>
            </div>
            <div className="panel-body">
                <div className="as-ai-hint" style={{ marginBottom: 12 }}>
                    <Bot size={14} style={{ color: "var(--indigo-ll)", flexShrink: 0 }} />
                    <div>
                        <div className="as-ai-hint-title">{recommendation.title}</div>
                        <div className="as-ai-hint-text">{recommendation.text}</div>
                    </div>
                </div>
                {tasks.length === 0 ? (
                    <p style={{ fontSize: 11, color: "var(--text3)", textAlign: "center", padding: "10px 0" }}>No tasks recommended for today.</p>
                ) : (
                    tasks.map((s, i) => (
                        <div key={i} className="sch-sp-item">
                            <div>
                                {s.done
                                    ? <CheckCircle2 size={14} style={{ color: "var(--teal)" }} />
                                    : <Circle size={14} style={{ color: "var(--text3)" }} />}
                            </div>
                            <div className={`sch-sp-info${s.done ? " sch-sp-done" : ""}`}>
                                <div className="sch-sp-task">{s.task}</div>
                                <div className="sch-sp-time">{s.time}</div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────
export default function StudentSchedule({ onBack }) {
    const [viewMode, setViewMode] = useState("week");
    const [activeDay, setActiveDay] = useState(TODAY_IDX);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [filterType, setFilterType] = useState("All");
    const [showFilterDd, setShowFilterDd] = useState(false);
    
    const [timetableState, setTimetableState] = useState([]);
    const [remindersState, setRemindersState] = useState([]);
    const [aiPlanState, setAiPlanState] = useState(null);
    const [weekDates, setWeekDates] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/student/schedule').then(data => {
            if (data.timetable) setTimetableState(data.timetable);
            if (data.reminders) setRemindersState(data.reminders);
            
            // Fetch AI Study Plan
            api.get('/student/schedule/ai-plan').then(plan => {
                setAiPlanState(plan);
            }).catch(() => setAiPlanState(null));
            
            // Derive dates for the current week (starting Monday)
            const now = new Date();
            const day = now.getDay();
            const diff = now.getDate() - day + (day === 0 ? -6 : 1);
            const start = new Date(now.setDate(diff));
            const dates = Array.from({ length: 6 }, (_, i) => {
                const d = new Date(start);
                d.setDate(start.getDate() + i);
                return d.getDate();
            });
            setWeekDates(dates);
        }).catch(console.error).finally(() => setLoading(false));
    }, []);

    const TYPE_FILTERS = ["All", "Lecture", "Lab", "Quiz", "Assignment", "Seminar", "Event"];

    useEffect(() => {
        const h = () => setShowFilterDd(false);
        document.addEventListener("click", h);
        return () => document.removeEventListener("click", h);
    }, []);

    const handleEventClick = (ev) => {
        if (filterType !== "All" && ev.type !== filterType.toLowerCase()) return;
        setSelectedEvent(ev);
    };

    if (loading) {
        return (
            <div className="mc-loading" style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"100%",gap:16}}>
                <div className="mc-loading-spinner"/>
                <p style={{color:"var(--text3)",fontSize:14}}>Loading schedules...</p>
            </div>
        );
    }

    const todayEvents = timetableState
        .filter(e => e.day === TODAY_IDX)
        .sort((a, b) => (a.startH * 60 + a.startM) - (b.startH * 60 + b.startM));

    const nowMins = new Date().getHours() * 60 + new Date().getMinutes();
    const nextEvent = todayEvents.find(e => e.startH * 60 + e.startM > nowMins);

    return (
        <>
            {selectedEvent && <EventDrawer event={selectedEvent} onClose={() => setSelectedEvent(null)} />}

            <div className="sch-root">
                {/* ── Page Header ── */}
                <div className="san-page-hd">
                    <div className="san-back-row">
                        <button className="san-back-btn" onClick={onBack}><ChevronLeft size={13} /> Dashboard</button>
                        <div className="san-breadcrumb">
                            <span>Dashboard</span>
                            <ChevronRight size={11} style={{ color: "var(--text3)" }} />
                            <span className="san-bc-active">Schedule</span>
                        </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginTop: 10 }}>
                        <div>
                            <div className="greet-tag" style={{ marginBottom: 8 }}>
                                <div className="greet-pip" />
                                <span className="greet-pip-txt">Semester 5 · Week 11 · Mar 3–8, 2026 · {timetableState.length} Sessions</span>
                            </div>
                            <h1 className="greet-title">My <em>Schedule</em></h1>
                            <p className="greet-sub">View your weekly timetable, track upcoming classes, labs, and quizzes.</p>
                        </div>
                        {nextEvent && (
                            <div className="sch-next-class-banner">
                                <div className="sch-ncb-label">Next Up</div>
                                <div className="sch-ncb-subject" style={{ color: (COURSE_COLORS[nextEvent.courseKey] || COURSE_COLORS.Event).color }}>
                                    {nextEvent.subject}
                                </div>
                                <div className="sch-ncb-meta">
                                    <Clock size={11} />{timeStr(nextEvent.startH, nextEvent.startM)} · {nextEvent.room}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <StatsStrip timetable={timetableState} />

                {/* ── Toolbar ── */}
                <div className="mc-toolbar" style={{ marginBottom: 16 }}>
                    <div className="sch-day-pills">
                        {DAYS.map((d, i) => {
                            const cnt = timetableState.filter(e => e.day === i).length;
                            return (
                                <button key={d}
                                    className={`sch-day-pill${i === activeDay ? " active" : ""}`}
                                    style={i === activeDay ? { background: "var(--indigo-l)", color: "#fff", borderColor: "var(--indigo-l)" } : {}}
                                    onClick={() => { setActiveDay(i); if (viewMode === "week") setViewMode("day"); }}>
                                    <span>{DAY_SHORT[i]}</span>
                                    {cnt > 0 && <span className="sch-pill-count" style={i === activeDay ? { background: "rgba(255,255,255,.25)", color: "#fff" } : {}}>{cnt}</span>}
                                </button>
                            );
                        })}
                    </div>
                    <div className="mc-toolbar-right">
                        <div className="vl-sort-wrap" onClick={e => e.stopPropagation()}>
                            <button className="vl-sort-btn" onClick={() => setShowFilterDd(d => !d)}>
                                <Filter size={12} />{filterType}
                                <ChevronDown size={11} style={{ transform: showFilterDd ? "rotate(180deg)" : "none", transition: "transform .18s" }} />
                            </button>
                            {showFilterDd && (
                                <div className="vl-sort-dd">
                                    {TYPE_FILTERS.map(t => (
                                        <button key={t} className={`vl-sort-opt${filterType === t ? " active" : ""}`}
                                            onClick={() => { setFilterType(t); setShowFilterDd(false); }}>
                                            {t}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="mc-view-toggle">
                            <button className={`mc-view-btn${viewMode === "week" ? " active" : ""}`} title="Week" onClick={() => setViewMode("week")}><LayoutGrid size={13} /></button>
                            <button className={`mc-view-btn${viewMode === "day" ? " active" : ""}`} title="Day" onClick={() => setViewMode("day")}><Calendar size={13} /></button>
                            <button className={`mc-view-btn${viewMode === "list" ? " active" : ""}`} title="List" onClick={() => setViewMode("list")}><List size={13} /></button>
                        </div>
                        <button className="vl-sort-btn"><Download size={12} />Export</button>
                    </div>
                </div>

                {/* ── Main layout ── */}
                <div className="sch-main-layout">
                    <div className="sch-calendar-area">
                        {viewMode === "week" && <WeekView activeDay={activeDay} onEventClick={handleEventClick} timetable={timetableState} weekDates={weekDates} />}
                        {viewMode === "day" && <DayView dayIdx={activeDay} onEventClick={handleEventClick} timetable={timetableState} weekDates={weekDates} />}
                        {viewMode === "list" && <ListView onEventClick={handleEventClick} timetable={timetableState} weekDates={weekDates} />}
                    </div>
                    <div className="sch-sidebar">
                        <WeeklySummary timetable={timetableState} />
                        <RemindersPanel reminders={remindersState} />
                        <AIStudyPlan plan={aiPlanState} />
                    </div>
                </div>
            </div>
        </>
    );
}