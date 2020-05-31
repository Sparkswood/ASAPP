import { Component } from '@angular/core';
import { Platform } from '@ionic/angular';
import { Router } from '@angular/router';
import { firstPlace, fourthPlace, secondPlace, thirdPlace } from 'src/app/model/enums/Results';

@Component({
  selector: 'app-results',
  templateUrl: './results.page.html',
  styleUrls: ['./results.page.scss'],
})
export class ResultsPage {

  private _resultTitle: string;
  private _resultDescription: string;

  get resultTitle() {
    return this._resultTitle;
  }

  get resultDescription() {
    return this._resultDescription;
  }

  constructor(
    private _platform: Platform,
    private _router: Router
  ) {
    this.subscribeToBackButton();
    this._resultTitle = fourthPlace.TITLE;
    this._resultDescription = thirdPlace.DESC;
   }

   ionViewWillLeave() {
     this.unsubscribeToBackButton();
   }

    // #region navigation
    private subscribeToBackButton() {
      this._platform.backButton.subscribe( () => {
        this.navigateToHomeScreen();
      });
    }
  
    private unsubscribeToBackButton() {
      this._platform.backButton.unsubscribe();
    }
  
    private navigateToHomeScreen() {
      this._router.navigate(['/home']);
    }

    private exitApp() {
      navigator['app'].exitApp();
    }
  
    // #endregion

}
