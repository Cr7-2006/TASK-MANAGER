import React from 'react';
import { FiSearch, FiSliders } from 'react-icons/fi';

const TaskFilter = ({ search, setSearch, sortBy, setSortBy, priorityFilter, setPriorityFilter }) => {
  return (
    <div className="glass-panel" style={{
      padding: '1.25rem',
      display: 'flex',
      flexWrap: 'wrap',
      gap: '1rem',
      alignItems: 'center',
      justifyContent: 'space-between',
      width: '100%',
    }}>
      {/* Search Input */}
      <div style={{
        position: 'relative',
        flex: '1 1 300px',
      }}>
        <FiSearch style={{
          position: 'absolute',
          left: '1rem',
          top: '50%',
          transform: 'translateY(-50%)',
          color: 'var(--text-muted)',
        }} />
        <input
          type="text"
          className="input-control"
          placeholder="Search tasks by title or description..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            paddingLeft: '2.5rem',
          }}
        />
      </div>

      {/* Select Filters Group */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.75rem',
        alignItems: 'center',
        flex: '1 1 auto',
        justifyContent: 'flex-end',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FiSliders size={16} color="var(--color-secondary)" />
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Filters:</span>
        </div>

        {/* Priority Filter */}
        <select
          className="input-control"
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          style={{
            width: 'auto',
            padding: '0.5rem 2rem 0.5rem 1rem',
            fontSize: '0.85rem',
            height: '38px',
          }}
        >
          <option value="all">All Priorities</option>
          <option value="low">Low Priority</option>
          <option value="medium">Medium Priority</option>
          <option value="high">High Priority</option>
        </select>

        {/* Sort By Filter */}
        <select
          className="input-control"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          style={{
            width: 'auto',
            padding: '0.5rem 2rem 0.5rem 1rem',
            fontSize: '0.85rem',
            height: '38px',
          }}
        >
          <option value="createdAt">Sort by: Newest</option>
          <option value="dueDate">Sort by: Due Date</option>
        </select>
      </div>
    </div>
  );
};

export default TaskFilter;
