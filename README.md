# Daily Office Task Tracker

React Native (Expo) app for tracking daily office tasks with overdue alerts.

## Setup

1. Install Node.js LTS (https://nodejs.org).
2. In this folder:
   ```
   npm install
   npx expo install --fix
   npx expo start
   ```
   (`expo install --fix` aligns native package versions with your Expo SDK.)
3. Scan the QR code with **Expo Go** on your phone, or press `a` / `i` for an emulator.

## Structure

```
App.js                          Root: gesture handler + safe area providers
src/screens/HomeScreen.js       Task list (To Do / Completed), header stats, add button
src/components/TaskItem.js      Task card: checkbox, swipe-to-delete, trash icon, Overdue tag
src/components/AddTaskModal.js  Title + due date/time form
src/components/OverdueAlertModal.js  "⚠️ Task Overdue" popup (Dismiss / Mark as Done)
src/hooks/useTasks.js           Task state + AsyncStorage persistence
src/hooks/useOverdueMonitor.js  1-second clock check, overdue set, alert queue
src/storage/taskStorage.js      AsyncStorage read/write
src/utils/date.js               Date formatting and overdue helpers
src/theme.js                    Colors and spacing
```

## How overdue alerts work

- `useOverdueMonitor` checks the clock every second while the app is open, and again whenever the app returns to the foreground.
- A task is overdue when it is incomplete and its due time has passed. It gets a red left border and a red **Overdue** tag.
- Overdue tasks not yet alerted go into a queue. The popup shows them one at a time, earliest first.
- **Dismiss** or **Mark as Done** sets `overdueAlerted: true`, which is saved to storage, so each task alerts only once, even after the app restarts. Tasks that became overdue while the app was closed alert on the next launch.
- If task storage cannot be read or written, the app shows an error instead of silently replacing saved tasks with an empty list.

## Limitations

- Alerts are in-app only. To be notified while the app is closed, add `expo-notifications` and schedule a local notification for each task's due time.
- The date/time picker works on iOS and Android. On web, use the quick-pick chips (+15 min, +1 hr, etc.).
