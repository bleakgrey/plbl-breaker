import { _decorator, Component, Input, EventTouch } from 'cc';
import { gameEventTarget, handlesEvent } from 'db://assets/scripts/utils/Events';
import { GameEvents } from 'db://assets/scripts/GameEvents';

const { ccclass } = _decorator;

@ccclass('Cta')
export default class extends Component {

	@handlesEvent(Input.EventType.TOUCH_START, true)
	private onTouch(event: EventTouch) {
		gameEventTarget.emit(GameEvents.REDIRECT);
	}
	
}