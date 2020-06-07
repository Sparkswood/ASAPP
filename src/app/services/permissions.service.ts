import { Injectable } from '@angular/core';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';
import { AlertComponent } from '../components/alert/alert.component';
import { BehaviorSubject } from 'rxjs';
import { Network } from '@ionic-native/network/ngx';
import { NetworkConnection } from '../model/enums/Alerts';

@Injectable({
  providedIn: 'root'
})
export class PermissionsService {

  haveCameraPermission: BehaviorSubject<boolean>; // null indicates, that permission has not been checked yet

  constructor(
    private _androidPermissions: AndroidPermissions,
    private _alertComponent: AlertComponent,
    private _network: Network
  ) {
    this.haveCameraPermission = new BehaviorSubject<boolean>(null);
  }

  checkCameraPermission() {
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

  monitorizeNetworkConnection() {
    this._network.onDisconnect().subscribe(() => {
      setTimeout( () => {
        this._alertComponent.presentNetworkConnection();
      }, 5000);
    });
  }

}
