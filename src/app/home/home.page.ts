import { Component } from '@angular/core';
import { GameStatus } from '../model/enums/GameStatus';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  private _gameStatus: GameStatus = GameStatus.CONNECTING_TO_SERVER;
  private _requiredNumberOfPlayers: number;
  private _connectedPlayers: string[];
  private _readyPlayers: string[];
  private _socket: WebSocket;

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

  constructor() { }

  ngOnInit() {
    this._gameStatus = GameStatus.CONNECTING_TO_SERVER;
    this._requiredNumberOfPlayers = 2;
    this._connectedPlayers = ['Snoop Dogg', 'John Travolta'];
    this._readyPlayers = ['Snoop Dogg'];
    this.openWebSocketConnection();
  }

  private openWebSocketConnection = () => {
    this._socket = new WebSocket('ws://fast-photo.herokuapp.com');

    this.initializeWebSocketEvents();
  }

  //#region Initializers functions
  private initializeWebSocketEvents = () => {
    this._socket.onopen = event => {
      this._gameStatus = GameStatus.CONNECTING_TO_SERVER;
      this._gameStatus = GameStatus.WAITING_FOR_OTHER_PLAYERS;
      console.log('Socket opened');
      console.log(event);
    };

    this._socket.onclose = event => {
      this._gameStatus = GameStatus.DISCONNECTED_FROM_SERVER;
      this._gameStatus = GameStatus.RECONNECTING_TO_SERVER;
      setTimeout(this.openWebSocketConnection, 2000);
      console.log('Socket closed');
    };

    this._socket.addEventListener('message', this.handleSocketMessage);
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
  //#endregion

  //#region onFunctions
  //#endregion

  //#region Boolean functions
  //#endregion

  //#region Actuators functions

  private handleSocketMessage = (event) => {
    console.log('Socket message');
    console.log(event);
  }

  reportReadyState() {
    console.log('User id request');

    if (this._socket.readyState == this._socket.OPEN) {
      console.log('User id request sent');

      this._socket.send(
        JSON.stringify({
          type: 'auth_welcome',
          payload: {}
        })
      )
    } else {
      console.log('User id request not sent');
    }
  }

  reportNotReadyState() {
    console.log('Not ready state reported');
    this._socket.close()
  }
  //#endregion

}
