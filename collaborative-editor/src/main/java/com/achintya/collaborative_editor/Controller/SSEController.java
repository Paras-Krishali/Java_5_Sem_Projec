package com.achintya.collaborative_editor.Controller;

import com.achintya.collaborative_editor.Service.SseConnectionManager;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.UUID;

@RestController
@RequestMapping("/api/workspaces")
public class SSEController {


    private final SseConnectionManager sseConnectionManager;
    public SSEController(SseConnectionManager sseConnectionManager) {
        this.sseConnectionManager = sseConnectionManager;
    }

    @GetMapping(
            value = "/{workspaceId}/stream",
            produces = MediaType.TEXT_EVENT_STREAM_VALUE
    )
    public SseEmitter stream(
            @PathVariable UUID workspaceId,
            jakarta.servlet.http.HttpServletResponse response
            ){
        // Crucial for Render/Nginx to prevent buffering SSE streams
        response.setHeader("X-Accel-Buffering", "no");
        response.setHeader("Cache-Control", "no-cache");
        return sseConnectionManager.addClient(workspaceId);
    }
}
