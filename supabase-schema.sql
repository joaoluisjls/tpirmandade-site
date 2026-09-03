-- ============================================
-- SCHEMA: TP&IRMANDADE Guild Database
-- ============================================
-- Execute este SQL no painel do Supabase:
-- Supabase Dashboard > SQL Editor > New Query

-- 1. TABELA DE JOGADORES
CREATE TABLE IF NOT EXISTS players (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  nick TEXT NOT NULL,
  name TEXT NOT NULL DEFAULT '',
  role TEXT NOT NULL DEFAULT 'Membro',
  joined_at TEXT NOT NULL DEFAULT '',
  avatar TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'offline',
  matches INT NOT NULL DEFAULT 0,
  wins INT NOT NULL DEFAULT 0,
  kills INT NOT NULL DEFAULT 0,
  deaths INT NOT NULL DEFAULT 0,
  kd NUMERIC NOT NULL DEFAULT 0,
  headshots INT NOT NULL DEFAULT 0,
  headshot_rate NUMERIC NOT NULL DEFAULT 0,
  avg_damage INT NOT NULL DEFAULT 0,
  win_rate NUMERIC NOT NULL DEFAULT 0,
  points INT NOT NULL DEFAULT 0,
  weekly_evolution JSONB NOT NULL DEFAULT '[]'::jsonb,
  achievements JSONB NOT NULL DEFAULT '[]'::jsonb,
  bio TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. TABELA DE MVP
CREATE TABLE IF NOT EXISTS mvp (
  id TEXT PRIMARY KEY DEFAULT 'current',
  player_id TEXT NOT NULL,
  week_label TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. TABELA DE GUERRAS
CREATE TABLE IF NOT EXISTS wars (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  opponent TEXT NOT NULL,
  date TEXT NOT NULL,
  time TEXT NOT NULL DEFAULT '20:00',
  status TEXT NOT NULL DEFAULT 'upcoming',
  result TEXT,
  guild_score INT,
  opponent_score INT,
  mvp_nick TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. TABELA DE CONQUISTAS
CREATE TABLE IF NOT EXISTS achievements (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  date TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT '🏆',
  responsible TEXT NOT NULL DEFAULT 'Toda a guilda',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. TABELA DE AVISOS
CREATE TABLE IF NOT EXISTS announcements (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  date TEXT NOT NULL,
  time TEXT NOT NULL DEFAULT '',
  priority TEXT NOT NULL DEFAULT 'medium',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. TABELA DE REGRAS
CREATE TABLE IF NOT EXISTS rules (
  id INT PRIMARY KEY,
  text TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'conduta',
  highlighted BOOLEAN NOT NULL DEFAULT false
);

-- 7. TABELA DE CONFIGURAÇÕES
CREATE TABLE IF NOT EXISTS guild_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 8. TABELA DE ADMINISTRADORES (usa auth do Supabase + metadata)
-- Os admins são gerenciados via Supabase Auth

-- ============================================
-- DADOS INICIAIS
-- ============================================

-- Jogadores iniciais
INSERT INTO players (id, nick, name, role, joined_at, status, matches, wins, kills, deaths, kd, headshots, headshot_rate, avg_damage, win_rate, points, weekly_evolution, achievements, bio) VALUES
('player01', 'Player01', 'Carlos Silva', 'Capitão', '12/03/2026', 'online', 186, 42, 584, 121, 4.82, 210, 36, 1820, 22.6, 2450, '[{"week":"S1","points":280},{"week":"S2","points":310},{"week":"S3","points":295},{"week":"S4","points":340},{"week":"S5","points":325},{"week":"S6","points":360},{"week":"S7","points":345},{"week":"S8","points":380}]', '["MVP da Semana","Maior K/D","Capitão","Jogador Destaque","100 Abates"]', 'Capitão da guilda. Líder nato com foco em evolução coletiva.'),
('player02', 'Player02', 'Lucas Oliveira', 'Vice-líder', '12/03/2026', 'online', 180, 38, 520, 120, 4.33, 185, 35.5, 1650, 21.1, 2290, '[{"week":"S1","points":260},{"week":"S2","points":290},{"week":"S3","points":275},{"week":"S4","points":310},{"week":"S5","points":300},{"week":"S6","points":330},{"week":"S7","points":320},{"week":"S8","points":355}]', '["Vice-líder","Maior Número de Abates","Guerreiro"]', 'Vice-líder da guilda. Sempre pronto para a batalha.'),
('player03', 'Player03', 'Matheus Santos', 'Capitão', '05/04/2026', 'online', 175, 35, 490, 119, 4.12, 170, 34.7, 1580, 20, 2180, '[{"week":"S1","points":245},{"week":"S2","points":270},{"week":"S3","points":260},{"week":"S4","points":295},{"week":"S5","points":285},{"week":"S6","points":315},{"week":"S7","points":305},{"week":"S8","points":335}]', '["Capitão","Estratégia Impecável","100 Abates"]', 'Estrategista nato. Planeja cada movimento da guilda.'),
('shadow', 'Shadow', 'Pedro Almeida', 'Membro', '20/04/2026', 'away', 160, 30, 450, 115, 3.91, 160, 35.5, 1480, 18.7, 1950, '[{"week":"S1","points":220},{"week":"S2","points":245},{"week":"S3","points":235},{"week":"S4","points":265},{"week":"S5","points":255},{"week":"S6","points":280},{"week":"S7","points":270},{"week":"S8","points":300}]', '["Membro Destaque","Sniper de Elite"]', 'Especialista em emboscadas. O silêncio antes da tempestade.'),
('viper', 'Viper', 'Rafael Costa', 'Membro', '01/05/2026', 'online', 155, 28, 430, 118, 3.64, 150, 34.9, 1420, 18.1, 1820, '[{"week":"S1","points":200},{"week":"S2","points":225},{"week":"S3","points":215},{"week":"S4","points":250},{"week":"S5","points":240},{"week":"S6","points":270},{"week":"S7","points":260},{"week":"S8","points":285}]', '["Atirador de Elite","Sequência de Vitórias"]', 'Rápido e letal. Viper nunca perde uma chance.'),
('phantom', 'Phantom', 'Gabriel Lima', 'Membro', '15/05/2026', 'offline', 148, 26, 410, 122, 3.36, 140, 34.1, 1350, 17.6, 1680, '[{"week":"S1","points":185},{"week":"S2","points":210},{"week":"S3","points":200},{"week":"S4","points":230},{"week":"S5","points":220},{"week":"S6","points":245},{"week":"S7","points":235},{"week":"S8","points":260}]', '["Infiltrador","100 Abates"]', 'Fantasma no campo de batalha. Aparece e desaparece.'),
('nova', 'Nova', 'Ana Rodrigues', 'Membro', '22/05/2026', 'online', 140, 24, 390, 125, 3.12, 130, 33.3, 1280, 17.1, 1540, '[{"week":"S1","points":170},{"week":"S2","points":195},{"week":"S3","points":185},{"week":"S4","points":210},{"week":"S5","points":200},{"week":"S6","points":225},{"week":"S7","points":215},{"week":"S8","points":240}]', '["MVP Feminina","Evolução Constante"]', 'Nova na cena mas com energia de veterana.'),
('blaze', 'Blaze', 'Felipe Souza', 'Recruta', '01/06/2026', 'online', 120, 20, 350, 130, 2.69, 115, 32.9, 1150, 16.7, 1320, '[{"week":"S1","points":140},{"week":"S2","points":160},{"week":"S3","points":155},{"week":"S4","points":175},{"week":"S5","points":170},{"week":"S6","points":190},{"week":"S7","points":185},{"week":"S8","points":200}]', '["Recruta Destaque"]', 'Novato com fome de vitória. Cada dia melhor.'),
('storm', 'Storm', 'Thiago Mendes', 'Membro', '10/06/2026', 'away', 110, 18, 320, 128, 2.5, 105, 32.8, 1100, 16.4, 1200, '[{"week":"S1","points":125},{"week":"S2","points":145},{"week":"S3","points":138},{"week":"S4","points":158},{"week":"S5","points":150},{"week":"S6","points":168},{"week":"S7","points":160},{"week":"S8","points":178}]', '["Tempestade em Campo"]', 'Chega como uma tempestade. Ninguém segura.'),
('ghost', 'Ghost', 'Bruno Ferreira', 'Recruta', '18/06/2026', 'offline', 95, 15, 280, 132, 2.12, 90, 32.1, 1020, 15.8, 1050, '[{"week":"S1","points":110},{"week":"S2","points":125},{"week":"S3","points":120},{"week":"S4","points":138},{"week":"S5","points":132},{"week":"S6","points":148},{"week":"S7","points":142},{"week":"S8","points":158}]', '["Fantasma Silencioso"]', 'Calado mas letal. Aprendendo rápido.')
ON CONFLICT (id) DO NOTHING;

-- MVP atual
INSERT INTO mvp (id, player_id, week_label) VALUES ('current', 'player01', 'Temporada 8') ON CONFLICT (id) DO NOTHING;

-- Guerras
INSERT INTO wars (id, opponent, date, time, status, result, guild_score, opponent_score, mvp_nick) VALUES
('war1', 'Shadow Elite', '30/08/2026', '20:00', 'upcoming', NULL, NULL, NULL, NULL),
('war2', 'Fúria GG', '28/08/2026', '20:00', 'preparation', NULL, NULL, NULL, NULL),
('war3', 'Dragon Force', '25/08/2026', '20:00', 'finished', 'victory', 8450, 7820, 'Player01'),
('war4', 'Night Wolves', '22/08/2026', '20:00', 'finished', 'victory', 7920, 7100, 'Player02'),
('war5', 'Thunder Squad', '19/08/2026', '20:00', 'finished', 'defeat', 6800, 7250, 'Player03'),
('war6', 'Phantom Kings', '16/08/2026', '20:00', 'finished', 'victory', 8100, 6950, 'Shadow'),
('war7', 'Iron Legion', '13/08/2026', '20:00', 'finished', 'victory', 8600, 7400, 'Player01'),
('war8', 'Blaze Nation', '10/08/2026', '20:00', 'finished', 'victory', 7800, 7100, 'Viper'),
('war9', 'Cyber Wolves', '07/08/2026', '20:00', 'finished', 'defeat', 6500, 7000, 'Player02'),
('war10', 'Phoenix Rise', '04/08/2026', '20:00', 'finished', 'victory', 8200, 7600, 'Player01')
ON CONFLICT (id) DO NOTHING;

-- Conquistas
INSERT INTO achievements (id, title, description, date, icon, responsible) VALUES
('ach1', 'CAMPEÕES DA GUERRA', 'Primeiro lugar na temporada competitiva atual.', '20/08/2026', '🏆', 'Toda a guilda'),
('ach2', '10 GUERRAS INVICTOS', 'Sequência histórica de 10 vitórias consecutivas.', '15/08/2026', '🔥', 'Toda a guilda'),
('ach3', '100 MVPs', 'Marca de 100 MVPs coletados pela guilda.', '10/08/2026', '⭐', 'Toda a guilda'),
('ach4', 'MAIOR K/D DA TEMPORADA', 'Player01 alcançou K/D de 4.82, o maior da temporada.', '08/08/2026', '🎯', 'Player01'),
('ach5', '1000 ABATES', 'Guilda ultrapassou a marca de 1000 abates no mês.', '05/08/2026', '💀', 'Toda a guilda'),
('ach6', 'NOVA ERA', 'Expansão da equipe com 5 novos membros recrutados.', '01/08/2026', '🚀', 'Liderança')
ON CONFLICT (id) DO NOTHING;

-- Avisos
INSERT INTO announcements (id, title, content, date, time, priority) VALUES
('ann1', 'GUERRA HOJE', 'Todos os membros devem estar disponíveis às 20h. Preparação máxima!', '28/08/2026', '14:00', 'high'),
('ann2', 'NOVO MVP', 'Parabéns ao Player01 pelo desempenho excepcional da semana! K/D de 4.82.', '27/08/2026', '10:00', 'medium'),
('ann3', 'RECRUTAMENTO ABERTO', 'Estamos recrutando novos membros. Indiquem jogadores comprometidos.', '25/08/2026', '08:00', 'low'),
('ann4', 'REGRAS ATUALIZADAS', 'As regras da guilda foram atualizadas. Leiam com atenção.', '22/08/2026', '16:00', 'medium')
ON CONFLICT (id) DO NOTHING;

-- Regras
INSERT INTO rules (id, text, category, highlighted) VALUES
(1, 'Respeitar todos os membros da guilda.', 'respeito', false),
(2, 'Participar das guerras de guilda quando convocado.', 'participação', false),
(3, 'Não praticar racismo, preconceito ou qualquer forma de discriminação.', 'respeito', true),
(4, 'Não causar conflitos desnecessários dentro da guilda.', 'conduta', false),
(5, 'Representar a guilda com respeito em todas as partidas.', 'conduta', false),
(6, 'Manter atividade mínima dentro da guilda.', 'participação', false),
(7, 'Respeitar líderes e membros da guilda.', 'respeito', false),
(8, 'Não utilizar trapaças, hacks ou qualquer forma de vantagem injusta.', 'conduta', true),
(9, 'Trabalhar em equipe e colaborar com os companheiros.', 'participação', false),
(10, 'Buscar sempre evoluir como jogador e como pessoa.', 'evolução', false)
ON CONFLICT (id) DO NOTHING;

-- Configurações
INSERT INTO guild_settings (key, value) VALUES
('guild_name', 'TP&IRMANDADE'),
('guild_tag', 'TPI'),
('guild_slogan', 'Juntos somos mais fortes. Sozinhos somos bons. Juntos somos imparáveis.'),
('guild_motto', 'NÃO ESTAMOS AQUI APENAS PARA JOGAR. ESTAMOS AQUI PARA EVOLUIR.'),
('guild_description', 'Portal oficial da TP&IRMANDADE. Confira o ranking, MVPs, jogadores, guerras, estatísticas e conquistas da nossa equipe.'),
('discord', 'https://discord.gg/tpirmandade'),
('instagram', 'https://instagram.com/tpirmandade'),
('tiktok', 'https://tiktok.com/@tpirmandade'),
('youtube', 'https://youtube.com/@tpirmandade'),
('whatsapp', '+5511999999999'),
('primary_color', '#ff4655'),
('accent_color', '#f59e0b'),
('owner', 'Seu Nome')
ON CONFLICT (key) DO NOTHING;

-- ============================================
-- RLS (Row Level Security) Policies
-- ============================================
-- Leitura pública (site) / Escrita só pra admins logados

-- PLAYERS
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
CREATE POLICY "players_select_public" ON players FOR SELECT USING (true);
CREATE POLICY "players_insert_auth" ON players FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "players_update_auth" ON players FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "players_delete_auth" ON players FOR DELETE USING (auth.role() = 'authenticated');

-- MVP
ALTER TABLE mvp ENABLE ROW LEVEL SECURITY;
CREATE POLICY "mvp_select_public" ON mvp FOR SELECT USING (true);
CREATE POLICY "mvp_insert_auth" ON mvp FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "mvp_update_auth" ON mvp FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "mvp_delete_auth" ON mvp FOR DELETE USING (auth.role() = 'authenticated');

-- WARS
ALTER TABLE wars ENABLE ROW LEVEL SECURITY;
CREATE POLICY "wars_select_public" ON wars FOR SELECT USING (true);
CREATE POLICY "wars_insert_auth" ON wars FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "wars_update_auth" ON wars FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "wars_delete_auth" ON wars FOR DELETE USING (auth.role() = 'authenticated');

-- ACHIEVEMENTS
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "achievements_select_public" ON achievements FOR SELECT USING (true);
CREATE POLICY "achievements_insert_auth" ON achievements FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "achievements_update_auth" ON achievements FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "achievements_delete_auth" ON achievements FOR DELETE USING (auth.role() = 'authenticated');

-- ANNOUNCEMENTS
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "announcements_select_public" ON announcements FOR SELECT USING (true);
CREATE POLICY "announcements_insert_auth" ON announcements FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "announcements_update_auth" ON announcements FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "announcements_delete_auth" ON announcements FOR DELETE USING (auth.role() = 'authenticated');

-- RULES
ALTER TABLE rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "rules_select_public" ON rules FOR SELECT USING (true);
CREATE POLICY "rules_insert_auth" ON rules FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "rules_update_auth" ON rules FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "rules_delete_auth" ON rules FOR DELETE USING (auth.role() = 'authenticated');

-- GUILD_SETTINGS
ALTER TABLE guild_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "guild_settings_select_public" ON guild_settings FOR SELECT USING (true);
CREATE POLICY "guild_settings_insert_auth" ON guild_settings FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "guild_settings_update_auth" ON guild_settings FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "guild_settings_delete_auth" ON guild_settings FOR DELETE USING (auth.role() = 'authenticated');
