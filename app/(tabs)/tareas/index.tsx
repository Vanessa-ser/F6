import React from 'react';
import { View, Text, StyleSheet, Pressable, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import { FlashList } from '@shopify/flash-list';
import { useNotesStore } from '../../../store/notesStore';
import { Palette, Spacing, Typography } from '../../../constants/theme';
import { Ionicons } from '@expo/vector-icons';

function getCompletionPercentage(items: { isCompleted: boolean }[]): number {
  if (items.length === 0) return 0;
  const completed = items.filter((item) => item.isCompleted).length;
  return Math.round((completed / items.length) * 100);
}

export default function ChecklistsScreen() {
  const { checklists } = useNotesStore();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Palette[colorScheme === 'dark' ? 'dark' : 'light'];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Mis Tareas</Text>
        <Pressable
          style={[styles.addButton, { backgroundColor: colors.primary }]}
          onPress={() => router.push('/nueva-nota?type=checklist')}
        >
          <Ionicons name="add" size={24} color="#FFF" />
        </Pressable>
      </View>

      <View style={styles.list}>
        <FlashList
          data={checklists}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="checkmark-done-circle-outline" size={48} color={colors.textMuted} />
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>
              ¡No hay tareas todavía!
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const percentage = getCompletionPercentage(item.items);

          return (
            <Pressable
              style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={() => router.push(`/tareas/${item.id}`)}
            >
              <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={1}>
                {item.title}
              </Text>

              <View style={styles.progressRow}>
                <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
                  <View
                    style={[
                      styles.progressFill,
                      { backgroundColor: colors.accent, width: `${percentage}%` },
                    ]}
                  />
                </View>
                <Text style={[styles.progressLabel, { color: colors.textMuted }]}>
                  {percentage}%
                </Text>
              </View>

              <Text style={[styles.cardMeta, { color: colors.textMuted }]}>
                {item.items.filter((task) => task.isCompleted).length} / {item.items.length} tareas
              </Text>

              <Text style={[styles.cardDate, { color: colors.textMuted }]}>
                {new Date(item.createdAt).toLocaleDateString()}
              </Text>
            </Pressable>
          );
        }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: Spacing.md, paddingTop: 60 },
  list: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  headerTitle: { ...Typography.title, fontSize: 28 },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    padding: Spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  cardTitle: { ...Typography.title, fontSize: 16, marginBottom: Spacing.sm },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  progressTrack: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 4 },
  progressLabel: { ...Typography.caption, minWidth: 36, textAlign: 'right' },
  cardMeta: { ...Typography.caption, marginBottom: Spacing.xs },
  cardDate: { ...Typography.caption, textAlign: 'right' },
  emptyContainer: { alignItems: 'center', marginTop: 100 },
  emptyText: { ...Typography.body, marginTop: Spacing.sm },
});
