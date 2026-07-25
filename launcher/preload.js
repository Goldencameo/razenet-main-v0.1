const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Auth
  authLogin: (email, password) => ipcRenderer.invoke('auth-login', email, password),
  authCheck: () => ipcRenderer.invoke('auth-check'),
  authLogout: () => ipcRenderer.invoke('auth-logout'),
  
  // Games
  getGames: () => ipcRenderer.invoke('get-games'),
  launchGame: (gameId) => ipcRenderer.invoke('launch-game', gameId),
  downloadGame: (gameId, gameUrl) => ipcRenderer.invoke('download-game', gameId, gameUrl),
  
  // Utilities
  openExternal: (url) => ipcRenderer.invoke('open-external', url)
});
