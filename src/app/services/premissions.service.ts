import { Injectable } from '@angular/core';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';
import { AlertComponent } from '../components/alert/alert.component';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PremissionsService {

  haveCameraPermission: BehaviorSubject<boolean>;

  // get haveCameraPermission() {
  //   return this._haveCameraPermission;
  // }

  constructor(
    private _androidPermissions: AndroidPermissions,
    private _alertComponent: AlertComponent
  ) {
    this.haveCameraPermission = new BehaviorSubject<boolean>(null); // null indicates, that permission has not been checked yet}
  }

  checkCameraPermission() {
    this._androidPermissions.checkPermission(this._androidPermissions.PERMISSION.CAMERA).then(
      result => {
        this.haveCameraPermission.next(result.hasPermission);
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
    this._androidPermissions.requestPermission(this._androidPermissions.PERMISSION.CAMERA).then((result) => {
      if (!result.hasPermission) {
        this._alertComponent.presentPermissionRequiredAlert().then(result => {
          result ? this.checkCameraPermission() : '';
        });
      }
    });
  }


}
