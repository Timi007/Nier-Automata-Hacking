export class GameTime {
    private _lastUpdate: DOMHighResTimeStamp = 0;
    private _elapsed: DOMHighResTimeStamp = 0;
    private _totalElapsed: DOMHighResTimeStamp = 0;

    public reset() {
        this._elapsed = 0;
        this._lastUpdate = 0;
        this._totalElapsed = 0;
    }

    public update(now: DOMHighResTimeStamp, pause: boolean = false) {
        if (pause) {
            this._lastUpdate = now;
            return;
        }

        this._elapsed = now - this._lastUpdate;
        this._lastUpdate = now;
        this._totalElapsed += this._elapsed;
    }

    /**
     * The elapsed time in milliseconds since the last update, also known as delta.
     */
    public get elapsed() {
        return this._elapsed;
    }

    /**
     * The time in milliseconds since the last update of the timer.
     */
    public get lastUpdate() {
        return this._lastUpdate;
    }

    /**
     * The sum of elapsed time in milliseconds.
     */
    public get totalElapsed() {
        return this._totalElapsed;
    }
}
