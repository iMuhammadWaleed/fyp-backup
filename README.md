# GourmetGo Catering Service

This is a comprehensive, website-based catering service system.

## Local Development Setup

This project is a full-stack application with a React frontend and a Node.js/Express backend. To run it locally, you need to run the backend server and then open the frontend in your browser.

### Prerequisites

*   **Node.js and npm:** Make sure you have Node.js (version 18 or later) and npm installed. You can download them from [nodejs.org](https://nodejs.org/).
*   **MongoDB:** You need a MongoDB database. You can set one up for free at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).

### 1. Create Environment File

The backend server requires environment variables for the MongoDB connection and the Google Gemini API key.

1.  In the root directory of the project, create a new file named `.env`.
2.  Add the following content to the `.env` file, replacing the placeholder values with your actual credentials:

    ```
    # Your MongoDB connection string from MongoDB Atlas
    MONGODB_URI="mongodb+srv://<user>:<password>@<cluster-url>/<database-name>?retryWrites=true&w=majority"

    # Your Google Gemini API Key from Google AI Studio
    API_KEY="YOUR_GEMINI_API_KEY"

    # The port for the backend server (optional, defaults to 4000)
    PORT=4000
    ```

### 2. Install Dependencies

Open your terminal in the project's root directory and run the following command to install all the necessary packages for both the server and development tools:

```bash
npm install
```

### 3. Run the Development Server

Once the dependencies are installed and your environment variables are set up, you can start the local development server for the backend:

```bash
npm run dev
```

This command uses `nodemon` and `ts-node` to start the Express server. It will watch for any changes in the `server/` directory and automatically restart the server.

You should see a message in your terminal like:
`🚀 Server is running on http://localhost:4000`

### 4. Access the Application

The backend server also serves the frontend application.

Open your browser and navigate to **`http://localhost:4000`**.

You can now use the full application. The frontend will make API calls to your local backend server.
