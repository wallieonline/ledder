import PixelBox from "../../PixelBox.js"
import DrawText from "../../draw/DrawText.js"
import MovingStars from "../Components/MovingStars.js"
import Starfield from "../Components/Starfield.js"
import FxRotate from "../../fx/FxRotate.js"
import PixelSet from "../../PixelSet.js"
import DrawBox from "../../draw/DrawBox.js"
import {FxFadeOut} from "../../fx/FxFadeOut.js"
import Scheduler from "../../Scheduler.js"
import ControlGroup from "../../ControlGroup.js"
import {fontSelect} from "../../fonts.js"
import FxFlames from "../../fx/FxFlames.js"
import Animation from "../../Animation.js"
import FxTemplate from "../../fx/Template.js"
import FxTwinkle from "../../fx/FxTwinkle.js"
import FxColorPattern from "../../fx/FxColorPattern.js"


export default class Marquee extends Animation {

    static title = "Marquee"
    static description = ""
    static category = "Marquees"

    async run(box: PixelBox, scheduler: Scheduler, control: ControlGroup) {

        const font = fontSelect(control, 'Font')
        const input = control.input('Text', "Marquee  ", true)
        const colorControl = control.color("Text color", 0x21, 0xff, 0, 1)
        const charPixels = new DrawText(box.xMin, box.yMin, font, input.text, colorControl)
        charPixels.centerV(box)

        //scroll everything thats in this container (if enabled)
        const scrollContainer=new PixelSet()
        scrollContainer.add(charPixels)

        let starsGroup = control.group("Stars", false, false)
        if (starsGroup.switch('Enabled', false).enabled) {
            new MovingStars().run(box, scheduler, starsGroup)
        }

        let starFieldGroup = control.group("Star field", false, false)
        if (starFieldGroup.switch('Enabled', false).enabled) {
            new Starfield().run(box, scheduler, starFieldGroup)
        }


        //add on top of stars
        box.add(scrollContainer)

        let scrollGroup = control.group("Scrolling")
        if (scrollGroup.switch('Enabled', true).enabled) {
            const whitespace = scrollGroup.value("Whitespace", 10, 0, 100, 1, true)
            const rotator = new FxRotate(scheduler, scrollGroup)

            const bbox = scrollContainer.bbox()
            bbox.xMax = bbox.xMax + whitespace.value
            if (bbox.xMax < box.xMax)
                bbox.xMax = box.xMax

            rotator.run(scrollContainer, bbox)
        } else {
            charPixels.centerH(box)
        }

        let flameGroup = control.group("Flames", false, false)
        if (flameGroup.switch('Enabled', false).enabled) {
            const flames = new PixelSet()
            box.add(flames)
            new FxFlames(scheduler, flameGroup).run(charPixels, flames)
        }

        let twinkleGroup = control.group("Twinkle")
        if (twinkleGroup.switch('Enabled', false).enabled) {
            const twinkleContainer=new PixelSet()
            box.add(twinkleContainer)
            new FxTwinkle(scheduler, twinkleGroup).run(charPixels,  scrollContainer)
        }


        let colorPatternGroup = control.group("Color pattern")
        if (colorPatternGroup.switch('Enabled', false).enabled) {
            new FxColorPattern(scheduler, colorPatternGroup).run(charPixels)
        }

        let cursorGroup = control.group("Cursor")
        if (cursorGroup.switch('Enabled', false).enabled) {
            const cursorColor = cursorGroup.color("Color", 128, 128, 128).copy()
            const cursorX = cursorGroup.value("X offset", 2, 0, 100, 1, true)
            const cursorY = cursorGroup.value("Y offset", 1, 0, 100, 1, true)
            const cursorH = cursorGroup.value("Height", 6, 0, 100, 1, true)
            const cursorW = cursorGroup.value("Width", 5, 0, 100, 1, true)
            const cursorOn = cursorGroup.value("On time", 30, 0, 60, 1, false)
            const cursorOff = cursorGroup.value("Off time", 30, 0, 60, 1, false)
            const bbox = charPixels.bbox()
            const cursor = new DrawBox(bbox.xMax + cursorX.value, bbox.yMin + cursorY.value, cursorW.value, cursorH.value, cursorColor)
            const fader = new FxFadeOut(scheduler, cursorGroup, 10)
            charPixels.add(cursor)
            while (1) {
                cursorColor.a = 1
                await scheduler.delay(cursorOn.value)
                fader.run(cursorColor)
                await scheduler.delay(cursorOff.value)

            }
        }


    }

}


