"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNotes = getNotes;
exports.createNote = createNote;
exports.updateNote = updateNote;
exports.deleteNote = deleteNote;
exports.togglePin = togglePin;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const os = __importStar(require("os"));
const crypto = __importStar(require("crypto"));
const STORAGE_DIR = path.join(os.homedir(), '.jotbox');
const STORAGE_FILE = path.join(STORAGE_DIR, 'notes.json');
function ensureStorageDir() {
    fs.mkdirSync(STORAGE_DIR, { recursive: true });
}
function loadStore() {
    ensureStorageDir();
    try {
        const data = fs.readFileSync(STORAGE_FILE, 'utf-8');
        return JSON.parse(data);
    }
    catch {
        return { version: 1, notes: [] };
    }
}
function saveStore(store) {
    ensureStorageDir();
    const tmp = STORAGE_FILE + '.tmp';
    fs.writeFileSync(tmp, JSON.stringify(store, null, 2), 'utf-8');
    fs.renameSync(tmp, STORAGE_FILE);
}
function getNotes() {
    const store = loadStore();
    return store.notes.sort((a, b) => {
        if (a.pinned !== b.pinned)
            return a.pinned ? -1 : 1;
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
}
function createNote() {
    const store = loadStore();
    const now = new Date().toISOString();
    const note = {
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
function updateNote(updated) {
    const store = loadStore();
    const index = store.notes.findIndex(n => n.id === updated.id);
    if (index === -1)
        throw new Error(`Note not found: ${updated.id}`);
    updated.updatedAt = new Date().toISOString();
    store.notes[index] = updated;
    saveStore(store);
    return updated;
}
function deleteNote(id) {
    const store = loadStore();
    store.notes = store.notes.filter(n => n.id !== id);
    saveStore(store);
}
function togglePin(id) {
    const store = loadStore();
    const note = store.notes.find(n => n.id === id);
    if (!note)
        throw new Error(`Note not found: ${id}`);
    note.pinned = !note.pinned;
    note.updatedAt = new Date().toISOString();
    saveStore(store);
    return note;
}
//# sourceMappingURL=storage.js.map