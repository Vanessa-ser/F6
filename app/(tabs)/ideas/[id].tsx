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
import * as Haptics from 'expo-haptics'; // Importamos haptics para la vibración

export default function IdeaDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const ideaId = Array.isArray(id) ? id[0] : id;
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Palette[colorScheme === 'dark' ? 'dark' : 'light'];

  const ideas = useNotesStore((state) => state.ideas);
  const deleteIdea = useNotesStore((state) => state.deleteIdea);
  const idea = ideas.find((i) => i.id === ideaId);

  const handleDelete = () => {
    if (!ideaId) return;

    Alert.alert(
      'Eliminar idea',
      '¿Estás seguro de que quieres eliminar esta idea? Esta acción no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            // 👇 Requisito de la entrega: Vibración ligera al confirmar el borrado
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            deleteIdea(ideaId);
            router.back();
          },
        },
      ]
    );
  };

  const handleEdit = () => {
    if (!ideaId) return;
    router.push({
      pathname: '/nueva-nota',
      params: {
        type: 'idea',
        edit: 'true',
        id: ideaId,
      },
    });
  };

  if (!idea) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.notFound, { color: colors.textMuted }]}>
          No se encontró la idea
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
      {/* Tarjeta de la idea usando el color pastel que guardó el usuario */}
      <View style={[styles.card, { backgroundColor: idea.color || colors.surface }]}>
        <Text style={styles.title}>{idea.title}</Text>
        
        <Text style={styles.label}>Etiquetas:</Text>
        <View style={styles.tagContainer}>
          {idea.tags.map((tag, index) => (
            <View key={index} style={styles.tagChip}>
              <Text style={styles.tagText}>#{tag}</Text>
            </View>
          ))}
        </View>
      </View>

      <Text style={[styles.date, { color: colors.textMuted }]}>
        Creada: {new Date(idea.createdAt).toLocaleString()}
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
          <Ionicons name="trash-outline" size={20} color="#FFF" />
          <Text style={styles.buttonText}>Eliminar</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: Spacing.md, paddingBottom: Spacing.lg },
  card: {
    padding: Spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    marginBottom: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    ...Typography.title,
    fontSize: 22,
    color: '#000',
    marginBottom: Spacing.md,
  },
  label: {
    ...Typography.caption,
    fontWeight: '700',
    color: 'rgba(0,0,0,0.6)',
    marginBottom: Spacing.xs,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  tagChip: {
    backgroundColor: 'rgba(255,255,255,0.6)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  tagText: {
    ...Typography.caption,
    fontWeight: '600',
    color: '#333',
  },
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