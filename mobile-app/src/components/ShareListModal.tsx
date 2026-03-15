import React, { useState, useEffect, useCallback } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { sharingService } from '../services/sharing.service';

export type ShareRole = 'EDITOR' | 'VIEWER';

export interface ListShare {
  id: string;
  userId: string;
  email: string;
  name?: string | null;
  role: ShareRole;
}

interface ShareListModalProps {
  listId: string;
  visible: boolean;
  onClose: () => void;
}

export function ShareListModal({ listId, visible, onClose }: ShareListModalProps) {
  const { colors } = useTheme();

  const [email, setEmail] = useState('');
  const [role, setRole] = useState<ShareRole>('VIEWER');
  const [shares, setShares] = useState<ListShare[]>([]);
  const [loadingShares, setLoadingShares] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchShares = useCallback(async () => {
    setLoadingShares(true);
    setError(null);
    try {
      const data = await sharingService.getListShares(Number(listId));
      setShares(data as ListShare[]);
    } catch (err: any) {
      setError(err?.message ?? 'Failed to load shares');
    } finally {
      setLoadingShares(false);
    }
  }, [listId]);

  useEffect(() => {
    if (visible) {
      setEmail('');
      setRole('VIEWER');
      setSuccessMessage(null);
      setError(null);
      fetchShares();
    }
  }, [visible, fetchShares]);

  const handleSubmit = async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError('Please enter an email address');
      return;
    }
    setSubmitting(true);
    setError(null);
    setSuccessMessage(null);
    try {
      await sharingService.shareList(Number(listId), {
        sharedWithEmail: trimmedEmail,
        role,
      } as any);
      setSuccessMessage(`List shared with ${trimmedEmail}`);
      setEmail('');
      fetchShares();
    } catch (err: any) {
      setError(err?.message ?? 'Failed to share list');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemove = (share: ListShare) => {
    Alert.alert(
      'Remove Share',
      `Remove access for ${share.email || share.userId}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            setError(null);
            try {
              await sharingService.unshareList(Number(listId), Number(share.userId));
              setShares((prev) => prev.filter((s) => s.userId !== share.userId));
            } catch (err: any) {
              setError(err?.message ?? 'Failed to remove share');
            }
          },
        },
      ],
    );
  };

  const styles = makeStyles(colors);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <View style={styles.sheet}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Share List</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton} accessibilityLabel="Close">
                <Text style={styles.closeText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Inline feedback */}
            {error ? (
              <View style={styles.errorBanner}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}
            {successMessage ? (
              <View style={styles.successBanner}>
                <Text style={styles.successText}>{successMessage}</Text>
              </View>
            ) : null}

            {/* Add share form */}
            <Text style={styles.label}>Email address</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="colleague@example.com"
              placeholderTextColor={colors.textSecondary}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Text style={styles.label}>Role</Text>
            <View style={styles.roleToggle}>
              {(['VIEWER', 'EDITOR'] as ShareRole[]).map((r) => (
                <TouchableOpacity
                  key={r}
                  style={[styles.roleButton, role === r && styles.roleButtonActive]}
                  onPress={() => setRole(r)}
                  accessibilityLabel={r}
                >
                  <Text style={[styles.roleButtonText, role === r && styles.roleButtonTextActive]}>
                    {r}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={submitting}
              accessibilityLabel="Share"
            >
              {submitting ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.submitButtonText}>Share</Text>
              )}
            </TouchableOpacity>

            {/* Existing shares */}
            <Text style={[styles.label, styles.sharesLabel]}>Shared with</Text>
            {loadingShares ? (
              <ActivityIndicator color={colors.primary} style={styles.sharesLoader} />
            ) : shares.length === 0 ? (
              <Text style={styles.emptyText}>Not shared with anyone yet</Text>
            ) : (
              <FlatList
                data={shares}
                keyExtractor={(item) => item.userId}
                style={styles.sharesList}
                renderItem={({ item }) => (
                  <View style={styles.shareRow}>
                    <View style={styles.shareInfo}>
                      <Text style={styles.shareEmail}>{item.email || item.userId}</Text>
                      <Text style={styles.shareRole}>{item.role}</Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => handleRemove(item)}
                      style={styles.removeButton}
                      accessibilityLabel={`Remove ${item.email || item.userId}`}
                    >
                      <Text style={styles.removeButtonText}>Remove</Text>
                    </TouchableOpacity>
                  </View>
                )}
              />
            )}
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

function makeStyles(colors: ReturnType<typeof import('../context/ThemeContext').useTheme>['colors']) {
  return StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'flex-end',
    },
    keyboardView: {
      width: '100%',
    },
    sheet: {
      backgroundColor: colors.surface,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      padding: 20,
      maxHeight: '85%',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    title: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
    },
    closeButton: {
      padding: 4,
    },
    closeText: {
      fontSize: 18,
      color: colors.textSecondary,
    },
    errorBanner: {
      backgroundColor: `${colors.error}20`,
      borderRadius: 8,
      padding: 10,
      marginBottom: 12,
    },
    errorText: {
      color: colors.error,
      fontSize: 14,
    },
    successBanner: {
      backgroundColor: `${colors.success}20`,
      borderRadius: 8,
      padding: 10,
      marginBottom: 12,
    },
    successText: {
      color: colors.success,
      fontSize: 14,
    },
    label: {
      fontSize: 13,
      fontWeight: '500',
      color: colors.textSecondary,
      marginBottom: 6,
    },
    sharesLabel: {
      marginTop: 20,
    },
    input: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 10,
      paddingHorizontal: 14,
      paddingVertical: 10,
      fontSize: 15,
      color: colors.text,
      backgroundColor: colors.background,
      marginBottom: 14,
    },
    roleToggle: {
      flexDirection: 'row',
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: 'hidden',
      marginBottom: 16,
    },
    roleButton: {
      flex: 1,
      paddingVertical: 10,
      alignItems: 'center',
      backgroundColor: colors.background,
    },
    roleButtonActive: {
      backgroundColor: colors.primary,
    },
    roleButtonText: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.textSecondary,
    },
    roleButtonTextActive: {
      color: '#fff',
    },
    submitButton: {
      backgroundColor: colors.primary,
      borderRadius: 10,
      paddingVertical: 12,
      alignItems: 'center',
    },
    submitButtonDisabled: {
      opacity: 0.6,
    },
    submitButtonText: {
      color: '#fff',
      fontSize: 15,
      fontWeight: '600',
    },
    sharesLoader: {
      marginTop: 12,
    },
    emptyText: {
      color: colors.textSecondary,
      fontSize: 14,
      textAlign: 'center',
      marginTop: 8,
    },
    sharesList: {
      marginTop: 4,
    },
    shareRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    shareInfo: {
      flex: 1,
    },
    shareEmail: {
      fontSize: 14,
      color: colors.text,
    },
    shareRole: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 2,
    },
    removeButton: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 6,
      borderWidth: 1,
      borderColor: colors.error,
    },
    removeButtonText: {
      color: colors.error,
      fontSize: 13,
      fontWeight: '500',
    },
  });
}
