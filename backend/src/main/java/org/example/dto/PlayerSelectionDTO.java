package org.example.dto;

import lombok.Data;

@Data
public class PlayerSelectionDTO {
    private Long id;
    private String name;
    private Long teamId;
    private String teamName;
}
