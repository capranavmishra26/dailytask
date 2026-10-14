import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@daily_office_tasks/v1';

/**
 * Task shape:
 * {
 *   id: string,
 *   title: string,
 *   dueDate: string (ISO),
 *   completed: boolean,
 *   overdueAlerted: boolean, // true once the overdue popup has been shown & handled
 *   createdAt: string (ISO),
 * }
 */

export async function loadTasks() {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return [];

  const parsed = JSON.parse(raw);
  if (!Array.isArray(parsed)) {
    throw new Error('Saved tasks have an invalid format.');
  }
  return parsed;
}

let pendingWrite = Promise.resolve();

export function saveTasks(tasks) {
  const serialized = JSON.stringify(tasks);
  const write = pendingWrite.then(() => AsyncStorage.setItem(STORAGE_KEY, serialized));
  pendingWrite = write.catch(() => {});
  return write;
}
