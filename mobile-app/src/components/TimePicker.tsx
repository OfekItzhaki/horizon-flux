import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Modal,
    ScrollView,
    Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createTaskDetailsStyles } from '../screens/styles/TaskDetailsScreen.styles';
import { useThemedStyles } from '../utils/useThemedStyles';

interface TimePickerProps {
    value: string; // HH:MM format
    onChange: (time: string) => void;
}

export default function TimePicker({ value, onChange }: TimePickerProps) {
    const styles = useThemedStyles(createTaskDetailsStyles);
    const [showPicker, setShowPicker] = useState(false);
    const [hours, minutes] = value.split(':');

    const handleHourChange = (hour: string) => {
        onChange(`${hour}:${minutes || '00'}`);
    };

    const handleMinuteChange = (minute: string) => {
        onChange(`${hours || '09'}:${minute}`);
    };

    return (
        <View>
            <TouchableOpacity
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    padding: 14,
                    borderWidth: 2,
                    borderColor: '#e2e8f0',
                    borderRadius: 12,
                    backgroundColor: '#f8fafc',
                }}
                onPress={() => setShowPicker(true)}
                activeOpacity={0.7}
            >
                <Ionicons name="time-outline" size={20} color="#6366f1" style={{ marginRight: 10 }} />
                <Text style={{ color: '#1e293b', fontSize: 16, fontWeight: '600' }}>
                    {value || '09:00'}
                </Text>
            </TouchableOpacity>

            <Modal
                visible={showPicker}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowPicker(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { height: 'auto', maxHeight: '70%' }]}>
                        <View style={styles.dragHandle} />
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Select Time</Text>
                            <TouchableOpacity
                                style={styles.closeButton}
                                onPress={() => setShowPicker(false)}
                            >
                                <Ionicons name="close" size={24} color="#64748b" />
                            </TouchableOpacity>
                        </View>

                        <View style={{ padding: 24, paddingTop: 12 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                                {/* Hours Picker */}
                                <View style={{ flex: 1 }}>
                                    <Text style={{ fontSize: 13, fontWeight: '700', color: '#64748b', marginBottom: 8, textAlign: 'center' }}>
                                        Hour
                                    </Text>
                                    <ScrollView
                                        style={{
                                            maxHeight: 200,
                                            borderWidth: 2,
                                            borderColor: '#e2e8f0',
                                            borderRadius: 12,
                                            backgroundColor: '#f8fafc',
                                        }}
                                        showsVerticalScrollIndicator={false}
                                    >
                                        {Array.from({ length: 24 }).map((_, i) => {
                                            const hour = String(i).padStart(2, '0');
                                            const isSelected = hours === hour;
                                            return (
                                                <TouchableOpacity
                                                    key={i}
                                                    style={{
                                                        padding: 12,
                                                        alignItems: 'center',
                                                        backgroundColor: isSelected ? '#6366f1' : 'transparent',
                                                        borderRadius: 8,
                                                        marginVertical: 2,
                                                        marginHorizontal: 4,
                                                    }}
                                                    onPress={() => {
                                                        handleHourChange(hour);
                                                    }}
                                                >
                                                    <Text
                                                        style={{
                                                            fontSize: 18,
                                                            fontWeight: isSelected ? '800' : '600',
                                                            color: isSelected ? '#fff' : '#1e293b',
                                                        }}
                                                    >
                                                        {hour}
                                                    </Text>
                                                </TouchableOpacity>
                                            );
                                        })}
                                    </ScrollView>
                                </View>

                                <Text style={{ fontSize: 28, fontWeight: '700', color: '#64748b', paddingTop: 24 }}>:</Text>

                                {/* Minutes Picker */}
                                <View style={{ flex: 1 }}>
                                    <Text style={{ fontSize: 13, fontWeight: '700', color: '#64748b', marginBottom: 8, textAlign: 'center' }}>
                                        Minute
                                    </Text>
                                    <ScrollView
                                        style={{
                                            maxHeight: 200,
                                            borderWidth: 2,
                                            borderColor: '#e2e8f0',
                                            borderRadius: 12,
                                            backgroundColor: '#f8fafc',
                                        }}
                                        showsVerticalScrollIndicator={false}
                                    >
                                        {Array.from({ length: 60 }).map((_, i) => {
                                            const minute = String(i).padStart(2, '0');
                                            const isSelected = minutes === minute;
                                            return (
                                                <TouchableOpacity
                                                    key={i}
                                                    style={{
                                                        padding: 12,
                                                        alignItems: 'center',
                                                        backgroundColor: isSelected ? '#6366f1' : 'transparent',
                                                        borderRadius: 8,
                                                        marginVertical: 2,
                                                        marginHorizontal: 4,
                                                    }}
                                                    onPress={() => {
                                                        handleMinuteChange(minute);
                                                    }}
                                                >
                                                    <Text
                                                        style={{
                                                            fontSize: 18,
                                                            fontWeight: isSelected ? '800' : '600',
                                                            color: isSelected ? '#fff' : '#1e293b',
                                                        }}
                                                    >
                                                        {minute}
                                                    </Text>
                                                </TouchableOpacity>
                                            );
                                        })}
                                    </ScrollView>
                                </View>
                            </View>

                            <TouchableOpacity
                                style={[
                                    styles.modalButton,
                                    styles.saveButton,
                                    { marginTop: 20 },
                                ]}
                                onPress={() => setShowPicker(false)}
                            >
                                <Text style={styles.saveButtonText}>Done</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}
