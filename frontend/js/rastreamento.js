// Gerenciamento de Rastreamento

let map;
let markers = {};
let viaturaAtualSelecionada = null;

// Inicializar ao carregar
window.addEventListener('load', () => {
  if (!isAuthenticated()) {
    window.location.href = 'login.html';
    return;
  }
  inicializarMapa();
  carregarPosicoes();
  setInterval(carregarPosicoes, 5000); // Atualizar a cada 5 segundos
});

// Inicializar mapa
function inicializarMapa() {
  map = L.map('map').setView([-26.9187, -49.066], 13);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
    maxZoom: 19
  }).addTo(map);
}

// Carregar posições
async function carregarPosicoes() {
  try {
    const posicoes = await fetch(`${API_URL}/rastreamento/posicoes-atuais`, {
      headers: getHeaders()
    }).then(r => r.json());

    // Limpar markers antigos
    Object.values(markers).forEach(m => {
      if (map.hasLayer(m)) map.removeLayer(m);
    });
    markers = {};

    const tabela = document.getElementById('tabela-rastreamento');
    tabela.innerHTML = '';

    posicoes.forEach(pos => {
      // Adicionar marker no mapa
      const markerElement = L.marker([pos.latitude, pos.longitude])
        .addTo(map)
        .bindPopup(`
          <strong>${pos.prefixo}</strong><br>
          Placa: ${pos.placa}<br>
          Velocidade: ${pos.velocidade || 0} km/h<br>
          Última atualização: ${new Date(pos.data_hora).toLocaleTimeString('pt-BR')}
        `);
      
      markers[pos.viatura_id] = markerElement;

      // Adicionar linha na tabela
      const row = `
        <tr>
          <td><strong>${pos.prefixo}</strong></td>
          <td>${pos.placa}</td>
          <td><span class="badge bg-success">Online</span></td>
          <td>${pos.latitude.toFixed(4)}</td>
          <td>${pos.longitude.toFixed(4)}</td>
          <td>${pos.velocidade || 0} km/h</td>
          <td>${new Date(pos.data_hora).toLocaleTimeString('pt-BR')}</td>
          <td>
            <button class="btn btn-sm btn-info" onclick="abrirHistoricoRota(${pos.viatura_id}, '${pos.prefixo}')">Histórico</button>
          </td>
        </tr>
      `;
      tabela.innerHTML += row;
    });

    if (posicoes.length === 0) {
      tabela.innerHTML = '<tr><td colspan="8" class="text-center">Nenhuma viatura online</td></tr>';
    }
  } catch (error) {
    console.error('Erro ao carregar posições:', error);
  }
}

// Aplicar filtros
async function aplicarFiltros() {
  const filtroViatura = document.getElementById('filtro-viatura').value.toLowerCase();
  const filtroStatus = document.getElementById('filtro-status').value;

  try {
    const viaturas = await fetch(`${API_URL}/viaturas`, {
      headers: getHeaders()
    }).then(r => r.json());

    const posicoes = await fetch(`${API_URL}/rastreamento/posicoes-atuais`, {
      headers: getHeaders()
    }).then(r => r.json());

    // Filtrar viaturas
    const filtradas = posicoes.filter(pos => {
      const viatura = viaturas.find(v => v.id === pos.viatura_id);
      const atendeFiltroViatura = filtroViatura === '' || 
                                   pos.prefixo.toLowerCase().includes(filtroViatura) ||
                                   pos.placa.toLowerCase().includes(filtroViatura);
      const atendeFiltroStatus = filtroStatus === '' || viatura?.status === filtroStatus;
      return atendeFiltroViatura && atendeFiltroStatus;
    });

    // Limpar mapa
    Object.values(markers).forEach(m => {
      if (map.hasLayer(m)) map.removeLayer(m);
    });
    markers = {};

    // Renderizar filtrados
    filtradas.forEach(pos => {
      const markerElement = L.marker([pos.latitude, pos.longitude]).addTo(map);
      markers[pos.viatura_id] = markerElement;
    });

    alert(`${filtradas.length} viaturas encontradas`);
  } catch (error) {
    console.error('Erro ao filtrar:', error);
  }
}

// Abrir histórico de rota
function abrirHistoricoRota(viaturaId, prefixo) {
  viaturaAtualSelecionada = viaturaId;
  document.querySelector('#modalHistoricoRota .modal-title').innerText = `Histórico de Rota - ${prefixo}`;
  new bootstrap.Modal(document.getElementById('modalHistoricoRota')).show();
}

// Carregar histórico de rota
async function carregarHistoricoRota() {
  if (!viaturaAtualSelecionada) {
    alert('Selecione uma viatura');
    return;
  }

  const dataInicio = document.getElementById('data-inicio').value;
  const dataFim = document.getElementById('data-fim').value;

  if (!dataInicio || !dataFim) {
    alert('Selecione as datas');
    return;
  }

  try {
    const url = new URL(`${API_URL}/rastreamento/historico/${viaturaAtualSelecionada}`);
    url.searchParams.append('dataInicio', dataInicio + 'T00:00:00');
    url.searchParams.append('dataFim', dataFim + 'T23:59:59');

    const historico = await fetch(url, {
      headers: getHeaders()
    }).then(r => r.json());

    const tabela = document.getElementById('tabela-rota');
    tabela.innerHTML = '';

    if (historico.length === 0) {
      tabela.innerHTML = '<tr><td colspan="4" class="text-center">Sem dados para este período</td></tr>';
      return;
    }

    historico.forEach(h => {
      const row = `
        <tr>
          <td>${new Date(h.data_hora).toLocaleString('pt-BR')}</td>
          <td>${h.latitude.toFixed(4)}</td>
          <td>${h.longitude.toFixed(4)}</td>
          <td>${h.velocidade || 0}</td>
        </tr>
      `;
      tabela.innerHTML += row;
    });

    // Calcular distância e tempo
    let distanciaTotal = 0;
    for (let i = 0; i < historico.length - 1; i++) {
      distanciaTotal += calcularDistancia(
        historico[i].latitude, historico[i].longitude,
        historico[i + 1].latitude, historico[i + 1].longitude
      );
    }

    console.log(`Distância percorrida: ${distanciaTotal.toFixed(2)} km`);
  } catch (error) {
    console.error('Erro ao carregar histórico:', error);
    alert('Erro ao carregar histórico');
  }
}

// Calcular distância entre dois pontos (Haversine)
function calcularDistancia(lat1, lon1, lat2, lon2) {
  const R = 6371; // Raio da Terra em km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Funções globais
window.aplicarFiltros = aplicarFiltros;
window.abrirHistoricoRota = abrirHistoricoRota;
window.carregarHistoricoRota = carregarHistoricoRota;