import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import WebSocketTester from './components/WebSocketTester';
import SseTester from './components/SseTester';
import { fetchPublicWorkspace, createWorkspace, fetchCurrentUser, fetchMyWorkspaces, deleteWorkspace, changeWorkspaceMode } from './services/api';
import './App.css';
import { useNavigate } from 'react-router-dom';
import headerImage from './assets/header_img.png';

function App() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [activeWorkspace, setActiveWorkspace] = useState(null);
  const [myWorkspaces, setMyWorkspaces] = useState([]);
  const [createRoomCode,setCreateRoomCode] = useState('');
  
  // Theme state
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  // Handle OAuth Login Errors
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('error') === 'oauth_failed') {
      alert("Google Login failed or was canceled. Please try again.");
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // Automatically upgrade to broadcaster if the user session loads AFTER joining
  useEffect(() => {
    if (user && activeWorkspace && user.id === activeWorkspace.ownerId) {
      setJoinAsBroadcaster(true);
    }
  }, [user, activeWorkspace]);

  // Join form state
  const [joinSlug, setJoinSlug] = useState('');
  const [joinAsBroadcaster, setJoinAsBroadcaster] = useState(false);
  const [joinError, setJoinError] = useState('');

  // Create form state
  const [createTitle, setCreateTitle] = useState('');
  const [createMode, setCreateMode] = useState('COLLABORATIVE');
  const [createError, setCreateError] = useState('');

  useEffect(() => {
    fetchCurrentUser()
      .then(setUser)
      .catch(() => setUser(null));
  }, []);

  useEffect(() => {
    if (user) {
      fetchMyWorkspaces()
        .then(setMyWorkspaces)
        .catch(console.error);
    } else {
      setMyWorkspaces([]);
    }
  }, [user]);

  const joinSpecificWorkspace = async (slug) => {
    try {
      setJoinError('');
      const data = await fetchPublicWorkspace(slug);
      setActiveWorkspace(data);
      if (user && data && user.id === data.ownerId) {
        setJoinAsBroadcaster(true);
      }
    } catch (err) {
      setJoinError('Failed to join workspace. Please check the ID.');
    }
    navigate(`/room/${slug}`);
  };

  const handleJoin = (e) => {
    e.preventDefault();
    if (!joinSlug) return;
    joinSpecificWorkspace(joinSlug);
  };

   const handleCreate = async (e) => {
    e.preventDefault();
    if (!createTitle || !createRoomCode) return;
    try {
      setCreateError('');
      const data = await createWorkspace({ 
         title: createTitle, 
         language: 'plaintext', 
         mode: createMode,
         roomCode: createRoomCode 
      });
      
      setJoinAsBroadcaster(true);
      setActiveWorkspace(data);
      setMyWorkspaces((prev) => [...prev, data]);
      navigate(`/room/${data.publicSlug}`);
    } catch (err) {
      let msg = err.message || 'Failed to create workspace.';
      const lowerMsg = msg.toLowerCase();
      // Catch duplicate key database exceptions gracefully
      if (lowerMsg.includes('duplicate') || lowerMsg.includes('already exists') || lowerMsg.includes('constraint') || lowerMsg.includes('internal server error')) {
         msg = 'A workspace with this URL Slug already exists! Please choose a different Custom Room Code.';
      }
      setCreateError(msg);
    }
  };

  const handleDeleteWorkspace = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this workspace?")) return;
    try {
      await deleteWorkspace(id);
      setMyWorkspaces((prev) => prev.filter(ws => ws.id !== id));
      if (activeWorkspace && activeWorkspace.id === id) {
        setActiveWorkspace(null);
        navigate('/');
      }
    } catch (err) {
      alert("Failed to delete workspace.");
    }
  };

  const handleToggleMode = async (ws) => {
    const newMode = ws.mode === 'READ_ONLY' ? 'COLLABORATIVE' : 'READ_ONLY';
    try {
      const updatedWs = await changeWorkspaceMode(ws.id, newMode);
      setMyWorkspaces((prev) => prev.map(w => w.id === ws.id ? updatedWs : w));
      if (activeWorkspace && activeWorkspace.id === ws.id) {
        setActiveWorkspace(updatedWs);
      }
    } catch (err) {
      alert("Failed to change workspace mode.");
    }
  };

  const leaveWorkspace = () => {
    setActiveWorkspace(null);
    setJoinAsBroadcaster(false); 
    navigate('/');
  };

  // Support direct URL hits
  useEffect(() => {
    const path = window.location.pathname;
    if (path.startsWith('/room/')) {
      const slug = path.split('/')[2];
      if (slug && !activeWorkspace) {
        fetchPublicWorkspace(slug)
          .then(data => {
            setActiveWorkspace(data);
          })
          .catch(err => {
            console.error("Failed to load room directly:", err);
            alert("Error: Room '" + slug + "' does not exist or could not be loaded!");
            navigate('/');
          });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="app-container">
      {/* 3D Background Elements */}
      <div className="ambient-background">
        <div className="ambient-shape shape-1"></div>
        <div className="ambient-shape shape-2"></div>
        <div className="ambient-shape shape-3"></div>
      </div>

      <header className="app-header">
        <div className="header-content">
          <div className="header-left">
            <div className="logo-container" onClick={() => navigate('/')}>
              <img src={headerImage} alt="CodeShare Logo" className="logo-image" />
            </div>
          </div>
          <div className="header-actions">
            <button className="theme-toggle-btn" onClick={toggleTheme} aria-label="Toggle Theme">
              {theme === 'dark' ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
              )}
            </button>
            <Login user={user} setUser={setUser} />
          </div>
        </div>
      </header>

      <main className="app-main">
        {!activeWorkspace ? (
          <div className="landing-container">
            <div className="hero-section">
              <h2 className="hero-title">Developer Collaboration,<br/>Elevated.</h2>
              <p className="hero-subtitle">Instantly create high-performance workspaces, share code in real-time, and collaborate with zero friction.</p>
            </div>

            <div className="dashboard">
              <div className="card tilt-card">
                <div className="card-header-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h6v6"></path><path d="M10 14 21 3"></path><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path></svg>
                </div>
                <h3>Join Workspace</h3>
                <p>Enter a workspace ID or slug to instantly join an active session.</p>
                <form onSubmit={handleJoin} className="form-group-col">
                  <div className="input-wrapper">
                    <label>Workspace Identifier</label>
                    <input 
                      type="text" 
                      placeholder="e.g., my-cool-room" 
                      value={joinSlug}
                      onChange={(e) => setJoinSlug(e.target.value)}
                      className="input-field"
                    />
                  </div>
                  {user && activeWorkspace && user.id === activeWorkspace.ownerId && activeWorkspace.mode === 'READ_ONLY' && (
                    <label className="checkbox-label">
                      <input 
                        type="checkbox" 
                        checked={joinAsBroadcaster} 
                        onChange={(e) => setJoinAsBroadcaster(e.target.checked)} 
                      />
                      <span>Join as Broadcaster (Owner Only)</span>
                    </label>
                  )}
                  <button type="submit" className="btn btn-primary btn-block">Join Session</button>
                </form>
                {joinError && <p className="error-text">{joinError}</p>}
              </div>

              <div className="card tilt-card">
                <div className="card-header-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                </div>
                <h3>Create Workspace</h3>
                <p>Initialize a new real-time environment for your team.</p>
                {!user ? (
                  <div className="alert alert-info">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                    Authentication required to spawn new workspaces.
                  </div>
                ) : (
                  <form onSubmit={handleCreate} className="form-group-col">
                    <div className="input-wrapper">
                      <label>Workspace Title</label>
                      <input 
                        type="text" 
                        placeholder="e.g., Backend Architecture" 
                        value={createTitle}
                        onChange={(e) => setCreateTitle(e.target.value)}
                        className="input-field"
                        required
                      />
                    </div>
                    <div className="input-wrapper">
                      <label>Custom Room Code (URL Slug)</label>
                      <input 
                        type="text" 
                        placeholder="e.g., prod-api-v2" 
                        value={createRoomCode}
                        onChange={(e) => setCreateRoomCode(e.target.value)}
                        className="input-field"
                        required
                      />
                    </div>
                    <div className="input-wrapper">
                      <label>Infrastructure Mode</label>
                      <select 
                        value={createMode} 
                        onChange={(e) => setCreateMode(e.target.value)}
                        className="input-field select-field"
                      >
                        <option value="COLLABORATIVE">WebSocket (Multiplayer Editing)</option>
                        <option value="READ_ONLY">SSE (Broadcast / View-Only)</option>
                      </select>
                    </div>
                    <button type="submit" className="btn btn-success btn-block">Initialize Workspace</button>
                    {createError && <p className="error-text">{createError}</p>}
                  </form>
                )}
              </div>
            </div>

            {user && (
              <div className="workspaces-section">
                <div className="section-header">
                  <h3>My Workspaces</h3>
                  <p>Manage your active development environments.</p>
                </div>
                
                {myWorkspaces.length === 0 ? (
                  <div className="alert alert-info empty-state">
                    You haven't initialized any workspaces yet. Create one above to get started.
                  </div>
                ) : (
                  <div className="workspace-grid">
                    {myWorkspaces.map(ws => (
                      <div key={ws.id} className="workspace-item card tilt-card">
                        <div className="ws-item-header">
                          <div className="ws-item-title-group">
                            <h4>{ws.title}</h4>
                            <span className="ws-slug-chip">{ws.publicSlug}</span>
                          </div>
                          <span className={`badge ${ws.mode === 'READ_ONLY' ? 'badge-sse' : 'badge-ws'}`}>
                            {ws.mode === 'READ_ONLY' ? 'SSE MODE' : 'WS MODE'}
                          </span>
                        </div>
                        <div className="ws-item-actions">
                          <button 
                            className="btn btn-sm btn-outline"
                            onClick={() => joinSpecificWorkspace(ws.publicSlug)}
                          >
                            Open Session
                          </button>
                          <button 
                            className="btn btn-sm btn-ghost"
                            onClick={() => handleToggleMode(ws)}
                          >
                            Switch to {ws.mode === 'READ_ONLY' ? 'WS' : 'SSE'}
                          </button>
                          <div className="spacer"></div>
                          <button 
                            className="btn btn-sm btn-danger-ghost"
                            onClick={() => handleDeleteWorkspace(ws.id)}
                            aria-label="Delete Workspace"
                          >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="workspace-area">
            <div className="workspace-header">
              <div className="workspace-info">
                <div className="workspace-title-group">
                  <h2>{activeWorkspace.title}</h2>
                  <span className="workspace-slug-tag">{activeWorkspace.publicSlug}</span>
                </div>
                <div className="status-indicators">
                  <span className={`badge ${activeWorkspace.mode === 'READ_ONLY' ? 'badge-sse' : 'badge-ws'}`}>
                    <span className="status-dot pulsing"></span>
                    {activeWorkspace.mode === 'READ_ONLY' ? 'SSE BROADCAST' : 'WEBSOCKET ACTIVE'}
                  </span>
                </div>
              </div>
              <div className="workspace-actions">
                <button onClick={leaveWorkspace} className="btn btn-danger btn-sm">
                  Leave Workspace
                </button>
              </div>
            </div>
            
            <div className="workspace-content">
              {activeWorkspace.mode === 'READ_ONLY' && !joinAsBroadcaster ? (
                <SseTester defaultWorkspaceId={activeWorkspace.id} initialContent={activeWorkspace.content} theme={theme} />
              ) : (
                <WebSocketTester defaultWorkspaceId={activeWorkspace.id} initialContent={activeWorkspace.content} theme={theme} />
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
