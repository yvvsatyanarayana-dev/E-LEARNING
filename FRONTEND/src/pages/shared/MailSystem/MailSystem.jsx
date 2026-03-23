import React, { useState, useEffect } from 'react';
import api from '../../../utils/api';
import './MailSystem.css';


const MailSystem = ({ userRole = 'admin' }) => {
  const [view, setView] = useState('inbox'); // inbox, sent, drafts
  const [messages, setMessages] = useState([]);
  const [selectedMsg, setSelectedMsg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Compose State
  const [showCompose, setShowCompose] = useState(false);
  const [composeData, setComposeData] = useState({ to_email: '', subject: '', body: '' });
  const [userSuggestions, setUserSuggestions] = useState([]);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const endpoint = view === 'inbox' ? '/mail/inbox' : '/mail/sent';
      const res = await api.get(endpoint);
      setMessages(res);
      if (res.length > 0 && !selectedMsg) {
        setSelectedMsg(res[0]);
      }
    } catch (err) {
      console.error("Failed to fetch mail", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [view]);

  const handleSelect = async (msg) => {
    setSelectedMsg(msg);
    if (!msg.is_read && view === 'inbox') {
      try {
        await api.patch(`/mail/${msg.id}/read`);
        setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, is_read: true } : m));
      } catch (err) {
        console.error("Error marking read", err);
      }
    }
  };

  const handleComposeChange = async (e) => {
    const { name, value } = e.target;
    setComposeData(prev => ({ ...prev, [name]: value }));
    
    if (name === 'to_email' && value.length > 2) {
      try {
        const res = await api.get(`/admin/users/search?q=${value}`);
        setUserSuggestions(res);
      } catch (err) {
        console.error("Failed to fetch suggestions", err);
      }
    } else if (name === 'to_email') {
      setUserSuggestions([]);
    }
  };

  const handleSend = async () => {
    try {
      await api.post('/mail/send', composeData);
      setShowCompose(false);
      setComposeData({ to_email: '', subject: '', body: '' });
      if (view === 'sent') fetchMessages();
      alert("Message sent successfully!");
    } catch (err) {
      alert("Failed to send message: " + (err.message || "Unknown error"));
    }
  };

  const filteredMessages = messages.filter(m => 
    m.subject.toLowerCase().includes(search.toLowerCase()) || 
    m.body.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="dashboard-container">
      {/* Standard layout wrappers would go here, for now a simplified layout */}
      <div className="main-content" style={{ padding: 0 }}>
        <div className="mail-container">
          {/* Sidebar */}
          <div className="mail-sidebar">
            <div className="compose-btn-container">
              <button className="btn compose-btn" onClick={() => setShowCompose(true)}>
                <i className="fi fi-rr-edit"></i> Compose
              </button>
            </div>
            <div className={`mail-nav-item ${view === 'inbox' ? 'active' : ''}`} onClick={() => setView('inbox')}>
              <i className="fi fi-rr-inbox"></i> Inbox
            </div>
            <div className={`mail-nav-item ${view === 'sent' ? 'active' : ''}`} onClick={() => setView('sent')}>
              <i className="fi fi-rr-paper-plane"></i> Sent
            </div>
            <div className={`mail-nav-item ${view === 'drafts' ? 'active' : ''}`} onClick={() => setView('drafts')}>
              <i className="fi fi-rr-file-edit"></i> Drafts
            </div>
            <div className="mail-nav-item">
              <i className="fi fi-rr-trash"></i> Trash
            </div>
          </div>

          {/* List Pane */}
          <div className="mail-list-pane">
            <div className="mail-search">
              <input 
                type="text" 
                placeholder="Search messages..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="mail-list">
              {loading ? (
                <div style={{ padding: 20, textAlign: 'center' }}>Loading...</div>
              ) : filteredMessages.length === 0 ? (
                <div style={{ padding: 20, textAlign: 'center', color: 'var(--text3)' }}>No messages found</div>
              ) : (
                filteredMessages.map(msg => (
                  <div 
                    key={msg.id} 
                    className={`mail-card ${selectedMsg?.id === msg.id ? 'active' : ''} ${!msg.is_read && view === 'inbox' ? 'unread' : ''}`}
                    onClick={() => handleSelect(msg)}
                  >
                    <div className="mail-card-header">
                      <span className="mail-card-sender">{view === 'inbox' ? msg.sender_name || 'System' : `To: ${msg.receiver_name}`}</span>
                      <span className="mail-card-date">{new Date(msg.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="mail-card-subject">{msg.subject}</div>
                    <div className="mail-card-preview">{msg.body}</div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Detail Pane */}
          <div className="mail-detail-pane">
            {selectedMsg ? (
              <>
                <div className="mail-detail-header">
                  <div className="mail-detail-subject">{selectedMsg.subject}</div>
                  <div className="mail-detail-meta">
                    <div className="mail-avatar">
                      {(selectedMsg.sender_name || 'S')[0]}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600 }}>{selectedMsg.sender_name}</div>
                      <div style={{ fontSize: 12, color: 'var(--text3)' }}>
                        {new Date(selectedMsg.created_at).toLocaleString()}
                      </div>
                    </div>
                    <div style={{ marginLeft: 'auto' }}>
                      <button className="btn btn-sm btn-ghost"><i className="fi fi-rr-reply"></i></button>
                      <button className="btn btn-sm btn-ghost"><i className="fi fi-rr-trash"></i></button>
                    </div>
                  </div>
                </div>
                <div className="mail-detail-body">
                  {selectedMsg.body}
                </div>
              </>
            ) : (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text3)' }}>
                Select a message to read
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Compose Modal */}
      {showCompose && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'var(--surface)', width: '600px', borderRadius: '16px', border: '1px solid var(--border)', overflow: 'hidden' }}>
            <div style={{ padding: '20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0 }}>New Message</h3>
              <button onClick={() => setShowCompose(false)} className="btn btn-sm btn-ghost">&times;</button>
            </div>
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ position: 'relative' }}>
                <input 
                  autoFocus
                  className="form-control"
                  style={{ width: '100%', background: 'var(--surface2)', border: '1px solid var(--border)', padding: '12px', borderRadius: '8px', color: 'var(--text)' }}
                  placeholder="To (email)"
                  name="to_email"
                  value={composeData.to_email}
                  onChange={handleComposeChange}
                />
                {userSuggestions.length > 0 && (
                  <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '8px', zIndex: 10, marginTop: '4px', overflow: 'hidden' }}>
                    {userSuggestions.map(u => (
                      <div 
                        key={u.id} 
                        style={{ padding: '10px 16px', cursor: 'pointer', borderBottom: '1px solid var(--border)' }}
                        onClick={() => {
                          setComposeData(prev => ({ ...prev, to_email: u.email }));
                          setUserSuggestions([]);
                        }}
                      >
                        <div style={{ fontSize: '14px', fontWeight: 600 }}>{u.full_name}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text3)' }}>{u.email}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <input 
                className="form-control"
                style={{ width: '100%', background: 'var(--surface2)', border: '1px solid var(--border)', padding: '12px', borderRadius: '8px', color: 'var(--text)' }}
                placeholder="Subject"
                name="subject"
                value={composeData.subject}
                onChange={handleComposeChange}
              />
              <textarea 
                className="form-control"
                style={{ width: '100%', minHeight: '300px', background: 'var(--surface2)', border: '1px solid var(--border)', padding: '12px', borderRadius: '8px', color: 'var(--text)', resize: 'none' }}
                placeholder="Message body..."
                name="body"
                value={composeData.body}
                onChange={handleComposeChange}
              />
            </div>
            <div style={{ padding: '20px', background: 'var(--surface2)', textAlign: 'right', display: 'flex', justifyContent: 'space-between' }}>
              <button className="btn" onClick={() => setShowCompose(false)}>Cancel</button>
              <button className="btn" style={{ background: 'var(--teal)', color: 'white' }} onClick={handleSend}>Send Message</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MailSystem;
