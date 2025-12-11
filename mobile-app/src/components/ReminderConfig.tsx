import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ScrollView,
  Platform,
} from 'react-native';
import {
  ReminderConfig,
  ReminderTimeframe,
  ReminderSpecificDate,
} from '../types';

interface ReminderConfigProps {
  reminders: ReminderConfig[];
  onRemindersChange: (reminders: ReminderConfig[]) => void;
}

export default function ReminderConfigComponent({
  reminders,
  onRemindersChange,
}: ReminderConfigProps) {
  const [editingReminder, setEditingReminder] = useState<ReminderConfig | null>(null);
  const [showTimeframePicker, setShowTimeframePicker] = useState(false);

  const addReminder = () => {
    const newReminder: ReminderConfig = {
      id: Date.now().toString(),
      timeframe: ReminderTimeframe.SPECIFIC_DATE,
      time: '09:00',
      specificDate: ReminderSpecificDate.CUSTOM_DATE,
    };
    setEditingReminder(newReminder);
    setShowTimeframePicker(true);
  };

  const saveReminder = (reminder: ReminderConfig) => {
    if (editingReminder) {
      // Update existing
      const updated = reminders.map((r) =>
        r.id === editingReminder.id ? reminder : r,
      );
      onRemindersChange(updated);
    } else {
      // Add new
      onRemindersChange([...reminders, reminder]);
    }
    setEditingReminder(null);
    setShowTimeframePicker(false);
  };

  const removeReminder = (id: string) => {
    onRemindersChange(reminders.filter((r) => r.id !== id));
  };

  const editReminder = (reminder: ReminderConfig) => {
    setEditingReminder(reminder);
    setShowTimeframePicker(true);
  };

  const formatReminder = (reminder: ReminderConfig): string => {
    const timeStr = reminder.time || '09:00';
    let description = '';

    switch (reminder.timeframe) {
      case ReminderTimeframe.SPECIFIC_DATE:
        if (reminder.specificDate === ReminderSpecificDate.START_OF_WEEK) {
          description = `Every Monday at ${timeStr}`;
        } else if (reminder.specificDate === ReminderSpecificDate.START_OF_MONTH) {
          description = `1st of every month at ${timeStr}`;
        } else if (reminder.specificDate === ReminderSpecificDate.START_OF_YEAR) {
          description = `Jan 1st every year at ${timeStr}`;
        } else if (reminder.customDate) {
          const date = new Date(reminder.customDate);
          description = `${date.toLocaleDateString()} at ${timeStr}`;
        } else {
          description = `Specific date at ${timeStr}`;
        }
        break;
      case ReminderTimeframe.EVERY_DAY:
        description = `Every day at ${timeStr}`;
        break;
      case ReminderTimeframe.EVERY_WEEK:
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const dayName = reminder.dayOfWeek !== undefined ? dayNames[reminder.dayOfWeek] : 'Monday';
        description = `Every ${dayName} at ${timeStr}`;
        break;
      case ReminderTimeframe.EVERY_MONTH:
        description = `1st of every month at ${timeStr}`;
        break;
      case ReminderTimeframe.EVERY_YEAR:
        description = `Same date every year at ${timeStr}`;
        break;
    }

    if (reminder.daysBefore !== undefined) {
      description = `${reminder.daysBefore} day(s) before due date at ${timeStr}`;
    }

    return description;
  };

  const timeframes = [
    { value: ReminderTimeframe.SPECIFIC_DATE, label: 'Specific Date' },
    { value: ReminderTimeframe.EVERY_DAY, label: 'Every Day' },
    { value: ReminderTimeframe.EVERY_WEEK, label: 'Every Week' },
    { value: ReminderTimeframe.EVERY_MONTH, label: 'Every Month' },
    { value: ReminderTimeframe.EVERY_YEAR, label: 'Every Year' },
  ];

  const specificDates = [
    { value: ReminderSpecificDate.START_OF_WEEK, label: 'Start of Week (Monday)' },
    { value: ReminderSpecificDate.START_OF_MONTH, label: 'Start of Month (1st)' },
    { value: ReminderSpecificDate.START_OF_YEAR, label: 'Start of Year (Jan 1st)' },
    { value: ReminderSpecificDate.CUSTOM_DATE, label: 'Custom Date' },
  ];

  const dayNames = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Reminders</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={addReminder}
        >
          <Text style={styles.addButtonText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      {reminders.length === 0 ? (
        <Text style={styles.emptyText}>No reminders set</Text>
      ) : (
        <ScrollView style={styles.remindersList}>
          {reminders.map((reminder) => (
            <View key={reminder.id} style={styles.reminderItem}>
              <View style={styles.reminderContent}>
                <Text style={styles.reminderText}>{formatReminder(reminder)}</Text>
              </View>
              <View style={styles.reminderActions}>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => editReminder(reminder)}
                >
                  <Text style={styles.editButtonText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => removeReminder(reminder.id)}
                >
                  <Text style={styles.deleteButtonText}>×</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      {/* Reminder Configuration Modal */}
      {showTimeframePicker && editingReminder && (
        <ReminderEditor
          reminder={editingReminder}
          onSave={saveReminder}
          onCancel={() => {
            setEditingReminder(null);
            setShowTimeframePicker(false);
          }}
          timeframes={timeframes}
          specificDates={specificDates}
          dayNames={dayNames}
        />
      )}
    </View>
  );
}

interface ReminderEditorProps {
  reminder: ReminderConfig;
  onSave: (reminder: ReminderConfig) => void;
  onCancel: () => void;
  timeframes: Array<{ value: ReminderTimeframe; label: string }>;
  specificDates: Array<{ value: ReminderSpecificDate; label: string }>;
  dayNames: string[];
}

function ReminderEditor({
  reminder,
  onSave,
  onCancel,
  timeframes,
  specificDates,
  dayNames,
}: ReminderEditorProps) {
  const [config, setConfig] = useState<ReminderConfig>({ ...reminder });

  const handleTimeframeChange = (timeframe: ReminderTimeframe) => {
    setConfig({
      ...config,
      timeframe,
      specificDate:
        timeframe === ReminderTimeframe.SPECIFIC_DATE
          ? ReminderSpecificDate.CUSTOM_DATE
          : undefined,
    });
  };

  const handleTimeChange = (time: string) => {
    // Validate HH:MM format
    if (/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time)) {
      setConfig({ ...config, time });
    } else if (time.length <= 5) {
      // Allow partial input
      setConfig({ ...config, time });
    }
  };

  const handleSave = () => {
    if (!config.time || !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(config.time)) {
      return; // Invalid time
    }
    onSave(config);
  };

  return (
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        <Text style={styles.modalTitle}>Configure Reminder</Text>

        <ScrollView style={styles.editorContent}>
          {/* Timeframe Selection */}
          <Text style={styles.label}>Timeframe:</Text>
          <View style={styles.optionsGrid}>
            {timeframes.map((tf) => (
              <TouchableOpacity
                key={tf.value}
                style={[
                  styles.optionButton,
                  config.timeframe === tf.value && styles.optionButtonSelected,
                ]}
                onPress={() => handleTimeframeChange(tf.value)}
              >
                <Text
                  style={[
                    styles.optionText,
                    config.timeframe === tf.value && styles.optionTextSelected,
                  ]}
                >
                  {tf.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Specific Date Options (for SPECIFIC_DATE timeframe) */}
          {config.timeframe === ReminderTimeframe.SPECIFIC_DATE && (
            <>
              <Text style={styles.label}>Date Option:</Text>
              <View style={styles.optionsGrid}>
                {specificDates.map((sd) => (
                  <TouchableOpacity
                    key={sd.value}
                    style={[
                      styles.optionButton,
                      config.specificDate === sd.value && styles.optionButtonSelected,
                    ]}
                    onPress={() =>
                      setConfig({ ...config, specificDate: sd.value })
                    }
                  >
                    <Text
                      style={[
                        styles.optionText,
                        config.specificDate === sd.value && styles.optionTextSelected,
                      ]}
                    >
                      {sd.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Custom Date Input */}
              {config.specificDate === ReminderSpecificDate.CUSTOM_DATE && (
                <>
                  <Text style={styles.label}>Date (YYYY-MM-DD):</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="2024-12-25"
                    value={config.customDate?.split('T')[0] || ''}
                    onChangeText={(text) => {
                      const date = new Date(text);
                      if (!isNaN(date.getTime())) {
                        setConfig({ ...config, customDate: date.toISOString() });
                      } else {
                        setConfig({ ...config, customDate: text });
                      }
                    }}
                  />
                </>
              )}
            </>
          )}

          {/* Day of Week (for EVERY_WEEK) */}
          {config.timeframe === ReminderTimeframe.EVERY_WEEK && (
            <>
              <Text style={styles.label}>Day of Week:</Text>
              <View style={styles.optionsGrid}>
                {dayNames.map((day, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.optionButton,
                      config.dayOfWeek === index && styles.optionButtonSelected,
                    ]}
                    onPress={() => setConfig({ ...config, dayOfWeek: index })}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        config.dayOfWeek === index && styles.optionTextSelected,
                      ]}
                    >
                      {day}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          {/* Days Before (for reminders relative to due date) */}
          <Text style={styles.label}>Days Before Due Date (optional):</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., 7 for 7 days before due date"
            value={config.daysBefore?.toString() || ''}
            onChangeText={(text) => {
              const days = parseInt(text, 10);
              if (!isNaN(days) && days > 0) {
                setConfig({ ...config, daysBefore: days });
              } else if (text === '') {
                setConfig({ ...config, daysBefore: undefined });
              }
            }}
            keyboardType="numeric"
          />
          <Text style={styles.helperText}>
            Leave empty if this reminder is not relative to due date
          </Text>

          {/* Time Input */}
          <Text style={styles.label}>Time (HH:MM):</Text>
          <TextInput
            style={styles.input}
            placeholder="09:00"
            value={config.time}
            onChangeText={handleTimeChange}
            keyboardType="numeric"
            maxLength={5}
          />
        </ScrollView>

        <View style={styles.modalButtons}>
          <TouchableOpacity
            style={[styles.modalButton, styles.cancelButton]}
            onPress={onCancel}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modalButton, styles.saveButton]}
            onPress={handleSave}
          >
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  addButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#007AFF',
    borderRadius: 6,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
  },
  remindersList: {
    maxHeight: 200,
  },
  reminderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  reminderContent: {
    flex: 1,
  },
  reminderText: {
    fontSize: 14,
    color: '#333',
  },
  reminderActions: {
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#007AFF',
    borderRadius: 4,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 12,
  },
  deleteButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#f44336',
    borderRadius: 4,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  editorContent: {
    maxHeight: 400,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 15,
    marginBottom: 8,
    color: '#333',
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  optionButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f9f9f9',
    marginRight: 8,
    marginBottom: 8,
  },
  optionButtonSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  optionText: {
    fontSize: 14,
    color: '#666',
  },
  optionTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
    marginBottom: 10,
  },
  helperText: {
    fontSize: 12,
    color: '#999',
    marginTop: -8,
    marginBottom: 10,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#007AFF',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

