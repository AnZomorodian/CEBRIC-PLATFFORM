# F1 Platform

Professional Grade Formula 1 Telemetry Analysis & News Platform.

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- Python 3.11+ (with `pip`)

### Installation

1. Install Node dependencies:
   ```bash
   npm install
   ```

2. Install Python dependencies:
   ```bash
   pip install fastf1 pandas matplotlib numpy requests
   ```

### Running the Project

To start the development server (both frontend and backend):
```bash
npm run dev
```

The application will be available at `http://localhost:5000`.

## 🛠 Features

- **Telemetry Analysis**: Deep dive into driver performance with speed, throttle, and brake traces.
- **Race Insights**: Driver rankings, performance predictions, and session-level analytics.
- **Live News**: Stay updated with the latest F1 news from Motorsport and Autosport.
- **Advanced Analysis**: Weather impact, pit stop strategy, and tire degradation modeling.

## 📂 Project Structure

- `client/`: React frontend (Vite, Tailwind, Shadcn UI)
- `server/`: Express backend (Node.js, Drizzle ORM)
- `python/`: Data processing scripts (FastF1 integration)
- `shared/`: Shared TypeScript types and schemas
