import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Note, ChecklistNote, IdeaNote } from '../types';
import { saveNoteToCloud, saveChecklistToCloud } from 'service/api_test';

interface NotesState {
  notes: Note[];
  checklists: ChecklistNote[];
  ideas: IdeaNote[];
  _hasHydrated: boolean; 
  setHasHydrated: (state: boolean) => void;
  addNote: (note: Note) => void;
  addChecklist: (checklist: ChecklistNote) => void;
  addIdea: (idea: IdeaNote) => void;
  updateNote: (id: string, note: Partial<Note>) => void;
  updateChecklist: (id: string, checklist: Partial<ChecklistNote>) => void;
  updateIdea: (id: string, idea: Partial<IdeaNote>) => void;
  deleteNote: (id: string) => void;
  deleteChecklist: (id: string) => void;
  deleteIdea: (id: string) => void;
  toggleChecklistItem: (checklistId: string, itemId: string) => void; 
}

export const useNotesStore = create<NotesState>()(
  persist(
    (set) => ({
      notes: [],
      checklists: [],
      ideas: [],
      _hasHydrated: false, 

      setHasHydrated: (state) => set({ _hasHydrated: state }),

      addNote: (note) => {
        set((state) => ({ notes: [...state.notes, note] }));
        // Sincronización con la nube
        saveNoteToCloud(note).catch((err: unknown) => console.error("Error nube:", err));
      },

      addChecklist: (checklist) => {
        set((state) => ({ checklists: [...state.checklists, checklist] }));
        // Sincronización con la nube
        saveChecklistToCloud(checklist).catch((err: unknown) => console.error("Error nube:", err));
      },

      addIdea: (idea) => {
        set((state) => ({ ideas: [...state.ideas, idea] }));
        // Sincronización con la nube
        saveNoteToCloud(idea).catch((err: unknown) => console.error("Error nube:", err));
      },

      deleteNote: (id) =>
        set((state) => ({ notes: state.notes.filter((note) => note.id !== id) })),

      deleteChecklist: (id) =>
        set((state) => ({
          checklists: state.checklists.filter((checklist) => checklist.id !== id),
        })),

      deleteIdea: (id) =>
        set((state) => ({ ideas: state.ideas.filter((idea) => idea.id !== id) })),

      updateNote: (id, updatedData) =>
        set((state) => ({
          notes: state.notes.map((note) =>
            note.id === id ? { ...note, ...updatedData, updatedAt: new Date().toISOString() } : note
          ),
        })),

      updateChecklist: (id, updatedData) =>
        set((state) => ({
          checklists: state.checklists.map((checklist) =>
            checklist.id === id 
              ? { ...checklist, ...updatedData, updatedAt: new Date().toISOString() } 
              : checklist
          ),
        })),

      updateIdea: (id, updatedData) =>
        set((state) => ({
          ideas: state.ideas.map((idea) =>
            idea.id === id ? { ...idea, ...updatedData, updatedAt: new Date().toISOString() } : idea
          ),
        })),

      toggleChecklistItem: (checklistId, itemId) =>
        set((state) => ({
          checklists: state.checklists.map((c) =>
            c.id !== checklistId
              ? c
              : {
                  ...c,
                  items: c.items.map((item) =>
                    item.id === itemId ? { ...item, isCompleted: !item.isCompleted } : item
                  ),
                }
          ),
        })),
    }),
    {
      name: 'noteflow-storage',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);