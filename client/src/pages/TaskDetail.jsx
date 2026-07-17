import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTaskById, updateTask, deleteTask, addComment, deleteComment } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { FiArrowLeft, FiCalendar, FiClock, FiEdit, FiTrash2, FiActivity, FiCheckSquare, FiSquare, FiMessageSquare, FiSend, FiTrash } from 'react-icons/fi';
import TaskForm from '../components/TaskForm';
import ConfirmModal from '../components/ConfirmModal';
import toast from 'react-hot-toast';

const TaskDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  // Custom Modal States
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  const fetchTaskDetails = async () => {
    try {
      setLoading(true);
      const res = await getTaskById(id);
      if (res.success) {
        setTask(res.data);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load task details');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTaskDetails();
  }, [id]);

  const handleStatusChange = async (newStatus) => {
    try {
      const res = await updateTask(task._id, { status: newStatus });
      if (res.success) {
        setTask(res.data);
        toast.success(`Status updated to ${newStatus === 'in-progress' ? 'in progress' : newStatus}`);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to update status');
    }
  };

  const handleSubtaskToggle = async (index) => {
    try {
      const updatedSubtasks = task.subtasks.map((st, idx) =>
        idx === index ? { ...st, completed: !st.completed } : st
      );
      const res = await updateTask(task._id, { subtasks: updatedSubtasks });
      if (res.success) {
        setTask(res.data);
        toast.success('Checklist item updated');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to update checklist');
    }
  };

  const handleFormSubmit = async (taskData) => {
    try {
      const res = await updateTask(task._id, taskData);
      if (res.success) {
        setTask(res.data);
        toast.success('Task updated successfully');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to update task');
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      const res = await deleteTask(task._id);
      if (res.success) {
        toast.success('Task deleted successfully');
        navigate('/');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete task');
    } finally {
      setIsDeleteModalOpen(false);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      setIsSubmittingComment(true);
      const res = await addComment(task._id, commentText);
      if (res.success) {
        setTask(res.data);
        setCommentText('');
        toast.success('Comment posted successfully');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to add comment');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleCommentDelete = async (commentId) => {
    try {
      const res = await deleteComment(task._id, commentId);
      if (res.success) {
        setTask(res.data);
        toast.success('Comment deleted');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete comment');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No due date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTimestamp = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 'calc(100vh - 80px)',
      }}>
        <div style={{
          border: '3px solid rgba(255,255,255,0.05)',
          borderTop: '3px solid var(--color-primary)',
          borderRadius: '50%',
          width: '40px',
          height: '40px',
          animation: 'spin 1s linear infinite',
        }}></div>
      </div>
    );
  }

  if (!task) return null;

  const isOverdue = task.dueDate && task.status !== 'completed' && new Date(task.dueDate).setHours(23, 59, 59, 999) < new Date();

  return (
    <div style={{
      padding: '2rem',
      maxWidth: '800px',
      margin: '0 auto',
      minHeight: 'calc(100vh - 80px)',
    }}>
      {/* Back Button */}
      <button
        onClick={() => navigate('/')}
        className="btn btn-secondary"
        style={{
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.5rem 1rem',
          borderRadius: '8px',
          fontSize: '0.9rem',
        }}
      >
        <FiArrowLeft size={16} />
        <span>Back to Dashboard</span>
      </button>

      {/* Main detail card */}
      <div className="glass-panel animate-slide-up" style={{
        padding: '2.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '2rem',
      }}>
        {/* Header section */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '1rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
          paddingBottom: '1.5rem',
        }}>
          <div>
            <h1 style={{ fontSize: '2rem', color: 'white', marginBottom: '0.75rem', lineHeight: 1.2 }}>
              {task.title}
            </h1>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <span className={`badge badge-${task.status}`}>
                {task.status === 'in-progress' ? 'In Progress' : task.status}
              </span>
              <span className={`badge badge-${task.priority}`}>
                {task.priority} Priority
              </span>
              
              {/* Tags Display */}
              {task.tags && task.tags.map((tag) => (
                <span
                  key={tag}
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    padding: '0.2rem 0.6rem',
                    borderRadius: '6px',
                    background: 'rgba(124, 58, 237, 0.08)',
                    border: '1px solid rgba(124, 58, 237, 0.15)',
                    color: 'var(--color-primary-hover)',
                  }}
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          {/* Quick status controls */}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => setIsFormOpen(true)}
              className="btn btn-secondary"
              style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
            >
              <FiEdit size={14} />
              <span>Edit</span>
            </button>
            <button
              onClick={() => setIsDeleteModalOpen(true)}
              className="btn btn-danger"
              style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
            >
              <FiTrash2 size={14} />
              <span>Delete</span>
            </button>
          </div>
        </div>

        {/* Description Section */}
        <div>
          <h3 style={{ fontSize: '1rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.75rem', letterSpacing: '0.05em' }}>
            Description
          </h3>
          <p style={{
            color: 'var(--text-primary)',
            fontSize: '1.05rem',
            lineHeight: 1.6,
            whiteSpace: 'pre-wrap',
            background: 'rgba(255, 255, 255, 0.02)',
            padding: '1.5rem',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.04)',
          }}>
            {task.description || <span style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>No description provided.</span>}
          </p>
        </div>

        {/* Subtasks Checklist Section */}
        {task.subtasks && task.subtasks.length > 0 && (
          <div>
            <h3 style={{ fontSize: '1rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.75rem', letterSpacing: '0.05em' }}>
              Checklist Progress ({task.subtasks.filter(st => st.completed).length} / {task.subtasks.length} Completed)
            </h3>
            
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
              background: 'rgba(255, 255, 255, 0.02)',
              padding: '1.25rem',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.04)',
            }}>
              {task.subtasks.map((st, index) => (
                <div
                  key={index}
                  onClick={() => handleSubtaskToggle(index)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    cursor: 'pointer',
                    userSelect: 'none',
                    padding: '0.25rem 0',
                    transition: 'opacity 0.2s',
                  }}
                >
                  <span style={{
                    color: st.completed ? 'var(--status-done)' : 'var(--text-muted)',
                    display: 'flex',
                  }}>
                    {st.completed ? <FiCheckSquare size={20} /> : <FiSquare size={20} />}
                  </span>
                  <span style={{
                    fontSize: '1rem',
                    color: st.completed ? 'var(--text-muted)' : 'var(--text-primary)',
                    textDecoration: st.completed ? 'line-through' : 'none',
                    transition: 'all 0.2s ease',
                  }}>
                    {st.title}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Comments Section */}
        <div>
          <h3 style={{ fontSize: '1rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.75rem', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FiMessageSquare size={16} />
            <span>Comments ({task.comments ? task.comments.length : 0})</span>
          </h3>

          <form onSubmit={handleCommentSubmit} style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <input
              type="text"
              className="input-control"
              placeholder="Write a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              required
            />
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmittingComment}
              style={{ padding: '0.5rem 1.25rem' }}
            >
              <FiSend size={16} />
            </button>
          </form>

          {task.comments && task.comments.length > 0 ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              background: 'rgba(255, 255, 255, 0.01)',
              padding: '1.25rem',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.03)',
              maxHeight: '300px',
              overflowY: 'auto'
            }}>
              {task.comments.slice().reverse().map((comm) => {
                const isAuthor = user && comm.user === user._id;
                return (
                  <div key={comm._id} style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.35rem',
                    borderBottom: '1px solid rgba(255,255,255,0.03)',
                    paddingBottom: '0.75rem'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'white' }}>{comm.username}</span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{formatTimestamp(comm.createdAt)}</span>
                      </div>
                      {isAuthor && (
                        <button
                          type="button"
                          onClick={() => handleCommentDelete(comm._id)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'rgba(239, 68, 68, 0.7)',
                            cursor: 'pointer',
                            padding: '4px',
                            display: 'flex'
                          }}
                        >
                          <FiTrash size={12} />
                        </button>
                      )}
                    </div>
                    <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.4, margin: 0 }}>
                      {comm.text}
                    </p>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
              No comments yet. Write a note to start the conversation!
            </div>
          )}
        </div>

        {/* Activity History Timeline */}
        {task.history && task.history.length > 0 && (
          <div>
            <h3 style={{ fontSize: '1rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.75rem', letterSpacing: '0.05em' }}>
              Activity History
            </h3>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              background: 'rgba(255, 255, 255, 0.02)',
              padding: '1.25rem',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.04)',
              maxHeight: '200px',
              overflowY: 'auto',
            }}>
              {task.history.slice().reverse().map((hist, index) => (
                <div key={index} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '0.85rem',
                  borderBottom: index === task.history.length - 1 ? 'none' : '1px solid rgba(255,255,255,0.03)',
                  paddingBottom: '0.5rem',
                }}>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                    {hist.action}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {formatTimestamp(hist.timestamp)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Details / Dates Meta Section */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1.5rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.05)',
          paddingTop: '1.5rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '8px',
              background: isOverdue ? 'rgba(239, 68, 68, 0.1)' : 'rgba(6, 182, 212, 0.08)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              color: isOverdue ? '#f87171' : 'var(--color-secondary)',
            }}>
              <FiCalendar size={18} />
            </div>
            <div>
              <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Due Date</span>
              <span style={{ 
                fontSize: '0.95rem', 
                fontWeight: 600, 
                color: isOverdue ? '#f87171' : 'var(--text-primary)' 
              }}>{formatDate(task.dueDate)}</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '8px',
              background: 'rgba(124, 58, 237, 0.08)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              color: 'var(--color-primary)',
            }}>
              <FiClock size={18} />
            </div>
            <div>
              <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Created</span>
              <span style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>{formatTimestamp(task.createdAt)}</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '8px',
              background: 'rgba(124, 58, 237, 0.08)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              color: 'var(--color-primary)',
            }}>
              <FiActivity size={18} />
            </div>
            <div>
              <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Last Updated</span>
              <span style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>{formatTimestamp(task.updatedAt)}</span>
            </div>
          </div>
        </div>

        {/* Change Status inline dropdown */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.05)',
          paddingTop: '1.5rem',
        }}>
          <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Update Status:</span>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {['todo', 'in-progress', 'completed'].map((statusOption) => {
              const isActive = task.status === statusOption;
              return (
                <button
                  key={statusOption}
                  onClick={() => handleStatusChange(statusOption)}
                  className={`btn ${isActive ? '' : 'btn-secondary'}`}
                  style={{
                    padding: '0.4rem 0.8rem',
                    fontSize: '0.8rem',
                    borderRadius: '8px',
                    backgroundColor: isActive ? undefined : 'rgba(255,255,255,0.02)',
                    borderColor: isActive ? undefined : 'rgba(255,255,255,0.06)',
                    color: isActive ? undefined : 'var(--text-secondary)',
                    fontWeight: isActive ? 600 : 500,
                  }}
                >
                  {statusOption === 'in-progress' ? 'In Progress' : statusOption.toUpperCase()}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Task Form Modal for editing */}
      <TaskForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        initialTask={task}
      />

      {/* Custom Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        title="Delete Task"
        message="Are you sure you want to delete this task? This action cannot be undone."
        onConfirm={handleDeleteConfirm}
        onCancel={() => setIsDeleteModalOpen(false)}
        confirmText="Delete"
      />
    </div>
  );
};

export default TaskDetail;
