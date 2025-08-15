import { _decorator, Node, animation, tween, Tween } from "cc";
import { GameEvents } from "db://assets/scripts/GameEvents";
import { gameEventTarget } from "db://assets/scripts/utils/Events";
const { ccclass, property } = _decorator;

@ccclass("PlayerLocomotionAttackState")
export class PlayerLocomotionAttackState extends animation.StateMachineComponent {
    tween: Tween<Node>;

    animScale = 2.5;

    animDuration = 2.46 / this.animScale;

    trigger = 0.35;

    onMotionStateEnter(controller: animation.AnimationController, motionStateStatus: Readonly<animation.MotionStateStatus>) {
        this.tween = tween(controller.node)
            .repeatForever(
                tween(controller.node)
                    .delay(this.animDuration * this.trigger)
                    .call(this.hit)
                    .delay((1 - this.trigger) * this.animDuration)
            )
            .start()
    }

    onMotionStateExit(controller: animation.AnimationController, motionStateStatus: Readonly<animation.MotionStateStatus>) {
        this.tween?.stop()
    }

    private hit() {
        gameEventTarget.emit(GameEvents.PLAYER_ATTACK_HIT)
    }
}
