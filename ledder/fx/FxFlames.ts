import Fx from "../Fx.js"
import ControlValue from "../ControlValue.js"
import ControlGroup from "../ControlGroup.js"
import PixelSet from "../PixelSet.js"
import BoxInterface from "../BoxInterface.js"
import Scheduler from "../Scheduler.js"
import {random, randomFloatGaussian} from "../utils.js"
import FxColorCycle from "./FxColorCycle.js"
import Pixel from "../Pixel.js"


//Add flames to the top pixels of a container
export default class FxFlames extends Fx {
    private flameCycle: FxColorCycle
    private densityControl: ControlValue
    private burnWidthControl: ControlValue
    private windXControl: any
    private windYControl: any
    private intensityControl: ControlValue


    constructor(scheduler: Scheduler, controls: ControlGroup, depth = 2) {
        super(scheduler, controls)

        this.densityControl = controls.value("Fire density [%]", 10, 0, 100, 1)
        this.intensityControl = controls.value("Fire intensity [%]", 100, 0, 100, 1)
        this.burnWidthControl = controls.value("Fire depth [pixels]", depth, 1, 100, 1, true)
        this.windXControl = controls.value("Fire wind X", 0.1, -0.5, 0.5, 0.01)
        this.windYControl = controls.value("Fire wind Y", 0.2, -0.5, 0.5, 0.01)

        this.flameCycle = new FxColorCycle(scheduler, controls.group("Fire cycle"), "reverse", 15, 15, 1)

    }

    //create flames for pixels from source into target
    //target should be empty and unused
    run(sourceContainer: PixelSet, targetContainer: PixelSet, bbox?: BoxInterface) {

        if (targetContainer.size)
            throw ("Please use an empty target container")

        this.running = true

        //collect the pixels we need
        // const burningPixels = new PixelContainer()
        if (bbox === undefined)
            bbox = sourceContainer.bbox()

        // sourceContainer.forEachPixel((p) => {
        //     if (p.y > bbox.yMax - this.burnWidthControl.value) {
        //         burningPixels.add(p)
        //     }
        // })

        this.promise = this.scheduler.interval(1, () => {

            const heads = new PixelSet()


            sourceContainer.forEachPixel((p) => {

                if (p.y <= bbox.yMax - this.burnWidthControl.value)
                    return

                if (random(0, 100) >= this.densityControl.value)
                    return

                if (!(p instanceof Pixel))
                    return

                let skip
                // let skip = ~~(((bbox.yMax - p.y) / (bbox.yMax - bbox.yMin)) * fireColors.length)
                // skip=random(0,100-this.intensityControl.value)
                // skip = 0
                skip = 100 - this.intensityControl.value

                // //start a new trail
                const flameHead = p.copy(true)
                targetContainer.add(flameHead)

                this.flameCycle.run(flameHead.color, skip).then(() => {
                    targetContainer.delete(flameHead)
                    // heads.delete(head)
                })

                // targetContainer.move(0,0.001)
            })
            targetContainer.move(randomFloatGaussian(0, this.windXControl.value), randomFloatGaussian(0, this.windYControl.value))

            //extend all the trails
            //     for (const trail of targetContainer) {
            //         if (trail instanceof PixelContainer) {
            //             const p = trail.values().next().value
            //             trail.add(p.copy())
            //             p.move(0.1, 0.2)
            //
            //         }
            //     }
            // }

            return (this.running)

        }).then(() => {


        })


        return (this.promise)
    }
}

