import React from 'react';
import { View, Text, StyleSheet, Pressable, useColorScheme, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { FlashList } from '@shopify/flash-list';
import { useNotesStore } from '../../../store/notesStore';
import { logout } from '../../../lib/api';
import { Palette, Spacing, Typography } from '../../../constants/theme';
import { Ionicons } from '@expo/vector-icons';

export default function IdeasScreen() {
  const { ideas } = useNotesStore();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Palette[colorScheme === 'dark' ? 'dark' : 'light'];

  const handleLogout = async () => {
    await logout();
    useNotesStore.setState({ notes: [], checklists: [], ideas: [] });
    router.replace('/login');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Pressable
          style={[styles.logoutButton, { borderColor: colors.border }]}
          onPress={handleLogout}
        >
          <Ionicons name="exit-outline" size={24} color={colors.text} />
        </Pressable>

        <Text style={[styles.headerTitle, { color: colors.text }]}>Mis Ideas</Text>
        <Pressable
          style={[styles.addButton, { backgroundColor: colors.primary }]}
          onPress={() => router.push('/nueva-nota?type=idea')}
        >
          <Ionicons name="add" size={24} color="#FFF" />
        </Pressable>
      </View>

      <View style={styles.list}>
        <FlashList
          data={ideas}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="bulb-outline" size={48} color={colors.textMuted} />
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>
              No hay ideas todavía
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <Pressable
            style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => router.push(`/ideas/${item.id}`)}
          >
            <View style={styles.titleRow}>
              <View style={[styles.colorDot, { backgroundColor: item.color }]} />
              <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={1}>
                {item.title}
              </Text>
            </View>

            {item.tags.length > 0 && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.tagsRow}
              >
                {item.tags.map((tag, index) => (
                  <View
                    key={`${item.id}-${tag}-${index}`}
                    style={[
                      styles.tagChip,
                      {
                        backgroundColor: `${item.color}26`,
                        borderColor: item.color,
                      },
                    ]}
                  >
                    <Text style={[styles.tagText, { color: item.color }]}>{tag}</Text>
                  </View>
                ))}
              </ScrollView>
            )}

            <Text style={[styles.cardDate, { color: colors.textMuted }]}>
              {new Date(item.createdAt).toLocaleDateString()}
            </Text>
          </Pressable>
        )}
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
  logoutButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  card: {
    padding: Spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: Spacing.sm,
  },
  colorDot: { width: 10, height: 10, borderRadius: 5 },
  cardTitle: { ...Typography.title, fontSize: 16, flex: 1 },
  cardBody: { ...Typography.body, fontSize: 14, marginBottom: Spacing.sm },
  tagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  tagChip: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: 16,
    borderWidth: 1,
  },
  tagText: { ...Typography.caption, fontWeight: '600' },
  cardDate: { ...Typography.caption, textAlign: 'right' },
  emptyContainer: { alignItems: 'center', marginTop: 100 },
  emptyText: { ...Typography.body, marginTop: Spacing.sm },
});
