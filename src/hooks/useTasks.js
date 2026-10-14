import { useCallback, useEffect, useState } from 'react';
import { loadTasks, saveTasks } from '../storage/taskStorage';

function createId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function useTasks() {
  const [tasks, setTasks] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [saveError, setSaveError] = useState(null);
  const [loadAttempt, setLoadAttempt] = useState(0);

  // Load before permitting writes, so a failed read cannot replace saved data.
  useEffect(() => {
    let active = true;
    setLoaded(false);
    setLoadError(null);
    loadTasks()
      .then((stored) => {
        if (!active) return;
        setTasks(stored);
        setLoaded(true);
      })
      .catch((error) => {
        if (!active) return;
        setLoadError(error);
        setLoaded(true);
      });
    return () => {
      active = false;
    };
  }, [loadAttempt]);

  // Persist every change after a successful initial load.
  useEffect(() => {
    if (!loaded || loadError) return;
    saveTasks(tasks)
      .then(() => setSaveError(null))
      .catch((error) => setSaveError(error));
  }, [tasks, loaded, loadError]);

  const retryLoad = useCallback(() => {
    setLoadAttempt((attempt) => attempt + 1);
  }, []);

  const addTask = useCallback((title, dueDate) => {
    const task = {
      id: createId(),
      title: title.trim(),
      dueDate: dueDate.toISOString(),
      completed: false,
      overdueAlerted: false,
      createdAt: new Date().toISOString(),
    };
    setTasks((prev) => [...prev, task]);
  }, []);

  const deleteTask = useCallback((id) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toggleComplete = useCallback((id) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));
  }, []);

  const completeTask = useCallback((id) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: true, overdueAlerted: true } : t)),
    );
  }, []);

  const markAlerted = useCallback((id) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, overdueAlerted: true } : t)));
  }, []);

  return {
    tasks,
    loaded,
    loadError,
    saveError,
    retryLoad,
    addTask,
    deleteTask,
    toggleComplete,
    completeTask,
    markAlerted,
  };
}
