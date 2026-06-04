import * as Haptics from 'expo-haptics';
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

export default function NotaDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const noteId = Array.isArray(id) ? id[0] : id;
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Palette[colorScheme === 'dark' ? 'dark' : 'light'];

  const notes = useNotesStore((state) => state.notes);
  const deleteNote = useNotesStore((state) => state.deleteNote);
  const note = notes.find((n) => n.id === noteId);

  const handleDelete = () => {
    if (!noteId) return;

    Alert.alert(
      'Eliminar nota',
      '¿Estás seguro de que quieres eliminar esta nota? Esta acción no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              // 👇 ¡AQUÍ! El móvil dará una vibración sutil justo al pulsar eliminar
              await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            } catch (error) {
              console.log("Haptics no disponible en este dispositivo", error);
            }
            deleteNote(noteId);
            router.back();
          },
        },
      ]
    );
  };

  if (!note) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.notFound, { color: colors.textMuted }]}>
          No se encontró la nota
        </Text>
        <Pressable onPress={() => router.back()}>
          <Text style={{ color: colors.primary }}>Volver</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      <Text style={[styles.title, { color: colors.text }]}>{note.title}</Text>
      <Text style={[styles.body, { color: colors.text }]}>{note.content}</Text>
      <Text style={[styles.date, { color: colors.textMuted }]}>
        Creada: {new Date(note.createdAt).toLocaleString()}
      </Text>
      <Text style={[styles.date, { color: colors.textMuted }]}>
        Actualizada: {new Date(note.updatedAt).toLocaleString()}
      </Text>

      <Pressable
        style={[styles.deleteButton, { backgroundColor: colors.accent }]}
        onPress={handleDelete}
      >
        <Ionicons name="trash-outline" size={20} color="#FFF" />
        <Text style={styles.deleteButtonText}>Eliminar nota</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: Spacing.md, paddingBottom: Spacing.lg },
  title: { ...Typography.title, fontSize: 24, marginBottom: Spacing.md },
  body: { ...Typography.body, lineHeight: 24, marginBottom: Spacing.lg },
  date: { ...Typography.caption, marginBottom: Spacing.xs },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: 8,
    marginTop: Spacing.lg,
  },
  deleteButtonText: { ...Typography.body, color: '#FFF', fontWeight: '700' },
  notFound: { ...Typography.body, textAlign: 'center', marginBottom: Spacing.md },
});
