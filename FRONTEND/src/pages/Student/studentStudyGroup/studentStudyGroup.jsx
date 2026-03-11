// studentStudyGroups.jsx
// Study Groups module — rendered inside StudentDashboard
// Inherits CSS variables from StudentDashboard.css

import { useState, useEffect, useRef, useCallback } from "react";
import {
  ChevronLeft, ChevronRight, Users, Search, Plus, X,
  MessageSquare, Calendar, BookOpen, Send, Paperclip,
  Mic, MoreHorizontal, Hash, Lock, Globe, Star, Crown,
  Bell, BellOff, LogOut, Settings, UserPlus, Edit3,
  ThumbsUp, Heart, Smile, Zap, FileText, Link2,
  Image, Video, Clock, CheckCircle2, Circle, Pin,
  ChevronDown, Filter, LayoutGrid, List, Bot, Brain,
  Trophy, Flame, Target, TrendingUp, Activity, Share2,
  Download, Eye, Layers, ArrowRight, Radio, Mic2,
  Volume2, VolumeX, Monitor, PhoneOff, Phone
} from "lucide-react";

// Data will be fetched from API

// ─── UTILS ────────────────────────────────────────────────────────
import api from "../../../utils/api";

function getStatusColor(status) {
  if (status === "online") return "var(--teal)";
  if (status === "away") return "var(--amber)";
  return "var(--surface3)";
}

// ─── EMOJI REACTIONS ──────────────────────────────────────────────
const QUICK_EMOJIS = ["👍", "❤️", "🔥", "😂", "😮", "✅", "💡", "🏆"];

// ─── HELPERS ──────────────────────────────────────────────────────
function AnimBar({ pct, color, height = 4, delay = 300 }) {
  const [w, setW] = useState(0);
  useEffect(() => { const t = setTimeout(() => setW(pct), delay); return () => clearTimeout(t); }, [pct, delay]);
  return (
    <div style={{ height, background: "var(--surface3)", borderRadius: 3, overflow: "hidden" }}>
      <div style={{ height: "100%", width: `${w}%`, background: color, borderRadius: 3, transition: "width 1s cubic-bezier(.16,1,.3,1)" }} />
    </div>
  );
}

function MemberAvatar({ member, size = 32, showStatus = false }) {
  const statusColors = { online: "var(--teal)", away: "var(--amber)", offline: "var(--surface3)" };
  return (
    <div style={{ position: "relative", flexShrink: 0 }}>
      <div style={{
        width: size, height: size, borderRadius: "50%",
        background: `linear-gradient(135deg, var(--indigo-l), var(--teal))`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: size * 0.34, fontWeight: 700, color: "#fff", flexShrink: 0,
      }}>
        {member?.initials || "??"}
      </div>
      {showStatus && (
        <span style={{
          position: "absolute", bottom: 0, right: 0,
          width: size * 0.28, height: size * 0.28,
          borderRadius: "50%",
          background: statusColors[member?.status] || "var(--surface3)",
          border: "2px solid var(--surface)",
        }} />
      )}
    </div>
  );
}

function AvatarStack({ memberCount, size = 26 }) {
  const count = parseInt(memberCount) || 0;
  const displayCount = Math.max(0, Math.min(count, 3));
  const extra = Math.max(0, count - displayCount);
  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      {[...Array(displayCount)].map((_, i) => (
        <div key={i} style={{
          marginLeft: i === 0 ? 0 : -8, zIndex: displayCount - i,
          width: size, height: size, borderRadius: "50%",
          background: `linear-gradient(135deg, var(--indigo-l), var(--teal))`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: size * 0.34, fontWeight: 700, color: "#fff",
          border: "2px solid var(--surface)", flexShrink: 0
        }}>
          ?
        </div>
      ))}
      {extra > 0 && (
        <div style={{
          marginLeft: -8, zIndex: 0,
          width: size, height: size, borderRadius: "50%",
          background: "var(--surface3)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: size * 0.3, fontWeight: 700, color: "var(--text3)",
          border: "2px solid var(--surface)", flexShrink: 0
        }}>
          +{extra}
        </div>
      )}
    </div>
  );
}

// ─── GROUP CARD ───────────────────────────────────────────────────
function GroupCard({ group, onOpen, onJoin }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      className={`sg-card${hov ? " sg-card--hov" : ""}${group.pinned ? " sg-card--pinned" : ""}`}
      style={{ "--card-color": group.color, "--card-rgb": group.rgb }}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      onClick={() => onOpen(group)}>
      <div className="sg-card-glow" />
      {group.pinned && <div className="sg-pin-badge"><Pin size={9} fill="var(--amber)" />Pinned</div>}

      <div className="sg-card-header">
        <div className="sg-card-icon">{group.icon}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="sg-card-name">{group.name}</div>
          <div className="sg-card-subject" style={{ color: group.color }}>{group.subject}</div>
        </div>
        <span className={`sg-type-badge ${group.type === "private" ? "sg-type-private" : "sg-type-public"}`}>
          {group.type === "private" ? <Lock size={9} /> : <Globe size={9} />}
          {group.type}
        </span>
      </div>

      <div className="sg-card-desc">{group.description}</div>

      <div className="sg-card-tags">
        {group.tags.slice(0, 3).map(t => <span key={t} className="vl-tag">{t}</span>)}
        {group.tags.length > 3 && <span className="vl-tag">+{group.tags.length - 3}</span>}
      </div>

      <div className="sg-card-members">
        <AvatarStack memberCount={group.member_count} size={26} />
        <span className="sg-last-activity">{group.last_activity || "No activity"}</span>
      </div>

      {group.nextSession && (
        <div className="sg-next-session" style={{ borderColor: `rgba(${group.rgb},.18)`, background: `rgba(${group.rgb},.05)` }}>
          <Calendar size={11} style={{ color: group.color, flexShrink: 0 }} />
          <span style={{ color: group.color, fontWeight: 700, fontSize: 11 }}>{group.nextSession.date}</span>
          <span style={{ fontSize: 11, color: "var(--text3)" }}>{group.nextSession.topic}</span>
        </div>
      )}

      <button
        className="sg-card-cta"
        style={group.is_member
          ? { background: `rgba(${group.rgb},.1)`, color: group.color, border: `1px solid rgba(${group.rgb},.2)` }
          : { background: group.color, color: "#fff", border: "none" }}
        onClick={e => { e.stopPropagation(); group.is_member ? onOpen(group) : onJoin(group); }}>
        {group.is_member ? <><MessageSquare size={12} />Open Group</> : <><UserPlus size={12} />Join Group</>}
      </button>
    </div>
  );
}

// ─── GROUP DETAIL VIEW ────────────────────────────────────────────
function GroupDetailView({ group, onBack }) {
  const [activeChannel, setActiveChannel] = useState(group.channels[0] || null);
  const [activeTab, setActiveTab] = useState("chat"); // chat | members | sessions | resources
  const [messages, setMessages] = useState(group.messages_data || []);
  const [input, setInput] = useState("");
  const [showEmoji, setShowEmoji] = useState(null); // messageId
  const [inVoice, setInVoice] = useState(false);
  const [micOn, setMicOn] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = useCallback(() => {
    if (!input.trim()) return;
    setMessages(prev => [...prev, {
      id: `m${Date.now()}`, userId: "u0",
      text: input.trim(), time: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
      reactions: [], isMe: true,
    }]);
    setInput("");
  }, [input]);

  const addReaction = (msgId, emoji) => {
    setMessages(prev => prev.map(m => {
      if (m.id !== msgId) return m;
      const existing = m.reactions.find(r => r.emoji === emoji);
      if (existing) return { ...m, reactions: m.reactions.map(r => r.emoji === emoji ? { ...r, count: r.count + 1 } : r) };
      return { ...m, reactions: [...m.reactions, { emoji, count: 1 }] };
    }));
    setShowEmoji(null);
  };

  const members = group.memberIds.map(id => {
    if (id === "u0") return { ...MY_USER, role: group.adminIds.includes("u0") ? "admin" : "member" };
    const m = MEMBERS_POOL.find(m => m.id === id);
    if (!m) return null;
    return { ...m, role: group.adminIds.includes(id) ? "admin" : "member" };
  }).filter(Boolean);

  const onlineCount = members.filter(m => m.status === "online").length;

  return (
    <div className="sg-detail-root">
      {/* ── Header ── */}
      <div className="sg-detail-header" style={{ "--card-color": group.color, "--card-rgb": group.rgb }}>
        <div className="sg-dh-bg" />
        <div className="sg-dh-inner">
          <button className="san-back-btn" onClick={onBack} style={{ marginRight: 12 }}>
            <ChevronLeft size={13} /> Groups
          </button>
          <div className="sg-dh-icon">{group.icon}</div>
          <div className="sg-dh-info">
            <div className="sg-dh-name">{group.name}</div>
            <div className="sg-dh-meta">
              <span style={{ color: group.color }}>{group.subject}</span>
              <span className="sg-dot" />
              <span>{members.length} members</span>
              <span className="sg-dot" />
              <span style={{ color: "var(--teal)" }}>{onlineCount} online</span>
              <span className="sg-dot" />
              <span className={`sg-type-badge ${group.type === "private" ? "sg-type-private" : "sg-type-public"}`} style={{ display: "inline-flex" }}>
                {group.type === "private" ? <Lock size={8} /> : <Globe size={8} />}{group.type}
              </span>
            </div>
          </div>
          <div className="sg-dh-actions">
            {group.nextSession && (
              <div className="sg-dh-session" style={{ borderColor: `rgba(${group.rgb},.2)`, background: `rgba(${group.rgb},.07)` }}>
                <Calendar size={11} style={{ color: group.color }} />
                <span style={{ color: group.color, fontWeight: 700, fontSize: 11 }}>Next: {group.nextSession.date} · {group.nextSession.time}</span>
              </div>
            )}
            <button className="sg-icon-btn" title="Notifications"><Bell size={14} /></button>
            <button className="sg-icon-btn" title="Share"><Share2 size={14} /></button>
            <button className="sg-icon-btn" title="Settings"><Settings size={14} /></button>
          </div>
        </div>
        {/* Tabs */}
        <div className="sg-dh-tabs">
          {[
            { key: "chat", icon: <MessageSquare size={12} />, label: "Chat" },
            { key: "members", icon: <Users size={12} />, label: `Members (${members.length})` },
            { key: "sessions", icon: <Calendar size={12} />, label: "Sessions" },
            { key: "resources", icon: <FileText size={12} />, label: `Resources (${group.resources})` },
          ].map(t => (
            <button key={t.key}
              className={`sg-dh-tab${activeTab === t.key ? " active" : ""}`}
              style={activeTab === t.key ? { color: group.color, borderColor: group.color } : {}}
              onClick={() => setActiveTab(t.key)}>
              {t.icon}{t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── CHAT TAB ── */}
      {activeTab === "chat" && (
        <div className="sg-chat-layout">
          {/* Channel list */}
          <div className="sg-channels">
            <div className="sg-ch-title">Channels</div>
            {group.channels.map(ch => (
              <button key={ch.id}
                className={`sg-ch-item${activeChannel?.id === ch.id ? " active" : ""}`}
                style={activeChannel?.id === ch.id ? { background: `rgba(${group.rgb},.1)`, color: group.color } : {}}
                onClick={() => setActiveChannel(ch)}>
                {ch.type === "voice" ? <Volume2 size={13} /> : <Hash size={13} />}
                <span className="sg-ch-name">{ch.name}</span>
                {ch.unread > 0 && <span className="sg-ch-unread">{ch.unread}</span>}
              </button>
            ))}
            {inVoice && (
              <div className="sg-voice-active" style={{ borderColor: `rgba(${group.rgb},.25)`, background: `rgba(${group.rgb},.07)` }}>
                <Radio size={12} style={{ color: "var(--teal)" }} />
                <span style={{ color: "var(--teal)", fontWeight: 600, fontSize: 11 }}>Voice connected</span>
                <button className="sg-voice-leave" onClick={() => setInVoice(false)}><PhoneOff size={11} /></button>
              </div>
            )}
          </div>

          {/* Messages area */}
          <div className="sg-messages-area">
            {/* Channel header */}
            <div className="sg-msg-header">
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {activeChannel?.type === "voice" ? <Volume2 size={14} style={{ color: "var(--teal)" }} /> : <Hash size={14} style={{ color: "var(--text3)" }} />}
                <span style={{ fontWeight: 700, color: "var(--text1)", fontSize: 14 }}>{activeChannel?.name || "general"}</span>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                {activeChannel?.type === "voice" ? (
                  <button className="sg-voice-join-btn" style={{ background: "var(--teal)" }}
                    onClick={() => setInVoice(v => !v)}>
                    {inVoice ? <><PhoneOff size={12} />Leave</> : <><Phone size={12} />Join Voice</>}
                  </button>
                ) : (
                  <>
                    <button className="sg-icon-btn"><Search size={13} /></button>
                    <button className="sg-icon-btn"><Pin size={13} /></button>
                    <button className="sg-icon-btn"><Users size={13} /></button>
                  </>
                )}
              </div>
            </div>

            {activeChannel?.type === "voice" ? (
              <div className="sg-voice-room">
                <div className="sg-vr-orb" style={{ background: `linear-gradient(135deg,rgba(${group.rgb},.15),rgba(${group.rgb},.05))` }}>
                  <Volume2 size={36} style={{ color: group.color, opacity: .6 }} />
                </div>
                <div style={{ fontFamily: "'Fraunces',serif", fontSize: 20, color: "var(--text1)", marginBottom: 6 }}>
                  {inVoice ? "You're in the voice channel" : "Voice Study Room"}
                </div>
                <div style={{ fontSize: 12, color: "var(--text3)", marginBottom: 24 }}>
                  {inVoice ? "3 members connected · Study session in progress" : "Join to study together with voice chat"}
                </div>
                {inVoice && (
                  <div className="sg-voice-members">
                    {members.filter(m => m.status === "online").slice(0, 4).map(m => (
                      <div key={m.id} className="sg-vm-item">
                        <MemberAvatar member={m} size={44} />
                        <div className="sg-vm-wave"><span /><span /><span /></div>
                        <span style={{ fontSize: 11, color: "var(--text3)", marginTop: 4 }}>{m.name.split(" ")[0]}</span>
                      </div>
                    ))}
                  </div>
                )}
                <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
                  {inVoice && (
                    <button className="sg-vr-btn" style={{ background: micOn ? "rgba(20,184,166,.12)" : "rgba(244,63,94,.12)", color: micOn ? "var(--teal)" : "var(--rose)" }}
                      onClick={() => setMicOn(v => !v)}>
                      {micOn ? <Mic size={14} /> : <VolumeX size={14} />}
                      {micOn ? "Mute" : "Unmute"}
                    </button>
                  )}
                  <button className="sg-vr-btn" style={inVoice ? { background: "rgba(244,63,94,.12)", color: "var(--rose)" } : { background: group.color, color: "#fff" }}
                    onClick={() => setInVoice(v => !v)}>
                    {inVoice ? <><PhoneOff size={14} />Leave</> : <><Phone size={14} />Join Voice</>}
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="sg-messages-list">
                  {messages.map((msg, i) => {
                    const sender = msg.userId === "u0" ? MY_USER : MEMBERS_POOL.find(m => m.id === msg.userId);
                    const isMe = msg.isMe || msg.userId === "u0";
                    const showAvatar = i === 0 || messages[i - 1]?.userId !== msg.userId;
                    return (
                      <div key={msg.id}
                        className={`sg-msg${isMe ? " sg-msg--me" : ""}`}
                        onMouseEnter={() => { }}
                        style={{ marginTop: showAvatar && i > 0 ? 12 : 2 }}>
                        {!isMe && showAvatar && (
                          <MemberAvatar member={sender || { initials: "??" }} size={34} showStatus={false} />
                        )}
                        {!isMe && !showAvatar && <div style={{ width: 34, flexShrink: 0 }} />}
                        <div className="sg-msg-content">
                          {showAvatar && !isMe && (
                            <div className="sg-msg-sender">
                              {sender?.name || "Unknown"}
                              {sender?.role === "admin" && <Crown size={9} style={{ color: "var(--amber)" }} />}
                              <span className="sg-msg-time">{msg.time}</span>
                            </div>
                          )}
                          <div className={`sg-msg-bubble${isMe ? " sg-msg-bubble--me" : ""}`}
                            style={isMe ? { background: group.color } : {}}
                            onDoubleClick={() => setShowEmoji(showEmoji === msg.id ? null : msg.id)}>
                            {msg.text}
                          </div>
                          {msg.reactions.length > 0 && (
                            <div className="sg-reactions">
                              {msg.reactions.map(r => (
                                <button key={r.emoji} className="sg-reaction-btn"
                                  onClick={() => addReaction(msg.id, r.emoji)}>
                                  {r.emoji}<span>{r.count}</span>
                                </button>
                              ))}
                            </div>
                          )}
                          {showEmoji === msg.id && (
                            <div className="sg-emoji-picker">
                              {QUICK_EMOJIS.map(e => (
                                <button key={e} className="sg-emoji-btn" onClick={() => addReaction(msg.id, e)}>{e}</button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="sg-input-area" style={{ borderTopColor: `rgba(${group.rgb},.12)` }}>
                  <div className="sg-input-wrap">
                    <button className="sg-input-action"><Paperclip size={15} /></button>
                    <input
                      className="sg-input"
                      placeholder={`Message #${activeChannel?.name || "general"}`}
                      value={input}
                      onChange={e => setInput(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage()} />
                    <div style={{ display: "flex", gap: 5, flexShrink: 0 }}>
                      <button className="sg-input-action"><Smile size={15} /></button>
                      <button className="sg-input-action"><Mic size={15} /></button>
                      <button className="sg-send-btn" style={{ background: input.trim() ? group.color : "var(--surface3)", color: input.trim() ? "#fff" : "var(--text3)" }}
                        onClick={sendMessage}>
                        <Send size={14} />
                      </button>
                    </div>
                  </div>
                  <div className="sg-input-hint">
                    <Bot size={11} style={{ color: "var(--indigo-ll)" }} />
                    <span>Lucyna AI is watching — mention <strong>@lucyna</strong> for instant answers</span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Online members sidebar */}
          <div className="sg-online-sidebar">
            <div className="sg-ols-title">Online — {onlineCount}</div>
            {members.filter(m => m.status === "online").map(m => (
              <div key={m.id} className="sg-ols-member">
                <MemberAvatar member={m} size={30} showStatus />
                <div>
                  <div className="sg-ols-name">{m.name} {m.id === "u0" && "(you)"}</div>
                  {m.role === "admin" && <div className="sg-ols-role"><Crown size={9} />Admin</div>}
                </div>
              </div>
            ))}
            {members.filter(m => m.status === "away").length > 0 && (
              <>
                <div className="sg-ols-title" style={{ marginTop: 14 }}>Away</div>
                {members.filter(m => m.status === "away").map(m => (
                  <div key={m.id} className="sg-ols-member" style={{ opacity: .6 }}>
                    <MemberAvatar member={m} size={30} showStatus />
                    <div className="sg-ols-name">{m.name}</div>
                  </div>
                ))}
              </>
            )}
            {members.filter(m => m.status === "offline").length > 0 && (
              <>
                <div className="sg-ols-title" style={{ marginTop: 14 }}>Offline</div>
                {members.filter(m => m.status === "offline").map(m => (
                  <div key={m.id} className="sg-ols-member" style={{ opacity: .4 }}>
                    <MemberAvatar member={m} size={30} showStatus />
                    <div className="sg-ols-name">{m.name}</div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      )}

      {/* ── MEMBERS TAB ── */}
      {activeTab === "members" && (
        <div className="sg-members-grid">
          {members.map(m => (
            <div key={m.id} className="sg-member-card">
              <div className="sg-mc-top">
                <MemberAvatar member={m} size={48} showStatus />
                {m.role === "admin" && (
                  <span className="sg-admin-crown"><Crown size={11} style={{ color: "var(--amber)" }} /></span>
                )}
              </div>
              <div className="sg-mc-name">{m.name} {m.id === "u0" && <span style={{ fontSize: 10, color: "var(--text3)" }}>(you)</span>}</div>
              <div className="sg-mc-role" style={m.role === "admin" ? { color: "var(--amber)" } : {}}>{m.role}</div>
              <div className="sg-mc-course">{m.course || "CSE"} · 5th Sem</div>
              <div className={`sg-mc-status sg-mc-status--${m.status}`}>{m.status}</div>
              {m.id !== "u0" && (
                <button className="sg-mc-msg-btn" style={{ borderColor: `rgba(${group.rgb},.2)`, color: group.color }}>
                  <MessageSquare size={11} />Message
                </button>
              )}
            </div>
          ))}
          <div className="sg-member-card sg-mc-invite">
            <UserPlus size={28} style={{ color: "var(--text3)", marginBottom: 10 }} />
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text2)", marginBottom: 4 }}>Invite Members</div>
            <div style={{ fontSize: 11, color: "var(--text3)", marginBottom: 14 }}>Share the invite link</div>
            <button className="sg-mc-msg-btn" style={{ borderColor: `rgba(${group.rgb},.25)`, color: group.color }}>
              <Link2 size={11} />Copy Link
            </button>
          </div>
        </div>
      )}

      {/* ── SESSIONS TAB ── */}
      {activeTab === "sessions" && (
        <div className="sg-sessions-content">
          <div className="sg-sessions-header">
            <div style={{ fontSize: 13, color: "var(--text3)" }}>Plan and track group study sessions</div>
            <button className="sg-new-session-btn" style={{ background: group.color }}>
              <Plus size={13} />Schedule Session
            </button>
          </div>
          <div className="sg-sessions-list">
            {group.sessions.length > 0 ? group.sessions.map(s => (
              <div key={s.id} className={`sg-session-item${s.status === "upcoming" ? " sg-session--upcoming" : ""}`}
                style={s.status === "upcoming" ? { borderColor: `rgba(${group.rgb},.22)`, background: `rgba(${group.rgb},.04)` } : {}}>
                <div className={`sg-session-status-dot`}
                  style={{ background: s.status === "upcoming" ? "var(--teal)" : "var(--surface3)" }} />
                <div className="sg-session-main">
                  <div className="sg-session-topic">{s.topic}</div>
                  <div className="sg-session-meta">
                    <span><Calendar size={11} />{s.date} · {s.time}</span>
                    <span><Clock size={11} />{s.duration} min</span>
                    {s.attendees > 0 && <span><Users size={11} />{s.attendees} attended</span>}
                  </div>
                </div>
                <div className="sg-session-right">
                  <span className={`sg-session-badge ${s.status === "upcoming" ? "sg-sb-upcoming" : "sg-sb-done"}`}>
                    {s.status === "upcoming" ? <><Calendar size={10} />Upcoming</> : <><CheckCircle2 size={10} />Done</>}
                  </span>
                  {s.status === "upcoming" && (
                    <button className="sg-join-btn" style={{ background: group.color }}>
                      <Video size={11} />Join
                    </button>
                  )}
                </div>
              </div>
            )) : (
              <div className="mc-empty">
                <Calendar size={28} style={{ color: "var(--text3)" }} />
                <p>No sessions scheduled yet.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── RESOURCES TAB ── */}
      {activeTab === "resources" && (
        <div className="sg-resources-content">
          <div className="sg-sessions-header">
            <div style={{ fontSize: 13, color: "var(--text3)" }}>{group.resources} shared files & links</div>
            <button className="sg-new-session-btn" style={{ background: group.color }}>
              <Plus size={13} />Upload Resource
            </button>
          </div>
          <div className="sg-resources-grid">
            {[
              { name: "OS Scheduling Notes.pdf", type: "pdf", size: "2.4 MB", uploader: "Priya S.", date: "Mar 4" },
              { name: "Memory Management Slides.pptx", type: "pptx", size: "5.1 MB", uploader: "Arjun R.", date: "Mar 3" },
              { name: "Deadlock Practice Problems.docx", type: "docx", size: "842 KB", uploader: "Rahul M.", date: "Mar 2" },
              { name: "Round Robin Simulator", type: "link", size: null, uploader: "Sneha P.", date: "Mar 1" },
              { name: "OS Past Papers 2023-24.zip", type: "zip", size: "12 MB", uploader: "Priya S.", date: "Feb 28" },
              { name: "Gantt Chart Templates.xlsx", type: "xlsx", size: "1.2 MB", uploader: "Arjun R.", date: "Feb 27" },
            ].map((r, i) => (
              <div key={i} className="sg-resource-item">
                <div className={`sg-res-icon sg-res-${r.type}`}>
                  {r.type === "link" ? <Link2 size={16} /> : r.type === "pdf" ? <FileText size={16} /> : r.type === "zip" ? <Layers size={16} /> : <FileText size={16} />}
                </div>
                <div className="sg-res-info">
                  <div className="sg-res-name">{r.name}</div>
                  <div className="sg-res-meta">{r.uploader} · {r.date}{r.size && ` · ${r.size}`}</div>
                </div>
                <div className="sg-res-actions">
                  <button className="sg-icon-btn"><Eye size={13} /></button>
                  {r.type !== "link" && <button className="sg-icon-btn"><Download size={13} /></button>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── STATS STRIP ─────────────────────────────────────────────────
function StatsStrip({ groups, joinedIds }) {
  const myGroups = groups.filter(g => g.isMember || joinedIds.has(g.id)).length;
  const totalMsgs = groups.filter(g => g.isMember || joinedIds.has(g.id)).reduce((s, g) => s + (g.messages||0), 0);
  const bestStreak = Math.max(...groups.filter(g => g.isMember || joinedIds.has(g.id)).map(g => g.streak||0), 0);
  const sessions = groups.filter(g => g.isMember || joinedIds.has(g.id)).reduce((s, g) => s + (g.sessions||[]).filter(ss => ss.status === "upcoming").length, 0);
  return (
    <div className="san-kpi-grid" style={{ marginBottom: 20 }}>
      {[
        { cls: "sc-indigo", val: myGroups, lbl: "My Groups", sub: "Active this week", Icon: Users },
        { cls: "sc-teal", val: totalMsgs, lbl: "Total Messages", sub: "Across all groups", Icon: MessageSquare },
        { cls: "sc-amber", val: `${bestStreak}d`, lbl: "Best Streak", sub: "Keep it up!", Icon: Flame },
        { cls: "sc-violet", val: sessions, lbl: "Upcoming Sessions", sub: "Scheduled", Icon: Calendar },
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

// ─── CREATE GROUP MODAL ───────────────────────────────────────────
function CreateGroupModal({ onClose }) {
  const [form, setForm] = useState({ name: "", subject: "", type: "public", desc: "" });
  const [step, setStep] = useState(1);
  return (
    <div className="as-modal-overlay" onClick={onClose}>
      <div className="as-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 520 }}>
        <div className="as-modal-header" style={{ "--card-color": "var(--indigo-l)", "--card-rgb": "91,78,248" }}>
          <div className="as-modal-header-bg" />
          <div className="as-modal-header-inner">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: "var(--indigo-ll)", textTransform: "uppercase", letterSpacing: ".07em" }}>
                Step {step} of 2
              </span>
              <button className="as-modal-close" onClick={onClose}><X size={15} /></button>
            </div>
            <div className="as-modal-title">Create a Study Group</div>
          </div>
        </div>
        <div className="as-modal-body">
          {step === 1 ? (
            <>
              <div className="as-modal-section">
                <div className="as-modal-sec-label">Group Name</div>
                <input className="sg-form-input" placeholder="e.g. OS Mastery Squad"
                  value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="as-modal-section">
                <div className="as-modal-sec-label">Subject / Topic</div>
                <input className="sg-form-input" placeholder="e.g. Operating Systems"
                  value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} />
              </div>
              <div className="as-modal-section">
                <div className="as-modal-sec-label">Privacy</div>
                <div className="sg-radio-group">
                  {[{ v: "public", label: "Public", sub: "Anyone can find and join" }, { v: "private", label: "Private", sub: "Invite only" }].map(o => (
                    <button key={o.v}
                      className={`sg-radio-item${form.type === o.v ? " active" : ""}`}
                      style={form.type === o.v ? { borderColor: "var(--indigo-l)", background: "rgba(91,78,248,.07)" } : {}}
                      onClick={() => setForm(f => ({ ...f, type: o.v }))}>
                      {o.v === "public" ? <Globe size={16} style={{ color: "var(--teal)" }} /> : <Lock size={16} style={{ color: "var(--indigo-ll)" }} />}
                      <div><div style={{ fontWeight: 700, fontSize: 13, color: "var(--text1)" }}>{o.label}</div>
                        <div style={{ fontSize: 11, color: "var(--text3)" }}>{o.sub}</div></div>
                      {form.type === o.v && <CheckCircle2 size={16} style={{ marginLeft: "auto", color: "var(--indigo-ll)" }} />}
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="as-modal-section">
                <div className="as-modal-sec-label">Description</div>
                <textarea className="as-note-textarea" rows={4}
                  placeholder="What will your group focus on? Goals, schedule, expectations…"
                  value={form.desc} onChange={e => setForm(f => ({ ...f, desc: e.target.value }))} />
              </div>
              <div className="as-ai-hint">
                <Bot size={14} style={{ color: "var(--indigo-ll)", flexShrink: 0 }} />
                <div>
                  <div className="as-ai-hint-title">Lucyna Tip</div>
                  <div className="as-ai-hint-text">Groups with a clear focus and weekly sessions have 3× higher engagement. Set a recurring session time!</div>
                </div>
              </div>
            </>
          )}
        </div>
        <div className="as-modal-footer">
          {step === 1 ? <>
            <button className="as-modal-btn as-modal-btn--ghost" onClick={onClose}>Cancel</button>
            <button className="as-modal-btn as-modal-btn--primary" style={{ background: "var(--indigo-l)", opacity: !form.name || !form.subject ? .5 : 1 }}
              disabled={!form.name || !form.subject} onClick={() => setStep(2)}>
              Next <ChevronRight size={13} />
            </button>
          </> : <>
            <button className="as-modal-btn as-modal-btn--ghost" onClick={() => setStep(1)}><ChevronLeft size={13} />Back</button>
            <button className="as-modal-btn as-modal-btn--primary" style={{ background: "var(--indigo-l)" }} onClick={onClose}>
              <Plus size={13} />Create Group
            </button>
          </>}
        </div>
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────
export default function StudentStudyGroups({ onBack }) {
  const [view, setView] = useState("list"); // list | detail
  const [activeGroup, setActiveGroup] = useState(null);
  const [filterTab, setFilterTab] = useState("My Groups");
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [showCreate, setShowCreate] = useState(false);
  const [joinedIds, setJoinedIds] = useState(new Set());
  const [groupsState, setGroupsState] = useState([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const data = await api.get("/student/study-groups");
        const mapped = (data || []).map((g, i) => {
          const colors = ["var(--indigo-l)", "var(--teal)", "var(--amber)", "var(--violet)", "var(--rose)"];
          const rgbs = ["91,78,248", "20,184,166", "245,158,11", "139,92,246", "244,63,94"];
          const cIdx = i % colors.length;
          return {
            id: String(g.id),
            name: g.name,
            subject: g.subject || g.name,
            subjectShort: (g.subject || g.name).split(" ")[0],
            color: colors[cIdx],
            rgb: rgbs[cIdx],
            icon: "📚",
            type: g.is_public ? "public" : "private",
            memberIds: Array.from({ length: g.member_count || 0 }, (_, k) => "u" + k),
            adminIds: ["u0"],
            description: g.description || "",
            tags: g.tags || [],
            nextSession: g.next_session ? { date: g.next_session.split("T")[0], time: "Time TBD", topic: "Study Session", platform: "Online" } : null,
            streak: g.streak || 0,
            resources: 0,
            messages: 0,
            lastActivity: "Recently",
            pinned: false,
            isMember: g.is_member,        // Use API field
            channels: [{ id: "c1", name: "general", type: "text", unread: 0 }],
            sessions: [],
            messages_data: []
          };
        });
        setGroupsState(mapped);
        // Only mark groups the student is actually a member of
        setJoinedIds(new Set(mapped.filter(m => m.isMember).map(m => m.id)));
      } catch (err) {
        console.error("Failed to fetch study groups:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchGroups();
  }, []);

  const FILTER_TABS = ["My Groups", "All Groups", "Discover"];

  const filtered = groupsState.filter(g => {
    const byTab =
      filterTab === "My Groups" ? (g.isMember || joinedIds.has(g.id)) :
        filterTab === "Discover" ? (!g.isMember && !joinedIds.has(g.id)) :
          true;
    const bySearch = !search ||
      g.name.toLowerCase().includes(search.toLowerCase()) ||
      g.subject.toLowerCase().includes(search.toLowerCase()) ||
      (g.tags||[]).some(t => t.toLowerCase().includes(search.toLowerCase()));
    return byTab && bySearch;
  });

  const handleOpen = (g) => { setActiveGroup(g); setView("detail"); };
  const handleBack = () => { setActiveGroup(null); setView("list"); };
  const handleJoin = (g) => { setJoinedIds(s => { const n = new Set(s); n.add(g.id); return n; }); handleOpen(g); };

  if (view === "detail" && activeGroup) {
    return (
      <div className="sg-root">
        <GroupDetailView group={activeGroup} onBack={handleBack} />
      </div>
    );
  }

  return (
    <>
      {showCreate && <CreateGroupModal onClose={() => setShowCreate(false)} />}

      <div className="sg-root">
        {/* ── Page Header ── */}
        <div className="san-page-hd">
          <div className="san-back-row">
            <button className="san-back-btn" onClick={onBack}><ChevronLeft size={13} /> Dashboard</button>
            <div className="san-breadcrumb">
              <span>Dashboard</span>
              <ChevronRight size={11} style={{ color: "var(--text3)" }} />
              <span className="san-bc-active">Study Groups</span>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginTop: 10 }}>
            <div>
              <div className="greet-tag" style={{ marginBottom: 8 }}>
                <div className="greet-pip" />
                <span className="greet-pip-txt">Semester 5 · {groupsState.filter(g => g.isMember || joinedIds.has(g.id)).length} Groups Joined · {groupsState.length} Total</span>
              </div>
              <p className="greet-sub">Learn faster together. Join subject-specific squads to share resources and prep for exams.</p>
            </div>
            <button className="sg-create-btn" onClick={() => setShowCreate(true)}>
              <Plus size={14} />Create Group
            </button>
          </div>
        </div>

        <StatsStrip groups={groupsState} joinedIds={joinedIds} />

        {/* ── Toolbar ── */}
        <div className="mc-toolbar" style={{ marginBottom: 16 }}>
          <div className="mc-filter-tabs">
            {FILTER_TABS.map(t => (
              <button key={t} className={`mc-filter-tab${filterTab === t ? " active" : ""}`}
                onClick={() => setFilterTab(t)}>
                {t}
                {t === "My Groups" && <span className="as-tab-badge">{groupsState.filter(g => g.isMember || joinedIds.has(g.id)).length}</span>}
              </button>
            ))}
          </div>
          <div className="mc-toolbar-right">
            <div className="mc-search-wrap">
              <Search size={13} style={{ color: "var(--text3)", flexShrink: 0 }} />
              <input className="mc-search" placeholder="Search groups, subjects, tags…"
                value={search} onChange={e => setSearch(e.target.value)} />
              {search && <button className="mc-search-clear" onClick={() => setSearch("")}><X size={12} /></button>}
            </div>
            <div className="mc-view-toggle">
              <button className={`mc-view-btn${viewMode === "grid" ? " active" : ""}`} onClick={() => setViewMode("grid")}><LayoutGrid size={13} /></button>
              <button className={`mc-view-btn${viewMode === "list" ? " active" : ""}`} onClick={() => setViewMode("list")}><List size={13} /></button>
            </div>
          </div>
        </div>

        {/* ── Pinned groups ── */}
        {filterTab === "My Groups" && groupsState.some(g => g.pinned && (g.isMember || joinedIds.has(g.id))) && (
          <div style={{ marginBottom: 20 }}>
            <div className="sg-section-label"><Pin size={11} style={{ color: "var(--amber)" }} />Pinned Groups</div>
            <div className="sg-grid">
              {groupsState.filter(g => g.pinned && (g.isMember || joinedIds.has(g.id))).map(g => (
                <GroupCard key={g.id} group={{ ...g, isMember: true }} onOpen={handleOpen} onJoin={handleJoin} />
              ))}
            </div>
          </div>
        )}

        {/* ── Main grid / list ── */}
        {filterTab === "My Groups" && <div className="sg-section-label"><Users size={11} />All My Groups</div>}
        {filterTab === "Discover" && <div className="sg-section-label"><Globe size={11} />Discover Groups</div>}

        {filtered.length === 0 ? (
          <div className="mc-empty">
            <Users size={32} style={{ color: "var(--text3)" }} />
            <p>{filterTab === "Discover" ? "No new groups to discover." : "No groups match your search."}</p>
          </div>
        ) : (
          <div className={viewMode === "grid" ? "sg-grid" : "sg-list-view"}>
            {filtered.map(g => (
              <GroupCard
                key={g.id}
                group={{ ...g, isMember: g.isMember || joinedIds.has(g.id) }}
                onOpen={handleOpen}
                onJoin={handleJoin} />
            ))}
          </div>
        )}

        {/* Discover callout */}
        {filterTab === "My Groups" && (
          <div className="sg-discover-cta">
            <Globe size={18} style={{ color: "var(--indigo-ll)" }} />
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text1)", marginBottom: 3 }}>Discover more groups</div>
              <div style={{ fontSize: 11.5, color: "var(--text3)" }}>
                {groupsState.filter(g => !g.isMember && !joinedIds.has(g.id)).length} groups available to join
              </div>
            </div>
            <button className="sg-discover-btn" onClick={() => setFilterTab("Discover")}>
              Explore <ArrowRight size={12} />
            </button>
          </div>
        )}
      </div>
    </>
  );
}