const robot = require("robotjs");
const Jimp = require('jimp');
const request = require('request-promise-native');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const { JSDOM } = require("jsdom");

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

let tor_browser_dir = "/home/arthur/Downloads/tor-browser_en-US";

let get_firefox_version = async (path) => {
  let { stdout, stderr } = await exec(`${path}/Browser/firefox --version`);
  if (stderr) {
    throw new Error(stderr);
  }
  return stdout.match(/Mozilla Firefox (\S+)/)[1];
};

let langpack_urls = async (version) => {
  let baseUrl = `https://ftp.mozilla.org/pub/firefox/releases/${version}esr/linux-x86_64/xpi/`;
  let indexPage = await request(baseUrl);
  let dom = new JSDOM(indexPage);
  let items = [...dom.window.document.querySelectorAll("table tr td a")]
      .map(element => element.innerHTML)
      .filter(text => text !== "..")
      .map(stem => baseUrl + stem);
  return items;
};

(async () => {
  let version = await get_firefox_version(tor_browser_dir);
  console.log(version);
  let result = await langpack_urls(version);
  console.log(result);
//  console.log(result);
/*  let series = await recordInput();
  await playbackInput(series);
  let { image, width, height } = robot.screen.capture();
  await writeImageBuffer("test2.png", { buffer: image, width, height,
  bufferFormat: "bgra"});*/
  
})();
