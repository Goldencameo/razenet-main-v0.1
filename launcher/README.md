# RazeHub Launcher

Desktop launcher for RazeHub games platform.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure Supabase:
   - Open `main.js`
   - Replace `SUPABASE_URL` with your Supabase project URL
   - Replace `SUPABASE_ANON_KEY` with your Supabase anon key

3. Run in development:
```bash
npm start
```

4. Build for production:
```bash
# Windows
npm run build-win

# macOS
npm run build-mac

# Linux
npm run build-linux
```

## Features

- User authentication with Supabase
- Game library browsing
- Game download and launch
- Settings management
- Cross-platform support (Windows, macOS, Linux)

## Architecture

- **Main Process** (`main.js`): Handles system operations, authentication, game launching
- **Preload Script** (`preload.js`): Secure bridge between main and renderer processes
- **Renderer Process** (`index.html`, `renderer.js`): UI and user interactions

## Game Integration

Games should be exported as executables that accept command-line arguments:
- `--token=<auth_token>`: Authentication token
- `--game-id=<game_id>`: Game identifier

The launcher will pass these arguments when launching a game.
