import React, { useState, useEffect } from 'react';
import { FiX, FiCheck, FiPlus, FiTrash2, FiCpu } from 'react-icons/fi';
import { getAISuggestions } from '../services/api';
import toast from 'react-hot-toast';

const TaskForm = ({ isOpen, onClose, onSubmit, initialTask }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('todo');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState('');
  
  // Tags State
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');

  // Subtasks State
  const [subtasks, setSubtasks] = useState([]);
  const [subtaskInput, setSubtaskInput] = useState('');

  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialTask) {
      setTitle(initialTask.title || '');
      setDescription(initialTask.description || '');
      setStatus(initialTask.status || 'todo');
      setPriority(initialTask.priority || 'medium');
      setTags(initialTask.tags || []);
      setSubtasks(initialTask.subtasks || []);
      
      if (initialTask.dueDate) {
        const date = new Date(initialTask.dueDate);
        const formattedDate = date.toISOString().split('T')[0];
        setDueDate(formattedDate);
      } else {
        setDueDate('');
      }
    } else {
      setTitle('');
      setDescription('');
      setStatus('todo');
      setPriority('medium');
      setDueDate('');
      setTags([]);
      setSubtasks([]);
    }
    setError('');
  }, [initialTask, isOpen]);

  // AI Task Suggestion Handler
  const handleAISuggest = async () => {
    if (!title.trim()) {
      setError('Please enter a task title first so the AI has context!');
      return;
    }
    setError('');
    try {
      setIsGeneratingAI(true);
      const res = await getAISuggestions(title);
      if (res.success && res.data) {
        const { description: aiDesc, priority: aiPriority, subtasks: aiSubtasks } = res.data;
        if (aiDesc) setDescription(aiDesc);
        if (aiPriority) setPriority(aiPriority.toLowerCase());
        if (aiSubtasks && Array.isArray(aiSubtasks)) {
          setSubtasks(aiSubtasks.map(st => ({ title: st.title, completed: false })));
        }
        toast.success('AI suggestions populated!');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to fetch AI suggestions. Please check your server config.');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  if (!isOpen) return null;

  // Add Tag
  const handleAddTag = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const cleanTag = tagInput.trim().toLowerCase();
      if (cleanTag && !tags.includes(cleanTag)) {
        setTags([...tags, cleanTag]);
      }
      setTagInput('');
    }
  };

  // Remove Tag
  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  // Add Subtask
  const handleAddSubtask = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      triggerAddSubtask();
    }
  };

  const triggerAddSubtask = () => {
    const cleanSubtask = subtaskInput.trim();
    if (cleanSubtask) {
      setSubtasks([...subtasks, { title: cleanSubtask, completed: false }]);
      setSubtaskInput('');
    }
  };

  // Remove Subtask
  const handleRemoveSubtask = (indexToRemove) => {
    setSubtasks(subtasks.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Task title is required');
      return;
    }

    const taskData = {
      title,
      description,
      status,
      priority,
      dueDate: dueDate || null,
      tags,
      subtasks,
    };

    onSubmit(taskData);
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(5, 6, 15, 0.8)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
      animation: 'fadeIn 0.2s ease',
    }}>
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '520px',
        maxHeight: '90vh',
        overflowY: 'auto',
        padding: '2rem',
        position: 'relative',
        animation: 'slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            background: 'transparent',
            border: 'none',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            borderRadius: '50%',
            transition: 'background-color 0.2s',
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255,255,255,0.05)'}
          onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
        >
          <FiX size={20} />
        </button>

        <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: 'white' }}>
          {initialTask ? 'Edit Task' : 'Create New Task'}
        </h2>

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            color: '#f87171',
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            marginBottom: '1rem',
            fontSize: '0.9rem',
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Title</span>
              {!initialTask && (
                <button
                  type="button"
                  onClick={handleAISuggest}
                  disabled={isGeneratingAI}
                  style={{
                    background: 'rgba(124, 58, 237, 0.1)',
                    border: '1px solid rgba(124, 58, 237, 0.25)',
                    color: 'var(--color-primary-hover)',
                    borderRadius: '6px',
                    padding: '0.2rem 0.5rem',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    transition: 'all 0.2s',
                  }}
                  title="Generate description and checklist items using Gemini AI"
                >
                  <FiCpu 
                    size={12} 
                    style={{ 
                      animation: isGeneratingAI ? 'spin 1s linear infinite' : 'none'
                    }} 
                  />
                  <span>{isGeneratingAI ? 'AI Suggesting...' : 'AI Auto-Fill'}</span>
                </button>
              )}
            </label>
            <input
              type="text"
              className="input-control"
              placeholder="e.g. Design Landing Page"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="input-control"
              placeholder="Provide a detailed description of the task..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="3"
              style={{ resize: 'none' }}
            />
          </div>

          {/* Tags Section */}
          <div className="form-group">
            <label className="form-label">Tags (Press Enter to Add)</label>
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.5rem',
              marginBottom: tags.length > 0 ? '0.5rem' : '0',
            }}>
              {tags.map((tag) => (
                <span
                  key={tag}
                  style={{
                    background: 'rgba(124, 58, 237, 0.15)',
                    color: 'var(--color-primary-hover)',
                    border: '1px solid rgba(124, 58, 237, 0.25)',
                    borderRadius: '6px',
                    padding: '0.2rem 0.5rem',
                    fontSize: '0.8rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                    fontWeight: 600,
                  }}
                >
                  <span>{tag}</span>
                  <FiX
                    size={12}
                    onClick={() => handleRemoveTag(tag)}
                    style={{ cursor: 'pointer', opacity: 0.8 }}
                  />
                </span>
              ))}
            </div>
            <input
              type="text"
              className="input-control"
              placeholder="e.g. frontend, design"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
            />
          </div>

          {/* Subtasks Section */}
          <div className="form-group">
            <label className="form-label">Checklist Items</label>
            
            {subtasks.length > 0 && (
              <div style={{
                maxHeight: '150px',
                overflowY: 'auto',
                marginBottom: '0.75rem',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '0.5rem',
                background: 'rgba(255,255,255,0.01)',
              }}>
                {subtasks.map((st, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.4rem 0.5rem',
                      borderBottom: idx === subtasks.length - 1 ? 'none' : '1px solid rgba(255,255,255,0.04)',
                    }}
                  >
                    <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                      {st.title}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSubtask(idx)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'rgba(239, 68, 68, 0.7)',
                        cursor: 'pointer',
                        display: 'flex',
                        padding: '4px',
                      }}
                    >
                      <FiTrash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                className="input-control"
                placeholder="e.g. Set up API endpoints"
                value={subtaskInput}
                onChange={(e) => setSubtaskInput(e.target.value)}
                onKeyDown={handleAddSubtask}
              />
              <button
                type="button"
                className="btn btn-secondary"
                onClick={triggerAddSubtask}
                style={{ padding: '0.5rem 1rem' }}
              >
                <FiPlus size={16} />
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select
                className="input-control"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Priority</label>
              <select
                className="input-control"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Due Date</label>
            <input
              type="date"
              className="input-control"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', justifyContent: 'flex-end' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <FiCheck />
              <span>{initialTask ? 'Save Changes' : 'Create Task'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskForm;
