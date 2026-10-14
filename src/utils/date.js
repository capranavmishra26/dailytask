export function isTaskOverdue(task, now = Date.now()) {
  return !task.completed && new Date(task.dueDate).getTime() <= now;
}

export function byDueDate(a, b) {
  return new Date(a.dueDate) - new Date(b.dueDate);
}

function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function formatTime(date) {
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

// "Today, 3:30 PM" / "Tomorrow, 9:00 AM" / "Wed, Oct 14, 9:00 AM"
export function formatDue(iso) {
  const date = new Date(iso);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  let day;
  if (isSameDay(date, today)) day = 'Today';
  else if (isSameDay(date, tomorrow)) day = 'Tomorrow';
  else if (isSameDay(date, yesterday)) day = 'Yesterday';
  else day = date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });

  return `${day}, ${formatTime(date)}`;
}

// Plain-text summary for sharing (WhatsApp renders *bold* and ~strike~).
export function formatTaskListForShare(pending, completed, overdueIds, date = new Date()) {
  const lines = [`*My Tasks – ${formatHeaderDate(date)}*`, ''];

  lines.push(`*To Do (${pending.length})*`);
  if (pending.length === 0) lines.push('All caught up!');
  pending.forEach((t, i) => {
    const overdue = overdueIds.has(t.id) ? ' ⚠️ Overdue' : '';
    lines.push(`${i + 1}. ${t.title} — ${formatDue(t.dueDate)}${overdue}`);
  });

  if (completed.length) {
    lines.push('', `*Completed (${completed.length})*`);
    completed.forEach((t) => lines.push(`✅ ~${t.title}~`));
  }

  return lines.join('\n');
}

export function formatHeaderDate(date = new Date()) {
  return date.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
}
