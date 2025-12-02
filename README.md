# Lanka Relief 🇱🇰

**Lanka Relief** (formerly Athwela) is a comprehensive disaster management platform designed to coordinate real-time relief efforts in Sri Lanka. It connects donors with victims, helps locate missing persons, and mobilizes volunteer task forces during emergencies.

![Lanka Relief Banner](/public/LankaRelief.png)

## 🚀 Features

- **❤️ Donation Coordination**: Connects donors with specific needs (food, medicine, etc.) requested by victims or camps.
- **🔍 Person Finder**: A centralized database to report missing persons and mark them as safe.
- **🤝 Volunteer Task Force**: Mobilizes volunteers for rescue, medical aid, and cleanup missions.
- **🤖 AI Assistant**: Powered by Google Gemini to help users find information and navigate the platform using natural language (Sinhala/English).
- **🗺️ Real-time Map**: Visualizes needs, missing persons, and active volunteer missions on an interactive map.
- **🔐 Secure Verification**: PIN-based system for editing and deleting posts to prevent misinformation.

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS
- **Backend / Database**: Firebase (Firestore, Authentication, Storage, Cloud Functions)
- **AI**: Google Gemini API (`@google/genai`)
- **Maps**: Leaflet, React Leaflet
- **Deployment**: Firebase Hosting, Docker, GitHub Actions

## 🏃‍♂️ Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm
- A Firebase project
- A Google Gemini API Key

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/lanka-relief.git
    cd lanka-relief
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Configure Environment Variables:**
    Create a `.env` file in the root directory and add the following keys:

    ```env
    VITE_FIREBASE_API_KEY=your_firebase_api_key
    VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
    VITE_FIREBASE_PROJECT_ID=your_project_id
    VITE_FIREBASE_STORAGE_BUCKET=your_project_id.firebasestorage.app
    VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
    VITE_FIREBASE_APP_ID=your_app_id
    VITE_GEMINI_API_KEY=your_gemini_api_key
    ```

4.  **Run Locally:**
    ```bash
    npm run dev
    ```

## 🐳 Docker Support

You can containerize the application using the provided `Dockerfile`.

**Build the image:**
```bash
docker build -t lanka-relief .
```

**Run the container:**
```bash
docker run -p 8080:80 lanka-relief
```
Access the app at `http://localhost:8080`.

## 🚀 Deployment (CI/CD)

The project is configured with a **GitHub Actions** workflow (`.github/workflows/firebase-deploy.yml`) that automatically deploys to **Firebase Hosting** on every push to the `main` branch.

**Required GitHub Secrets:**
- `FIREBASE_SERVICE_ACCOUNT_LANKA_RELIEF`
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- ... (and other env vars listed above)

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
