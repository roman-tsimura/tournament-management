# Tournament Management System

A comprehensive tournament management system built with Spring Boot, providing robust features for organizing and managing sports or gaming tournaments.

## Features

- Team and player management
- Tournament creation and management
- Match scheduling and results tracking
- Real-time standings and statistics
- RESTful API for integration
- In-memory H2 database with JPA
- Interactive API documentation with Swagger UI

## Tech Stack

- Java 17
- Spring Boot 3.5.0
- Spring Data JPA
- SpringDoc OpenAPI 2.8.14
- MapStruct
- H2 Database
- Maven

## Getting Started

### Prerequisites

- Java 17 or later
- Maven 3.6.0 or later

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/roman-tsimura/tournament-management.git
   cd tournament-management
   ```

2. Build the project:
   ```bash
   mvn clean install
   ```

3. Run the application:
   ```bash
   mvn spring-boot:run
   ```

The application will start on `http://localhost:8080`

## API Documentation

The application provides interactive API documentation using Swagger UI:

- **Swagger UI**: [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)
- **OpenAPI JSON**: [http://localhost:8080/v3/api-docs](http://localhost:8080/v3/api-docs)

## Database Console

Access the H2 database console at:
- URL: [http://localhost:8080/h2-console](http://localhost:8080/h2-console)
- JDBC URL: `jdbc:h2:mem:tournamentdb`
- Username: `sa`
- Password: (leave empty)
