import React from 'react';
import { FiCalendar, FiEdit, FiTrash2, FiCheckCircle, FiCircle } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const TaskCard = ({ task, onEdit, onDelete, onStatusChange }) => {
  const navigate = useNavigate();

  // Format date nicely
  const formatDate = (dateString) => {
    if (!dateString) return 'No due date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const isCompleted = task.status === 'completed';

  // Handler to prevent card navigation when clicking on action buttons
  const handleAction = (e, callback) => {
    e.stopPropagation();
    callback();
  };

  return (
    <div
      className="glass-panel"
      onClick={() => navigate(`/task/${task._id}`)}
      style={{
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        cursor: 'pointer',
        position: 'relative',
        height: '100%',
        minHeight: '200px',
        justifyContent: 'space-between',
      }}
    >
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <h3 style={{
            fontSize: '1.15rem',
            fontWeight: 600,
            color: 'white',
            textDecoration: isCompleted ? 'line-through' : 'none',
            opacity: isCompleted ? 0.6 : 1,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}>
            {task.title}
          </h3>
          <button
            onClick={(e) => handleAction(e, () => onStatusChange(task._id, isCompleted ? 'todo' : 'completed'))}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: isCompleted ? 'var(--status-done)' : 'var(--text-muted)',
              transition: 'color 0.2s ease',
              display: 'flex',
              padding: '2px',
            }}
          >
            {isCompleted ? <FiCheckCircle size={22} /> : <FiCircle size={22} />}
          </button>
        </div>

        <p style={{
          fontSize: '0.9rem',
          color: 'var(--text-secondary)',
          opacity: isCompleted ? 0.5 : 0.8,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
          marginBottom: '1rem',
          lineHeight: 1.5,
        }}>
          {task.description || <em>No description provided.</em>}
        </p>
      </div>

      <div>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.5rem',
          marginBottom: '0.75rem',
        }}>
          <span className={`badge badge-${task.status}`}>
            {task.status === 'in-progress' ? 'In Progress' : task.status}
          </span>
          <span className={`badge badge-${task.priority}`}>
            {task.priority}
          </span>
        </div>

        {/* Tags List */}
        {task.tags && task.tags.length > 0 && (
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.3rem',
            marginBottom: '0.75rem',
          }}>
            {task.tags.map((tag) => (
              <span
                key={tag}
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  padding: '0.15rem 0.4rem',
                  borderRadius: '4px',
                  background: 'rgba(124, 58, 237, 0.08)',
                  border: '1px solid rgba(124, 58, 237, 0.15)',
                  color: 'var(--color-primary-hover)',
                  textTransform: 'lowercase',
                }}
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Subtask Progress Indicator */}
        {task.subtasks && task.subtasks.length > 0 && (() => {
          const total = task.subtasks.length;
          const completed = task.subtasks.filter(st => st.completed).length;
          const percent = Math.round((completed / total) * 100);
          return (
            <div style={{ marginBottom: '1rem' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '0.75rem',
                color: 'var(--text-secondary)',
                marginBottom: '0.25rem',
                fontWeight: 500,
              }}>
                <span>Checklist</span>
                <span>{completed}/{total} ({percent}%)</span>
              </div>
              <div style={{
                height: '4px',
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '2px',
                overflow: 'hidden',
                width: '100%',
              }}>
                <div style={{
                  height: '100%',
                  width: `${percent}%`,
                  background: 'linear-gradient(90deg, var(--color-primary) 0%, var(--color-secondary) 100%)',
                  borderRadius: '2px',
                  transition: 'width var(--transition-normal)',
                }}></div>
              </div>
            </div>
          );
        })()}

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderTop: '1px solid rgba(255, 255, 255, 0.05)',
          paddingTop: '0.75rem',
          fontSize: '0.85rem',
          color: 'var(--text-muted)',
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.4rem',
            color: (task.dueDate && task.status !== 'completed' && new Date(task.dueDate).setHours(23, 59, 59, 999) < new Date()) ? '#f87171' : 'inherit',
            fontWeight: (task.dueDate && task.status !== 'completed' && new Date(task.dueDate).setHours(23, 59, 59, 999) < new Date()) ? 600 : 'inherit'
          }}>
            <FiCalendar size={14} color={(task.dueDate && task.status !== 'completed' && new Date(task.dueDate).setHours(23, 59, 59, 999) < new Date()) ? '#f87171' : 'var(--color-secondary)'} />
            <span>{formatDate(task.dueDate)}</span>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={(e) => handleAction(e, () => onEdit(task))}
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '6px',
                padding: '0.35rem 0.5rem',
                cursor: 'pointer',
                color: 'var(--text-secondary)',
                display: 'flex',
                alignItems: 'center',
                transition: 'all 0.2s ease',
              }}
              title="Edit Task"
            >
              <FiEdit size={14} />
            </button>
            <button
              onClick={(e) => handleAction(e, () => onDelete(task._id))}
              style={{
                background: 'rgba(239, 68, 68, 0.05)',
                border: '1px solid rgba(239, 68, 68, 0.1)',
                borderRadius: '6px',
                padding: '0.35rem 0.5rem',
                cursor: 'pointer',
                color: '#f87171',
                display: 'flex',
                alignItems: 'center',
                transition: 'all 0.2s ease',
              }}
              title="Delete Task"
            >
              <FiTrash2 size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
