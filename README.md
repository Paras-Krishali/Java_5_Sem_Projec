# Collaborative Editor Platform

A real-time collaborative workspace platform that allows multiple users to simultaneously edit code or text. It manages conflicts seamlessly using **Yjs** (a CRDT implementation) to provide a smooth, concurrent editing experience.

## Key Features

### Frontend
- **Real-time Collaboration:** Implements `yjs`, `y-monaco`, and `y-protocols` to handle Conflict-free Replicated Data Types (CRDTs), ensuring consistent document states across all clients without synchronization conflicts.
- **Monaco Editor Integration:** Uses `@monaco-editor/react` for a rich, VS Code-like coding experience in the browser.
- **WebSocket & SSE Connections:** Leverages `@stomp/stompjs` and `sockjs-client` for persistent two-way communication to sync edits in real-time.
- **Modern UI/UX:** Built with React 19 and Vite for an optimized, fast, and responsive user experience.
- **Routing:** Implements `react-router-dom` to handle navigation between user dashboards and workspace editors seamlessly.

### Backend
- **Spring Boot Architecture:** A robust and scalable Java backend built with Spring Boot.
- **Real-time Synchronization:** Utilizes Spring WebSockets (`@EnableWebSocketMessageBroker`) for high-frequency edit syncing and Server-Sent Events (SSE) for low-latency streaming of workspace events.
- **OAuth2 Authentication:** Secures user endpoints and manages identities using Spring Security with OAuth2 integration (provides user details like name, email, and picture).
- **Workspace Management:** Complete CRUD functionality for workspaces, including access control and visibility toggling (public/private modes).

## API Mapping Table (Backend)

| HTTP Method | Endpoint | Description | Controller |
| ----------- | -------- | ----------- | ---------- |
| **GET** | `/api/user/me` | Retrieves the currently authenticated user's profile information (ID, name, email, picture) via OAuth2. | `UserController` |
| **POST** | `/api/workspaces` | Creates a new workspace for the authenticated user. | `WorkspaceController` |
| **GET** | `/api/workspaces/mine` | Fetches a list of all workspaces owned by the authenticated user. | `WorkspaceController` |
| **PATCH** | `/api/workspaces/{id}/mode` | Changes the mode/visibility of a specific workspace. | `WorkspaceController` |
| **DELETE** | `/api/workspaces/{id}` | Deletes a specific workspace (requires ownership). | `WorkspaceController` |
| **GET** | `/api/workspaces/public/{slug}` | Retrieves details of a public workspace using its unique slug. | `WorkspaceController` |
| **GET** | `/api/workspaces/{workspaceId}/stream` | Initiates a Server-Sent Events (SSE) stream for real-time updates regarding a specific workspace. | `SSEController` |
| **GET** | `/api/health` | Health check endpoint to verify backend status. | `HealthController` |

### WebSocket Endpoints

| Message Mapping | Description | Controller |
| --------------- | ----------- | ---------- |
| `/room/{roomId}/edit` | Handles incoming live edits and distributes them to other clients in the room using STOMP. | `CollaborationController` |
| `/room/{roomId}/save` | Triggers a save event for the current document state in the workspace. | `CollaborationController` |

## Getting Started

Follow these instructions to set up and run the project locally.

### Prerequisites
- **Java 17+** (for the Spring Boot backend)
- **Node.js** (v18+) and **npm** (for the React/Vite frontend)

### 1. Backend Setup (Spring Boot)
1. Navigate to the backend directory:
   ```bash
   cd collaborative-editor
   ```
2. Install dependencies and build the project (using Maven wrapper):
   ```bash
   ./mvnw clean install
   ```
3. Run the Spring Boot application:
   ```bash
   ./mvnw spring-boot:run
   ```
   *The backend will run on your configured port (usually `http://localhost:8080`).*

### 2. Frontend Setup (React + Vite)
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install the frontend dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The frontend will typically be accessible at `http://localhost:5173`.*

You are now ready to collaborate! 