# Tournament Management System - Backend

This is the backend component of the Tournament Management System, built with Spring Boot. It provides a RESTful API for managing tournaments, teams, players, and matches.

## Features

- **Player Management**: CRUD operations for players
- **Team Management**: Create and manage teams with players
- **Tournament Management**: Organize tournaments with multiple teams
- **Match Scheduling**: Automatic match scheduling and results tracking
- **Standings**: Real-time tournament standings and statistics
- **API Documentation**: Interactive API docs with Swagger UI
- **H2 Database**: In-memory database with web console

## Prerequisites

- Java 17 or later
- Maven 3.6.0 or later

## Getting Started

### Installation

1. Navigate to the backend directory:
   ```bash
   cd backend
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

Once the application is running, you can access the following:

- **Swagger UI**: [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)
- **OpenAPI JSON**: [http://localhost:8080/v3/api-docs](http://localhost:8080/v3/api-docs)

## Database

The application uses an in-memory H2 database by default. You can access the H2 console at:
- URL: [http://localhost:8080/h2-console](http://localhost:8080/h2-console)
- JDBC URL: `jdbc:h2:mem:tournamentdb`
- Username: `sa`
- Password: (leave empty)

## Project Structure

```
src/main/java/org/example/
├── config/          # Configuration classes
├── controller/      # REST controllers
├── dto/             # Data Transfer Objects
├── exception/       # Exception handling
├── model/           # Entity classes
├── repository/      # Data access layer
├── service/         # Business logic
└── TournamentApplication.java  # Main application class
```

## Building for Production

To create a production-ready JAR file:

```bash
mvn clean package -DskipTests
```

The JAR file will be created in the `target/` directory.

## Testing

Run the test suite with:

```bash
mvn test
```