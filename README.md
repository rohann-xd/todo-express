# Todo App 📝

A simple Todo application built with **Express**, **MongoDB**, and **EJS**. Includes CI/CD pipeline with Jenkins.

---

## 🌟 Features:
- ✅ Add new todos
- ✅ Mark todos as **complete/incomplete** using checkboxes
- ✅ **Delete** todos
- 🎨 Custom styling for the UI
- 🚀 CI/CD with Jenkins for automated builds and blue-green deployment

---

## ⚙️ Tech Stack:

- **Backend**: Node.js with Express
- **Database**: MongoDB
- **Frontend**: EJS Template Engine
- **CSS**: Custom styling for UI
- **DevOps**: Jenkins, Docker, Blue-Green Deployment

---

## 🏁 Getting Started:

### Without Docker:
1. **Clone the repository**:
   ```bash
   git clone https://github.com/rohann-xd/todo-express.git
   cd todo-express
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure MongoDB URI**:
   Create a `.env` file and add the following:
   ```env
   MONGO_URI=your_mongodb_connection_string
   NODE_ENV=development
   PORT=3000
   ```

4. **Start the server**:
   ```bash
   npm start
   ```
   Now, open your browser and visit: [http://localhost:3000](http://localhost:3000).

### With Docker:

1. **Build and run the Docker container**:
   ```bash
   docker build -t todo-app .
   docker run -d -p 3000:3000 --env-file .env todo-app
   ```

2. **Access the app**:
   Once the container is running, open your browser and visit: [http://localhost:3000](http://localhost:3000).

### Using Jenkins Pipeline (CI/CD):

This project includes automated build and deployment pipelines using Jenkins with Blue-Green deployment strategy.

1. **Set up Jenkins**:
   - Install the required plugins: Docker, Pipeline, Git
   - Create Jenkins credentials for:
     - `docker-hub-username` (string): Your Docker Hub username
     - `docker-hub-credentials` (username & password): Docker Hub login credentials
     - `MONGO_URI` (string): MongoDB connection string
     - `NODE_ENV` (string): Environment setting (e.g., "production")
   - Create two pipeline jobs:
     - `todo-app-build`: Uses Jenkinsfile.build
     - `todo-app-deploy`: Uses Jenkinsfile.deploy

2. **Configure Branches**:
   - `main`: Standard implementation for local development
   - `jenkins`: Contains CI/CD configuration files

3. **Pipeline Workflow**:
   
   **Build Pipeline (Jenkinsfile.build)**:
   - Checks out the code
   - Builds Docker image with build number tag
   - Pushes image to Docker Hub
   - Triggers deployment pipeline with the build number
   
   **Deploy Pipeline (Jenkinsfile.deploy)**:
   - Uses Blue-Green deployment strategy
   - Prepares environment with credentials
   - Determines which container to deploy next (blue or green)
   - Deploys new container on a separate port (3001 or 3002)
   - Verifies new deployment with health checks
   - Switches traffic to the new container by remapping to port 3000
   - Performs final verification
   - Includes automatic rollback on failure

---

## 📜 Routes:

- **GET /**: Display all todos
- **POST /add**: Add a new todo
- **POST /complete/:id**: Mark todo as complete/incomplete
- **POST /delete/:id**: Delete a todo

---

## 🗂️ Project Structure:

```
├── controllers/
│   └── todoController.js  # Logic for adding, completing, and deleting todos
├── models/
│   └── Todo.js            # Mongoose schema for todos
├── routes/
│   └── todoRoutes.js      # Defines routes for todo operations
├── templates/
│   └── index.ejs          # Main template that renders todos
├── public/
│   └── css/
│       └── style.css      # Custom styles for the UI
├── Dockerfile             # Docker configuration for building the app image
├── Jenkinsfile.build      # Jenkins pipeline for building and testing
├── Jenkinsfile.deploy     # Jenkins pipeline for blue-green deployment
├── .env.example           # Example environment variables
├── server.js              # Main application entry point
```

---

## 🔄 Blue-Green Deployment

The application uses a blue-green deployment strategy through Jenkins:

1. **Two environments**: Blue (port 3001) and Green (port 3002)
2. **Zero downtime**: The new version runs in parallel with the old version
3. **Quick rollback**: If deployment fails, traffic is immediately routed back to the previous version
4. **Safety verification**: Health checks ensure the new version works before switching traffic

Benefits:
- No downtime during deployments
- Risk mitigation with immediate rollback capability
- Separate testing environment for final verification before going live

**Blue-Green Deployment Process:**
1. Build a new version of the app (Build Pipeline)
2. Deploy to the inactive environment - blue or green (Deploy Pipeline)
3. Test the new deployment thoroughly
4. Switch traffic from old to new environment
5. Keep the old environment as a backup for easy rollback

---

## 📄 License:
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙌 Contributing:
Feel free to fork, modify, and submit pull requests!