import React from 'react';
import { FiCheckCircle, FiClock, FiList, FiAlertTriangle, FiTag } from 'react-icons/fi';

const Sidebar = ({ stats, currentFilter, setCurrentFilter, tags = [], selectedTag, setSelectedTag }) => {
  const filterItems = [
    { id: 'all', label: 'All Tasks', icon: <FiList size={18} />, count: stats.all || 0 },
    { id: 'todo', label: 'To Do', icon: <FiClock size={18} />, count: stats.todo || 0, color: 'var(--status-todo)' },
    { id: 'in-progress', label: 'In Progress', icon: <FiAlertTriangle size={18} />, count: stats.inProgress || 0, color: 'var(--status-progress)' },
    { id: 'completed', label: 'Completed', icon: <FiCheckCircle size={18} />, count: stats.completed || 0, color: 'var(--status-done)' },
  ];

  const handleTagClick = (tag) => {
    if (selectedTag === tag) {
      setSelectedTag(null); // Deselect
    } else {
      setSelectedTag(tag); // Select
    }
  };

  return (
    <aside className="glass-panel" style={{
      padding: '2rem 1.5rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '1.75rem',
      height: 'fit-content',
      width: '100%',
      maxWidth: '300px',
      position: 'sticky',
      top: '90px',
    }}>
      {/* Categories section */}
      <div>
        <h3 style={{
          fontSize: '0.8rem',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          color: 'var(--text-muted)',
          marginBottom: '0.75rem',
        }}>Categories</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          {filterItems.map((item) => {
            const isActive = currentFilter === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentFilter(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '10px',
                  background: isActive ? 'rgba(124, 58, 237, 0.12)' : 'transparent',
                  border: isActive ? '1px solid rgba(124, 58, 237, 0.3)' : '1px solid transparent',
                  color: isActive ? 'var(--color-primary-hover)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontSize: '0.95rem',
                  fontWeight: isActive ? 600 : 500,
                  transition: 'all 0.2s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ color: isActive ? 'var(--color-primary)' : 'inherit' }}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>
                <span style={{
                  fontSize: '0.8rem',
                  padding: '0.1rem 0.5rem',
                  borderRadius: '6px',
                  background: isActive ? 'rgba(124, 58, 237, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                  color: isActive ? 'white' : 'var(--text-muted)',
                  fontWeight: 600,
                }}>{item.count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tags section */}
      {tags.length > 0 && (
        <div style={{
          borderTop: '1px solid rgba(255, 255, 255, 0.05)',
          paddingTop: '1.25rem',
        }}>
          <h3 style={{
            fontSize: '0.8rem',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            color: 'var(--text-muted)',
            marginBottom: '0.75rem',
          }}>Filter by Tag</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
            {tags.map((tag) => {
              const isSelected = selectedTag === tag;
              return (
                <button
                  key={tag}
                  onClick={() => handleTagClick(tag)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                    padding: '0.35rem 0.65rem',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    background: isSelected ? 'rgba(124, 58, 237, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                    border: isSelected ? '1px solid rgba(124, 58, 237, 0.4)' : '1px solid rgba(255, 255, 255, 0.05)',
                    color: isSelected ? 'white' : 'var(--text-secondary)',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <FiTag size={12} style={{ opacity: 0.8 }} />
                  <span>{tag}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Quick tip section */}
      <div style={{
        borderTop: '1px solid rgba(255, 255, 255, 0.05)',
        paddingTop: '1.25rem',
      }}>
        <div style={{
          background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.08) 0%, rgba(6, 182, 212, 0.08) 100%)',
          border: '1px solid rgba(124, 58, 237, 0.15)',
          borderRadius: '12px',
          padding: '1rem',
          textAlign: 'center',
        }}>
          <h4 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.4rem', color: 'white' }}>Quick Tip</h4>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
            Organize tasks by status and set priorities to track your day-to-day productivity effectively!
          </p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
