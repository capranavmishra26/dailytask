import { memo, useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing } from '../theme';
import { formatDue } from '../utils/date';

function TaskItem({ task, isOverdue, onToggle, onDelete, onRequestDelete }) {
  const swipeRef = useRef(null);

  const renderRightActions = () => (
    <Pressable
      style={styles.swipeDelete}
      onPress={() => {
        swipeRef.current?.close();
        onDelete(task.id);
      }}
      accessibilityRole="button"
      accessibilityLabel={`Delete ${task.title}`}
    >
      <Ionicons name="trash-outline" size={22} color={colors.white} />
      <Text style={styles.swipeDeleteText}>Delete</Text>
    </Pressable>
  );

  return (
    <Swipeable
      ref={swipeRef}
      renderRightActions={renderRightActions}
      overshootRight={false}
      rightThreshold={40}
    >
      <View style={[styles.card, isOverdue && styles.cardOverdue]}>
        <Pressable
          onPress={() => onToggle(task.id)}
          hitSlop={10}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: task.completed }}
          accessibilityLabel={`Mark ${task.title} as ${task.completed ? 'not done' : 'done'}`}
        >
          <Ionicons
            name={task.completed ? 'checkbox' : 'square-outline'}
            size={26}
            color={task.completed ? colors.primary : colors.textMuted}
          />
        </Pressable>

        <View style={styles.body}>
          <Text
            style={[styles.title, task.completed && styles.titleCompleted]}
            numberOfLines={2}
          >
            {task.title}
          </Text>
          <View style={styles.metaRow}>
            <Ionicons
              name="time-outline"
              size={14}
              color={isOverdue ? colors.danger : colors.textMuted}
            />
            <Text style={[styles.due, isOverdue && styles.dueOverdue]}>
              {formatDue(task.dueDate)}
            </Text>
            {isOverdue && (
              <View style={styles.overdueTag}>
                <Text style={styles.overdueTagText}>Overdue</Text>
              </View>
            )}
          </View>
        </View>

        <Pressable
          onPress={() => onRequestDelete(task)}
          hitSlop={10}
          style={({ pressed }) => [styles.trash, pressed && { opacity: 0.5 }]}
          accessibilityRole="button"
          accessibilityLabel={`Delete ${task.title}`}
        >
          <Ionicons name="trash-outline" size={20} color={colors.textFaint} />
        </Pressable>
      </View>
    </Swipeable>
  );
}

export default memo(TaskItem);

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderLeftWidth: 4,
    borderLeftColor: colors.cardBorder,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  cardOverdue: {
    borderLeftColor: colors.danger,
  },
  body: {
    flex: 1,
    gap: spacing.xs,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  titleCompleted: {
    color: colors.textFaint,
    textDecorationLine: 'line-through',
    fontWeight: '400',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  due: {
    fontSize: 13,
    color: colors.textMuted,
  },
  dueOverdue: {
    color: colors.danger,
    fontWeight: '500',
  },
  overdueTag: {
    marginLeft: spacing.xs,
    backgroundColor: colors.danger,
    borderRadius: radius.sm,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  overdueTagText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  trash: {
    padding: spacing.xs,
  },
  swipeDelete: {
    backgroundColor: colors.danger,
    justifyContent: 'center',
    alignItems: 'center',
    width: 88,
    borderRadius: radius.md,
    marginLeft: spacing.sm,
  },
  swipeDeleteText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
});
