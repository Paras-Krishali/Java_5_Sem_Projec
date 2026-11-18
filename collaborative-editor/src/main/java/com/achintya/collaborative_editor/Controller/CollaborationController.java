package com.achintya.collaborative_editor.Controller;

import com.achintya.collaborative_editor.DTO.CollaborativeMessage;
import com.achintya.collaborative_editor.Service.CollaborationBroadcastService;
import com.achintya.collaborative_editor.Service.WorkspaceService;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.CrossOrigin;

import java.nio.file.AccessDeniedException;
import java.security.Principal;
import java.util.UUID;

@Controller
public class CollaborationController {

    private final CollaborationBroadcastService broadcastService;
    private final WorkspaceService workspaceService;

    public CollaborationController(CollaborationBroadcastService broadcastService, WorkspaceService workspaceService) {
        this.broadcastService = broadcastService;
        this.workspaceService = workspaceService;
    }

    @MessageMapping("/room/{roomId}/edit")
    public void handleEdit(@DestinationVariable UUID roomId,
                           CollaborativeMessage message,
                           Principal principal
                           ) throws AccessDeniedException{
        workspaceService.assertCanEdit(roomId,principal);
        broadcastService.broadcast(roomId,message);
    }

    @MessageMapping("/room/{roomId}/save")
    public void handleSave(@DestinationVariable UUID roomId,
                           CollaborativeMessage message,
                            Principal principal
                            ) throws AccessDeniedException {
        workspaceService.assertCanEdit(roomId,principal);
        if("snapshot".equals(message.getType()) && message.getData()!=null) {
            workspaceService.queueContentSave(roomId,message.getData());
        }


    }

}
