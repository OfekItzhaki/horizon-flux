import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { remindersService } from '../services/reminders.service';
import { ReminderNotification } from '../types';

export default function RemindersScreen() {
  const [reminders, setReminders] = useState<ReminderNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReminders();
  }, []);

  const loadReminders = async () => {
    try {
      const data = await remindersService.getToday();
      setReminders(data);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load reminders');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Today's Reminders</Text>
      <FlatList
        data={reminders}
        keyExtractor={(item, index) => `${item.taskId}-${index}`}
        renderItem={({ item }) => (
          <View style={styles.reminderItem}>
            <Text style={styles.reminderTitle}>{item.title}</Text>
            <Text style={styles.reminderMessage}>{item.message}</Text>
            <Text style={styles.reminderList}>
              List: {item.listName} ({item.listType})
            </Text>
            <Text style={styles.reminderDate}>
              Due: {new Date(item.dueDate).toLocaleDateString()}
            </Text>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.center}>
            <Text style={styles.emptyText}>No reminders for today</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    padding: 20,
    backgroundColor: '#fff',
  },
  reminderItem: {
    backgroundColor: '#fff',
    padding: 15,
    marginHorizontal: 10,
    marginVertical: 5,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  reminderTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 5,
  },
  reminderMessage: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  reminderList: {
    fontSize: 12,
    color: '#999',
    marginBottom: 5,
  },
  reminderDate: {
    fontSize: 12,
    color: '#999',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
});







