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