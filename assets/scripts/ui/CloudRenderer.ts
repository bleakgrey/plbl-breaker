import { _decorator, Component, Vec3, Camera, Node } from "cc";
import { locateOne } from "../utils/Locator";
import { GameServices } from "../GameServices";
const { ccclass, property } = _decorator;

@ccclass("CloudRenderer")
export default class extends Component {
	private camera: Camera;

	private canvas: Node;

	@property(Vec3)
	targetWorldPos: Vec3;

	@property(Vec3)
	targetOffsetPos = new Vec3(0,0,0);

	tempPos = new Vec3();

	onLoad() {
		const cameraNode: Node = locateOne(GameServices.WORLD_CAMERA)
		this.camera = cameraNode.getComponent(Camera)

		this.canvas = locateOne(GameServices.UI_CANVAS)
	}

	onEnable() {
		this.node.setPosition(new Vec3(-9999, -9999))
	}

	update() {
		if (this.targetWorldPos) {
			const finalWorldPos = this.targetWorldPos.clone().add(this.targetOffsetPos)
			this.camera.convertToUINode(finalWorldPos, this.canvas, this.tempPos);
			this.node.setPosition(this.tempPos);
		}
	}
}
