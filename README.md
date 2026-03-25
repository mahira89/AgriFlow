# 🌱 AgriFlow: AI-Powered Agricultural Assistant

AgriFlow is a specialized full-stack platform designed to empower Indian farmers with data-driven insights, expert agricultural knowledge, and real-time weather-aware recommendations. By leveraging cutting-edge AI (Gemini 2.0) and Retrieval-Augmented Generation (RAG), AgriFlow provides accurate, context-specific solutions for modern farming challenges.

---

## 🚀 Key Features

### 🤖 Intelligent Chat Assistant (RAG-Enabled)
*   **Semantic Search:** Uses vector embeddings to retrieve the most relevant agricultural data from a curated dataset.
*   **Context-Aware Advice:** Combines historical data, government schemes, and live weather to provide personalized farming tips.
*   **Gemini 2.0 Integration:** Powered by `gemini-2.0-flash-lite` for near-instant, expert-level responses.

### 🌤️ Smart Weather Module
*   **Real-time Tracking:** Live weather data from OpenWeather API.
*   **Farming Alerts:** Actionable insights like "Ideal for sowing," "Avoid pesticide spray (high wind)," or "Rain expected: Adjust irrigation."
*   **Visual Indicators:** Intuitive UI for temperature, humidity, and wind speed.

### 🌾 Crop Knowledge Base
*   **Fertilizer Schedules:** Detailed nutrient management for various crops.
*   **Pest & Disease Control:** Early identification and management strategies (e.g., Pink bollworm, Wheat Rust).
*   **Organic Farming:** Sustainable practices and traditional methods.
*   **Govt. Schemes:** Updates on PM-KISAN, PMFBY, and other crucial subsidies.

### 📊 Modern Dashboard
*   **Unified View:** A central hub for navigating between Chat, Crop Info, and Weather.
*   **Seamless UI:** Built with Framer Motion for smooth, interactive transitions.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, Framer Motion, React Router, React Icons, Axios |
| **Backend** | Node.js, Express, MongoDB, Mongoose |
| **AI/ML** | Google Gemini 2.0, Gemini Embeddings (`gemini-embedding-001`) |
| **APIs** | OpenWeather API |
| **Styling** | Modern Vanilla CSS |

---

## ⚙️ Setup & Installation

### Prerequisites
*   Node.js (v18 or higher)
*   MongoDB (Atlas or Local)
*   Gemini API Key (from [Google AI Studio](https://aistudio.google.com/))
*   OpenWeather API Key

### 1. Clone the Repository
```bash
git clone https://github.com/mahira89/AgriFlow.git
cd AgriFlow
```

### 2. Backend Setup
```bash
cd backend
npm install
```
*   Create a `.env` file in the `backend/` directory:
    ```env
    PORT=5000
    MONGODB_URI=your_mongodb_connection_string
    GEMINI_API_KEY=your_gemini_api_key
    OPENWEATHER_API_KEY=your_openweather_api_key
    ```
*   **Seed the Knowledge Base (CRITICAL):**
    ```bash
    npm run seed
    ```
    *This processes `agricultural-dataset.json` and creates vector embeddings in MongoDB.*

### 3. Frontend Setup
```bash
cd ../frontend
npm install
npm start
```

---

## 🧠 How the RAG System Works

1.  **Ingestion:** The `seedEmbeddings.js` script reads `agricultural-dataset.json`, converts the text into vectors using `gemini-embedding-001`, and stores them in MongoDB.
2.  **Querying:** When a user asks a question, the backend generates an embedding for that query.
3.  **Retrieval:** The system performs a **Cosine Similarity Search** against the stored embeddings to find the top 3-5 most relevant agricultural documents.
4.  **Generation:** The query + retrieved context + live weather data are sent to Gemini 2.0 to generate a final, grounded response.

---

## 📂 Project Structure

```text
AgriFlow/
├── backend/
│   ├── data/            # Agricultural Knowledge Base (JSON)
│   ├── models/          # MongoDB/Mongoose Schemas (Chat, Embeddings)
│   ├── routes/          # API Endpoints (Chat, Weather, Crops)
│   ├── scripts/         # Database Seeding & Embedding scripts
│   └── utils/           # Gemini & Embedding logic
├── frontend/
│   ├── src/
│   │   ├── components/  # Modular UI (Chat, Weather, Dashboard)
│   │   └── App.js       # Routing & Core Logic
└── README.md
```

---

## 🤝 Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License
This project is licensed under the MIT License.
