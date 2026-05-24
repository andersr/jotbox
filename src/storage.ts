import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import * as crypto from 'crypto';
import { Note, NoteStore } from './types';

const STORAGE_DIR = path.join(os.homedir(), '.jotbox');
const STORAGE_FILE = path.join(STORAGE_DIR, 'notes.json');

function ensureStorageDir(): void {
  fs.mkdirSync(STORAGE_DIR, { recursive: true });
}

function loadStore(): NoteStore {
  ensureStorageDir();
  try {
    const data = fs.readFileSync(STORAGE_FILE, 'utf-8');
    return JSON.parse(data) as NoteStore;
  } catch {
    return { version: 1, notes: [] };
  }
}

function saveStore(store: NoteStore): void {
  ensureStorageDir();
  const tmp = STORAGE_FILE + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(store, null, 2), 'utf-8');
  fs.renameSync(tmp, STORAGE_FILE);
}

export function getNotes(): Note[] {
  const store = loadStore();
  return store.notes.sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });
}

export function createNote(): Note {
  const store = loadStore();
  const now = new Date().toISOString();
  const note: Note = {
    id: crypto.randomUUID(),
    content: '',
    tags: [],
    createdAt: now,
    updatedAt: now,
    pinned: false,
  };
  store.notes.push(note);
  saveStore(store);
  return note;
}

export function updateNote(updated: Note): Note {
  const store = loadStore();
  const index = store.notes.findIndex(n => n.id === updated.id);
  if (index === -1) throw new Error(`Note not found: ${updated.id}`);
  updated.updatedAt = new Date().toISOString();
  store.notes[index] = updated;
  saveStore(store);
  return updated;
}

export function deleteNote(id: string): void {
  const store = loadStore();
  store.notes = store.notes.filter(n => n.id !== id);
  saveStore(store);
}

export function togglePin(id: string): Note {
  const store = loadStore();
  const note = store.notes.find(n => n.id === id);
  if (!note) throw new Error(`Note not found: ${id}`);
  note.pinned = !note.pinned;
  note.updatedAt = new Date().toISOString();
  saveStore(store);
  return note;
}
