export interface War {
  id: string;
  opponent: string;
  date: string;
  time: string;
  status: "upcoming" | "preparation" | "finished";
  result?: "victory" | "defeat";
  guildScore?: number;
  opponentScore?: number;
  mvp?: string;
}

export const WARS: War[] = [
  {
    id: "war1",
    opponent: "Shadow Elite",
    date: "30/08/2026",
    time: "20:00",
    status: "upcoming",
  },
  {
    id: "war2",
    opponent: "Fúria GG",
    date: "28/08/2026",
    time: "20:00",
    status: "preparation",
  },
  {
    id: "war3",
    opponent: "Dragon Force",
    date: "25/08/2026",
    time: "20:00",
    status: "finished",
    result: "victory",
    guildScore: 8450,
    opponentScore: 7820,
    mvp: "Player01",
  },
  {
    id: "war4",
    opponent: "Night Wolves",
    date: "22/08/2026",
    time: "20:00",
    status: "finished",
    result: "victory",
    guildScore: 7920,
    opponentScore: 7100,
    mvp: "Player02",
  },
  {
    id: "war5",
    opponent: "Thunder Squad",
    date: "19/08/2026",
    time: "20:00",
    status: "finished",
    result: "defeat",
    guildScore: 6800,
    opponentScore: 7250,
    mvp: "Player03",
  },
  {
    id: "war6",
    opponent: "Phantom Kings",
    date: "16/08/2026",
    time: "20:00",
    status: "finished",
    result: "victory",
    guildScore: 8100,
    opponentScore: 6950,
    mvp: "Shadow",
  },
  {
    id: "war7",
    opponent: "Iron Legion",
    date: "13/08/2026",
    time: "20:00",
    status: "finished",
    result: "victory",
    guildScore: 8600,
    opponentScore: 7400,
    mvp: "Player01",
  },
  {
    id: "war8",
    opponent: "Blaze Nation",
    date: "10/08/2026",
    time: "20:00",
    status: "finished",
    result: "victory",
    guildScore: 7800,
    opponentScore: 7100,
    mvp: "Viper",
  },
  {
    id: "war9",
    opponent: "Cyber Wolves",
    date: "07/08/2026",
    time: "20:00",
    status: "finished",
    result: "defeat",
    guildScore: 6500,
    opponentScore: 7000,
    mvp: "Player02",
  },
  {
    id: "war10",
    opponent: "Phoenix Rise",
    date: "04/08/2026",
    time: "20:00",
    status: "finished",
    result: "victory",
    guildScore: 8200,
    opponentScore: 7600,
    mvp: "Player01",
  },
];
