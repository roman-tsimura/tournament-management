package org.example.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class GameScoreUpdateDTO {
    @NotNull(message = "Score 1 is required")
    private Integer score1;
    
    @NotNull(message = "Score 2 is required")
    private Integer score2;
}
