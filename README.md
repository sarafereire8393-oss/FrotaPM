# FrotaPM - Gestão Inteligente de Frotas

Sistema web e aplicativo móvel (PWA) para gerenciar a manutenção preventiva e rastreamento em tempo real das viaturas da Polícia Militar de Blumenau.

## 📋 Características

- ✅ Dashboard com indicadores em tempo real
- ✅ Cadastro e gerenciamento de viaturas
- ✅ Manutenção preventiva com alertas automáticos
- ✅ Rastreamento em tempo real com mapa (OpenStreetMap)
- ✅ Histórico de rotas
- ✅ Ordens de serviço
- ✅ Relatórios (Manutenção, Disponibilidade, Financeiro)
- ✅ Sistema multiusuário com 4 perfis
- ✅ Modo offline (PWA)
- ✅ Totalmente gratuito

## 🛠️ Stack Tecnológico

### Front-end
- HTML5, CSS3, JavaScript
- Bootstrap 5
- PWA (Progressive Web App)
- Leaflet.js (Mapas)

### Back-end
- Node.js
- Express.js
- PostgreSQL/MySQL/SQLite

### Hospedagem
- GitHub Pages (Frontend)
- Render (Backend)
- Supabase (Banco de Dados)

## 📁 Estrutura do Projeto

```
FrotaPM/
├── frontend/               # Aplicação web e PWA
├── backend/                # API REST
├── database/               # Scripts e migrations
└── docs/                   # Documentação
```

## 🚀 Como Começar

### Requisitos
- Node.js 16+
- npm ou yarn
- Git

### Instalação

1. Clone o repositório
```bash
git clone https://github.com/sarafereire8393-oss/FrotaPM.git
cd FrotaPM
```

2. Instale as dependências do backend
```bash
cd backend
npm install
```

3. Configure as variáveis de ambiente
```bash
cp .env.example .env
```

4. Inicie o servidor
```bash
npm start
```

## 📖 Documentação

Veja a pasta `/docs` para documentação completa.

## 👥 Perfis de Usuário

- **Administrador**: Acesso total ao sistema
- **Gestor**: Visualização de relatórios e indicadores
- **Mecânico**: Gerenciamento de manutenções
- **Policial**: Consulta de status da viatura

## 📄 Licença

MIT
