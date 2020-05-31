import { Component } from '@angular/core';
import { LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-loading',
  templateUrl: './loading.component.html',
  styleUrls: ['./loading.component.scss'],
})
export class LoadingComponent {

  private _loading: HTMLIonLoadingElement;
  private _playersToWait: string = '1 player';


  constructor(
    private _loadingController: LoadingController
  ) { }

  async presentLoading() {
    this._loading = await this._loadingController.create({
      cssClass: 'loading',
      spinner: 'circular',
      message: `Waiting for ${this._playersToWait} ...`
    });
    await this._loading.present();
  }

  async dismissLoading() {
    this._loading.dismiss();
  }

}
