import { Component } from '@angular/core';
import { GameStatus } from '../model/enums/GameStatus';
import { WebSocketMessage, Payload } from '../model/WebSocketMessenger';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  private WEBSOCKET_RECONNECT_TIMEOUT = 2000;
  private WEBSOCKET_STATUS_CHECK_INTERVAL = 5000;

  private _gameStatus: GameStatus;
  private _requiredNumberOfPlayers: number;
  private _connectedPlayers: string[];
  private _readyPlayers: string[];
  private _socket: WebSocket;
  private _playerId: string;
  private _isPlayerIdValid: boolean;
  private _isPlayerReady: boolean;

  socketStatusMessage: string = ' ';

  get requiredNumberOfPlayers(): number {
    return this._requiredNumberOfPlayers;
  }

  get numberOfConnectedPlayers(): number {
    return this._connectedPlayers.length;
  }

  get numberOfReadyPlayers(): number {
    return this._readyPlayers.length;
  }

  get gameStatus(): GameStatus {
    return this._gameStatus;
  }

  get playerId() {
    return this._playerId;
  }

  get isPlayerReady(): boolean {
    return this._isPlayerReady;
  }

  constructor() { }

  ngOnInit() {
    this._gameStatus = GameStatus.CONNECTING_TO_SERVER;
    this._requiredNumberOfPlayers = 2;
    this._connectedPlayers = ['Snoop Dogg', 'John Travolta'];
    this._readyPlayers = ['Snoop Dogg'];
    this.openWebSocketConnection();
    this.showWebSocketStatusWithInterval(this.WEBSOCKET_STATUS_CHECK_INTERVAL)
  }

  private openWebSocketConnection = () => {
    this._socket = new WebSocket('ws://ec2-3-86-59-171.compute-1.amazonaws.com/');

    this.initializeWebSocketEvents();
  }

  //#region Initializers functions
  private initializeWebSocketEvents = () => {
    this._socket.onopen = this.handleWebSocketOpen
    this._socket.onclose = this.handleWebSocketClose
    this._socket.onmessage = this.handleSocketMessage;
  }
  //#endregion

  //#region Getters functions
  public getGameStatusIconName(): string {
    let value = '';

    switch (this._gameStatus) {
      case GameStatus.CONNECTING_TO_SERVER: {
        value = 'hourglass';
        break;
      }
      case GameStatus.WAITING_FOR_OTHER_PLAYERS: {
        value = 'time';
        break;
      }
      case GameStatus.GAME_IS_STARTING: {
        value = 'aperture';
        break;
      }
    }
    return value;
  }

  private getWebSocketStatusString(): string {
    let value: string = "Unknown WebSocket status"

    if (this._socket.readyState == this._socket.CONNECTING) value = 'WebSocket is connecting';
    else if (this._socket.readyState == this._socket.OPEN) value = 'WebSocket is open';
    else if (this._socket.readyState == this._socket.CLOSING) value = 'WebSocket is closing';
    else if (this._socket.readyState == this._socket.CLOSED) value = 'WebSocket is closed';

    return value;
  }

  //#endregion

  //#region onFunctions
  //#endregion

  //#region Boolean functions
  private isSocketOpened(): boolean {
    return this._socket.readyState == this._socket.OPEN;
  }

  private isUserIdSet(): boolean {
    return this._playerId != null;
  }
  //#endregion

  //#region WebSocket handlers
  private handleWebSocketOpen = event => {
    this._gameStatus = GameStatus.CONNECTING_TO_SERVER;
    this._gameStatus = GameStatus.WAITING_FOR_OTHER_PLAYERS;

    if (!this.isUserIdSet())
      this.requestUserId();
    else
      this.checkUserId();

    this.socketStatusMessage = this.getWebSocketStatusString();
  };

  private handleSocketMessage = (event) => {
    const message: WebSocketMessage = JSON.parse(event.data);
    let messageType = message.type;
    console.log(`Message: ${messageType}`);

    if (messageType === 'auth_welcome-success') this.handleWelcomeSuccess(message.payload);
    else if (messageType === 'auth_welcome-error') this.handleWelcomeError(message.payload);
    else if (messageType === 'player_ready-success') this.handlePlayerReadySuccess(message.payload);
    else if (messageType === 'player_ready-error') this.handlePlayerReadyError(message.payload);
  }

  private handleWelcomeSuccess(payload: Payload) {
    console.log('Welcome success');
    const id = payload.id;

    if (id != null) {
      this._playerId = id;
    }
    console.log(`Player id: ${this._playerId}`);
  }

  private handleWelcomeError(payload: Payload) {
    console.log(`Welcome error: ${payload.error}`);

    this._playerId = null;
    this._isPlayerIdValid = false;
  }

  private handlePlayerReadySuccess(payload: Payload) {
    const readyState = payload.ready;

    if (readyState != null) {
      this._isPlayerReady = readyState;
      console.log(`Player ${!this._isPlayerReady ? 'not ' : ''}ready`)
    }
  }

  private handlePlayerReadyError(payload: Payload) {
    console.log(payload);
  }

  private handleWebSocketClose = (event) => {
    this._gameStatus = GameStatus.DISCONNECTED_FROM_SERVER;
    this._gameStatus = GameStatus.RECONNECTING_TO_SERVER;
    setTimeout(this.openWebSocketConnection, this.WEBSOCKET_RECONNECT_TIMEOUT);
    console.log('Socket closed');
    console.log(event);
    this.socketStatusMessage = this.getWebSocketStatusString();
  }
  //#endregion

  //#region Actuators functions
  reportReadyState() {
    this.reportPlayerReadyState(true);
  }

  reportNotReadyState() {
    this.reportPlayerReadyState(false);
  }

  private reportPlayerReadyState(value: boolean) {
    if (this.isSocketOpened()) {
      console.log(`Player ${!value ? 'not ' : ''}ready sent`);

      console.log(`${this._playerId} ${value}`)
      this._socket.send(
        JSON.stringify({
          type: 'player_ready',
          payload: {
            id: this._playerId,
            ready: value
          }
        })
      )
    } else {
      console.log(`Player ${!value ? 'not ' : ''}ready not sent. ${this.getWebSocketStatusString()}`);
    }
  }

  showWebSocketStatusWithInterval(interval: number) {
    setInterval(() => {
      this.socketStatusMessage = this.getWebSocketStatusString();
    }, interval);
  }

  private requestUserId() {
    if (this.isSocketOpened()) {
      console.log('Player id request sent');

      this._socket.send(
        JSON.stringify({
          type: 'auth_welcome',
          payload: {}
        })
      )
    } else {
      console.log(`Player id request not sent. ${this.getWebSocketStatusString()}`);
    }
  }

  private checkUserId() {
    if (this.isSocketOpened()) {
      this._socket.send(
        JSON.stringify({
          type: 'auth_check',
          payload: {
            id: this._playerId
          }
        })
      );
    } else console.log(`Player id check not sent. ${this.getWebSocketStatusString()}`);
  }
  //#endregion
}
