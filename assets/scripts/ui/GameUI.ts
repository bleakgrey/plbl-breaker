import { _decorator, CCInteger, Component, Node, Tween, tween } from "cc";
import { GameEvents } from "../GameEvents";
import { gameEventTarget, handlesEvent } from "../utils/Events";
import { UIElements } from "../UIElements";
const { ccclass, property } = _decorator;

@ccclass("GameUI")
export default class extends Component {
	@property(CCInteger)
	hintDelay = 5;

	isPackshot = false;

	hintTween: Tween;

	@handlesEvent(GameEvents.JOYSTICK_MOVE_START)
	private onInputStart() {
		if (this.isPackshot) {
			return;
		}

		this.hintTween?.stop();
		gameEventTarget.emit(
			GameEvents.UI_ELEMENT_HIDE,
			UIElements.IDLE_SCREEN,
		);
	}

	@handlesEvent(GameEvents.JOYSTICK_MOVE_END)
	private onInputEnd() {
		if (this.isPackshot) {
			return;
		}

		this.hintTween?.stop();
		this.hintTween = tween(this)
			.delay(this.hintDelay)
			.call(() =>
				gameEventTarget.emit(
					GameEvents.UI_ELEMENT_SHOW,
					UIElements.IDLE_SCREEN,
				)
			)
			.start();
	}

	@handlesEvent(GameEvents.UI_ELEMENT_SHOW)
	private onElemShow(element: UIElements) {
		if (element == UIElements.PACKSHOT_SCREEN) {
			gameEventTarget.emit(GameEvents.INPUT_UP);
			gameEventTarget.emit(GameEvents.JOYSTICK_MOVE_END);
			gameEventTarget.emit(GameEvents.TOGGLE_SCREEN_REDIRECT);
			gameEventTarget.emit(GameEvents.UI_ELEMENT_HIDE, UIElements.HUD);

			this.onInputStart();
			this.isPackshot = true;
		}
	}
}
