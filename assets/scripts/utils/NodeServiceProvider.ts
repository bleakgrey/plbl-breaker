import { _decorator, Component, Enum } from 'cc';
import { GameServices } from '../GameServices';
import { provide, unprovide } from './Locator';
const { ccclass, property } = _decorator;

@ccclass('NodeServiceProvider')
export default class extends Component {
	@property({
		type: Enum(GameServices),
	})
	token = GameServices.INVALID;

	protected onEnable() {
		provide(this.token, this.node);
	}

	protected onDisable() {
		unprovide(this.token, this.node);
	}
}


