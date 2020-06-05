import { Component, OnInit } from '@angular/core';
import { CameraPreview, CameraPreviewPictureOptions, CameraPreviewOptions } from '@ionic-native/camera-preview/ngx';
import { Router } from '@angular/router';
import { Platform } from '@ionic/angular';
import { ToastComponent } from 'src/app/components/toast/toast.component';
import { cameraStatements } from 'src/app/model/enums/Toast';
import { LoadingComponent } from 'src/app/components/loading/loading.component';
import { GameService } from 'src/app/services/game.service';
import { GameStatus } from 'src/app/model/enums/GameStatus';

@Component({
  selector: 'app-game',
  templateUrl: './game.page.html',
  styleUrls: ['./game.page.scss'],
})
export class GamePage implements OnInit {

  private _picture: string = '';
  private _base64: string = '';

  private _gameStatus: GameStatus;
  private _gameWord: string = '';
  private _playerAnswerState: Date = new Date();

  private _doShowFabs: boolean = false;

  private _cameraPreviewOpts: CameraPreviewOptions = {
    x: 0,
    y: 56,
    width: window.innerWidth,
    height: window.innerHeight - 56,
    camera: 'rear',
    tapPhoto: true,
    previewDrag: true,
    toBack: true,
    tapToFocus: true,
    alpha: 1
  }

  private _pictureOpts: CameraPreviewPictureOptions = {
    width: 1000,
    height: 1000,
    quality: 90
  }

  get picture(): string {
    return this._picture;
  }

  get base64(): string {
    return this._base64;
  }

  get gameStatus(): GameStatus {
    return this._gameStatus;
  }

  get gameWord(): string {
    return this._gameWord;
  }

  get playerAnswerState(): Date {
    return this._playerAnswerState;
  }

  get doShowFabs(): boolean {
    return this._doShowFabs;
  }

  get cameraPreviewOpts(): CameraPreviewOptions {
    return this._cameraPreviewOpts;
  }

  get pictureOpts(): CameraPreviewPictureOptions {
    return this._pictureOpts;
  }

  constructor(
    private _cameraPreview: CameraPreview,
    private _router: Router,
    private _platform: Platform,
    private _toastComponent: ToastComponent,
    private _loadingComponent: LoadingComponent,
    private _gameService: GameService
  ) { }

  ngOnInit() {
    this.startCamera();
    this.subscribeToBackButton();
    this.subscribeToService();
  }

  ionViewWillLeave() {
    this.stopCamera();
    // this.unsubscribeToBackButton();
  }

  // #region service

  private subscribeToService() {
    this._gameService.gameStatus.subscribe((gameStatus: GameStatus) => {
      this._gameStatus = gameStatus;
      if (this._gameStatus == GameStatus.GAME_OVER) {
        this._loadingComponent.dismissLoading();
        this.navigateToResultsScreen();
        // this.unsubscribeFromService();
      }
      else {
        console.log(`game: ${gameStatus}`);

        // TODO: Decide what to do here;
        this._toastComponent.warn(gameStatus);
      }
    });

    this._gameService.gameWord.subscribe(gameWord => {
      this._gameWord = gameWord;
    });

    this._gameService.playerAnswerState.subscribe(answerState => {
      console.log(`answer: ${answerState}`);
      if (answerState != null || answerState > this._playerAnswerState) {
        this.discardPicture();
        this._loadingComponent.dismissLoading();
      }
      this._playerAnswerState = answerState;
    });
  }

  private unsubscribeFromService() {
    this._gameService.gameStatus.unsubscribe();
    this._gameService.gameWord.unsubscribe();
    this._gameService.playerAnswerState.unsubscribe();
  }
  // #endregion

  // #region navigation
  private subscribeToBackButton() {
    this._platform.backButton.subscribe(() => {
      this.navigateToHomeScreen();
    });
  }

  private navigateToHomeScreen() {
    this._gameService.reconnectToSocket();
    this._router.navigate(['/home']);
  }

  private navigateToResultsScreen() {
    this._router.navigate(['/results']);
  }

  // #endregion

  // #region camera
  private startCamera() {
    this._cameraPreview.startCamera(this.cameraPreviewOpts).then(
      () => {
        this.show();
      },
      () => {
        this._toastComponent.danger(cameraStatements.CAMERA_ERROR)
        this.navigateToHomeScreen();
      });
  }

  private stopCamera() {
    this._cameraPreview.stopCamera();
  }

  private show() {
    this._cameraPreview.show();
  }

  private hide() {
    this._cameraPreview.hide();
  }

  takePicture() {
    this._cameraPreview.takePicture(this.pictureOpts).then((imageData) => {
      this._picture = 'data:image/jpeg;base64,' + imageData;
      this._base64 = imageData[0];
      this._doShowFabs = true;
      this.hide();
    }, (err) => {
      this._toastComponent.danger(cameraStatements.CAMERA_UNSUCCESSFULL_PICTURE)
    });
  }

  savePicture() {
    this._doShowFabs = false;
    this._gameService.sendPhoto(this._base64);
    this._playerAnswerState = new Date();
    this._loadingComponent.presentLoading(`Waiting for results ...`);
  }

  private discardPicture() {
    this._doShowFabs = false;
    this._base64 = '';
    this._picture = '';
    this.show();
  }

  private isPictureTaken() {
    return this._picture !== '';
  }
  // #endregion


}
