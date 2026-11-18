package com.achintya.collaborative_editor.Repository;

import com.achintya.collaborative_editor.entity.Workspace;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface WorkspaceRepository extends JpaRepository<Workspace, UUID> {

    List<Workspace> findByOwnerId(UUID ownerId);
    boolean existsByPublicSlug(String publicSlug);
    Optional<Workspace> findByPublicSlug(String publicSlug);
}
