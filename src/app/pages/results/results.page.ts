import { Component } from '@angular/core';
import { Platform } from '@ionic/angular';
import { Router } from '@angular/router';
import { GameService } from 'src/app/services/game.service';
import { Winner, Loser } from 'src/app/model/enums/Results';

@Component({
  selector: 'app-results',
  templateUrl: './results.page.html',
  styleUrls: ['./results.page.scss'],
})
export class ResultsPage {

  private _resultTitle: string;
  private _resultDescription: string;
  private _winner: [string, boolean];

  get resultTitle() {
    return this._resultTitle;
  }

  get resultDescription() {
    return this._resultDescription;
  }

  get winner(): [string, boolean] {
    return this._winner;
  }

  constructor(
    private _platform: Platform,
    private _router: Router,
    private _gameService: GameService
  ) {
    this.subscribeToBackButton();
    this._winner = this._gameService.winner.value;
    this._resultTitle = this._winner[1] ? Winner.TITLE : Loser.TITLE;
    this._resultDescription = this._winner[1] ? Winner.DESC : Loser.DESC;
   }

   ionViewWillLeave() {
    this.unsubscribeToBackButton();
    this._winner = ['', false];
    this._resultTitle = '';
    this._resultDescription = '';
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
