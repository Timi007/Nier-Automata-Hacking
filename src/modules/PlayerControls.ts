import * as THREE from "three";
import { InterpolationEndingModes } from "three";

interface IReadonlyInput {
    readonly up: boolean,
    readonly down: boolean,
    readonly right: boolean,
    readonly left: boolean,
    readonly mouseDown: boolean,
    readonly mouse: THREE.Vector2,
}

interface IInput extends IReadonlyInput {
    up: boolean,
    down: boolean,
    right: boolean,
    left: boolean,
    mouseDown: boolean,
    mouse: THREE.Vector2,
}

interface IInputBindings {
    readonly up: string[],
    readonly down: string[],
    readonly right: string[],
    readonly left: string[],
    readonly mouseDown: number[],
}

const DEFAULT_INPUT: IInput = {
    up: false,
    down: false,
    right: false,
    left: false,
    mouseDown: false,
    mouse: new THREE.Vector2(0, -1),
};

export class PlayerControls extends EventTarget {
    private _input: IInput = {
        up: DEFAULT_INPUT.up,
        down: DEFAULT_INPUT.down,
        right: DEFAULT_INPUT.right,
        left: DEFAULT_INPUT.left,
        mouseDown: DEFAULT_INPUT.left,
        mouse: new THREE.Vector2().copy(DEFAULT_INPUT.mouse),
    };
    private readonly mouseRotationSpeed: number = 4;


    private readonly inputBindings: IInputBindings = { // Must be lower case
        up: ['w', 'arrowup'],
        down: ['s', 'arrowdown'],
        right: ['d', 'arrowright'],
        left: ['a', 'arrowleft'],
        mouseDown: [0],
    };

    public constructor() {
        super();
        this.bindThisToListeners();

        document.addEventListener('pointerlockchange', this.onPointerlockChange);
        document.addEventListener('pointerlockerror', this.onPointerlockError);
    }

    /**
     * The current active input flags.
     */
    public get input(): IReadonlyInput {
        return this._input;
    }

    /**
     * Activates the controls and requests pointer lock.
     */
    public activate() {
        this.reset();

        document.addEventListener('keydown', this.onKeyDown);
        document.addEventListener('keyup', this.onKeyUp);

        document.addEventListener('mousedown', this.onMouseDown);
        document.addEventListener('mouseup', this.onMouseUp);
        document.addEventListener('mousemove', this.onMouseMove);

        document.body.requestPointerLock();
    }

    /**
     * Deactivates the controls and leaves pointer lock.
     */
    public deactivate() {
        document.removeEventListener('keydown', this.onKeyDown);
        document.removeEventListener('keyup', this.onKeyUp);

        document.removeEventListener('mousedown', this.onMouseDown);
        document.removeEventListener('mouseup', this.onMouseUp);
        document.removeEventListener('mousemove', this.onMouseMove);

        document.exitPointerLock();
    }

    /**
     * Resets the input flags.
     */
    public reset() {
        this._input.up = DEFAULT_INPUT.up;
        this._input.down = DEFAULT_INPUT.down;
        this._input.right = DEFAULT_INPUT.right;
        this._input.left = DEFAULT_INPUT.left;
        this._input.mouseDown = DEFAULT_INPUT.mouseDown;
        this._input.mouse.copy(DEFAULT_INPUT.mouse);
    }

    private onPointerlockChange(event: Event) {
        if (document.pointerLockElement === document.body) {
            this.dispatchEvent(new Event('pointerlock'));
        } else {
            this.dispatchEvent(new Event('pointerlockexit'));
        }
    }

    private onPointerlockError(event: Event) {
        console.error('Could not acquire pointer lock.', event);
        console.warn('Resetting controls.');
        this.deactivate();
    }

    private bindThisToListeners() {
        this.onPointerlockChange = this.onPointerlockChange.bind(this);
        this.onPointerlockError = this.onPointerlockError.bind(this);

        this.onKeyDown = this.onKeyDown.bind(this);
        this.onKeyUp = this.onKeyUp.bind(this);

        this.onMouseDown = this.onMouseDown.bind(this);
        this.onMouseUp = this.onMouseUp.bind(this);
        this.onMouseMove = this.onMouseMove.bind(this);
    }

    private onKeyDown(event: KeyboardEvent) {
        let key = event.key.toLowerCase();

        if (this.inputBindings.up.includes(key)) {
            this._input.up = true;
        }
        if (this.inputBindings.left.includes(key)) {
            this._input.left = true;
        }
        if (this.inputBindings.down.includes(key)) {
            this._input.down = true;
        }
        if (this.inputBindings.right.includes(key)) {
            this._input.right = true;
        }
    }

    private onKeyUp(event: KeyboardEvent) {
        let key = event.key.toLowerCase();

        if (this.inputBindings.up.includes(key)) {
            this._input.up = false;
        }
        if (this.inputBindings.left.includes(key)) {
            this._input.left = false;
        }
        if (this.inputBindings.down.includes(key)) {
            this._input.down = false;
        }
        if (this.inputBindings.right.includes(key)) {
            this._input.right = false;
        }
    }

    private onMouseDown(event: MouseEvent) {
        if (this.inputBindings.mouseDown.includes(event.button)) {
            this._input.mouseDown = true;
        }
    }

    private onMouseUp(event: MouseEvent) {
        if (this.inputBindings.mouseDown.includes(event.button)) {
            this._input.mouseDown = false;
        }
    }

    private onMouseMove(event: MouseEvent) {
        let x = event.movementX / window.innerWidth;
        let y = event.movementY / window.innerHeight;

        this._input.mouse.x += x * this.mouseRotationSpeed;
        this._input.mouse.y += y * this.mouseRotationSpeed;

        this._input.mouse.x = THREE.MathUtils.clamp(this._input.mouse.x, -1, 1);
        this._input.mouse.y = THREE.MathUtils.clamp(this._input.mouse.y, -1, 1);
    }
}
