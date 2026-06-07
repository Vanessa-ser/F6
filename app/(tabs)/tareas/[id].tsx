import * as Haptics from 'expo-haptics';
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Alert,
  useColorScheme,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useNotesStore } from '../../../store/notesStore';
import { Palette, Spacing, Typography } from '../../../constants/theme';
import { Ionicons } from '@expo/vector-icons';

export default function ChecklistDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const checklistId = Array.isArray(id) ? id[0] : id;
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Palette[colorScheme === 'dark' ? 'dark' : 'light'];

  const checklist = useNotesStore((state) => state.checklists.find((c) => c.id === checklistId));
  const toggleChecklistItem = useNotesStore((state) => state.toggleChecklistItem);
  const deleteChecklistItem = useNotesStore((state) => state.deleteChecklistItem);
  const deleteChecklist = useNotesStore((state) => state.deleteChecklist);

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
    await toggleChecklistItem(checklistId, itemId);
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!checklistId) return;
    await deleteChecklistItem(checklistId, itemId);
  };

  const handleDeleteList = () => {
    if (!checklistId) return;

    Alert.alert(
      'Eliminar lista',
      '¿Estás seguro de que quieres eliminar esta lista de tareas? Esta acción no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            } catch {}
            await deleteChecklist(checklistId);
            router.replace('/');
          },
        },
      ]
    );
  };

  if (!checklist) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}> 
        <Text style={[styles.loadingText, { color: colors.textMuted }]}>Cargando tarea...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
        <Text style={[styles.title, { color: colors.text }]}>{checklist.title}</Text>
        <View style={styles.metaRow}>
          <Text style={[styles.metaText, { color: colors.textMuted }]}>Tareas: {checklist.items.length}</Text>
          <Text style={[styles.metaText, { color: colors.textMuted }]}>Actualizado: {new Date(checklist.updatedAt).toLocaleDateString()}</Text>
        </View>
      </View>

      {checklist.items.map((item) => (
        <View
          key={item.id}
          style={[styles.listItem, { backgroundColor: colors.surface, borderColor: colors.border }]}
        >
          <Pressable style={styles.itemRow} onPress={() => handleToggleItem(item.id)}>
            <Ionicons
              name={item.isCompleted ? 'checkbox' : 'square-outline'}
              size={24}
              color={colors.accent}
            />
            <Text
              style={[
                styles.itemText,
                {
                  color: colors.text,
                  textDecorationLine: item.isCompleted ? 'line-through' : 'none',
                },
              ]}
            >
              {item.text}
            </Text>
          </Pressable>
          <Pressable style={styles.itemDeleteButton} onPress={() => handleDeleteItem(item.id)}>
            <Ionicons name="trash-outline" size={18} color="#ad1a00" />
          </Pressable>
        </View>
      ))}

      <View style={styles.buttonsContainer}>
        <Pressable style={[styles.actionButton, { backgroundColor: colors.accent }]} onPress={handleEdit}>
          <Ionicons name="pencil" size={20} color="#FFF" />
          <Text style={styles.buttonText}>Editar</Text>
        </Pressable>
        <Pressable style={[styles.actionButton, styles.deleteActionButton]} onPress={handleDeleteList}>
          <Ionicons name="trash-outline" size={20} color="#ad1a00" />
          <Text style={styles.deleteButtonText}>Eliminar</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: Spacing.md, paddingBottom: Spacing.lg },
  loadingText: { ...Typography.body, textAlign: 'center', marginTop: Spacing.lg },
  card: {
    padding: Spacing.md,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  title: { ...Typography.title, fontSize: 26, marginBottom: Spacing.sm },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  metaText: { ...Typography.caption },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  itemRow: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: Spacing.sm, minHeight: 48 },
  itemText: { ...Typography.body, fontSize: 18, marginLeft: Spacing.sm, flexShrink: 1 },
  itemDeleteButton: {
    width: 34,
    height: 34,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonsContainer: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.lg,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: 10,
  },
  deleteActionButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#ad1a00',
  },
  buttonText: { ...Typography.body, color: '#FFF', fontWeight: '700' },
  deleteButtonText: { ...Typography.body, color: '#ad1a00', fontWeight: '700' },
});
