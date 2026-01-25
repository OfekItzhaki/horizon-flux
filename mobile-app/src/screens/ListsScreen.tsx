import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  RefreshControl,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { listsService } from '../services/lists.service';
import { ToDoList, CreateTodoListDto } from '../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function ListsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [lists, setLists] = useState<ToDoList[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingList, setEditingList] = useState<ToDoList | null>(null);
  const [editListName, setEditListName] = useState('');

  useEffect(() => {
    loadLists();
  }, []);

  // Reload when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadLists();
    }, [])
  );

  const loadLists = async () => {
    try {
      console.log('Loading lists...');
      const data = await listsService.getAll();
      console.log('Lists loaded:', data);
      console.log('Lists count:', data?.length ?? 'undefined');
      setLists(data || []);
    } catch (error: any) {
      console.error('Error loading lists:', error);
      // Silently ignore auth errors - the navigation will handle redirect to login
      const isAuthError = error?.response?.status === 401 || 
                          error?.message?.toLowerCase()?.includes('unauthorized');
      if (!isAuthError) {
        const errorMessage = error?.message || error?.response?.data?.message || 'Unable to load lists.';
        const isTimeout = errorMessage.toLowerCase().includes('too long') || 
                         errorMessage.toLowerCase().includes('timeout') ||
                         error?.code === 'ECONNABORTED';
        const finalMessage = isTimeout 
          ? 'Loading lists is taking too long. Please try again later.'
          : errorMessage + ' Please try again later.';
        Alert.alert('Error Loading Lists', finalMessage);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadLists();
  };

  const handleListPress = (list: ToDoList) => {
    navigation.navigate('Tasks', {
      listId: list.id,
      listName: list.name,
      listType: list.type,
    });
  };

  const handleEditList = (list: ToDoList) => {
    setEditingList(list);
    setEditListName(list.name);
    setShowAddModal(true);
  };

  const handleSaveEdit = async () => {
    if (!editingList) return;

    if (!editListName.trim()) {
      Alert.alert('Validation Error', 'Please enter a list name before saving.');
      return;
    }

    setIsSubmitting(true);
    try {
      await listsService.update(editingList.id, {
        name: editListName.trim(),
      });
      setEditingList(null);
      setEditListName('');
      setShowAddModal(false);
      loadLists();
      // Success feedback - UI update is visible, no alert needed
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update list');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddList = async () => {
    if (editingList) {
      handleSaveEdit();
      return;
    }

    if (!newListName.trim()) {
      Alert.alert('Validation Error', 'Please enter a list name before saving.');
      return;
    }

    setIsSubmitting(true);
    try {
      const listData: CreateTodoListDto = {
        name: newListName.trim(),
      };

      await listsService.create(listData);
      setNewListName('');
      setShowAddModal(false);
      loadLists();
      // Success feedback - UI update is visible, no alert needed
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Unable to create list. Please try again.';
      Alert.alert('Create List Failed', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteList = (list: ToDoList) => {
    Alert.alert(
      'Delete List',
      `Are you sure you want to delete "${list.name}"? This will also delete all tasks in this list.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await listsService.delete(list.id);
              loadLists();
            } catch (error: any) {
              const errorMessage = error?.response?.data?.message || error?.message || 'Unable to delete list. Please try again.';
              Alert.alert('Delete Failed', errorMessage);
            }
          },
        },
      ],
    );
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
      <View style={styles.header}>
        <Text style={styles.title}>My Lists</Text>
        <Text style={styles.listCount}>{lists.length} list{lists.length !== 1 ? 's' : ''}</Text>
      </View>

      <FlatList
        data={lists}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={true}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.listItem}
            onPress={() => handleListPress(item)}
            onLongPress={() => {
              // System lists (like Finished Tasks) cannot be edited or deleted
              if (item.isSystem) {
                Alert.alert(
                  item.name,
                  'This is a system list and cannot be modified.',
                  [{ text: 'OK' }],
                );
                return;
              }
              Alert.alert(
                item.name,
                'Choose an action',
                [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Edit', onPress: () => handleEditList(item) },
                  { text: 'Delete', style: 'destructive', onPress: () => handleDeleteList(item) },
                ],
              );
            }}
          >
            <View style={styles.listContent}>
              <View style={styles.listInfo}>
                <Text style={styles.listName}>{item.name}</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyText}>No lists yet</Text>
            <Text style={styles.emptySubtext}>
              Tap the + button below to create your first list
            </Text>
          </View>
        }
        contentContainerStyle={lists.length === 0 ? styles.emptyContainer : undefined}
      />

      {/* Floating Action Button */}
      <TouchableOpacity
        onPress={() => setShowAddModal(true)}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={['#6366f1', '#a855f7']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.fab}
        >
          <Text style={styles.fabText}>+</Text>
        </LinearGradient>
      </TouchableOpacity>

      {/* Add List Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingList ? 'Edit List' : 'Create New List'}
            </Text>

            <TextInput
              style={styles.input}
              placeholder="List name"
              value={editingList ? editListName : newListName}
              onChangeText={editingList ? setEditListName : setNewListName}
              autoFocus
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowAddModal(false);
                  setNewListName('');
                  setEditingList(null);
                  setEditListName('');
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.submitButton]}
                onPress={handleAddList}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.submitButtonText}>
                    {editingList ? 'Save Changes' : 'Create'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 45,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(148, 163, 184, 0.2)',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#6366f1',
    marginBottom: 5,
  },
  listCount: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  listItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: 20,
    marginHorizontal: 10,
    marginVertical: 6,
    borderRadius: 16,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.1)',
  },
  listContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  listInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  listName: {
    fontSize: 20,
    fontWeight: '700',
    flex: 1,
    marginRight: 10,
    color: '#1e293b',
  },
  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  typeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
    opacity: 0.5,
  },
  emptyText: {
    fontSize: 20,
    color: '#666',
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 70,
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  fabText: {
    fontSize: 36,
    color: '#fff',
    fontWeight: '300',
    lineHeight: 36,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 20,
  },
  modalTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24,
    color: '#1e293b',
  },
  input: {
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.3)',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    color: '#1e293b',
  },
  typeLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  typeSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
    gap: 8,
  },
  typeOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#ddd',
    backgroundColor: '#f5f5f5',
    marginRight: 8,
    marginBottom: 8,
  },
  typeOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  typeOptionTextSelected: {
    color: '#fff',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  modalButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: 'rgba(241, 245, 249, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.2)',
  },
  cancelButtonText: {
    color: '#64748b',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#6366f1',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
