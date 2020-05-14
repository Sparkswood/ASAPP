import { Injectable } from '@angular/core';
import { WebSocketMessage, Payload, PayloadMessage, MessageType } from '../model/WebSocketMessenger';
import { GameStatus } from '../model/enums/GameStatus';
import { Subject, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private WEBSOCKET_RECONNECT_TIMEOUT = 1000;
  private WEBSOCKET_STATUS_CHECK_INTERVAL = 5000;
  private WEBSOCKET_URL = 'ws://ec2-3-86-59-171.compute-1.amazonaws.com/';

  private _connectedPlayers: string[];
  private _readyPlayers: string[];

  private _socket: WebSocket;

  socketConnectionStatus = new Subject<number>();
  gameStatus = new BehaviorSubject<GameStatus>(GameStatus.CONNECTING_TO_SERVER);
  playerName = new BehaviorSubject<string>(null);
  isPlayerNameValid = new BehaviorSubject<boolean>(false);
  playerId = new BehaviorSubject<string>(null);
  isPlayerIdValid = new BehaviorSubject<boolean>(false);
  isPlayerReady = new BehaviorSubject<boolean>(false);

  constructor() {
    this.openWebSocketConnection()
    this.startListeningSocketConnectionStatus();
  }

  //#region Initializers functions
  private openWebSocketConnection = () => {
    this._socket = new WebSocket(this.WEBSOCKET_URL);
    this.initializeWebSocketEvents();
  }

  private initializeWebSocketEvents = () => {
    this._socket.onopen = this.handleWebSocketOpen
    this._socket.onclose = this.handleWebSocketClose
    this._socket.onmessage = this.handleSocketMessage;
  }

  private startListeningSocketConnectionStatus() {
    setInterval(() => {
      this.socketConnectionStatus.next(this._socket.readyState)
    }, this.WEBSOCKET_STATUS_CHECK_INTERVAL);
  }
  //#endregion

  //#region WebSocket handlers
  private handleWebSocketOpen = event => {
    this.gameStatus.next(GameStatus.CONNECTING_TO_SERVER);
    this.gameStatus.next(GameStatus.WAITING_FOR_READY_STATUS);
    this.socketConnectionStatus.next(this._socket.OPEN);

    if (!this.isUserIdSet())
      this.requestUserId();
    else
      this.checkUserId();
  };

  private handleSocketMessage = (event) => {
    const message: WebSocketMessage = JSON.parse(event.data);
    let messageType = message.type;
    console.log(`   message type: ${messageType}`);

    if (messageType === MessageType.AUTH_WELCOME_SUCCESS) this.handleWelcomeSuccess(message.payload);
    else if (messageType === MessageType.AUTH_WELCOME_ERROR) this.handleWelcomeError(message.payload);
    else if (messageType === MessageType.PLAYER_READY_SUCCES) this.handlePlayerReadySuccess(message.payload);
    else if (messageType === MessageType.PLAYER_READY_ERROR) this.handlePlayerReadyError(message.payload);
    else if (messageType === MessageType.PLAYER_WORD) this.handlePlayerWord(message.payload);
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
    console.log(`Welcome error: ${payload.error}`);
    if (payload.error == PayloadMessage.NO_MORE_SPACE_FOR_NEW_PLAYERS) {
      this.gameStatus.next(GameStatus.ALL_SLOTS_ARE_FULL)
    } else if (payload.error == PayloadMessage.QUEUE_STAGE_HAS_ENDED) {
      // TODO: Handle proper action
      this.gameStatus.next(GameStatus.SOME_GAME_IS_TAKING_PLACE)
    }

    this.playerId.next(null);
    this.isPlayerIdValid.next(false);
  }

  private handlePlayerReadySuccess(payload: Payload) {
    const readyState = payload.ready;

    if (readyState != null) {
      this.isPlayerReady.next(readyState);
    }

    this.gameStatus.next(this.isPlayerReady.getValue() ? GameStatus.WAITING_FOR_OTHER_PLAYERS : GameStatus.WAITING_FOR_READY_STATUS)
  }

  private handlePlayerReadyError(payload: Payload) {
    console.log(payload);
  }

  private handlePlayerWord(payload: Payload) {
    console.log(`Word received: ${payload.word}`);
    this.gameStatus.next(GameStatus.GAME_IS_STARTING);
  }

  private handleWebSocketClose = (event) => {
    this.gameStatus.next(GameStatus.DISCONNECTED_FROM_SERVER);
    this.gameStatus.next(GameStatus.RECONNECTING_TO_SERVER);
    this.socketConnectionStatus.next(this._socket.CLOSED);
    setTimeout(this.openWebSocketConnection, this.WEBSOCKET_RECONNECT_TIMEOUT);
  }
  //#endregion

  //#region Boolean functions
  private isSocketOpened(): boolean {
    return this._socket.readyState == this._socket.OPEN;
  }

  private isUserIdSet(): boolean {
    return this.playerId.getValue() != null;
  }
  //#endregion

  //#region Actuators functions
  setPlayerName(value: string) {
    this.playerName.next(value);
    this.validatePlayerName()
  }

  private validatePlayerName() {
    const playerName = this.playerName.getValue()
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
          type: 'player_ready',
          payload: {
            id: this.playerId.getValue(),
            name: this.playerName.getValue()
          }
        })
      )
    }
  }

  reportPlayerReadyState(value: boolean) {
    if (!this.isPlayerIdValid.getValue()) {
      // TODO: Throw exception: invalid player id
    } else if (!this.isPlayerNameValid.getValue()) {
      // TODO: Throw exception: invalid player name
    } else if (!this.isSocketOpened()) {
      // TODO: Throw exception: socket closed
    } else if (this.isPlayerReady.getValue() != value) { //to avoid redundant calls (e.g. when ready user call ready state)
      this._socket.send(
        JSON.stringify({
          type: 'player_ready',
          payload: {
            id: this.playerId.getValue(),
            ready: value
          }
        })
      )
    }
  }

  private requestUserId() {
    if (!this.isSocketOpened()) {
      // TODO: Throw exception: socekt closed
    } else {
      this._socket.send(
        JSON.stringify({
          type: 'auth_welcome',
          payload: {}
        })
      )
    }
  }

  private checkUserId() {
    if (!this.isSocketOpened()) {
      // TODO: Throw exception: socekt closed
    } else {
      this._socket.send(
        JSON.stringify({
          type: 'auth_welcome',
          payload: {
            id: this.playerId.getValue()
          }
        })
      )
    }
  }
  //#endregion
}
