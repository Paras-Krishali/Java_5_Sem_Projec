package com.achintya.collaborative_editor.Service;

import com.achintya.collaborative_editor.DTO.CreateWorkspaceRequest;
import com.achintya.collaborative_editor.DTO.WorkspaceResponse;
import com.achintya.collaborative_editor.Repository.WorkspaceRepository;
import com.achintya.collaborative_editor.entity.User;
import com.achintya.collaborative_editor.entity.Workspace;
import com.achintya.collaborative_editor.entity.WorkspaceMode;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import java.nio.file.AccessDeniedException;
import java.security.Principal;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class WorkspaceService {

    private final Map<UUID,String> pendingsaves = new ConcurrentHashMap<>();
    public void queueContentSave(UUID workspaceId, String content){
        pendingsaves.put(workspaceId,content);
    }

    private final WorkspaceRepository workspaceRepository;

    public WorkspaceService(WorkspaceRepository workspaceRepository) {
        this.workspaceRepository = workspaceRepository;
    }

    public WorkspaceResponse createWorkspace(User owner, CreateWorkspaceRequest request) {

        //check for duplicate roomId
        if(workspaceRepository.existsByPublicSlug(request.getRoomCode())){
            throw new RuntimeException("Room code already exits . Please choose a different one");
        }


        Workspace workspace = new Workspace();

        workspace.setOwner(owner);
        workspace.setTitle(request.getTitle());
        workspace.setLanguage(request.getLanguage());
        workspace.setMode(request.getMode());

        workspace.setCreatedAt(java.time.LocalDateTime.now());
        workspace.setUpdatedAt(java.time.LocalDateTime.now());

        workspace.setPublicSlug(request.getRoomCode());

        Workspace savedWorkspace = workspaceRepository.save(workspace);
        return toResponse(savedWorkspace);
    }

    private WorkspaceResponse toResponse(Workspace workspace) {

        WorkspaceResponse response = new WorkspaceResponse();

        response.setId(workspace.getId());
        response.setTitle(workspace.getTitle());
        response.setLanguage(workspace.getLanguage());
        response.setMode(workspace.getMode());
        response.setPublicSlug(workspace.getPublicSlug());
        response.setOwnerId(workspace.getOwner().getId());
        response.setContent(workspace.getContent());
        response.setCreatedAt(workspace.getCreatedAt());
        response.setUpdatedAt(workspace.getUpdatedAt());

        return response;
    }

    public List<WorkspaceResponse> getMyWorkspaces(User owner) {

        return workspaceRepository
                .findByOwnerId(owner.getId())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public WorkspaceResponse getPublicWorkspace(String publicSlug) {

        Workspace workspace = workspaceRepository
                .findByPublicSlug(publicSlug)
                .orElseThrow(() -> new RuntimeException("Workspace not found"));

        return toResponse(workspace);
    }

    public WorkspaceResponse changeWorkspaceMode(UUID workspaceId, User owner, WorkspaceMode mode) {

        Workspace workspace = workspaceRepository
                .findById(workspaceId)
                .orElseThrow(() -> new RuntimeException("Workspace not found"));

        if (!workspace.getOwner().getId().equals(owner.getId())) {
            throw new RuntimeException("Only owner can change workspace mode");
        }

        workspace.setMode(mode);

        return toResponse(workspaceRepository.save(workspace));
    }

    public void deleteWorkspace(UUID workspaceId, User owner) {

        Workspace workspace = workspaceRepository
                .findById(workspaceId)
                .orElseThrow(() -> new RuntimeException("Workspace not found"));

        if (!workspace.getOwner().getId().equals(owner.getId())) {
            throw new RuntimeException("Only owner can delete workspace");
        }

        workspaceRepository.delete(workspace);
    }

    public void assertCanEdit(UUID workspaceId, Principal principal) throws AccessDeniedException {
        Workspace ws = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new RuntimeException("Workspace not found"));

        if (ws.getMode() == WorkspaceMode.COLLABORATIVE) {
            return; // Anyone can edit in WS mode
        }

        if (principal == null) throw new AccessDeniedException("Login required to broadcast in SSE mode");

        UUID userId = null;
        if (principal instanceof org.springframework.security.core.Authentication auth) {
            if (auth.getPrincipal() instanceof com.achintya.collaborative_editor.Security.CustomUserPrincipal customPrincipal) {
                userId = customPrincipal.getUser().getId();
            }
        }
        
        if (userId == null) {
            try {
                userId = UUID.fromString(principal.getName());
            } catch (Exception e) {
                throw new AccessDeniedException("Could not resolve user ID");
            }
        }

        if (!ws.getOwner().getId().equals(userId)) {
            throw new AccessDeniedException("Only the owner can edit in SSE mode");
        }
    }

    @Scheduled(fixedDelay = 5000)
    public void flushContentToDatabase() {
        if (pendingsaves.isEmpty()) return;
        Map<UUID, String> toSave = new ConcurrentHashMap<>(pendingsaves);
        pendingsaves.clear();
        toSave.forEach((id, content) -> {
            Workspace workspace = workspaceRepository.findById(id).orElse(null);
            if (workspace != null) {
                workspace.setContent(content);
                workspace.setUpdatedAt(java.time.LocalDateTime.now());
                workspaceRepository.save(workspace);
            }
        });
    }

}
