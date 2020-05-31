import { Component, OnInit } from '@angular/core';
import { CameraPreview, CameraPreviewPictureOptions, CameraPreviewOptions } from '@ionic-native/camera-preview/ngx';
import { Router } from '@angular/router';
import { Platform } from '@ionic/angular';
import { ToastComponent } from 'src/app/components/toast/toast.component';
import { cameraStatements } from 'src/app/model/enums/Toast';
import { LoadingComponent } from 'src/app/components/loading/loading.component';

@Component({
  selector: 'app-game',
  templateUrl: './game.page.html',
  styleUrls: ['./game.page.scss'],
})
export class GamePage {

  private _picture: string = '';
  private _base64: string = '';

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
    width: 5000,
    height: 5000,
    quality: 90
  }

  get picture() {
    return this._picture;
  }

  get base64() {
    return this._base64;
  }

  get doShowFabs() {
    return this._doShowFabs;
  }

  get cameraPreviewOpts() {
    return this._cameraPreviewOpts;
  }

  get pictureOpts() {
    return this._pictureOpts;
  }

  constructor(
    private _cameraPreview: CameraPreview,
    private _router: Router,
    private _platform: Platform,
    private _toastComponent: ToastComponent,
    private _loadingComponent: LoadingComponent
  ) {
    this.startCamera();
    this.subscribeToBackButton();
  }

  ionViewWillLeave() {
    this.stopCamera();
    this.unsubscribeToBackButton();
  }

  // #region navigation
  private subscribeToBackButton() {
    this._platform.backButton.subscribe( () => {
      this.navigateToHomeScreen();
    });
  }

  private unsubscribeToBackButton() {
    this._platform.backButton.unsubscribe();
  }

  private navigateToHomeScreen() {
    this._router.navigate(['/home']);
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

  private takePicture() {
    this._cameraPreview.takePicture(this.pictureOpts).then((imageData) => {
      this._picture = 'data:image/jpeg;base64,' + imageData;
      this._base64 = imageData;
      this._doShowFabs = true;
      this.hide();
    }, (err) => {
      this._toastComponent.danger(cameraStatements.CAMERA_UNSUCCESSFULL_PICTURE)
    });
  }

  private savePicture() {
    this._doShowFabs = false;
    this.stopCamera();
    this._loadingComponent.presentLoading();
    // TODO: Send to websocket, start loading
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
