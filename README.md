# 🏎️ F1 Nitro Racing - Asphalt Rush

A modern F1-style racing web game built with React, TypeScript, Vite, and Tailwind CSS. Features keyboard and touch controls, multiple difficulty levels, score tracking, and smooth animations.

![F1 Racing Game](https://img.shields.io/badge/Game-F1%20Racing-red?style=for-the-badge&logo=racing)
![React](https://img.shields.io/badge/React-18-blue?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![Vite](https://img.shields.io/badge/Vite-6-purple?style=for-the-badge&logo=vite)

## 🎮 Features

- **Multiple Difficulty Levels**: Easy, Medium, and Hard modes with different speeds and obstacle frequencies
- **Keyboard Controls**: Arrow keys or A/D to steer, Space/Esc to pause
- **Touch Controls**: Swipe or on-screen buttons for mobile devices
- **Score System**: Real-time score tracking with milestone notifications
- **High Score Tracking**: Persistent high scores using localStorage
- **Near-Miss Bonus**: Earn extra points for close calls
- **Pause/Resume**: Full pause functionality with menu
- **Restart**: Quick restart option
- **Responsive Design**: Works on desktop and mobile devices
- **Smooth Animations**: Heavy-weight animations and visual effects
- **Countdown Start**: 3-2-1-GO! countdown before race begins
- **Particle Effects**: Explosion effects on crash
- **Speed Indicator**: Real-time speed display in km/h
- **Nitro Boost Visuals**: Visual effects at high speeds

## 🚀 Live Demo

Play the game online: **[https://yourusername.github.io/f1-racing-game/](https://yourusername.github.io/f1-racing-game/)**

*(Replace `yourusername` with your actual GitHub username)*

## 🛠️ Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS 4** - Styling
- **Canvas API** - Game rendering
- **GitHub Actions** - CI/CD deployment

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/f1-racing-game.git
cd f1-racing-game

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 🎯 How to Play

### Desktop Controls
- **← → Arrow Keys** or **A/D**: Steer left/right
- **Space** or **Esc**: Pause/Resume
- **R**: Restart game

### Mobile Controls
- **Swipe Left/Right**: Steer
- **On-screen buttons**: Tap to steer left/right
- **Pause button**: Top center of screen

### Game Rules
1. Avoid crashing into other cars, trucks, and barriers
2. Earn points for distance traveled
3. Get bonus points for near-misses (+50 points)
4. Score milestones unlock special notifications
5. Speed increases over time
6. Game ends when you crash

## 🎨 Difficulty Levels

| Level | Speed | Spawn Rate | Max Obstacles | Lanes |
|-------|-------|------------|---------------|-------|
| Easy | 3 | 1800ms | 3 | 3 |
| Medium | 5 | 1200ms | 5 | 4 |
| Hard | 7 | 800ms | 7 | 5 |

## 🚢 Deployment to GitHub Pages

### Automatic Deployment (Recommended)

This project is configured for automatic deployment using GitHub Actions.

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Initial commit: F1 Racing Game"
   git push origin main
   ```

2. **Enable GitHub Pages**:
   - Go to your repository on GitHub
   - Navigate to **Settings** → **Pages**
   - Under "Source", select **GitHub Actions**
   - The workflow will automatically deploy on every push to `main`

3. **Access your game**:
   - URL: `https://yourusername.github.io/f1-racing-game/`

### Manual Deployment

```bash
# Build the project
npm run build

# Deploy dist folder to gh-pages branch
npx gh-pages -d dist
```

## ⚙️ Configuration

### GitHub Pages Base Path

The `vite.config.js` file is configured with:
```javascript
base: '/f1-racing-game/'
```

**Important**: Replace `'f1-racing-game'` with your actual GitHub repository name.

### GitHub Actions Workflow

The deployment workflow is located at `.github/workflows/deploy.yml` and includes:
- Automatic builds on push to `main`
- Node.js 20 setup
- Dependency installation
- Production build
- Deployment to GitHub Pages

## 📁 Project Structure

```
f1-racing-game/
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions workflow
├── src/
│   ├── components/
│   │   ├── Game.tsx            # Main game component
│   │   ├── StartScreen.tsx     # Start menu
│   │   └── GameOverScreen.tsx  # Game over screen
│   ├── App.tsx                 # Main app component
│   ├── types.ts                # TypeScript types
│   ├── index.css               # Global styles
│   └── main.tsx                # Entry point
├── index.html                  # HTML template
├── package.json                # Dependencies
├── vite.config.js              # Vite configuration
├── tsconfig.json               # TypeScript configuration
└── README.md                   # This file
```

## 🎮 Game Features in Detail

### Scoring System
- **Base Score**: Increases based on speed and time
- **Near-Miss Bonus**: +50 points for close calls
- **Milestones**: Special notifications at 500, 1000, 2500, 5000, 10000, 25000, 50000 points

### Visual Effects
- **Particle Explosions**: On crash
- **Speed Lines**: At high speeds
- **Nitro Boost Glow**: When speed > 8
- **Road Animations**: Moving lane markers and curbs
- **Car Details**: F1-style cars with wheels, lights, and racing stripes

### Obstacles
- **Cars**: Standard vehicles in various colors
- **Trucks**: Larger vehicles
- **Barriers**: Yellow/black striped barriers

## 🔧 Development

```bash
# Start dev server
npm run dev

# Type checking
npm run typecheck

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📱 Browser Support

- Chrome/Edge (recommended)
- Firefox
- Safari
- Mobile browsers (iOS Safari, Chrome Mobile)

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest new features
- Submit pull requests

## 📄 License

This project is open source and available under the MIT License.

## 🙏 Credits

Created with ❤️ using React, TypeScript, and Tailwind CSS

---

**Enjoy the game! 🏁**
