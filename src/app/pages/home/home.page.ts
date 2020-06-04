import { Component } from '@angular/core';
import { GameStatus } from '../../model/enums/GameStatus';
import { GameService, UIMessage } from '../../services/game.service';
import { Router } from '@angular/router';
import { Platform } from '@ionic/angular';
import { ToastComponent } from 'src/app/components/toast/toast.component';
import { AnimationComponent } from 'src/app/components/animation/animation.component';
import { LoadingComponent } from 'src/app/components/loading/loading.component';

@Component({
    selector: 'app-home',
    templateUrl: 'home.page.html',
    styleUrls: ['home.page.scss'],
})
export class HomePage {

    // WebSocket
    private _socketStatusMessage: string = '';

    // Game
    private _gameStatus: GameStatus;
    private _requiredNumberOfPlayers: number;
    private _gameStatusIcon: string;
    private _numberOfConnectedPlayers: number;
    private _numberOfReadyPlayers: number;
    private _numberOfFreeSlots: number;
    private _canGameBeStarted: boolean;

    // Player
    private _playerId: string;
    private _playerName: string;
    private _isPlayerNameValid: boolean;
    private _isPlayerIdValid: boolean;
    private _isPlayerReady: boolean;
    private _isPlayerAdmin: boolean;

    isIconSpinning: boolean = false;


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

    get canGameBeStarted(): boolean {
        return this._canGameBeStarted;
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
        private _toastComponent: ToastComponent,
        private _animationComponent: AnimationComponent,
        private _loadingComponent: LoadingComponent
    ) { }

    ngOnInit() {
        this._gameStatus = GameStatus.CONNECTING_TO_SERVER;
        this._requiredNumberOfPlayers = 2;

        this.subscribeToService();
        this.subscribeToBackButton();
    }

    spinIconControl() {
        if (this.gameStatusIcon === 'sync') {
            this._animationComponent.spin(document.querySelector('.stateIcon'));
        } else {
            this._animationComponent.stopAnimation();
        }
    }

    //#region Initializers functions
    private subscribeToService() {
        this._gameService.socketConnectionStatus.subscribe(socketStatus => {
            this._socketStatusMessage = this.getWebSocketStatusString(socketStatus);
        })

        this._gameService.gameStatus.subscribe((gameStatus: GameStatus) => {
            this._gameStatus = gameStatus;
            this._gameStatusIcon = this.getCurrentGameStatusIconName(gameStatus);
            this.spinIconControl();

            if (this._gameStatus == GameStatus.GAME_IS_STARTING) {
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

        this._gameService.numberOfFreeSlots.subscribe(freeSlots => {
            this._numberOfFreeSlots = freeSlots;
        })

        this._gameService.canGameBeStarted.subscribe(canGameBeStarted => {
            this._canGameBeStarted = canGameBeStarted;
        })

        this._gameService.uIMessage.subscribe((message: UIMessage) => {
            if (message != null) {
                this._toastComponent.showToast(message);
            }
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
        // console.log(`icon: ${gameStatusIcon}`);
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
        return ![
            GameStatus.ALL_SLOTS_ARE_FULL,
            GameStatus.DISCONNECTED_FROM_SERVER,
            GameStatus.SOME_GAME_IS_TAKING_PLACE,
            GameStatus.AWS_KEYS_NOT_LOADED,
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

    private subscribeToBackButton() {
        this._platform.backButton.subscribe(() => this.exitApp());
    }

    private unsubscribeFromBackButton() {
        this._platform.backButton.unsubscribe();
    }

    startGame() {
        this._gameService.startGame();
    }

    reconnect() {
        this._gameService.reconnectToSocket();
    }

    exitApp() {
        navigator['app'].exitApp();
    }
    //#endregion
}
