export const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

export const fetchPublicWorkspace = async (slug) => {
  const res = await fetch(`${API_BASE_URL}/api/workspaces/public/${slug}`);
  if (!res.ok) throw new Error("Failed to fetch public workspace");
  return res.json();
};

export const fetchCurrentUser = async () => {
  const res = await fetch(`${API_BASE_URL}/api/user/me`, {
    credentials: "include"
  });
  if (!res.ok) throw new Error("Not authenticated");
  return res.json();
};

export const createWorkspace = async (data) => {

  const response = await fetch(`${API_BASE_URL}/api/workspaces`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
    credentials: 'include'
  });
  if (!response.ok) {
    const errorMsg = await response.text();
    throw new Error(errorMsg || 'Failed to create workspace');
  }
  return response.json();
};


export const fetchMyWorkspaces = async () => {
  const res = await fetch(`${API_BASE_URL}/api/workspaces/mine`, {
    credentials: "include"
  });
  if (!res.ok) throw new Error("Failed to fetch my workspaces");
  return res.json();
};

export const changeWorkspaceMode = async (id, mode) => {
  const res = await fetch(`${API_BASE_URL}/api/workspaces/${id}/mode`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ mode }),
    credentials: "include"
  });
  if (!res.ok) throw new Error("Failed to change mode");
  return res.json();
};

export const deleteWorkspace = async (id) => {
  const res = await fetch(`${API_BASE_URL}/api/workspaces/${id}`, {
    method: "DELETE",
    credentials: "include"
  });
  if (!res.ok) throw new Error("Failed to delete workspace");
};
