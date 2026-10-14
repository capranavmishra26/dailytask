import { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing } from '../theme';
import { formatDue } from '../utils/date';

const QUICK_PICKS = [
  { label: '+15 min', minutes: 15 },
  { label: '+30 min', minutes: 30 },
  { label: '+1 hr', minutes: 60 },
  { label: '+2 hr', minutes: 120 },
];

function defaultDueDate() {
  const d = new Date(Date.now() + 60 * 60 * 1000);
  d.setSeconds(0, 0);
  return d;
}

function minutesFromNow(minutes) {
  const d = new Date(Date.now() + minutes * 60 * 1000);
  d.setSeconds(0, 0);
  return d;
}

export default function AddTaskModal({ visible, onClose, onSubmit }) {
  const [title, setTitle] = useState('');
  const [due, setDue] = useState(defaultDueDate);
  const [error, setError] = useState('');

  // Reset the form each time the sheet opens.
  useEffect(() => {
    if (visible) {
      setTitle('');
      setDue(defaultDueDate());
      setError('');
    }
  }, [visible]);

  // Android has no combined date+time picker: pick the date, then the time.
  const openAndroidPicker = () => {
    DateTimePickerAndroid.open({
      value: due,
      mode: 'date',
      minimumDate: new Date(),
      onChange: (event, pickedDate) => {
        if (event.type !== 'set' || !pickedDate) return;
        DateTimePickerAndroid.open({
          value: pickedDate,
          mode: 'time',
          is24Hour: false,
          onChange: (timeEvent, pickedTime) => {
            if (timeEvent.type !== 'set' || !pickedTime) return;
            const merged = new Date(pickedDate);
            merged.setHours(pickedTime.getHours(), pickedTime.getMinutes(), 0, 0);
            setDue(merged);
            setError('');
          },
        });
      },
    });
  };

  const handleSubmit = () => {
    if (!title.trim()) {
      setError('Please enter a task title.');
      return;
    }
    if (due.getTime() <= Date.now()) {
      setError('Due date & time must be in the future.');
      return;
    }
    onSubmit(title, due);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.backdrop}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.heading}>New Task</Text>
            <Pressable onPress={onClose} hitSlop={10} accessibilityLabel="Close">
              <Ionicons name="close" size={24} color={colors.textMuted} />
            </Pressable>
          </View>

          <Text style={styles.label}>Title</Text>
          <TextInput
            value={title}
            onChangeText={(text) => {
              setTitle(text);
              if (error) setError('');
            }}
            placeholder="e.g. Send weekly report to manager"
            placeholderTextColor={colors.textFaint}
            style={styles.input}
            autoFocus
            returnKeyType="done"
            onSubmitEditing={handleSubmit}
            maxLength={120}
          />

          <Text style={styles.label}>Due Date & Time</Text>
          {Platform.OS === 'ios' ? (
            <View style={styles.iosPickerRow}>
              <DateTimePicker
                value={due}
                mode="datetime"
                display="compact"
                minimumDate={new Date()}
                onChange={(_, picked) => {
                  if (picked) {
                    picked.setSeconds(0, 0);
                    setDue(picked);
                    setError('');
                  }
                }}
              />
            </View>
          ) : (
            <Pressable
              style={styles.dateButton}
              onPress={openAndroidPicker}
              disabled={Platform.OS === 'web'}
            >
              <Ionicons name="calendar-outline" size={18} color={colors.primary} />
              <Text style={styles.dateButtonText}>{formatDue(due.toISOString())}</Text>
            </Pressable>
          )}

          <View style={styles.chips}>
            {QUICK_PICKS.map((pick) => (
              <Pressable
                key={pick.label}
                style={styles.chip}
                onPress={() => {
                  setDue(minutesFromNow(pick.minutes));
                  setError('');
                }}
              >
                <Text style={styles.chipText}>{pick.label}</Text>
              </Pressable>
            ))}
          </View>

          {!!error && <Text style={styles.error}>{error}</Text>}

          <View style={styles.actions}>
            <Pressable style={[styles.button, styles.buttonSecondary]} onPress={onClose}>
              <Text style={styles.buttonSecondaryText}>Cancel</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                styles.button,
                styles.buttonPrimary,
                pressed && { backgroundColor: colors.primaryPressed },
              ]}
              onPress={handleSubmit}
            >
              <Text style={styles.buttonPrimaryText}>Add Task</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: colors.overlay,
  },
  sheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    padding: spacing.xl,
    paddingBottom: spacing.xl + spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  heading: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMuted,
    marginBottom: spacing.xs,
    marginTop: spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.cardBorder,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: 16,
    color: colors.text,
  },
  iosPickerRow: {
    alignItems: 'flex-start',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  dateButtonText: {
    fontSize: 16,
    color: colors.text,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  chip: {
    backgroundColor: colors.primarySoft,
    borderRadius: 999,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
  },
  chipText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '600',
  },
  error: {
    color: colors.danger,
    marginTop: spacing.md,
    fontSize: 14,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  button: {
    flex: 1,
    borderRadius: radius.md,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonPrimary: {
    backgroundColor: colors.primary,
  },
  buttonPrimaryText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  buttonSecondary: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  buttonSecondaryText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
});
