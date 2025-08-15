import { _decorator, Component, Label, Node, tween, Vec3, randomRange } from "cc";
import { handlesEvent } from "../utils/Events";
import { GameEvents, IBubbleEvent } from "../GameEvents";
import { PoolManager } from "../utils/PoolManager";
import { locateOne } from "../utils/Locator";
import { GameServices } from "../GameServices";
import CloudRenderer from "./CloudRenderer";
const { ccclass, property } = _decorator;

@ccclass("BubbleSpawner")
export default class extends Component {
	@property
	poolName = "";

	@handlesEvent(GameEvents.BUBBLE)
	private onShowBubble(ev: IBubbleEvent) {
		const node = PoolManager.instance.get(this.poolName);

		const cloudRenderer = node.getComponent(CloudRenderer);
		cloudRenderer.targetWorldPos = ev.worldPos;
		cloudRenderer.targetOffsetPos = new Vec3(0,0,0);

		const label = node.getComponent(Label);
		label.string = ev.text;
		label.color = ev.tint;

		const container: Node = locateOne(GameServices.UI_CONTAINER);
		container.addChild(node);

		const randomOffset = randomRange(0, 0.2);

		tween(cloudRenderer.targetOffsetPos)
			.by(1 + randomOffset, { y: 1.5 - randomOffset }, { easing: 'circOut' })
			.start()

		tween(node)
			.set({ scale: Vec3.ZERO })
			.to(0.1, { scale: Vec3.ONE })
			.delay(0.5 + randomOffset)
			.to(0.25, { scale: Vec3.ZERO })
			.call(() => {
				node.emit(GameEvents.RETURN_TO_POOL);
			})
			.start();
	}
}
