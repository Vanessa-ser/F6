import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Note, ChecklistNote, IdeaNote } from '../types';

interface NotesState {
  notes: Note[];
  checklists: ChecklistNote[];
  ideas: IdeaNote[];
  _hasHydrated: boolean; 
  setHasHydrated: (state: boolean) => void;
  addNote: (note: Note) => void;
  addChecklist: (checklist: ChecklistNote) => void;
  addIdea: (idea: IdeaNote) => void;
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

      addNote: (note) =>
        set((state) => ({ notes: [...state.notes, note] })),

      addChecklist: (checklist) =>
        set((state) => ({ checklists: [...state.checklists, checklist] })),

      addIdea: (idea) =>
        set((state) => ({ ideas: [...state.ideas, idea] })),

      deleteNote: (id) =>
        set((state) => ({ notes: state.notes.filter((note) => note.id !== id) })),

      deleteChecklist: (id) =>
        set((state) => ({
          checklists: state.checklists.filter((checklist) => checklist.id !== id),
        })),

      deleteIdea: (id) =>
        set((state) => ({ ideas: state.ideas.filter((idea) => idea.id !== id) })),

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