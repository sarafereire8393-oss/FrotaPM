// FrotaPM - Main Application
const API_URL = 'http://localhost:3000/api';
let token = localStorage.getItem('token');

// Verificar autenticação
function isAuthenticated() {
  return !!token;
}

// Fazer login
async function login(email, senha) {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, senha })
    });

    if (!response.ok) throw new Error('Falha no login');

    const data = await response.json();
    token = data.token;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(data.user));
    window.location.href = 'dashboard.html';
  } catch (error) {
    console.error('Erro no login:', error);
    alert('Email ou senha inválidos');
  }
}

// Fazer logout
function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = 'index.html';
}

// Headers com autenticação
function getHeaders() {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
}

// Service Worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').catch(err => console.log('SW registration failed:', err));
}
