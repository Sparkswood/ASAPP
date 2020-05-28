import { Component, OnInit } from '@angular/core';
import { Plugins, CameraSource, CameraResultType } from '@capacitor/core';

@Component({
  selector: 'app-game',
  templateUrl: './game.page.html',
  styleUrls: ['./game.page.scss'],
})
export class GamePage implements OnInit {
  
  image: any;

  constructor() { }

  ngOnInit() {
    this.takePicture();
  }

  async takePicture() {

    // plugin runs native camera
    const capturedImage = await Plugins.Camera.getPhoto({
      quality: 90,
      // allow to edit captured photo
      allowEditing: false,
      // source- can be also gallery and prompt
      source: CameraSource.Camera,
      resultType: CameraResultType.Uri
    });

    // webPath to render photo on app page
    this.image = capturedImage.webPath;

    // base64 format to send to websocket
    console.log(capturedImage.base64String);
  }

}
