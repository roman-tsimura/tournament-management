export interface Tournament {
  id: string;
  name: string;
  status: 'pending' | 'in_progress' | 'completed';
  rounds: TournamentRound[];
  participants: TournamentParticipant[];
  createdAt: Date;
  updatedAt: Date;
  settings: TournamentSettings;
}

export interface TournamentRound {
  roundNumber: number;
  games: Game[];
  isCompleted: boolean;
}

export interface Game {
  id: string;
  homePlayer: GamePlayer;
  guestPlayer: GamePlayer;
  homeScore: number | null;
  guestScore: number | null;
  isCompleted: boolean;
}

export interface GamePlayer {
  playerId: string;
  playerName: string;
  teamId: string;
  teamName: string;
  isHome: boolean;
}

export interface TournamentParticipant {
  playerId: string;
  playerName: string;
  totalPoints: number;
  goalsScored: number;
  goalsConceded: number;
  gamesPlayed: number;
  wins: number;
  draws: number;
  losses: number;
  teamAssignments: TeamAssignment[];
}

export interface TeamAssignment {
  roundNumber: number;
  teamId: string;
  teamName: string;
  isHome: boolean;
}

export interface TournamentSettings {
  teamAssignment: 'fixed' | 'random';
  homeAwayAssignment: 'fixed' | 'random';
  roundsToPlay: number;
  pointsForWin: number;
  pointsForDraw: number;
  pointsForLoss: number;
}

export interface CreateTournamentRequest {
  name: string;
  playerIds: string[];
  settings: TournamentSettings;
}

export interface UpdateGameScoreRequest {
  gameId: string;
  homeScore: number;
  guestScore: number;
}

export interface TournamentStats {
  totalGames: number;
  completedGames: number;
  currentRound: number;
  isTournamentComplete: boolean;
  leaderboard: TournamentParticipant[];
}
