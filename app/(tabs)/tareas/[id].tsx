import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Alert, useColorScheme, TextInput } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useNotesStore } from '../../../store/notesStore';
import { Palette, Spacing } from '../../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { getToken } from '../../../lib/auth';

const API_URL = "http://192.168.1.126:3000";

export default function ChecklistDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const checklistId = Array.isArray(id) ? id[0] : id;
  const router = useRouter();
  const colors = Palette[useColorScheme() === 'dark' ? 'dark' : 'light'];
  
  const checklist = useNotesStore((state) => state.checklists.find((c) => c.id === checklistId));
  const toggleChecklistItem = useNotesStore((state) => state.toggleChecklistItem);
  const deleteChecklist = useNotesStore((state) => state.deleteChecklist);
  const updateChecklist = useNotesStore((state) => state.updateChecklist);
  const fetchNotes = useNotesStore((state) => state.fetchNotes);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleText, setTitleText] = useState(checklist?.title || "");

  const handleSaveTitle = async () => {
    if (checklistId && titleText !== checklist?.title) {
      await updateChecklist(checklistId, { title: titleText });
    }
    setIsEditingTitle(false);
  };

  const handleToggleItem = async (itemId: string) => {
    toggleChecklistItem(checklistId!, itemId);
  };

  const handleDeleteItem = async (itemId: string) => {
    const token = await getToken();
    try {
      const response = await fetch(`${API_URL}/api/checklist-items/${itemId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) await fetchNotes();
    } catch (e) { Alert.alert("Error", "Fallo de conexión"); }
  };

  const confirmDeleteList = () => {
    Alert.alert("Eliminar", "¿Seguro?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Eliminar", style: "destructive", onPress: async () => {
          await deleteChecklist(checklistId!);
          router.back();
      }}
    ]);
  };

  if (!checklist) return <View style={styles.container}><Text>Cargando...</Text></View>;

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.titleContainer}>
        {isEditingTitle ? (
          <TextInput 
            style={[styles.titleInput, { color: colors.text }]}
            value={titleText}
            onChangeText={setTitleText}
            onBlur={handleSaveTitle}
            onSubmitEditing={handleSaveTitle} // <--- ENTER GUARDA
            autoFocus
          />
        ) : (
          <Pressable onPress={() => setIsEditingTitle(true)} style={styles.titlePressable}>
            <Text style={[styles.title, { color: colors.text }]}>{checklist.title}</Text>
            <Ionicons name="pencil" size={18} color={colors.textMuted} style={{ marginLeft: 10 }} />
          </Pressable>
        )}
      </View>
      
      {checklist.items.map((item) => (
        <View key={item.id} style={[styles.listItem, { backgroundColor: colors.surface }]}>
          <Pressable style={styles.itemRow} onPress={() => handleToggleItem(item.id)}>
            <Ionicons name={item.isCompleted ? 'checkbox' : 'square-outline'} size={24} color={colors.accent} />
            <Text style={[styles.itemText, { color: colors.text }]}>{item.text}</Text>
          </Pressable>
          <Pressable onPress={() => handleDeleteItem(item.id)}>
            <Ionicons name="trash-outline" size={20} color="#ad1a00" />
          </Pressable>
        </View>
      ))}

      <Pressable style={styles.deleteListButton} onPress={confirmDeleteList}>
        <Text style={{ color: "#ad1a00", fontWeight: 'bold' }}>ELIMINAR LISTA</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: Spacing.md, paddingTop: 40 },
  titleContainer: { marginBottom: 30, alignItems: 'center' },
  titlePressable: { flexDirection: 'row', alignItems: 'center' },
  title: { fontSize: 28, fontWeight: 'bold' },
  titleInput: { fontSize: 28, fontWeight: 'bold', borderBottomWidth: 1, textAlign: 'center', width: '90%' },
  listItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, borderRadius: 12, marginBottom: 12 },
  itemRow: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  itemText: { fontSize: 18, marginLeft: 12 },
  deleteListButton: { alignItems: 'center', marginTop: 50, padding: 20 }
});