import React, { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import type { Task, TaskStatus } from '../../types';
import { taskService } from '../../services/volunteerService';
import { useToast } from '../../context/ToastContext';

const PRIORITY_COLORS = {
  HIGH: { color: '#dc2626', bg: '#fef2f2', label: '🔴 HIGH' },
  MEDIUM: { color: '#d97706', bg: '#fffbeb', label: '🟡 MEDIUM' },
  LOW: { color: '#059669', bg: '#ecfdf5', label: '🟢 LOW' },
};

export const TaskKanban: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeTab, setActiveTab] = useState<TaskStatus>('TODO');
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    taskService.getTasks().then((data) => {
      setTasks(data);
      setLoading(false);
    });
  }, []);

  const handleUpdateStatus = async (task: Task, newStatus: TaskStatus) => {
    const updated = await taskService.updateTaskStatus(task.id, newStatus);
    if (updated) {
      setTasks((prev) => prev.map((t) => t.id === task.id ? { ...t, status: newStatus } : t));
      showToast(`Task moved to ${newStatus.replace('_', ' ')}`, 'success');
    }
  };

  const TABS: { status: TaskStatus; label: string; emoji: string }[] = [
    { status: 'TODO', label: 'To Do', emoji: '📋' },
    { status: 'IN_PROGRESS', label: 'In Progress', emoji: '⚡' },
    { status: 'COMPLETED', label: 'Done', emoji: '✅' },
  ];

  const filtered = tasks.filter((t) => t.status === activeTab);

  return (
    <div>
      <div style={{ padding: '0 14px 12px' }}>
        <h1 style={{ fontSize: 20, fontWeight: 900, color: '#0f172a' }}>Task Board</h1>
        <p style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>Manage event day tasks and assignments</p>
      </div>

      {/* Kanban Tabs */}
      <div className="kanban-tab-row">
        {TABS.map((tab) => {
          const count = tasks.filter((t) => t.status === tab.status).length;
          return (
            <button
              key={tab.status}
              onClick={() => setActiveTab(tab.status)}
              className={`kanban-tab ${activeTab === tab.status ? 'active' : ''}`}
            >
              {tab.emoji} {tab.label}
              {count > 0 && (
                <span style={{
                  marginLeft: 4,
                  background: activeTab === tab.status ? 'rgba(255,255,255,0.25)' : '#e2e8f0',
                  color: activeTab === tab.status ? '#fff' : '#475569',
                  fontSize: 10,
                  fontWeight: 800,
                  padding: '1px 5px',
                  borderRadius: 999,
                }}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div style={{ padding: '12px 0 20px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>Loading tasks...</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>
              {activeTab === 'COMPLETED' ? '🎉' : activeTab === 'IN_PROGRESS' ? '⚡' : '📋'}
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#64748b' }}>
              {activeTab === 'COMPLETED' ? 'No completed tasks yet' : `No ${activeTab.toLowerCase().replace('_', ' ')} tasks`}
            </div>
          </div>
        ) : (
          filtered.map((task) => {
            const prio = PRIORITY_COLORS[task.priority];
            return (
              <div key={task.id} className="task-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', lineHeight: 1.3, flex: 1 }}>
                    {task.title}
                  </h3>
                  <span style={{
                    fontSize: 10,
                    fontWeight: 800,
                    color: prio.color,
                    background: prio.bg,
                    padding: '3px 7px',
                    borderRadius: 6,
                    whiteSpace: 'nowrap',
                  }}>
                    {prio.label}
                  </span>
                </div>

                <div style={{ fontSize: 12, color: '#475569', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 600 }}>👤 {task.assignedTo}</span>
                  <span>📅 Due: {task.dueDate}</span>
                  <span style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: 5, fontWeight: 600 }}>
                    {task.category}
                  </span>
                </div>

                {task.description && (
                  <div style={{ fontSize: 12, color: '#64748b', lineHeight: 1.4 }}>{task.description}</div>
                )}

                {/* Move task actions */}
                <div style={{ display: 'flex', gap: 8, marginTop: 2 }}>
                  {activeTab === 'TODO' && (
                    <button
                      onClick={() => handleUpdateStatus(task, 'IN_PROGRESS')}
                      className="btn btn-sm btn-primary"
                      style={{ fontSize: 11 }}
                    >
                      Start Task <ArrowRight size={12} />
                    </button>
                  )}
                  {activeTab === 'IN_PROGRESS' && (
                    <button
                      onClick={() => handleUpdateStatus(task, 'COMPLETED')}
                      className="btn btn-sm btn-success"
                      style={{ fontSize: 11 }}
                    >
                      Mark Done ✓
                    </button>
                  )}
                  {activeTab === 'COMPLETED' && (
                    <span style={{ fontSize: 11, color: '#059669', fontWeight: 700 }}>✅ Task Completed</span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
