import { RawPlayer } from './RawPlayer';

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
    message?: string;
    information?: RawPlayer[];
}

export enum MessageType {
    AUTH_WELCOME = 'auth_welcome',
    AUTH_WELCOME_SUCCESS = 'auth_welcome-success',
    AUTH_WELCOME_ERROR = 'auth_welcome-error',
    ERROR_INTERNAL = 'error_internal',
    GAME_START = 'game_start',
    GAME_START_SUCCESS = 'game_start-success',
    GAME_START_ERROR = 'game_start-error',
    GAME_OVER = 'game_over',
    PLAYER_READY = 'player_ready',
    PLAYER_NAME = 'player_name',
    PLAYER_PING = 'player_ping',
    PLAYER_PING_ERROR = 'player_ping-error',
    PLAYER_PONG = 'player_pong',
    PLAYER_READY_SUCCES = 'player_ready-success',
    PLAYER_READY_ERROR = 'player_ready-error',
    PLAYER_WORD = 'player_word',
    PLAYERS_INFORMATION = 'players_information',
    PLAYER_ANSWER = 'player_answer',
    PLAYER_ANSWER_ERROR = 'player_answer-error'
}

export enum PayloadMessage {
    NO_MORE_SPACE_FOR_NEW_PLAYERS = 'No more space for new players',
    QUEUE_STAGE_HAS_ENDED = 'Queue stage has ended',
    NO_AWS_KEYS_LOADED = 'SERVER DOES NOT RECIVE AWS KEYS'
}
