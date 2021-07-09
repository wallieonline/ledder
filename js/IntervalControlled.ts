import {ControlValue} from "./ControlValue.js";
import {Interval} from "./Interval.js";

/**
 * Interval that can be modified by a controller
 */
export class IntervalControlled extends  Interval {
    intervalControl: ControlValue;
    nextTime: number;
    callback: (frameNr: number) => number | undefined | boolean;

    constructor(intervalControl: ControlValue, time, callback) {
        super();
        this.intervalControl = intervalControl;
        this.nextTime = time + intervalControl.value;
        this.callback = callback;
    }

    //returns false if interval should be destroyed
    check(time) {
        if (time >= this.nextTime) {
            if (this.callback(time) === false)
                return false;

            //note: we add to nextTime, instead of time, to allow non-integer intervals
            this.nextTime = this.nextTime + this.intervalControl.value;
        }
        return true;
    }
}
