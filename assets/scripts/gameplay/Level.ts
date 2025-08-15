import { _decorator, Component, Label, Node, Vec3 } from 'cc';
import { GameEvents, IDamageEvent } from '../GameEvents';
import { handlesEvent } from '../utils/Events';
import { PoolManager } from '../utils/PoolManager';
import { locateOne } from '../utils/Locator';
import { GameServices } from '../GameServices';
import CloudRenderer from '../ui/CloudRenderer';
import Strings from '../Strings';
const { ccclass, property, disallowMultiple } = _decorator;

@ccclass('Level')
@disallowMultiple(true)
export class Level extends Component {
	@property
	level: number = 1

	private cloud: Node;

	start() {
		this.cloud = PoolManager.instance.get('level');

		const cloudRenderer = this.cloud.getComponent(CloudRenderer);
		cloudRenderer.targetWorldPos = this.node.worldPosition;
		cloudRenderer.targetOffsetPos = new Vec3(0, 2.0, 0);
		this.updateCloud();

		const container: Node = locateOne(GameServices.UI_CONTAINER);
		container.addChild(this.cloud);
	}

	@handlesEvent(GameEvents.DAMAGE_INFLICT)
	private onDamageInflict(ev: IDamageEvent) {
		if (ev.node != this.node) {
			return
		}

		const instigatorLevel = ev.instigator.getComponent(Level)
		if (instigatorLevel) {
			if (instigatorLevel.level < this.level) {
				ev.blocked = true
			}
		}
	}

	@handlesEvent(GameEvents.PLAYER_UPGRADE)
	private updateCloud() {
		if (!this.cloud) {
			return;
		}

		const labelNode = this.cloud.getChildByName('Text');
		const labelComp = labelNode.getComponent(Label);
		labelComp.string = Strings.LEVEL.replace('{0}', String(this.level));
	}

	@handlesEvent(GameEvents.DIED)
	private onSomethingDied(node: Node) {
		if (node === this.node) {
			this.cloud.emit(GameEvents.RETURN_TO_POOL);
		}
	}
}