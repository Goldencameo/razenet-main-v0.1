// DOM Elements
const loginPage = document.getElementById('loginPage');
const gamesPage = document.getElementById('gamesPage');
const libraryPage = document.getElementById('libraryPage');
const settingsPage = document.getElementById('settingsPage');
const sidebar = document.getElementById('sidebar');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const loginBtn = document.getElementById('loginBtn');
const errorMessage = document.getElementById('errorMessage');
const gamesGrid = document.getElementById('gamesGrid');
const libraryGrid = document.getElementById('libraryGrid');
const userAvatar = document.getElementById('userAvatar');
const userName = document.getElementById('userName');
const logoutBtn = document.getElementById('logoutBtn');
const navItems = document.querySelectorAll('.nav-item');

// Check authentication on load
async function checkAuth() {
  const result = await window.electronAPI.authCheck();
  if (result.success) {
    showMainApp(result.user);
    loadGames();
  } else {
    showLoginPage();
  }
}

// Show login page
function showLoginPage() {
  loginPage.classList.add('active');
  gamesPage.classList.remove('active');
  libraryPage.classList.remove('active');
  settingsPage.classList.remove('active');
  sidebar.style.display = 'none';
}

// Show main app
function showMainApp(user) {
  loginPage.classList.remove('active');
  gamesPage.classList.add('active');
  sidebar.style.display = 'flex';
  
  userName.textContent = user.display_name || user.username || 'Player';
  userAvatar.textContent = (user.display_name || user.username || '?')[0].toUpperCase();
}

// Load games
async function loadGames() {
  gamesGrid.innerHTML = '<div class="loading">Loading games...</div>';
  
  const result = await window.electronAPI.getGames();
  if (result.success) {
    renderGames(result.games);
  } else {
    gamesGrid.innerHTML = `<div class="loading">Error loading games: ${result.error}</div>`;
  }
}

// Render games
function renderGames(games) {
  if (!games || games.length === 0) {
    gamesGrid.innerHTML = '<div class="loading">No games available</div>';
    return;
  }

  gamesGrid.innerHTML = games.map(game => `
    <div class="game-card">
      <div class="game-image">${game.name}</div>
      <div class="game-info">
        <div class="game-title">${game.name}</div>
        <div class="game-description">${game.description || 'No description available'}</div>
        <div class="game-actions">
          <button class="play-btn" onclick="launchGame('${game.id}')">Play</button>
          <button class="download-btn" onclick="downloadGame('${game.id}')">Download</button>
        </div>
      </div>
    </div>
  `).join('');
}

// Login handler
loginBtn.addEventListener('click', async () => {
  const email = emailInput.value;
  const password = passwordInput.value;
  
  if (!email || !password) {
    errorMessage.textContent = 'Please fill in all fields';
    return;
  }

  loginBtn.disabled = true;
  loginBtn.textContent = 'Logging in...';
  errorMessage.textContent = '';

  const result = await window.electronAPI.authLogin(email, password);
  
  if (result.success) {
    showMainApp(result.user);
    loadGames();
  } else {
    errorMessage.textContent = result.error || 'Login failed';
    loginBtn.disabled = false;
    loginBtn.textContent = 'Login';
  }
});

// Logout handler
logoutBtn.addEventListener('click', async () => {
  await window.electronAPI.authLogout();
  showLoginPage();
  emailInput.value = '';
  passwordInput.value = '';
  errorMessage.textContent = '';
});

// Navigation
navItems.forEach(item => {
  item.addEventListener('click', () => {
    navItems.forEach(i => i.classList.remove('active'));
    item.classList.add('active');
    
    const page = item.dataset.page;
    gamesPage.classList.remove('active');
    libraryPage.classList.remove('active');
    settingsPage.classList.remove('active');
    
    if (page === 'games') {
      gamesPage.classList.add('active');
    } else if (page === 'library') {
      libraryPage.classList.add('active');
    } else if (page === 'settings') {
      settingsPage.classList.add('active');
    }
  });
});

// Launch game
window.launchGame = async (gameId) => {
  const result = await window.electronAPI.launchGame(gameId);
  if (!result.success) {
    alert(result.error || 'Failed to launch game');
  }
};

// Download game
window.downloadGame = async (gameId) => {
  const result = await window.electronAPI.downloadGame(gameId);
  if (result.success) {
    alert('Download started!');
  } else {
    alert(result.error || 'Failed to start download');
  }
};

// Enter key to login
passwordInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    loginBtn.click();
  }
});

// Initialize
checkAuth();
