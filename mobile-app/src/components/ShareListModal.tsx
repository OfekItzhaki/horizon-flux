import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Modal,
    TextInput,
    FlatList,
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sharingService } from '../services/sharing.service';
import { useTheme } from '../context/ThemeContext';
import { useThemedStyles } from '../utils/useThemedStyles';
import { ToDoList, ShareListDto } from '../types';
import { handleApiError } from '../utils/errorHandler';

interface ShareListModalProps {
    visible: boolean;
    onClose: () => void;
    list: ToDoList;
}

export default function ShareListModal({ visible, onClose, list }: ShareListModalProps) {
    const { colors } = useTheme();
    const queryClient = useQueryClient();
    const [email, setEmail] = useState('');
    const [role, setRole] = useState<'VIEWER' | 'EDITOR'>('EDITOR');

    const styles = useThemedStyles((colors) => ({
        modalContainer: {
            flex: 1,
            justifyContent: 'flex-end',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
        },
        modalContent: {
            backgroundColor: colors.card,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            padding: 24,
            maxHeight: '80%',
        },
        header: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 24,
        },
        title: {
            fontSize: 20,
            fontWeight: 'bold',
            color: colors.text,
        },
        sectionTitle: {
            fontSize: 16,
            fontWeight: '600',
            color: colors.textSecondary,
            marginBottom: 12,
            marginTop: 8,
        },
        inputContainer: {
            marginBottom: 20,
        },
        input: {
            backgroundColor: colors.background,
            borderRadius: 12,
            padding: 12,
            color: colors.text,
            borderWidth: 1,
            borderColor: colors.border,
            fontSize: 16,
        },
        roleSelector: {
            flexDirection: 'row',
            marginBottom: 20,
            gap: 12,
        },
        roleButton: {
            flex: 1,
            paddingVertical: 10,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: colors.border,
            alignItems: 'center',
            backgroundColor: colors.background,
        },
        roleButtonActive: {
            borderColor: colors.primary,
            backgroundColor: colors.primary + '10',
        },
        roleButtonText: {
            fontSize: 14,
            fontWeight: '600',
            color: colors.textSecondary,
        },
        roleButtonTextActive: {
            color: colors.primary,
        },
        shareButton: {
            backgroundColor: colors.primary,
            borderRadius: 12,
            paddingVertical: 14,
            alignItems: 'center',
            marginBottom: 24,
        },
        shareButtonText: {
            color: '#fff',
            fontSize: 16,
            fontWeight: 'bold',
        },
        shareItem: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingVertical: 12,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
        },
        userInfo: {
            flex: 1,
        },
        userEmail: {
            fontSize: 14,
            color: colors.text,
            fontWeight: '500',
        },
        userRole: {
            fontSize: 12,
            color: colors.textSecondary,
        },
        removeButton: {
            padding: 8,
        },
        emptyText: {
            textAlign: 'center',
            color: colors.textSecondary,
            marginTop: 20,
            fontStyle: 'italic',
        },
    }));

    const { data: shares = [], isLoading: loadingShares } = useQuery({
        queryKey: ['list-shares', list.id],
        queryFn: () => sharingService.getListShares(list.id),
        enabled: visible,
    });

    const shareMutation = useMutation({
        mutationFn: (data: ShareListDto) => sharingService.shareList(list.id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['list-shares', list.id] });
            setEmail('');
            Alert.alert('Success', 'List shared successfully');
        },
        onError: (error) => {
            handleApiError(error, 'Failed to share list');
        },
    });

    const unshareMutation = useMutation({
        mutationFn: (userId: string) => sharingService.unshareList(list.id, userId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['list-shares', list.id] });
        },
        onError: (error) => {
            handleApiError(error, 'Failed to unshare list');
        },
    });

    const handleShare = () => {
        if (!email.trim()) {
            Alert.alert('Error', 'Please enter an email address');
            return;
        }
        shareMutation.mutate({ email: email.trim(), role });
    };

    const handleRemoveShare = (userId: string, userEmail: string) => {
        Alert.alert(
            'Remove Access',
            `Are you sure you want to remove access for ${userEmail}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Remove',
                    style: 'destructive',
                    onPress: () => unshareMutation.mutate(userId),
                },
            ]
        );
    };

    const renderShareItem = ({ item }: { item: any }) => (
        <View style={styles.shareItem}>
            <View style={styles.userInfo}>
                <Text style={styles.userEmail}>{item.sharedWith.email}</Text>
                <Text style={styles.userRole}>{item.role}</Text>
            </View>
            <TouchableOpacity
                style={styles.removeButton}
                onPress={() => handleRemoveShare(item.sharedWith.id, item.sharedWith.email)}
            >
                <Ionicons name="trash-outline" size={20} color={colors.error} />
            </TouchableOpacity>
        </View>
    );

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.modalContainer}
            >
                <View style={styles.modalContent}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Share "{list.name}"</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close" size={24} color={colors.textSecondary} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.sectionTitle}>Add Guest</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter user email"
                            placeholderTextColor={colors.textSecondary}
                            value={email}
                            onChangeText={setEmail}
                            autoCapitalize="none"
                            keyboardType="email-address"
                        />
                    </View>

                    <View style={styles.roleSelector}>
                        <TouchableOpacity
                            style={[styles.roleButton, role === 'EDITOR' && styles.roleButtonActive]}
                            onPress={() => setRole('EDITOR')}
                        >
                            <Text style={[styles.roleButtonText, role === 'EDITOR' && styles.roleButtonTextActive]}>
                                Editor
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.roleButton, role === 'VIEWER' && styles.roleButtonActive]}
                            onPress={() => setRole('VIEWER')}
                        >
                            <Text style={[styles.roleButtonText, role === 'VIEWER' && styles.roleButtonTextActive]}>
                                Viewer
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        style={[styles.shareButton, shareMutation.isPending && { opacity: 0.7 }]}
                        onPress={handleShare}
                        disabled={shareMutation.isPending}
                    >
                        {shareMutation.isPending ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.shareButtonText}>Share List</Text>
                        )}
                    </TouchableOpacity>

                    <Text style={styles.sectionTitle}>Shared With</Text>
                    {loadingShares ? (
                        <ActivityIndicator style={{ marginTop: 20 }} color={colors.primary} />
                    ) : (
                        <FlatList
                            data={shares}
                            renderItem={renderShareItem}
                            keyExtractor={(item) => item.id}
                            ListEmptyComponent={
                                <Text style={styles.emptyText}>Not shared with anyone yet</Text>
                            }
                            scrollEnabled={true}
                            nestedScrollEnabled={true}
                        />
                    )}
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
}
