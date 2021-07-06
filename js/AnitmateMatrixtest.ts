import {Animation} from "./Animation.js";
import {Matrix} from "./Matrix.js";
import {Pixel} from "./Pixel.js";
import {AnimationBlink} from "./AnimationBlink.js";
import {AnimationMove} from "./AnimationMove.js";

export class AnitmateMatrixtest extends Animation {

  /**
   * Test matrix orientation, border limit, colors and smoothness.
   * @param matrix
   */
  constructor(matrix: Matrix) {
        super(matrix);


        //color bar
        for (let x = 0; x < matrix.width; x++) {
            const c = 255 / matrix.width * (x + 1);
            new Pixel(matrix, x, 4, c, 0, 0);
            new Pixel(matrix, x, 3, 0, c, 0);
            new Pixel(matrix, x, 2, 0, 0, c);
            new Pixel(matrix, x, 1, c, c, c);
        }

        //corners
        new Pixel(matrix, 0, 0, 255, 0, 255);
        new Pixel(matrix, matrix.width - 1, matrix.height - 1, 255, 0, 255);
        new Pixel(matrix, 0, matrix.height - 1, 255, 0, 255);
        new Pixel(matrix, matrix.width - 1, 0, 255, 0, 255);

        //blinkers to test update rate (the first one should almost look static and half brightness)
        for (let x = 1; x < 4; x++)
            new AnimationBlink(matrix, x, x).addPixel(new Pixel(matrix, x - 1, 5, 255, 255, 255));

        //mover to test smoothness
        const m = new Pixel(matrix, 0, 6, 255, 255, 255);
        new AnimationMove(matrix, 1, 1, 0).addPixel(m);
        matrix.scheduler.interval(matrix.width, () => {
            m.x = 0;
        })
    }

}
