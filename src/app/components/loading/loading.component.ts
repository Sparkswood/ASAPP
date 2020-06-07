import { Component } from '@angular/core';
import { LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-loading',
  templateUrl: './loading.component.html',
  styleUrls: ['./loading.component.scss'],
})
export class LoadingComponent {

  private _loading: HTMLIonLoadingElement;


  constructor(
    private _loadingController: LoadingController
  ) { }

  async presentLoading(message) {
    this.dismissLoading();  // prevent double loadings
    this._loading = await this._loadingController.create({
      cssClass: 'loading',
      spinner: 'circular',
      message: message
    });
    await this._loading.present();
  }

  dismissLoading() {
    try {
      this._loading.dismiss();
    } catch {}
  }

}
