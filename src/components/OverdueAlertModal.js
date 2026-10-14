import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '../theme';
import { formatDue } from '../utils/date';

/**
 * Shows the first task in the overdue queue. When the user dismisses it or
 * marks it done, the task is flagged `overdueAlerted`, drops out of the queue,
 * and the next overdue task (if any) appears automatically.
 */
export default function OverdueAlertModal({ task, remaining, onDismiss, onMarkDone }) {
  return (
    <Modal
      visible={!!task}
      transparent
      animationType="fade"
      onRequestClose={() => task && onDismiss(task.id)}
    >
      <View style={styles.backdrop}>
        {task && (
          <View style={styles.card} accessibilityRole="alert">
            <View style={styles.accentBar} />
            <Text style={styles.title}>⚠️ Task Overdue: {task.title}</Text>
            <Text style={styles.subtitle}>Was due {formatDue(task.dueDate)}</Text>
            {remaining > 0 && (
              <Text style={styles.remaining}>
                +{remaining} more overdue task{remaining > 1 ? 's' : ''}
              </Text>
            )}

            <View style={styles.actions}>
              <Pressable
                style={({ pressed }) => [styles.button, styles.dismiss, pressed && { opacity: 0.7 }]}
                onPress={() => onDismiss(task.id)}
              >
                <Text style={styles.dismissText}>Dismiss</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [
                  styles.button,
                  styles.done,
                  pressed && { backgroundColor: colors.primaryPressed },
                ]}
                onPress={() => onMarkDone(task.id)}
              >
                <Text style={styles.doneText}>Mark as Done</Text>
              </Pressable>
            </View>
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    padding: spacing.xl,
    paddingTop: spacing.xl + spacing.xs,
    overflow: 'hidden',
  },
  accentBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: colors.danger,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.danger,
  },
  subtitle: {
    marginTop: spacing.sm,
    fontSize: 14,
    color: colors.textMuted,
  },
  remaining: {
    marginTop: spacing.xs,
    fontSize: 13,
    color: colors.textFaint,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  button: {
    flex: 1,
    borderRadius: radius.md,
    paddingVertical: 12,
    alignItems: 'center',
  },
  dismiss: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  dismissText: {
    color: colors.text,
    fontWeight: '600',
    fontSize: 15,
  },
  done: {
    backgroundColor: colors.primary,
  },
  doneText: {
    color: colors.white,
    fontWeight: '600',
    fontSize: 15,
  },
});
