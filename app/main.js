import TranscribeAPI from './transcribeAPI.js';

class CodeblockAPP {
  constructor() {
    this.debugMode = false;
    this.transcription = new TranscribeAPI();
    this.isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);
    this.container = document.getElementById("container");
    this.listView = document.getElementById("listView");
    this.newCard = document.getElementById("newCard");
    this.titleNote = document.getElementById("titleNote");
    this.noteContent = document.getElementById("noteContent");
    this.saveNewNote = document.getElementById("saveNewNote");
    this.closeDialog = document.getElementById("closeDialog");
    this.dialog = document.getElementById("dialog");
    this.menu = document.getElementById("menu-options");
    this.changeTheme = document.getElementById("changeTheme");
    this.clearAll = document.getElementById("clearAll");
    this.importData = document.getElementById("importData");
    this.exportData = document.getElementById("exportData");
    this.donate = document.getElementById("donate");
    this.init();
  }

  init() {
    document.addEventListener('DOMContentLoaded', () => this.applySavedTheme());
    this.loadCards();
    this.addEventListeners();
    this.detectDevTools();
  }

  changeStatusBarColor(isLightTheme) {
    document.querySelector('meta[name="theme-color"]')
      .setAttribute('content', isLightTheme ? '#eeeeee' : '#000000');
    document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]')
      .setAttribute('content', isLightTheme ? 'background-color:#eeeeee' : 'background-color:#121212');
  }

  applySavedTheme() {
    const savedTheme = localStorage.getItem('Codeblock-theme');
    document.body.classList.toggle('light-mode', savedTheme === 'light');
    const theme = document.body.classList.contains('light-mode');
    this.changeStatusBarColor(theme)
  }

  loadCards() {
    this.buttonReset()
    let noteList = JSON.parse(localStorage.getItem("Codeblock-notes")) || {};
    this.listView.innerHTML = "";
    const sortedNotes = Object.entries(noteList).sort(
      (a, b) => b[1].timestamp - a[1].timestamp
    );

    sortedNotes.forEach(([id, noteItem]) => {
      const noteTitle = noteItem.title
        ? `<input type="text" spellcheck="false" value="${noteItem.title}" maxlength="40">`
        : "";

      this.listView.innerHTML += `
      <li id="${id}">
          <div class="note-scope">
              ${noteTitle}
              <textarea id="content-${id}"
                spellcheck="false">${noteItem.content}</textarea>
          </div>
          <button type="button" id="copy-${id}" class="button-style outline"
            data-title="Copy this note" aria-label="Copy this note">
            <img src="./app/icons/clone.png" alt="icon" width="20" class="icon">
          </button>
      </li>`;
    });

    this.copyButtonListener();
    this.textareaListeners();
    this.menuListenerFunction();
    this.insertPlaceholderIfNoNotes();
  }

  insertPlaceholderIfNoNotes() {
    let noteList = JSON.parse(localStorage.getItem("Codeblock-notes")) || {};
    const placeholders = [
      {
        title: "Quick Guide: Adding Comments in JavaScript",
        content: `Use "//" for single-line comments and "/* ... */" for multi-line. Useful for debugging and documentation.`
      },
      {
        title: "Git Branching Basics",
        content: `To create a new branch: git branch <branch_name>. To switch: git checkout <branch_name>.`
      },
      {
        title: "Python Virtual Environment Setup",
        content: `Use python -m venv <env_name> to create an isolated environment for dependencies.`,
      },
      {
        title: "",
        content: `Organize ideas: Use sections, bullet points, or numbers to keep notes clean and focused.`
      },
      {
        title: "",
        content: `Remember to save your progress often. Losing work due to accidental closure can be frustrating.`,
      },
      {
        title: "Shortcut for Formatting in Markdown",
        content: `To format code in Markdown, wrap it in backticks: \`code\`, or triple backticks for multi-line code blocks.`
      },
      {
        title: "",
        content: `Note-taking Tip: Use headings and lists to keep your notes clear and easy to scan.`
      }
    ];

    if (Object.keys(noteList).length === 0) {
      const randomPlaceholder = placeholders[Math.floor(Math.random() * placeholders.length)];
      const placeholderId = this.generateUUID();
      this.listView.innerHTML = `
            <li id="${placeholderId}" class="deactive">
                <div class="note-scope">
                    <p>${randomPlaceholder.title}</p>
                    <textarea readonly>${randomPlaceholder.content}
                    </textarea>
                </div>
                <button type="button" class="button-style outline">
                  <img src="./app/icons/clone.png" alt="icon" width="20" class="icon">
                </button>
            </li>
        `;
    }
  }

  addEventListeners() {
    let noteList = JSON.parse(localStorage.getItem("Codeblock-notes")) || {};
    this.saveNewNote.addEventListener("click", () => { this.transcription.resetRecordButton(); this.addNote(); });
    this.noteContent.addEventListener("input", (e) => this.managerSaveButtonStatus(e.target));
    document
      .querySelectorAll(".menu-list li")
      .forEach(option => {
        option.addEventListener("click", () => {
          this.menu.checked = false;
        })
      })
    
    document.addEventListener("click", (event) => {
      if (!event.target.closest(".menu-list") &&
        !event.target.closest(".menu") &&
        !event.target.closest("#menu-options")) {
        event.stopPropagation();
        this.menu.checked = false;
      }
    });
    
    document
      .querySelectorAll("#listView li input, #listView li textarea")
      .forEach((editableElement) => {
        editableElement.addEventListener("focus", (e) => {
          e.preventDefault();
          if (document.getElementById("menu")) document.getElementById("menu").remove()
        });
        editableElement.addEventListener("click", (e) => {
          e.preventDefault();
          if (document.getElementById("menu")) document.getElementById("menu").remove()
        });
        editableElement.addEventListener("keyup", (e) => {
          const id = e.target.closest("li").id;
          if (e.target.tagName == "INPUT") {
            noteList[id].title = e.target.value.trim();
          } else if (e.target.tagName == "TEXTAREA") {
            noteList[id].content = e.target.value;
          }
          localStorage.setItem("Codeblock-notes", JSON.stringify(noteList));
          this.buttonReset()
        });
      });
    
    document.addEventListener("keydown", (e) => this.escapeFunction(e));
    this.newCard.addEventListener("click", () => this.dialogControl(true));
    this.closeDialog.addEventListener("click", () => { this.dialogControl(false);this.cancelDialog() });
    this.changeTheme.addEventListener("click", () => this.toggleTheme());
    this.clearAll.addEventListener("click", () => this.clearAllNotes());
    this.importData.addEventListener("click", () => this.importDataModal());
    this.exportData.addEventListener("click", () => this.exportDataModal());
    this.donate.addEventListener("click", () => this.donateModal());
    document.addEventListener('paste', (e) => this.pasteFunction(e));
    document.addEventListener("contextmenu", (e) => e.preventDefault());
    
    if (!this.debugMode) {
      document.addEventListener("keydown", (e) => {
        if (e.key === "F12" || (e.ctrlKey && e.shiftKey && e.key === "I")) e.preventDefault();
      });
    }
    
    if (this.isMobile) {
      document.body.classList.add('mobile');
      visualViewport.addEventListener('resize', (e) => {
        let keyboardChange = e.target.height
        this.dialog.style.height = keyboardChange < window.innerHeight ? "60vh" : "94vh";
      });
    }
  }

  escapeFunction(e){
    if (e.key === "Escape") {
      this.menu.checked = false;
      const elements = ["#modal", "#menu", "#dialog"];
      elements.forEach(selector => {
        const el = document.querySelector(selector);
        if (el && getComputedStyle(el).display === "flex") {
          el.style.display = "none";
          const modalContent = document.getElementById('modalContent');
          document.getElementById("container").style.display = "flex";
          if (modalContent) modalContent.remove();
          this.cancelDialog();
        }
      });
    }
  }

  pasteFunction(e){
    if (this.dialog.style.display == "none" &&
      !document.activeElement.closest('input, textarea, [contenteditable], select')) {
      const pastedContent = e.clipboardData.getData('Text');
      let noteList = JSON.parse(localStorage.getItem("Codeblock-notes")) || {};
      const newNote = {
        title: "",
        content: pastedContent,
        timestamp: Date.now()
      };
      const noteId = this.generateUUID();
      noteList[noteId] = newNote;
      localStorage.setItem("Codeblock-notes", JSON.stringify(noteList));
      this.loadCards();
    }
  }

  toggleTheme() {
    document.body.classList.toggle('light-mode');
    const theme = document.body.classList.contains('light-mode');
    this.changeStatusBarColor(theme)
    localStorage.setItem('Codeblock-theme', theme ? 'light' : 'dark');
  }

  clearAllNotes() {
    let modal = document.getElementById("modal")
    let noteList = JSON.parse(localStorage.getItem("Codeblock-notes")) || {};
    modal.style.display = "flex";
    modal.innerHTML = ` 
        <div id="modalContent">
          <nav>
            <span>
              <h2>Are you sure you want to delete all notes?</h2>
              <small>This action cannot be undone</small>
            </span>
          </nav>
          <div class="button-group end">
            <button type="button" class="button-style outline" id="cancelButton"
              data-title="Cancel deletion" aria-label="Cancel and close the modal">
              <p>Cancel</p>
            </button>
            <button type="button" class="button-style danger" id="confirmButton"
              data-title="Confirm deletion" aria-label="Permanently delete all notes">
              <p>Delete</p>
            </button>
          </div>
        </div>`;

    document.getElementById("cancelButton").addEventListener("click", this.closeModal);
    document.getElementById("confirmButton").addEventListener("click", () => {
      Object.keys(noteList).forEach((key) => delete noteList[key]);
      localStorage.setItem("Codeblock-notes", JSON.stringify(noteList));
      this.closeModal();
      this.loadCards();
    });
    modal.addEventListener("click", (event) => {
      if (!event.target.closest('#modalContent')) {
        this.closeModal();
      }
    });
  }

  buttonReset() {
    let noteList = JSON.parse(localStorage.getItem("Codeblock-notes")) || {};
    this.clearAll.disabled = Object.entries(noteList).length < 1;
    this.exportData.disabled = Object.entries(noteList).length < 1;
  }

  fileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target.result;
      if (file.name.endsWith(".json")) {
        this.processJson(content);
      } else if (file.name.endsWith(".csv")) {
        this.processCsv(content);
      } else {
        this.setMessage("Formato não suportado");
      }
    };
    reader.readAsText(file);
  };

  processJson(content) {
    try {
      const data = JSON.parse(content);
      if (!this.isValidJsonFormat(data)) {
        this.setMessage("O JSON não está no formato esperado");
        return;
      }
      this.saveToLocalStorage(data);
    } catch (error) {
      this.setMessage("Erro ao analisar o JSON");
    }
  }

  processCsv(content) {
    const lines = content.split("\n").map(line => line.trim()).filter(line => line);
    if (lines.length < 2) {
      this.setMessage("CSV inválido: Não há dados suficientes");
      return;
    }
    const headers = lines[0].split(",");
    if (!headers.includes("id") || !headers.includes("title") || !headers.includes("content") || !headers.includes("timestamp")) {
      this.setMessage("CSV não tem as colunas esperadas");
      return;
    }
    const data = {};
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",");
      if (values.length !== headers.length) continue;
      const entry = {
        title: values[headers.indexOf("title")],
        content: values[headers.indexOf("content")],
        timestamp: Number(values[headers.indexOf("timestamp")])
      };
      if (isNaN(entry.timestamp)) continue;
      data[values[headers.indexOf("id")]] = entry;
    }

    if (!this.isValidJsonFormat(data)) {
      this.setMessage("O CSV convertido não está no formato esperado");
      return;
    }
    this.saveToLocalStorage(data);
  }

  saveToLocalStorage(newData) {
    let noteList = JSON.parse(localStorage.getItem("Codeblock-notes")) || {};
    for (const [noteId, note] of Object.entries(newData)) {
      const newNote = {
        title: note.title || "",
        content: note.content,
        timestamp: note.timestamp || Date.now()
      };
      noteList[noteId] = newNote;
    }
    localStorage.setItem("Codeblock-notes", JSON.stringify(noteList));
    this.loadCards();
    this.closeModal();
  }

  isValidJsonFormat(data) {
    if (typeof data !== "object" || data === null) return false;
    return Object.values(data).every(entry =>
      typeof entry === "object" &&
      entry !== null &&
      typeof entry.content === "string" &&
      typeof entry.timestamp === "number"
    );
  }

  importDataModal() {
    modal.style.display = "flex";
    modal.innerHTML += `
        <div id="modalContent">
          <nav>
          <h2>Upload file</h2>
          </nav>
          <div class="upload-area">
            <input type="file" name="upload-file" id="upload-notes" accept=".csv,application/json" hidden>
            <label for="upload-notes" class="button-style upload-button">
              <p>Upload File</p>
              <img src="./app/icons/file-upload.png" alt="icon" width="20" class="icon">
            </label>
            <small>Accepted JSON and CSV files</small>
          </div>
          <div class="button-group end">
            <button type="button" class="button-style outline" id="cancelButton"
              data-title="Close Modal" aria-label="Close the modal">
              <p>Close</p>
            </button>
          </div>
          <p id="message" class="button-style outline"></p>
        </div>`;
    this.closeModalOnClickOutside();
    document.getElementById("upload-notes").addEventListener("change", (e) => this.fileUpload(e));
    document.getElementById("cancelButton").addEventListener("click", this.closeModal);
  }

  exportDataModal() {
    let noteList = JSON.parse(localStorage.getItem("Codeblock-notes")) || {};
    const jsonContent = JSON.stringify(noteList, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "Codeblock-notes.json";
    link.click();
  }

  setMessage(text) {
    let msg = document.getElementById("message");
    if (msg) {
      msg.textContent = text;
      msg.style.bottom = "150px";
      setTimeout(() => {
        if (msg) {
          msg.style.transition = ".6s ease";
          msg.style.bottom = "-100%";
          msg.textContent = "";
        }
      }, 2000);
    }
  }

  donateModal() {
    let modal = document.getElementById("modal");
    modal.style.display = "flex";
    modal.innerHTML += `
        <div id="modalContent">
          <nav>
            <span>
              <h2>Make a Donation</h2>
              <small>Thank you for your support! Your contribution makes a difference in keeping the project active.</small>
            </span>
          </nav>
          <div class="donation-methods">
            <div class="method">
              <p>Make your donation via Pix using the key below:</p>
              <span class="copyText button-style outline">
                <p id="pixKey">774aa4ae-69ec-4f2f-a774-0acb2074880f</p>
                <button type="button" class="button-style outline" id="copyKeyBtn"
                  data-title="Copy this key" aria-label="Copy this key">
                  <img src="./app/icons/clone.png" alt="icon" width="20" class="icon" id="copy-pix">
                </button>
              </span>
            </div>
            <div class="method">
              <p>If you prefer to donate via Bitcoin, use the address below:</p>
              <span class="copyText button-style outline">
                <a href="bitcoin:BC1Q6ZVD3EL7G00L0Q2UMY49DG93KQW8UL24R86KH6" id="bitcoinKey">
                    BC1Q6ZVD3EL7G00L0Q2UMY49DG93KQW8UL24R86KH6
                </a>
                <button type="button" class="button-style outline" id="copyAddressBtn"
                    data-title="Copy this address" aria-label="Copy this address">
                  <img src="./app/icons/clone.png" alt="icon" width="20" class="icon" id="copy-address">
                </button>
              </span>
            </div>
          </div>
          <small><em>Any amount is welcome! Thank you so much for your support.</em></small>
          <div class="button-group end">
            <button type="button" class="button-style outline" id="cancelButton"
              data-title="Close Modal" aria-label="Close the modal">
              <p>Close</p>
            </button>
          </div>
          <p id="message" class="button-style outline"></p>
        </div>`;

    this.closeModalOnClickOutside();
    document.getElementById("cancelButton").addEventListener("click", this.closeModal);

    const resetCopyButton = (id) => setTimeout(() => {
      if (document.getElementById(id)) document.getElementById(id).src = "./app/icons/clone.png"
    }, 5000)
    document.getElementById("copyKeyBtn").addEventListener("click", () => {
      const pixKey = document.getElementById("pixKey").textContent;
      navigator.clipboard.writeText(pixKey).then(() => {
        document.getElementById("copy-pix").src = "./app/icons/check.png";
        this.setMessage("Key copied to clipboard")
        resetCopyButton("copy-pix");
      }).catch(err => console.error("Failed to copy: ", err));
    });
    document.getElementById("copyAddressBtn").addEventListener("click", () => {
      const bitcoinKey = document.getElementById("bitcoinKey").textContent;
      navigator.clipboard.writeText(bitcoinKey).then(() => {
        document.getElementById("copy-address").src = "./app/icons/check.png";
        this.setMessage("Address copied to clipboard");
        resetCopyButton("copy-address");
      }).catch(err => console.error("Failed to copy: ", err));
    });
  }

  dialogControl(show) {
    this.dialog.style.display = show ? "flex" : "none";
    this.container.style.display = show ? "none" : "flex";
  }

  managerSaveButtonStatus(el) {
    this.saveNewNote.disabled = el.value.length > 0 ? false : true;
  }

  generateUUID() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      let r = (Math.random() * 16) | 0,
        v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  addNote() {
    let noteList = JSON.parse(localStorage.getItem("Codeblock-notes")) || {};
    if (!this.noteContent.value) return;
    const newNote = {
      title: this.titleNote?.value || "",
      content: this.noteContent.value,
      timestamp: Date.now()
    };

    const noteId = this.generateUUID();
    noteList[noteId] = newNote;
    localStorage.setItem("Codeblock-notes", JSON.stringify(noteList));
    this.cancelDialog();
    this.loadCards();
  }

  copyButtonListener() {
    let noteList = JSON.parse(localStorage.getItem("Codeblock-notes")) || {};
    document.querySelectorAll("#listView li button").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.id.replace("copy-", ""),
          contentNote = noteList[id].content;
        try {
          navigator.clipboard
            .writeText(contentNote)
            .then(() => {
              // lembrar de passar os alerts pra um card informativo
              btn.querySelector("img").src = "./app/icons/check.png";
              setTimeout(() => {
                  btn.querySelector("img").src = "./app/icons/clone.png";
              }, 2000);
              // alert("Texto copiado para a área de transferência!");
            })
            .catch((error) => {
              console.log(`Falha ao copiar texto para a área de transferência: ${error}`);
            });
        } catch (e) {
          console.log(e);
        }
      });
    });
  }

  menuListenerFunction() {
    document.querySelectorAll("li").forEach((liElement) => {
      liElement.addEventListener("contextmenu", (e) => {
        e.preventDefault();
        const existingMenu = document.getElementById("menu");
        if (existingMenu) existingMenu.remove();
        const menu = document.createElement("div");
        menu.id = "menu";
        menu.innerHTML = `
          <button type="button" id="Delete" class="button-style outline"
            data-title="Delete this note" aria-label="Delete note">
            <p>Delete Note</p>
            <img src="./app/icons/trash.png" alt="icon" width="20" class="icon invert">
          </button>
          <button type="button" id="Share" class="button-style outline"
            data-title="Share this note" aria-label="Share note">
            <p>Share Note</p>
            <img src="./app/icons/share.png" alt="icon" width="20" class="icon invert">
          </button>
        `;
        liElement.appendChild(menu);
        const menuWidth = menu.offsetWidth;
        const menuHeight = menu.offsetHeight;
        let menuX = e.pageX;
        let menuY = e.pageY;
        if (menuX + menuWidth > window.innerWidth) menuX = e.pageX - menuWidth;
        if (menuY + menuHeight > window.innerHeight) menuY = e.pageY - menuHeight;
        if (e.pageX > window.innerWidth * 0.8) menuX = e.pageX - menuWidth;
        menu.style.cssText = `
          left: ${menuX}px;
          top: ${menuY}px;
          position: absolute;
          display: flex;
          flex-direction: column;
          width: 120px;`;
        document.addEventListener("click", (closeMenuEvent) => {
          if (
            !menu.contains(closeMenuEvent.target) &&
            !liElement.contains(closeMenuEvent.target)
          ) menu.remove();
        });
        menu.querySelector("#Delete").addEventListener("click", () => {
          const id = liElement.id;
          this.deleteNote(id);
          menu.remove();
        });
        menu.querySelector("#Share").addEventListener("click", () => {
          const id = liElement.id;
          this.createShareDialog(id);
          menu.remove();
        });
      });
    });
  }

  textareaListeners() {
    document.querySelectorAll("li textarea").forEach((textArea) => {
      const adjustHeight = () => {
        textArea.style.height = "auto";
        const newHeight = textArea.scrollHeight;
        textArea.style.height = newHeight > 350 ? "350px" : `${newHeight}px`;
      };
      textArea.addEventListener("focus", () => adjustHeight());
      textArea.addEventListener("input", () => adjustHeight());
      textArea.addEventListener("blur", () => (textArea.style.height = "32px"));
      textArea.style.maxHeight = "350px";
    });
  }

  deleteNote(id) {
    let noteList = JSON.parse(localStorage.getItem("Codeblock-notes")) || {};
    if (noteList[id]) {
      delete noteList[id];
      localStorage.setItem("Codeblock-notes", JSON.stringify(noteList));
    }
    this.loadCards()
    this.buttonReset()
  }

  createShareDialog(id) {
    let noteList = JSON.parse(localStorage.getItem("Codeblock-notes")) || {};
    let modal = document.getElementById("modal");
    modal.style.display = "flex";
    modal.innerHTML += `
        <div id="modalContent">
          <nav>
            <span>
              <h2>Share note</h2>
              <p id="share-note-title">${noteList[id]?.title}</p>
            </span>
          </nav>
          <div class="share-content">
            <div class="share-itens">
              <p id="text-outline" class="button-style outline">
                ${noteList[id].content}
              </p>
              <button type="button" class="button-style outline"
                onclick="window.open('https://wa.me/?text=${encodeURIComponent((noteList[id].title ? `*${noteList[id].title}*\n\n` : '') + noteList[id].content)}', '_blank')"
                data-title="Share via WhatsApp" aria-label="Share note on WhatsApp">
                <img src="./app/icons/whatsapp.png" alt="icon" width="20" class="icon">
              </button>
              <button type="button" class="button-style outline"
                onclick="window.location.href = 'mailto:?subject=${encodeURIComponent(noteList[id].title ? `<strong>${noteList[id].title}</strong>\n\n` : '')}&body=${encodeURIComponent(noteList[id].content)}'"
                data-title="Share via Email" aria-label="Send note via email">
                <img src="./app/icons/envelope.png" alt="icon" width="20" class="icon">
              </button>
            </div>
            <div class="button-group end">
              <button type="button" class="button-style outline"
                onclick="document.getElementById('modalContent').remove();
                document.getElementById('modal').style.display='none';"
                data-title="Close sharing menu" aria-label="Close share dialog">
                  <p>Close<p>
              </button>
            </div>
          </div>
        </div>`;
    this.closeModalOnClickOutside();
  }

  closeModal() {
    let modal = document.getElementById("modal")
    if (document.getElementById('modalContent')) document.getElementById('modalContent').remove();
    modal.style.display = "none";
  }

  closeModalOnClickOutside() {
    let modal = document.getElementById("modal")
    modal.addEventListener("click", (event) => {
      if (!event.target.closest('#modalContent')) {
        this.closeModal();
      }
    });
  }

  cancelDialog() {
    this.titleNote.value = "";
    this.noteContent.value = "";
    this.dialogControl(false);
    this.transcription.resetRecordButton();
  }

  detectDevTools() {
        const threshold = 160;
        const element = new Image();
        
        Object.defineProperty(element, 'id', {
            get: () => {
                this.devToolsOpen = true;
                this.showAsciiArt();
            }
        });

        const checkSize = () => {
            console.clear();
            this.devToolsOpen = window.outerWidth - window.innerWidth > threshold ||
                                window.outerHeight - window.innerHeight > threshold;
            if (this.devToolsOpen) this.showAsciiArt();
        };

        window.addEventListener('resize', checkSize);
        console.log('%c ', element);
    }

    showAsciiArt() {
        console.log('%cCodeBlock%c - Confira meu Github: %chttps://github.com/vxncius-dev', 
            'font-weight: bold; font-family: "Times New Roman", serif; font-size: 16px;', 
            '', 
            'color: #0e46df; text-decoration: underline;');
    }

}

const Codeblock = new CodeblockAPP();
