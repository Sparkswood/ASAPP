export interface WebSocketMessage {
    type: string;
    payload: Payload
}

export interface Payload {
    id?: string;
    ready?: boolean;
    answer?: string;
    word?: string;
    winner?: string;
    name?: string;
    error?: string;
}

export enum MessageType {
    AUTH_WELCOME_SUCCESS = 'auth_welcome-success',
    AUTH_WELCOME_ERROR = 'auth_welcome-error',
    PLAYER_READY_SUCCES = 'player_ready-success',
    PLAYER_READY_ERROR = 'player_ready-error',
    PLAYER_WORD = 'player_word'
}

export enum PayloadMessage {
    QUEUE_STAGE_HAS_ENDED = 'Queue stage has ended',
    NO_MORE_SPACE_FOR_NEW_PLAYERS = 'No more space for new players'
}