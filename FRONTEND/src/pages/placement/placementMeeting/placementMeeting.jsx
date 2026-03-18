import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import { 
  Camera, CameraOff, Mic, MicOff, PhoneOff, 
  Users, Settings, MessageSquare, Monitor,
  MoreVertical, Shield, Activity, Copy, Check,
  Grid, Video, PlayCircle
} from 'lucide-react';
import api from '../../../utils/api';
import './placementMeeting.css';

// ─── REMOTE VIDEO PLAYER ─────────────────────────────────────────────
const RemoteVideoPlayer = ({ stream, label }) => {
  const videoRef = useRef(null);
  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !stream) return;

    const logPrefix = `[PlacementPlayer:${label || stream.id.slice(0,5)}]`;
    if (video.srcObject !== stream) {
      console.log(`${logPrefix} Attaching stream (${stream.getTracks().length} tracks)`);
      video.srcObject = stream;
    }

    const playVideo = async () => {
      try {
        await video.play();
        console.log(`${logPrefix} Playback started (muted: ${video.muted})`);
      } catch (err) {
        if (err.name !== 'AbortError') console.warn(`${logPrefix} Playback failed:`, err.message);
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
        style={{ width: '100%', height: '100%', objectFit: 'cover', backgroundColor: '#000' }}
      />
      {isMuted && (
        <button
          onClick={() => setIsMuted(false)}
          className="unmute-btn"
          style={{
            position: 'absolute', bottom: '20px', right: '20px',
            padding: '8px 16px', backgroundColor: 'rgba(99,102,241,0.9)',
            color: 'white', border: 'none', borderRadius: '20px',
            fontSize: '12px', fontWeight: '600', cursor: 'pointer',
            zIndex: 10, display: 'flex', alignItems: 'center', gap: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)'
          }}
        >
          <Mic size={14} /> Unmute {label || 'Student'}
        </button>
      )}
    </div>
  );
};

// ─── PLACEMENT OFFICER MEETING ROOM ──────────────────────────────────
function PlacementMeetingRoom({ meeting, onEnd }) {
  const localVideoRef = useRef(null);
  const socketRef = useRef(null);
  const peersRef = useRef({});
  const localStreamRef = useRef(null);
  const iceCandidateQueue = useRef({});
  const signalingProcessing = useRef({});
  const pendingConnections = useRef(new Set());
  const initDone = useRef(false);
  const timerRef = useRef(null);
  const curRef = useRef(null);
  const ringRef = useRef(null);
  const mx = useRef(0), my = useRef(0);
  const tx = useRef(0), ty = useRef(0);
  const rafRef = useRef(null);

  const [localStream, setLocalStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState({});
  const [studentNames, setStudentNames] = useState({});
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [activeTab, setActiveTab] = useState('participants');
  const [sockStatus, setSockStatus] = useState('Connecting...');
  const [copied, setCopied] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const chatEndRef = useRef(null);

  const rtcConfig = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };

  // Custom cursor
  useEffect(() => {
    const onMove = (e) => {
      mx.current = e.clientX; my.current = e.clientY;
      if (curRef.current) { curRef.current.style.left = `${e.clientX}px`; curRef.current.style.top = `${e.clientY}px`; }
    };
    window.addEventListener('mousemove', onMove);
    const tick = () => {
      tx.current += (mx.current - tx.current) * 0.15;
      ty.current += (my.current - ty.current) * 0.15;
      if (ringRef.current) { ringRef.current.style.left = `${tx.current}px`; ringRef.current.style.top = `${ty.current}px`; }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { window.removeEventListener('mousemove', onMove); cancelAnimationFrame(rafRef.current); };
  }, []);

  useEffect(() => {
    if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Main init
  useEffect(() => {
    if (initDone.current) return;
    initDone.current = true;

    timerRef.current = setInterval(() => setElapsed(s => s + 1), 1000);

    const init = async () => {
      let stream = null;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setLocalStream(stream);
        localStreamRef.current = stream;
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;
      } catch (e) {
        console.error('[PlacementOfficer] Camera denied:', e);
      }

      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const officerName = user.name || user.email || 'Officer';

      socketRef.current = io('http://localhost:8000', { transports: ['websocket'] });
      const s = socketRef.current;

      s.on('connect', () => {
        setSockStatus('Connected');
        s.emit('join_room', { room_code: meeting.room_code, role: 'faculty', name: officerName });
      });

      s.on('disconnect', () => setSockStatus('Disconnected'));

      s.on('chat_message', (msg) => {
        setMessages(prev => [...prev, msg]);
      });

      s.on('student_joined', async ({ student_id, student_name }) => {
        console.log('[PlacementOfficer] Student joined:', student_id);
        setStudentNames(prev => ({ ...prev, [student_id]: student_name || `Student ${student_id.slice(0,4)}` }));
        if (!peersRef.current[student_id] && !pendingConnections.current.has(student_id)) {
          pendingConnections.current.add(student_id);
          await createPeerConnection(student_id, stream);
          pendingConnections.current.delete(student_id);
        }
      });

      s.on('room_state', async ({ students }) => {
        if (students && students.length > 0) {
          for (const student_id of students) {
            if (student_id !== s.id && !peersRef.current[student_id] && !pendingConnections.current.has(student_id)) {
              pendingConnections.current.add(student_id);
              await createPeerConnection(student_id, stream);
              pendingConnections.current.delete(student_id);
            }
          }
        }
      });

      s.on('signal', async (data) => {
        const { from, signal } = data;
        const peer = peersRef.current[from];
        if (!peer) return;

        try {
          if (signal.type === 'answer') {
            if (peer.signalingState !== 'have-local-offer') {
              console.log('[PlacementOfficer] Ignoring answer in state:', peer.signalingState);
              return;
            }
            if (signalingProcessing.current[from]) return;
            signalingProcessing.current[from] = true;
            console.log('[PlacementOfficer] Setting remote answer for:', from);
            await peer.setRemoteDescription(new RTCSessionDescription(signal));
            const queue = iceCandidateQueue.current[from] || [];
            while (queue.length > 0) await peer.addIceCandidate(queue.shift()).catch(() => {});
            delete iceCandidateQueue.current[from];
            signalingProcessing.current[from] = false;
          } else if (signal.candidate) {
            const cand = new RTCIceCandidate(signal);
            if (peer.remoteDescription && peer.remoteDescription.type) {
              await peer.addIceCandidate(cand).catch(() => {});
            } else {
              if (!iceCandidateQueue.current[from]) iceCandidateQueue.current[from] = [];
              iceCandidateQueue.current[from].push(cand);
            }
          }
        } catch (err) {
          console.error('[PlacementOfficer] Signal error:', err);
          signalingProcessing.current[from] = false;
        }
      });

      s.on('student_disconnected', ({ student_id }) => {
        if (peersRef.current[student_id]) { peersRef.current[student_id].close(); delete peersRef.current[student_id]; }
        setRemoteStreams(prev => { const n = { ...prev }; delete n[student_id]; return n; });
        setStudentNames(prev => { const n = { ...prev }; delete n[student_id]; return n; });
      });
    };

    init();

    return () => {
      clearInterval(timerRef.current);
      if (localStreamRef.current) { localStreamRef.current.getTracks().forEach(t => t.stop()); localStreamRef.current = null; }
      if (socketRef.current) socketRef.current.disconnect();
      Object.values(peersRef.current).forEach(p => p.close());
    };
  }, []);

  useEffect(() => {
    if (localVideoRef.current && localStream) localVideoRef.current.srcObject = localStream;
  }, [localStream]);

  const createPeerConnection = async (studentId, stream) => {
    if (peersRef.current[studentId]) {
      const pc = peersRef.current[studentId];
      if (pc.connectionState === 'connected' || pc.connectionState === 'connecting') {
        console.log('[PlacementOfficer] Peer active, skipping:', studentId);
        return;
      }
      pc.close();
    }

    console.log('[PlacementOfficer] Initializing PeerConnection for:', studentId);
    const peer = new RTCPeerConnection(rtcConfig);
    peersRef.current[studentId] = peer;

    peer.onconnectionstatechange = () => console.log(`[PlacementOfficer] ${studentId.slice(0,8)} connState:`, peer.connectionState);
    peer.oniceconnectionstatechange = () => console.log(`[PlacementOfficer] ${studentId.slice(0,8)} iceState:`, peer.iceConnectionState);

    const currentStream = stream || localStreamRef.current;
    if (currentStream) currentStream.getTracks().forEach(t => peer.addTrack(t, currentStream));

    peer.ontrack = (event) => {
      console.log('[PlacementOfficer] Track from:', studentId, event.track.kind);
      setRemoteStreams(prev => {
        const existing = prev[studentId]?.stream;
        if (existing) {
          if (!existing.getTracks().find(t => t.id === event.track.id)) {
            existing.addTrack(event.track);
            return { ...prev, [studentId]: { ...prev[studentId], stream: new MediaStream(existing.getTracks()) } };
          }
          return prev;
        }
        return { ...prev, [studentId]: { stream: event.streams[0] || new MediaStream([event.track]) } };
      });
    };

    peer.onicecandidate = (event) => {
      if (event.candidate) {
        socketRef.current.emit('signal', { room_code: meeting.room_code, to: studentId, signal: event.candidate });
      }
    };

    try {
      const offer = await peer.createOffer();
      await peer.setLocalDescription(offer);
      socketRef.current.emit('signal', { room_code: meeting.room_code, to: studentId, signal: peer.localDescription });
    } catch (err) {
      console.error('[PlacementOfficer] Offer error:', err);
    }
  };

  const toggleMic = () => {
    localStream?.getAudioTracks().forEach(t => { t.enabled = !micOn; });
    setMicOn(m => !m);
  };
  const toggleCam = () => {
    localStream?.getVideoTracks().forEach(t => { t.enabled = !camOn; });
    setCamOn(c => !c);
  };
  const toggleScreenShare = async () => {
    try {
      if (!isScreenSharing) {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        const videoTrack = screenStream.getVideoTracks()[0];
        Object.values(peersRef.current).forEach(peer => {
          const sender = peer.getSenders().find(s => s.track && s.track.kind === 'video');
          if (sender) sender.replaceTrack(videoTrack);
        });
        if (localVideoRef.current) localVideoRef.current.srcObject = screenStream;
        setIsScreenSharing(true);
        videoTrack.onended = () => stopScreenShare();
      } else {
        stopScreenShare();
      }
    } catch (err) { console.error('[PlacementOfficer] Screen share error:', err); }
  };
  const stopScreenShare = () => {
    if (!localStream) return;
    const videoTrack = localStream.getVideoTracks()[0];
    Object.values(peersRef.current).forEach(peer => {
      const sender = peer.getSenders().find(s => s.track && s.track.kind === 'video');
      if (sender) sender.replaceTrack(videoTrack);
    });
    if (localVideoRef.current) localVideoRef.current.srcObject = localStream;
    setIsScreenSharing(false);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/studentdashboard?room=${meeting.room_code}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const formatTime = (s) => {
    const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
    return `${h > 0 ? h + ':' : ''}${m < 10 ? '0' + m : m}:${sec < 10 ? '0' + sec : sec}`;
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !socketRef.current) return;
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const msgData = {
      room_code: meeting.room_code,
      sender: user.name || user.email || 'Officer',
      text: newMessage,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    socketRef.current.emit('chat_message', msgData);
    setMessages(prev => [...prev, { ...msgData, isMine: true }]);
    setNewMessage('');
  };

  return (
    <div className="placement-meeting-container">
      <div className="sc-cursor" ref={curRef} style={{ zIndex: 99999 }} />
      <div className="sc-cursor-ring" ref={ringRef} style={{ zIndex: 99999 }} />
      <div className="sc-noise" />

      {/* Header */}
      <div className="meeting-header">
        <div className="left-section">
          <div className="live-pill"><span className="pulse"></span>LIVE SESSION</div>
          <div className="meeting-info">
            <h1>{meeting.course_name || meeting.department || 'Placement Session'}</h1>
            <span className="room-code">Room: {meeting.room_code}</span>
          </div>
        </div>
        <div className="center-section">
          <div className="timer-badge"><Activity size={16} />{formatTime(elapsed)}</div>
        </div>
        <div className="right-section">
          <button className="btn btn-ghost" onClick={copyLink} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? 'Copied' : 'Copy Link'}
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
            <div className="remote-grid">
              {Object.entries(remoteStreams).map(([id, data]) => (
                <div key={id} className="remote-tile">
                  <RemoteVideoPlayer stream={data.stream} label={studentNames[id] || id.slice(0,4)} />
                  <div className="tile-overlay">
                    <span className="user-label">{studentNames[id] || id}</span>
                  </div>
                </div>
              ))}
              {Object.keys(remoteStreams).length === 0 && (
                <div className="empty-grid-placeholder">
                  <div className="placeholder-content">
                    <Users size={48} />
                    <p>Waiting for students to join...</p>
                    <span className="invite-hint">Room code: <b>{meeting.room_code}</b></span>
                  </div>
                </div>
              )}
            </div>
            <div className={`local-tile ${Object.keys(remoteStreams).length > 0 ? 'pip' : 'full'}`}>
              <video muted autoPlay playsInline ref={localVideoRef} className={!camOn && !isScreenSharing ? 'hidden' : ''} />
              {!camOn && !isScreenSharing && <div className="avatar-placeholder"><div className="avatar">PO</div></div>}
              <div className="tile-overlay">
                <span className="user-label">{isScreenSharing ? 'You (Presenting)' : 'You (Officer)'}</span>
                {!micOn && <MicOff size={14} className="status-icon" />}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="meeting-sidebar">
          <div className="sidebar-tabs">
            <button className={`tab-btn ${activeTab === 'participants' ? 'active' : ''}`} onClick={() => setActiveTab('participants')}>
              <Users size={18} /><span>Students ({Object.keys(remoteStreams).length})</span>
            </button>
            <button className={`tab-btn ${activeTab === 'chat' ? 'active' : ''}`} onClick={() => setActiveTab('chat')}>
              <MessageSquare size={18} /><span>Chat</span>
            </button>
          </div>
          <div className="tab-content">
            {activeTab === 'participants' && (
              <div className="participants-list">
                <div className="participant-item me">
                  <div className="p-avatar">PO</div>
                  <div className="p-info">
                    <span className="name">You (Placement Officer)</span>
                    <span className="role">Organizer</span>
                  </div>
                  <div className="p-actions"><Shield size={16} className="mod-icon" /></div>
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
            <Monitor size={22} /><span className="label">{isScreenSharing ? 'Stop Share' : 'Present'}</span>
          </button>
          <button className="ctrl-btn danger end-call" onClick={() => {
            if (localStreamRef.current) { localStreamRef.current.getTracks().forEach(t => t.stop()); localStreamRef.current = null; }
            if (socketRef.current) { socketRef.current.disconnect(); socketRef.current = null; }
            Object.values(peersRef.current).forEach(p => p.close());
            peersRef.current = {};
            onEnd();
          }}>
            <PhoneOff size={24} /><span>End Session</span>
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

// ─── MAIN EXPORT: Setup + Room ────────────────────────────────────────
export default function PlacementMeeting() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const roomCodeFromUrl = queryParams.get('room');

  const [liveMeeting, setLiveMeeting] = useState(roomCodeFromUrl ? { room_code: roomCodeFromUrl, course_name: queryParams.get('group') || 'Placement Session' } : null);
  const [availableGroups, setAvailableGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [loadingGroups, setLoadingGroups] = useState(!roomCodeFromUrl);
  const [launching, setLaunching] = useState(false);

  const curRef = useRef(null);
  const ringRef = useRef(null);
  const mx = useRef(0), my = useRef(0);
  const tx = useRef(0), ty = useRef(0);
  const rafRef = useRef(null);

  useEffect(() => {
    const onMove = (e) => {
      mx.current = e.clientX; my.current = e.clientY;
      if (curRef.current) { curRef.current.style.left = `${e.clientX}px`; curRef.current.style.top = `${e.clientY}px`; }
    };
    window.addEventListener('mousemove', onMove);
    const tick = () => {
      tx.current += (mx.current - tx.current) * 0.15;
      ty.current += (my.current - ty.current) * 0.15;
      if (ringRef.current) { ringRef.current.style.left = `${tx.current}px`; ringRef.current.style.top = `${ty.current}px`; }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { window.removeEventListener('mousemove', onMove); cancelAnimationFrame(rafRef.current); };
  }, []);

  useEffect(() => {
    if (!liveMeeting) {
      const fetchGroups = async () => {
        try {
          const res = await api.get('/placement/meetings/groups');
          const groups = res.data || res;
          setAvailableGroups(groups);
          if (groups.length > 0) setSelectedGroup(groups[0]);
        } catch (err) { console.error('Failed to fetch groups:', err); }
        finally { setLoadingGroups(false); }
      };
      fetchGroups();
    }
  }, [liveMeeting]);

  const handleLaunch = async () => {
    if (!selectedGroup) return;
    setLaunching(true);
    try {
      const res = await api.post('/placement/meetings/start', { course_id: selectedGroup.id });
      const data = res.data || res;
      const newUrl = `${window.location.pathname}?room=${data.room_code}&group=${encodeURIComponent(data.course_name || selectedGroup.name)}`;
      window.history.pushState({}, '', newUrl);
      setLiveMeeting(data);
    } catch (err) {
      alert('Failed to start meeting: ' + (err.response?.data?.detail || err.message));
    } finally { setLaunching(false); }
  };

  const handleEnd = async () => {
    if (!window.confirm('End this placement session for all students?')) return;
    try {
      const key = liveMeeting?.group_key || queryParams.get('group') || 'CS';
      await api.post('/placement/meetings/end', { group_key: key });
    } catch (err) { console.error('Failed to end on backend:', err); }
    navigate('/placementdashboard');
  };

  if (liveMeeting) {
    return <PlacementMeetingRoom meeting={liveMeeting} onEnd={handleEnd} />;
  }

  // ── SETUP SCREEN ──────────────────────────────────────────────────
  return (
    <div className="placement-meeting-container setup-mode">
      <div className="sc-cursor" ref={curRef} style={{ zIndex: 99999 }} />
      <div className="sc-cursor-ring" ref={ringRef} style={{ zIndex: 99999 }} />
      <div className="sc-noise" />

      <div className="setup-panel">
        <div className="setup-header">
          <div className="setup-icon-ring"><Video size={32} color="var(--teal)" /></div>
          <h2>Virtual Placement Briefing</h2>
          <p>Select a student group to start a live video session.</p>
        </div>

        <div className="setup-body">
          {loadingGroups ? (
            <div className="loading-groups">
              <div className="spinner"></div>
              <span>Loading eligible groups...</span>
            </div>
          ) : (
            <div className="group-selector">
              <label>Select Target Group</label>
              <div className="group-grid">
                {availableGroups.map(g => (
                  <div
                    key={g.id}
                    className={`group-card ${selectedGroup?.id === g.id ? 'active' : ''}`}
                    onClick={() => setSelectedGroup(g)}
                  >
                    <div className="group-tag" style={{ background: g.color || 'var(--indigo-l)' }}>{g.code}</div>
                    <div className="group-info">
                      <span className="group-name">{g.name}</span>
                      <span className="group-count">{g.student_count} Students</span>
                    </div>
                    <div className="selection-indicator">
                      {selectedGroup?.id === g.id && <div className="dot" />}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="setup-tips">
            <div className="tip"><Shield size={16} /><span>Session visible only to selected group.</span></div>
            <div className="tip"><Activity size={16} /><span>WebRTC signaling handled automatically.</span></div>
          </div>
        </div>

        <div className="setup-footer">
          <button className="btn btn-ghost" onClick={() => navigate('/placementdashboard')}>Cancel</button>
          <button className="btn btn-solid" disabled={!selectedGroup || launching} onClick={handleLaunch}>
            {launching ? 'Launching...' : <><PlayCircle size={18} /> Launch Session</>}
          </button>
        </div>
      </div>
    </div>
  );
}
