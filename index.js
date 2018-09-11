const robot = require("robotjs");
const Jimp = require('jimp');

const { recordInput, playbackInput } = require("./user-input-repeater.js");

let writeImageBuffer = (file, {buffer, width, height, bufferFormat }) =>
  new Promise((resolve, reject) => {
    let buffer2 = new Uint8Array(buffer);
    if (bufferFormat.toLowerCase() === "bgra") {
      // Jimp needs rgba:
      for (let i = 0; i < buffer2.length; i+=4) {
        buffer2[i] = buffer[i+2];
        buffer2[i+2] = buffer[i];
      }
    }
    jimp = new Jimp(1, 1);
    jimp.bitmap = { data: buffer2, width, height };
    jimp.write(file, resolve);
  });

let sleep = timeMs => new Promise(resolve => setTimeout(resolve, timeMs));

(async () => {
  let series = await recordInput();
  await playbackInput(series);
  let { image, width, height } = robot.screen.capture();
  await writeImageBuffer("test2.png", { buffer: image, width, height,
                                        bufferFormat: "bgra"});
})();
