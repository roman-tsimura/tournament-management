export interface Tournament {
  id: string;
  name: string;
  games?: Game[];
  gameCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Game {
  id: string;
  homePlayer: GamePlayer;
  guestPlayer: GamePlayer;
  homeScore: number | null;
  guestScore: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface GamePlayer {
  playerId: string;
  playerName: string;
  teamId: string;
  teamName: string;
  isHome: boolean;
}

export interface TournamentPlayer {
  id: string;
  name: string;
  totalPoints: number;
  gamesPlayed: number;
  wins: number;
  draws: number;
  losses: number;
  goalsScored: number;
  goalsConceded: number;
}

export interface CreateTournamentRequest {
  name: string;
  playerIds: string[];
}

export interface AddGameRequest {
  tournamentId: string;
  homePlayerId: string;
  homeTeamId: string;
  guestPlayerId: string;
  guestTeamId: string;
}

export interface UpdateGameScoreRequest {
  gameId: string;
  homeScore: number;
  guestScore: number;
}

export interface TournamentStats {
  totalGames: number;
  completedGames: number;
  leaderboard: TournamentPlayer[];
}