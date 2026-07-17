import React from 'react';

const Analytics = ({ tasks = [] }) => {
  const total = tasks.length;
  
  // Calculate status counts
  const todo = tasks.filter(t => t.status === 'todo').length;
  const inProgress = tasks.filter(t => t.status === 'in-progress').length;
  const completed = tasks.filter(t => t.status === 'completed').length;

  // Calculate priority counts
  const low = tasks.filter(t => t.priority === 'low').length;
  const medium = tasks.filter(t => t.priority === 'medium').length;
  const high = tasks.filter(t => t.priority === 'high').length;

  // Pie Chart calculations (using SVG stroke-dasharray donut method)
  const radius = 50;
  const circumference = 2 * Math.PI * radius; // ~314.16
  
  const todoPercent = total > 0 ? (todo / total) : 0;
  const progressPercent = total > 0 ? (inProgress / total) : 0;
  const completedPercent = total > 0 ? (completed / total) : 0;

  const todoDash = circumference * todoPercent;
  const progressDash = circumference * progressPercent;
  const completedDash = circumference * completedPercent;

  // Cumulative offsets for stroke-dashoffset
  const todoOffset = circumference;
  const progressOffset = circumference - todoDash;
  const completedOffset = circumference - todoDash - progressDash;

  // Bar Chart calculations
  const maxPriorityCount = Math.max(low, medium, high, 1);
  const chartHeight = 100;
  
  const getBarHeight = (count) => {
    return (count / maxPriorityCount) * chartHeight;
  };

  return (
    <div className="glass-panel animate-fade-in" style={{
      padding: '1.5rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '1.5rem',
      width: '100%',
    }}>
      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'white' }}>Workspace Insights</h3>
      
      {total === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          color: 'var(--text-muted)', 
          fontSize: '0.9rem',
          padding: '2rem 0'
        }}>
          No data available for charts. Create tasks to view insights!
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.5rem',
          alignItems: 'center'
        }}>
          {/* Status Donut Chart */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1rem',
            padding: '1rem',
            background: 'rgba(255,255,255,0.01)',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.03)'
          }}>
            <h4 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Status Breakdown
            </h4>
            
            <div style={{ position: 'relative', width: '130px', height: '130px' }}>
              <svg width="100%" height="100%" viewBox="0 0 120 120" style={{ transform: 'rotate(-90deg)' }}>
                {/* Background circle */}
                <circle cx="60" cy="60" r={radius} fill="transparent" stroke="rgba(255,255,255,0.03)" strokeWidth="12" />
                
                {/* Todo Segment (Blue) */}
                {todo > 0 && (
                  <circle
                    cx="60"
                    cy="60"
                    r={radius}
                    fill="transparent"
                    stroke="var(--status-todo)"
                    strokeWidth="12"
                    strokeDasharray={`${todoDash} ${circumference}`}
                    strokeDashoffset={todoOffset}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 0.5s ease-out' }}
                  />
                )}
                
                {/* In Progress Segment (Yellow) */}
                {inProgress > 0 && (
                  <circle
                    cx="60"
                    cy="60"
                    r={radius}
                    fill="transparent"
                    stroke="var(--status-progress)"
                    strokeWidth="12"
                    strokeDasharray={`${progressDash} ${circumference}`}
                    strokeDashoffset={progressOffset}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 0.5s ease-out' }}
                  />
                )}
                
                {/* Completed Segment (Green) */}
                {completed > 0 && (
                  <circle
                    cx="60"
                    cy="60"
                    r={radius}
                    fill="transparent"
                    stroke="var(--status-done)"
                    strokeWidth="12"
                    strokeDasharray={`${completedDash} ${circumference}`}
                    strokeDashoffset={completedOffset}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 0.5s ease-out' }}
                  />
                )}
              </svg>
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
                <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'white' }}>{total}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Tasks</span>
              </div>
            </div>

            {/* Legend */}
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center', fontSize: '0.8rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--status-todo)' }}></span>
                <span style={{ color: 'var(--text-secondary)' }}>Todo ({Math.round(todoPercent * 100)}%)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--status-progress)' }}></span>
                <span style={{ color: 'var(--text-secondary)' }}>Progress ({Math.round(progressPercent * 100)}%)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--status-done)' }}></span>
                <span style={{ color: 'var(--text-secondary)' }}>Done ({Math.round(completedPercent * 100)}%)</span>
              </div>
            </div>
          </div>

          {/* Priority Bar Chart */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1rem',
            padding: '1rem',
            background: 'rgba(255,255,255,0.01)',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.03)',
            height: '100%',
            justifyContent: 'space-between'
          }}>
            <h4 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Priority Distribution
            </h4>

            {/* Custom SVG Bar Chart */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'flex-end', 
              justifyContent: 'space-around', 
              width: '100%', 
              maxWidth: '200px', 
              height: '110px',
              paddingBottom: '0.5rem',
              borderBottom: '1px solid rgba(255,255,255,0.08)'
            }}>
              {/* Low Bar */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.3rem', flex: 1 }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{low}</span>
                <div style={{
                  width: '24px',
                  height: `${getBarHeight(low)}px`,
                  background: 'linear-gradient(180deg, var(--priority-low) 0%, rgba(16,185,129,0.2) 100%)',
                  borderRadius: '4px 4px 0 0',
                  transition: 'height 0.5s ease-out'
                }}></div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>Low</span>
              </div>

              {/* Medium Bar */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.3rem', flex: 1 }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{medium}</span>
                <div style={{
                  width: '24px',
                  height: `${getBarHeight(medium)}px`,
                  background: 'linear-gradient(180deg, var(--priority-medium) 0%, rgba(249,115,22,0.2) 100%)',
                  borderRadius: '4px 4px 0 0',
                  transition: 'height 0.5s ease-out'
                }}></div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>Med</span>
              </div>

              {/* High Bar */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.3rem', flex: 1 }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{high}</span>
                <div style={{
                  width: '24px',
                  height: `${getBarHeight(high)}px`,
                  background: 'linear-gradient(180deg, var(--priority-high) 0%, rgba(239,68,68,0.2) 100%)',
                  borderRadius: '4px 4px 0 0',
                  transition: 'height 0.5s ease-out'
                }}></div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>High</span>
              </div>
            </div>
            
            <div style={{ height: '10px' }}></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;
