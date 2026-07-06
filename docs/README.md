# Documentação FrotaPM

## Introdução

FrotaPM é um sistema web e aplicativo móvel (PWA) para gerenciar a manutenção preventiva e rastreamento em tempo real das viaturas da Polícia Militar de Blumenau.

## Módulos Principais

### 1. Autenticação e Controle de Acesso

- **Perfis de Usuário**: Admin, Gestor, Mecânico, Policial
- **JWT**: Autenticação baseada em tokens
- **Segurança**: Senhas criptografadas com bcryptjs

### 2. Gestão de Viaturas

- Cadastro completo com prefixo, placa, modelo, ano, chassi
- Controle de quilometragem
- Status: Operacional, Manutenção, Parada

### 3. Manutenção Preventiva

- Planejamento de manutenções
- Alertas automáticos (urgente, próximo, em dia)
- Histórico completo de manutenções
- Controle de custos

### 4. Rastreamento em Tempo Real

- Mapa interativo com OpenStreetMap
- Posicionamento GPS
- Histórico de rotas
- Geocerca

### 5. Ordens de Serviço

- Criação de ordens
- Atribuição de mecânicos
- Controle de status

### 6. Relatórios

- Manutenção por período
- Disponibilidade da frota
- Análise financeira
- Exportação em PDF/Excel

## Banco de Dados

Ver `database/schema.sql` para estrutura completa.

### Tabelas Principais

- `usuarios`: Usuários do sistema
- `viaturas`: Frotas cadastradas
- `manutencao`: Histórico de manutenções
- `rastreamento`: Dados de GPS
- `ordens_servico`: Ordens de serviço

## API REST

Ver documentação de endpoints em cada arquivo de rota em `backend/routes/`.

## Deploy

### Frontend
- GitHub Pages

### Backend
- Render.com

### Database
- Supabase (PostgreSQL)
