class NoteIO {
  constructor() {
    this.container = document.getElementById("container");
    this.newCard = document.getElementById("newCard");
    this.titleNote = document.getElementById("titleNote");
    this.noteContent = document.getElementById("noteContent");
    this.saveNewNote = document.getElementById("saveNewNote");
    this.dialog = document.querySelector("dialog");
    this.noteList = JSON.parse(localStorage.getItem("notes")) || {};
    this.init();
  }

  init() {
    this.loadCards();
    this.addEventListeners();
  }

  insertPlaceholderIfNoNotes() {
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

    if (Object.keys(this.noteList).length === 0) {
      const randomPlaceholder = placeholders[Math.floor(Math.random() * placeholders.length)];
      const placeholderId = this.generateUUID();
      this.container.innerHTML = `
            <li id="${placeholderId}" class="noStyle blockSelection">
                <div>
                    <p class="blockSelection">${randomPlaceholder.title}</p>
                    <textarea class="blockSelection" id="content-${placeholderId}" readonly>${randomPlaceholder.content}</textarea>
                </div>
                <button type="button" id="copy-${placeholderId}" class="bt2 blockSelection"></button>
            </li>
        `;

      const liElement = document.getElementById(`${placeholderId}`);
      const copyButton = document.getElementById(`copy-${placeholderId}`);
      liElement.addEventListener("contextmenu", (e) => e.preventDefault());
      copyButton.appendChild(this.icon("copy"));
      liElement.setAttribute("title", "This is just an example of annotation");
    }
  }

  loadCards() {
    this.container.innerHTML = "";
    const sortedNotes = Object.entries(this.noteList).sort(
      (a, b) => b[1].timestamp - a[1].timestamp
    );

    sortedNotes.forEach(([id, noteItem]) => {
      const noteTitle = noteItem.title
        ? `<p contentEditable spellcheck="false">${noteItem.title}</p>`
        : "";

      this.container.innerHTML += `
                <li id="${id}">
                    <div>
                        ${noteTitle}
                        <textarea id="content-${id}" spellcheck="false">${noteItem.content}</textarea>
                    </div>
                    <button type="button" id="copy-${id}" class="copyButton bt2"></button>
                </li>`;

      const copyButton = document.getElementById(`copy-${id}`);
      copyButton.appendChild(this.icon("copy"));
    });

    this.copyButtonListener();
    this.textareaListeners();
    this.menuListenerFunction();

    this.insertPlaceholderIfNoNotes();
  }

  icon(type) {
    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("width", "32px");
    svg.setAttribute("height", "32px");
    svg.setAttribute("viewBox", "-3.75 -3.75 32.50 32.50");
    svg.setAttribute("fill", "none");
    svg.setAttribute("stroke", "#ddd");
    svg.setAttribute("stroke-width", "0.00025");
    svg.style.background = "none";
    svg.style.setProperty("--darkreader-inline-stroke", "#d3cfc9");
    const iconGroup = document.createElementNS(svgNS, "g");
    iconGroup.setAttribute("id", "SVGRepo_iconCarrier");
    const path = document.createElementNS(svgNS, "path");
    if (type == "copy") {
      path.setAttribute(
        "d",
        "M8.25005 8.5C8.25005 8.91421 8.58584 9.25 9.00005 9.25C9.41426 9.25 9.75005 8.91421 9.75005 8.5H8.25005ZM9.00005 8.267H9.75006L9.75004 8.26283L9.00005 8.267ZM9.93892 5.96432L10.4722 6.49171L9.93892 5.96432ZM12.2311 5V4.24999L12.2269 4.25001L12.2311 5ZM16.269 5L16.2732 4.25H16.269V5ZM18.5612 5.96432L18.0279 6.49171V6.49171L18.5612 5.96432ZM19.5 8.267L18.75 8.26283V8.267H19.5ZM19.5 12.233H18.75L18.7501 12.2372L19.5 12.233ZM18.5612 14.5357L18.0279 14.0083L18.5612 14.5357ZM16.269 15.5V16.25L16.2732 16.25L16.269 15.5ZM16 14.75C15.5858 14.75 15.25 15.0858 15.25 15.5C15.25 15.9142 15.5858 16.25 16 16.25V14.75ZM9.00005 9.25C9.41426 9.25 9.75005 8.91421 9.75005 8.5C9.75005 8.08579 9.41426 7.75 9.00005 7.75V9.25ZM8.73105 8.5V7.74999L8.72691 7.75001L8.73105 8.5ZM6.43892 9.46432L6.97218 9.99171L6.43892 9.46432ZM5.50005 11.767H6.25006L6.25004 11.7628L5.50005 11.767ZM5.50005 15.734L6.25005 15.7379V15.734H5.50005ZM8.73105 19L8.72691 19.75H8.73105V19ZM12.769 19V19.75L12.7732 19.75L12.769 19ZM15.0612 18.0357L14.5279 17.5083L15.0612 18.0357ZM16 15.733H15.25L15.2501 15.7372L16 15.733ZM16.75 15.5C16.75 15.0858 16.4143 14.75 16 14.75C15.5858 14.75 15.25 15.0858 15.25 15.5H16.75ZM9.00005 7.75C8.58584 7.75 8.25005 8.08579 8.25005 8.5C8.25005 8.91421 8.58584 9.25 9.00005 9.25V7.75ZM12.7691 8.5L12.7732 7.75H12.7691V8.5ZM15.0612 9.46432L15.5944 8.93694V8.93694L15.0612 9.46432ZM16.0001 11.767L15.2501 11.7628V11.767H16.0001ZM15.2501 15.5C15.2501 15.9142 15.5858 16.25 16.0001 16.25C16.4143 16.25 16.7501 15.9142 16.7501 15.5H15.2501ZM9.75005 8.5V8.267H8.25005V8.5H9.75005ZM9.75004 8.26283C9.74636 7.60005 10.0061 6.96296 10.4722 6.49171L9.40566 5.43694C8.65985 6.19106 8.24417 7.21056 8.25006 8.27117L9.75004 8.26283ZM10.4722 6.49171C10.9382 6.02046 11.5724 5.75365 12.2352 5.74999L12.2269 4.25001C11.1663 4.25587 10.1515 4.68282 9.40566 5.43694L10.4722 6.49171ZM12.2311 5.75H16.269V4.25H12.2311V5.75ZM16.2649 5.74999C16.9277 5.75365 17.5619 6.02046 18.0279 6.49171L19.0944 5.43694C18.3486 4.68282 17.3338 4.25587 16.2732 4.25001L16.2649 5.74999ZM18.0279 6.49171C18.494 6.96296 18.7537 7.60005 18.7501 8.26283L20.25 8.27117C20.2559 7.21056 19.8402 6.19106 19.0944 5.43694L18.0279 6.49171ZM18.75 8.267V12.233H20.25V8.267H18.75ZM18.7501 12.2372C18.7537 12.8999 18.494 13.537 18.0279 14.0083L19.0944 15.0631C19.8402 14.3089 20.2559 13.2894 20.25 12.2288L18.7501 12.2372ZM18.0279 14.0083C17.5619 14.4795 16.9277 14.7463 16.2649 14.75L16.2732 16.25C17.3338 16.2441 18.3486 15.8172 19.0944 15.0631L18.0279 14.0083ZM16.269 14.75H16V16.25H16.269V14.75ZM9.00005 7.75H8.73105V9.25H9.00005V7.75ZM8.72691 7.75001C7.6663 7.75587 6.65146 8.18282 5.90566 8.93694L6.97218 9.99171C7.43824 9.52046 8.07241 9.25365 8.73519 9.24999L8.72691 7.75001ZM5.90566 8.93694C5.15985 9.69106 4.74417 10.7106 4.75006 11.7712L6.25004 11.7628C6.24636 11.1001 6.50612 10.463 6.97218 9.99171L5.90566 8.93694ZM4.75005 11.767V15.734H6.25005V11.767H4.75005ZM4.75006 15.7301C4.73847 17.9382 6.51879 19.7378 8.72691 19.75L8.7352 18.25C7.35533 18.2424 6.2428 17.1178 6.25004 15.7379L4.75006 15.7301ZM8.73105 19.75H12.769V18.25H8.73105V19.75ZM12.7732 19.75C13.8338 19.7441 14.8486 19.3172 15.5944 18.5631L14.5279 17.5083C14.0619 17.9795 13.4277 18.2463 12.7649 18.25L12.7732 19.75ZM15.5944 18.5631C16.3402 17.8089 16.7559 16.7894 16.75 15.7288L15.2501 15.7372C15.2537 16.3999 14.994 17.037 14.5279 17.5083L15.5944 18.5631ZM16.75 15.733V15.5H15.25V15.733H16.75ZM9.00005 9.25H12.7691V7.75H9.00005V9.25ZM12.7649 9.24999C13.4277 9.25365 14.0619 9.52046 14.5279 9.99171L15.5944 8.93694C14.8486 8.18282 13.8338 7.75587 12.7732 7.75001L12.7649 9.24999ZM14.5279 9.99171C14.994 10.463 15.2537 11.1001 15.2501 11.7628L16.75 11.7712C16.7559 10.7106 16.3402 9.69106 15.5944 8.93694L14.5279 9.99171ZM15.2501 11.767V15.5H16.7501V11.767H15.2501Z"
      );
    } else if (type == "wpp") {
      svg.setAttribute("width", "26px");
      svg.setAttribute("height", "26px");
      path.setAttribute(
        "d",
        "M3.50002 12C3.50002 7.30558 7.3056 3.5 12 3.5C16.6944 3.5 20.5 7.30558 20.5 12C20.5 16.6944 16.6944 20.5 12 20.5C10.3278 20.5 8.77127 20.0182 7.45798 19.1861C7.21357 19.0313 6.91408 18.9899 6.63684 19.0726L3.75769 19.9319L4.84173 17.3953C4.96986 17.0955 4.94379 16.7521 4.77187 16.4751C3.9657 15.176 3.50002 13.6439 3.50002 12ZM12 1.5C6.20103 1.5 1.50002 6.20101 1.50002 12C1.50002 13.8381 1.97316 15.5683 2.80465 17.0727L1.08047 21.107C0.928048 21.4637 0.99561 21.8763 1.25382 22.1657C1.51203 22.4552 1.91432 22.5692 2.28599 22.4582L6.78541 21.1155C8.32245 21.9965 10.1037 22.5 12 22.5C17.799 22.5 22.5 17.799 22.5 12C22.5 6.20101 17.799 1.5 12 1.5ZM14.2925 14.1824L12.9783 15.1081C12.3628 14.7575 11.6823 14.2681 10.9997 13.5855C10.2901 12.8759 9.76402 12.1433 9.37612 11.4713L10.2113 10.7624C10.5697 10.4582 10.6678 9.94533 10.447 9.53028L9.38284 7.53028C9.23954 7.26097 8.98116 7.0718 8.68115 7.01654C8.38113 6.96129 8.07231 7.046 7.84247 7.24659L7.52696 7.52195C6.76823 8.18414 6.3195 9.2723 6.69141 10.3741C7.07698 11.5163 7.89983 13.314 9.58552 14.9997C11.3991 16.8133 13.2413 17.5275 14.3186 17.8049C15.1866 18.0283 16.008 17.7288 16.5868 17.2572L17.1783 16.7752C17.4313 16.5691 17.5678 16.2524 17.544 15.9269C17.5201 15.6014 17.3389 15.308 17.0585 15.1409L15.3802 14.1409C15.0412 13.939 14.6152 13.9552 14.2925 14.1824Z"
      );
    }
    path.setAttribute("fill", "#ddd");
    path.style.setProperty("--darkreader-inline-fill", "#222426");
    iconGroup.appendChild(path);
    svg.appendChild(iconGroup);
    return svg;
  }

  addEventListeners() {
    this.saveNewNote.addEventListener("click", () => this.addNote());
    this.noteContent.addEventListener("input", (e) =>
      this.managerSaveButtonStatus(e.target)
    );

    document
      .querySelectorAll("li p[contenteditable], li textarea")
      .forEach((editableElement) => {
        editableElement.addEventListener("keyup", (e) => {
          const id = e.target.closest("li").id;
          if (e.target.tagName === "P") {
            this.noteList[id].title = e.target.innerText.trim();
          } else if (e.target.tagName === "TEXTAREA") {
            this.noteList[id].content = e.target.value;
          }
          this.saveNotes();
        });
      });
  }

  saveNotes() {
    localStorage.setItem("notes", JSON.stringify(this.noteList));
  }

  managerSaveButtonStatus(el) {
    this.saveNewNote.disabled = el.value.length > 0 ? false : true;
  }

  copyButtonListener() {
    document.querySelectorAll(".copyButton").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.id.replace("copy-", ""),
          contentNote = this.noteList[id].content;
        try {
          navigator.clipboard
            .writeText(contentNote)
            .then(() => {
              alert("Texto copiado para a área de transferência!");
            })
            .catch((error) => {
              alert(`Falha ao copiar texto para a área de transferência: ${error}`);
            });
        } catch (e) {
          console.log(e);
        }
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
      textArea.addEventListener("blur", () => (textArea.style.height = "36px"));
      textArea.style.maxHeight = "350px";
    });
  }

  menuListenerFunction() {
    document.querySelectorAll("li").forEach((liElement) => {
      liElement.addEventListener("contextmenu", (e) => {
        e.preventDefault();
        const existingMenu = document.querySelector("#menu");
        if (existingMenu) existingMenu.remove();
        const menu = document.createElement("div");
        menu.id = "menu";
        menu.innerHTML = `
                    <button type="button" id="Delete">Delete note</button>
                    <button type="button" id="Share">Share note</button>
                `;

        liElement.appendChild(menu);
        const menuWidth = menu.offsetWidth;
        const menuHeight = menu.offsetHeight;
        let menuX = e.pageX;
        let menuY = e.pageY;

        if (menuX + menuWidth > window.innerWidth) menuX = e.pageX - menuWidth;
        if (menuY + menuHeight > window.innerHeight) menuY = e.pageY - menuHeight;
        if (e.pageX > window.innerWidth * 0.8) menuX = e.pageX - menuWidth;

        menu.style.left = `${menuX}px`;
        menu.style.top = `${menuY}px`;
        menu.style.position = "absolute";
        menu.style.display = "flex";
        menu.style.flexDirection = "column";
        menu.style.width = "100px";

        document.addEventListener("click", (closeMenuEvent) => {
          if (
            !menu.contains(closeMenuEvent.target) &&
            !liElement.contains(closeMenuEvent.target)
          ) {
            menu.remove();
          }
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

  NewTitle(id, titleItem) {
    console.log(id, titleItem);
  }

  deleteNote(id) {
    if (this.noteList[id]) {
      delete this.noteList[id];
      localStorage.setItem("notes", JSON.stringify(this.noteList));
      this.loadCards();
    }
  }

  createShareDialog(id) {
    if (!document.getElementById("shareContentDialog")) {
      const dialogShare = document.createElement("div");
      dialogShare.id = "shareContentDialog";

      const shareContent = document.createElement("div");
      shareContent.id = "shareContent";

      const title = document.createElement("h2");
      title.textContent = "Share your note";
      shareContent.appendChild(title);

      const sendDiv = document.createElement("div");
      sendDiv.id = "send";

      const textarea = document.createElement("p");
      textarea.id = "share";
      textarea.classList.add("blockSelection");
      textarea.textContent = this.noteList[id].content;
      sendDiv.appendChild(textarea);

      const wppButton = document.createElement("button");
      wppButton.classList.add("bt2");
      wppButton.appendChild(this.icon("wpp"));
      wppButton.addEventListener("click", () => {
        const titlewpp = this.noteList[id].title
          ? `*${this.noteList[id].title}*\n\n`
          : "",
          message = encodeURIComponent(`${titlewpp}${this.noteList[id].content}`);
        const whatsappLink = `https://wa.me/?text=${message}`;
        window.open(whatsappLink, "_blank");
      });
      sendDiv.appendChild(wppButton);

      const emailButton = document.createElement("button");
      emailButton.classList.add("bt2", "email");
      emailButton.innerHTML = "&#9993;";
      emailButton.addEventListener("click", () => {
        const subject = this.noteList[id].title
          ? `<strong>${this.noteList[id].title}</strong>\n\n`
          : "",
          body = `${this.noteList[id].content}`,
          emailLink = `mailto:?subject=${encodeURIComponent(
            subject
          )}&body=${encodeURIComponent(body)}`;
        window.location.href = emailLink;
      });

      const deleteButton = document.createElement("button");
      deleteButton.innerHTML = "&#10006;";
      deleteButton.classList.add("close");
      deleteButton.addEventListener("click", () => {
        dialogShare.remove();
      });
      sendDiv.appendChild(deleteButton);
      sendDiv.appendChild(emailButton);
      shareContent.appendChild(sendDiv);
      dialogShare.appendChild(shareContent);
      document.body.appendChild(dialogShare);
    }
  }

  clearAll() {
    if (Object.values(this.noteList).length < 1) return;
    if (confirm("Are you sure you want to delete all notes? This action cannot be undone.")) {
      Object.keys(this.noteList).forEach((key) => delete this.noteList[key]);
      localStorage.setItem("notes", JSON.stringify(this.noteList));
      this.loadCards();
    }
  }

  generateUUID() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      let r = (Math.random() * 16) | 0,
        v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  addNote() {
    if (!this.noteContent.value) return;
    const newNote = {
      title: this.titleNote?.value || "",
      content: this.noteContent.value,
      timestamp: Date.now()
    };

    const noteId = this.generateUUID();
    this.noteList[noteId] = newNote;
    localStorage.setItem("notes", JSON.stringify(this.noteList));
    this.cancelDialog();
    this.loadCards();
  }

  cancelDialog() {
    this.titleNote.value = "";
    this.noteContent.value = "";
    this.dialog.close();
  }
}

const noteManager = new NoteIO();
