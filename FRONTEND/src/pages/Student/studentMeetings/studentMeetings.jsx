import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import api from "../../../utils/api";
import "./studentMeetings.css";

// ─── ICONS ──────────────────────────────────────────────────────────
const IcoChevL  = (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>;
const IcoVideo  = (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>;
const IcoVideoOff=(p)=> <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2m5.66 0H14a2 2 0 0 1 2 2v3.34l1 1L23 7v10"/><line x1="1" y1="1" x2="23" y2="23"/></svg>;
const IcoMic    = (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>;
const IcoMicOff = (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="1" y1="1" x2="23" y2="23"/><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"/><path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>;
const IcoPhone  = (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.72 12 19.79 19.79 0 0 1 1.61 3.41 2 2 0 0 1 3.6 1.21h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9c1.07 1.88 2.58 3.39 4.46 4.46l1.85-1.85a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 13.92z"/></svg>;
const IcoUsers  = (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const IcoClock  = (p) => <svg {...p} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;

const RemoteVideoPlayer = ({ stream }) => {
  const videoRef = useRef(null);
  useEffect(() => {
    if (videoRef.current && stream && videoRef.current.srcObject !== stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);
  return (
    <video 
      ref={videoRef} 
      autoPlay 
      playsInline 
      style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", top: 0, left: 0 }} 
    />
  );
};

// ─── STUDENT MEETING ROOM ───────────────────────────────────────────
function StudentMeetingRoom({ meeting, onLeave }) {
  const [micOn,  setMicOn]  = useState(true);
  const [camOn,  setCamOn]  = useState(true);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef(null);
  const localVideoRef = useRef(null);
  const peerRef = useRef(null); 
  const socketRef = useRef(null);
  const facultyIdRef = useRef(null);

  const [localStream, setLocalStream] = useState(null);
  const localStreamRef = useRef(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [sockStatus, setSockStatus] = useState("Connecting...");
  const [webrtcStatus, setWebrtcStatus] = useState("Waiting...");
  const iceCandidateQueue = useRef([]); 

  const rtcConfig = {
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
  };

  useEffect(() => {
    timerRef.current = setInterval(() => setElapsed(s => s+1), 1000);

    const init = async () => {
        let stream = null;
        try {
           stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
           setLocalStream(stream);
           localStreamRef.current = stream;
        } catch (e) {
           console.error("Camera access denied:", e);
        }

        const backendUrl = "http://localhost:8000";
        socketRef.current = io(backendUrl, { transports: ["websocket"] });
        const s = socketRef.current;

        s.on("connect", () => {
          setSockStatus("Connected");
          // Get user name from auth or local storage
          const user = JSON.parse(localStorage.getItem('user') || '{}');
          const studentName = user.name || user.email || 'Student';
          s.emit("join_room", { room_code: meeting.room_code, role: "student", name: studentName });
        });
        
        s.on("disconnect", () => {
             setSockStatus("Disconnected");
             if (localStreamRef.current) {
                localStreamRef.current.getTracks().forEach(t => t.stop());
             }
        });

        s.on("faculty_disconnected", () => {
          if (localStreamRef.current) {
             localStreamRef.current.getTracks().forEach(t => t.stop());
          }
          if (peerRef.current) peerRef.current.close();
          setRemoteStream(null);
          alert("The faculty has ended the meeting.");
          onLeave();
        });

        s.on("meeting_ended", () => {
          // Stop all media tracks immediately
          if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(t => {
              t.stop();
            });
            localStreamRef.current = null;
          }
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = null;
          }
          if (peerRef.current) {
            peerRef.current.getSenders().forEach(s => { if (s.track) s.track.stop(); });
            peerRef.current.close();
          }
          setRemoteStream(null);
          setLocalStream(null);
          setJoined(false);
          alert("Meeting ended by host.");
          onLeave();
        });

        s.on("signal", async (data) => {
          const { from, signal } = data;
          facultyIdRef.current = from;

          try {
            if (signal.type === "offer") {
              console.log("[Student] Received offer from faculty");
              // If we already have a connection, close old one to accept new (simpler for now)
              if (peerRef.current) {
                peerRef.current.close();
              }
              await handleOffer(from, signal, stream);
            } else if (signal.type === "answer") {
              console.log("[Student] Received answer from faculty");
              // Signaling Guard: Only set if not already stable
              if (peerRef.current && peerRef.current.signalingState !== "stable") {
                 await peerRef.current.setRemoteDescription(new RTCSessionDescription(signal));
              }
            } else if (signal.candidate) {
              const candidate = new RTCIceCandidate(signal);
              if (peerRef.current && peerRef.current.remoteDescription && peerRef.current.remoteDescription.type) {
                  await peerRef.current.addIceCandidate(candidate);
              } else {
                  iceCandidateQueue.current.push(candidate);
              }
            }
          } catch (err) {
             console.error("[Student] Error processing signal:", err);
          }
        });
    };

    init();

    return () => {
      clearInterval(timerRef.current);
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(t => t.stop());
        localStreamRef.current = null;
        setLocalStream(null);
      }
      if (peerRef.current) {
        peerRef.current.getSenders().forEach(s => { if (s.track) s.track.stop(); });
        peerRef.current.close();
      }
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, []);

  const handleOffer = async (facultyId, offer, stream) => {
    const peer = new RTCPeerConnection(rtcConfig);
    peerRef.current = peer;
    
    peer.onconnectionstatechange = () => setWebrtcStatus(peer.connectionState);
    peer.oniceconnectionstatechange = () => setWebrtcStatus("ICE: " + peer.iceConnectionState);

    const currentStream = stream || localStreamRef.current;
    if (currentStream) {
      currentStream.getTracks().forEach((track) => {
        peer.addTrack(track, currentStream);
      });
    }

    peer.ontrack = (event) => {
      console.log("[Student] Received track from faculty");
      setRemoteStream(event.streams[0]);
    };

    peer.onicecandidate = (event) => {
      if (event.candidate) {
        socketRef.current.emit("signal", {
          room_code: meeting.room_code,
          to: facultyId,
          signal: event.candidate
        });
      }
    };

    await peer.setRemoteDescription(new RTCSessionDescription(offer));
    
    // Process buffered candidates 
    for (const candidate of iceCandidateQueue.current) {
        await peer.addIceCandidate(candidate);
    }
    iceCandidateQueue.current = [];

    const answer = await peer.createAnswer();
    await peer.setLocalDescription(answer);

    socketRef.current.emit("signal", {
      room_code: meeting.room_code,
      to: facultyId,
      signal: peer.localDescription
    });
  };

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  const toggleCam = () => {
    if (localStream) {
      const videoTracks = localStream.getVideoTracks();
      videoTracks.forEach(t => t.enabled = !camOn);
      setCamOn(!camOn);
    }
  };

  const toggleMic = () => {
    if (localStream) {
      const audioTracks = localStream.getAudioTracks();
      audioTracks.forEach(t => t.enabled = !micOn);
      setMicOn(!micOn);
    }
  };

  const handleLeave = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(t => t.stop());
    }
    if (peerRef.current) peerRef.current.close();
    socketRef.current.disconnect();
    onLeave();
  };

  const fmtTime = (s) => {
    const h = Math.floor(s/3600), m = Math.floor((s%3600)/60), ss = s%60;
    return h > 0
      ? `${h}:${String(m).padStart(2,"0")}:${String(ss).padStart(2,"0")}`
      : `${String(m).padStart(2,"0")}:${String(ss).padStart(2,"0")}`;
  };

  return (
    <div className="mtg-room">
      {/* ─── HEADER BAR ─────────────────────────────────────────────── */}
      <div className="mtg-room-bar">
        <div className="mtg-room-info">
          <div className="mtg-live-dot" />
          <span className="mtg-course-name">{meeting.course_name} (Student)</span>
          <span className="mtg-sep">·</span>
          <span className="mtg-timer">{fmtTime(elapsed)}</span>
        </div>
        <div className="mtg-room-code-block">
          <span className="mtg-room-code-label">Host</span>
          <span className="mtg-room-code">{meeting.faculty_name}</span>
        </div>
      </div>

      {/* ─── MAIN STAGE ─────────────────────────────────────────────── */}
      <div className="mtg-stage">
        {/* Main Area: Faculty Video */}
        <div className="mtg-faculty-tile" style={{ position: "relative", overflow: "hidden", background: "var(--surface2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
           {remoteStream ? (
             <RemoteVideoPlayer stream={remoteStream} />
           ) : (
             <div className="mtg-tile-avatar" style={{ 
               width: 120, height: 120, fontSize: 40,
               display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%",
               background: "linear-gradient(135deg, var(--indigo), var(--violet))", color: "#fff"
             }}>
                {meeting.faculty_name?.split(" ").map(x => x[0]).join("").slice(0,2)}
             </div>
           )}
           
           <div className="mtg-tile-meta" style={{ zIndex: 10 }}>
             <span className="mtg-tile-name">{meeting.faculty_name} (Faculty)</span>
           </div>

           {!remoteStream && (
             <div className="mtg-cam-off" style={{ zIndex: 5 }}>
                <IcoVideoOff style={{width: 48, height: 48, color: "var(--text3)", opacity: 0.5}}/>
                <span style={{ marginTop: 12 }}>Faculty camera is off</span>
             </div>
           )}
        </div>

        {/* Sidebar: You + Class Info */}
        <div className="mtg-side">
          <div style={{ background: "var(--surface3)", padding: "12px", borderRadius: "10px", fontSize: "11px", color: "var(--text2)", border: "1px solid var(--border)" }}>
            <strong>Connection Status:</strong><br/>
            Socket: {sockStatus}<br/>
            WebRTC: {webrtcStatus}
          </div>

          <div className="mtg-faculty-tile" style={{ height: "220px", position: "relative", overflow: "hidden", borderRadius: "14px", border: "1px solid var(--border)" }}>
            {camOn && localStream ? (
              <video 
                ref={localVideoRef} 
                autoPlay 
                playsInline 
                muted 
                style={{ 
                  width: "100%", height: "100%", objectFit: "cover", 
                  filter: camOn ? "none" : "blur(10px) grayscale(100%)",
                  transition: "filter 0.3s"
                }} 
              />
            ) : (
              <div className="mtg-tile-avatar" style={{ scale: "0.8" }}>ST</div>
            )}
            
            <div className="mtg-tile-meta" style={{ zIndex: 10 }}>
              <span className="mtg-tile-name">You (Student)</span>
              {!micOn && <span className="mtg-muted-badge">Muted</span>}
            </div>

            {/* Privacy Overlay */}
            {!camOn && localStream && (
              <div className="mtg-privacy-overlay" style={{
                position: "absolute", inset: 0, background: "rgba(0,0,0,0.8)",
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", zIndex: 5, color: "#fff"
              }}>
                <IcoVideoOff style={{ width: 32, height: 32, marginBottom: 8, opacity: 0.5 }} />
                <span style={{ fontSize: "11px", fontWeight: 500 }}>Microphone only</span>
              </div>
            )}
          </div>

          <div className="mtg-info-card">
            <div className="mtg-ic-title">Class Details</div>
            <div className="mtg-ic-row"><span className="mtg-ic-label">Course</span><span className="mtg-ic-val">{meeting.course_name}</span></div>
            <div className="mtg-ic-row"><span className="mtg-ic-label">Code</span><span className="mtg-ic-val">{meeting.course_code}</span></div>
            <div className="mtg-divider"/>
            <div className="mtg-student-count-card" style={{ border: "none", padding: 0 }}>
              <IcoUsers style={{width:20,height:20,color:"var(--teal)"}}/>
              <div>
                <div className="mtg-sc-num" style={{ fontSize: 22 }}>{meeting.student_count}</div>
                <div className="mtg-sc-lbl">Classmates</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── CONTROLS BAR ────────────────────────────────────────────── */}
      <div className="mtg-controls">
        <button className={`mtg-ctrl-btn ${!micOn?"mtg-ctrl-off":""}`} onClick={toggleMic}>
          {micOn ? <IcoMic style={{width:22,height:22}}/> : <IcoMicOff style={{width:22,height:22}}/>}
          <span>{micOn?"Mute":"Unmute"}</span>
        </button>

        <button className={`mtg-ctrl-btn ${!camOn?"mtg-ctrl-off":""}`} onClick={toggleCam}>
          {camOn ? <IcoVideo style={{width:22,height:22}}/> : <IcoVideoOff style={{width:22,height:22}}/>}
          <span>{camOn?"Stop Video":"Start Video"}</span>
        </button>

        <button className="mtg-ctrl-btn mtg-ctrl-end" onClick={handleLeave}>
          <IcoPhone style={{width:22,height:22,transform:"rotate(135deg)"}}/>
          <span>Leave Room</span>
        </button>
      </div>
    </div>
  );
}

export default function StudentMeetings({ onBack }) {
  const [activeMeeting, setActiveMeeting] = useState(null);
  const [loading, setLoading] = useState(true);
  const [joined, setJoined] = useState(false);

  useEffect(() => {
    const fetchMeeting = async () => {
      try {
        const res = await api.get("/student/dashboard");
        const data = res.data || res;
        if (data?.active_meeting) {
          setActiveMeeting(data.active_meeting);
          const urlParams = new URLSearchParams(window.location.search);
          if (urlParams.get("room") === data.active_meeting.room_code) setJoined(true);
        }
      } catch (err) {
        console.error("Fetch meeting error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMeeting();
  }, []);

  if (joined && activeMeeting) return <StudentMeetingRoom meeting={activeMeeting} onLeave={() => setJoined(false)} />;

  return (
    <div className="content student-meetings-page">
      <div className="breadcrumb">
        <button onClick={onBack} className="rp-back-pill" style={{ border: "none", background: "none", cursor: "pointer", color: "var(--text2)", display: "flex", alignItems: "center", gap: 6 }}>
          <IcoChevL width={16} height={16} /> Dashboard
        </button>
      </div>

      <div className="page-header">
        <h1 className="page-title">
          <span className="page-title-icon"><IcoVideo /></span>
          <span>Virtual Classroom</span>
        </h1>
        <p className="page-sub">Join your scheduled and live lecture sessions.</p>
      </div>

      {loading ? (
        <div className="loading-state"><div className="sc-spinner"></div><p>Syncing sessions...</p></div>
      ) : activeMeeting ? (
        <div className="active-meeting-card">
          <div className="amc-header">
            <div className="amc-live-badge"><span className="amc-pulse-dot"></span> LIVE</div>
            <div className="amc-time"><IcoClock /> Started at {new Date(activeMeeting.started_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
          </div>
          <div className="amc-body">
            <h2 className="amc-title">{activeMeeting.course_name}</h2>
            <p className="amc-faculty">Instructor: <strong>{activeMeeting.faculty_name}</strong></p>
            <div className="amc-actions">
              <button onClick={() => setJoined(true)} className="btn-join-meeting" style={{ border: "none", cursor: "pointer" }}>
                <IcoVideo width={18} height={18} /> Join Now
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="empty-state">
          <div className="es-icon"><IcoVideo width={48} height={48} /></div>
          <h3>Quiet Classroom</h3>
          <p>There are no live meetings for your section right now.</p>
        </div>
      )}
    </div>
  );
}
