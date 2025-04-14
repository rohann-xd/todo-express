const Todo = require("../models/Todo");

// Display all todos
exports.getTodos = async (req, res) => {
  try {
    const todos = await Todo.find();
    res.status(200).render("index", { todos });
  } catch (error) {
    res.status(500).send("Server Error");
  }
};

// Add a new todo
exports.addTodo = async (req, res) => {
  const { task } = req.body;

  if (!task.trim()) {
    return res.redirect("/");
  }

  await Todo.create({ task, completed: false });
  res.redirect("/");
};

// Toggle complete/incomplete
exports.completeTodo = async (req, res) => {
  const { id } = req.params;
  const completed = req.body.completed === "true";

  await Todo.findByIdAndUpdate(id, { completed });
  res.redirect("/");
};

// Delete a todo
exports.deleteTodo = async (req, res) => {
  const { id } = req.params;
  await Todo.findByIdAndDelete(id);
  res.redirect("/");
};
