package org.example.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class CreateTournamentRequest {
    @NotBlank(message = "Tournament name is required")
    private String name;

    private String description;

    @NotNull(message = "Start date is required")
    private LocalDateTime startDate;

    private LocalDateTime endDate;
    private Integer maxPlayers;
    private Integer totalRounds = 1;
}