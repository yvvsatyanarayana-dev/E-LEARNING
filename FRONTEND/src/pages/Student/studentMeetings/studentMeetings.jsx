import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import api from "../../../utils/api";
import { 
  Camera, CameraOff, Mic, MicOff, PhoneOff, 
  Users, Settings, MessageSquare, Monitor,
  MoreVertical, Shield, Activity, Info,
  Grid, Video, ChevronLeft, Clock
} from 'lucide-react';
import "../../placement/placementMeeting/placementMeeting.css";

const RemoteVideoPlayer = ({ stream, label }) => {
  const videoRef = useRef(null);
  const [isMuted, setIsMuted] = useState(true);
  
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !stream) return;

    const logPrefix = `[RemotePlayer:${label || stream.id.slice(0,5)}]`;
    
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
          <Mic size={14} /> Unmute {label || 'Faculty'}
        </button>
      )}
    </div>
  );
};

function StudentMeetingRoom({ meeting, onLeave }) {
  const [micOn,  setMicOn]  = useState(true);
  const [camOn,  setCamOn]  = useState(true);
  const [elapsed, setElapsed] = useState(0);
  const [activeTab, setActiveTab] = useState('participants');

  const timerRef = useRef(null);
  const localVideoRef = useRef(null);
  const peerRef = useRef(null); 
  const socketRef = useRef(null);
  const facultyIdRef = useRef(null);

  const [localStream, setLocalStream] = useState(null);
  const localStreamRef = useRef(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [sockStatus, setSockStatus] = useState("Connecting...");
  const [webrtcStatus, setWebrtcStatus] = useState({ conn: "new", ice: "new" });
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const chatEndRef = useRef(null);
  const iceCandidateQueue = useRef([]); 
  const isProcessingSignal = useRef(false); // Signal lock
  const lastProcessedOfferSdp = useRef(null); // SDP deduplication
  const initDone = useRef(false); // Guard against React StrictMode double-init



  const rtcConfig = { iceServers: [{ urls: "stun:stun.l.google.com:19302" }] };

  useEffect(() => {
    if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
        } catch (e) {
           console.error("Camera access denied:", e);
        }

        const backendUrl = (import.meta.env.DEV ? "http://localhost:8000" : "https://e-learning-backend-api.onrender.com");
        socketRef.current = io(backendUrl, { transports: ["websocket"] });
        const s = socketRef.current;

        s.on("connect", () => {
          setSockStatus("Connected");
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
          if (localStreamRef.current) localStreamRef.current.getTracks().forEach(t => t.stop());
          if (peerRef.current) peerRef.current.close();
          setRemoteStream(null);
          alert("The faculty has ended the meeting.");
          onLeave();
        });

        s.on("meeting_ended", () => {
          if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(t => t.stop());
            localStreamRef.current = null;
          }
          if (localVideoRef.current) localVideoRef.current.srcObject = null;
          if (peerRef.current) {
            peerRef.current.getSenders().forEach(s => { if (s.track) s.track.stop(); });
            peerRef.current.close();
          }
          setRemoteStream(null);
          setLocalStream(null);
          alert("Meeting ended by host.");
          onLeave();
        });

        s.on("chat_message", (msg) => {
          setMessages(prev => [...prev, msg]);
        });

        s.on("signal", async (data) => {
          const { from, signal } = data;
          facultyIdRef.current = from;

          try {
            if (signal.type === "offer") {
              // Deduplicate: skip if this exact offer SDP was already processed
              if (signal.sdp && signal.sdp === lastProcessedOfferSdp.current) {
                console.log("[Student] Dropping duplicate offer (same SDP)");
                return;
              }
              if (peerRef.current && (peerRef.current.connectionState === 'connected' || peerRef.current.connectionState === 'connecting')) {
                 console.log("[Student] Skipping offer for active peer");
                 return;
              }
              if (isProcessingSignal.current) return;
              
              isProcessingSignal.current = true;
              lastProcessedOfferSdp.current = signal.sdp;
              console.log("[Student] Processing offer from faculty:", from);
              await handleOffer(from, signal, stream);
              isProcessingSignal.current = false;
            } else if (signal.type === "answer") {
              if (isProcessingSignal.current) return;
              isProcessingSignal.current = true;
              
              const peer = peerRef.current;
              if (peer && peer.signalingState === "have-local-offer") {
                 console.log("[Student] Processing answer for faculty:", from);
                 await peer.setRemoteDescription(new RTCSessionDescription(signal));
              }
              isProcessingSignal.current = false;
            } else if (signal.candidate) {
              const candidate = new RTCIceCandidate(signal);
              const peer = peerRef.current;
              if (peer && peer.remoteDescription && peer.remoteDescription.type) {
                await peer.addIceCandidate(candidate).catch(() => {});
              } else {
                iceCandidateQueue.current.push(candidate);
              }
            }
          } catch (err) {
            console.error("[Student] Signal handling error:", err);
            isProcessingSignal.current = false;
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
        peerRef.current = null;
      }
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, []);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  const handleOffer = async (facultyId, offer, stream) => {
    // PROTECT ACTIVE CONNECTION
    if (peerRef.current) {
       if (peerRef.current.connectionState === "connected" || peerRef.current.connectionState === "connecting") {
          console.log("[Student] Peer active, skipping creation");
          return;
       }
       peerRef.current.close();
    }

    console.log("[Student] Initializing PeerConnection");
    const peer = new RTCPeerConnection(rtcConfig);
    peerRef.current = peer;
    
    peer.onconnectionstatechange = () => {
      console.log("[Student] ConnectionState:", peer.connectionState);
      setWebrtcStatus(prev => ({ ...prev, conn: peer.connectionState }));
    };
    peer.oniceconnectionstatechange = () => {
      console.log("[Student] ICEState:", peer.iceConnectionState);
      setWebrtcStatus(prev => ({ ...prev, ice: peer.iceConnectionState }));
    };

    const currentStream = stream || localStreamRef.current;
    if (currentStream) {
      currentStream.getTracks().forEach((track) => {
        peer.addTrack(track, currentStream);
      });
    }

    peer.ontrack = (event) => {
      console.log("[Student] Track received from faculty:", event.track.kind);
      setRemoteStream(prev => {
        if (prev) {
          if (!prev.getTracks().find(t => t.id === event.track.id)) {
            prev.addTrack(event.track);
            return new MediaStream(prev.getTracks());
          }
          return prev;
        }
        return event.streams[0] || new MediaStream([event.track]);
      });
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
    
    while (iceCandidateQueue.current.length > 0) {
        const candidate = iceCandidateQueue.current.shift();
        try { await peer.addIceCandidate(candidate); } catch (e) {}
    }

    const answer = await peer.createAnswer();
    await peer.setLocalDescription(answer);

    socketRef.current.emit("signal", {
      room_code: meeting.room_code,
      to: facultyId,
      signal: peer.localDescription
    });
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

  const handleLeave = () => {
    if (localStreamRef.current) localStreamRef.current.getTracks().forEach(t => t.stop());
    if (peerRef.current) peerRef.current.close();
    if (socketRef.current) socketRef.current.disconnect();
    onLeave();
  };

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs > 0 ? hrs + ':' : ''}${mins < 10 ? '0' + mins : mins}:${secs < 10 ? '0' + secs : secs}`;
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !socketRef.current) return;
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const msgData = {
      room_code: meeting.room_code,
      sender: user.name || user.email || 'Student',
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
            LIVE SESSION
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
          <button className="icon-btn secondary"><Info size={20} /></button>
          <button className="icon-btn secondary"><Settings size={20} /></button>
          <div className="connection-status" title={`ICE: ${webrtcStatus.ice}`}>
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
              {remoteStream ? (
                <div className="remote-tile">
                  <RemoteVideoPlayer stream={remoteStream} label={meeting?.faculty_name || 'Faculty'} />
                  <div className="tile-overlay">
                    <span className="user-label">{meeting?.faculty_name || 'Faculty'} (Faculty)</span>
                  </div>
                </div>
              ) : (
                <div className="empty-grid-placeholder">
                  <div className="placeholder-content">
                    <Video size={48} />
                    <p>Waiting for instructor to share their camera...</p>
                    <span className="invite-hint">Stand by for {meeting.faculty_name}'s broadcast.</span>
                  </div>
                </div>
              )}
            </div>

            {/* Local Stream (PIP or Side) */}
            <div className={`local-tile ${remoteStream ? 'pip' : 'full'}`}>
              <video
                muted
                autoPlay
                playsInline
                ref={localVideoRef}
                className={!camOn ? 'hidden' : ''}
              />
              {!camOn && (
                <div className="avatar-placeholder">
                  <div className="avatar">ST</div>
                </div>
              )}
              <div className="tile-overlay">
                <span className="user-label">You (Student)</span>
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
              <span>Participants</span>
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
                <div className="participant-item">
                  <div className="p-avatar">FA</div>
                  <div className="p-info">
                    <span className="name">{meeting.faculty_name || 'Faculty'}</span>
                    <span className="role">Instructor</span>
                  </div>
                  <div className="p-actions">
                    <Shield size={16} className="mod-icon" />
                  </div>
                </div>
                <div className="participant-item me">
                  <div className="p-avatar">ST</div>
                  <div className="p-info">
                    <span className="name">You (Student)</span>
                    <span className="role">Participant</span>
                  </div>
                </div>
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
          <button className={`ctrl-btn ${!camOn ? 'danger' : ''}`} onClick={toggleCam} disabled={!localStream}>
            {!camOn ? <CameraOff size={22} /> : <Camera size={22} />}
            <span className="label">{!camOn ? 'Start Cam' : 'Stop Cam'}</span>
          </button>
        </div>

        <div className="ctrl-group">
          <button className="ctrl-btn" disabled={true}>
            <Monitor size={22} />
            <span className="label">Present</span>
          </button>
          <button className="ctrl-btn">
            <Grid size={22} />
            <span className="label">Layout</span>
          </button>
          <button className="ctrl-btn danger end-call" onClick={handleLeave}>
            <PhoneOff size={24} />
            <span>Leave</span>
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

export default function StudentMeetings({ onBack, onNavigate }) {
  const [activeMeeting, setActiveMeeting] = useState(null);
  const [activePlacementMeeting, setActivePlacementMeeting] = useState(null);
  const [loading, setLoading] = useState(true);
  const [joined, setJoined] = useState(false);

  useEffect(() => {
    const fetchMeeting = async () => {
      try {
        const res = await api.get("/student/dashboard");
        const data = res;
        if (data?.active_meeting) {
          setActiveMeeting(data.active_meeting);
          const urlParams = new URLSearchParams(window.location.search);
          if (urlParams.get("room") === data.active_meeting.room_code) setJoined(true);
        }
        if (data?.active_placement_meeting) {
          setActivePlacementMeeting(data.active_placement_meeting);
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
    <div className="content student-meetings-page" style={{ padding: '24px' }}>
      <div className="breadcrumb" style={{ marginBottom: '24px' }}>
        <button onClick={onBack} className="btn btn-ghost" style={{ border: "none", background: "none", cursor: "pointer", color: "var(--text2)", display: "flex", alignItems: "center", gap: 6, fontWeight: 500 }}>
          <ChevronLeft size={16} /> Dashboard
        </button>
      </div>

      <div className="page-header" style={{ marginBottom: '32px' }}>
        <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '28px', color: 'var(--text1)' }}>
          <span className="page-title-icon" style={{ background: 'var(--indigo-l)', color: 'var(--indigo)', padding: '10px', borderRadius: '12px', display: 'flex' }}><Video size={24} /></span>
          <span>Virtual Classroom</span>
        </h1>
        <p className="page-sub" style={{ color: 'var(--text2)', marginTop: '8px', fontSize: '15px' }}>Join your scheduled and live lecture sessions.</p>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '64px', color: 'var(--text3)' }}><div className="spinner" style={{ marginBottom: '16px' }}/><p>Syncing sessions...</p></div>
      ) : (activeMeeting || activePlacementMeeting) ? (
        <div className="meetings-grid" style={{ display: "grid", gap: "20px", gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
          {activeMeeting && (
            <div style={{ background: 'var(--surface2)', borderRadius: '16px', padding: '24px', borderLeft: '4px solid var(--indigo)', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ background: 'rgba(91,78,248,0.1)', color: 'var(--indigo)', display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 600 }}>
                  <span style={{ width: 8, height: 8, background: 'var(--indigo)', borderRadius: '50%', boxShadow: '0 0 8px var(--indigo)' }}></span> LIVE
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--text3)' }}>
                  <Clock size={14} /> {new Date(activeMeeting.started_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
              <div>
                <div style={{ background: 'var(--surface3)', color: 'var(--text2)', padding: '4px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: '700', width: 'fit-content', marginBottom: '8px' }}>CLASSROOM SESSION</div>
                <h2 style={{ fontSize: '20px', color: 'var(--text1)', marginBottom: '8px' }}>{activeMeeting.course_name}</h2>
                <p style={{ color: 'var(--text2)', fontSize: '14px', marginBottom: '24px' }}>Instructor: <strong style={{color:'var(--text1)'}}>{activeMeeting.faculty_name}</strong></p>
                <div>
                  <button onClick={() => setJoined(true)} style={{ background: 'var(--indigo)', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 500, width: '100%', justifyContent: 'center' }}>
                    <Video size={18} /> Join Now
                  </button>
                </div>
              </div>
            </div>
          )}

          {activePlacementMeeting && (
            <div style={{ background: 'var(--surface2)', borderRadius: '16px', padding: '24px', borderLeft: '4px solid var(--teal)', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ background: 'rgba(39,201,176,0.1)', color: 'var(--teal)', display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 600 }}>
                  <span style={{ width: 8, height: 8, background: 'var(--teal)', borderRadius: '50%', boxShadow: '0 0 8px var(--teal)' }}></span> LIVE
                </div>
              </div>
              <div>
                <div style={{ background: 'rgba(39,201,176,0.1)', color: 'var(--teal)', padding: '4px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: '700', width: 'fit-content', marginBottom: '8px' }}>PLACEMENT BRIEFING</div>
                <h2 style={{ fontSize: '20px', color: 'var(--text1)', marginBottom: '8px' }}>{activePlacementMeeting.department} Placement Session</h2>
                <p style={{ color: 'var(--text2)', fontSize: '14px', marginBottom: '24px' }}>Officer: <strong style={{color:'var(--text1)'}}>{activePlacementMeeting.officer_name}</strong></p>
                <div>
                  <button onClick={() => onNavigate("Placement Meetings")} style={{ background: 'var(--teal)', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 500, width: '100%', justifyContent: 'center' }}>
                    <Video size={18} /> Join Placement Session
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div style={{ background: 'var(--surface2)', borderRadius: '16px', padding: '64px 24px', textAlign: 'center', border: '1px dashed var(--border)', color: 'var(--text3)', maxWidth: '600px', margin: '0 auto' }}>
          <div style={{ background: 'var(--surface3)', padding: '20px', borderRadius: '50%', display: 'inline-flex', marginBottom: '20px' }}>
            <Video size={48} />
          </div>
          <h3 style={{ color: 'var(--text1)', fontSize: '18px', marginBottom: '8px' }}>Quiet Classroom</h3>
          <p style={{ maxWidth: '400px', margin: '0 auto', fontSize: '14px', lineHeight: 1.5 }}>There are no live meetings for your section right now.</p>
        </div>
      )}
    </div>
  );
}
