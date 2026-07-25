const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const axios = require('axios');
const Store = require('electron-store');

const store = new Store();
let mainWindow;

// Supabase configuration
const SUPABASE_URL = 'https://your-supabase-url.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key';

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, 'assets', 'icon.png')
  });

  // Load the app
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, 'dist', 'index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// IPC handlers
ipcMain.handle('auth-login', async (event, email, password) => {
  try {
    const response = await axios.post(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      email,
      password
    }, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Content-Type': 'application/json'
      }
    });

    const { access_token, refresh_token, user } = response.data;
    store.set('auth', { access_token, refresh_token, user });
    
    return { success: true, user };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('auth-check', async () => {
  const auth = store.get('auth');
  if (auth && auth.access_token) {
    try {
      const response = await axios.get(`${SUPABASE_URL}/auth/v1/user`, {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${auth.access_token}`
        }
      });
      return { success: true, user: response.data };
    } catch (error) {
      // Token might be expired, try to refresh
      if (auth.refresh_token) {
        try {
          const response = await axios.post(`${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`, {
            refresh_token: auth.refresh_token
          }, {
            headers: {
              'apikey': SUPABASE_ANON_KEY,
              'Content-Type': 'application/json'
            }
          });

          const { access_token, refresh_token, user } = response.data;
          store.set('auth', { access_token, refresh_token, user });
          return { success: true, user };
        } catch (refreshError) {
          store.delete('auth');
          return { success: false };
        }
      }
      return { success: false };
    }
  }
  return { success: false };
});

ipcMain.handle('auth-logout', async () => {
  store.delete('auth');
  return { success: true };
});

ipcMain.handle('get-games', async () => {
  const auth = store.get('auth');
  if (!auth || !auth.access_token) {
    return { success: false, error: 'Not authenticated' };
  }

  try {
    const response = await axios.get(`${SUPABASE_URL}/rest/v1/games`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${auth.access_token}`
      }
    });
    return { success: true, games: response.data };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('launch-game', async (event, gameId) => {
  const auth = store.get('auth');
  if (!auth || !auth.access_token) {
    return { success: false, error: 'Not authenticated' };
  }

  // Check if game is installed
  const installedGames = store.get('installedGames', {});
  const gamePath = installedGames[gameId];

  if (gamePath && require('fs').existsSync(gamePath)) {
    // Launch the game
    const { spawn } = require('child_process');
    const gameProcess = spawn(gamePath, [`--token=${auth.access_token}`, `--game-id=${gameId}`], {
      detached: true,
      stdio: 'ignore'
    });
    gameProcess.unref();
    return { success: true };
  } else {
    return { success: false, error: 'Game not installed' };
  }
});

ipcMain.handle('download-game', async (event, gameId, gameUrl) => {
  // This would handle game download logic
  // For now, return a placeholder
  return { success: true, message: 'Download started' };
});

ipcMain.handle('open-external', async (event, url) => {
  shell.openExternal(url);
  return { success: true };
});
