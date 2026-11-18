import { API_BASE_URL } from './api';

export const createSseConnection = (workspaceId, onMessage, onError, onOpen) => {
  const eventSource = new EventSource(`${API_BASE_URL}/api/workspaces/${workspaceId}/stream`, { withCredentials: true });

  eventSource.onopen = (e) => {
    console.log("SSE connected", e);
    if (onOpen) onOpen(e);
  };

  eventSource.addEventListener("CODE_CHANGE", (event) => {
    console.log("SSE CODE_CHANGE received", event.data);
    if (onMessage) onMessage(event.data);
  });

  eventSource.onerror = (error) => {
    console.error("SSE error", error);
    if (onError) onError(error);
  };

  return eventSource;
};
