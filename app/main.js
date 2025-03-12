const startContent = document.querySelector(".start-content"),
  container = document.getElementById("container"),
  noteEditor = document.getElementById("noteEditor"),
  newNoteArea = document.querySelector(".new-note"),
  newNote = document.getElementById("newNote"),
  titleNote = document.getElementById("titleNote"),
  noteContent = document.getElementById("editor"),
  saveNoteButton = document.getElementById("saveNote"),
  fontSelector = document.getElementById("font-selector"),
  fontSizeSelector = document.getElementById("font-size-selector"),
  changeColor = document.getElementById("changeColor"),
  noteList = JSON.parse(localStorage.getItem("NoteIO-notes")) || {};

function loadCards() {
  const hasNotes = Object.entries(noteList).length;

  container.style.display = hasNotes > 0 ? "flex" : "none";
  startContent.className = ""
  let navClass = hasNotes > 0 ? "navbar-format" : "start-content"
  startContent.classList.add(navClass);

  container.innerHTML = "";
  const sortedNotes = Object.entries(noteList).sort(
    (a, b) => b[1].timestamp - a[1].timestamp
  );

  sortedNotes.forEach(([id, noteItem]) => {
    const noteTitle = noteItem.title ? `<strong>${noteItem.title}</strong>` : "";
    container.innerHTML += `
      <li id="${id}" class="button-style">
          <div class="card">
          <span class="title">${noteTitle}</span>
          <div id="content-${id}" spellcheck="false">${noteItem.content}</div>
          </div>
          <button type="button" id="copy-${id}" class="button-style">
            <i class="fi fi-br-copy-alt"></i>
          </button>
      </li>`;
    document.getElementById(id).addEventListener("click", () => buildNote(id));
  });
}

function generateUUID() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    let r = (Math.random() * 16) | 0,
      v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function initializeNoteEditor(noteId) {
  console.log(noteId)
  noteContent.innerHTML = "";
  titleNote.value = "";

  if (noteId && noteList[noteId]) {
    const note = noteList[noteId];
    titleNote.value = note.title;
    noteContent.innerHTML = note.content;
  }

  noteEditor.setAttribute('data-id', noteId);
}

function applyCommand(command, value = null) {
  document.execCommand(command, false, value);
}

function saveNote(noteId) {
  if (!noteContent.innerHTML.trim()) return;

  if (!noteId) {
    noteId = generateUUID();
    noteEditor.setAttribute('data-id', noteId);
  }

  const newNote = {
    title: titleNote.value || "",
    content: noteContent.innerHTML,
    timestamp: Date.now()
  };

  noteList[noteId] = newNote;
  localStorage.setItem("NoteIO-notes", JSON.stringify(noteList));
  console.log("Nota salva:", newNote);
  loadCards();
}

function noteEditorContent() {
  let noteID = noteEditor.getAttribute('data-id');

  if (!noteID || noteID === "first-note") {
    noteID = generateUUID();
    noteEditor.setAttribute('data-id', noteID);
  }

  newNoteArea.style.display = "flex";
  noteContent.focus();
  return noteID;
}

function hideNoteOnClickOutside() {
  document.addEventListener('click', (e) => {
    if (!noteEditor.contains(e.target) && e.target !== newNote) {
      newNoteArea.style.display = 'none';
    }
  });
}


function buildNote(noteID) {
  initializeNoteEditor(noteID);
  noteEditor.style.display = "flex";
}

saveNoteButton.addEventListener('click', (e) => {
    e.stopPropagation();
    let noteID = noteEditorContent()
    saveNote(noteID);
    newNoteArea.style.display = 'none';
  });

newNote.addEventListener('click', () => buildNote(generateUUID()));
document.getElementById('bold-btn').addEventListener('click', () => applyCommand('bold'));
document.getElementById('italic-btn').addEventListener('click', () => applyCommand('italic'));
document.getElementById('underline-btn').addEventListener('click', () => applyCommand('underline'));
document.getElementById('strike-btn').addEventListener('click', () => applyCommand('strikeThrough'));

fontSelector.addEventListener('change', (e) => applyCommand('fontName', e.target.value));
changeColor.addEventListener('input', (e) => applyCommand('foreColor', e.target.value));

function main() {
  loadCards();
};

main();
