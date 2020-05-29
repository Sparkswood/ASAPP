import { Component } from '@angular/core';
import { GameStatus } from '../../model/enums/GameStatus';
import { GameService } from '../../services/game.service';
import { Router } from '@angular/router';
import { Platform } from '@ionic/angular';
import { Player } from 'src/app/model/Player';

@Component({
    selector: 'app-home',
    templateUrl: 'home.page.html',
    styleUrls: ['home.page.scss'],
})
export class HomePage {

    // WebSocket
    socketStatusMessage: string = '';

    // Game
    private _gameStatus: GameStatus;
    private _requiredNumberOfPlayers: number;
    private _gameStatusIcon: string;
    private _numberOfConnectedPlayers: number;
    private _numberOfReadyPlayers: number;

    // Player
    private _playerId: string;
    private _playerName: string;
    private _isPlayerNameValid: boolean;
    private _isPlayerIdValid: boolean;
    private _isPlayerReady: boolean;
    private _isPlayerAdmin: boolean;

    isIconSpinning: boolean = false;

    get requiredNumberOfPlayers(): number {
        return this._requiredNumberOfPlayers;
    }

    get numberOfConnectedPlayers(): number {
        return this._numberOfConnectedPlayers;
    }

    get numberOfReadyPlayers(): number {
        return this._numberOfReadyPlayers;
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

    get isPlayerAdmin(): boolean {
        return this._isPlayerAdmin;
    }

    get isPlayerNameValid(): boolean {
        return this._isPlayerNameValid;
    }

    get playerName(): string {
        return this._playerName;
    }

    get gameStatusIcon(): string {
        return this._gameStatusIcon;
    }

    setPlayerName(value: any) {
        this._playerName = value.target.value;
        this._gameService.setPlayerName(this._playerName);
    }

    constructor(private _gameService: GameService, private _router: Router, private platform: Platform) { }

    ngOnInit() {
        this._gameStatus = GameStatus.CONNECTING_TO_SERVER;
        this._requiredNumberOfPlayers = 2;

        this.subscribeToService();
        this.subscribeToBackButton();
    }

    //#region Initializers functions
    private subscribeToService() {
        this._gameService.socketConnectionStatus.subscribe(socketStatus => {
            this.socketStatusMessage = this.getWebSocketStatusString(socketStatus);
        })

        this._gameService.gameStatus.subscribe((gameStatus: GameStatus) => {
            this._gameStatus = gameStatus;
            this._gameStatusIcon = this.getCurrentGameStatusIconName();

            if (this._gameStatus == GameStatus.GAME_IS_STARTING) {
                this.unsubscribeFromBackButton();
                this.navigateToGameScreen();
            }
        })

        this._gameService.playerId.subscribe(playerId => {
            this._playerId = playerId;
        })

        this._gameService.isPlayerIdValid.subscribe(isIdValid => {
            this._isPlayerIdValid = isIdValid;
        })

        this._gameService.isPlayerNameValid.subscribe(isNameValid => {
            this._isPlayerNameValid = isNameValid;
        })

        this._gameService.isPlayerReady.subscribe(readyStatus => {
            this._isPlayerReady = readyStatus;
        });

        this._gameService.numberOfReadyPlayers.subscribe(readyPlayers => {
            this._numberOfReadyPlayers = readyPlayers;
        });

        this._gameService.numberOfConnectedPlayers.subscribe(connectedPlayers => {
            this._numberOfConnectedPlayers = connectedPlayers;
        });

        this._gameService.isPlayerAdmin.subscribe(isAdmin => {
            this._isPlayerAdmin = isAdmin;
        })
    }
    //#endregion

    //#region Getters functions
    getCurrentGameStatusIconName(): string {
        let value = '';

        switch (this._gameStatus) {
            case GameStatus.CONNECTING_TO_SERVER: {
                value = 'hourglass';
                break;
            }
            case GameStatus.RECONNECTING_TO_SERVER: {
                value = 'repeat';
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
            case GameStatus.WAITING_FOR_READY_STATUS: {
                value = 'glasses';
                break;
            }
            case GameStatus.WAITING_FOR_OTHER_PLAYERS: {
                value = 'hourglass';
                break;
            }
            case GameStatus.GAME_IS_STARTING: {
                value = 'aperture';
                break;
            }
            case GameStatus.DISCONNECTED_FROM_SERVER: {
                value = 'alert-circle';
                break;
            }
            case GameStatus.INTERNAL_SERVER_ERROR: {
                value = 'close-circle';
                break;
            }
        }
        return value;
    }

    private getWebSocketStatusString(socketStatus: number): string {
        let value: string = "Unknown WebSocket status";

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
    canRestartServer() {
        return [
            GameStatus.ALL_SLOTS_ARE_FULL,
            GameStatus.DISCONNECTED_FROM_SERVER,
            GameStatus.SOME_GAME_IS_TAKING_PLACE,
            GameStatus.INTERNAL_SERVER_ERROR
        ].includes(this.gameStatus);
    }
    //#endregion

    //#region Actuators functions
    reportReadyState() {
        this._gameService.reportPlayerName();
        this._gameService.reportPlayerReadyState(true);
    }

    reportNotReadyState() {
        this._gameService.reportPlayerReadyState(false);
    }

    private navigateToGameScreen() {
        this._router.navigate(['/game']);
    }
    //#endregion

    private subscribeToBackButton() {
        this.platform.backButton.subscribe(() => this.exitApp());
    }

    private unsubscribeFromBackButton() {
        this.platform.backButton.unsubscribe();
    }

    reconnect() {
        this._gameService.restartSocketConnection();
    }

    exitApp() {
        navigator['app'].exitApp();
    }
}
