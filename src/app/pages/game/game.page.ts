import { Component, OnInit } from '@angular/core';
import { CameraPreview, CameraPreviewPictureOptions, CameraPreviewOptions, CameraPreviewDimensions } from '@ionic-native/camera-preview/ngx';

@Component({
  selector: 'app-game',
  templateUrl: './game.page.html',
  styleUrls: ['./game.page.scss'],
})
export class GamePage {

  picture = '';
  base64 = '';

  showFabs = false;

  cameraPreviewOpts: CameraPreviewOptions = {
    x: 0,
    y: 62,
    width: window.innerWidth,
    height: window.innerHeight - 62,
    camera: 'rear',
    tapPhoto: true,
    previewDrag: true,
    toBack: true,
    tapToFocus: true,
    alpha: 1
  }

  pictureOpts: CameraPreviewPictureOptions = {
    width: 5000,
    height: 5000,
    quality: 90
  }


  constructor(
    private cameraPreview: CameraPreview
  ) {
    this.startCamera();
  }

  startCamera() {
    this.cameraPreview.startCamera(this.cameraPreviewOpts).then(
      () => {
        this.show();
      },
      (err) => {
        // TODO: Throw exception: Camera error
      });
  }

  show() {
    this.cameraPreview.show();
  }

  stopCamera() {
    this.cameraPreview.stopCamera();
  }

  hide() {
    this.cameraPreview.hide();
  }

  takePicture() {
    this.cameraPreview.takePicture(this.pictureOpts).then((imageData) => {
      this.picture = 'data:image/jpeg;base64,' + imageData;
      this.base64 = imageData;
      this.hide();
      this.showFabs = true;
    }, (err) => {
      // TODO: Throw exception: Taking picture unsuccessful
    });
  }

  savePicture() {
    this.showFabs = false;
    this.stopCamera();
    // TODO: Send to websocket
  }

  discardPicture() {
    this.showFabs = false;
    this.base64 = '';
    this.picture = '';
    this.show();
  }

}
