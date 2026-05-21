import React from 'react';
import { View, Text, StyleSheet, Pressable, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import { FlashList } from '@shopify/flash-list';
import { useNotesStore } from '../../../store/notesStore';
import { Palette, Spacing, Typography } from '../../../constants/theme';
import { Ionicons } from '@expo/vector-icons';

export default function NotasScreen() {
  const { notes } = useNotesStore();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Palette[colorScheme === 'dark' ? 'dark' : 'light'];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Cabecera personalizada */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Mis Notas</Text>
        <Pressable 
          style={[styles.addButton, { backgroundColor: colors.primary }]}
          onPress={() => router.push('/nueva-nota')}
        >
          <Ionicons name="add" size={24} color="#FFF" />
        </Pressable>
      </View>

      <View style={styles.list}>
        <FlashList
          data={notes}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={48} color={colors.textMuted} />
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>No hay notas todavía</Text>
          </View>
        }
        renderItem={({ item }) => (
          <Pressable 
            style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => router.push(`/notas/${item.id}`)}
          >
            <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={1}>
              {item.title}
            </Text>
            <Text style={[styles.cardBody, { color: colors.textMuted }]} numberOfLines={2}>
              {item.content}
            </Text>
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
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.lg },
  headerTitle: { ...Typography.title, fontSize: 28 },
  addButton: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  card: { padding: Spacing.md, borderRadius: 12, borderWidth: 1, marginBottom: Spacing.sm },
  cardTitle: { ...Typography.title, fontSize: 16, marginBottom: 4 },
  cardBody: { ...Typography.body, fontSize: 14, marginBottom: 8 },
  cardDate: { ...Typography.caption, textAlign: 'right' },
  emptyContainer: { alignItems: 'center', marginTop: 100 },
  emptyText: { ...Typography.body, marginTop: Spacing.sm },
});