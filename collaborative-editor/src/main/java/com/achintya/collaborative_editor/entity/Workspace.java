package com.achintya.collaborative_editor.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;


@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(
        name = "workspaces",
        indexes = {
                @Index(name = "idx_workspaces_owner", columnList = "owner_id")
        }
)
public class Workspace {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;

    @Column(columnDefinition = "TEXT")
    private String content = "";

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String language;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private WorkspaceMode mode;

    @Column(name = "public_slug", nullable = false, unique = true)
    private String publicSlug;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "workspace")
    private List<WorkspaceSnapshot> snapshots = new ArrayList<>();
}