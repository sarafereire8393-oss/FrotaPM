// Dashboard

let map;
let markers = {};

// Carregar dados do dashboard
async function carregarDashboard() {
  if (!isAuthenticated()) {
    window.location.href = 'login.html';
    return;
  }

  try {
    // Carregar viaturas
    const viaturas = await fetch(`${API_URL}/viaturas`, {
      headers: getHeaders()
    }).then(r => r.json());

    // Carregar manutenções
    const manutencoes = await fetch(`${API_URL}/manutencao`, {
      headers: getHeaders()
    }).then(r => r.json());

    // Calcular indicadores
    const total = viaturas.length;
    const operacionais = viaturas.filter(v => v.status === 'operacional').length;
    const manutencao = viaturas.filter(v => v.status === 'manutencao').length;
    const paradas = viaturas.filter(v => v.status === 'parada').length;
    const disponibilidade = total > 0 ? ((operacionais / total) * 100).toFixed(2) : 0;

    // Calcular custos
    const totalCustos = manutencoes.reduce((sum, m) => sum + (parseFloat(m.custo) || 0), 0);
    const custosEste = totalCustos.toFixed(2);

    // Calcular manutenções esse mês
    const agora = new Date();
    const mesAtual = manutencoes.filter(m => {
      const data = new Date(m.data);
      return data.getMonth() === agora.getMonth() && data.getFullYear() === agora.getFullYear();
    }).length;

    // Atualizar indicadores
    document.getElementById('total-viaturas').innerText = total;
    document.getElementById('viaturas-operacionais').innerText = operacionais;
    document.getElementById('viaturas-manutencao').innerText = manutencao;
    document.getElementById('viaturas-paradas').innerText = paradas;
    document.getElementById('disponibilidade').innerText = disponibilidade + '%';
    document.getElementById('custos-mes').innerText = `R$ ${custosEste}`;
    document.getElementById('manutencoes-mes').innerText = mesAtual;

    // Inicializar mapa
    inicializarMapa();
    carregarPosicoes();
  } catch (error) {
    console.error('Erro ao carregar dashboard:', error);
  }
}

// Inicializar mapa
function inicializarMapa() {
  if (document.getElementById('map')) {
    map = L.map('map').setView([-26.9187, -49.066], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(map);
  }
}

// Carregar posições das viaturas
async function carregarPosicoes() {
  try {
    const posicoes = await fetch(`${API_URL}/rastreamento/posicoes-atuais`, {
      headers: getHeaders()
    }).then(r => r.json());

    if (!map) return;

    // Limpar markers antigos
    Object.values(markers).forEach(m => {
      if (map.hasLayer(m)) map.removeLayer(m);
    });
    markers = {};

    // Adicionar novos markers
    posicoes.forEach(pos => {
      const marker = L.marker([pos.latitude, pos.longitude])
        .addTo(map)
        .bindPopup(`
          <strong>${pos.prefixo}</strong><br>
          Placa: ${pos.placa}<br>
          Velocidade: ${pos.velocidade || 0} km/h<br>
          Última atualização: ${new Date(pos.data_hora).toLocaleTimeString('pt-BR')}
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