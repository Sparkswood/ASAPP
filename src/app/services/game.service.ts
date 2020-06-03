import { Injectable } from '@angular/core';
import { WebSocketMessage, Payload, PayloadMessage, MessageType } from '../model/WebSocketMessenger';
import { GameStatus } from '../model/enums/GameStatus';
import { Subject, BehaviorSubject } from 'rxjs';
import { Player } from '../model/Player';
import { gameServiceStatements } from '../model/enums/Toast';
import { RawPlayer } from '../model/RawPlayer';
import { PremissionsService } from './premissions.service';

@Injectable({
    providedIn: 'root'
})
export class GameService {
    static readonly MAX_FAILED_CONNEECTION_ATTEMPTS = 10;
    private readonly MAX_NUMBER_OF_PLAYERS = 4;
    private readonly REQUIRED_NUMBER_OF_PLAYERS = 2;
    private readonly WEBSOCKET_RECONNECT_TIMEOUT = 1000;
    private readonly WEBSOCKET_PING_INTERVAL = 5000;
    private readonly WEBSOCKET_STATUS_CHECK_INTERVAL = 5000;
    private readonly WEBSOCKET_URL = 'ws://fast-photo.herokuapp.com/';

    // WebSocket
    private _socket: WebSocket;
    socketConnectionStatus: Subject<number>;

    // Game
    uIMessage: BehaviorSubject<UIMessage>;
    numberOfConnectedPlayers: BehaviorSubject<number>;
    numberOfReadyPlayers: BehaviorSubject<number>;
    gameStatus: BehaviorSubject<GameStatus>;
    gameWord: BehaviorSubject<string>;
    numberOfFreeSlots: BehaviorSubject<number>;
    canGameBeStarted: BehaviorSubject<boolean>;
    canGameBeJoinedTo: BehaviorSubject<boolean>;

    // Player
    playerName: BehaviorSubject<string>;
    isPlayerNameValid: BehaviorSubject<boolean>;
    playerId: BehaviorSubject<string>;
    isPlayerIdValid: BehaviorSubject<boolean>;
    isPlayerReady: BehaviorSubject<boolean>;
    isPlayerAdmin: BehaviorSubject<boolean>;

    playerAnswerState: BehaviorSubject<Date>; // date of last wrong answer
    winner: BehaviorSubject<[string, boolean]>;
    private _haveCameraPermission: boolean;

    constructor(private _permissionService: PremissionsService) {
        this.observeCameraPermissionChange();
        this.initializeService();
    }

    //#region Initializers functions
    private observeCameraPermissionChange() {
        this._permissionService.haveCameraPermission.subscribe(permissions => {
            if (permissions != null) { // if permissions are checked
                this._haveCameraPermission = permissions;
                console.log(`camera permission: ${this._haveCameraPermission}`);

                if (this._haveCameraPermission) {
                    this.initializeService();
                }
                else {
                    /* TODO: Handle no camera permission
                    *
                    * e.g. Display message, or exit the app
                    */

                    const message: UIMessage = {
                        type: UIMessageType.DANGER,
                        content: 'No camera permission'
                    };
                    this.uIMessage.next(message);
                }
            }
        });
    }

    initializeService() {
        this.setInitialValues();
        this.openWebSocketConnection();
        this.startListeningOnSocketConnectionStatus();
    }

    private setInitialValues() {
        // Socket
        this.socketConnectionStatus = new Subject<number>();

        // Game
        this.uIMessage = new BehaviorSubject<UIMessage>(null);
        this.numberOfConnectedPlayers = new BehaviorSubject<number>(0);
        this.numberOfReadyPlayers = new BehaviorSubject<number>(0);
        this.gameStatus = new BehaviorSubject<GameStatus>(GameStatus.CONNECTING_TO_SERVER);
        this.gameWord = new BehaviorSubject<string>(null);
        this.numberOfFreeSlots = new BehaviorSubject<number>(this.MAX_NUMBER_OF_PLAYERS);
        this.canGameBeStarted = new BehaviorSubject<boolean>(false);

        // Player
        this.playerName = new BehaviorSubject<string>(null);
        this.isPlayerNameValid = new BehaviorSubject<boolean>(false);
        this.playerId = new BehaviorSubject<string>(null);
        this.isPlayerIdValid = new BehaviorSubject<boolean>(false);
        this.isPlayerReady = new BehaviorSubject<boolean>(false);
        this.isPlayerAdmin = new BehaviorSubject<boolean>(false);
        this.playerAnswerState = new BehaviorSubject<Date>(new Date()); // date of last wrong answer
        this.winner = new BehaviorSubject<[string, boolean]>(['', false]);
    }

    private openWebSocketConnection = () => {
        console.warn('opening websocket connection');
        console.warn(this.WEBSOCKET_URL);
        this._socket = new WebSocket(this.WEBSOCKET_URL);
        this.initializeWebSocketEvents();
        this.startPinging();
    }

    private initializeWebSocketEvents() {
        this._socket.onopen = this.handleWebSocketOpen;
        this._socket.onclose = this.handleWebSocketClose;
        this._socket.onmessage = this.handleSocketMessage;
    }

    private startPinging() {
        setInterval(this.sendPing, this.WEBSOCKET_PING_INTERVAL);
    }

    private sendPing = () => {
        if (this.isPlayerIdValid.getValue() && this._socket.readyState == WebSocket.OPEN) {
            console.log('Ping');

            const pingRequest = {
                type: MessageType.PLAYER_PING,
                payload: {
                    id: this.playerId.getValue()
                }
            }
            this._socket.send(JSON.stringify(pingRequest))
        }
    }

    private startListeningOnSocketConnectionStatus() {
        setInterval(() => {
            this.socketConnectionStatus.next(this._socket.readyState);
        }, this.WEBSOCKET_STATUS_CHECK_INTERVAL);
    }
    //#endregion

    //#region WebSocket handlers
    private handleWebSocketOpen = () => {
        console.warn('socket open');

        if (this.isPlayerReady.getValue())
            this.setGameStatus(GameStatus.WAITING_FOR_OTHER_PLAYERS);
        else
            this.setGameStatus(GameStatus.WAITING_FOR_READY_STATUS);

        this.socketConnectionStatus.next(this._socket.OPEN);

        if (this.isPlayerIdSet())
            this.checkPlayerId();
        else
            this.requestPlayerId();
    };

    private handleSocketMessage = (event) => {
        const message: WebSocketMessage = JSON.parse(event.data);
        let messageType = message.type;

        if (messageType === MessageType.AUTH_WELCOME_SUCCESS) this.handleWelcomeSuccess(message.payload);
        else if (messageType === MessageType.AUTH_WELCOME_ERROR) this.handleWelcomeError(message.payload);
        else if (messageType === MessageType.PLAYER_READY_SUCCES) this.handlePlayerReadySuccess(message.payload);
        else if (messageType === MessageType.PLAYER_READY_ERROR) this.handlePlayerReadyError(message.payload);
        else if (messageType === MessageType.PLAYERS_INFORMATION) this.handlePlayersInformation(message.payload);
        else if (messageType === MessageType.PLAYER_PING_ERROR) this.handlePingError();
        else if (messageType === MessageType.PLAYER_PONG) this.handlePong();
        else if (messageType === MessageType.GAME_START_SUCCESS) this.handleGameStartSuccess(message);
        else if (messageType === MessageType.GAME_START_ERROR) this.handleGameStartError(message);
        else if (messageType === MessageType.ERROR_INTERNAL) this.handleInternalError(message.payload);
        else if (messageType === MessageType.PLAYER_WORD) this.handlePlayerWord(message.payload);
        else if (messageType === MessageType.PLAYER_ANSWER_ERROR) this.handlePlayerAnswerError(message);
        else if (messageType === MessageType.GAME_OVER) this.handleGameOver(message.payload);
        else console.log(`   message type: ${messageType}`);
    }

    private handleWelcomeSuccess(payload: Payload) {
        const id = payload.id;

        if (id != null) {
            this.playerId.next(id);
            this.isPlayerIdValid.next(true);
        } else {
            this.playerId.next(null);
            this.isPlayerIdValid.next(false);
        }
    }

    private handleWelcomeError(payload: Payload) {
        if (payload.error == PayloadMessage.NO_MORE_SPACE_FOR_NEW_PLAYERS) {
            this.setGameStatus(GameStatus.ALL_SLOTS_ARE_FULL);
        } else if (payload.error == PayloadMessage.QUEUE_STAGE_HAS_ENDED) {
            // TODO: Handle proper action
            this.setGameStatus(GameStatus.SOME_GAME_IS_TAKING_PLACE);
        }

        this.playerId.next(null);
        this.isPlayerIdValid.next(false);
    }

    private handlePlayerReadySuccess(payload: Payload) {
        const readyState = payload.ready;

        if (readyState != null) {
            this.isPlayerReady.next(readyState);
        }

        if (this.isPlayerReady) {
            if (this.canGameBeStarted.getValue()) {
                this.setGameStatus(GameStatus.WAITING_FOR_ADMIN_TO_START_THE_GAME);
            }
            this.setGameStatus(GameStatus.WAITING_FOR_OTHER_PLAYERS);
        }
        else {
            this.setGameStatus(GameStatus.WAITING_FOR_READY_STATUS);
        }
    }

    private handlePlayerReadyError(payload: Payload) {
        console.log(payload);
    }

    private handlePlayersInformation(payload: Payload) {
        const allPlayers = payload.information;
        if (allPlayers) {
            const numberOfConnectedPlayers = this.getNumberOfConnectedPlayers(allPlayers);
            const numberOfReadyPlayers = this.getNumberOfReadyPlayers(allPlayers);

            const freeSlots = this.MAX_NUMBER_OF_PLAYERS - allPlayers.length;

            this.numberOfConnectedPlayers.next(numberOfConnectedPlayers);
            this.numberOfReadyPlayers.next(numberOfReadyPlayers);
            this.numberOfFreeSlots.next(freeSlots);

            if (this.numberOfReadyPlayers.getValue() >= this.REQUIRED_NUMBER_OF_PLAYERS) {
                if (this.isPlayerReady.getValue()) {
                    this.canGameBeStarted.next(true);
                    this.setGameStatus(GameStatus.WAITING_FOR_ADMIN_TO_START_THE_GAME)
                }
            }
            else {
                this.canGameBeStarted.next(false);
                if (this.isPlayerReady.getValue())
                    this.setGameStatus(GameStatus.WAITING_FOR_OTHER_PLAYERS);
                else
                    this.setGameStatus(GameStatus.WAITING_FOR_READY_STATUS);
            }
        }
    }

    private getNumberOfConnectedPlayers(allPlayers: RawPlayer[]): number {
        let connectedPlayers = 0;
        allPlayers.forEach(rawPlayer => {
            const player = new Player(rawPlayer)
            if (player.isActive) connectedPlayers++;
        });

        return connectedPlayers;
    }

    private getNumberOfReadyPlayers(allPlayers: RawPlayer[]): number {
        let readyPlayers = 0;
        allPlayers.forEach(rawPlayer => {
            const player = new Player(rawPlayer)
            if (player.isActive && player.isReady) readyPlayers++;
            this.checkIfIsAdmin(player);
        });

        return readyPlayers;
    }

    private handlePingError() {
        this.setGameStatus(GameStatus.DISCONNECTED_FROM_SERVER);

    }

    private handlePong() {
        console.log(`Pong`)
    }

    private handleGameStartSuccess(message: any) {
        console.log(message);
    }

    private handleGameStartError(message: any) {
        console.log(message);
    }

    private handleInternalError(payload: Payload) {
        if (payload.message && payload.message == PayloadMessage.NO_AWS_KEYS_LOADED) {
            this.setGameStatus(GameStatus.AWS_KEYS_NOT_LOADED);
        } else {
            console.log(payload);
            this.setGameStatus(GameStatus.INTERNAL_SERVER_ERROR);
        }
    }

    private handlePlayerWord(payload: Payload) {
        const word = payload.word;
        if (this.isPlayerReady.getValue()) {
            this.setGameStatus(GameStatus.GAME_IS_STARTING);
            this.gameWord.next(word);
        }
        else {
            this.setGameStatus(GameStatus.SOME_GAME_IS_TAKING_PLACE)
        }
    }

    private handleWebSocketClose = () => {
        console.warn('socket close');
        this.setGameStatus(GameStatus.RECONNECTING_TO_SERVER);
        this.socketConnectionStatus.next(this._socket.CLOSED);
        setTimeout(this.openWebSocketConnection, this.WEBSOCKET_RECONNECT_TIMEOUT);
    }

    private handlePlayerAnswerError(message: WebSocketMessage) {
        console.log(message);
        this.playerAnswerState.next(new Date());
    }

    private handleGameOver(payload: Payload) {
        console.log(payload);
        this.playerAnswerState.next(null);
        this.setGameStatus(GameStatus.GAME_OVER);
        this.winner.next([payload.name, this.playerId.getValue() === payload.winner]);
    }
    //#endregion

    //#region Boolean functions
    private isSocketOpened(): boolean {
        return this._socket.readyState == this._socket.OPEN;
    }

    private isPlayerIdSet(): boolean {
        return this.playerId.getValue() != null;
    }
    //#endregion

    //#region Actuators functions
    setGameStatus(gameStatus: GameStatus) {
        if (this.gameStatus.getValue() != gameStatus) {
            this.gameStatus.next(gameStatus);
        }
    }
    setPlayerName(value: string) {
        this.playerName.next(value);
        this.validatePlayerName();
    }

    private validatePlayerName() {
        const playerName = this.playerName.getValue();
        this.isPlayerNameValid.next(playerName != null && playerName.length > 0);
    }

    reportPlayerName() {
        if (!this.isPlayerIdValid.getValue()) {
            this.uIMessage.next({
                type: UIMessageType.INFO,
                content: gameServiceStatements.INVALID_ID
            });
        } else if (!this.isPlayerNameValid.getValue()) {
            this.uIMessage.next({
                type: UIMessageType.INFO,
                content: gameServiceStatements.INVALID_PLAYER
            });
        } else if (!this.isSocketOpened()) {
            this.uIMessage.next({
                type: UIMessageType.WARN,
                content: gameServiceStatements.SOCKET_CLOSED
            });
        } else {

            this._socket.send(
                JSON.stringify({
                    type: MessageType.PLAYER_NAME,
                    payload: {
                        id: this.playerId.getValue(),
                        name: this.playerName.getValue()
                    }
                })
            );
        }
    }

    reportPlayerReadyState(value: boolean) {
        if (!this.isPlayerIdValid.getValue()) {
            this.uIMessage.next({
                type: UIMessageType.INFO,
                content: gameServiceStatements.INVALID_ID
            });
        } else if (!this.isPlayerNameValid.getValue()) {
            this.uIMessage.next({
                type: UIMessageType.INFO,
                content: gameServiceStatements.INVALID_PLAYER
            });
        } else if (!this.isSocketOpened()) {
            this.uIMessage.next({
                type: UIMessageType.WARN,
                content: gameServiceStatements.SOCKET_CLOSED
            });
        } else if (this.isPlayerReady.getValue() != value) { //to avoid redundant calls (e.g. when ready player call ready state)
            this._socket.send(
                JSON.stringify({
                    type: MessageType.PLAYER_READY,
                    payload: {
                        id: this.playerId.getValue(),
                        ready: value
                    }
                })
            );
        }
    }

    private requestPlayerId() {
        if (!this.isSocketOpened()) {
            this.uIMessage.next({
                type: UIMessageType.WARN,
                content: gameServiceStatements.SOCKET_CLOSED
            });
        } else {
            this._socket.send(
                JSON.stringify({
                    type: MessageType.AUTH_WELCOME,
                    payload: {}
                })
            );
        }
    }

    private checkPlayerId() {
        if (!this.isSocketOpened()) {
            this.uIMessage.next({
                type: UIMessageType.WARN,
                content: gameServiceStatements.SOCKET_CLOSED
            });
        } else {
            this._socket.send(
                JSON.stringify({
                    type: MessageType.AUTH_WELCOME,
                    payload: {
                        id: this.playerId.getValue()
                    }
                })
            );
        }
    }

    private checkIfIsAdmin(player: Player) {
        if (this.playerId.getValue() == player.id) {
            this.isPlayerAdmin.next(player.isAdmin);
        }
    }

    startGame() {
        if (this.playerId.getValue() && this.isPlayerAdmin.getValue()) {
            const startGameRequest = {
                type: MessageType.GAME_START,
                payload: {
                    id: this.playerId.getValue()
                }
            }
            this._socket.send(JSON.stringify(startGameRequest));
        }
    }

    reconnectToSocket() {
        console.warn('restarting connection');
        this._socket.close();
    }

    sendPhoto(photoBase64: string) {
        console.log(photoBase64);
        if (this.isPlayerIdValid.getValue()) {
            const request = {
                type: MessageType.PLAYER_ANSWER,
                payload: {
                    answer: photoBase64,
                    id: this.playerId.getValue()
                }
            }
            console.log(request)
            this._socket.send(JSON.stringify(request));
        }
    }
    // #endregion
}

export interface UIMessage {
    type: UIMessageType;
    content: string;
}

export enum UIMessageType {
    INFO,
    SUCCESS,
    WARN,
    DANGER
}
