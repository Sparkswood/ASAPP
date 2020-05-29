import { Injectable } from '@angular/core';
import { WebSocketMessage, Payload, PayloadMessage, MessageType } from '../model/WebSocketMessenger';
import { GameStatus } from '../model/enums/GameStatus';
import { Subject, BehaviorSubject } from 'rxjs';
import { Message } from '@angular/compiler/src/i18n/i18n_ast';
import { Platform } from '@ionic/angular';
import { Player } from '../model/Player';

@Injectable({
    providedIn: 'root'
})
export class GameService {
    private WEBSOCKET_RECONNECT_TIMEOUT = 1000;
    private WEBSOCKET_STATUS_CHECK_INTERVAL = 5000;
    private WEBSOCKET_URL = 'ws://fast-photo.herokuapp.com/';

    // WebSocket
    private _socket: WebSocket;
    socketConnectionStatus = new Subject<number>();

    // Current player
    playerName = new BehaviorSubject<string>(null);
    isPlayerNameValid = new BehaviorSubject<boolean>(false);
    playerId = new BehaviorSubject<string>(null);
    isPlayerIdValid = new BehaviorSubject<boolean>(false);
    isPlayerReady = new BehaviorSubject<boolean>(false);
    isPlayerAdmin = new BehaviorSubject<boolean>(false);

    // Game details
    numberOfConnectedPlayers = new BehaviorSubject<number>(0);
    numberOfReadyPlayers = new BehaviorSubject<number>(0);
    gameStatus = new BehaviorSubject<GameStatus>(GameStatus.CONNECTING_TO_SERVER);
    gameWord = new BehaviorSubject<string>(null);

    constructor() {
        this.openWebSocketConnection();
        this.startListeningOnSocketConnectionStatus();
    }

    //#region Initializers functions
    private openWebSocketConnection() {
        this._socket = new WebSocket(this.WEBSOCKET_URL);
        this.initializeWebSocketEvents();
    }

    private initializeWebSocketEvents() {
        this._socket.onopen = this.handleWebSocketOpen;
        this._socket.onclose = this.handleWebSocketClose;
        this._socket.onmessage = this.handleSocketMessage;
    }

    private startListeningOnSocketConnectionStatus() {
        setInterval(() => {
            this.socketConnectionStatus.next(this._socket.readyState);
        }, this.WEBSOCKET_STATUS_CHECK_INTERVAL);
    }
    //#endregion

    //#region WebSocket handlers
    private handleWebSocketOpen = () => {
        if (this.isPlayerReady.getValue())
            this.gameStatus.next(GameStatus.WAITING_FOR_OTHER_PLAYERS);
        else
            this.gameStatus.next(GameStatus.WAITING_FOR_READY_STATUS);

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
        else if (messageType === MessageType.ERROR_INTERNAL) this.handleInternalError(message.payload);
        else if (messageType === MessageType.PLAYER_WORD) this.handlePlayerWord(message.payload);
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
            this.gameStatus.next(GameStatus.ALL_SLOTS_ARE_FULL);
        } else if (payload.error == PayloadMessage.QUEUE_STAGE_HAS_ENDED) {
            // TODO: Handle proper action
            this.gameStatus.next(GameStatus.SOME_GAME_IS_TAKING_PLACE);
        }

        this.playerId.next(null);
        this.isPlayerIdValid.next(false);
    }

    private handlePlayerReadySuccess(payload: Payload) {
        const readyState = payload.ready;

        if (readyState != null) {
            this.isPlayerReady.next(readyState);
        }

        this.gameStatus.next(this.isPlayerReady.getValue() ? GameStatus.WAITING_FOR_OTHER_PLAYERS : GameStatus.WAITING_FOR_READY_STATUS);
    }

    private handlePlayerReadyError(payload: Payload) {
        console.log(payload);
    }

    private handlePlayersInformation(payload: Payload) {
        console.log(payload);

        const connectedPlayers = payload.information;
        if (connectedPlayers) {
            let numberOfReadyPlayers = 0;

            connectedPlayers.forEach(rawPlayer => {
                const player = new Player(rawPlayer)
                if (player.isReady) numberOfReadyPlayers++;
                this.checkIfIsAdmin(player);
            });

            this.numberOfReadyPlayers.next(numberOfReadyPlayers);
            this.numberOfConnectedPlayers.next(connectedPlayers.length);
        }
    }

    private handleInternalError(payload: Payload) {
        console.log(payload);

        this.gameStatus.next(GameStatus.INTERNAL_SERVER_ERROR);
    }

    private handlePlayerWord(payload: Payload) {
        const word = payload.word;
        this.gameStatus.next(GameStatus.GAME_IS_STARTING);
        this.gameWord.next(word);
    }

    private handleWebSocketClose = (event) => {
        this.gameStatus.next(GameStatus.RECONNECTING_TO_SERVER);
        this.socketConnectionStatus.next(this._socket.CLOSED);
        setTimeout(this.openWebSocketConnection, this.WEBSOCKET_RECONNECT_TIMEOUT);
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
            // TODO: Throw exception: invalid player id
        } else if (!this.isPlayerNameValid.getValue()) {
            // TODO: Throw exception: invalid player name
        } else if (!this.isSocketOpened()) {
            // TODO: Throw exception: socket closed
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
            // TODO: Throw exception: invalid player id
        } else if (!this.isPlayerNameValid.getValue()) {
            // TODO: Throw exception: invalid player name
        } else if (!this.isSocketOpened()) {
            // TODO: Throw exception: socket closed
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
            // TODO: Throw exception: socekt closed
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
            // TODO: Throw exception: socekt closed
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

    restartSocketConnection() {
        console.warn('restarting connection');
        this._socket.close();
        this.openWebSocketConnection();
    }
    //#endregion
}
