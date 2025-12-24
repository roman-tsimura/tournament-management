# Tournament Management System

A comprehensive tournament management system with a Spring Boot backend and Angular frontend, providing robust features for organizing and managing sports or gaming tournaments.

## Project Structure

- `/backend` - Spring Boot application (REST API)
- `/frontend` - Angular application (Web interface)

## Features

### Backend
- Team and player management
- Tournament creation and management
- Match scheduling and results tracking
- Real-time standings and statistics
- RESTful API for integration
- In-memory H2 database with JPA
- Interactive API documentation with Swagger UI

### Frontend
- Modern, responsive UI built with Angular
- Real-time tournament updates
- Interactive dashboard
- Player and team management interface
- Match results submission
- Tournament standings and statistics

## Tech Stack

### Backend
- Java 17
- Spring Boot 3.5.0
- Spring Data JPA
- SpringDoc OpenAPI 2.8.14
- MapStruct
- H2 Database
- Maven

### Frontend
- Angular 21.0.4
- TypeScript
- RxJS
- Angular Material
- HTML5/CSS3

## Getting Started

### Prerequisites

- Java 17 or later
- Maven 3.6.0 or later
- Node.js 18+ and npm 9+ (for frontend development)

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

### Frontend Development

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   ng serve
   ```

The frontend will be available at `http://localhost:4200`

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
