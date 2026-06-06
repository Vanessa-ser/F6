import API_URL from '../config/api';
import { getToken, saveToken, removeToken } from './auth';
import type { AnyNote, ChecklistItem, ChecklistNote, IdeaNote, Note } from '../types';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? API_URL;

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = await getToken();
  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  // SI LA RESPUESTA ES 204, devolvemos null directamente sin intentar parsear JSON
  if (response.status === 204) {
    return null as any; 
  }

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API error ${response.status}: ${errorText}`);
  }

  return response.json();
}

// Tipos de carga
export type CreateNotePayload = {
  id?: string;
  title: string;
  type: 'note' | 'idea';
  content?: string;
  color?: string;
  tags?: string[];
};

export type CreateChecklistPayload = {
  id?: string;
  title: string;
  items: ChecklistItem[];
};

// Funciones de Auth
export async function loginUser(email: string, password: string) {
  const response = await request<{ token: string }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  await saveToken(response.token);
  return response;
}

export async function logout(): Promise<void> {
  await removeToken();
}

// Funciones de Notas y Checklists
export async function getNotes(): Promise<AnyNote[]> {
  return request<AnyNote[]>('/notes');
}

export async function createNote(data: CreateNotePayload): Promise<Note | IdeaNote> {
  return request<Note | IdeaNote>('/notes', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function createChecklist(data: CreateChecklistPayload): Promise<ChecklistNote> {
  // Corregido: apunta a /notes para mantener consistencia con el backend
  return request<ChecklistNote>('/notes', {
    method: 'POST',
    body: JSON.stringify({ ...data, type: 'checklist' }),
  });
}

export async function updateNote(id: string, data: Partial<CreateNotePayload>): Promise<AnyNote> {
  return request<AnyNote>(`/notes/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function deleteNote(id: string): Promise<void> {
  // Esta ruta debe coincidir con app/api/notes/[id]/route.ts
  await request<void>(`/notes/${id}`, { method: 'DELETE' });
}

// Funciones de ítems individuales
export async function toggleChecklistItem(itemId: string, isCompleted: boolean): Promise<ChecklistItem> {
  return request<ChecklistItem>(`/checklist-items/${itemId}`, {
    method: 'PATCH',
    body: JSON.stringify({ isCompleted }),
  });
}

export async function deleteChecklistItem(itemId: string): Promise<void> {
  await request<void>(`/checklist-items/${itemId}`, { method: 'DELETE' });
}