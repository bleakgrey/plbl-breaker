import { _decorator, Component, Node, CCInteger, math } from 'cc';
import { gameEventTarget, handlesEvent } from '../utils/Events';
import { GameEvents, IBubbleEvent } from '../GameEvents';
import { Level } from './Level';
import Strings from '../Strings';
const { ccclass, property } = _decorator;

@ccclass('PlayerUpgrade')
export class PlayerUpgrade {
	@property(CCInteger)
	expNeeded = 0;
}

@ccclass('PlayerUpgradeManager')
export class PlayerUpgradeManager extends Component {
	@property(Node)
	playerNode: Node;

	@property([PlayerUpgrade])
	upgrades: PlayerUpgrade[] = [];

	private currentExp = 0;

	private currentLevel = 1;

	private get currentUpgrade() {
		return this.upgrades[this.currentLevel];
	}

	start() {
		this.upgrade(1);
	}

	private upgrade(level: number) {
		if (this.currentLevel != level) {
			const bubble: IBubbleEvent = {
				text: Strings.LEVEL_UP,
				worldPos: this.playerNode.getWorldPosition().clone(),
				tint: math.Color.YELLOW,
			}
			gameEventTarget.emit(GameEvents.BUBBLE, bubble);
		}

		this.currentLevel = level;

		const levelComp = this.playerNode.getComponent(Level);
		levelComp.level = this.currentLevel;

		gameEventTarget.emit(GameEvents.PLAYER_UPGRADE, level);
		this.updateBalance();
	}

	@handlesEvent(GameEvents.DIED)
	private onPropDestroyed(node: Node) {
		this.currentExp++;

		this.updateBalance()
		this.scheduleOnce(() => {
			if (this.currentExp >= this.currentUpgrade.expNeeded) {
				this.currentExp = this.currentExp - this.currentUpgrade.expNeeded;
				this.upgrade(this.currentLevel + 1);
			}
		}, 0.5)
	}

	private updateBalance() {
		gameEventTarget.emit(GameEvents.UPDATE_BALANCE, this.currentExp, this.currentUpgrade.expNeeded)
	}
}