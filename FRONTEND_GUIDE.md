# 🚀 Frontend Quick Start Guide

## ✨ New Features

- **Multi-page Application** with React Router
- **Modern UI** with glassmorphism and gradients
- **Smooth Animations** using Framer Motion
- **Responsive Design** for all devices
- **Clean Navigation** with sticky navbar

---

## 📦 Pages

### 1. **Home Page** (`/`)
- Hero section with gradient background
- Feature cards with hover animations
- "How It Works" section
- Call-to-action section

### 2. **Analyze Page** (`/analyze`)
- File upload with drag & drop
- Sentiment analysis results
- AI-powered recommendations
- Visual charts and statistics

### 3. **About Page** (`/about`)
- Project mission and goals
- Technology stack showcase
- Detailed workflow explanation
- Key features list

---

## 🎨 Design System

### Colors
- **Primary**: `#6366f1` (Indigo)
- **Secondary**: `#ec4899` (Pink)
- **Accent**: `#14b8a6` (Teal)
- **Success**: `#10b981` (Green)
- **Error**: `#ef4444` (Red)

### Components
- Glassmorphism cards
- Gradient text
- Floating animations
- Smooth page transitions
- Responsive navigation

---

## 🏃 Running the Application

### Option 1: Using npm run dev (Recommended)
```bash
cd frontend
npm run dev
```

### Option 2: Using npm start
```bash
cd frontend
npm start
```

The frontend will start on **http://localhost:3000**

---

## 🔧 Project Structure

```
frontend/
├── src/
│   ├── components/         # Reusable components
│   │   ├── Navbar.js       # Navigation bar
│   │   ├── Navbar.css
│   │   ├── FileUpload.js   # File upload component
│   │   ├── SentimentResults.js
│   │   └── AIRecommendations.js
│   ├── pages/              # Page components
│   │   ├── Home.js         # Landing page
│   │   ├── Home.css
│   │   ├── Analyze.js      # Analysis page
│   │   ├── Analyze.css
│   │   ├── About.js        # About page
│   │   └── About.css
│   ├── App.js              # Main app with routing
│   ├── App.css             # Global styles
│   └── index.js            # Entry point
└── package.json            # Dependencies
```

---

## 📱 Responsive Breakpoints

- **Desktop**: > 968px
- **Tablet**: 768px - 968px
- **Mobile**: < 768px

---

## 🎯 Key Features

### Navigation
- ✅ Sticky navbar with glassmorphism
- ✅ Active link highlighting
- ✅ Mobile hamburger menu
- ✅ Smooth scroll between sections

### Animations
- ✅ Page transitions with Framer Motion
- ✅ Scroll-triggered animations
- ✅ Hover effects on cards
- ✅ Loading spinners
- ✅ Floating elements

### Components
- ✅ Gradient buttons with hover effects
- ✅ Glassmorphic cards
- ✅ Icon integration (React Icons)
- ✅ Chart visualizations
- ✅ Markdown rendering for AI responses

---

## 🛠️ Dependencies

```json
{
  "react": "^18.2.0",
  "react-router-dom": "^6.21.1",
  "framer-motion": "^10.16.16",
  "react-icons": "^5.0.1",
  "axios": "^1.6.2",
  "chart.js": "^4.4.1",
  "react-chartjs-2": "^5.2.0",
  "react-dropzone": "^14.2.3",
  "react-markdown": "^9.0.1"
}
```

---

## 🎨 Customization

### Changing Colors
Edit `src/App.css` - `:root` section:
```css
:root {
  --primary: #6366f1;    /* Change primary color */
  --secondary: #ec4899;   /* Change secondary color */
  /* ... more colors ... */
}
```

### Adding New Pages
1. Create new component in `src/pages/`
2. Add route in `src/App.js`
3. Add navigation link in `src/components/Navbar.js`

Example:
```jsx
// In App.js
<Route path="/newpage" element={<NewPage />} />

// In Navbar.js
<Link to="/newpage" className="nav-link">New Page</Link>
```

---

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Kill process on port 3000 (Windows)
npx kill-port 3000
```

### Module Not Found
```bash
cd frontend
npm install
```

### Backend Not Responding
Make sure FastAPI backend is running on port 5000:
```bash
python api_server.py
```

---

## 🚀 Build for Production

```bash
cd frontend
npm run build
```

This creates an optimized production build in the `build/` folder.

---

## 📝 Notes

- **`npm run dev`** is now available and works the same as `npm start`
- All animations are hardware-accelerated for smooth performance
- The UI is fully responsive and mobile-friendly
- Dark mode can be added by extending the CSS variables

---

**Made with ❤️ using React, Framer Motion, and modern web technologies**
