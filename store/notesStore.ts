import { create } from 'zustand';
import type { ChecklistNote, IdeaNote, Note } from '../types';
import {
  createChecklist,
  createNote,
  deleteNote as deleteNoteApi,
  deleteChecklistItem as deleteChecklistItemApi,
  getNotes,
  toggleChecklistItem as apiToggleChecklistItem,
  updateNote as updateNoteApi,
} from '../lib/api';

interface NotesState {
  notes: Note[];
  checklists: ChecklistNote[];
  ideas: IdeaNote[];
  isLoading: boolean;
  error: string | null;
  setError: (message: string | null) => void;
  fetchNotes: () => Promise<void>;
  addNote: (note: Omit<Note, 'id'>) => Promise<void>;
  addChecklist: (checklist: Omit<ChecklistNote, 'id'>) => Promise<void>;
  addIdea: (idea: Omit<IdeaNote, 'id'>) => Promise<void>;
  updateNote: (id: string, updatedData: Partial<Note>) => Promise<void>;
  updateChecklist: (id: string, updatedData: Partial<ChecklistNote>) => Promise<void>;
  updateIdea: (id: string, updatedData: Partial<IdeaNote>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  deleteChecklist: (id: string) => Promise<void>;
  deleteIdea: (id: string) => Promise<void>;
  deleteChecklistItem: (checklistId: string, itemId: string) => Promise<void>;
  toggleChecklistItem: (checklistId: string, itemId: string) => Promise<void>;
}

export const useNotesStore = create<NotesState>()((set, get) => ({
  notes: [],
  checklists: [],
  ideas: [],
  isLoading: false,
  error: null,

  setError: (message) => set({ error: message }),

  fetchNotes: async () => {
    set({ isLoading: true, error: null });
    try {
      const items = await getNotes();
      console.log("DATOS RECIBIDOS DEL SERVIDOR:", JSON.stringify(items, null, 2));
      set({
        notes: items.filter((item): item is Note => item.type === 'note'),
        checklists: items.filter((item): item is ChecklistNote => item.type === 'checklist'),
        ideas: items.filter((item): item is IdeaNote => item.type === 'idea'),
      });
    } catch (error) {
      set({ error: 'Error al cargar notas' });
    } finally {
      set({ isLoading: false });
    }
  },

  addNote: async (note) => {
    set({ isLoading: true });
    try {
      const payload = { ...note, type: 'note' as const };
      delete (payload as any).id;
      await createNote(payload as any);
      await get().fetchNotes();
    } catch (e) {
      set({ error: 'Error al crear nota' });
    } finally {
      set({ isLoading: false });
    }
  },

  addChecklist: async (checklist) => {
    set({ isLoading: true });
    try {
      const payload = { ...checklist, type: 'checklist' as const };
      delete (payload as any).id;
      await createChecklist(payload as any);
      await get().fetchNotes();
    } catch (e) {
      set({ error: 'Error al crear checklist' });
    } finally {
      set({ isLoading: false });
    }
  },

  addIdea: async (idea) => {
    set({ isLoading: true });
    try {
      const payload = { ...idea, type: 'idea' as const };
      delete (payload as any).id;
      await createNote(payload as any);
      await get().fetchNotes();
    } catch (e) {
      set({ error: 'Error al crear idea' });
    } finally {
      set({ isLoading: false });
    }
  },

  updateNote: async (id, updatedData) => {
    try {
      const updated = (await updateNoteApi(id, updatedData)) as Note;
      set((state) => ({
        notes: state.notes.map((n) =>
          n.id === id && n.type === 'note' ? { ...n, ...updated } : n
        ),
      }));
    } catch (e) {
      set({ error: 'Error al actualizar nota' });
    }
  },

  updateChecklist: async (id, updatedData) => {
    try {
      const updated = (await updateNoteApi(id, updatedData)) as ChecklistNote;
      set((state) => ({
        checklists: state.checklists.map((c) =>
          c.id === id ? { ...c, ...updated } : c
        ),
      }));
    } catch (e) {
      set({ error: 'Error al actualizar checklist' });
      throw e; // Lanzamos el error para que el componente pueda manejarlo (ej: revertir título)
    }
  },

  updateIdea: async (id, updatedData) => {
    try {
      const updated = (await updateNoteApi(id, { title: updatedData.title, color: updatedData.color, tags: updatedData.tags })) as IdeaNote;
      set((state) => ({
        ideas: state.ideas.map((i) =>
          i.id === id && i.type === 'idea' ? { ...i, ...updated } : i
        ),
      }));
    } catch (e) {
      set({ error: 'Error al actualizar idea' });
    }
  },

  deleteNote: async (id) => {
    try {
      await deleteNoteApi(id);
      set((state) => ({ notes: state.notes.filter((n) => n.id !== id) }));
    } catch (e) {
      set({ error: 'Error al eliminar nota' });
    }
  },

deleteChecklist: async (id) => {
  try {
    await deleteNoteApi(id); // Esto ya sabemos que funciona
    
    // Fuerza un nuevo estado para que React detecte el cambio
    set((state) => ({ 
      checklists: [...state.checklists.filter((c) => c.id !== id)] 
    }));
  } catch (e) {
    console.error("Error al borrar:", e);
    throw e;
  }
},

  deleteIdea: async (id) => {
    try {
      await deleteNoteApi(id);
      set((state) => ({ ideas: state.ideas.filter((i) => i.id !== id) }));
    } catch (e) {
      set({ error: 'Error al eliminar idea' });
    }
  },

  toggleChecklistItem: async (checklistId, itemId) => {
    const item = get().checklists.find(c => c.id === checklistId)?.items.find(i => i.id === itemId);
    if (!item) return;
    
    try {
      const updated = await apiToggleChecklistItem(itemId, !item.isCompleted);
      set((state) => ({
        checklists: state.checklists.map((c) => c.id !== checklistId ? c : {
          ...c,
          items: c.items.map((t) => t.id === itemId ? { ...t, isCompleted: updated.isCompleted } : t)
        })
      }));
    } catch (e) {
      set({ error: 'Error al actualizar tarea' });
    }
  },

  deleteChecklistItem: async (checklistId, itemId) => {
    try {
      await deleteChecklistItemApi(itemId);
      set((state) => ({
        checklists: state.checklists.map((c) =>
          c.id !== checklistId
            ? c
            : {
                ...c,
                items: c.items.filter((item) => item.id !== itemId),
              }
        ),
      }));
    } catch (e) {
      set({ error: 'Error al eliminar tarea' });
    }
  },
}));