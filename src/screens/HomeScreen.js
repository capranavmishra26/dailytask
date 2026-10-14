import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  Platform,
  Pressable,
  SectionList,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import TaskItem from '../components/TaskItem';
import AddTaskModal from '../components/AddTaskModal';
import OverdueAlertModal from '../components/OverdueAlertModal';
import { useTasks } from '../hooks/useTasks';
import { useOverdueMonitor } from '../hooks/useOverdueMonitor';
import { byDueDate, formatHeaderDate, formatTaskListForShare } from '../utils/date';
import { colors, radius, spacing } from '../theme';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const {
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
  } = useTasks();
  const { overdueIds, alertQueue } = useOverdueMonitor(tasks);
  const [addVisible, setAddVisible] = useState(false);

  const sections = useMemo(() => {
    const pending = tasks.filter((t) => !t.completed).sort(byDueDate);
    const completed = tasks.filter((t) => t.completed).sort(byDueDate);
    const result = [{ key: 'pending', title: 'To Do', data: pending }];
    if (completed.length) result.push({ key: 'completed', title: 'Completed', data: completed });
    return result;
  }, [tasks]);

  const pendingCount = sections[0].data.length;
  const overdueCount = overdueIds.size;

  const confirmDelete = useCallback(
    (task) => {
      if (Platform.OS === 'web') {
        deleteTask(task.id);
        return;
      }
      Alert.alert('Delete task?', `"${task.title}" will be permanently removed.`, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteTask(task.id) },
      ]);
    },
    [deleteTask],
  );

  const shareOnWhatsApp = useCallback(async () => {
    const pending = sections[0].data;
    const completed = sections[1]?.data ?? [];
    const message = formatTaskListForShare(pending, completed, overdueIds);
    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
    try {
      if (Platform.OS === 'web') {
        window.open(url, '_blank', 'noopener');
      } else {
        await Linking.openURL(url);
      }
    } catch {
      Alert.alert('Unable to share', 'WhatsApp could not be opened on this device.');
    }
  }, [sections, overdueIds]);

  const renderItem = useCallback(
    ({ item }) => (
      <TaskItem
        task={item}
        isOverdue={overdueIds.has(item.id)}
        onToggle={toggleComplete}
        onDelete={deleteTask}
        onRequestDelete={confirmDelete}
      />
    ),
    [overdueIds, toggleComplete, deleteTask, confirmDelete],
  );

  if (!loaded) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (loadError) {
    return (
      <SafeAreaView style={styles.loadFailure} edges={['top', 'bottom']}>
        <Ionicons name="cloud-offline-outline" size={44} color={colors.danger} />
        <Text style={styles.loadFailureTitle}>Couldn't load your saved tasks</Text>
        <Text style={styles.loadFailureText}>
          Your saved data has not been changed. Check your device storage and try again.
        </Text>
        <Pressable style={styles.retryButton} onPress={retryLoad} accessibilityRole="button">
          <Text style={styles.retryButtonText}>Try again</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Text style={styles.date}>{formatHeaderDate()}</Text>
        <View style={styles.headingRow}>
          <Text style={styles.heading}>My Tasks</Text>
          <Pressable
            style={({ pressed }) => [styles.shareButton, pressed && { opacity: 0.7 }]}
            onPress={shareOnWhatsApp}
            disabled={tasks.length === 0}
            accessibilityRole="button"
            accessibilityLabel="Share task list on WhatsApp"
            hitSlop={8}
          >
            <Ionicons
              name="logo-whatsapp"
              size={18}
              color={tasks.length === 0 ? colors.textFaint : colors.whatsapp}
            />
            <Text
              style={[styles.shareButtonText, tasks.length === 0 && { color: colors.textFaint }]}
            >
              Share
            </Text>
          </Pressable>
        </View>
        <View style={styles.stats}>
          <Text style={styles.stat}>{pendingCount} pending</Text>
          {overdueCount > 0 && (
            <>
              <Text style={styles.statDivider}>·</Text>
              <Text style={[styles.stat, styles.statOverdue]}>{overdueCount} overdue</Text>
            </>
          )}
        </View>
      </View>

      {saveError && (
        <Text style={styles.saveError} accessibilityRole="alert">
          Changes couldn't be saved. Check your device storage.
        </Text>
      )}

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        extraData={overdueIds}
        renderSectionHeader={({ section }) =>
          section.data.length || section.key === 'pending' ? (
            <Text style={styles.sectionTitle}>
              {section.title} ({section.data.length})
            </Text>
          ) : null
        }
        renderSectionFooter={({ section }) =>
          section.key === 'pending' && section.data.length === 0 ? (
            <View style={styles.empty}>
              <Ionicons name="checkmark-done-circle-outline" size={48} color={colors.textFaint} />
              <Text style={styles.emptyTitle}>All caught up</Text>
              <Text style={styles.emptyText}>Tap + to add a task for today.</Text>
            </View>
          ) : null
        }
        ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
        stickySectionHeadersEnabled={false}
        contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 96 }]}
      />

      <Pressable
        style={({ pressed }) => [
          styles.fab,
          { bottom: insets.bottom + spacing.xl },
          pressed && { backgroundColor: colors.primaryPressed },
        ]}
        onPress={() => setAddVisible(true)}
        accessibilityRole="button"
        accessibilityLabel="Add task"
      >
        <Ionicons name="add" size={30} color={colors.white} />
      </Pressable>

      <AddTaskModal
        visible={addVisible}
        onClose={() => setAddVisible(false)}
        onSubmit={addTask}
      />

      <OverdueAlertModal
        task={addVisible ? null : alertQueue[0] ?? null}
        remaining={Math.max(alertQueue.length - 1, 0)}
        onDismiss={markAlerted}
        onMarkDone={completeTask}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadFailure: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: colors.background,
  },
  loadFailureTitle: {
    marginTop: spacing.md,
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  loadFailureText: {
    marginTop: spacing.sm,
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
  },
  retryButtonText: {
    color: colors.white,
    fontWeight: '600',
  },
  saveError: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    color: colors.danger,
    backgroundColor: colors.dangerSoft,
    fontSize: 13,
    fontWeight: '600',
  },
  header: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  date: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  headingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  heading: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    backgroundColor: colors.card,
  },
  shareButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  stat: {
    fontSize: 14,
    color: colors.textMuted,
  },
  statDivider: {
    marginHorizontal: spacing.sm,
    color: colors.textFaint,
  },
  statOverdue: {
    color: colors.danger,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: spacing.lg,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: spacing.xl * 2,
    gap: spacing.xs,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginTop: spacing.sm,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textMuted,
  },
  fab: {
    position: 'absolute',
    right: spacing.xl,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
});
