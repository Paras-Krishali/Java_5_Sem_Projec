package com.achintya.collaborative_editor.Repository;

import com.achintya.collaborative_editor.entity.WorkspaceSnapshot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface WorkspaceSnapshotRepository
        extends JpaRepository<WorkspaceSnapshot, UUID> {

    Optional<WorkspaceSnapshot>
    findTopByWorkspaceIdOrderByCreatedAtDesc(UUID workspaceId);
}