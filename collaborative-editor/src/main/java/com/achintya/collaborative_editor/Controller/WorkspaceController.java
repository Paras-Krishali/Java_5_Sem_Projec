package com.achintya.collaborative_editor.Controller;
import com.achintya.collaborative_editor.DTO.ChangeWorkspaceRequest;
import com.achintya.collaborative_editor.DTO.CreateWorkspaceRequest;
import com.achintya.collaborative_editor.DTO.WorkspaceResponse;
import com.achintya.collaborative_editor.Security.CustomUserPrincipal;
import com.achintya.collaborative_editor.Service.WorkspaceService;
import com.achintya.collaborative_editor.entity.User;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/workspaces")
public class WorkspaceController {

    private final WorkspaceService workspaceService;

    public WorkspaceController(WorkspaceService workspaceService) {
        this.workspaceService = workspaceService;
    }

    @PostMapping
    public WorkspaceResponse createWorkspace(
            @AuthenticationPrincipal CustomUserPrincipal principal,
            @RequestBody CreateWorkspaceRequest request
            ){
        User user = principal.getUser();

        return workspaceService.createWorkspace(user,request);
    }

    @GetMapping("/mine")
    public List<WorkspaceResponse> getMyWorkspaces(
            @AuthenticationPrincipal  CustomUserPrincipal principal
    ){
        return workspaceService.getMyWorkspaces(principal.getUser());
    }

    @PatchMapping("/{id}/mode")
    public WorkspaceResponse changeWorkspaceMode(
            @PathVariable UUID id,
            @AuthenticationPrincipal CustomUserPrincipal principal,
            @RequestBody ChangeWorkspaceRequest request
            ){
        return workspaceService.changeWorkspaceMode(id,principal.getUser(),request.getMode());
    }
    @DeleteMapping("/{id}")
    public void deleteWorkspace(
            @PathVariable UUID id,
            @AuthenticationPrincipal CustomUserPrincipal principal) {

        workspaceService.deleteWorkspace(
                id,
                principal.getUser()
        );
    }
    @GetMapping("/public/{slug}")
    public WorkspaceResponse getPublicWorkspace(
            @PathVariable String slug) {

        return workspaceService.getPublicWorkspace(slug);
    }
}