import { Component, OnInit } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { toastStates } from 'src/app/model/enums/Toast';
import { UIMessage, UIMessageType } from 'src/app/services/game.service';

@Component({
  selector: 'app-toast',
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.scss'],
})
export class ToastComponent {

  constructor(
    private _toastController: ToastController
  ) { }

  async presentToast(message: string, color: string) {
    const toast = await this._toastController.create({
      message: message,
      color: color,
      duration: 2000
    });
    toast.present();
  }

  info(message) {
    this.presentToast(message, toastStates.INFO);
  }

  success(message) {
    this.presentToast(message, toastStates.SUCCESS);
  }

  warn(message) {
    this.presentToast(message, toastStates.WARNING);
  }

  danger(message) {
    this.presentToast(message, toastStates.DANGER);
  }

  showToast(message: UIMessage) {
    switch (message.type) {
        case UIMessageType.INFO: {
            this.info(message.content)
            break;
        }
        case UIMessageType.SUCCESS: {
            this.success(message.content)
            break;
        }
        case UIMessageType.WARN: {
            this.warn(message.content)
            break;
        }
        case UIMessageType.DANGER: {
            this.danger(message.content)
            break;
        }
    }
}

}
