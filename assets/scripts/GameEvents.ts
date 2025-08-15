import { Vec3, Node, math } from "cc";

export enum GameEvents {
	INPUT_DOWN = 'input-down',
	INPUT_UP = 'input-up',
	INPUT_MOVE = 'input-move',
	INPUT_CANCEL = 'input-cancel',

	JOYSTICK_MOVE_START = 'joy-start',
	JOYSTICK_MOVE = 'joy-move',
	JOYSTICK_MOVE_END = 'joy-move-end',
	JOYSTICK_TOGGLE = 'joystick-toggle',

	TOGGLE_SCREEN_REDIRECT = 'toggle-screen-redirect',
	REDIRECT = 'redirect',

	TOGGLE_SOUND = 'toggle-sound',
	SOUND_PLAY = 'sound-play',
	SOUND_STOP = 'sound-stop',

	CAMERA_TRANSITION = 'camera-transition',

	RETURN_TO_POOL = 'return-to-pool',

	PLAYER_UPGRADE = 'player-upgrade',
	PLAYER_ATTACK_TOGGLED = 'player-attack-toggled',
	PLAYER_ATTACK_HIT = 'player-attack-hit',
	DAMAGE_INFLICT = 'damage-inflict',
	DAMAGE_TAKEN = 'damage-taken',
	DIED = 'died',
	BUBBLE = 'bubble',
	UPDATE_BALANCE = 'update-balance',

	UI_ELEMENT_SHOW = 'ui-elem-show',
	UI_ELEMENT_HIDE = 'ui-elem-hide',
}

export interface IDamageEvent {
	instigator: Node;
	node: Node;

	amount: number;
	blocked: boolean;
}

export interface IBubbleEvent {
	text: string;
	worldPos: Vec3;
	tint: math.Color;
}