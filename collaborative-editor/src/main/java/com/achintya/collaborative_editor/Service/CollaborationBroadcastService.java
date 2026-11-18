package com.achintya.collaborative_editor.Service;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class CollaborationBroadcastService {
    private final SimpMessagingTemplate messagingTemplate;
    private final SseConnectionManager sseConnectionManager;

    public CollaborationBroadcastService(SimpMessagingTemplate messagingTemplate, SseConnectionManager sseConnectionManager) {
        this.messagingTemplate = messagingTemplate;
        this.sseConnectionManager = sseConnectionManager;
    }
    public void broadcast(UUID workspaceId,Object update){
        messagingTemplate.convertAndSend("/topic/room/"+workspaceId,update);

        sseConnectionManager.sendToWorkspace(workspaceId,update);
    }

}
