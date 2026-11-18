package com.achintya.collaborative_editor.DTO;

import com.achintya.collaborative_editor.entity.WorkspaceMode;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class WorkspaceResponse {

    private UUID id;
    private String title;
    private String language;
    private WorkspaceMode mode;
    private String publicSlug;
    private UUID ownerId;
    private String content;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
