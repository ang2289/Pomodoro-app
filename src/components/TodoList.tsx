import { useState, useEffect } from 'react';
import type { Todo } from '../types/Todo'

interface Props {
  todos: Todo[]
  onDelete: (id: string) => void
  onToggleComplete: (id: string) => void
  onEdit?: (id: string) => void
  formatDate: (dateString: string) => string
}

export default function TodoList({ todos, onDelete, onToggleComplete, onEdit, formatDate }: Props) {
  const [tasks, setTasks] = useState(todos);
  const [statistics, setStatistics] = useState({
    total: 0,
    done: 0,
    notStarted: 0,
    doing: 0,
  });

  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));

    const total = tasks.length;
    const done = tasks.filter(t => t.status === '已完成').length;
    const notStarted = tasks.filter(t => t.status === '未開始').length;
    const doing = tasks.filter(t => t.status === '進行中').length;

    setStatistics({ total, done, notStarted, doing });
  }, [tasks]);

  const handleToggleStatus = (id: string) => {
    setTasks(prev =>
      prev.map(task =>
        task.id === id
          ? {
              ...task,
              status: task.status === '已完成' ? '未開始' : '已完成'
            }
          : task
      )
    );
  };

  return (
    <div className="space-y-3">
      <div className="mb-4">
        <p>總任務數：{statistics.total}</p>
        <p>已完成：{statistics.done}</p>
        <p>未開始：{statistics.notStarted}</p>
        <p>進行中：{statistics.doing}</p>
      </div>
      {tasks.map(todo => (
        <div 
          key={todo.id} 
          className="w-full max-w-md mx-auto bg-white rounded-xl shadow-md p-4 mb-4"
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className={`text-base font-medium mb-2 ${
                todo.status === '已完成' 
                  ? 'line-through text-gray-400' 
                  : 'text-gray-800'
              }`}>
                {todo.title}
              </h3>
              <p className="text-sm text-gray-500">🗓 {formatDate(todo.datetime)}</p>
              <p className="text-sm text-gray-500">🏷️ 優先度：<span className={`font-bold ${
                todo.priority === 'high' ? 'text-red-600' : 
                todo.priority === 'medium' ? 'text-orange-600' : 
                'text-green-600'
              }`}>
                {todo.priority === 'high' ? '高' : todo.priority === 'medium' ? '中' : '低'}
              </span></p>
            </div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={todo.status === '已完成'}
                onChange={() => {
                  handleToggleStatus(todo.id);
                  onToggleComplete?.(todo.id);
                }}
                className="h-5 w-5 mt-1 text-green-500 cursor-pointer"
              />
              <span className="sr-only">Toggle task status</span>
            </label>
          </div>
          <div className="mt-4 flex gap-2 justify-end">
            <button
              onClick={() => onEdit?.(todo.id)}
              className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 text-sm transition-colors duration-200"
            >
              ✏️ 編輯
            </button>
            <button
              onClick={() => {
                if (window.confirm('確定要刪除這個任務嗎？')) {
                  onDelete(todo.id);
                }
              }}
              className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 text-sm transition-colors duration-200"
            >
              🗑️ 刪除
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
