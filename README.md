# 🪔 Euriska Cultural Portal (2026–27)

> **Celebrating Togetherness** — Official Cultural, Festive & Financial Transparency Platform for Euriska Society, Pune.

[![Live Demo](https://img.shields.io/badge/Live%20App-euriskacultural.web.app-orange?style=for-the-badge&logo=firebase)](https://euriskacultural.web.app/)
[![React](https://img.shields.io/badge/React-19.2-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.2-646CFF?style=for-the-badge&logo=vite)](https://vitejs.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-Firestore-FFCA28?style=for-the-badge&logo=firebase)](https://firebase.google.com/)

---

## 🌟 Overview

**Euriska Cultural** is a Progressive Web Application (PWA) built for the residents of Euriska Society in Pune, India. It centralizes annual festival celebrations, daily aarti prasad bookings, cultural event matrices, volunteer coordination, and real-time financial transparency.

---

## ✨ Key Features

### 🪔 1. Ganpati Prasad Seva (8:00 PM Daily Aarti)
- **Multi-Devotee Bookings**: Multiple families can co-sponsor and book prasad offerings (*Modak, Ladoo, Sheera, Fruits, Panchamrit*) for the same auspicious evening.
- **Personalized Devotee Pass (PDF)**: Generates a high-quality commemorative Devotee Aarti Pass with exact flat numbers, family names, reporting times, and pass IDs.
- **Full Schedule PDF Export**: Instant 12-day printable schedule table for society notice boards.
- **Real-Time Booking Status**: Live synchronization with Firebase Firestore and seamless offline localStorage caching.

### 🎨 2. Kalakriti Activity Board
- **Activity Matrix**: Resident registration across multiple categories (Drawing, Skits, Dance, Fashion Show, Mimicry, Singing, Fancy Dress).
- **Age-Group Segregation**: Tracks participation across Kids, Teens, Adults, and Seniors.
- **Instant PDF & CSV Matrix**: One-click printable roster for event coordinators.

### 📊 3. Financial Transparency & Ledger
- **Role-Protected Financial Dashboard**: Secure password-protected administrative view for committee members and treasurers.
- **Building Collection Tracking**: Real-time breakdown of paid vs pending contributions across Wings/Buildings.
- **Expense Categorization & Budget Variance**: Visual pie charts, money flow infographics, and budget vs actual analytics.
- **Audit PDF Reports**: Export comprehensive financial audit sheets for Annual General Meetings (AGM).

### 🎭 4. Year-Round Cultural Calendar & Event Lineups
- Annual calendar for **Ganeshotsav, Navratri, Diwali, Makar Sankranti, Republic Day, Eid, and Holi**.
- Stage schedules, performance rosters, and artist showcases.

### 👥 5. Live Presence & Traffic Heartbeat
- Real-time active resident presence monitoring via Firestore heartbeats.
- Visual resident badges and live traffic insights for committee admins.

### 📱 6. PWA & Mobile-First Experience
- Web App Manifest (`standalone` mode, responsive icons, theme colors).
- Fast loading with local storage fallback if network is offline.
- Rich SEO with Schema.org JSON-LD structured data and Open Graph social cards.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend Framework** | React 19, TypeScript, Vite |
| **Styling & Design System** | Modern Vanilla CSS, Glassmorphism, Google Fonts (`Outfit`, `Plus Jakarta Sans`) |
| **Icons & Visuals** | Lucide React, Canvas Confetti |
| **Backend & Database** | Firebase Firestore (Realtime DB), Firebase Hosting |
| **Document Generation** | jsPDF, jsPDF-AutoTable |
| **Testing** | Playwright E2E Testing |
| **Linter** | Oxlint |

---

## 📁 Project Structure

```text
Euriska_Cultrual/
├── public/                     # Static assets, icons, manifest & SEO
│   ├── euriska_logo.png        # Official logo
│   ├── ganesh_bhagwan.jpg      # Festive idol imagery
│   ├── favicon.svg             # Vector favicon
│   ├── manifest.webmanifest    # PWA configuration
│   ├── robots.txt              # Search crawler directives
│   └── sitemap.xml             # Canonical sitemap
├── src/
│   ├── components/             # Reusable UI components
│   │   ├── admin/              # Sync utilities & live traffic modals
│   │   ├── auth/               # Password modal & role controls
│   │   ├── common/             # Header, BottomNav, BottomSheet, LivePresence
│   │   ├── contributions/      # Contribution lists & payment sheets
│   │   ├── expenses/           # Expense vouchers & category filters
│   │   ├── gallery/            # Media grids & photo albums
│   │   ├── home/               # Hero, quick actions, festival banners
│   │   ├── kalakriti/          # Activity registration modals
│   │   ├── pages/              # Main view containers (Home, Prasad, Kalakriti, etc.)
│   │   ├── performances/       # Stage performance lineups
│   │   ├── prasad/             # BookPrasadModal & devotee forms
│   │   ├── programs/           # Event timelines & daily itineraries
│   │   ├── report/             # Financial graphs & budget summaries
│   │   ├── sponsors/           # Sponsor showcase tiers
│   │   └── volunteers/         # Volunteer duty boards
│   ├── context/                # AuthContext & ToastContext
│   ├── firebase/               # Firebase SDK initialization & collection helpers
│   ├── services/               # API, Firestore, PDF generation & sync services
│   ├── styles/                 # Design tokens, layouts & components CSS
│   └── types/                  # TypeScript interfaces & domain models
├── firestore.rules             # Production Firebase security rules
├── firebase.json               # Firebase Hosting configuration
├── playwright.config.ts        # E2E test configuration
└── package.json                # Project dependencies and scripts
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18.0 or higher
- **npm** or **yarn** / **pnpm**

### 1. Clone the Repository
```bash
git clone https://github.com/smamit27/euriskacultural.git
cd euriskacultural
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env` and fill in your Firebase credentials:
```bash
cp .env.example .env
```

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

### 4. Run Locally
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 5. Build for Production
```bash
npm run build
```

---

## 🧪 Testing & Quality

- **Run Linter**:
  ```bash
  npm run lint
  ```
- **Run End-to-End Tests**:
  ```bash
  npm run test:e2e
  ```
- **Open Playwright Interactive UI**:
  ```bash
  npm run test:e2e:ui
  ```

---

## ☁️ Deployment

### Deploy to Firebase Hosting
```bash
# Build production bundle
npm run build

# Deploy hosting and firestore security rules
npx firebase deploy
```

---

## 📄 License

This project is created for the internal cultural and community activities of **Euriska Society**. All rights reserved.

---

<p align="center">
  <strong>Ganpati Bappa Morya! 🪔</strong>
</p>
