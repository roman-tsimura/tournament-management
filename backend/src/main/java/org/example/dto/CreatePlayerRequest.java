package org.example.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreatePlayerRequest {
    @NotBlank(message = "Player name is required")
    private String name;
}