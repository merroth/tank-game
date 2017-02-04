/// <reference path="../game.utility.ts" />
/// <reference path="../game.core.ts" />
//This file contains the base gameo bject class for the game engine.
//This "Actor" class holds information relevant to every kind of object in the game world
module tanks {

	export interface IActorAnimation {
		name: string;
		count: number;
	}

	export interface IActor {
		position?: Coord;
		angle?: Angle;
		momentum?: Vector;
		acceleration?: number;
		size?: number;
		sprite?: Resource;
		turnrate?: number;
		anim?: IActorAnimation;
		zIndex?: EZindex;
		render?: boolean;
		collision?: Basics.Circle | Basics.Rect;
		moveable?: boolean;
	}

	export class Actor {
		static _actors: Actor[] = [];
		public position: Coord = new Coord();
		public angle: Angle = new Angle();
		public momentum: Vector = new Vector();
		public acceleration: number = 0;
		public size: number = 0;
		public sprite: Resource = null;
		public anim: IActorAnimation = { name: "", count: 0 };
		public turnrate: number = 1;
		public zIndex: EZindex = EZindex.actor;
		public render: boolean = true;
		public moveable: boolean = true;
		public collision: Basics.Circle | Basics.Rect = null;

		constructor(parameters: IActor = {}) {
			for (var key in parameters) {
				if (parameters.hasOwnProperty(key) && this.hasOwnProperty(key)) {
					this[key] = parameters[key];
				}
			}
			Actor._actors.push(this);
		}
		//Do thing on each frame
		public update(): boolean {
			return false;
		}
		protected _die() {
			Actor._actors.splice(Actor._actors.indexOf(this), 1);
		}
		public die() {
			this._die();
		}
	}
}
