import { _decorator, Component, Node } from 'cc';

import { GameEvents } from 'db://assets/scripts/GameEvents';
import { gameEventTarget } from 'db://assets/scripts/utils/Events';

const { ccclass, property } = _decorator;

@ccclass('AudioToggler')
export default class extends Component {
	@property(Node)
	off: Node;

	@property(Node)
	on: Node;

	private _isMute: boolean = false;

	onLoad() {
		this.off.active = this._isMute;

		this.scheduleOnce(() => {
			//@ts-ignore
			this.node.active = window.apiName !== 'IronSource';

			//@ts-ignore
			if (window.super_html_channel?.includes('ironsource')) {
				this.node.active = false;
			}
		});
	}

	private _subscribeEvents(isOn: boolean) {
		const func: string = isOn ? 'on' : 'off';

		this.node[func](Node.EventType.TOUCH_START, this.onTouch, this);
	}

	onEnable() {
		this._subscribeEvents(true);
	}

	onDisable() {
		this._subscribeEvents(false);
	}

	onTouch() {
		gameEventTarget.emit(GameEvents.TOGGLE_SOUND, this._isMute);

		this._isMute = !this._isMute;
		
		this.off.active = this._isMute;
	}
}
