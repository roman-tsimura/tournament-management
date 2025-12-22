# Tournament Management System

A comprehensive tournament management system built with Spring Boot, providing robust features for organizing and managing sports or gaming tournaments.

## Features

- Team and player management
- Tournament creation and management
- Match scheduling and results tracking
- Real-time standings and statistics
- RESTful API for integration
- In-memory H2 database with JPA

## Tech Stack

- Java 17
- Spring Boot 3.5.0
- Spring Data JPA
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

Once the application is running, you can access:
- Swagger UI: `http://localhost:8080/swagger-ui.html`
- H2 Console: `http://localhost:8080/h2-console`