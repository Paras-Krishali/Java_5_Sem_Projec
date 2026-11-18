package com.achintya.collaborative_editor.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CollaborativeMessage {
    private String type;
    private String data;

}
