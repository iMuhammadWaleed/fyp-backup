# GourmetGo Catering Service

This is a comprehensive, website-based catering service system.

## Local Development Setup

To test and run this application on your local machine, please follow these steps.

### Prerequisites

*   **Node.js and npm:** Make sure you have Node.js (version 18 or later) and npm installed. You can download them from [nodejs.org](https://nodejs.org/).
*   **Vercel CLI:** This project uses Vercel for deployment and local development. You'll need to install the Vercel CLI globally.

    ```bash
    npm install -g vercel
    ```

### 1. Create Environment File

The application requires environment variables for the MongoDB connection and the Google Gemini API key.

1.  Create a new file named `.env.local` in the root directory of the project.
2.  Add the following content to the `.env.local` file, replacing the placeholder values with your actual credentials:

    ```
    # Your MongoDB connection string
    MONGODB_URI="mongodb+srv://<user>:<password>@<cluster-url>/<database-name>?retryWrites=true&w=majority"

    # Your Google Gemini API Key
    # You can get one from Google AI Studio
    API_KEY="YOUR_GEMINI_API_KEY"
    ```

### 2. Install Dependencies

Open your terminal in the project's root directory and run the following command to install all the necessary packages:

```bash
npm install
```

### 3. Run the Development Server

Once the dependencies are installed and your environment variables are set up, you can start the local development server:

```bash
npm run dev
```

This command uses `vercel dev`, which will start a local server (usually on `http://localhost:3000`). It automatically handles both the frontend React application and the serverless API functions located in the `/api` directory, mimicking the production environment.

You can now open your browser and navigate to `http://localhost:3000` to see the application running. Any changes you make to the code will be automatically reflected.
