# Todo App 📝

A simple Todo application built with **Express**, **MongoDB**, and **EJS**.

---

## 🌟 Features:
- ✅ Add new todos
- ✅ Mark todos as **complete/incomplete** using checkboxes
- ✅ **Delete** todos
- 🎨 Custom styling for the UI

---

## ⚙️ Tech Stack:

- **Backend**: Node.js with Express
- **Database**: MongoDB
- **Frontend**: EJS Template Engine
- **CSS**: Custom styling for UI

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
   MONGO_URI=mongodb://localhost:27017/todoApp
   ```
   > **MongoDB Atlas** users: Replace with your cloud database URI.

4. **Start the server**:
   ```bash
   npm start
   ```
   Now, open your browser and visit: [http://localhost:3000](http://localhost:3000).

### With Docker:

1. **Build and run the app using Docker Compose in detached mode**:
   First, make sure you have Docker and Docker Compose installed.

   Then, in your project directory, run the following command:

   ```bash
   docker-compose up -d
   ```

   This will build the Docker images and start the app and MongoDB container in detached mode.

2. **Access the app**:
   Once the containers are up, open your browser and visit: [http://localhost:3000](http://localhost:3000).

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
├── views/
│   └── index.ejs          # Main template that renders todos
├── public/
│   └── css/
│       └── style.css      # Custom styles for the UI
├── Dockerfile             # Docker configuration for building the app image
├── docker-compose.yml     # Docker Compose configuration to manage containers
```

---

## 📄 License:
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙌 Contributing:
Feel free to fork, modify, and submit pull requests!
