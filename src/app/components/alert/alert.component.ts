import { Component } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { permissionRequiredAlert } from 'src/app/model/enums/Alerts';

@Component({
  selector: 'app-alert',
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.scss'],
})
export class AlertComponent {

  private _alert: HTMLIonAlertElement;

  constructor(
    private _alertController: AlertController
  ) { }

  async presentPermissionRequiredAlert(): Promise<boolean> {
    let resolveFunction: (confirm: boolean) => void;
    let promise = new Promise<boolean>(resolve => {
      resolveFunction = resolve;
    });

    this._alert = await this._alertController.create({
      cssClass: 'alert',
      header: permissionRequiredAlert.HEADER,
      subHeader: permissionRequiredAlert.SUBHEADER,
      message: permissionRequiredAlert.MESSAGE,
      buttons: [
        {
          text: permissionRequiredAlert.CANCEL_BUTTON_TEXT,
          role: 'CANCEL',
          handler: () => {
            resolveFunction(false);
            navigator['app'].exitApp();
          }
        }, {
          text: permissionRequiredAlert.OK_BUTTON_TEXT,
          cssClass: 'ok-button',
          role: 'OK',
          handler: () => resolveFunction(true)
        }
      ]
    });

    await this._alert.present();
    return promise;
  }



}
