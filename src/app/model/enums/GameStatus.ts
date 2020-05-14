export enum GameStatus {
    CONNECTING_TO_SERVER = 'Connecting to server',
    CONNECTED_TO_SERVER = 'Connected to server',
    WAITING_FOR_OTHER_PLAYERS = 'Waiting for other players',
    GAME_IS_STARTING = 'Game is starting',
    SOME_GAME_IS_TAKING_PLACE = 'Some game is already taking place',
    ALL_SLOTS_ARE_FULL = 'All game slots are full. Try again later.',
    DISCONNECTED_FROM_SERVER = 'Disconnected from server',
    RECONNECTING_TO_SERVER = 'Reconnecting to server',
}