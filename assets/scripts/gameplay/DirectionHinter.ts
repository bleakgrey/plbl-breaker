import { Vec3 } from "cc";
import { _decorator, Component, Node } from "cc";
import { Level } from "./Level";
import { handlesEvent } from "../utils/Events";
import { GameEvents } from "../GameEvents";
import { locateAll } from "../utils/Locator";
import { GameServices } from "../GameServices";
import { Quat } from "cc";
import { math } from "cc";
import { CCInteger } from "cc";
import { misc } from "cc";
const { ccclass, property } = _decorator;

@ccclass("DirectionHinter")
export class DirectionHinter extends Component {
	@property(Node)
	playerNode: Node;

	private rotationSpeed: number = 6.0; // deg/sec
	private currentTarget: Node;
	
	private tempDir = new Vec3();
	private tempRot = new Quat();
	private currentRot = new Quat();

	start() {
		this.findHint();
	}

	update(dt: number) {
		this.node.setWorldPosition(this.playerNode.worldPosition);

		if (this.currentTarget?.isValid) {
			// Direction from this node to target, ignoring Y
			Vec3.subtract(
				this.tempDir,
				this.currentTarget.worldPosition,
				this.node.worldPosition,
			);
			this.tempDir.y = 0; // keep only horizontal direction
			Vec3.normalize(this.tempDir, this.tempDir);

			// Desired rotation (yaw only)
			Quat.fromViewUp(this.tempRot, this.tempDir, Vec3.UP);

			// Smooth interpolate current rotation toward target
			Quat.slerp(
				this.currentRot,
				this.node.worldRotation,
				this.tempRot,
				math.clamp01(this.rotationSpeed * dt),
			);

			this.node.worldRotation = this.currentRot;
		}
	}

	@handlesEvent(GameEvents.DIED)
	@handlesEvent(GameEvents.PLAYER_UPGRADE)
	private findHint() {
		const playerLevelComp = this.playerNode.getComponent(Level);
		const playerLevel = playerLevelComp.level;

		const allDestructibles = locateAll<Node>(GameServices.DESTRUCTIBLE)
			.map((node) => node.getComponent(Level))
			.filter((lvl) => lvl.level == playerLevel);

		const firstResult = allDestructibles[0];
		if (firstResult) {
			this.currentTarget = firstResult.node;
		}
	}
}
