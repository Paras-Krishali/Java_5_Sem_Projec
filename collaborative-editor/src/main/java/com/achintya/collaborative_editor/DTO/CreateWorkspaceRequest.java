package com.achintya.collaborative_editor.DTO;

import com.achintya.collaborative_editor.entity.WorkspaceMode;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@AllArgsConstructor
@NoArgsConstructor
public class CreateWorkspaceRequest {

    private String title;
    private String language;
    private String roomCode;
    private WorkspaceMode mode = WorkspaceMode.READ_ONLY;
}
