class TranscribeAPI {
  constructor(options = { interimResults: true }) {
    this.isRecognizing = false;
    window.SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognition = new SpeechRecognition();
    this.silenceTimeout = null;
    this.recognition.lang = navigator.language || 'en-US';
    this.recognition.interimResults = options.interimResults;
    this.noteContent = document.getElementById('noteContent');
    this.saveNewNote = document.getElementById("saveNewNote");
    this.recordButton = document.getElementById("record");
    this.recordButton.addEventListener('click', () => this.toggleRecognition());
    this.recognition.addEventListener('result', (e) => this.handleResult(e));
    this.recognition.addEventListener('end', () => this.handleRecognitionEnd());
    this.recognition.addEventListener('error', (event) => this.handleRecognitionError(event));
    this.debugMode = false;
  }

  resetRecordButton() {
    this.recordButton.querySelector("img").classList.remove("recording");
    this.recordButton.style.borderColor = "#666666";
    clearTimeout(this.silenceTimeout);
    this.recognition.continuous = false;
    this.stopRecognition();
    this.recordButton.setAttribute("data-title", "Start recording");
    this.recordButton.querySelector("img").src = "./app/icons/microphone.png";
  }

  toggleRecognition() {
    this.recognition.continuous = true;
    if (!this.isRecognizing) {
      this.checkPermissionsAndStart();
    } else {
      this.resetRecordButton();
    }
  }

  async checkPermissionsAndStart() {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const audioDevices = devices.filter(device => device.kind === 'audioinput');

      if (audioDevices.length === 0) {
        this.updateUI('Nenhum dispositivo de gravação encontrado.');
        this.resetRecordButton();
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      if (stream) {
        this.startRecognition();
      } else {
        this.updateUI('Permissão negada para usar o microfone.');
        this.resetRecordButton();
      }
    } catch (error) {
      this.handleError(error);
      this.resetRecordButton();
    }
  }

  async startRecognition() {
    try {
      this.recordButton.querySelector("img").classList.add("recording");
      this.recordButton.style.borderColor = "red";
      this.recordButton.setAttribute("data-title", "Stop recording");
      this.recordButton.querySelector("img").src = "./app/icons/stop-button.png";
      this.recognition.start();
      this.isRecognizing = true;
      this.silenceTimeout = setTimeout(() => {
        this.resetRecordButton();
      }, 10000);
    } catch (error) {
      this.handleError(error);
      this.resetRecordButton();
    }
  }

  stopRecognition() {
    this.isRecognizing = false;
    this.recognition.stop();
  }

  handleResult(e) {
    clearTimeout(this.silenceTimeout);
    let transcript = '';
    for (const result of e.results) {
      if (result.isFinal) transcript += `${result[0].transcript} `;
    }
    this.noteContent.value = "";
    this.noteContent.value = this.noteContent.value + transcript;
    this.saveNewNote.disabled = false;
    this.silenceTimeout = setTimeout(() => {
      this.resetRecordButton();
    }, 10000);
  }

  handleRecognitionEnd() {
    this.isRecognizing = false;
    if (this.recognition.continuous) this.recognition.start();
  }

  handleRecognitionError(event) {
    this.handleError(event.error);
  }

  handleError(error) {
    this.resetRecordButton();
    if (error === 'not-allowed') {
      this.updateUI('Permissão de gravação negada.');
    } else if (error === 'Requested device not found') {
      this.updateUI('Nenhum dispositivo de gravação encontrado.');
    } else {
      this.updateUI(`Erro desconhecido: ${error}`);
    }
    this.updateUI('Erro no reconhecimento');
  }

  updateUI(status) {
    if (this.debugMode) console.log(status);
  }
}

export default TranscribeAPI;
