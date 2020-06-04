import { Component, OnInit } from '@angular/core';
import { Animation, AnimationController } from '@ionic/angular';

@Component({
  selector: 'app-animation',
  templateUrl: './animation.component.html',
  styleUrls: ['./animation.component.scss'],
})
export class AnimationComponent {

  private _animation: Animation;

  constructor(
    private animationController: AnimationController
  ) { }

  spin(myElementRef) {
    this._animation = this.animationController.create()
    .addElement(myElementRef)
    .duration(1000)
    .iterations(Infinity)
    .keyframes([
      { offset: 0, transform: 'rotate(0)' },
      { offset: 0.5, transform: 'rotate(90deg)' },
      { offset: 1, transform: 'rotate(180deg)' }
    ]);

    this._animation.play();
  }

  stopAnimation() {
    if (this._animation) {
      this._animation.stop();
    }
  }

}
