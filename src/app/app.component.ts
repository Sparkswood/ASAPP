import { Component } from '@angular/core';

import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { PermissionsService } from './services/permissions.service';
import { ColorThemeService } from './services/color-theme.service';
import { Network } from '@ionic-native/network/ngx';
import { LoadingComponent } from './components/loading/loading.component';
import { NetworkConnection } from './model/enums/Alerts';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {

  private _networkConnection: [boolean, boolean];

  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private _loadingComponent: LoadingComponent,
    private _permissionsService: PermissionsService,
    private _colorThemeService: ColorThemeService,
    private _network: Network
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
      this._permissionsService.checkCameraPermission();
      this._colorThemeService.checkDeviceTheme();

      this._network.onDisconnect().subscribe(() => {
        console.log('disconnected');
        this._networkConnection = [false, false];
        setTimeout(() => {
          if (!this._networkConnection[0]) {
            this._loadingComponent.presentLoading(NetworkConnection.LOST);
            this._networkConnection[1] = true;
          }
        }, 5000);
      });

      this._network.onConnect().subscribe(() => {
        this._networkConnection[0] = true;
        if (this._networkConnection[1]) {
          this._loadingComponent.dismissLoading();
          this._networkConnection[1] = false;
        }
      });

    });
  }

}
