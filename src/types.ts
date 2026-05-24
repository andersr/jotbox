export interface Note {
  id: string;
  content: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  pinned: boolean;
}

export interface NoteStore {
  version: 1;
  notes: Note[];
}

export type ToExtensionMessage =
  | { type: 'getNotes' }
  | { type: 'createNote' }
  | { type: 'updateNote'; note: Note }
  | { type: 'deleteNote'; id: string }
  | { type: 'confirmDeleteNote'; id: string }
  | { type: 'togglePin'; id: string };

export type ToWebviewMessage =
  | { type: 'notesLoaded'; notes: Note[] }
  | { type: 'noteDeleted' };
