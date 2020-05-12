import { Component } from '@angular/core';
import { GameStatus } from '../model/enums/GameStatus';

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

  get requiredNumberOfPlayers(): number {
    return this._requiredNumberOfPlayers
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
    this._gameStatus = GameStatus.WAITING_FOR_OTHER_PLAYERS;
    this._requiredNumberOfPlayers = 2
    this._connectedPlayers = ['Snoop Dogg', 'John Travolta']
    this._readyPlayers = ['Snoop Dogg'];
  }

  public getGameStatusIconName(): string {
    let value = '';

    switch (this._gameStatus) {
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
}
