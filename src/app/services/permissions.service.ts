import { Injectable } from '@angular/core';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';
import { AlertComponent } from '../components/alert/alert.component';
import { BehaviorSubject } from 'rxjs';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';

@Injectable({
  providedIn: 'root'
})
export class PermissionsService {

  haveCameraPermission: BehaviorSubject<boolean>; // null indicates, that permission has not been checked yet

  // get haveCameraPermission() {
  //   return this._haveCameraPermission;
  // }

  constructor(
    private _androidPermissions: AndroidPermissions,
    private _alertComponent: AlertComponent
  ) {
    this.haveCameraPermission = new BehaviorSubject<boolean>(null);
  }

  checkCameraPermission() {
    console.log('checking camera permission');
    this._androidPermissions.checkPermission(this._androidPermissions.PERMISSION.CAMERA).then(result => {
      this.setHaveCameraPermission(result.hasPermission);
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
        this._alertComponent.presentPermissionRequiredAlert().then(alertResult => {
          alertResult ? this.checkCameraPermission() : '';
        });
      }
      else {
        this.checkCameraPermission();
      }
    });
  }

  private setHaveCameraPermission(value: boolean) {
    if (value !== this.haveCameraPermission.getValue()) {
      this.haveCameraPermission.next(value);
    }
  }

}
