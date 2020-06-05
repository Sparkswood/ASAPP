export enum GameStatus {
    WAITING_FOR_CAMERA_PERMISSION = 'Waiting for camera permission',
    CHECKING_CAMERA_PERMISSION = 'Checking camera permission',
    NO_CAMERA_PERMISSION = 'No camera permission',
    CONNECTING_TO_SERVER = 'Connecting to server',
    CONNECTED_TO_SERVER = 'Connected to server',
    ID_NOT_RECEIVED = 'ID not received',
    WAITING_FOR_READY_STATUS = 'Waiting for you to get ready',
    WAITING_FOR_OTHER_PLAYERS = 'Waiting for other players',
    WAITING_FOR_ADMIN_TO_START_THE_GAME = 'Waiting for admin to start game',
    GAME_IS_STARTING = 'Game is starting',
    SOME_GAME_IS_TAKING_PLACE = 'Some game is already taking place',
    ALL_SLOTS_ARE_FULL = 'All game slots are full',
    DISCONNECTED_FROM_SERVER = 'Disconnected from server',
    RECONNECTING_TO_SERVER = 'Reconnecting to server',
    INTERNAL_SERVER_ERROR = 'Internal server error',
    AWS_KEYS_NOT_LOADED = 'AWS keys not loaded',
    GAME_OVER = 'game_over'
}