import { sql } from "@vercel/postgres";

export { sql };

export async function ensureTables() {
  await sql`
    CREATE TABLE IF NOT EXISTS guild_settings (
      id SERIAL PRIMARY KEY,
      key TEXT NOT NULL UNIQUE,
      value TEXT NOT NULL DEFAULT ''
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS players (
      id TEXT PRIMARY KEY,
      nick TEXT NOT NULL DEFAULT '',
      name TEXT NOT NULL DEFAULT '',
      role TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'offline',
      bio TEXT NOT NULL DEFAULT '',
      joined_at TEXT NOT NULL DEFAULT '',
      avatar TEXT NOT NULL DEFAULT '',
      matches INTEGER NOT NULL DEFAULT 0,
      wins INTEGER NOT NULL DEFAULT 0,
      kills INTEGER NOT NULL DEFAULT 0,
      deaths INTEGER NOT NULL DEFAULT 0,
      kd NUMERIC DEFAULT 0,
      headshots INTEGER NOT NULL DEFAULT 0,
      headshot_rate NUMERIC DEFAULT 0,
      avg_damage NUMERIC DEFAULT 0,
      win_rate NUMERIC DEFAULT 0,
      points INTEGER NOT NULL DEFAULT 0,
      weekly_evolution JSONB DEFAULT '[]',
      achievements JSONB DEFAULT '[]',
      pin TEXT NOT NULL DEFAULT '',
      phone TEXT NOT NULL DEFAULT '',
      email TEXT NOT NULL DEFAULT ''
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS wars (
      id TEXT PRIMARY KEY,
      opponent TEXT NOT NULL DEFAULT '',
      date TEXT NOT NULL DEFAULT '',
      time TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'upcoming',
      result TEXT DEFAULT '',
      guild_score INTEGER DEFAULT 0,
      opponent_score INTEGER DEFAULT 0,
      mvp_nick TEXT DEFAULT ''
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS achievements (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL DEFAULT '',
      description TEXT NOT NULL DEFAULT '',
      date TEXT NOT NULL DEFAULT '',
      icon TEXT NOT NULL DEFAULT '',
      responsible TEXT NOT NULL DEFAULT '',
      players JSONB DEFAULT '[]'
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS announcements (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL DEFAULT '',
      content TEXT NOT NULL DEFAULT '',
      date TEXT NOT NULL DEFAULT '',
      time TEXT NOT NULL DEFAULT '',
      priority TEXT NOT NULL DEFAULT 'low'
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS rules (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL DEFAULT '',
      content TEXT NOT NULL DEFAULT '',
      category TEXT NOT NULL DEFAULT ''
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS admins (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT ''
    );
  `;
}
