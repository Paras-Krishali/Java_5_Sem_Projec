import React, { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import * as Y from 'yjs';
import { MonacoBinding } from 'y-monaco';
import { API_BASE_URL } from '../services/api';

// Helpers to convert Yjs Binary Data <-> Base64 Strings
const fromBase64 = (str) => {
  const binary = atob(str);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
};

const SseTester = ({ defaultWorkspaceId, initialContent, theme }) => {
  const [status, setStatus] = useState('Connecting to Stream...');
  const editorRef = useRef(null);
  const ydocRef = useRef(new Y.Doc());
  const bindingRef = useRef(null);
  const eventSourceRef = useRef(null);

  useEffect(() => {
    if (initialContent) {
      try {
        const stateVector = fromBase64(initialContent);
        Y.applyUpdate(ydocRef.current, stateVector);
      } catch (e) {
        ydocRef.current.getText('monaco').insert(0, initialContent);
      }
    }
  }, [initialContent]);

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    
    const ytext = ydocRef.current.getText('monaco');
    bindingRef.current = new MonacoBinding(ytext, editor.getModel(), new Set([editor]), null);

    // Setup SSE Connection directly to backend
    const eventSource = new EventSource(`${API_BASE_URL}/api/workspaces/${defaultWorkspaceId}/stream`, {
      withCredentials: true 
    });
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => setStatus('Live (View Only)');
    
    eventSource.addEventListener('CODE_CHANGE', (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload.type === 'delta') {
          const update = fromBase64(payload.data);
          Y.applyUpdate(ydocRef.current, update, 'remote');
        }
      } catch (e) {
        console.error("Failed to parse SSE data", e);
      }
    });

    eventSource.onerror = () => {
      setStatus('Disconnected from Stream');
      eventSource.close();
    };
  };

  useEffect(() => {
    return () => {
      if (eventSourceRef.current) eventSourceRef.current.close();
      if (bindingRef.current) bindingRef.current.destroy();
    };
  }, []);

  return (
    <div className="tester-container" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: '8px', background: '#2c3e50', color: '#fff', fontSize: '12px', fontWeight: 'bold' }}>
        Status: {status} | Mode: SSE Viewer (Yjs Synchronized)
      </div>
      <div style={{ flexGrow: 1 }}>
        <Editor
          height="100%"
          defaultLanguage="plaintext"
          theme={theme === 'dark' ? 'vs-dark' : 'light'}
          onMount={handleEditorDidMount}
          options={{ readOnly: true, minimap: { enabled: false } }}
        />
      </div>
    </div>
  );
};

export default SseTester;
