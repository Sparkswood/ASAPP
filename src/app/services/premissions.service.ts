import { Injectable } from '@angular/core';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';
import { AlertComponent } from '../components/alert/alert.component';

@Injectable({
  providedIn: 'root'
})
export class PremissionsService {

  private _haveCameraPermission: boolean;

  get haveCameraPermission() {
    return this._haveCameraPermission;
  }

  constructor(
    private _androidPermissions: AndroidPermissions,
    private _alertComponent: AlertComponent
  ) {}

  checkCameraPermission() {
    this._androidPermissions.checkPermission(this._androidPermissions.PERMISSION.CAMERA).then(
      result => {
        this._haveCameraPermission = result.hasPermission;
        if (!result.hasPermission) {
          this.requestPermission();
        }
      },
      err => {
        this.requestPermission();
      }
    );
  }

  requestPermission() {
    this._androidPermissions.requestPermission(this._androidPermissions.PERMISSION.CAMERA).then( (result) => {
      if (!result.hasPermission) {
        this._alertComponent.presentPermissionRequiredAlert().then( result => {
          result ? this.checkCameraPermission() : '';
        });
      }
    });
  }


}
