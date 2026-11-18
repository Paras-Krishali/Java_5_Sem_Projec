import React, { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import * as Y from 'yjs';
import { MonacoBinding } from 'y-monaco';
import { createStompClient } from '../services/websocket';

// Robust Base64 converters to prevent "Maximum call stack size exceeded" errors
const toBase64 = (arr) => {
  let binary = '';
  const len = arr.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(arr[i]);
  }
  return btoa(binary);
};

const fromBase64 = (str) => {
  const binary = atob(str);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
};

const WebSocketTester = ({ defaultWorkspaceId, initialContent, theme }) => {
  const [status, setStatus] = useState('Disconnected');
  const editorRef = useRef(null);
  const clientRef = useRef(null);
  const ydocRef = useRef(new Y.Doc());
  const bindingRef = useRef(null);
  const saveIntervalRef = useRef(null);
  const subscriptionRef = useRef(null);

  // Load the initial Base64 Database Snapshot into Yjs
  useEffect(() => {
    if (initialContent) {
      try {
        const stateVector = fromBase64(initialContent);
        Y.applyUpdate(ydocRef.current, stateVector);
      } catch (e) {
        // Fallback just in case the DB had old plain-text data
        ydocRef.current.getText('monaco').insert(0, initialContent);
      }
    }
  }, [initialContent]);

  // When tab is closed, send one final guaranteed save snapshot
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (clientRef.current && clientRef.current.connected) {
        const snapshot = Y.encodeStateAsUpdate(ydocRef.current);
        clientRef.current.publish({
          destination: `/app/room/${defaultWorkspaceId}/save`,
          body: JSON.stringify({ type: 'snapshot', data: toBase64(snapshot) })
        });
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [defaultWorkspaceId]);

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    
    // Bind Yjs CRDT math directly to the Monaco Editor
    const ytext = ydocRef.current.getText('monaco');
    bindingRef.current = new MonacoBinding(ytext, editor.getModel(), new Set([editor]), null);

    handleConnect();
  };

  const handleConnect = () => {
    if (clientRef.current && clientRef.current.connected) return;

    setStatus('Connecting...');
    const client = createStompClient(
      () => {
        setStatus('Connected');
        
        // Clean up old subscription if reconnecting
        if (subscriptionRef.current) {
          subscriptionRef.current.unsubscribe();
        }

        // 1. Listen for CRDT Deltas from other users
        subscriptionRef.current = client.subscribe(`/topic/room/${defaultWorkspaceId}`, (msg) => {
          try {
            const payload = JSON.parse(msg.body);
            if (payload.type === 'delta') {
              const update = fromBase64(payload.data);
              Y.applyUpdate(ydocRef.current, update, 'remote');
            }
          } catch (e) {
            console.error("Failed to parse incoming delta", e);
          }
        });

        // 3. Every 5 seconds, send a full Base64 snapshot to Postgres
        if (saveIntervalRef.current) clearInterval(saveIntervalRef.current);
        saveIntervalRef.current = setInterval(() => {
          if (client.connected) {
            const snapshot = Y.encodeStateAsUpdate(ydocRef.current);
            client.publish({
              destination: `/app/room/${defaultWorkspaceId}/save`,
              body: JSON.stringify({ type: 'snapshot', data: toBase64(snapshot) })
            });
          }
        }, 5000);

      },
      (err) => setStatus('Disconnected'),
      (err) => {
        setStatus('Error connecting');
        if (err && err.headers && err.headers.message) {
          alert("Access Denied: " + err.headers.message + " - The workspace mode may have changed.");
          window.location.reload();
        }
      }
    );
    
    // 2. Broadcast our typing Deltas to everyone else (register this ONLY ONCE outside the connect callback)
    const handleYjsUpdate = (update, origin) => {
      if (origin !== 'remote' && clientRef.current && clientRef.current.connected) {
        clientRef.current.publish({
          destination: `/app/room/${defaultWorkspaceId}/edit`,
          body: JSON.stringify({ type: 'delta', data: toBase64(update) })
        });
      }
    };
    
    // Remove old listener if it exists to prevent duplicates
    ydocRef.current.off('update', handleYjsUpdate);
    ydocRef.current.on('update', handleYjsUpdate);

    client.activate();
    clientRef.current = client;
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (saveIntervalRef.current) clearInterval(saveIntervalRef.current);
      if (clientRef.current) clientRef.current.deactivate();
      if (bindingRef.current) bindingRef.current.destroy();
    };
  }, []);

  return (
    <div className="tester-container" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: '8px', background: '#333', color: '#fff', fontSize: '12px', fontWeight: 'bold' }}>
        Status: {status} | Engine: Yjs CRDT + Monaco
      </div>
      <div style={{ flexGrow: 1 }}>
        <Editor
          height="100%"
          defaultLanguage="plaintext"
          theme={theme === 'dark' ? 'vs-dark' : 'light'}
          onMount={handleEditorDidMount}
          options={{ minimap: { enabled: false } }}
        />
      </div>
    </div>
  );
};

export default WebSocketTester;
