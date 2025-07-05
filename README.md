# MediBook-Backend

This is the backend service for MediBook, a medical appointment booking application. It handles user authentication, patient data management, provider information, and appointment scheduling. The API is built with Node.js, Express, and MongoDB.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

Make sure you have the following installed on your system:

- [Node.js](https://nodejs.org/) (v20.x or later recommended)
- [MongoDB](https://www.mongodb.com/try/download/community)

### Installation

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/BenjaminAJ/MediBook-Backend.git
    cd MediBook-Backend
    ```

2.  **Install NPM packages:**
    ```sh
    npm install
    ```

3.  **Set up environment variables:**
    Create a `.env` file in the root of the project by copying the example file:
    ```sh
    cp .env.example .env
    ```
    Then, open the `.env` file and fill in the required values.

## Environment Variables

You will need to provide the following environment variables in your `.env` file:

| Variable         | Description                                                                 | Example                                                                                          |
| ---------------- | --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `PORT`           | The port the server will run on.                                            | `3000`                                                                                           |
| `MONGO_URI`      | The connection string for your MongoDB database.                            | `mongodb://localhost:27017/mediBook`                                                             |
| `ENCRYPTION_KEY` | A 32-byte, base64-encoded string for encrypting sensitive data.             | `gh1+YiR/JOhyGDXTd5IALf/lAXcwZc2TYXPmJo0AgSg=`                                                    |
| `SIGNING_KEY`    | A 64-byte, base64-encoded string for signing the encrypted data.            | `jkNgiDCYEbEIog09J9zfmz2p0XefdQm9XYrFsd7LeyuQN/+quiOYcA/weweuVgba6KRL9qDLXoSN5AAjI1FL4g==` |
| `NODE_ENV`       | The application environment.                                                | `development`                                                                                    |
| `JWT_SECRET`     | A long, random string for signing JSON Web Tokens.                          | `67f298fcd1132c688f61fe11236c7194355384e92340a75be502041e4978628dd758f03b48b04c970e4bfcfe79dd2204774cc56d62268909b82f79aac72f9230` |

You can generate secure keys using the following commands:
- **ENCRYPTION_KEY**: `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`
- **SIGNING_KEY**: `node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"`
- **JWT_SECRET**: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`

## Available Scripts

In the project directory, you can run:

-   `npm run dev`
    Runs the app in development mode using `nodemon`, which will automatically restart the server on file changes.

-   `npm start`
    Runs the app in production mode.

## API Documentation

The API is documented using Swagger. You can access the live documentation at:
[https://medibook-backend-s172.onrender.com/api-docs](https://medibook-backend-s172.onrender.com/api-docs)

For local development, it's available at `http://localhost:PORT/api-docs`.

## Deployment

This backend is deployed on Render. The base URL for the API is:
[https://medibook-backend-s172.onrender.com](https://medibook-backend-s172.onrender.com)

## Technologies Used

-   **Node.js**: JavaScript runtime environment.
-   **Express**: Web framework for Node.js.
-   **MongoDB**: NoSQL database.
-   **Mongoose**: Object Data Modeling (ODM) library for MongoDB.
-   **JWT**: For user authentication.
-   **bcryptjs**: For password hashing.
-   **mongoose-encryption**: For encrypting sensitive fields in the database.
-   **Swagger**: For API documentation.
