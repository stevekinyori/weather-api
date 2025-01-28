# Weather API

This project provides a comprehensive Weather API built using Node.js and NestJS. It includes RESTful endpoints, GraphQL capabilities, and Swagger documentation for easier interaction and testing.

---

## Table of Contents

- [Weather API](#weather-api)
  - [Table of Contents](#table-of-contents)
  - [Requirements](#requirements)
  - [Installation](#installation)
  - [Usage](#usage)
    - [Starting the Application](#starting-the-application)
    - [Swagger Documentation](#swagger-documentation)
    - [GraphQL Playground](#graphql-playground)
  - [Sample API Usage](#sample-api-usage)
    - [REST Endpoints](#rest-endpoints)
    - [GraphQL Queries](#graphql-queries)
      - [Login Query](#login-query)
      - [Get Weather](#get-weather)
  - [Environment Variables](#environment-variables)

---

## Requirements

To run this project, you need:

- **Node.js**: Version 22 or higher
- **npm**: Comes with Node.js
- **PostgreSQL**: Installed and running locally

---

## Installation

Follow these steps to get the application running locally:

1. Clone the repository:
   ```
   git clone <repository-url>
   cd <repository-folder>
    ```
2. Install the dependencies:
  ```
  npm install
  ```
3. Install PostgreSQL:
    On macOS: Use brew install postgresql
    On Ubuntu: Use sudo apt update && sudo apt install postgresql
    On Windows: Download from PostgreSQL Official Site
4. Start your PostgreSQL service and create a database.

---

## Setup
1. Create a .env file in the project root and configure it with your database and API keys. Below is a sample .env file:
    ```
      DB_HOST=<yourdbhost>
      DB_PORT=<yourdbport>
      DB_USERNAME=<your_db_username>
      DB_PASSWORD=<your_db_password>
      DB_NAME=<your_Database_name>
      OPENWEATHER_API_KEY=<your_api_key>
      OPENWEATHER_API_URL=https://api.openweathermap.org/data/2.5
   ```

---

## Usage
### Starting the Application
Run the following command to start the application:

```npm run start```


The server will be available at [http://localhost:3000](http://localhost:3000).

### Swagger Documentation
Access Swagger UI for API documentation at:

[http://localhost:3000/api-docs](http://localhost:3000/api-docs)

### GraphQL Playground
Access the GraphQL playground at:

[http://localhost:3000/graphql](http://localhost:3000/graphql)

---

## Sample API Usage

### REST Endpoints
Login
    
    POST http://localhost:3000/auth/login
    Content-Type: application/json
    Body: 
    {
      "username": "user@example.com",
      "password": "password123"
    }
   
  Get Current Weather
  GET http://localhost:3000/weather/{city}

Replace ``{city}`` with a valid city name.

### GraphQL Queries
#### Login Query
```
mutation {
  login(input: { username: "user@example.com", password: "password123" }) {
    token
    user {
      id
      username
    }
  }
}
```

#### Get Weather
```
query {
  getWeather(city: "Nairobi") {
    temperature
    description
    humidity
    windSpeed
  }
}
```

---

## Environment Variables
Here’s a reference .env template for this project:

```
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=yourpassword
DB_NAME=weather_api
OPENWEATHER_API_KEY=xxxxxxxxxxxxxxxxx
OPENWEATHER_API_URL=https://api.openweathermap.org/data/2.5
```