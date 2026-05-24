// @ts-check

(function () {
  // @ts-ignore
  const vscode = acquireVsCodeApi();

  let notes = [];
  let editingNote = null;
  let searchQuery = '';
  let activeTag = '';

  // DOM elements
  const searchInput = document.getElementById('search');
  const newNoteBtn = document.getElementById('new-note-btn');
  const tagFilterEl = document.getElementById('tag-filter');
  const noteListEl = document.getElementById('note-list');
  const noteEditorEl = document.getElementById('note-editor');
  const noteContentEl = document.getElementById('note-content');
  const tagInputEl = document.getElementById('tag-input');
  const saveBtn = document.getElementById('save-btn');
  const cancelBtn = document.getElementById('cancel-btn');
  const deleteBtn = document.getElementById('delete-btn');

  // Request notes on load
  vscode.postMessage({ type: 'getNotes' });

  // Listen for messages from extension
  window.addEventListener('message', (event) => {
    const message = event.data;
    if (message.type === 'notesLoaded') {
      notes = message.notes;
      renderList();
    } else if (message.type === 'noteCreated') {
      openEditor(message.note);
    } else if (message.type === 'noteDeleted') {
      closeEditor();
    }
  });

  // Search
  searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value.toLowerCase();
    renderList();
  });

  // New note
  newNoteBtn.addEventListener('click', () => {
    vscode.postMessage({ type: 'createNote' });
  });

  // Save
  saveBtn.addEventListener('click', () => {
    if (!editingNote) return;
    const content = noteContentEl.value;
    const tags = tagInputEl.value
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    vscode.postMessage({
      type: 'updateNote',
      note: { ...editingNote, content, tags },
    });
    closeEditor();
  });

  // Cancel
  cancelBtn.addEventListener('click', () => {
    closeEditor();
  });

  // Delete
  deleteBtn.addEventListener('click', () => {
    if (!editingNote) return;
    vscode.postMessage({ type: 'confirmDeleteNote', id: editingNote.id });
  });

  function getDisplayTitle(note) {
    if (!note.content) return 'Empty note';
    const firstLine = note.content.split('\n')[0];
    if (firstLine.length <= 50) return firstLine;
    const truncated = firstLine.substring(0, 50);
    const lastSpace = truncated.lastIndexOf(' ');
    return (lastSpace > 20 ? truncated.substring(0, lastSpace) : truncated) + '...';
  }

  function formatDate(isoString) {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  }

  function getAllTags() {
    const tagSet = new Set();
    notes.forEach((n) => n.tags.forEach((t) => tagSet.add(t)));
    return Array.from(tagSet).sort();
  }

  function getFilteredNotes() {
    return notes.filter((note) => {
      if (activeTag && !note.tags.includes(activeTag)) return false;
      if (!searchQuery) return true;
      const content = note.content.toLowerCase();
      const tags = note.tags.join(' ').toLowerCase();
      return content.includes(searchQuery) || tags.includes(searchQuery);
    });
  }

  function renderTagFilter() {
    const allTags = getAllTags();
    if (allTags.length === 0) {
      tagFilterEl.innerHTML = '';
      return;
    }
    tagFilterEl.innerHTML = allTags
      .map(
        (tag) =>
          `<span class="tag-chip ${activeTag === tag ? 'active' : ''}" data-tag="${escapeHtml(tag)}">${escapeHtml(tag)}</span>`
      )
      .join('');

    tagFilterEl.querySelectorAll('.tag-chip').forEach((chip) => {
      chip.addEventListener('click', () => {
        const tag = chip.getAttribute('data-tag');
        activeTag = activeTag === tag ? '' : tag;
        renderList();
      });
    });
  }

  function renderList() {
    renderTagFilter();
    const filtered = getFilteredNotes();

    if (filtered.length === 0) {
      noteListEl.innerHTML = `<div class="empty-state">${
        notes.length === 0 ? 'No notes yet. Click + to create one.' : 'No matching notes.'
      }</div>`;
      return;
    }

    noteListEl.innerHTML = filtered
      .map(
        (note) => `
      <div class="note-item" data-id="${note.id}">
        <div class="note-item-header">
          ${note.pinned ? '<span class="note-pin" title="Pinned">*</span>' : ''}
          <span class="note-title">${escapeHtml(getDisplayTitle(note))}</span>
          <span class="note-date">${formatDate(note.updatedAt)}</span>
        </div>
        ${
          note.tags.length > 0
            ? `<div class="note-tags">${note.tags.map((t) => `<span class="note-tag">${escapeHtml(t)}</span>`).join('')}</div>`
            : ''
        }
      </div>`
      )
      .join('');

    noteListEl.querySelectorAll('.note-item').forEach((item) => {
      item.addEventListener('click', () => {
        const id = item.getAttribute('data-id');
        const note = notes.find((n) => n.id === id);
        if (note) openEditor(note);
      });
    });
  }

  function openEditor(note) {
    editingNote = note;
    noteContentEl.value = note.content;
    tagInputEl.value = note.tags.join(', ');
    noteListEl.classList.add('hidden');
    document.getElementById('toolbar').classList.add('hidden');
    tagFilterEl.classList.add('hidden');
    noteEditorEl.classList.remove('hidden');
    noteContentEl.focus();
  }

  function closeEditor() {
    editingNote = null;
    noteEditorEl.classList.add('hidden');
    noteListEl.classList.remove('hidden');
    document.getElementById('toolbar').classList.remove('hidden');
    tagFilterEl.classList.remove('hidden');
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
})();
