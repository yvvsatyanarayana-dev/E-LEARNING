import { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import api from "../../../utils/api";
import { 
  Camera, CameraOff, Mic, MicOff, PhoneOff, 
  Users, Settings, MessageSquare, Monitor,
  MoreVertical, Shield, Activity, Info,
  Grid, Video, Calendar, History, ChevronLeft, Check, Copy
} from 'lucide-react';
import "../../placement/placementMeeting/placementMeeting.css"; // Inherit placement theme

const RemoteVideoPlayer = ({ stream, label }) => {
  const videoRef = useRef(null);
  const [isMuted, setIsMuted] = useState(true);
  
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !stream) return;

    const logPrefix = `[RemotePlayer:${label || stream.id.slice(0,5)}]`;
    
    // Only attach if different to prevent playback interruption
    if (video.srcObject !== stream) {
      console.log(`${logPrefix} Attaching stream (${stream.getTracks().length} tracks)`);
      video.srcObject = stream;
    }

    const playVideo = async () => {
      try {
        await video.play();
        console.log(`${logPrefix} Playback started (muted: ${video.muted})`);
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.warn(`${logPrefix} Playback failed:`, err.message);
        }
      }
    };

    playVideo();

    const onAddTrack = (e) => {
      console.log(`${logPrefix} New track: ${e.track.kind}`);
      playVideo();
    };

    stream.addEventListener('addtrack', onAddTrack);
    return () => stream.removeEventListener('addtrack', onAddTrack);
  }, [stream]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <video 
        ref={videoRef} 
        autoPlay 
        playsInline 
        muted={isMuted}
        style={{ width: "100%", height: "100%", objectFit: "cover", backgroundColor: '#000' }} 
      />
      {isMuted && (
        <button 
          onClick={() => setIsMuted(false)}
          className="unmute-btn"
          style={{
            position: 'absolute',
            bottom: '20px',
            right: '20px',
            padding: '8px 16px',
            backgroundColor: 'rgba(99, 102, 241, 0.9)',
            color: 'white',
            border: 'none',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: '600',
            cursor: 'pointer',
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            backdropFilter: 'blur(4px)'
          }}
        >
          <Mic size={14} /> Unmute {label || 'Student'}
        </button>
      )}
    </div>
  );
};

function MeetingRoom({ meeting, onEnd }) {
  const [micOn,  setMicOn]  = useState(true);
  const [camOn,  setCamOn]  = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [activeTab, setActiveTab] = useState('participants');
  
  const timerRef = useRef(null);
  const localVideoRef = useRef(null);
  const peersRef = useRef({}); // student_id -> RTCPeerConnection
  const socketRef = useRef(null);

  const [localStream, setLocalStream] = useState(null);
  const localStreamRef = useRef(null);
  const screenStreamRef = useRef(null);
  const [remoteStreams, setRemoteStreams] = useState({}); // student_id -> MediaStream
  const [studentNames, setStudentNames] = useState({}); // student_id -> name
  const [sockStatus, setSockStatus] = useState("Connecting...");
  const [webrtcStatus, setWebrtcStatus] = useState({}); // student_id -> { conn, ice }
  const iceCandidateQueue = useRef({}); // Buffer for early ICE candidates
  const signalingProcessing = useRef({}); // Lock for SDP processing
  const pendingConnections = useRef(new Set()); // Guard against double-creation
  const initDone = useRef(false); // Guard against React StrictMode double-init

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const chatEndRef = useRef(null);



  const rtcConfig = { iceServers: [{ urls: "stun:stun.l.google.com:19302" }] };

  useEffect(() => {
    if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const stopLocalMedia = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(t => t.stop());
      localStreamRef.current = null;
      setLocalStream(null);
    }
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach(t => t.stop());
      screenStreamRef.current = null;
    }
  };

  useEffect(() => {
    // Prevent React StrictMode from running init twice
    if (initDone.current) return;
    initDone.current = true;

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

        const backendUrl = (import.meta.env.DEV ? "http://localhost:8000" : "https://e-learning-backend-api.onrender.com");
        socketRef.current = io(backendUrl, { transports: ["websocket"] });
        const s = socketRef.current;

        s.on("connect", () => {
          setSockStatus("Connected");
          const user = JSON.parse(localStorage.getItem('user') || '{}');
          const facultyName = user.name || user.email || 'Faculty';
          s.emit("join_room", { room_code: meeting.room_code, role: "faculty", name: facultyName });
        });
        
        s.on("disconnect", () => {
            setSockStatus("Disconnected")
            stopLocalMedia();
        });

        s.on("student_joined", async ({ student_id, student_name }) => {
           setStudentNames(prev => ({ ...prev, [student_id]: student_name || `Student ${student_id.slice(0,4)}` }));
           if (!peersRef.current[student_id] && !pendingConnections.current.has(student_id)) {
             pendingConnections.current.add(student_id);
             await createPeerConnection(student_id, stream);
             pendingConnections.current.delete(student_id);
           }
        });

        s.on("chat_message", (msg) => {
          setMessages(prev => [...prev, msg]);
        });

        s.on("room_state", async ({ students }) => {
          if (students && students.length > 0) {
            for (const student_id of students) {
               if (student_id !== socketRef.current?.id 
                   && !peersRef.current[student_id] 
                   && !pendingConnections.current.has(student_id)) {
                   pendingConnections.current.add(student_id);
                   await createPeerConnection(student_id, stream);
                   pendingConnections.current.delete(student_id);
               }
            }
          }
        });

        s.on("student_disconnected", ({ student_id }) => {
          if (peersRef.current[student_id]) {
            peersRef.current[student_id].close();
            delete peersRef.current[student_id];
          }
          if (iceCandidateQueue.current[student_id]) delete iceCandidateQueue.current[student_id];
          
          setRemoteStreams(prev => { const next = { ...prev }; delete next[student_id]; return next; });
          setStudentNames(prev => { const next = { ...prev }; delete next[student_id]; return next; });
          setWebrtcStatus(prev => { const next = { ...prev }; delete next[student_id]; return next; });
        });

        s.on("signal", async (data) => {
          const { from, signal } = data;
          let peer = peersRef.current[from];
          if (!peer) return;

          try {
            if (signal.type === "answer") {
              if (peer.signalingState !== "have-local-offer") {
                console.log("[Faculty] Ignoring mismatched answer in state:", peer.signalingState);
                return;
              }
              if (signalingProcessing.current[from]) return;
              
              signalingProcessing.current[from] = true;
              console.log("[Faculty] Setting Remote Answer for:", from);
              await peer.setRemoteDescription(new RTCSessionDescription(signal));
              
              const queue = iceCandidateQueue.current[from] || [];
              while (queue.length > 0) {
                const candidate = queue.shift();
                await peer.addIceCandidate(candidate).catch(() => {});
              }
              delete iceCandidateQueue.current[from];
              signalingProcessing.current[from] = false;
            } else if (signal.candidate) {
              const candidate = new RTCIceCandidate(signal);
              if (peer.remoteDescription && peer.remoteDescription.type) {
                await peer.addIceCandidate(candidate).catch(() => {});
              } else {
                if (!iceCandidateQueue.current[from]) iceCandidateQueue.current[from] = [];
                iceCandidateQueue.current[from].push(candidate);
              }
            }
          } catch (err) {
            console.error("[Faculty] Signal handling error:", err);
            signalingProcessing.current[from] = false;
          }
        });
    };

    init();

    return () => {
      clearInterval(timerRef.current);
      stopLocalMedia();
      Object.keys(peersRef.current).forEach(sid => {
        peersRef.current[sid].close();
        delete peersRef.current[sid];
      });
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, []);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  const createPeerConnection = async (student_id, stream) => {
    // PROTECT ACTIVE CONNECTION
    if (peersRef.current[student_id]) {
      const pc = peersRef.current[student_id];
      if (pc.connectionState === "connected" || pc.connectionState === "connecting") {
        console.log("[Faculty] Peer active, skipping redundant creation for:", student_id);
        return;
      }
      pc.close();
    }

    console.log("[Faculty] Initializing PeerConnection for:", student_id);
    const peer = new RTCPeerConnection(rtcConfig);
    peersRef.current[student_id] = peer;
    
    peer.onconnectionstatechange = () => {
      console.log(`[Faculty] Peer ${student_id.slice(0,8)} connectionState:`, peer.connectionState);
      setWebrtcStatus(prev => ({ ...prev, [student_id]: { ...prev[student_id], conn: peer.connectionState } }));
    };
    peer.oniceconnectionstatechange = () => {
      console.log(`[Faculty] Peer ${student_id.slice(0,8)} iceState:`, peer.iceConnectionState);
      setWebrtcStatus(prev => ({ ...prev, [student_id]: { ...prev[student_id], ice: peer.iceConnectionState } }));
    };

    const currentStream = stream || localStreamRef.current;
    if (currentStream) {
      currentStream.getTracks().forEach((track) => {
        const senders = peer.getSenders();
        const hasTrack = senders.some(s => s.track && s.track.kind === track.kind);
        if (!hasTrack) peer.addTrack(track, currentStream);
      });
    }

    peer.ontrack = (event) => {
       console.log("[Faculty] Track received from:", student_id, event.track.kind);
       setRemoteStreams(prev => {
         const existingStream = prev[student_id];
         if (existingStream) {
           if (!existingStream.getTracks().find(t => t.id === event.track.id)) {
             existingStream.addTrack(event.track);
             // Trigger a state update by creating a new reference
             return { ...prev, [student_id]: new MediaStream(existingStream.getTracks()) };
           }
           return prev; // No change needed
         }
         
         const newStream = event.streams[0] || new MediaStream([event.track]);
         return { ...prev, [student_id]: newStream };
       });
    };

    peer.onicecandidate = (event) => {
      if (event.candidate) {
        socketRef.current.emit("signal", {
          room_code: meeting.room_code,
          to: student_id,
          signal: event.candidate
        });
      }
    };

    try {
      const offer = await peer.createOffer();
      await peer.setLocalDescription(offer);
      socketRef.current.emit("signal", {
        room_code: meeting.room_code,
        to: student_id,
        signal: peer.localDescription
      });
    } catch (err) {
      console.error(`[Faculty] Error creating offer for ${student_id}:`, err);
    }
  };

  const toggleCam = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach(t => t.enabled = !camOn);
      setCamOn(!camOn);
    }
  };

  const toggleMic = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach(t => t.enabled = !micOn);
      setMicOn(!micOn);
    }
  };

  const toggleScreenShare = async () => {
    if (!isScreenSharing) {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        const screenVideoTrack = stream.getVideoTracks()[0];

        Object.values(peersRef.current).forEach(peer => {
          const sender = peer.getSenders().find(s => s.track && s.track.kind === 'video');
          if (sender) sender.replaceTrack(screenVideoTrack);
        });

        if (localVideoRef.current) localVideoRef.current.srcObject = stream;
        screenStreamRef.current = stream;
        setIsScreenSharing(true);
        setCamOn(true);
        
        screenVideoTrack.onended = () => {
          setIsScreenSharing(false);
          if (screenStreamRef.current) {
            screenStreamRef.current.getTracks().forEach(t => t.stop());
            screenStreamRef.current = null;
          }
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
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach(t => t.stop());
        screenStreamRef.current = null;
      }
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
    if (socketRef.current) {
      socketRef.current.emit("meeting_ended", { room_code: meeting.room_code });
    }
    stopLocalMedia();
    Object.values(peersRef.current).forEach(p => {
      p.getSenders().forEach(sender => { if (sender.track) sender.track.stop(); });
      p.close();
    });
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    setCamOn(false);
    setMicOn(false);
    setIsScreenSharing(false);
    if (socketRef.current) socketRef.current.disconnect();
    onEnd();
  };

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs > 0 ? hrs + ':' : ''}${mins < 10 ? '0' + mins : mins}:${secs < 10 ? '0' + secs : secs}`;
  };

  const copyLink = () => {
    navigator.clipboard.writeText(meeting.join_url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !socketRef.current) return;
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const msgData = {
      room_code: meeting.room_code,
      sender: user.name || user.email || 'Faculty',
      text: newMessage,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    socketRef.current.emit('chat_message', msgData);
    setMessages(prev => [...prev, { ...msgData, isMine: true }]);
    setNewMessage('');
  };

  return (
    <div className="placement-meeting-container">
      <div className="sc-noise" />

      {/* Header */}
      <div className="meeting-header">
        <div className="left-section">
          <div className="live-pill">
            <span className="pulse"></span>
            LIVE CLASS
          </div>
          <div className="meeting-info">
            <h1>{meeting.course_name}</h1>
            <span className="room-code">Room: {meeting.room_code}</span>
          </div>
        </div>
        
        <div className="center-section">
          <div className="timer-badge">
            <Activity size={16} />
            {formatTime(elapsed)}
          </div>
        </div>

        <div className="right-section">
          <button className="btn btn-ghost" onClick={copyLink} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
            {copied ? <Check size={16} /> : <Copy size={16} />} 
            {copied ? 'Copied Link' : 'Copy Link'}
          </button>
          <div className="connection-status">
            <div className={`status-dot ${sockStatus === 'Connected' ? 'stable' : 'warning'}`}></div>
            {sockStatus === 'Connected' ? 'Stable' : 'Connecting...'}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="meeting-content">
        <div className="stage-area">
          <div className="video-grid-manager">
             {/* Remote Streams Grid */}
             <div className="remote-grid">
              {Object.entries(remoteStreams).map(([id, stream]) => (
                <div key={id} className="remote-tile">
                  <RemoteVideoPlayer stream={stream} label={studentNames[id] || id.slice(0,4)} />
                  <div className="tile-overlay">
                    <span className="user-label">{studentNames[id] || id}</span>
                  </div>
                </div>
              ))}
              
              {Object.keys(remoteStreams).length === 0 && (
                <div className="empty-grid-placeholder">
                  <div className="placeholder-content">
                    <Users size={48} />
                    <p>Waiting for students to connect...</p>
                    <span className="invite-hint">Class code: <b>{meeting.course_code}</b></span>
                  </div>
                </div>
              )}
            </div>

            {/* Local Stream (PIP or Side) */}
            <div className={`local-tile ${Object.keys(remoteStreams).length > 0 ? 'pip' : 'full'}`}>
              <video
                muted
                autoPlay
                playsInline
                ref={localVideoRef}
                className={!camOn && !isScreenSharing ? 'hidden' : ''}
              />
              {!camOn && !isScreenSharing && (
                <div className="avatar-placeholder">
                  <div className="avatar">FA</div>
                </div>
              )}
              <div className="tile-overlay">
                <span className="user-label">{isScreenSharing ? "You (Presenting)" : "You (Faculty)"}</span>
                {!micOn && <MicOff size={14} className="status-icon" />}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="meeting-sidebar">
          <div className="sidebar-tabs">
            <button 
              className={`tab-btn ${activeTab === 'participants' ? 'active' : ''}`}
              onClick={() => setActiveTab('participants')}
            >
              <Users size={18} />
              <span>Students ({Object.keys(remoteStreams).length})</span>
            </button>
            <button 
              className={`tab-btn ${activeTab === 'chat' ? 'active' : ''}`}
              onClick={() => setActiveTab('chat')}
            >
              <MessageSquare size={18} />
              <span>Chat</span>
            </button>
          </div>

          <div className="tab-content">
            {activeTab === 'participants' && (
              <div className="participants-list">
                <div className="participant-item me">
                  <div className="p-avatar">FA</div>
                  <div className="p-info">
                    <span className="name">{meeting.faculty_name} (You)</span>
                    <span className="role">Instructor</span>
                  </div>
                  <div className="p-actions">
                    <Shield size={16} className="mod-icon" />
                  </div>
                </div>
                {Object.entries(studentNames).map(([id, name]) => (
                  <div key={id} className="participant-item">
                    <div className="p-avatar">{name[0].toUpperCase()}</div>
                    <div className="p-info">
                      <span className="name">{name}</span>
                      <span className="email">Student</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {activeTab === 'chat' && (
              <div className="chat-container">
                <div className="chat-messages">
                  {messages.length === 0 ? (
                    <div className="chat-placeholder"><p>No messages yet. Start the conversation!</p></div>
                  ) : (
                    messages.map((m, i) => (
                      <div key={i} className={`message ${m.isMine ? 'mine' : ''}`}>
                        <div className="msg-header">
                          {m.isMine ? 'You' : m.sender} &bull; {m.time}
                        </div>
                        <div className="msg-bubble">{m.text}</div>
                      </div>
                    ))
                  )}
                  <div ref={chatEndRef} />
                </div>
                <form onSubmit={sendMessage} className="chat-input-area">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                  />
                  <button type="submit" disabled={!newMessage.trim()} className="btn btn-solid send-btn">Send</button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="meeting-controls">
        <div className="ctrl-group">
          <button className={`ctrl-btn ${!micOn ? 'danger' : ''}`} onClick={toggleMic} disabled={!localStream}>
            {!micOn ? <MicOff size={22} /> : <Mic size={22} />}
            <span className="label">{!micOn ? 'Unmute' : 'Mute'}</span>
          </button>
          <button className={`ctrl-btn ${!camOn ? 'danger' : ''}`} onClick={toggleCam} disabled={!localStream && !isScreenSharing}>
            {!camOn && !isScreenSharing ? <CameraOff size={22} /> : <Camera size={22} />}
            <span className="label">{!camOn && !isScreenSharing ? 'Start Cam' : 'Stop Cam'}</span>
          </button>
        </div>

        <div className="ctrl-group">
          <button className={`ctrl-btn ${isScreenSharing ? 'active' : ''}`} onClick={toggleScreenShare} disabled={!localStream}>
            <Monitor size={22} />
            <span className="label">{isScreenSharing ? 'Stop Share' : 'Present'}</span>
          </button>
          <button className="ctrl-btn danger end-call" onClick={handleEnd} title="End Class">
            <PhoneOff size={24} />
            <span>End Class</span>
          </button>
        </div>

        <div className="ctrl-group">
          <button className="icon-btn"><Settings size={20} /></button>
          <button className="icon-btn"><MoreVertical size={20} /></button>
        </div>
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

  const fetchData = async () => {
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

  useEffect(() => {
    fetchData();
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

  // The outer list view keeps the custom CSS we had in facultyDashboard.css
  return (
    <div className="mtg-page" style={{ padding: '24px' }}>
      <header className="mtg-header" style={{ marginBottom: '32px' }}>
        <div>
          <button className="btn btn-ghost" onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text2)', background: 'none', border: 'none', cursor: 'pointer', marginBottom: '16px' }}>
            <ChevronLeft size={16} /> Dashboard
          </button>
          <h1 className="rp-main-title" style={{ fontSize: '28px', color: 'var(--text1)', display: 'flex', alignItems: 'center', gap: '12px' }}>
            Virtual Classroom 
            <span className="pro-tag" style={{ background: 'var(--rose-l)', color: 'var(--rose)', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 700 }}>LIVE</span>
          </h1>
          <p className="rp-subtitle" style={{ color: 'var(--text2)', marginTop: '8px' }}>Start or schedule online sessions for your student programs.</p>
        </div>
      </header>

      {/* Tab bar */}
      <div className="mtg-tabs" style={{ display: 'flex', gap: '16px', borderBottom: '1px solid var(--border)', marginBottom: '24px', paddingBottom: '8px' }}>
        <button 
          className={`btn ${tab === "groups" ? "btn-solid" : "btn-ghost"}`} 
          onClick={()=>setTab("groups")}
          style={tab === "groups" ? { background: 'var(--indigo)', color: 'white' } : { color: 'var(--text2)', background: 'transparent' }}
        >
          <Video size={16} /> My Classrooms
        </button>
        <button 
          className={`btn ${tab === "history" ? "btn-solid" : "btn-ghost"}`} 
          onClick={()=>setTab("history")}
          style={tab === "history" ? { background: 'var(--indigo)', color: 'white' } : { color: 'var(--text2)', background: 'transparent' }}
        >
          <History size={16} /> Session History
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '64px', color: 'var(--text3)' }}><div className="spinner" style={{ marginBottom: '16px' }}/><p>Loading Classrooms...</p></div>
      ) : tab === "groups" ? (
        <div className="meeting-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {groups.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', background: 'var(--surface2)', borderRadius: '16px', padding: '64px 24px', textAlign: 'center', border: '1px dashed var(--border)', color: 'var(--text3)' }}>
              <div style={{ background: 'var(--surface3)', padding: '20px', borderRadius: '50%', display: 'inline-flex', marginBottom: '20px' }}>
                <Video size={36} />
              </div>
              <p>No course groups found. Enroll students in your courses first.</p>
            </div>
          ) : groups.map(g => (
            <div key={g.id} style={{ background: 'var(--surface2)', borderRadius: '16px', padding: '24px', border: '1px solid var(--border)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: g.color || 'var(--indigo)' }} />
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: `rgba(91,78,248,0.1)`, color: g.color || 'var(--indigo)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                  {g.code}
                </div>
                <div>
                  <h3 style={{ fontSize: '18px', color: 'var(--text1)', marginBottom: '4px' }}>{g.name}</h3>
                  <p style={{ fontSize: '12px', color: 'var(--text3)' }}>All Students · All Semesters</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '24px', marginBottom: '24px' }}>
                <div>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', color: g.color || 'var(--indigo)' }}>{g.student_count}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text3)' }}>Students</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  style={{ flex: 1, background: g.color || 'var(--indigo)', color: 'white', border: 'none', padding: '10px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: 500 }}
                  onClick={() => handleStart(g)}
                  disabled={starting !== null}
                >
                  {starting === g.id ? <div className="spinner" style={{width: 14, height: 14}}/> : <Video size={16}/>}
                  {starting === g.id ? "Starting..." : "Start Class"}
                </button>
                <button style={{ flex: 1, background: 'var(--surface3)', color: 'var(--text1)', border: 'none', padding: '10px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: 500 }}>
                  <Calendar size={16}/> Schedule
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mtg-history">
          {history.length === 0 ? (
            <div style={{ background: 'var(--surface2)', borderRadius: '16px', padding: '64px 24px', textAlign: 'center', border: '1px dashed var(--border)', color: 'var(--text3)' }}>
              <div style={{ background: 'var(--surface3)', padding: '20px', borderRadius: '50%', display: 'inline-flex', marginBottom: '20px' }}>
                <History size={36} />
              </div>
              <p>No past sessions yet. Start your first class!</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '16px' }}>
              {history.map((h, i) => {
                const pct = h.total_students > 0 ? Math.round((h.attendees / h.total_students)*100) : 0;
                return (
                  <div key={i} style={{ background: 'var(--surface2)', borderRadius: '12px', padding: '20px', border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '12px', color: 'var(--text3)', marginBottom: '4px' }}>{h.date}</div>
                      <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text1)', marginBottom: '4px' }}>{h.course_name}</div>
                      <div style={{ fontSize: '13px', color: 'var(--text2)' }}>{h.course_code}</div>
                    </div>
                    <div style={{ display: 'flex', gap: '32px', textAlign: 'center' }}>
                      <div>
                        <div style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text1)' }}>{h.duration_min}m</div>
                        <div style={{ fontSize: '11px', color: 'var(--text3)' }}>Duration</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '18px', fontWeight: 600, color: pct >= 75 ? 'var(--teal)' : pct >= 50 ? 'var(--amber)' : 'var(--rose)' }}>{pct}%</div>
                        <div style={{ fontSize: '11px', color: 'var(--text3)' }}>Attendance</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text1)' }}>{h.attendees}/{h.total_students}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text3)' }}>Joined</div>
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
