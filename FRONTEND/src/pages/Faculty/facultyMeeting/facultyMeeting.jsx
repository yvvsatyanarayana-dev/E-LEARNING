// facultyMeeting.jsx
// Google Meet-style virtual classroom for faculty
// Inherits CSS variables from facultyDashboard.css

import { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import api from "../../../utils/api";
import "./facultyMeeting.css";

// ─── ICONS ──────────────────────────────────────────────────────────
const IcoChevL  = (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>;
const IcoVideo  = (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>;
const IcoVideoOff=(p)=> <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2m5.66 0H14a2 2 0 0 1 2 2v3.34l1 1L23 7v10"/><line x1="1" y1="1" x2="23" y2="23"/></svg>;
const IcoMic    = (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>;
const IcoMicOff = (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="1" y1="1" x2="23" y2="23"/><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"/><path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>;
const IcoPhone  = (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.72 12 19.79 19.79 0 0 1 1.61 3.41 2 2 0 0 1 3.6 1.21h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9c1.07 1.88 2.58 3.39 4.46 4.46l1.85-1.85a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 13.92z"/></svg>;
const IcoUsers  = (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const IcoCopy   = (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>;
const IcoCheck  = (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>;
const IcoCal    = (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const IcoHistory= (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.95"/></svg>;
const IcoMonitor= (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>;

// ─── COLOUR PALETTE ─────────────────────────────────────────────────
const AVATAR_COLORS = [
  "var(--indigo-l)", "var(--teal)", "var(--amber)", "var(--violet)", "var(--rose)"
];

const RemoteVideoPlayer = ({ stream }) => {
  const videoRef = useRef(null);
  
  useEffect(() => {
    if (videoRef.current && stream) {
      if (videoRef.current.srcObject !== stream) {
          videoRef.current.srcObject = stream;
      }
    }
  }, [stream]);

  return (
    <video 
      ref={videoRef} 
      autoPlay 
      playsInline 
      style={{ width: "100%", height: "100%", objectFit: "cover" }} 
    />
  );
};

// ─── LIVE MEETING ROOM ───────────────────────────────────────────────
function MeetingRoom({ meeting, onEnd }) {
  const [micOn,  setMicOn]  = useState(true);
  const [camOn,  setCamOn]  = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef(null);
  const localVideoRef = useRef(null);
  const peersRef = useRef({}); // student_id -> RTCPeerConnection
  const socketRef = useRef(null);

  const [localStream, setLocalStream] = useState(null);
  const localStreamRef = useRef(null); // Keep a ref for unmount cleanup
  const [remoteStreams, setRemoteStreams] = useState({}); // student_id -> MediaStream
  const [sockStatus, setSockStatus] = useState("Connecting...");
  const [webrtcStatus, setWebrtcStatus] = useState({}); // student_id -> status
  const iceCandidateQueue = useRef({}); // Buffer for early ICE candidates

  // STUN Servers for WebRTC
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
           setCamOn(true);
           setMicOn(true);
        } catch (e) {
           console.error("Camera access denied:", e);
        }

        // Initialize Socket
        const backendUrl = "http://localhost:8000";
        socketRef.current = io(backendUrl, { transports: ["websocket"] });
        const s = socketRef.current;

        s.on("connect", () => {
          setSockStatus("Connected");
          s.emit("join_room", { room_code: meeting.room_code, role: "faculty" });
        });
        
        s.on("disconnect", () => {
            setSockStatus("Disconnected")
            if (localStreamRef.current) {
              localStreamRef.current.getTracks().forEach(t => t.stop());
            }
        });
        s.on("connect_error", (err) => setSockStatus(`Error: ${err.message}`));

        s.on("student_joined", async ({ student_id }) => {
           console.log(`[Faculty] Student joined: ${student_id}`);
           if (!peersRef.current[student_id]) {
             createPeerConnection(student_id, stream);
           }
        });

        s.on("room_state", ({ students }) => {
          if (students && students.length > 0) {
            students.forEach(student_id => {
               if (!peersRef.current[student_id]) {
                   createPeerConnection(student_id, stream);
               }
            });
          }
        });

        s.on("student_disconnected", ({ student_id }) => {
          if (peersRef.current[student_id]) {
            peersRef.current[student_id].close();
            delete peersRef.current[student_id];
          }
          if (iceCandidateQueue.current[student_id]) {
            delete iceCandidateQueue.current[student_id];
          }
          setRemoteStreams(prev => {
            const next = { ...prev };
            delete next[student_id];
            return next;
          });
        });

        s.on("signal", async (data) => {
          const { from, signal } = data;
          const peer = peersRef.current[from];
          if (!peer) return;

          try {
            if (signal.type === "answer") {
              const peer = peersRef.current[from];
              if (peer && peer.signalingState !== "stable") {
                 console.log(`[Faculty] Processing answer from ${from}`);
                 await peer.setRemoteDescription(new RTCSessionDescription(signal));
                 // Process buffered candidates
                 if (iceCandidateQueue.current[from]) {
                    for (const candidate of iceCandidateQueue.current[from]) {
                        await peer.addIceCandidate(candidate);
                    }
                    delete iceCandidateQueue.current[from];
                 }
              } else {
                 console.warn(`[Faculty] Ignored answer from ${from} because state is ${peer?.signalingState}`);
              }
            } else if (signal.candidate) {
              const candidate = new RTCIceCandidate(signal);
              if (peer.remoteDescription && peer.remoteDescription.type) {
                  await peer.addIceCandidate(candidate);
              } else {
                  // Buffer candidate if remoteDescription is not yet set
                  if (!iceCandidateQueue.current[from]) iceCandidateQueue.current[from] = [];
                  iceCandidateQueue.current[from].push(candidate);
              }
            }
          } catch (err) {
            console.error("[Faculty] Error processing signal:", err);
          }
        });
    };

    init();

    return () => {
      clearInterval(timerRef.current);
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(t => t.stop());
      }
      Object.values(peersRef.current).forEach(p => p.close());
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, []);

  // Set local video element source
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  const createPeerConnection = async (student_id, stream) => {
    const peer = new RTCPeerConnection(rtcConfig);
    peersRef.current[student_id] = peer;
    
    peer.onconnectionstatechange = () => {
      setWebrtcStatus(prev => ({ ...prev, [student_id]: peer.connectionState }));
    };
    peer.oniceconnectionstatechange = () => {
      setWebrtcStatus(prev => ({ ...prev, [student_id]: "ICE: " + peer.iceConnectionState }));
    };

    const currentStream = stream || localStreamRef.current;
    if (currentStream) {
      currentStream.getTracks().forEach((track) => {
        // Prevent duplicate tracks
        const senders = peer.getSenders();
        const hasTrack = senders.some(s => s.track && s.track.kind === track.kind);
        if (!hasTrack) {
            peer.addTrack(track, currentStream);
        }
      });
    }
    // When we get a remote stream from the student
    peer.ontrack = (event) => {
       console.log(`[Faculty] Received track from student ${student_id}:`, event.streams[0]);
       setRemoteStreams(prev => ({
         ...prev,
         [student_id]: event.streams[0]
       }));
    };

    // Send ICE candidates to student
    peer.onicecandidate = (event) => {
      if (event.candidate) {
        console.log(`[Faculty] Sending ICE candidate to ${student_id}`);
        socketRef.current.emit("signal", {
          room_code: meeting.room_code,
          to: student_id,
          signal: event.candidate
        });
      }
    };

    // Faculty is the offerer.
    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);
    console.log(`[Faculty] Created offer for ${student_id}`);
    socketRef.current.emit("signal", {
      room_code: meeting.room_code,
      to: student_id,
      signal: peer.localDescription
    });
  };

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

  const toggleScreenShare = async () => {
    if (!isScreenSharing) {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        const screenVideoTrack = stream.getVideoTracks()[0];

        // Replace track in all peers
        Object.values(peersRef.current).forEach(peer => {
          const sender = peer.getSenders().find(s => s.track && s.track.kind === 'video');
          if (sender) sender.replaceTrack(screenVideoTrack);
        });

        if (localVideoRef.current) localVideoRef.current.srcObject = stream;
        setIsScreenSharing(true);
        setCamOn(true);
        
        screenVideoTrack.onended = () => {
          setIsScreenSharing(false);
          if (localStream) {
             const origVideoTrack = localStream.getVideoTracks()[0];
             Object.values(peersRef.current).forEach(peer => {
               const sender = peer.getSenders().find(s => s.track && s.track.kind === 'video');
               if (sender) sender.replaceTrack(origVideoTrack);
             });
             if (localVideoRef.current) localVideoRef.current.srcObject = localStream;
             setCamOn(origVideoTrack.enabled);
          }
        };
      } catch (err) {
         console.error("Screen share denied:", err);
      }
    } else {
      setIsScreenSharing(false);
      if (localStream) {
         const origVideoTrack = localStream.getVideoTracks()[0];
         Object.values(peersRef.current).forEach(peer => {
           const sender = peer.getSenders().find(s => s.track && s.track.kind === 'video');
           if (sender) sender.replaceTrack(origVideoTrack);
         });
         if (localVideoRef.current) localVideoRef.current.srcObject = localStream;
         setCamOn(origVideoTrack.enabled);
      }
    }
  };

  const handleEnd = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(t => t.stop());
    }
    Object.values(peersRef.current).forEach(p => p.close());
    socketRef.current.disconnect();
    onEnd();
  };

  const fmtTime = (s) => {
    const h = Math.floor(s/3600), m = Math.floor((s%3600)/60), ss = s%60;
    return h > 0
      ? `${h}:${String(m).padStart(2,"0")}:${String(ss).padStart(2,"0")}`
      : `${String(m).padStart(2,"0")}:${String(ss).padStart(2,"0")}`;
  };

  const copyLink = () => {
    navigator.clipboard.writeText(meeting.join_url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  return (
    <div className="mtg-room">
      {/* Header bar */}
      <div className="mtg-room-bar">
        <div className="mtg-room-info">
          <div className="mtg-live-dot" />
          <span className="mtg-course-name">{meeting.course_name}</span>
          <span className="mtg-sep">·</span>
          <span className="mtg-timer">{fmtTime(elapsed)}</span>
        </div>
        <div className="mtg-room-code-block">
          <span className="mtg-room-code-label">Room</span>
          <span className="mtg-room-code">{meeting.room_code}</span>
        </div>
      </div>

      {/* Main video area */}
      <div className="mtg-stage">
        <div className="mtg-faculty-tile" style={{ position: "relative", overflow: "hidden" }}>
          {camOn && localStream ? (
            <video 
              ref={localVideoRef} 
              autoPlay 
              playsInline 
              muted 
              style={{ 
                width: "100%", 
                height: "100%", 
                objectFit: "cover", 
                filter: camOn ? "none" : "blur(10px) grayscale(100%)",
                transition: "filter 0.3s"
              }} 
            />
          ) : (
            <div className="mtg-tile-avatar">
              {meeting.faculty_name?.split(" ").map(x => x[0]).join("").slice(0,2)}
            </div>
          )}
          
          {/* Privacy Overlay for Local Camera */}
          {!camOn && localStream && (
            <div className="mtg-privacy-overlay" style={{
              position: "absolute", inset: 0, background: "rgba(0,0,0,0.8)",
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", zIndex: 1, color: "#fff"
            }}>
              <IcoVideoOff style={{ width: 48, height: 48, marginBottom: 8, opacity: 0.5 }} />
              <span style={{ fontSize: "14px", fontWeight: 500 }}>Your camera is off</span>
            </div>
          )}
          
          <div className="mtg-tile-meta" style={{ zIndex: 2 }}>
            <span className="mtg-tile-name">{isScreenSharing ? "You (Presenting)" : "You (Faculty)"}</span>
            {!micOn && <span className="mtg-muted-badge">Muted</span>}
          </div>
          
          {!camOn && (
            <div className="mtg-cam-off" style={{ zIndex: 2 }}>
              <IcoVideoOff style={{width:28,height:28,color:"var(--text3)"}}/>
              <span>Camera is off</span>
            </div>
          )}
        </div>

        <div className="mtg-side">
          <div style={{ background: "var(--surface3)", padding: "10px", borderRadius: "8px", marginBottom: "16px", fontSize: "12px", color: "var(--text2)" }}>
            <strong>Debug Info:</strong><br/>
            Socket: {sockStatus}<br/>
            {Object.entries(webrtcStatus).map(([sid, stat]) => (
                <div key={sid}>Student {sid.slice(0,4)}: {stat}</div>
            ))}
          </div>

          {/* Active Remote Streams grid */}
          {Object.entries(remoteStreams).length > 0 && (
            <div className="mtg-remote-grid" style={{ marginBottom: 16 }}>
              <div className="mtg-ic-title">Student Cameras</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                {Object.entries(remoteStreams).map(([sid, stream]) => (
                <div key={sid} className="mtg-student-cam">
                  <RemoteVideoPlayer stream={stream} />
                  <div className="mtg-cam-name">Student {sid.slice(0,4)}</div>
                </div>
              ))}
              </div>
            </div>
          )}
          
          <div className="mtg-info-card">
            <div className="mtg-ic-title">Meeting Details</div>
            <div className="mtg-ic-row">
              <span className="mtg-ic-label">Course</span>
              <span className="mtg-ic-val">{meeting.course_name}</span>
            </div>
            <div className="mtg-ic-row">
              <span className="mtg-ic-label">Code</span>
              <span className="mtg-ic-val">{meeting.course_code}</span>
            </div>
            <div className="mtg-ic-row">
              <span className="mtg-ic-label">Students</span>
              <span className="mtg-ic-val">{meeting.student_count} enrolled</span>
            </div>
            <div className="mtg-divider"/>
            <div className="mtg-ic-title" style={{marginTop:0}}>Share with Students</div>
            <div className="mtg-join-link">{meeting.join_url}</div>
            <button className={`mtg-copy-btn ${copied?"copied":""}`} onClick={copyLink}>
              {copied ? <IcoCheck style={{width:13,height:13}}/> : <IcoCopy style={{width:13,height:13}}/>}
              {copied ? "Copied!" : "Copy Link"}
            </button>
          </div>
          <div className="mtg-student-count-card">
            <IcoUsers style={{width:20,height:20,color:"var(--teal)"}}/>
            <div>
              <div className="mtg-sc-num">{meeting.student_count}</div>
              <div className="mtg-sc-lbl">Students in Group</div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="mtg-controls">
        <button
          className={`mtg-ctrl-btn ${!micOn?"mtg-ctrl-off":""}`}
          onClick={toggleMic}
          title={micOn?"Mute Mic":"Unmute Mic"}
        >
          {micOn
            ? <IcoMic style={{width:20,height:20}}/>
            : <IcoMicOff style={{width:20,height:20}}/>}
          <span>{micOn?"Mute":"Unmute"}</span>
        </button>

        <button
          className={`mtg-ctrl-btn ${!camOn?"mtg-ctrl-off":""}`}
          onClick={toggleCam}
          title={camOn?"Turn Off Camera":"Turn On Camera"}
        >
          {camOn && !isScreenSharing
            ? <IcoVideo style={{width:20,height:20}}/>
            : <IcoVideoOff style={{width:20,height:20}}/>}
          <span>{camOn && !isScreenSharing ? "Camera Off":"Start Camera"}</span>
        </button>

        <button 
          className={`mtg-ctrl-btn ${isScreenSharing?"mtg-ctrl-active":""}`} 
          onClick={toggleScreenShare} 
          title={isScreenSharing?"Stop Sharing":"Share Screen"}
          style={isScreenSharing ? { background: "var(--teal)", color: "white", borderColor: "var(--teal)" } : {}}
        >
          <IcoMonitor style={{width:20,height:20}}/>
          <span>{isScreenSharing ? "Stop Sharing" : "Share Screen"}</span>
        </button>

        <button className="mtg-ctrl-btn mtg-ctrl-end" onClick={handleEnd} title="End Meeting">
          <IcoPhone style={{width:20,height:20,transform:"rotate(135deg)"}}/>
          <span>End Class</span>
        </button>
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ─────────────────────────────────────────────────
export default function FacultyMeeting({ onBack }) {
  const [groups,    setGroups]    = useState([]);
  const [history,   setHistory]   = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [starting,  setStarting]  = useState(null); // course_id being started
  const [liveMeet,  setLiveMeet]  = useState(null); // active meeting data
  const [tab,       setTab]       = useState("groups"); // "groups" | "history"

  useEffect(() => {
    const load = async () => {
      try {
        const [g, h] = await Promise.all([
          api.get("/faculty/meetings/groups"),
          api.get("/faculty/meetings/history"),
        ]);
        setGroups(g || []);
        setHistory(h || []);
      } catch (err) {
        console.error("Failed to load meetings:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleStart = async (group) => {
    try {
      setStarting(group.id);
      const result = await api.post("/faculty/meetings/start", { course_id: group.id });
      setLiveMeet(result);
    } catch (err) {
      console.error("Failed to start meeting:", err);
      alert("Could not start meeting. Please try again.");
    } finally {
      setStarting(null);
    }
  };

  const endMeeting = async () => {
    if (liveMeet) {
      try {
        await api.post("/faculty/meetings/end", { group_key: liveMeet.group_key });
      } catch(err) {
        console.error("Error ending meeting:", err);
      }
    }
    setLiveMeet(null);
    fetchData(); // refresh
  };

  if (liveMeet) {
    return <MeetingRoom meeting={liveMeet} onEnd={endMeeting}/>;
  }

  if (loading) return (
    <div className="loading-state">
      <div className="spinner"/><span className="loading-text">Loading Classrooms...</span>
    </div>
  );

  return (
    <div className="mtg-page">
      {/* Header */}
      <header className="mtg-header">
        <div>
          <button className="rp-back-pill" onClick={onBack}>
            <IcoChevL style={{width:12,height:12}}/> Dashboard
          </button>
          <h1 className="rp-main-title">
            Virtual Classroom&nbsp;
            <span className="pro-tag">LIVE</span>
          </h1>
          <p className="rp-subtitle">Start or schedule online sessions for your student programs (BCA, MCA, etc.)</p>
        </div>
      </header>

      {/* Tab bar */}
      <div className="mtg-tabs">
        <button className={`mtg-tab ${tab==="groups"?"active":""}`} onClick={()=>setTab("groups")}>
          <IcoVideo style={{width:14,height:14}}/> My Classrooms
        </button>
        <button className={`mtg-tab ${tab==="history"?"active":""}`} onClick={()=>setTab("history")}>
          <IcoHistory style={{width:14,height:14}}/> Session History
        </button>
      </div>

      {/* Groups tab */}
      {tab === "groups" && (
        <div className="mtg-groups">
          {groups.length === 0 ? (
            <div className="mtg-empty">
              <IcoVideo style={{width:36,height:36,color:"var(--text3)"}}/>
              <p>No course groups found. Enroll students in your courses first.</p>
            </div>
          ) : groups.map(g => (
            <div key={g.id} className="mtg-group-card" style={{"--card-color": g.color}}>
              <div className="mtg-gc-stripe"/>
              <div className="mtg-gc-body">
                <div className="mtg-gc-left">
                  <div className="mtg-gc-avatar" style={{background:`rgba(${g.rgb},.15)`, color: g.color}}>
                    {g.code}
                  </div>
                  <div>
                    <div className="mtg-gc-name">{g.name}</div>
                    <div className="mtg-gc-meta">
                      <span>All Students · All Semesters</span>
                    </div>
                  </div>
                </div>
                <div className="mtg-gc-stats">
                  <div className="mtg-gc-stat">
                    <span className="mtg-gc-stat-val" style={{color:g.color}}>{g.student_count}</span>
                    <span className="mtg-gc-stat-lbl">Students</span>
                  </div>
                </div>
                <div className="mtg-gc-actions">
                  <button
                    className="mtg-start-btn"
                    style={{background: g.color}}
                    onClick={() => handleStart(g)}
                    disabled={starting !== null}
                  >
                    {starting === g.id ? (
                      <span className="mtg-btn-spinner"/>
                    ) : (
                      <IcoVideo style={{width:14,height:14}}/>
                    )}
                    {starting === g.id ? "Starting..." : "Start Class"}
                  </button>
                  <button className="mtg-sched-btn" title="Schedule Session">
                    <IcoCal style={{width:14,height:14}}/> Schedule
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* History tab */}
      {tab === "history" && (
        <div className="mtg-history">
          {history.length === 0 ? (
            <div className="mtg-empty">
              <IcoHistory style={{width:36,height:36,color:"var(--text3)"}}/>
              <p>No past sessions yet. Start your first class!</p>
            </div>
          ) : (
            <div className="mtg-hist-list">
              {history.map((h, i) => {
                const pct = h.total_students > 0 ? Math.round((h.attendees / h.total_students)*100) : 0;
                return (
                  <div key={i} className="mtg-hist-item">
                    <div className="mtg-hist-left">
                      <div className="mtg-hist-date">{h.date}</div>
                      <div className="mtg-hist-course">{h.course_name}</div>
                      <div className="mtg-hist-code">{h.course_code}</div>
                    </div>
                    <div className="mtg-hist-stats">
                      <div className="mtg-hist-stat">
                        <span className="mtg-hist-sval">{h.duration_min} min</span>
                        <span className="mtg-hist-slbl">Duration</span>
                      </div>
                      <div className="mtg-hist-stat">
                        <span className="mtg-hist-sval" style={{color: pct>=75?"var(--teal)":pct>=50?"var(--amber)":"var(--rose)"}}>{pct}%</span>
                        <span className="mtg-hist-slbl">Attendance</span>
                      </div>
                      <div className="mtg-hist-stat">
                        <span className="mtg-hist-sval">{h.attendees}/{h.total_students}</span>
                        <span className="mtg-hist-slbl">Joined</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
