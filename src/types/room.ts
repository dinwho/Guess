export interface Player{
    id: string;
    username: string;
    isHost: boolean;
    score: number;
}

export interface NbaPlayer{
    id: string;
    name: string;
    team: string;
    aliases: string[];
}


export interface RoomState{
    roomId: string;
    hostId: string;
    players: Record<string, Player>;
    status: 'LOBBY' | 'PLAYING' | 'ENDED';
    currentRound: number;
    totalRounds: number;

}