import {MatrixCanvas} from "./MatrixCanvas.js";
import {RpcClient} from "./RpcClient.js";
import {Scheduler} from "./Scheduler.js";
import iro from "@jaames/iro";

//jquery
import $ from "jquery";
import {HtmlPresets} from "./HtmlPresets.js";
// @ts-ignore
window.$ = $;
// @ts-ignore
window.jQuery = $;

require("fomantic-ui-css/semantic");


let rpc;

async function run(animationName, presetName)
{
  // let preset=await rpc.request("presetStore.load", animationName, presetName);
  await rpc.request("runner.run", animationName, presetName);

}

window.addEventListener('load',
  () => {
    const container = document.querySelector('#container') as HTMLElement;
    const menu = document.querySelector('#menu') as HTMLElement;

    container.style.paddingTop = menu.offsetHeight + "px";



     rpc = new RpcClient(() => {
      // rpc.request("getFiles", {}).then((res) => {
      //   console.log("result", res);
      // });
      //
      // rpc.request("load", {}).then((res) => {
      //     console.log("result load", res)
      //   }
      // );


      // rpc.request("presetStore.load",  "geert" , "keutel" )
      //   .then( res=>console.log(res))

      let scheduler = new Scheduler();
      let matrix = new MatrixCanvas(scheduler, 37, 8, '#matrix', 5, 16);
      matrix.preset.enableHtml(document.querySelector("#controlContainer"));
      matrix.run();

      rpc.request("presetStore.getPresets").then(presets => {
        htmlPresets.update(presets);
      })




      let htmlPresets = new HtmlPresets("#presetContainer", run);
      // (animationName, presetName) => {
      //   test();
        // rpc.request("presetStore.load", animationName, presetName).then((result)=>{
        //  console.log(result);
        // })

      // })




    });
  })



// scheduler.interval(60, () => {
//   console.log("chop");
//   scheduler.status();
//   matrix.status();
//   console.log(matrix.controlSet.controls);
//   return(true);
// });
//
// new AnimationMovingStarsL(matrix);
// new AnimationMatrixtest(matrix);
//

// const runner=new Runner(matrix);
//
//
// function bam(category, name)
// {
//   runner.run( name);
//   rpc.request("run", { name });
//
// }

// let rpc=new RpcClient(()=>
// {
//   bam("tests", "AnimationMovingStarsL");
//
// });

// runner.run( "AnimationMovingStarsL");


// ColorPicker(".color1", {});
// ColorPicker(".color2", {});

// @ts-ignore
// $('.ui.slider').slider();

