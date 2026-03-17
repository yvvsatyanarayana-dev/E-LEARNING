import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import api from '../../../utils/api';
import { 
  Camera, CameraOff, Mic, MicOff, PhoneOff, 
  Users, Settings, MessageSquare, Monitor,
  MoreVertical, Shield, Activity, Video
} from 'lucide-react';
import '../../placement/placementMeeting/placementMeeting.css';

const SOCKET_URL = 'http://localhost:8000';

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
          <Mic size={14} /> Unmute {label || 'Officer'}
        </button>
      )}
    </div>
  );
};

// ─── PLACEMENT MEETING ROOM (STUDENT SIDE) ────────────────────────────
function PlacementMeetingRoom({ meeting, onLeave }) {
  const localVideoRef = useRef(null);
  const socketRef = useRef(null);
  const peerRef = useRef(null);
  const localStreamRef = useRef(null);
  const officerIdRef = useRef(null);
  const iceCandidateQueue = useRef([]);
  const isProcessingSignal = useRef(false);
  const lastProcessedOfferSdp = useRef(null);
  const initDone = useRef(false);
  const timerRef = useRef(null);
  const curRef = useRef(null);
  const ringRef = useRef(null);
  const mx = useRef(0), my = useRef(0);
  const tx = useRef(0), ty = useRef(0);
  const rafRef = useRef(null);

  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [officerName, setOfficerName] = useState(meeting.officer_name || 'Placement Officer');
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [elapsed, setElapsed] = useState(0);
  const [activeTab, setActiveTab] = useState('participants');
  const [sockStatus, setSockStatus] = useState('Connecting...');
  const [webrtcStatus, setWebrtcStatus] = useState({ conn: 'new', ice: 'new' });

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
        console.error('[PlacementStudent] Camera denied:', e);
      }

      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const studentName = user.name || user.email || 'Student';

      socketRef.current = io(SOCKET_URL, { transports: ['websocket'] });
      const s = socketRef.current;

      s.on('connect', () => {
        setSockStatus('Connected');
        s.emit('join_room', { room_code: meeting.room_code, role: 'student', name: studentName });
      });

      s.on('disconnect', () => setSockStatus('Disconnected'));

      s.on('room_state', (data) => {
        if (data.faculty) {
          officerIdRef.current = data.faculty;
          if (data.faculty_name) setOfficerName(data.faculty_name);
        }
      });

      s.on('faculty_disconnected', () => {
        alert('The placement officer has ended the session.');
        handleLeave();
      });

      s.on('meeting_ended', () => {
        alert('The placement session has ended.');
        handleLeave();
      });

      s.on('signal', async (data) => {
        const { from, signal } = data;
        if (!officerIdRef.current) officerIdRef.current = from;

        try {
          if (signal.type === 'offer') {
            // SDP deduplication
            if (signal.sdp && signal.sdp === lastProcessedOfferSdp.current) {
              console.log('[PlacementStudent] Dropping duplicate offer (same SDP)');
              return;
            }
            if (peerRef.current && (peerRef.current.connectionState === 'connected' || peerRef.current.connectionState === 'connecting')) {
              console.log('[PlacementStudent] Skipping offer for active peer');
              return;
            }
            if (isProcessingSignal.current) return;

            isProcessingSignal.current = true;
            lastProcessedOfferSdp.current = signal.sdp;
            console.log('[PlacementStudent] Processing offer from officer:', from);
            await handleOffer(from, signal, stream);
            isProcessingSignal.current = false;
          } else if (signal.type === 'answer') {
            if (isProcessingSignal.current) return;
            isProcessingSignal.current = true;
            const peer = peerRef.current;
            if (peer && peer.signalingState === 'have-local-offer') {
              await peer.setRemoteDescription(new RTCSessionDescription(signal));
            }
            isProcessingSignal.current = false;
          } else if (signal.candidate) {
            const cand = new RTCIceCandidate(signal);
            const peer = peerRef.current;
            if (peer && peer.remoteDescription && peer.remoteDescription.type) {
              await peer.addIceCandidate(cand).catch(() => {});
            } else {
              iceCandidateQueue.current.push(cand);
            }
          }
        } catch (err) {
          console.error('[PlacementStudent] Signal error:', err);
          isProcessingSignal.current = false;
        }
      });
    };

    init();

    return () => {
      clearInterval(timerRef.current);
      if (localStreamRef.current) { localStreamRef.current.getTracks().forEach(t => t.stop()); localStreamRef.current = null; }
      if (peerRef.current) { peerRef.current.close(); peerRef.current = null; }
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, []);

  useEffect(() => {
    if (localVideoRef.current && localStream) localVideoRef.current.srcObject = localStream;
  }, [localStream]);

  const handleOffer = async (officerId, offer, stream) => {
    // PROTECT ACTIVE CONNECTION
    if (peerRef.current) {
      if (peerRef.current.connectionState === 'connected' || peerRef.current.connectionState === 'connecting') {
        console.log('[PlacementStudent] Peer active, skipping creation');
        return;
      }
      peerRef.current.close();
    }

    console.log('[PlacementStudent] Initializing PeerConnection');
    const peer = new RTCPeerConnection(rtcConfig);
    peerRef.current = peer;

    peer.onconnectionstatechange = () => {
      console.log('[PlacementStudent] ConnectionState:', peer.connectionState);
      setWebrtcStatus(prev => ({ ...prev, conn: peer.connectionState }));
    };
    peer.oniceconnectionstatechange = () => {
      console.log('[PlacementStudent] ICEState:', peer.iceConnectionState);
      setWebrtcStatus(prev => ({ ...prev, ice: peer.iceConnectionState }));
    };

    const currentStream = stream || localStreamRef.current;
    if (currentStream) currentStream.getTracks().forEach(t => peer.addTrack(t, currentStream));

    peer.ontrack = (event) => {
      console.log('[PlacementStudent] Track received from officer:', event.track.kind);
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
        socketRef.current.emit('signal', {
          room_code: meeting.room_code,
          to: officerId,
          signal: event.candidate
        });
      }
    };

    await peer.setRemoteDescription(new RTCSessionDescription(offer));

    while (iceCandidateQueue.current.length > 0) {
      await peer.addIceCandidate(iceCandidateQueue.current.shift()).catch(() => {});
    }

    const answer = await peer.createAnswer();
    await peer.setLocalDescription(answer);
    socketRef.current.emit('signal', { room_code: meeting.room_code, to: officerId, signal: peer.localDescription });
  };

  const toggleMic = () => {
    localStream?.getAudioTracks().forEach(t => { t.enabled = !micOn; });
    setMicOn(m => !m);
  };
  const toggleCam = () => {
    localStream?.getVideoTracks().forEach(t => { t.enabled = !camOn; });
    setCamOn(c => !c);
  };

  const handleLeave = () => {
    if (localStreamRef.current) { localStreamRef.current.getTracks().forEach(t => t.stop()); localStreamRef.current = null; }
    if (peerRef.current) { peerRef.current.close(); peerRef.current = null; }
    if (socketRef.current) { socketRef.current.disconnect(); socketRef.current = null; }
    setLocalStream(null);
    setRemoteStream(null);
    onLeave();
  };

  const formatTime = (s) => {
    const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
    return `${h > 0 ? h + ':' : ''}${m < 10 ? '0' + m : m}:${sec < 10 ? '0' + sec : sec}`;
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
            <h1>{meeting.department || meeting.course_name} Placement Session</h1>
            <span className="room-code">Room: {meeting.room_code}</span>
          </div>
        </div>
        <div className="center-section">
          <div className="timer-badge"><Activity size={16} />{formatTime(elapsed)}</div>
        </div>
        <div className="right-section">
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
              {remoteStream ? (
                <div className="remote-tile">
                  <RemoteVideoPlayer stream={remoteStream} label={officerName} />
                  <div className="tile-overlay">
                    <span className="user-label">{officerName} (Officer)</span>
                  </div>
                </div>
              ) : (
                <div className="empty-grid-placeholder">
                  <div className="placeholder-content">
                    <Video size={48} />
                    <p>Waiting for officer's camera...</p>
                    <span className="invite-hint">Please stand by for the session to start.</span>
                  </div>
                </div>
              )}
            </div>
            <div className={`local-tile ${remoteStream ? 'pip' : 'full'}`}>
              <video muted autoPlay playsInline ref={localVideoRef} className={!camOn ? 'hidden' : ''} />
              {!camOn && <div className="avatar-placeholder"><div className="avatar">ST</div></div>}
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
            <button className={`tab-btn ${activeTab === 'participants' ? 'active' : ''}`} onClick={() => setActiveTab('participants')}>
              <Users size={18} /><span>Participants</span>
            </button>
            <button className={`tab-btn ${activeTab === 'chat' ? 'active' : ''}`} onClick={() => setActiveTab('chat')}>
              <MessageSquare size={18} /><span>Chat</span>
            </button>
          </div>
          <div className="tab-content">
            {activeTab === 'participants' && (
              <div className="participants-list">
                <div className="participant-item">
                  <div className="p-avatar">PO</div>
                  <div className="p-info">
                    <span className="name">{officerName}</span>
                    <span className="role">Organizer</span>
                  </div>
                  <div className="p-actions"><Shield size={16} className="mod-icon" /></div>
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
              <div className="chat-placeholder"><p>Chat is currently disabled for this session.</p></div>
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
          <button className="ctrl-btn" disabled>
            <Monitor size={22} /><span className="label">Present</span>
          </button>
          <button className="ctrl-btn danger end-call" onClick={handleLeave}>
            <PhoneOff size={24} /><span>Leave</span>
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

// ─── MAIN EXPORT: Lobby + Room ────────────────────────────────────────
export default function StudentPlacementMeetings({ onBack }) {
  const [meeting, setMeeting] = useState(null);
  const [loading, setLoading] = useState(true);
  const [joined, setJoined] = useState(false);

  useEffect(() => {
    const poll = async () => {
      try {
        const res = await api.get('/student/dashboard');
        const d = res.data || res;
        setMeeting(d?.active_placement_meeting || null);
        if (!d?.active_placement_meeting && joined) setJoined(false);
      } catch (e) {
        console.error('Poll error:', e);
      } finally {
        setLoading(false);
      }
    };
    poll();
    const interval = setInterval(poll, 10000);
    return () => clearInterval(interval);
  }, [joined]);

  if (joined && meeting) {
    return <PlacementMeetingRoom meeting={meeting} onLeave={() => setJoined(false)} />;
  }

  return (
    <div className="content student-meetings-page" style={{ padding: '24px' }}>
      <div className="breadcrumb" style={{ marginBottom: '24px' }}>
        <button onClick={onBack} className="btn btn-ghost"
          style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text2)', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 500 }}>
          ← Dashboard
        </button>
      </div>

      <div className="page-header" style={{ marginBottom: '32px' }}>
        <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '28px', color: 'var(--text1)' }}>
          <span className="page-title-icon" style={{ background: 'var(--teal-l)', color: 'var(--teal)', padding: '10px', borderRadius: '12px', display: 'flex' }}>
            <Video size={24} />
          </span>
          <span>Placement Virtual Sessions</span>
        </h1>
        <p className="page-sub" style={{ color: 'var(--text2)', marginTop: '8px', fontSize: '15px' }}>
          Live placement briefings and career sessions with your placement officer.
        </p>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '64px', color: 'var(--text3)' }}>
          <div className="spinner" style={{ marginBottom: '16px' }} />
          <p>Checking for live sessions…</p>
        </div>
      ) : meeting ? (
        <div style={{ background: 'var(--surface2)', borderRadius: '16px', padding: '24px', borderLeft: '4px solid var(--teal)', border: '1px solid var(--border)', maxWidth: '600px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ background: 'rgba(39,201,176,0.1)', color: 'var(--teal)', display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 600 }}>
              <span style={{ width: 8, height: 8, background: 'var(--teal)', borderRadius: '50%', boxShadow: '0 0 8px var(--teal)' }}></span> LIVE
            </div>
            <div style={{ background: 'var(--surface3)', padding: '4px 8px', borderRadius: 4, fontSize: 10, fontWeight: 700, color: 'var(--text3)' }}>
              PLACEMENT BRIEFING
            </div>
          </div>
          <h2 style={{ fontSize: '20px', color: 'var(--text1)', marginBottom: '8px' }}>
            {meeting.department || meeting.course_name} Placement Session
          </h2>
          <p style={{ color: 'var(--text2)', fontSize: '14px', marginBottom: '24px' }}>
            Officer: <strong style={{ color: 'var(--text1)' }}>{meeting.officer_name}</strong>
          </p>
          <button onClick={() => setJoined(true)} style={{ background: 'var(--teal)', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 500 }}>
            <Video size={18} /> Join Session
          </button>
        </div>
      ) : (
        <div style={{ background: 'var(--surface2)', borderRadius: '16px', padding: '64px 24px', textAlign: 'center', border: '1px dashed var(--border)', color: 'var(--text3)', maxWidth: '600px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ background: 'var(--surface3)', padding: '20px', borderRadius: '50%', display: 'inline-flex', marginBottom: '20px' }}>
            <Video size={48} />
          </div>
          <h3 style={{ color: 'var(--text1)', fontSize: '18px', marginBottom: '8px' }}>No Active Placement Sessions</h3>
          <p style={{ maxWidth: '400px', margin: '0 auto', fontSize: '14px', lineHeight: 1.5 }}>
            You'll see a live meeting here when a placement officer starts a session for your department.
          </p>
          <p style={{ fontSize: 12, marginTop: 16, opacity: 0.5 }}>This page refreshes automatically every 10 seconds.</p>
        </div>
      )}
    </div>
  );
}
