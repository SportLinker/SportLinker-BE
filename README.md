## Project overview

Sport-Linker is a platform designed to connect sports enthusiasts, allowing them to find and join local sports events, teams, and activities. The backend of this project is built to handle user authentication, event management, and real-time notifications.

## Tech stack

-   Node.js
-   Express.js
-   MySQL
-   Prisma for ORM DB
-   JWT for authentication
-   Socket.io for real-time communication
-   Docker for containerization
-   RambitMQ for queue proceduce

## Project structure

The `src` directory contains the following structure:

```
<pre>
├──src/
    ├── controllers/    # Contains the logic for handling requests and responses
    ├── models/         # Contains the Mongoose models for MongoDB
    ├── routes/         # Contains the route definitions
    ├── middlewares/    # Contains middleware functions
    ├── services/       # Contains business logic and service functions
    ├── utils/          # Contains utility functions and helpers
    ├── config/         # Contains configuration files
    └── app.js          # Entry point of the application
├──index.js
</pre>
```
