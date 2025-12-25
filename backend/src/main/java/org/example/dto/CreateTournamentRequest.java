package org.example.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateTournamentRequest {
    @NotBlank(message = "Tournament name is required")
    private String name;
}