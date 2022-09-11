//Update canvas display with frames received via websocket from server
export class DisplayCanvas {
    canvas: HTMLCanvasElement;
    canvasContext: CanvasRenderingContext2D;
    imageData: ImageData;
    imageBuf8: Uint8ClampedArray;
    imageBuf: ArrayBuffer;

    //width and height are led-display-pixels, not canvas pixels.
    constructor(width, height, displayId, boxClass) {

        this.canvas = document.querySelector(displayId);

        for (const box of document.querySelectorAll(boxClass)) {
            box.style.width = width*8+'px';
            box.style.height = height*8+'px';
        }

        //scaling
        this.canvas.width = width
        this.canvas.height = height

        //context and buffer
        this.canvasContext = this.canvas.getContext('2d');
        this.imageData = this.canvasContext.getImageData(0, 0, width, height);

    }

    frame(arrayBuffer: ArrayBuffer) {

        this.imageData.data.set(new Uint8Array(arrayBuffer))
        window.requestAnimationFrame(()=>{
            this.canvasContext.putImageData(this.imageData, 0, 0);
        })

    }


}
