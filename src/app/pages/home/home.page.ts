import { Component } from '@angular/core';
import { GameStatus } from '../../model/enums/GameStatus';
import { GameService } from '../../services/game.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  private _gameStatus: GameStatus;
  private _requiredNumberOfPlayers: number;
  private _connectedPlayers: string[];
  private _readyPlayers: string[];
  private _playerName: string;
  private _isPlayerNameValid: boolean;
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

  get isPlayerNameValid(): boolean {
    return this._isPlayerNameValid;
  }

  get layerName(): string {
    return this._playerName;
  }

  setPlayerName(value: any) {
    this._playerName = value.target.value;
    this._gameService.setPlayerName(this._playerName);
  }

  constructor(private _gameService: GameService) { }

  ngOnInit() {
    this._gameStatus = GameStatus.CONNECTED_TO_SERVER;
    this._requiredNumberOfPlayers = 2;
    this._connectedPlayers = ['Snoop Dogg', 'John Travolta'];
    this._readyPlayers = ['Snoop Dogg'];

    this.subscribeToService()
    // this.openWebSocketConnection();
    // this.showWebSocketStatusWithInterval(this.WEBSOCKET_STATUS_CHECK_INTERVAL)
  }

  //#region Initializers functions
  private subscribeToService() {
    this._gameService.socketConnectionStatus.subscribe(socketStatus => {
      console.log(`Socket status: ${this.getWebSocketStatusString(socketStatus)}`);
      this.socketStatusMessage = this.getWebSocketStatusString(socketStatus);
    })

    this._gameService.gameStatus.subscribe(gameStatus => {
      console.log(`Game status: ${gameStatus}`);
      this._gameStatus = gameStatus;
    })

    this._gameService.playerId.subscribe(playerId => {
      console.log(`Player id: ${playerId}`);
      this._playerId = playerId;
    })

    this._gameService.isPlayerIdValid.subscribe(isIdValid => {
      console.log(`Player id ${!isIdValid ? 'in' : ''}valid`);
      this._isPlayerIdValid = isIdValid;
    })

    this._gameService.isPlayerNameValid.subscribe(isNameValid => {
      console.log(`Player name ${!isNameValid ? 'in' : ''}valid`);
      this._isPlayerNameValid = isNameValid;
    })

    this._gameService.isPlayerReady.subscribe(readyStatus => {
      console.log(`Player is ${!readyStatus ? 'not ' : ''}ready`)
      this._isPlayerReady = readyStatus;
    });
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
      case GameStatus.ALL_SLOTS_ARE_FULL: {
        value = 'sad';
        break;
      }
      case GameStatus.SOME_GAME_IS_TAKING_PLACE: {
        value = 'hand-left';
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

  private getWebSocketStatusString(socketStatus: number): string {
    let value: string = "Unknown WebSocket status"

    if (socketStatus == 0) value = 'WebSocket is connecting';
    else if (socketStatus == 1) value = 'WebSocket is open';
    else if (socketStatus == 2) value = 'WebSocket is closing';
    else if (socketStatus == 3) value = 'WebSocket is closed';

    return value;
  }

  //#endregion

  //#region onFunctions
  //#endregion

  //#region Boolean functions
  //#endregion

  //#region Actuators functions
  reportReadyState() {
    this._gameService.reportPlayerReadyState(true);
  }

  reportNotReadyState() {
    this._gameService.reportPlayerReadyState(false);
  }
  //#endregion
}
