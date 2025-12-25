export interface TournamentSettings {
  teamAssignment: 'manual' | 'random' | 'by_teams';
  homeAwayAssignment: 'manual' | 'random' | 'alternating';
}

export interface Tournament {
  id: string;
  name: string;
  games?: Game[];  // Made optional with '?'
  players: TournamentPlayer[];
  teams: TournamentTeam[];
  settings: TournamentSettings;
  createdAt: Date;
  updatedAt: Date;
}

export interface Game {
  id: string;
  homePlayer: GamePlayer;
  guestPlayer: GamePlayer;
  homeScore: number | null;
  guestScore: number | null;
  isCompleted: boolean;
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

export interface TournamentTeam {
  id: string;
  name: string;
  players: string[]; // Player IDs
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

// For form models
export interface GameFormModel {
  homePlayerId: string;
  homeTeamId: string;
  guestPlayerId: string;
  guestTeamId: string;
}

export interface PlayerSelection {
  id: string;
  name: string;
}

export interface TeamSelection {
  id: string;
  name: string;
}
