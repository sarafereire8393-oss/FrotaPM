// Gerenciamento de Viaturas

// Carregar lista de viaturas
async function carregarViaturas() {
  if (!isAuthenticated()) {
    window.location.href = 'index.html';
    return;
  }

  try {
    const viaturas = await fetch(`${API_URL}/viaturas`, {
      headers: getHeaders()
    }).then(r => r.json());

    const tabela = document.getElementById('tabela-viaturas');
    tabela.innerHTML = '';

    viaturas.forEach(v => {
      const row = `
        <tr>
          <td>${v.prefixo}</td>
          <td>${v.placa}</td>
          <td>${v.modelo}</td>
          <td>${v.ano}</td>
          <td>${v.km}</td>
          <td><span class="badge bg-${v.status === 'operacional' ? 'success' : 'danger'}">${v.status}</span></td>
          <td>
            <button class="btn btn-sm btn-info" onclick="editarViatura(${v.id})">Editar</button>
            <button class="btn btn-sm btn-danger" onclick="deletarViatura(${v.id})">Deletar</button>
            <button class="btn btn-sm btn-primary" onclick="visualizarHistorico(${v.id})">Histórico</button>
          </td>
        </tr>
      `;
      tabela.innerHTML += row;
    });
  } catch (error) {
    console.error('Erro ao carregar viaturas:', error);
  }
}

// Criar nova viatura
async function criarViatura() {
  const formData = {
    prefixo: document.getElementById('prefixo').value,
    placa: document.getElementById('placa').value,
    modelo: document.getElementById('modelo').value,
    ano: parseInt(document.getElementById('ano').value),
    chassi: document.getElementById('chassi').value,
    km: parseFloat(document.getElementById('km').value),
    unidade: document.getElementById('unidade').value,
    status: document.getElementById('status').value
  };

  try {
    const response = await fetch(`${API_URL}/viaturas`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(formData)
    });

    if (!response.ok) throw new Error('Erro ao criar viatura');

    alert('Viatura criada com sucesso!');
    document.getElementById('form-viatura').reset();
    carregarViaturas();
  } catch (error) {
    console.error('Erro:', error);
    alert('Erro ao criar viatura');
  }
}

// Editar viatura
async function editarViatura(id) {
  // Redirecionar para página de edição
  window.location.href = `editar-viatura.html?id=${id}`;
}

// Atualizar viatura
async function atualizarViatura(id) {
  const formData = {
    prefixo: document.getElementById('prefixo').value,
    placa: document.getElementById('placa').value,
    modelo: document.getElementById('modelo').value,
    ano: parseInt(document.getElementById('ano').value),
    chassi: document.getElementById('chassi').value,
    km: parseFloat(document.getElementById('km').value),
    unidade: document.getElementById('unidade').value,
    status: document.getElementById('status').value
  };

  try {
    const response = await fetch(`${API_URL}/viaturas/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(formData)
    });

    if (!response.ok) throw new Error('Erro ao atualizar viatura');

    alert('Viatura atualizada com sucesso!');
    window.location.href = 'viaturas.html';
  } catch (error) {
    console.error('Erro:', error);
    alert('Erro ao atualizar viatura');
  }
}

// Deletar viatura
async function deletarViatura(id) {
  if (!confirm('Tem certeza que deseja deletar essa viatura?')) return;

  try {
    const response = await fetch(`${API_URL}/viaturas/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });

    if (!response.ok) throw new Error('Erro ao deletar viatura');

    alert('Viatura deletada com sucesso!');
    carregarViaturas();
  } catch (error) {
    console.error('Erro:', error);
    alert('Erro ao deletar viatura');
  }
}

// Visualizar histórico da viatura
async function visualizarHistorico(id) {
  window.location.href = `historico-viatura.html?id=${id}`;
}

window.addEventListener('load', carregarViaturas);
