const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

// Create Express app
const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cors());

// database access
const username=process.env.DB_NAME
const password=process.env.DB_PASS
// Connect to MongoDB
mongoose.connect(`mongodb+srv://${username}:${password}@cluster0.8ldebrq.mongodb.net/Task_Tracker?retryWrites=true&w=majority&appName=Cluster0`, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB');
}).catch((err) => {
  console.error('Error connecting to MongoDB:', err.message);
});

// Define Task schema and model
const TaskSchema = new mongoose.Schema({
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    assignee: {
      type: String,
      default: 'Unassigned' // Default value for assignee
    },
    priority: {
      type: String,
     
      required: true
    },
    status: {
      type: String,
    
      required: true
    },
    dueDate: {
      type: Date,
      default: Date.now // Default value for dueDate (current date)
    }
  });
  
const Task = mongoose.model('Task', TaskSchema);
app.get('/', (req, res) => {
    res.send('Welcome to the Task Tracker API!');
  });
// Routes
app.get('/tasks', async (req, res) => {
  try {
    const tasks = await Task.find();
    res.json(tasks);
  } catch (err) {
    console.error('Error fetching tasks:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});
// Endpoint to update a task by ID
app.put('/tasks/:id', async (req, res) => {
    const { id } = req.params;
    const { title, description, assignee, priority, status } = req.body;
    try {
      const updatedTask = await Task.findByIdAndUpdate(
        id,
        { title, description, assignee, priority, status },
        { new: true }
      );
      if (!updatedTask) {
        return res.status(404).json({ error: 'Task not found' });
      }
      res.json(updatedTask);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });
  
app.post('/tasks', async (req, res) => {
  try {
    const newTask = new Task(req.body);
    await newTask.save();
    res.status(201).json(newTask);
  } catch (err) {
    console.error('Error adding task:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE a task by ID
app.delete('/tasks/:id', async (req, res) => {
    const taskId = req.params.id;
    try {
      await Task.findByIdAndDelete(taskId);
      res.status(200).json({ message: `Task with ID ${taskId} deleted successfully` });
    } catch (err) {
      console.error('Error deleting task:', err.message);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
