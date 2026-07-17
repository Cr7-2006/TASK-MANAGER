const express = require('express');
const router = express.Router();
const {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  addComment,
  deleteComment,
  getAISuggestions,
} = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');

// Protect all task routes
router.use(protect);

// Task CRUD routes
router.route('/')
  .get(getTasks)
  .post(createTask);

router.route('/ai-suggest')
  .post(getAISuggestions);

router.route('/:id')
  .get(getTaskById)
  .put(updateTask)
  .delete(deleteTask);

// Task Comments routes
router.route('/:id/comments')
  .post(addComment);

router.route('/:id/comments/:commentId')
  .delete(deleteComment);

module.exports = router;
