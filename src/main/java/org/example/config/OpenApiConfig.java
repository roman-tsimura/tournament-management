package org.example.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI tournamentOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Tournament Management API")
                        .description("API documentation for the Tournament Management System")
                        .version("1.0.0"));
    }
}