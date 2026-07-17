const Task = require('../models/Task');
const User = require('../models/User');
const { sendTaskEmail } = require('../services/emailService');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// @desc    Get all tasks for logged in user (with optional filtering and search)
// @route   GET /api/tasks
// @access  Private
const getTasks = async (req, res) => {
  try {
    const { status, priority, search, sortBy } = req.query;
    
    // Base query to fetch tasks belonging only to the logged-in user
    let query = { user: req.user.id };

    // Apply filtering by status
    if (status && status !== 'all') {
      query.status = status;
    }

    // Apply filtering by priority
    if (priority && priority !== 'all') {
      query.priority = priority;
    }

    // Apply text search on title or description
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    // Build query execution object
    let taskQuery = Task.find(query);

    // Apply sorting
    if (sortBy) {
      if (sortBy === 'dueDate') {
        taskQuery = taskQuery.sort({ dueDate: 1 }); // earlier dates first
      } else if (sortBy === 'createdAt') {
        taskQuery = taskQuery.sort({ createdAt: -1 }); // newest first
      } else if (sortBy === 'priority') {
        // High priority first. We can do simple custom sorting on frontend, or handle simple sort.
        // For simplicity: priority sort can be sorted on DB level, or default.
        // Let's sort by priority: High, Medium, Low. Mongoose doesn't support custom enums sort natively,
        // so we'll just sort by priority alphabetically or handle it in sorting.
        // Let's sort by createdAt -1 by default or if priority.
        taskQuery = taskQuery.sort({ createdAt: -1 });
      }
    } else {
      // Default sort is newest tasks first
      taskQuery = taskQuery.sort({ createdAt: -1 });
    }

    const tasks = await taskQuery;
    res.status(200).json({ success: true, count: tasks.length, data: tasks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get a single task by ID
// @route   GET /api/tasks/:id
// @access  Private
const getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.query.id || req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    // Make sure task belongs to the user
    if (task.user.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'User not authorized' });
    }

    res.status(200).json({ success: true, data: task });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private
const createTask = async (req, res) => {
  try {
    const { title, description, status, priority, dueDate, tags, subtasks } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, message: 'Please add a task title' });
    }

    const createdTask = await Task.create({
      title,
      description,
      status: status || 'todo',
      priority: priority || 'medium',
      dueDate: dueDate || null,
      tags: tags || [],
      subtasks: subtasks || [],
      history: [{ action: 'Task created' }],
      user: req.user.id,
    });

    // Send task creation email alert
    const userObj = await User.findById(req.user.id);
    if (userObj) {
      await sendTaskEmail(userObj.email, userObj.name, 'New Task Created', createdTask.title, createdTask.status, createdTask.description);
    }

    res.status(201).json({ success: true, data: createdTask });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update a task
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = async (req, res) => {
  try {
    let task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    // Make sure task belongs to the user
    if (task.user.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'User not authorized' });
    }

    const historyLogs = [];

    if (req.body.status && req.body.status !== task.status) {
      historyLogs.push({ action: `Status changed from ${task.status} to ${req.body.status}` });
    }
    if (req.body.priority && req.body.priority !== task.priority) {
      historyLogs.push({ action: `Priority changed from ${task.priority} to ${req.body.priority}` });
    }
    if (req.body.title && req.body.title !== task.title) {
      historyLogs.push({ action: `Title updated to: ${req.body.title}` });
    }
    if (req.body.dueDate !== undefined && req.body.dueDate !== task.dueDate) {
      historyLogs.push({ action: 'Due date updated' });
    }
    if (req.body.subtasks && JSON.stringify(req.body.subtasks) !== JSON.stringify(task.subtasks)) {
      historyLogs.push({ action: 'Checklist updated' });
    }

    if (historyLogs.length > 0) {
      req.body.history = [...(task.history || []), ...historyLogs];
    }

    const wasCompleted = task.status === 'completed';
    const isCompleted = req.body.status === 'completed';

    task = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    // Send completion email alert if task was transitioned to completed
    if (isCompleted && !wasCompleted) {
      const userObj = await User.findById(req.user.id);
      if (userObj) {
        await sendTaskEmail(userObj.email, userObj.name, 'Task Completed! 🎉', task.title, 'completed', task.description);
      }
    }

    res.status(200).json({ success: true, data: task });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    // Make sure task belongs to the user
    if (task.user.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'User not authorized' });
    }

    await Task.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, message: 'Task removed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add a comment to a task
// @route   POST /api/tasks/:id/comments
// @access  Private
const addComment = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ success: false, message: 'Please add comment text' });
    }

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    // Check ownership
    if (task.user.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'User not authorized' });
    }

    const newComment = {
      text,
      user: req.user.id,
      username: req.user.name,
    };

    task.comments.push(newComment);
    task.history.push({ action: `Added a comment: "${text.substring(0, 30)}${text.length > 30 ? '...' : ''}"` });
    
    await task.save();

    res.status(201).json({ success: true, data: task });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a comment from a task
// @route   DELETE /api/tasks/:id/comments/:commentId
// @access  Private
const deleteComment = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    // Check ownership
    if (task.user.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'User not authorized' });
    }

    // Find comment
    const comment = task.comments.id(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found' });
    }

    comment.deleteOne();
    task.history.push({ action: 'Deleted a comment' });

    await task.save();

    res.status(200).json({ success: true, data: task });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get AI suggestions for task metadata based on title
// @route   POST /api/tasks/ai-suggest
// @access  Private
const getAISuggestions = async (req, res) => {
  const { title } = req.body;
  try {
    if (!title) {
      return res.status(400).json({ success: false, message: 'Please provide a task title' });
    }

    if (!process.env.GEMINI_API_KEY) {
      // Fallback Smart Demo Data based on keywords
      const titleLower = title.toLowerCase();
      let description = `This task is designed to focus on: "${title}". Ensure you map out requirements, assign roles, and review before final signoff.`;
      let priority = 'medium';
      let subtasks = [
        { title: 'Write requirement specifications' },
        { title: 'Implement logic implementation' },
        { title: 'Test features and check logic edge-cases' },
        { title: 'Refactor code structure and deploy changes' }
      ];

      if (titleLower.includes('design') || titleLower.includes('ui') || titleLower.includes('ux') || titleLower.includes('css')) {
        description = `Design task focusing on: "${title}". Refine visual components, align fonts, check color contrasts, and ensure glassmorphism fits the theme.`;
        priority = 'low';
        subtasks = [
          { title: 'Create layout wireframes & visual designs' },
          { title: 'Setup responsive breakpoints & CSS variables' },
          { title: 'Review alignment, margins, and dark-theme contrast' },
          { title: 'Test user experience & micro-animations' }
        ];
      } else if (titleLower.includes('code') || titleLower.includes('api') || titleLower.includes('backend') || titleLower.includes('controller') || titleLower.includes('route')) {
        description = `Backend coding task: "${title}". Develop schemas, implement controllers, verify auth security, and test route controllers.`;
        priority = 'high';
        subtasks = [
          { title: 'Develop database schemas and Mongoose models' },
          { title: 'Implement controller handlers & routers' },
          { title: 'Verify authorization middleware & input validation' },
          { title: 'Test API routes via Postman or Insomnia' }
        ];
      } else if (titleLower.includes('deploy') || titleLower.includes('build') || titleLower.includes('git') || titleLower.includes('npm')) {
        description = `Infrastructure task: "${title}". Manage builds, handle environment variables, check configurations, and deploy to server.`;
        priority = 'high';
        subtasks = [
          { title: 'Configure environment variables & secret keys' },
          { title: 'Build production bundle packages' },
          { title: 'Deploy compiled static files and API endpoints' },
          { title: 'Verify server logs and health check URLs' }
        ];
      }

      console.log(`[Gemini AI] Skipped API call because GEMINI_API_KEY is not set. Returned smart mock fallback content.`);
      return res.status(200).json({ 
        success: true, 
        data: { description, priority, subtasks },
        note: 'Mocked task parameters created automatically because GEMINI_API_KEY is missing.'
      });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `Based on the task title: '${title}', generate a detailed task description, list of 3-5 subtask checklist titles, and a recommended priority ('low', 'medium', or 'high') based on typical task complexity. Respond strictly in valid JSON format only, with no markdown formatting around it, matching this schema: { "description": "...", "priority": "...", "subtasks": [ { "title": "..." } ] }`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // Clean response to handle raw JSON string
    const cleanJson = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
    const suggestions = JSON.parse(cleanJson);

    res.status(200).json({ success: true, data: suggestions });
  } catch (error) {
    console.error('[Gemini AI Error]', error);
    
    // Auto fallback to mock data on error so the frontend never crashes!
    const titleLower = title.toLowerCase();
    let description = `This task is designed to focus on: "${title}". Ensure you map out requirements, assign roles, and review before final signoff.`;
    let priority = 'medium';
    let subtasks = [
      { title: 'Write requirement specifications' },
      { title: 'Implement logic implementation' },
      { title: 'Test features and check logic edge-cases' },
      { title: 'Refactor code structure and deploy changes' }
    ];

    if (titleLower.includes('design') || titleLower.includes('ui') || titleLower.includes('ux') || titleLower.includes('css')) {
      description = `Design task focusing on: "${title}". Refine visual components, align fonts, check color contrasts, and ensure glassmorphism fits the theme.`;
      priority = 'low';
      subtasks = [
        { title: 'Create layout wireframes & visual designs' },
        { title: 'Setup responsive breakpoints & CSS variables' },
        { title: 'Review alignment, margins, and dark-theme contrast' },
        { title: 'Test user experience & micro-animations' }
      ];
    } else if (titleLower.includes('code') || titleLower.includes('api') || titleLower.includes('backend') || titleLower.includes('controller') || titleLower.includes('route')) {
      description = `Backend coding task: "${title}". Develop schemas, implement controllers, verify auth security, and test route controllers.`;
      priority = 'high';
      subtasks = [
        { title: 'Develop database schemas and Mongoose models' },
        { title: 'Implement controller handlers & routers' },
        { title: 'Verify authorization middleware & input validation' },
        { title: 'Test API routes via Postman or Insomnia' }
      ];
    } else if (titleLower.includes('deploy') || titleLower.includes('build') || titleLower.includes('git') || titleLower.includes('npm')) {
      description = `Infrastructure task: "${title}". Manage builds, handle environment variables, check configurations, and deploy to server.`;
      priority = 'high';
      subtasks = [
        { title: 'Configure environment variables & secret keys' },
        { title: 'Build production bundle packages' },
        { title: 'Deploy compiled static files and API endpoints' },
        { title: 'Verify server logs and health check URLs' }
      ];
    }

    res.status(200).json({ 
      success: true, 
      data: { description, priority, subtasks },
      note: 'Returned smart mock suggestions because the Gemini API key call returned an error (see server logs).'
    });
  }
};

module.exports = {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  addComment,
  deleteComment,
  getAISuggestions,
};
