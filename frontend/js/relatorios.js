// Gerenciamento de Relatórios

let ultimosDadosRelatorio = [];

// Inicializar ao carregar
window.addEventListener('load', () => {
  if (!isAuthenticated()) {
    window.location.href = 'login.html';
    return;
  }
  carregarViaturasPraRelatorios();
  
  // Pré-preencher com mês atual
  const hoje = new Date();
  const primeiraData = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  
  document.getElementById('manutencao-data-inicio').valueAsDate = primeiraData;
  document.getElementById('manutencao-data-fim').valueAsDate = hoje;
  document.getElementById('financeiro-data-inicio').valueAsDate = primeiraData;
  document.getElementById('financeiro-data-fim').valueAsDate = hoje;
});

// Carregar viaturas para select
async function carregarViaturasPraRelatorios() {
  try {
    const viaturas = await fetch(`${API_URL}/viaturas`, {
      headers: getHeaders()
    }).then(r => r.json());

    const select = document.getElementById('manutencao-viatura');
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

// Gerar Relatório de Manutenção
async function gerarRelatorioManutencao() {
  const dataInicio = document.getElementById('manutencao-data-inicio').value;
  const dataFim = document.getElementById('manutencao-data-fim').value;
  const viaturaId = document.getElementById('manutencao-viatura').value;

  if (!dataInicio || !dataFim) {
    alert('Selecione as datas');
    return;
  }

  try {
    const url = new URL(`${API_URL}/relatorios/manutencao`);
    url.searchParams.append('dataInicio', dataInicio + 'T00:00:00');
    url.searchParams.append('dataFim', dataFim + 'T23:59:59');
    if (viaturaId) url.searchParams.append('viatura_id', viaturaId);

    const resultado = await fetch(url, {
      headers: getHeaders()
    }).then(r => r.json());

    ultimosDadosRelatorio = resultado;
    exibirResultados('Relatório de Manutenção', resultado);
  } catch (error) {
    console.error('Erro:', error);
    alert('Erro ao gerar relatório');
  }
}

// Gerar Relatório de Disponibilidade
async function gerarRelatorioDisponibilidade() {
  try {
    const resultado = await fetch(`${API_URL}/relatorios/disponibilidade`, {
      headers: getHeaders()
    }).then(r => r.json());

    ultimosDadosRelatorio = resultado;

    // Calcular percentuais
    const total = resultado.reduce((sum, r) => sum + r.quantidade, 0);
    const dados = resultado.map(r => ({
      ...r,
      percentual: ((r.quantidade / total) * 100).toFixed(2)
    }));

    exibirResultados('Relatório de Disponibilidade', dados);
  } catch (error) {
    console.error('Erro:', error);
    alert('Erro ao gerar relatório');
  }
}

// Gerar Relatório Financeiro
async function gerarRelatorioFinanceiro() {
  const dataInicio = document.getElementById('financeiro-data-inicio').value;
  const dataFim = document.getElementById('financeiro-data-fim').value;

  if (!dataInicio || !dataFim) {
    alert('Selecione as datas');
    return;
  }

  try {
    const url = new URL(`${API_URL}/relatorios/financeiro`);
    url.searchParams.append('dataInicio', dataInicio + 'T00:00:00');
    url.searchParams.append('dataFim', dataFim + 'T23:59:59');

    const resultado = await fetch(url, {
      headers: getHeaders()
    }).then(r => r.json());

    ultimosDadosRelatorio = resultado;

    // Adicionar total
    const total = resultado.reduce((sum, r) => sum + parseFloat(r.total_gasto || 0), 0);
    resultado.push({
      prefixo: 'TOTAL',
      total_gasto: total.toFixed(2)
    });

    exibirResultados('Relatório Financeiro', resultado);
  } catch (error) {
    console.error('Erro:', error);
    alert('Erro ao gerar relatório');
  }
}

// Exibir resultados
function exibirResultados(titulo, dados) {
  const cardResultados = document.getElementById('card-resultados');
  const tituloResultados = document.getElementById('titulo-resultados');
  const tabelaResultados = document.getElementById('tabela-resultados');

  tituloResultados.innerText = titulo;
  tabelaResultados.innerHTML = '';

  if (dados.length === 0) {
    tabelaResultados.innerHTML = '<tr><td class="text-center">Nenhum dado disponível</td></tr>';
    cardResultados.style.display = 'block';
    return;
  }

  // Criar cabeçalho
  const thead = document.createElement('thead');
  const keys = Object.keys(dados[0]);
  const headerRow = document.createElement('tr');
  keys.forEach(key => {
    const th = document.createElement('th');
    th.innerText = key.replace(/_/g, ' ').toUpperCase();
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);
  tabelaResultados.appendChild(thead);

  // Criar corpo
  const tbody = document.createElement('tbody');
  dados.forEach(linha => {
    const tr = document.createElement('tr');
    keys.forEach(key => {
      const td = document.createElement('td');
      const valor = linha[key];
      
      if (typeof valor === 'number' && key.includes('custo')) {
        td.innerText = `R$ ${parseFloat(valor).toFixed(2)}`;
      } else if (key.includes('data')) {
        td.innerText = new Date(valor).toLocaleDateString('pt-BR');
      } else {
        td.innerText = valor || '-';
      }
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
  tabelaResultados.appendChild(tbody);

  cardResultados.style.display = 'block';
}

// Exportar CSV
function exportarCSV() {
  if (ultimosDadosRelatorio.length === 0) {
    alert('Gere um relatório primeiro');
    return;
  }

  const dados = ultimosDadosRelatorio;
  const keys = Object.keys(dados[0]);
  let csv = keys.join(',') + '\n';

  dados.forEach(linha => {
    const values = keys.map(key => linha[key]);
    csv += values.join(',') + '\n';
  });

  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `relatorio-${new Date().getTime()}.csv`;
  a.click();
}

// Exportar PDF (simulado com impressão)
function exportarPDF() {
  if (ultimosDadosRelatorio.length === 0) {
    alert('Gere um relatório primeiro');
    return;
  }

  const titulo = document.getElementById('titulo-resultados').innerText;
  const tabela = document.getElementById('tabela-resultados').outerHTML;

  const janelaImpressao = window.open('', '', 'height=600,width=800');
  janelaImpressao.document.write(`
    <html>
      <head>
        <title>${titulo}</title>
        <style>
          body { font-family: Arial, sans-serif; }
          h1 { text-align: center; color: #007bff; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
          th { background-color: #007bff; color: white; }
          tr:nth-child(even) { background-color: #f5f5f5; }
        </style>
      </head>
      <body>
        <h1>${titulo}</h1>
        <p>Data de geração: ${new Date().toLocaleString('pt-BR')}</p>
        ${tabela}
        <br><br>
        <p style="text-align: center; color: #666; font-size: 12px;">
          Gerado pelo sistema FrotaPM - © 2024
        </p>
      </body>
    </html>
  `);
  janelaImpressao.document.close();
  janelaImpressao.print();
}

// Funções globais
window.gerarRelatorioManutencao = gerarRelatorioManutencao;
window.gerarRelatorioDisponibilidade = gerarRelatorioDisponibilidade;
window.gerarRelatorioFinanceiro = gerarRelatorioFinanceiro;
window.exportarCSV = exportarCSV;
window.exportarPDF = exportarPDF;