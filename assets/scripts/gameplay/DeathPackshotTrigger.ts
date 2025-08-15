import { _decorator, Component, Node, director, tween } from 'cc';
import { gameEventTarget, handlesEvent } from '../utils/Events';
import { GameEvents } from '../GameEvents';
import { UIElements } from '../UIElements';
const { ccclass, property } = _decorator;

@ccclass('DeathPackshotTrigger')
export default class extends Component {
	@handlesEvent(GameEvents.DIED)
	private onDied(node: Node) {
		if (node == this.node) {
			tween(this.node.parent)
				.delay(0.5)
				.call(() => {
					gameEventTarget.emit(GameEvents.UI_ELEMENT_SHOW, UIElements.PACKSHOT_SCREEN);
				})
				.start();
		}
	}
}