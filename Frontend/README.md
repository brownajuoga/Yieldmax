# NutriManure Frontend

A React-based sustainable farming platform that connects farmers for organic manure collection and provides AI-powered crop diagnosis.

## Features

- **Crop Diagnosis** - AI-powered diagnosis of crop issues based on symptoms and soil conditions
- **Farming Help Centre** - Q&A database with offline support and backend-powered search
- **Compost Calculator** - Get customized composting plans for your organic waste
- **Field Reports** - Submit and track farming activity reports

## Prerequisites

- Node.js 18+ and npm
- Go 1.21+ (for running the backend)

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Start the Backend

```bash
cd ../src/backend
go run .
```

The backend will start on `http://localhost:9000`

### 3. Start the Frontend Development Server

```bash
npm run dev
```

The frontend will start on `http://localhost:5173`

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally

## Project Structure

```
Frontend/
├── src/
│   ├── components/
│   │   ├── AuthModal.jsx       # Login/registration modal
│   │   ├── Dashboard.jsx       # Main dashboard with action cards
│   │   ├── Diagnosis.jsx       # Crop diagnosis tool
│   │   ├── CompostCalculator.jsx # Composting plan calculator
│   │   ├── FarmingQA.jsx       # FAQ and knowledge base
│   │   └── Reports.jsx         # Field reports management
│   ├── services/
│   │   └── api.js              # Backend API client
│   ├── App.jsx                 # Main application component
│   ├── main.jsx                # Entry point
│   └── index.css               # Global styles
├── index.html
├── package.json
├── vite.config.js
└── .env
```

## Backend Integration

The frontend connects to the Go backend via these API endpoints:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/diagnosis` | POST | Diagnose crop issues |
| `/knowledge/crop` | GET | Get crop-specific guidance |
| `/knowledge/nutrient` | GET | Get nutrient-specific guidance |
| `/advisory` | POST | Get combined diagnosis + guidance |
| `/compost` | POST | Get composting plan |
| `/reports` | GET/POST | Manage field reports |

## Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_URL=http://localhost:9000
```

## License

MIT
