import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  useColorScheme,
  ScrollView,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useNotesStore } from '../../../store/notesStore';
import { Palette, Spacing, Typography } from '../../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics'; 

function getCompletionPercentage(items: { isCompleted: boolean }[]): number {
  if (items.length === 0) return 0;
  const completed = items.filter((item) => item.isCompleted).length;
  return Math.round((completed / items.length) * 100);
}

export default function ChecklistDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const checklistId = Array.isArray(id) ? id[0] : id;
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Palette[colorScheme === 'dark' ? 'dark' : 'light'];

  const checklists = useNotesStore((state) => state.checklists);
  const deleteChecklist = useNotesStore((state) => state.deleteChecklist);
  const toggleChecklistItem = useNotesStore((state) => state.toggleChecklistItem); 

  const checklist = checklists.find((c) => c.id === checklistId);


  const handleDelete = () => {
    if (!checklistId) return;

    Alert.alert(
      'Eliminar Lista',
      '¿Estás seguro de que quieres eliminar esta lista? Esta acción no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {

            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            deleteChecklist(checklistId);
            router.back();
          },
        },
      ]
    );
  };

  const handleEdit = () => {
    if (!checklistId) return;
    router.push({
      pathname: '/nueva-nota',
      params: {
        type: 'checklist',
        edit: 'true',
        id: checklistId,
      },
    });
  };

  
  const handleToggleItem = async (itemId: string) => {
    if (!checklistId) return;

   
    toggleChecklistItem(checklistId, itemId);

 
    const updatedChecklist = useNotesStore.getState().checklists.find((c) => c.id === checklistId);
    
    if (updatedChecklist) {

      const todasCompletadas = updatedChecklist.items.every((item) => item.isCompleted);
      

      if (todasCompletadas) {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    }
  };

  if (!checklist) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.notFound, { color: colors.textMuted }]}>
          No se encontró la checklist
        </Text>
        <Pressable onPress={() => router.back()}>
          <Text style={{ color: colors.primary }}>Volver</Text>
        </Pressable>
      </View>
    );
  }

  const percentage = getCompletionPercentage(checklist.items);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      <Text style={[styles.title, { color: colors.text }]}>{checklist.title}</Text>

      <View style={styles.progressRow}>
        <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
          <View
            style={[
              styles.progressFill,
              { backgroundColor: colors.primary, width: `${percentage}%` },
            ]}
          />
        </View>
        <Text style={[styles.progressLabel, { color: colors.textMuted }]}>
          {percentage}%
        </Text>
      </View>

      
      {checklist.items.map((item) => (
        <Pressable
          key={item.id}
          style={[styles.listItem, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={() => handleToggleItem(item.id)} 
        >
          <Ionicons
            name={item.isCompleted ? 'checkbox' : 'square-outline'}
            size={22}
            color={item.isCompleted ? colors.accent : colors.textMuted}
          />
          <Text
            style={[
              styles.listItemText,
              { color: colors.text },
              item.isCompleted && styles.completedText,
            ]}
          >
            {item.text}
          </Text>
        </Pressable>
      ))}

      <Text style={[styles.date, { color: colors.textMuted }]}>
        Creada: {new Date(checklist.createdAt).toLocaleString()}
      </Text>

      <View style={styles.buttonsContainer}>
        <Pressable
          style={[styles.editButton, { backgroundColor: colors.accent }]}
          onPress={handleEdit}
        >
          <Ionicons name="pencil" size={20} color="#FFF" />
          <Text style={styles.buttonText}>Editar</Text>
        </Pressable>

        <Pressable
          style={[styles.deleteButton, { backgroundColor: colors.primary }]}
          onPress={handleDelete}
        >
          <Ionicons name="trash-outline" size={20} color="#FFFFFF" />
          <Text style={styles.buttonText}>Eliminar</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: Spacing.md, paddingBottom: Spacing.lg },
  title: { ...Typography.title, fontSize: 24, marginBottom: Spacing.md },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  progressTrack: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 4 },
  progressLabel: { ...Typography.caption, minWidth: 36, textAlign: 'right' },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: Spacing.xs,
    gap: Spacing.sm,
  },
  listItemText: { ...Typography.body, flex: 1 },
  completedText: { textDecorationLine: 'line-through', opacity: 0.6 },
  date: { ...Typography.caption, marginTop: Spacing.md, marginBottom: Spacing.xs },
  buttonsContainer: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.lg,
  },
  editButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: 8,
  },
  deleteButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: 8,
  },
  buttonText: { ...Typography.body, color: '#FFF', fontWeight: '700' },
  notFound: { ...Typography.body, textAlign: 'center', marginBottom: Spacing.md },
});