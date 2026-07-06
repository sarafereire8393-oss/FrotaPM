// Dashboard

let map;
let markers = {};

// Carregar dados do dashboard
async function carregarDashboard() {
  if (!isAuthenticated()) {
    window.location.href = 'index.html';
    return;
  }

  try {
    // Carregar viaturas
    const viaturas = await fetch(`${API_URL}/viaturas`, {
      headers: getHeaders()
    }).then(r => r.json());

    // Calcular indicadores
    const total = viaturas.length;
    const operacionais = viaturas.filter(v => v.status === 'operacional').length;
    const manutencao = viaturas.filter(v => v.status === 'manutencao').length;
    const disponibilidade = ((operacionais / total) * 100).toFixed(2);

    // Atualizar indicadores
    document.getElementById('total-viaturas').innerText = total;
    document.getElementById('viaturas-operacionais').innerText = operacionais;
    document.getElementById('viaturas-manutencao').innerText = manutencao;
    document.getElementById('disponibilidade').innerText = disponibilidade + '%';

    // Inicializar mapa
    inicializarMapa();
    carregarPosicoes();
  } catch (error) {
    console.error('Erro ao carregar dashboard:', error);
  }
}

// Inicializar mapa
function inicializarMapa() {
  map = L.map('map').setView([-26.9187, -49.066], 13);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
    maxZoom: 19
  }).addTo(map);
}

// Carregar posições das viaturas
async function carregarPosicoes() {
  try {
    const posicoes = await fetch(`${API_URL}/rastreamento/posicoes-atuais`, {
      headers: getHeaders()
    }).then(r => r.json());

    // Limpar markers antigos
    Object.values(markers).forEach(m => map.removeLayer(m));
    markers = {};

    // Adicionar novos markers
    posicoes.forEach(pos => {
      const marker = L.marker([pos.latitude, pos.longitude])
        .addTo(map)
        .bindPopup(`
          <strong>${pos.prefixo}</strong><br>
          Placa: ${pos.placa}<br>
          Velocidade: ${pos.velocidade || 0} km/h<br>
          Última atualização: ${new Date(pos.data_hora).toLocaleString('pt-BR')}
        `);
      markers[pos.viatura_id] = marker;
    });
  } catch (error) {
    console.error('Erro ao carregar posições:', error);
  }
}

// Atualizar posições a cada 5 segundos
setInterval(carregarPosicoes, 5000);

// Carregar dashboard ao iniciar
window.addEventListener('load', carregarDashboard);
