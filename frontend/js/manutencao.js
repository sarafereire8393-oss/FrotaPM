// Gerenciamento de Manutenção

let manutencaoEmEdicao = null;
const tiposManutencao = ['Troca de óleo', 'Troca de pneus', 'Revisão de freios', 'Revisão de suspensão', 'Revisão geral', 'Licenciamento', 'Seguro'];

// Carregar dados ao iniciar
window.addEventListener('load', () => {
  if (!isAuthenticated()) {
    window.location.href = 'login.html';
    return;
  }
  carregarViaturas();
  carregarManutencoes();
  carregarAlertas();
});

// Carregar viaturas no select
async function carregarViaturas() {
  try {
    const viaturas = await fetch(`${API_URL}/viaturas`, {
      headers: getHeaders()
    }).then(r => r.json());

    const select = document.getElementById('viatura_id');
    select.innerHTML = '<option value="">Selecione uma viatura</option>';

    viaturas.forEach(v => {
      const option = document.createElement('option');
      option.value = v.id;
      option.innerText = `${v.prefixo} - ${v.placa}`;
      select.appendChild(option);
    });
  } catch (error) {
    console.error('Erro ao carregar viaturas:', error);
  }
}

// Carregar manutenções
async function carregarManutencoes() {
  try {
    const manutencoes = await fetch(`${API_URL}/manutencao`, {
      headers: getHeaders()
    }).then(r => r.json());

    const tabela = document.getElementById('tabela-manutencao');
    tabela.innerHTML = '';

    if (manutencoes.length === 0) {
      tabela.innerHTML = '<tr><td colspan="7" class="text-center">Nenhuma manutenção registrada</td></tr>';
      return;
    }

    manutencoes.forEach(m => {
      const row = `
        <tr>
          <td><strong>${m.prefixo}</strong></td>
          <td>${m.tipo}</td>
          <td>${m.descricao || '-'}</td>
          <td>${new Date(m.data).toLocaleDateString('pt-BR')}</td>
          <td>R$ ${parseFloat(m.custo || 0).toFixed(2)}</td>
          <td>${m.responsavel || '-'}</td>
          <td>
            <button class="btn btn-sm btn-info" onclick="abrirEdicaoManutencao(${m.id})">Editar</button>
            <button class="btn btn-sm btn-danger" onclick="deletarManutencao(${m.id})">Deletar</button>
          </td>
        </tr>
      `;
      tabela.innerHTML += row;
    });
  } catch (error) {
    console.error('Erro ao carregar manutenções:', error);
  }
}

// Carregar alertas de manutenção
async function carregarAlertas() {
  try {
    const manutencoes = await fetch(`${API_URL}/manutencao`, {
      headers: getHeaders()
    }).then(r => r.json());

    const hoje = new Date();
    const alertasContainer = document.getElementById('alertas-container');
    alertasContainer.innerHTML = '';

    const alertas = [];

    manutencoes.forEach(m => {
      if (m.proxima_manutencao) {
        const proxima = new Date(m.proxima_manutencao);
        const diasRestantes = Math.ceil((proxima - hoje) / (1000 * 60 * 60 * 24));

        if (diasRestantes < 0) {
          alertas.push({
            viatura: m.prefixo,
            tipo: m.tipo,
            status: 'urgent',
            mensagem: `Manutenção de ${m.tipo.toLowerCase()} ATRASADA!`
          });
        } else if (diasRestantes <= 15) {
          alertas.push({
            viatura: m.prefixo,
            tipo: m.tipo,
            status: 'warning',
            mensagem: `${m.tipo} vence em ${diasRestantes} dias`
          });
        } else {
          alertas.push({
            viatura: m.prefixo,
            tipo: m.tipo,
            status: 'ok',
            mensagem: `${m.tipo} em dia`
          });
        }
      }
    });

    if (alertas.length === 0) {
      alertasContainer.innerHTML = '<p class="text-muted">Nenhum alerta</p>';
      return;
    }

    alertas.forEach(alerta => {
      const alertClass = alerta.status === 'urgent' ? 'alert-urgent' : 
                         alerta.status === 'warning' ? 'alert-warning' : 'alert-ok';
      const icon = alerta.status === 'urgent' ? '🔴' : 
                   alerta.status === 'warning' ? '🟡' : '🟢';
      
      alertasContainer.innerHTML += `
        <div class="alert ${alertClass} mb-2">
          ${icon} <strong>${alerta.viatura}</strong> - ${alerta.mensagem}
        </div>
      `;
    });
  } catch (error) {
    console.error('Erro ao carregar alertas:', error);
  }
}

// Criar nova manutenção
async function criarManutencao() {
  const formData = {
    viatura_id: parseInt(document.getElementById('viatura_id').value),
    tipo: document.getElementById('tipo').value,
    descricao: document.getElementById('descricao').value,
    data: document.getElementById('data').value,
    custo: parseFloat(document.getElementById('custo').value || 0),
    responsavel: document.getElementById('responsavel').value,
    proxima_manutencao: document.getElementById('proxima_manutencao').value
  };

  if (!formData.viatura_id || !formData.tipo || !formData.data) {
    alert('Preencha os campos obrigatórios');
    return;
  }

  try {
    const response = await fetch(`${API_URL}/manutencao`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(formData)
    });

    if (!response.ok) throw new Error('Erro ao criar manutenção');

    alert('Manutenção registrada com sucesso!');
    document.getElementById('form-manutencao').reset();
    carregarManutencoes();
    carregarAlertas();
  } catch (error) {
    console.error('Erro:', error);
    alert('Erro ao registrar manutenção');
  }
}

// Atualizar manutenção
async function atualizarManutencao(id) {
  const formData = {
    viatura_id: parseInt(document.getElementById('viatura_id').value),
    tipo: document.getElementById('tipo').value,
    descricao: document.getElementById('descricao').value,
    data: document.getElementById('data').value,
    custo: parseFloat(document.getElementById('custo').value || 0),
    responsavel: document.getElementById('responsavel').value,
    proxima_manutencao: document.getElementById('proxima_manutencao').value
  };

  try {
    const response = await fetch(`${API_URL}/manutencao/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(formData)
    });

    if (!response.ok) throw new Error('Erro ao atualizar manutenção');

    alert('Manutenção atualizada com sucesso!');
    carregarManutencoes();
    carregarAlertas();
  } catch (error) {
    console.error('Erro:', error);
    alert('Erro ao atualizar manutenção');
  }
}

// Abrir edição
async function abrirEdicaoManutencao(id) {
  try {
    const response = await fetch(`${API_URL}/manutencao`, {
      headers: getHeaders()
    }).then(r => r.json());

    const manutencao = response.find(m => m.id === id);
    if (!manutencao) {
      alert('Manutenção não encontrada');
      return;
    }

    document.getElementById('viatura_id').value = manutencao.viatura_id;
    document.getElementById('tipo').value = manutencao.tipo;
    document.getElementById('descricao').value = manutencao.descricao;
    document.getElementById('data').value = manutencao.data.split('T')[0];
    document.getElementById('custo').value = manutencao.custo;
    document.getElementById('responsavel').value = manutencao.responsavel;
    document.getElementById('proxima_manutencao').value = manutencao.proxima_manutencao?.split('T')[0] || '';

    manutencaoEmEdicao = id;
    new bootstrap.Modal(document.getElementById('modalManutencao')).show();
  } catch (error) {
    console.error('Erro:', error);
    alert('Erro ao carregar dados');
  }
}

// Deletar manutenção
async function deletarManutencao(id) {
  if (!confirm('Deseja deletar essa manutenção?')) return;

  try {
    const response = await fetch(`${API_URL}/manutencao/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });

    if (!response.ok) throw new Error('Erro ao deletar');

    alert('Manutenção deletada com sucesso!');
    carregarManutencoes();
    carregarAlertas();
  } catch (error) {
    console.error('Erro:', error);
    alert('Erro ao deletar manutenção');
  }
}

// Event listeners
document.getElementById('modalManutencao').addEventListener('show.bs.modal', function() {
  manutencaoEmEdicao = null;
  document.getElementById('form-manutencao').reset();
});

document.getElementById('btnSalvarManutencao').addEventListener('click', async () => {
  if (manutencaoEmEdicao) {
    await atualizarManutencao(manutencaoEmEdicao);
  } else {
    await criarManutencao();
  }
  bootstrap.Modal.getInstance(document.getElementById('modalManutencao')).hide();
});

// Funções globais
window.abrirEdicaoManutencao = abrirEdicaoManutencao;
window.deletarManutencao = deletarManutencao;