import { Component } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { PermissionRequiredAlert, NetworkConnection } from 'src/app/model/enums/Alerts';

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
    this.dismissAlert(); // prevent double alerts
    let resolveFunction: (confirm: boolean) => void;
    let promise = new Promise<boolean>(resolve => {
      resolveFunction = resolve;
    });

    this._alert = await this._alertController.create({
      cssClass: 'alert',
      header: PermissionRequiredAlert.HEADER,
      subHeader: PermissionRequiredAlert.SUBHEADER,
      message: PermissionRequiredAlert.MESSAGE,
      buttons: [
        {
          text: PermissionRequiredAlert.CANCEL_BUTTON_TEXT,
          role: 'CANCEL',
          handler: () => {
            resolveFunction(false);
            navigator['app'].exitApp();
          }
        }, {
          text: PermissionRequiredAlert.OK_BUTTON_TEXT,
          cssClass: 'ok-button',
          role: 'OK',
          handler: () => resolveFunction(true)
        }
      ]
    });

    await this._alert.present();
    return promise;
  }

  async presentNetworkConnection() {
    this.dismissAlert(); // prevent double alerts

    this._alert = await this._alertController.create({
      cssClass: 'alert',
      header: NetworkConnection.HEADER,
      message: NetworkConnection.MESSAGE,
      buttons: [
        {
          text: NetworkConnection.OK_BUTTON_TEXT,
          cssClass: 'ok-button',
          role: 'OK',
          handler: () => this._alert.dismiss()
        }
      ]
    });

    await this._alert.present();
  }

  dismissAlert() {
    try {
      this._alert.dismiss()
    } catch {}
  }


}
