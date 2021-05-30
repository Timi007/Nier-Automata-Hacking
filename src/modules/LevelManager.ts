import { Game } from "./Game";
import { GatlingCombatPattern } from "./pattern/combat/GatlingCombatPattern";
import { SawBladeCombatPattern } from "./pattern/combat/SawBladeCombatPattern";
import { ShotgunCombatPattern } from "./pattern/combat/ShotgunCombatPattern";
import { CircleMovementPattern } from "./pattern/movement/CircleMovementPattern";
import { InfinityMovementPattern } from "./pattern/movement/InfinityMovementPattern";
import { StraightMovementPattern } from "./pattern/movement/StraightMovementPattern";

export class LevelManager {
    protected readonly game: Game;
    protected readonly allLevel: Function[];
    private _currentLevel: number = 1;

    public constructor(game: Game) {
        this.game = game;

        this.allLevel = [
            this.level01,
            this.level02,
            this.level03,
            this.level04,
            this.level05,
            this.level06,
            this.level07,
        ]
    }

    /**
     * The current level.
     */
    public get currentLevel() {
        return this._currentLevel;
    }

    /**
     * The maximum level which can be played.
     */
    public get maxLevel() {
        return this.allLevel.length;
    }

    /**
     * Resets the level counter and loads the first level.
     */
    public resetAndLoad() {
        this._currentLevel = 1;
        this.load(this._currentLevel);
    }

    /**
     * Loads the next level.
     */
    public loadNextLevel() {
        this.load(++this._currentLevel);
    }

    /**
     * Loads the given level.
     * @param level The level to load.
     */
    public load(level: number) {
        if (level < 1 || level > this.maxLevel) {
            return;
        }

        this.allLevel[level - 1].call(this);
    }

    private level01() {
        // Introduce combat

        this.game.setWorldSize(15, 15);

        let enemy = this.game.createEnemyCore();
        enemy.position.set(0, 0.5, -this.game.worldDimension.z / 6);
        enemy.combatPattern = new ShotgunCombatPattern(3, 1);

        this.game.addEntity(enemy);
    }

    private level02() {
        // Introduce movement

        this.game.setWorldSize(15, 15);

        let enemy = this.game.createEnemyCore();
        enemy.position.set(0, 0.5, -this.game.worldDimension.z / 6);
        enemy.movementPattern = new StraightMovementPattern(this.game.worldDimension.x / 3);
        enemy.combatPattern = new ShotgunCombatPattern(3, 1);

        this.game.addEntity(enemy);
    }

    private level03() {
        // Introduce destructible projectiles

        this.game.setWorldSize(15, 15);

        let enemy = this.game.createEnemyCore();
        enemy.position.set(0, 0.5, -this.game.worldDimension.z / 6);
        enemy.movementPattern = new StraightMovementPattern(this.game.worldDimension.x / 3);
        enemy.combatPattern = new ShotgunCombatPattern(3, 3, 1);

        this.game.addEntity(enemy);
    }

    private level04() {
        // Introduce guards with no combat pattern

        this.game.setWorldSize(15, 15);

        let enemy = this.game.createEnemyCore();
        enemy.position.set(0, 0.5, -this.game.worldDimension.z / 6);
        enemy.movementPattern = new InfinityMovementPattern(this.game.worldDimension.x / 3);
        enemy.combatPattern = new ShotgunCombatPattern(3, 0.5, 0);

        let guardLeft = this.game.createGuard();
        guardLeft.position.set(-this.game.worldDimension.x / 4, 0.5, -this.game.worldDimension.z / 6);
        guardLeft.target = this.game.player;

        let guardRight = this.game.createGuard();
        guardRight.position.set(this.game.worldDimension.x / 4, 0.5, -this.game.worldDimension.z / 6);
        guardRight.target = this.game.player;

        enemy.addGuard(guardLeft, guardRight);

        this.game.addEntity(enemy, guardLeft, guardRight);
    }

    private level05() {
        // Introduce guard with combat pattern

        this.game.setWorldSize(20, 20);

        let enemy = this.game.createEnemyCore();
        enemy.position.set(0, 0.5, -this.game.worldDimension.z / 6);
        enemy.movementPattern = new CircleMovementPattern(this.game.worldDimension.x / 6, 1.5);
        enemy.combatPattern = new SawBladeCombatPattern(6, 1, 0);
        enemy.target = this.game.player;

        let guard = this.game.createGuard();
        guard.position.set(0, 0.5, -this.game.worldDimension.z / 6);
        guard.combatPattern = new GatlingCombatPattern(10, 0.5, 1, 1);
        guard.target = this.game.player;

        enemy.addGuard(guard);

        this.game.addEntity(enemy, guard);
    }

    private level06() {

        this.game.setWorldSize(20, 20);

        let enemy = this.game.createEnemyCore();
        enemy.position.set(0, 0.5, 0);
        enemy.combatPattern = new GatlingCombatPattern(10, 2, 1, 0.75);
        enemy.target = this.game.player;

        let guardBottomLeft = this.game.createGuard();
        guardBottomLeft.position.set(-(this.game.worldDimension.x / 2 - 2), 0.5, 0);
        guardBottomLeft.combatPattern = new GatlingCombatPattern(10, 0.5, 1, 0);
        guardBottomLeft.target = this.game.player;

        let guardBottomRight = this.game.createGuard();
        guardBottomRight.position.set(this.game.worldDimension.x / 2 - 2, 0.5, 0);
        guardBottomRight.combatPattern = new GatlingCombatPattern(10, 0.5, 1, 0);
        guardBottomRight.target = this.game.player;

        enemy.addGuard(guardBottomLeft, guardBottomRight);

        this.game.addEntity(enemy, guardBottomLeft, guardBottomRight);
    }

    private level07() {

        this.game.setWorldSize(20, 20);

        let enemy = this.game.createEnemyCore();
        enemy.position.set(0, 0.5, 0);
        enemy.combatPattern = new SawBladeCombatPattern(6, 10, 0.5, 0);

        let guardBottomLeft = this.game.createGuard();
        guardBottomLeft.position.set(-(this.game.worldDimension.x / 2 - 2), 0.5, 0);
        guardBottomLeft.combatPattern = new GatlingCombatPattern(10, 0.5, 1, 1);
        guardBottomLeft.target = this.game.player;

        let guardBottomRight = this.game.createGuard();
        guardBottomRight.position.set(this.game.worldDimension.x / 2 - 2, 0.5, 0);
        guardBottomRight.combatPattern = new GatlingCombatPattern(10, 0.5, 1, 1);
        guardBottomRight.target = this.game.player;

        enemy.addGuard(guardBottomLeft, guardBottomRight);

        this.game.addEntity(enemy, guardBottomLeft, guardBottomRight);
    }
}
