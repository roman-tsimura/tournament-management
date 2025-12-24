package org.example.dto;

import lombok.Data;

import jakarta.validation.constraints.NotBlank;

@Data
public class CreatePlayerRequest {
    @NotBlank(message = "Player name is required")
    private String name;
}