import { _decorator, Component, EventTouch, Input, Vec2 } from 'cc';

import { gameEventTarget, handlesEvent } from 'db://assets/scripts/utils/Events';
import { GameEvents } from 'db://assets/scripts/GameEvents';

const { ccclass, property } = _decorator;


@ccclass('ScreenInput')
export class ScreenInput extends Component {
	private touchStartPos: Vec2 = null;
	private touchCurrPos: Vec2 = null;
	private touchEndPos: Vec2 = null;
	private isRedirectOnAllScreen: boolean = false;
	private isMusicOn = false;

	@handlesEvent(Input.EventType.TOUCH_START, true)
	private onTouchStart(event: EventTouch) {
		if (this.isRedirectOnAllScreen) {
			return;
		}

		this.touchStartPos = event.getLocation();
		this.touchCurrPos = event.getLocation();
		this.touchEndPos = null;

		gameEventTarget.emit(GameEvents.INPUT_DOWN, this.touchStartPos, this.touchCurrPos);

		!this.isMusicOn && gameEventTarget.emit(GameEvents.SOUND_PLAY, 'bgm');
		this.isMusicOn = true;
	}

	@handlesEvent(Input.EventType.TOUCH_END, true)
	private onTouchEnd(event: EventTouch) {
		if (this.isRedirectOnAllScreen) {
			gameEventTarget.emit(GameEvents.REDIRECT);
			return;
		}

		gameEventTarget.emit(GameEvents.INPUT_UP, this.touchStartPos, this.touchCurrPos);

		this.touchEndPos = this.touchCurrPos;

		this.touchStartPos = null;
		this.touchCurrPos = null;

	}

	@handlesEvent(Input.EventType.TOUCH_CANCEL, true)
	private onTouchCancel(event: EventTouch) {
		if (this.isRedirectOnAllScreen) {
			gameEventTarget.emit(GameEvents.REDIRECT);
			return;
		}

		gameEventTarget.emit(GameEvents.INPUT_CANCEL);

		this.touchStartPos = null;
		this.touchCurrPos = null;
	}

	@handlesEvent(Input.EventType.TOUCH_MOVE, true)
	private onTouchMove(event: EventTouch) {
		if (this.isRedirectOnAllScreen) {
			return;
		}

		if (this.touchCurrPos && this.touchStartPos) {
			let delta = new Vec2();
			Vec2.subtract(delta, this.touchCurrPos, this.touchStartPos);

			gameEventTarget.emit(GameEvents.INPUT_MOVE, this.touchCurrPos, delta);
		}

		this.touchCurrPos = event.getLocation();
	}

	@handlesEvent(GameEvents.TOGGLE_SCREEN_REDIRECT)
	private onToggleAllScreen() {
		this.isRedirectOnAllScreen = true;
	}
}
