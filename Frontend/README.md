# YieldMax - Smart Farming Assistant

An agricultural advisory platform that helps farmers get personalized crop care advice and manure recommendations.

## Features

- **Crop Advisory** - Get personalized manure recommendations based on crop type, growth stage, and symptoms
- **My Farm** - Register and track your farm details and crops
- **Ask About Crops** - Search for crop-specific advice from the knowledge base or browse common farming questions

## Core Functionality

The app helps farmers answer:
1. **What type of manure should I use?** - Recommends poultry, cattle, or goat manure based on crop needs
2. **When should I apply manure?** - Provides timing guidance based on growth stage
3. **How much manure should I apply?** - Calculates application rates per acre/hectare
4. **What's wrong with my crops?** - Diagnoses nutrient deficiencies from symptoms

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
│   │   ├── AuthModal.jsx       # Login/registration
│   │   ├── Dashboard.jsx       # Main dashboard
│   │   ├── MyFarm.jsx          # Farm registration
│   │   ├── CropAdvisory.jsx    # Manure recommendations
│   │   └── FarmingQA.jsx       # Q&A and knowledge search
│   ├── services/
│   │   └── api.js              # Backend API client
│   ├── App.jsx                 # Main application
│   ├── main.jsx                # Entry point
│   └── index.css               # Global styles
├── index.html
├── package.json
├── vite.config.js
└── .env
```

## Backend Integration

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/knowledge/crop?name=` | GET | Get crop-specific guidance |
| `/knowledge/nutrient?name=` | GET | Get nutrient-specific guidance |
| `/advisory` | POST | Get diagnosis + recommendations |
| `/reports` | GET/POST | Farm registration storage |

## Environment Variables

```env
VITE_API_URL=http://localhost:9000
```

## License

MIT
