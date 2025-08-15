import { _decorator, Component, instantiate, Node, Prefab, tween, UITransform, Camera, Vec3, CCString } from "cc";
import { handlesEvent } from "../utils/Events";
import { GameEvents } from "../GameEvents";
import { locateOne } from "../utils/Locator";
import { GameServices } from "../GameServices";
import { PoolManager } from "../utils/PoolManager";
const { ccclass, property } = _decorator;

@ccclass("FlyingItemSpawner")
export class FlyingItemSpawner extends Component {
	@property(CCString)
	poolName = '';

	@property(Node)
	flyFrom: Node;

	@property(Node)
	flyTo: Node;

	@handlesEvent(GameEvents.DIED)
	private onSpawnItem(sourceNode: Node) {
		const sourceWorldPos = sourceNode.getWorldPosition();

		const cameraNode: Node = locateOne(GameServices.WORLD_CAMERA);
		const camera = cameraNode.getComponent(Camera);
		const transform = this.flyFrom.getComponent(UITransform);

		const localStartPos = camera.convertToUINode(sourceWorldPos, this.flyFrom);
		const localEndPos = transform.convertToNodeSpaceAR(this.flyTo.getWorldPosition())

		const itemNode = instantiate(PoolManager.instance.get(this.poolName));
		itemNode.setScale(Vec3.ZERO);
		itemNode.setPosition(localStartPos);
		this.flyFrom.addChild(itemNode);

		tween(itemNode)
			.to(0.15, { scale: Vec3.ONE })
			.to(0.4 + Math.random() * 0.2, { position: localEndPos }, { easing: 'circInOut' })
			.set({ scale: Vec3.ZERO })
			.call(() => itemNode.emit(GameEvents.RETURN_TO_POOL))
			.start()
	}
}
