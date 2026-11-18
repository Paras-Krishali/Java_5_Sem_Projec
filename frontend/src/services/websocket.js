import { Client } from '@stomp/stompjs';

const backendUrl = import.meta.env.VITE_BACKEND_URL;
const WS_URL = backendUrl.replace(/^http/, 'ws') + '/ws';

export const createStompClient = (onConnect, onDisconnect, onError) => {
  const client = new Client({
    brokerURL: WS_URL,
    reconnectDelay: 5000,
    heartbeatIncoming: 4000,
    heartbeatOutgoing: 4000,
    connectHeaders: {
      // Sometimes passing headers helps, but STOMP JS doesn't send cookies cross origin
    },
    onConnect: (frame) => {
      console.log('Connected to STOMP');
      if (onConnect) onConnect(frame);
    },
    onWebSocketError: (error) => {
      console.error('Error with websocket', error);
      if (onError) onError(error);
    },
    onStompError: (frame) => {
      console.error('Broker reported error: ' + frame.headers['message']);
      console.error('Additional details: ' + frame.body);
      if (onError) onError(frame);
    },
    onDisconnect: () => {
      console.log('Disconnected from STOMP');
      if (onDisconnect) onDisconnect();
    }
  });
  
  return client;
};
