import { Component, OnInit, Input } from '@angular/core';
import { GameStatus } from '../../model/enums/GameStatus';
import { GameService } from '../../services/game.service';
import { Router } from '@angular/router';
import { Platform } from '@ionic/angular';
import { AnimationComponent } from 'src/app/components/animation/animation.component';
import { ColorThemeService } from 'src/app/services/color-theme.service';

@Component({
    selector: 'app-home',
    templateUrl: 'home.page.html',
    styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {

    // WebSocket
    private _socketStatusMessage: string = '';

    // Game
    private _gameStatus: GameStatus;
    private _requiredNumberOfPlayers: number;
    private _gameStatusIcon: string;
    private _numberOfConnectedPlayers: number;
    private _numberOfReadyPlayers: number;
    private _numberOfFreeSlots: number;
    private _isDarkMode: boolean;

    // Player
    private _playerId: string;
    private _playerName: string;
    private _isPlayerNameValid: boolean;
    private _isPlayerIdValid: boolean;
    private _isPlayerReady: boolean;
    private _isPlayerAdmin: boolean;

    // WebSocket
    get socketStatusMessage(): string {
        return this._socketStatusMessage;
    }

    // Game
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

    get gameStatusIcon(): string {
        return this._gameStatusIcon;
    }

    get numberOfFreeSlots(): number {
        return this._numberOfFreeSlots;
    }

    get isDarkMode(): boolean {
        return this._isDarkMode;
    }

    // Player
    get isPlayerReady(): boolean {
        return this._isPlayerReady;
    }

    get isPlayerAdmin(): boolean {
        return this._isPlayerAdmin;
    }

    get playerId() {
        return this._playerId;
    }

    get isPlayerIdValid(): boolean {
        return this._isPlayerIdValid;
    }

    get playerName(): string {
        return this._playerName;
    }

    get isPlayerNameValid(): boolean {
        return this._isPlayerNameValid;
    }

    set playerName(value: string) {
        this._playerName = value;
        this._gameService.setPlayerName(this._playerName);
    }

    constructor(
        private _gameService: GameService,
        private _router: Router,
        private _platform: Platform,
        private _animationComponent: AnimationComponent,
        private _colorThemeService: ColorThemeService
    ) { }

    ngOnInit() {
        this.subscribeToServiceControls();
        this.subscribeToBackButton();
        this._isDarkMode = this._colorThemeService.isDark;
    }

    spinIconControl() {
        if (this._gameStatusIcon === 'sync') {
            this._animationComponent.spin(document.querySelector('.stateIcon'));
        } else {
            this._animationComponent.stopAnimation();
        }
    }

    changeColorMode() {
        this._isDarkMode = !this._isDarkMode;
        this._colorThemeService.toggleDarkTheme(this._isDarkMode);
    }

    //#region Initializers functions
    private subscribeToServiceControls() {
        this._gameService.gameStatus.subscribe((gameStatus: GameStatus) => {
            this._gameStatus = gameStatus;
            this._gameStatusIcon = this.getCurrentGameStatusIconName(gameStatus);
            this.spinIconControl();

            if (this._gameStatus == GameStatus.GAME_IS_STARTING) {
                this.navigateToGameScreen();
            }
        });

        this._gameService.isServiceInitialized.subscribe(isInitialzed => {
            if (isInitialzed) {
                console.log('resubscribing to service');
                this.setInitialValues();
                this.subscribeToService();
            }
        });
    }

    private setInitialValues() {
        this._isPlayerAdmin = false;
        this._isPlayerIdValid = false;
        this._isPlayerReady = false;
        this._gameService.setPlayerName(this._playerName);
    }

    private subscribeToService() {
        this._gameService.socketConnectionStatus.subscribe(socketStatus => {
            this._socketStatusMessage = this.getWebSocketStatusString(socketStatus);
        });

        this._gameService.playerId.subscribe(playerId => {
            this._playerId = playerId;
        });

        this._gameService.isPlayerIdValid.subscribe(isIdValid => {
            this._isPlayerIdValid = isIdValid;
        });

        this._gameService.isPlayerNameValid.subscribe(isNameValid => {
            this._isPlayerNameValid = isNameValid;
        });

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
        });

        this._gameService.numberOfFreeSlots.subscribe(freeSlots => {
            this._numberOfFreeSlots = freeSlots;
        });
    }
    //#endregion

    //#region Getters functions
    getGameStatusString(): string {
        let newGameStatus: string;

        switch (this._gameStatus) {
            case GameStatus.WAITING_FOR_ADMIN_TO_START_THE_GAME: {
                newGameStatus = `Waiting for ${this.isPlayerAdmin ? 'you' : 'admin'} to start the game`;
                break;
            }
            default: {
                newGameStatus = this._gameStatus;
                break;
            }
        }
        return newGameStatus;
    }

    getCurrentGameStatusIconName(gameStatus: GameStatus): string {
        let gameStatusIcon = '';

        switch (gameStatus) {
            case GameStatus.WAITING_FOR_CAMERA_PERMISSION: {
                gameStatusIcon = 'camera';
                break;
            }
            case GameStatus.CONNECTING_TO_SERVER: {
                gameStatusIcon = 'hourglass';
                break;
            }
            case GameStatus.RECONNECTING_TO_SERVER: {
                gameStatusIcon = 'sync';
                break;
            }
            case GameStatus.ALL_SLOTS_ARE_FULL: {
                gameStatusIcon = 'sad';
                break;
            }
            case GameStatus.SOME_GAME_IS_TAKING_PLACE: {
                gameStatusIcon = 'hand-left';
                break;
            }
            case GameStatus.WAITING_FOR_READY_STATUS: {
                gameStatusIcon = 'glasses';
                break;
            }
            case GameStatus.WAITING_FOR_OTHER_PLAYERS: {
                gameStatusIcon = 'hourglass';
                break;
            }
            case GameStatus.WAITING_FOR_ADMIN_TO_START_THE_GAME: {
                gameStatusIcon = 'play-circle';
                break;
            }
            case GameStatus.GAME_IS_STARTING: {
                gameStatusIcon = 'aperture';
                break;
            }
            case GameStatus.DISCONNECTED_FROM_SERVER: {
                gameStatusIcon = 'alert-circle';
                break;
            }
            case GameStatus.INTERNAL_SERVER_ERROR: {
                gameStatusIcon = 'close-circle';
                break;
            }
            case GameStatus.AWS_KEYS_NOT_LOADED: {
                gameStatusIcon = 'logo-amazon';
                break;
            }
        }
        return gameStatusIcon;
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
    canGameBeJoinedTo(): boolean {
        return this._gameService.canGameBeJoinedTo();
    }

    canGameBeStarted(): boolean {
        return this._gameService.canGameBeStarted();
    }
    //#endregion

    //#region Actuators functions
    toggleReadyState() {
        this._gameService.togglePlayerReadyState();
    }

    reportReadyState() {
        this._gameService.reportPlayerName();
        this._gameService.reportPlayerReadyState(true);
    }

    reportNotReadyState() {
        this._gameService.reportPlayerReadyState(false);
    }

    reconnect() {
        this._gameService.reconnectToSocket();
    }

    private navigateToGameScreen() {
        this._router.navigate(['/game']);
    }

    private subscribeToBackButton() {
        this._platform.backButton.subscribe(() => this.exitApp());
    }

    startGame() {
        this._gameService.startGame();
    }

    exitApp() {
        this._gameService.reconnectToSocket();
        navigator['app'].exitApp();
    }
    //#endregion
}
