-- Criação das tabelas

CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    perfil VARCHAR(50) CHECK (perfil IN ('admin', 'gestor', 'mecanico', 'policial')) NOT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS viaturas (
    id SERIAL PRIMARY KEY,
    prefixo VARCHAR(50) UNIQUE NOT NULL,
    placa VARCHAR(20) UNIQUE NOT NULL,
    modelo VARCHAR(100) NOT NULL,
    ano INTEGER NOT NULL,
    chassi VARCHAR(100),
    km DECIMAL(10, 2) DEFAULT 0,
    status VARCHAR(50) CHECK (status IN ('operacional', 'manutencao', 'parada')) DEFAULT 'operacional',
    unidade VARCHAR(100),
    criada_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizada_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS manutencao (
    id SERIAL PRIMARY KEY,
    viatura_id INTEGER NOT NULL REFERENCES viaturas(id) ON DELETE CASCADE,
    tipo VARCHAR(100) NOT NULL,
    descricao TEXT,
    data TIMESTAMP NOT NULL,
    custo DECIMAL(10, 2),
    responsavel VARCHAR(255),
    proxima_manutencao TIMESTAMP,
    criada_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS rastreamento (
    id SERIAL PRIMARY KEY,
    viatura_id INTEGER NOT NULL REFERENCES viaturas(id) ON DELETE CASCADE,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    velocidade DECIMAL(10, 2),
    data_hora TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ordens_servico (
    id SERIAL PRIMARY KEY,
    viatura_id INTEGER NOT NULL REFERENCES viaturas(id) ON DELETE CASCADE,
    problema TEXT NOT NULL,
    mecanico VARCHAR(255),
    data TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) CHECK (status IN ('aberta', 'em_progresso', 'fechada')) DEFAULT 'aberta',
    criada_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para melhor desempenho
CREATE INDEX idx_manutencao_viatura ON manutencao(viatura_id);
CREATE INDEX idx_rastreamento_viatura ON rastreamento(viatura_id);
CREATE INDEX idx_rastreamento_data ON rastreamento(data_hora);
CREATE INDEX idx_ordens_viatura ON ordens_servico(viatura_id);
CREATE INDEX idx_usuarios_email ON usuarios(email);
