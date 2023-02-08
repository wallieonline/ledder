import PixelBox from "../../PixelBox.js"
import sharp from "sharp"
import drawImage from "../../draw/DrawImage.js"
import Scheduler from "../../Scheduler.js"
import ControlGroup from "../../ControlGroup.js"
import Animator from "../../Animator.js"
import PixelList from "../../PixelList.js"
import Color from "../../Color.js"
import FxAutoTrace from "../../fx/FxAutoTrace.js"


export default class Hackerhotel extends Animator {

    async run(box: PixelBox, scheduler: Scheduler, controls: ControlGroup) {

        //load image and determine colors
        const image = await sharp('images/hackerhotel.png')
        const imageLetterColor=new Color(255, 216, 0)
        const imageTracerStartColor=new Color(128,128,128)



        const logo = await drawImage(0, 0, image)

        //get letters:
        const letterColorControl=controls.color('Text color', imageLetterColor.r, imageLetterColor.g, imageLetterColor.b)
        const letters = logo.filterColor(imageLetterColor)
        letters.setColor(letterColorControl)
        box.add(letters)



        //find start of each trace and filter it out
        const traces=new PixelList()
        box.add(traces)

        logo.forEachPixel((p) => {
            if (imageTracerStartColor.equal(p.color)) {
                const trace = logo.filterCluster(p)
                traces.add(trace)
            }
        })


        const autoTraceFx=new FxAutoTrace(scheduler,controls)

        await autoTraceFx.run(traces, box)


    }
}
