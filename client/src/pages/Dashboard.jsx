import React, { useState, useEffect } from 'react';
import { getTasks, createTask, updateTask, deleteTask } from '../services/api';
import StatsCard from '../components/StatsCard';
import Sidebar from '../components/Sidebar';
import TaskFilter from '../components/TaskFilter';
import TaskCard from '../components/TaskCard';
import TaskForm from '../components/TaskForm';
import Analytics from '../components/Analytics';
import ConfirmModal from '../components/ConfirmModal';
import { FiPlus, FiList, FiClock, FiTrendingUp, FiCheckCircle, FiInbox, FiGrid, FiDownload } from 'react-icons/fi';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentFilter, setCurrentFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [selectedTag, setSelectedTag] = useState(null);

  // Kanban Board Drag & Drop States
  const [viewType, setViewType] = useState('list'); // 'list' or 'board'
  const [activeDragOverColumn, setActiveDragOverColumn] = useState(null);

  // Modal States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  
  // Custom Confirmation Modal States
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);

  // Search Debouncing Effect (300ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  // Fetch Tasks
  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await getTasks();
      if (res.success) {
        setTasks(res.data);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // Calculate Statistics based on ALL tasks
  const stats = {
    all: tasks.length,
    todo: tasks.filter(t => t.status === 'todo').length,
    inProgress: tasks.filter(t => t.status === 'in-progress').length,
    completed: tasks.filter(t => t.status === 'completed').length,
  };

  // Filter & Sort Logic (Snappy Client-side)
  const filteredTasks = tasks
    .filter((task) => {
      // 1. Status Filter
      if (currentFilter !== 'all' && task.status !== currentFilter) return false;
      // 2. Priority Filter
      if (priorityFilter !== 'all' && task.priority !== priorityFilter) return false;
      // 2.5 Tag Filter
      if (selectedTag && !task.tags?.includes(selectedTag)) return false;
      // 3. Search Query (uses debounced state)
      if (debouncedSearch.trim() !== '') {
        const query = debouncedSearch.toLowerCase();
        const matchesTitle = task.title.toLowerCase().includes(query);
        const matchesDesc = task.description?.toLowerCase().includes(query);
        return matchesTitle || matchesDesc;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'dueDate') {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate) - new Date(b.dueDate);
      }
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

  // Group tasks by status for Kanban Board
  const boardTasks = {
    todo: filteredTasks.filter(t => t.status === 'todo'),
    'in-progress': filteredTasks.filter(t => t.status === 'in-progress'),
    completed: filteredTasks.filter(t => t.status === 'completed'),
  };

  // Extract unique tags from all tasks
  const allTags = Array.from(
    new Set(tasks.flatMap(task => task.tags || []))
  ).filter(Boolean);

  // HTML5 Drag and Drop Handlers
  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData('text/plain', taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDragEnter = (e, columnId) => {
    e.preventDefault();
    setActiveDragOverColumn(columnId);
  };

  const handleDragLeave = (e, columnId) => {
    if (activeDragOverColumn === columnId) {
      setActiveDragOverColumn(null);
    }
  };

  const handleDrop = async (e, targetStatus) => {
    e.preventDefault();
    setActiveDragOverColumn(null);
    const taskId = e.dataTransfer.getData('text/plain');
    if (!taskId) return;

    const taskToMove = tasks.find(t => t._id === taskId);
    if (!taskToMove) return;
    if (taskToMove.status === targetStatus) return;

    // Optimistic UI update for immediate response
    const originalTasks = [...tasks];
    setTasks(prevTasks => prevTasks.map(t => (t._id === taskId ? { ...t, status: targetStatus } : t)));

    try {
      const res = await updateTask(taskId, { status: targetStatus });
      if (res.success) {
        setTasks(originalTasks.map(t => (t._id === taskId ? res.data : t)));
        toast.success(`Task moved to ${targetStatus === 'in-progress' ? 'in progress' : targetStatus}`);
      } else {
        setTasks(originalTasks);
        toast.error('Failed to move task');
      }
    } catch (err) {
      console.error(err);
      setTasks(originalTasks);
      toast.error('Failed to move task');
    }
  };

  // Handle task submission (create or update)
  const handleFormSubmit = async (taskData) => {
    try {
      if (editingTask) {
        const res = await updateTask(editingTask._id, taskData);
        if (res.success) {
          setTasks(prevTasks => prevTasks.map(t => (t._id === editingTask._id ? res.data : t)));
          toast.success('Task updated successfully');
        }
      } else {
        const res = await createTask(taskData);
        if (res.success) {
          setTasks(prevTasks => [res.data, ...prevTasks]);
          toast.success('Task created successfully');
        }
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to save task');
    } finally {
      setEditingTask(null);
    }
  };

  // Open form for editing
  const handleEditClick = (task) => {
    setEditingTask(task);
    setIsFormOpen(true);
  };

  // Open Delete Confirmation Modal
  const handleDeleteClick = (id) => {
    setTaskToDelete(id);
    setIsDeleteModalOpen(true);
  };

  // Confirm Delete Task
  const handleDeleteConfirm = async () => {
    if (!taskToDelete) return;
    try {
      const res = await deleteTask(taskToDelete);
      if (res.success) {
        setTasks(prevTasks => prevTasks.map(t => t).filter(t => t._id !== taskToDelete));
        toast.success('Task deleted successfully');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete task');
    } finally {
      setIsDeleteModalOpen(false);
      setTaskToDelete(null);
    }
  };

  // Quick toggle task status from card clicks
  const handleStatusChange = async (id, newStatus) => {
    try {
      const res = await updateTask(id, { status: newStatus });
      if (res.success) {
        setTasks(prevTasks => prevTasks.map(t => (t._id === id ? res.data : t)));
        toast.success(`Task status updated to ${newStatus === 'in-progress' ? 'in progress' : newStatus}`);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to update task status');
    }
  };

  // Export Tasks to CSV
  const exportToCSV = () => {
    if (filteredTasks.length === 0) {
      toast.error('No tasks found to export');
      return;
    }

    const headers = ['Title', 'Description', 'Status', 'Priority', 'Due Date', 'Created At'];
    const rows = filteredTasks.map(task => [
      `"${task.title.replace(/"/g, '""')}"`,
      `"${(task.description || '').replace(/"/g, '""')}"`,
      `"${task.status}"`,
      `"${task.priority}"`,
      `"${task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'None'}"`,
      `"${new Date(task.createdAt).toLocaleString()}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `taskmaster_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Tasks exported to CSV successfully!');
  };

  // Board view layout
  const renderBoardView = () => {
    const columns = [
      { id: 'todo', title: 'To Do', color: 'var(--status-todo)' },
      { id: 'in-progress', title: 'In Progress', color: 'var(--status-progress)' },
      { id: 'completed', title: 'Completed', color: 'var(--status-done)' }
    ];

    return (
      <div className="kanban-container">
        {columns.map(col => {
          const colTasks = boardTasks[col.id] || [];
          const isDragOver = activeDragOverColumn === col.id;

          return (
            <div key={col.id} className="kanban-column">
              <div className="kanban-column-header">
                <div className="kanban-column-title-wrapper">
                  <span style={{ 
                    width: '10px', 
                    height: '10px', 
                    borderRadius: '50%', 
                    background: col.color,
                    display: 'inline-block'
                  }}></span>
                  <h3 className="kanban-column-title">{col.title}</h3>
                </div>
                <span className="kanban-column-badge">{colTasks.length}</span>
              </div>
              <div 
                className={`kanban-column-body ${isDragOver ? 'drag-over' : ''}`}
                onDragOver={handleDragOver}
                onDragEnter={(e) => handleDragEnter(e, col.id)}
                onDragLeave={(e) => handleDragLeave(e, col.id)}
                onDrop={(e) => handleDrop(e, col.id)}
              >
                {colTasks.length > 0 ? (
                  colTasks.map(task => (
                    <div 
                      key={task._id} 
                      draggable="true"
                      onDragStart={(e) => handleDragStart(e, task._id)}
                      className="kanban-draggable-card"
                    >
                      <TaskCard
                        task={task}
                        onEdit={handleEditClick}
                        onDelete={handleDeleteClick}
                        onStatusChange={handleStatusChange}
                      />
                    </div>
                  ))
                ) : (
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    minHeight: '150px',
                    color: 'var(--text-muted)',
                    fontSize: '0.85rem',
                    textAlign: 'center',
                    border: '1px dashed rgba(255,255,255,0.06)',
                    borderRadius: '10px',
                    padding: '1.5rem',
                    margin: '0.5rem 0'
                  }}>
                    Drag tasks here
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div style={{
      padding: '2rem',
      maxWidth: '1200px',
      margin: '0 auto',
      display: 'flex',
      flexDirection: 'column',
      gap: '2rem',
      minHeight: 'calc(100vh - 80px)',
    }}>
      {/* Stats Section */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '1.25rem',
      }}>
        <StatsCard
          title="Total Tasks"
          value={stats.all}
          icon={<FiList size={22} />}
          gradient="radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)"
        />
        <StatsCard
          title="To Do"
          value={stats.todo}
          icon={<FiClock size={22} />}
          color="var(--status-todo)"
          gradient="radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)"
        />
        <StatsCard
          title="In Progress"
          value={stats.inProgress}
          icon={<FiTrendingUp size={22} />}
          color="var(--status-progress)"
          gradient="radial-gradient(circle, rgba(234,179,8,0.15) 0%, transparent 70%)"
        />
        <StatsCard
          title="Completed"
          value={stats.completed}
          icon={<FiCheckCircle size={22} />}
          color="var(--status-done)"
          gradient="radial-gradient(circle, rgba(16,185,129,0.15) 0%, transparent 70%)"
        />
      </div>

      {/* Main Workspace Layout */}
      <div style={{
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: '2rem',
        alignItems: 'flex-start',
      }}>
        {/* Left side Sidebar */}
        <Sidebar
          stats={stats}
          currentFilter={currentFilter}
          setCurrentFilter={setCurrentFilter}
          tags={allTags}
          selectedTag={selectedTag}
          setSelectedTag={setSelectedTag}
        />

        {/* Right side Dashboard Content */}
        <div style={{
          flex: '1 1 600px',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
        }}>
          {/* Insights Analytics Panel */}
          <Analytics tasks={tasks} />

          {/* Filters Bar & Add Button */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem',
            }}>
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'white' }}>Your Workspace</h2>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  Manage, prioritize, and track your ongoing projects.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                {/* Export & View Switcher Toggles */}
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <button 
                    className="btn btn-secondary"
                    onClick={exportToCSV}
                    style={{
                      padding: '0.5rem 1rem',
                      fontSize: '0.85rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)',
                      background: 'rgba(255,255,255,0.03)'
                    }}
                    title="Export tasks to CSV"
                  >
                    <FiDownload size={14} />
                    <span>Export</span>
                  </button>

                  <div className="view-switcher-group">
                    <button 
                      className={`view-switcher-btn ${viewType === 'list' ? 'active' : ''}`}
                      onClick={() => setViewType('list')}
                      title="List View"
                    >
                      <FiList size={16} />
                      <span>List</span>
                    </button>
                    <button 
                      className={`view-switcher-btn ${viewType === 'board' ? 'active' : ''}`}
                      onClick={() => setViewType('board')}
                      title="Kanban Board View"
                    >
                      <FiGrid size={16} />
                      <span>Board</span>
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setEditingTask(null);
                    setIsFormOpen(true);
                  }}
                  className="btn btn-primary"
                  style={{
                    padding: '0.75rem 1.25rem',
                    fontSize: '0.9rem',
                  }}
                >
                  <FiPlus size={16} />
                  <span>Add Task</span>
                </button>
              </div>
            </div>

            <TaskFilter
              search={search}
              setSearch={setSearch}
              sortBy={sortBy}
              setSortBy={setSortBy}
              priorityFilter={priorityFilter}
              setPriorityFilter={setPriorityFilter}
            />
          </div>

          {/* Conditional Layout (List or Board view) */}
          {loading ? (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '5rem 0',
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
          ) : filteredTasks.length > 0 ? (
            viewType === 'list' ? (
              /* List View Grid */
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '1.25rem',
              }}>
                {filteredTasks.map((task) => (
                  <div key={task._id} className="animate-fade-in">
                    <TaskCard
                      task={task}
                      onEdit={handleEditClick}
                      onDelete={handleDeleteClick}
                      onStatusChange={handleStatusChange}
                    />
                  </div>
                ))}
              </div>
            ) : (
              /* Board View Kanban columns */
              renderBoardView()
            )
          ) : (
            /* Empty State */
            <div className="glass-panel" style={{
              padding: '4rem 2rem',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '1rem',
              color: 'var(--text-secondary)',
            }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.05)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                color: 'var(--color-primary)',
              }}>
                <FiInbox size={32} />
              </div>
              <h3 style={{ color: 'white', fontSize: '1.2rem', fontWeight: 600 }}>No tasks found</h3>
              <p style={{ maxWidth: '360px', fontSize: '0.9rem', lineHeight: 1.5 }}>
                {search || priorityFilter !== 'all' || currentFilter !== 'all'
                  ? 'No tasks match your filter criteria. Try resetting them!'
                  : 'Start your journey by creating your very first task right now!'}
              </p>
              {!search && priorityFilter === 'all' && currentFilter === 'all' && (
                <button
                  onClick={() => setIsFormOpen(true)}
                  className="btn btn-secondary"
                  style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}
                >
                  Create Task
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Task Form Modal */}
      <TaskForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingTask(null);
        }}
        onSubmit={handleFormSubmit}
        initialTask={editingTask}
      />

      {/* Custom Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        title="Delete Task"
        message="Are you sure you want to delete this task? This action cannot be undone."
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setIsDeleteModalOpen(false);
          setTaskToDelete(null);
        }}
        confirmText="Delete"
      />
    </div>
  );
};

export default Dashboard;
