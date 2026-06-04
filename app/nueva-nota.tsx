import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  useColorScheme,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { z } from 'zod';
import { useNotesStore } from '../store/notesStore';
import { Palette, Spacing, Typography } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';

const noteSchema = z.object({
  title: z.string().min(3, 'El título debe tener al menos 3 caracteres'),
  content: z.string().min(1, 'El contenido no puede estar vacío'),
});

const checklistSchema = z.object({
  title: z.string().min(3, 'El título debe tener al menos 3 caracteres'),
});

const ideaSchema = z.object({
  title: z.string().min(3, 'El título debe tener al menos 3 caracteres'),
  tagInput: z.string().min(1, 'Añade al menos una etiqueta'),
});

type NoteType = 'note' | 'checklist' | 'idea';

export default function NuevaNotaModal() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Palette[colorScheme === 'dark' ? 'dark' : 'light'];

  const { addNote, addChecklist, addIdea } = useNotesStore();

  const [type, setType] = useState<NoteType>('note');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [checklistItems, setChecklistItems] = useState<string[]>([]);
  const [newItemText, setNewItemText] = useState('');

  const [tagInput, setTagInput] = useState('');
  const [selectedColor, setSelectedColor] = useState('#FFD166');
  const ideaColors = ['#FF6B6B', '#4D96FF', '#6BCB77', '#FFD166', '#B983FF'];

  const handleAddChecklistItem = () => {
    if (newItemText.trim() === '') return;
    setChecklistItems([...checklistItems, newItemText.trim()]);
    setNewItemText('');
  };

  const handleSave = () => {
    setErrors({});
    const id = Date.now().toString();
    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;

    try {
      if (type === 'note') {
        noteSchema.parse({ title, content });
        addNote({ id, title, content, createdAt, updatedAt });
      } 
      else if (type === 'checklist') {
        checklistSchema.parse({ title });

        if (checklistItems.length === 0) {
          Alert.alert('Faltan tareas', 'Debes añadir al menos un elemento a tu lista.');
          return;
        }

        const items = checklistItems.map((text, index) => ({
          id: `${id}-${index}`,
          text,
          isCompleted: false,
        }));

        addChecklist({ id, title, items, createdAt, updatedAt });
      } 
      else if (type === 'idea') {
        ideaSchema.parse({ title, tagInput });

        const tags = tagInput
          .split(',')
          .map(t => t.trim())
          .filter(t => t !== '');

        addIdea({ id, title, tags, color: selectedColor, createdAt, updatedAt });
      }

      router.back();
    } catch (err) {
      if (err instanceof z.ZodError) {
        const formattedErrors: Record<string, string> = {};
        err.issues.forEach((e) => {
          if (e.path[0]) {
            formattedErrors[e.path[0].toString()] = e.message;
          }
        });
        setErrors(formattedErrors);
      }
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: 'Nueva Creación',
          headerBackVisible: false,
        }}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          
          <Text style={[styles.label, { color: colors.text }]}>
            ¿Qué vas a crear?
          </Text>

          <View style={styles.typeSelector}>
            {(['note', 'idea', 'checklist'] as NoteType[]).map((t) => (
              <Pressable
                key={t}
                style={[
                  styles.typeButton,
                  {
                    backgroundColor: type === t ? colors.primary : colors.surface,
                    borderColor: colors.border
                  }
                ]}
                onPress={() => {
                  setType(t);
                  setErrors({});
                }}
              >
                <Text
                  style={[
                    styles.typeButtonText,
                    { color: type === t ? '#FFF' : colors.text }
                  ]}
                >
                  {t === 'note' ? 'Nota' : t === 'checklist' ? 'Tarea' : 'Idea'}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={[styles.label, { color: colors.text }]}>Titulo</Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.surface,
                color: colors.text,
                borderColor: colors.border
              }
            ]}
            placeholder="Escribe un título..."
            placeholderTextColor={colors.textMuted}
            value={title}
            onChangeText={setTitle}
          />
          {errors.title && <Text style={styles.errorText}>{errors.title}</Text>}

          {type === 'note' && (
            <>
              <Text style={[styles.label, { color: colors.text }]}>
                Nota
              </Text>
              <TextInput
                style={[
                  styles.input,
                  styles.textArea,
                  {
                    backgroundColor: colors.surface,
                    color: colors.text,
                    borderColor: colors.border
                  }
                ]}
                placeholder="Escribe tu nota aquí..."
                placeholderTextColor={colors.textMuted}
                multiline
                value={content}
                onChangeText={setContent}
              />
              {errors.content && (
                <Text style={styles.errorText}>{errors.content}</Text>
              )}
            </>
          )}

          {type === 'checklist' && (
            <>
              <Text style={[styles.label, { color: colors.text }]}>
                Tareas
              </Text>

              <View style={styles.row}>
                <TextInput
                  style={[
                    styles.input,
                    {
                      flex: 1,
                      backgroundColor: colors.surface,
                      color: colors.text,
                      borderColor: colors.border,
                      marginBottom: 0
                    }
                  ]}
                  placeholder="Nueva tarea..."
                  placeholderTextColor={colors.textMuted}
                  value={newItemText}
                  onChangeText={setNewItemText}
                />

                <Pressable
                  style={[styles.addButton, { backgroundColor: colors.primary }]}
                  onPress={handleAddChecklistItem}
                >
                  <Ionicons name="add" size={24} color="#FFF" />
                </Pressable>
              </View>

              {checklistItems.map((item, index) => (
                <View
                  key={index}
                  style={[
                    styles.listItem,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.border
                    }
                  ]}
                >
                  <Ionicons
                    name="square-outline"
                    size={20}
                    color={colors.textMuted}
                  />
                  <Text style={[styles.listItemText, { color: colors.text }]}>
                    {item}
                  </Text>
                </View>
              ))}
            </>
          )}

          {type === 'idea' && (
            <>
              <Text style={[styles.label, { color: colors.text }]}>
                Etiquetas (separadas por comas)
              </Text>

              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.surface,
                    color: colors.text,
                    borderColor: colors.border
                  }
                ]}
                placeholder="ej: diseño, trabajo, importante"
                placeholderTextColor={colors.textMuted}
                value={tagInput}
                onChangeText={setTagInput}
              />

              {errors.tagInput && (
                <Text style={styles.errorText}>{errors.tagInput}</Text>
              )}

              <Text style={[styles.label, { color: colors.text }]}>
                Color de la tarjeta
              </Text>

              <View style={styles.colorRow}>
                {ideaColors.map((color) => (
                  <Pressable
                    key={color}
                    style={[
                      styles.colorCircle,
                      { backgroundColor: color },
                      selectedColor === color && styles.selectedColorCircle
                    ]}
                    onPress={() => setSelectedColor(color)}
                  />
                ))}
              </View>
            </>
          )}

          <Pressable
            style={[styles.saveButton, { backgroundColor: colors.primary }]}
            onPress={handleSave}
          >
            <Text style={styles.saveButtonText}>Guardar Nota</Text>
          </Pressable>

          {/* BOTÓN VOLVER */}
          <Pressable
            style={[
              styles.backButton,
              { backgroundColor: colors.surface, borderColor: colors.border }
            ]}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={20} color={colors.text} />
            <Text style={[styles.backButtonText, { color: colors.text }]}>
              Volver
            </Text>
          </Pressable>

        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContainer: {
    padding: Spacing.md,
    paddingBottom: 40
  },
  label: {
    ...Typography.title,
    fontSize: 16,
    marginTop: Spacing.md,
    marginBottom: Spacing.xs
  },
  typeSelector: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.sm
  },
  typeButton: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center'
  },
  typeButtonText: {
    ...Typography.body,
    fontWeight: '600'
  },
  input: {
    padding: Spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 16,
    marginBottom: Spacing.xs
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top'
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
    alignItems: 'center'
  },
  addButton: {
    width: 50,
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center'
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: Spacing.xs,
    gap: Spacing.sm
  },
  listItemText: {
    ...Typography.body
  },
  colorRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginVertical: Spacing.xs
  },
  colorCircle: {
    width: 36,
    height: 36,
    borderRadius: 18
  },
  selectedColorCircle: {
    borderWidth: 3,
    borderColor: '#000'
  },
  saveButton: {
    padding: Spacing.md,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: Spacing.lg
  },
  saveButtonText: {
    ...Typography.body,
    color: '#FFF',
    fontWeight: '700'
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginBottom: Spacing.xs
  },

  // NUEVO BOTÓN
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: Spacing.md,
    gap: Spacing.sm
  },
  backButtonText: {
    ...Typography.body,
    fontWeight: '600'
  }
});