# Codeblock - A Simple Note-Taking Web App  

**Codeblock** is a simple and intuitive web-based note-taking app that allows users to create, edit, and save their notes directly in the browser. It uses **localStorage** to persist notes across sessions, ensuring that all changes are saved automatically.  

---  
<img src="https://github.com/user-attachments/assets/7efb1de4-59a0-40a6-a7d5-8852c4ce9a12" width="700">

You can try out the live demo of the project [here](https://vxncius-dev.github.io/Codeblock/).  

## Features  

- **Create and Edit Notes**: Users can add titles and content to their notes.  
- **Local Storage Integration**: Notes are saved persistently in the browser's local storage, even after a page refresh.  
- **Copy Functionality**: Notes can be copied to the clipboard with the click of a button.  
- **Placeholder Notes**: If no notes exist, random placeholder content is displayed as a guide.  
- **Light and Dark Theme Toggle**: The app allows users to toggle between light and dark themes, with the theme preference saved.  
- **Speech-to-Text Transcription**: Users can dictate notes using their microphone, and the app will convert speech to text automatically.  

## Technologies  

- **HTML** for page structure.  
- **CSS** for styling and responsive design.  
- **JavaScript** for dynamic interactivity, local storage management, speech recognition, and theme toggling.  

## How It Works  

### 1. **Managing Notes**:  
   - Users can create new notes by clicking on the "Add Note" button.  
   - Notes are automatically saved in the browser's `localStorage` and persist across sessions.  
   - Each note can be edited or deleted by clicking on the respective buttons.  
   - Notes can be copied to the clipboard with a dedicated button for each note.  

### 2. **Speech-to-Text Transcription**:  
   - Users can click the **microphone button** to start voice transcription.  
   - The app will capture speech and convert it into text in real-time.  
   - If no speech is detected for **10 seconds**, the recording will automatically stop.  
   - Requires **microphone permissions** to be granted in the browser.  

### 3. **Theme Toggling**:  
   - The app supports both light and dark themes.  
   - Users can toggle between themes using a button, and their preference will be saved in `localStorage`, so it persists across page loads.  

## Setup Instructions  

1. **Clone the repository**:  

   ```bash
   git clone https://github.com/vxncius-dev/Codeblock.git
   cd Codeblock
   ```

2. **Run the project**:  
   - Open `index.html` in your preferred browser to see the app in action.
