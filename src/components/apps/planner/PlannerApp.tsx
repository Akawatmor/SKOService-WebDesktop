'use client';

import React, { useState } from 'react';

interface Task {
  id: string;
  title: string;
  status: 'todo' | 'in-progress' | 'done';
  priority: 'low' | 'medium' | 'high';
}

const STATUS_LABELS: Record<Task['status'], string> = {
  todo: 'To Do',
  'in-progress': 'In Progress',
  done: 'Done',
};

const STATUS_COLORS: Record<Task['status'], string> = {
  todo: '#ff9800',
  'in-progress': '#0078d4',
  done: '#4caf50',
};

const PRIORITY_COLORS: Record<Task['priority'], string> = {
  low: '#4caf50',
  medium: '#ff9800',
  high: '#e81123',
};

function loadPlannerTasks(): Task[] {
  if (typeof window === 'undefined') return [];
  const saved = localStorage.getItem('sko-planner-tasks');
  return saved ? JSON.parse(saved) : [];
}

export default function PlannerApp() {
  const [tasks, setTasks] = useState<Task[]>(loadPlannerTasks);
  const [newTitle, setNewTitle] = useState('');
  const [filter, setFilter] = useState<Task['status'] | 'all'>('all');

  const saveTasks = (t: Task[]) => {
    setTasks(t);
    localStorage.setItem('sko-planner-tasks', JSON.stringify(t));
  };

  const addTask = () => {
    if (!newTitle.trim()) return;
    const task: Task = {
      id: Date.now().toString(),
      title: newTitle.trim(),
      status: 'todo',
      priority: 'medium',
    };
    saveTasks([...tasks, task]);
    setNewTitle('');
  };

  const updateStatus = (id: string, status: Task['status']) => {
    saveTasks(tasks.map((t) => (t.id === id ? { ...t, status } : t)));
  };

  const deleteTask = (id: string) => {
    saveTasks(tasks.filter((t) => t.id !== id));
  };

  const cyclePriority = (id: string) => {
    const order: Task['priority'][] = ['low', 'medium', 'high'];
    saveTasks(
      tasks.map((t) => {
        if (t.id !== id) return t;
        const next = order[(order.indexOf(t.priority) + 1) % order.length];
        return { ...t, priority: next };
      })
    );
  };

  const filteredTasks =
    filter === 'all' ? tasks : tasks.filter((t) => t.status === filter);

  const columns: Task['status'][] = ['todo', 'in-progress', 'done'];

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-white/8">
        <input
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addTask()}
          placeholder="Add a task..."
          className="flex-1 !py-1 text-xs"
          maxLength={200}
        />
        <button
          onClick={addTask}
          className="px-3 py-1 bg-[#0078d4] hover:bg-[#1a86d9] rounded-md text-xs text-white transition-colors"
        >
          Add
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-px px-3 pt-2 border-b border-white/5">
        {(['all', ...columns] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 text-xs rounded-t-md transition-colors ${
              filter === f
                ? 'bg-white/10 text-white/80'
                : 'text-white/40 hover:text-white/60'
            }`}
          >
            {f === 'all' ? 'All' : STATUS_LABELS[f]}
            <span className="ml-1 text-white/20">
              {f === 'all'
                ? tasks.length
                : tasks.filter((t) => t.status === f).length}
            </span>
          </button>
        ))}
      </div>

      {/* Task list */}
      <div className="flex-1 overflow-y-auto p-3">
        {filteredTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-2 text-white/20">
            <span className="text-4xl">✅</span>
            <span className="text-sm">No tasks</span>
          </div>
        ) : (
          <div className="flex flex-col gap-1.5">
            {filteredTasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/8 transition-colors group"
              >
                {/* Status indicator */}
                <button
                  onClick={() => {
                    const next: Record<Task['status'], Task['status']> = {
                      todo: 'in-progress',
                      'in-progress': 'done',
                      done: 'todo',
                    };
                    updateStatus(task.id, next[task.status]);
                  }}
                  className="w-4 h-4 rounded-full border-2 shrink-0 transition-colors"
                  style={{
                    borderColor: STATUS_COLORS[task.status],
                    backgroundColor:
                      task.status === 'done'
                        ? STATUS_COLORS[task.status]
                        : 'transparent',
                  }}
                  title={`Status: ${STATUS_LABELS[task.status]}`}
                />

                <span
                  className={`text-sm flex-1 ${
                    task.status === 'done'
                      ? 'text-white/30 line-through'
                      : 'text-white/70'
                  }`}
                >
                  {task.title}
                </span>

                {/* Priority */}
                <button
                  onClick={() => cyclePriority(task.id)}
                  className="text-xs px-1.5 py-0.5 rounded"
                  style={{
                    color: PRIORITY_COLORS[task.priority],
                    backgroundColor: `${PRIORITY_COLORS[task.priority]}15`,
                  }}
                >
                  {task.priority}
                </button>

                {/* Delete */}
                <button
                  onClick={() => deleteTask(task.id)}
                  className="text-white/0 group-hover:text-white/30 hover:!text-red-400 transition-colors text-sm"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
