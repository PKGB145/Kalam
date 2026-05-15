# Kalam — Personal Study & Productivity App

> **कलम** (kalam) — the Urdu/Hindi word for *pen*. A handcrafted, offline-first personal space for studying, habit tracking, journalling, and staying organised.

---

## What is Kalam?

Kalam is a **single-file HTML web app** (`kalam.html` / `index.html`) that runs entirely in any modern browser with zero installation. No server, no backend, no account required. Everything saves locally in the browser's `localStorage`.

It is designed to be shared — any friend can open the same file and set up their own profile separately on the same device.

---

## Features

### Daily
| Feature | Description |
|---|---|
| **Habits** | Daily/weekly habit tracker with weekly grid, streaks, and lifetime history — navigate any past week |
| **Tasks & Goals** | Tasks with tags, priorities, due dates, sub-tasks. Goals with progress bars, milestones, and daily check-ins |
| **Journal** | Full journal with mood, tags, templates (Brain Dump, Daily Review, Mood Check-in, Study Session, Weekly Reflection, Day Tracker), and word count |
| **Calendar** | Monthly calendar with events, recurring Zoom classes (with Join button), assignments with date ranges |
| **Dashboard** | Habits, To-Do list, Today's Schedule, Tasks, and Journal quick-write — all on one screen |

### Study
| Feature | Description |
|---|---|
| **Study Space** | NotebookLM-style 3-column layout: Sources → Notes → Study Tools |
| **Sources** | Upload PDF, DOCX, PPTX, TXT, audio — auto-parsed; no copy-paste needed |
| **Flashcards** | Manual add, CSV/JSON upload, or AI-generated from notes/sources |
| **Quiz** | Multiple-choice quizzes; manual or AI-generated |
| **Mind Map** | SVG radial mind map from note titles or AI-generated concepts |
| **Study Chat** | Ask questions about your own notes and sources |

### Focus & Wellbeing
| Feature | Description |
|---|---|
| **Pomodoro** | Focus/break timer with animated ring, session dots, customisable durations |
| **Focus Lock** | Fullscreen mode when focus timer starts; exits fullscreen pauses the timer |
| **Binaural Beats** | Web Audio API — Focus 40Hz, Relax 10Hz, Sleep 4Hz, Creative 7Hz, Memory 14Hz. Use headphones |
| **20-20-20 Eye Break** | Full-screen overlay reminder at configurable intervals |
| **Spotify Player** | Floating mini-player — paste any Spotify link or use presets (Lo-fi, Focus, Classical, Jazz) |

### AI
| Feature | Description |
|---|---|
| **Built-in AI** | Offline NLP engine: add tasks, log habits, answer questions, explain topics — no key needed |
| **Gemini 1.5 Flash** | Free tier — get key at aistudio.google.com, no credit card |
| **Claude Haiku / Sonnet** | Anthropic API key from console.anthropic.com |
| **AI Float Button** | Bottom-right corner chat bubble — synced with the main AI page |
| **Voice Recording** | Speak your notes via browser speech recognition; optional AI cleanup after |

### Sync & Data
| Feature | Description |
|---|---|
| **Multi-user Profiles** | Multiple people on one device with completely separate data |
| **Export / Import** | JSON backup and restore from Settings → Data & Backup |
| **Firebase Sync** | Optional real-time sync across devices |
| **Google Calendar** | OAuth2 sync — imports events and Zoom classes automatically |

### Customisation
- 6 background colour presets + custom picker
- 7 accent colour presets + custom picker — all UI colours derive from accent
- 5 font families (DM Sans, Inter, Merriweather, Nunito, Lora)
- Font size 12–18px, sidebar width, layout density
- Collapsable sidebar with icon-only mode + tooltips

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Vanilla HTML + CSS + JavaScript — single file, no build step |
| **Storage** | `localStorage` (offline) + optional Firebase Firestore |
| **AI** | Gemini 1.5 Flash API / Claude API / built-in NLP engine |
| **File parsing** | Mammoth.js (DOCX), PDF.js (PDF), SheetJS (XLSX) — loaded from CDN |
| **Audio** | Web Audio API (binaural beats), Web Speech API (voice recording) |
| **Calendar** | Google Calendar API v3 (OAuth2 implicit flow) |
| **Music** | Spotify Web Embed Player |
| **Fonts** | Google Fonts (Lora, DM Sans, Inter, Merriweather, Nunito) |

---

## Running the App

### As a website (recommended)
1. Open `kalam.html` in Chrome, Opera, or Edge
2. For Google Calendar sync: host on a web server (GitHub Pages, localhost)

### As a local server (for Google Calendar OAuth)
```bash
# Python (no install needed)
python -m http.server 8080
# Then open: http://localhost:8080/kalam.html
```

---

## Project Structure

```
kalam.html          ← Entire app: HTML + CSS + JS in one file (~310KB)
README.md           ← This file
```

### Internal structure of kalam.html
```
<head>
  Google Fonts links
  Mammoth.js, PDF.js, SheetJS CDN scripts
  PDF.js worker init

<style>
  CSS variables (:root)        ← all colors as tokens
  Layout (sidebar, topbar, content)
  Component styles (cards, modals, habits, flashcards, etc.)
  Collapsable sidebar CSS
  Dashboard CSS
  Mobile responsive CSS

<body>
  Sidebar (desktop nav)
  Main content area
    Topbar
    Pages: Dashboard, Habits, Tasks, Journal, Calendar,
           Study Space, Pomodoro, AI Assistant, Settings
  Bottom nav (mobile)
  Eye break overlay (fullscreen)
  Onboarding overlay
  AI float button + popup
  Spotify mini player + FAB
  Binaural beats player
  Modal overlay
  Toast container

<script>
  State management + localStorage
  Navigation
  Dashboard (habits, todo, agenda, journal, tasks, stats)
  Habits (week navigation, streaks)
  Tasks & Goals (milestones, check-ins)
  Journal (templates, auto-save)
  Calendar (events, Zoom, assignments, recurrence)
  Study Space (notebook layout, sources, notes, flashcards, quiz, mind map)
  File parsers (DOCX, PDF, XLSX, PPTX)
  Pomodoro (fullscreen focus lock, eye break timer)
  AI router (Gemini / Claude / built-in NLP)
  Voice recording → notes
  Binaural beats (Web Audio API)
  Spotify player
  Google Calendar OAuth2 sync
  Multi-user profiles
  Settings (themes, fonts, API keys, Firebase, Google Calendar)
  Export / Import / Clear data
  Onboarding
  Init
```

---

## Building an Android APK

> **For AI assistants:** This section contains the complete instructions to convert `kalam.html` into an Android APK using Capacitor. Follow each step in order. All commands are for Windows (PowerShell or CMD). The file to package is `kalam.html` — rename it to `index.html` before use.

### Prerequisites

Install in this order:

1. **Node.js LTS** — https://nodejs.org
   - Verify: `node --version` and `npm --version`

2. **Android Studio** — https://developer.android.com/studio
   - During setup: install Android SDK (API 33 or 34)
   - After install: open Android Studio → Tools → SDK Manager
   - SDK Tools tab → check: Android SDK Build-Tools, Android SDK Command-line Tools → Apply

3. **Java JDK 17** — bundled with Android Studio
   - Set `JAVA_HOME`: Windows Search → "Environment Variables" → New System Variable
   - Name: `JAVA_HOME`, Value: `C:\Program Files\Android\Android Studio\jbr` (or wherever Android Studio installed JDK)

4. **Set ANDROID_HOME**: New System Variable
   - Name: `ANDROID_HOME`, Value: `C:\Users\<YourUsername>\AppData\Local\Android\Sdk`

### Step-by-step build

```bash
# 1. Create project folder
mkdir kalam-app
cd kalam-app

# 2. Initialise npm
npm init -y

# 3. Install Capacitor
npm install @capacitor/core @capacitor/cli @capacitor/android

# 4. Initialise Capacitor (web-dir is where your HTML lives)
npx cap init "Kalam" "com.kalam.app" --web-dir www

# 5. Create www folder and add your HTML
mkdir www
copy ..\kalam.html www\index.html
# (replace ..\kalam.html with the actual path to your file)

# 6. Add Android platform
npx cap add android

# 7. Sync files to Android project
npx cap sync android

# 8. Open in Android Studio
npx cap open android
```

In Android Studio:
1. Wait for Gradle sync to finish (first time: 3–10 minutes)
2. **Build → Build Bundle(s) / APK(s) → Build APK(s)**
3. Click **locate** when done
4. APK is at: `android/app/build/outputs/apk/debug/app-debug.apk`

### Required Android permission (for API calls)

Edit `android/app/src/main/AndroidManifest.xml` — add inside `<application`:
```xml
android:usesCleartextTraffic="true"
```

Also add before `<application`:
```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.RECORD_AUDIO" />
```

### capacitor.config.json (full recommended config)

Create this file at the root of `kalam-app/`:

```json
{
  "appId": "com.kalam.app",
  "appName": "Kalam",
  "webDir": "www",
  "server": {
    "androidScheme": "https",
    "cleartext": true
  },
  "plugins": {
    "SplashScreen": {
      "launchShowDuration": 1000,
      "backgroundColor": "#F5F0E8"
    }
  },
  "android": {
    "allowMixedContent": true,
    "webContentsDebuggingEnabled": false
  }
}
```

### Common errors and fixes

**"SDK location not found"**
```
# Create android/local.properties with:
sdk.dir=C\:\\Users\\WELCOME\\AppData\\Local\\Android\\Sdk
# (double backslashes, your actual username)
```

**"JAVA_HOME not set" or Gradle fails**
```bash
cd android
.\gradlew --stop
# Then set JAVA_HOME as described above and retry
```

**App opens but shows blank screen**
- Confirm `www/index.html` exists (not `www/kalam.html`)
- In Android Studio: View → Tool Windows → Logcat — look for JS errors
- Make sure `android:usesCleartextTraffic="true"` is set

**Gradle sync takes forever / fails**
```bash
cd android
.\gradlew assembleDebug --refresh-dependencies
```

**"minSdkVersion too low" error**
Edit `android/variables.gradle`:
```gradle
minSdkVersion = 24
targetSdkVersion = 34
compileSdkVersion = 34
```

### Build release APK (for sharing)

```
Android Studio → Build → Generate Signed Bundle / APK
→ APK → Next
→ Create new keystore → fill in details → save the .jks file and passwords!
→ Release → Finish
```

Release APK location: `android/app/build/outputs/apk/release/app-release.apk`

This APK can be shared with anyone — send via WhatsApp, Google Drive, or USB.

### Install on phone

1. Transfer APK to phone (WhatsApp, email, USB, Google Drive)
2. Phone Settings → Security → **Install unknown apps** → enable for your file manager
3. Open the APK file → Install
4. Find **Kalam** in app drawer

---

## API Keys (optional)

All keys are stored locally in `localStorage` — never sent anywhere except the respective API.

| Key | Where to get | What it unlocks |
|---|---|---|
| **Gemini API Key** | aistudio.google.com/app/apikey | Free AI (15 req/min), no credit card |
| **Claude API Key** | console.anthropic.com | Claude Haiku (fast) or Sonnet (smart) |
| **Google Client ID** | console.cloud.google.com | Google Calendar sync |
| **Firebase Config** | console.firebase.google.com | Cross-device data sync |

---

## Data & Privacy

- All data lives in your browser's `localStorage` under key `kalam_data`
- Nothing is sent to any server unless you explicitly configure Firebase or use an AI API key
- API keys are stored locally and only sent to their respective services (Google, Anthropic)
- Export your data anytime: Settings → Data & Backup → Export JSON

---

## Licence

Personal use. Build it, remix it, share it.
