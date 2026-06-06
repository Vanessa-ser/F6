export type NoteItem = Note | ChecklistNote | IdeaNote;

export interface BaseNote {
  id: string;
  title: string;
  type: NoteType;
  color?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Note extends BaseNote {
  type: 'note';
  content: string;
  tags?: string[];
}

export interface ChecklistItem {
  id: string;
  text: string;
  isCompleted: boolean;
}

export interface ChecklistNote extends BaseNote {
  type: 'checklist';
  items: ChecklistItem[];
}

export interface IdeaNote extends BaseNote {
  type: 'idea';
  tags: string[];
  color: string;
}

export type AnyNote = Note | ChecklistNote | IdeaNote;
