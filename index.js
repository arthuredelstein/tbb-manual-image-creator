const robot = require("robotjs");
const Jimp = require('jimp');
const request = require('request-promise-native');
const util = require('util');
const child_process = require('child_process');
const spawn = child_process.spawn;
const exec = util.promisify(require('child_process').exec);
const { promises: fs } = require('fs');
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

let start_tor_browser = async (tor_browser_dir, locale) => {
  let profileDir = `${tor_browser_dir}/Browser/TorBrowser/Data/Browser/profile.default/`;
  console.log(profileDir);
  // Wipe custom prefs each time to make behavior reproducible.
  await fs.unlink(profileDir + "prefs.js");
  await fs.writeFile(profileDir + "user.js", `user_pref('intl.locale.requested', '${locale}');\n`);
  return spawn(`${tor_browser_dir}/Browser/firefox`);
};

(async () => {
  let version = await get_firefox_version(tor_browser_dir);
  console.log(version);
  console.log(await langpack_urls(version));
  let browserProcess = await start_tor_browser(tor_browser_dir, "en-US");
  let series = await recordInput();
  browserProcess.kill();
  let browserProcess2 = await start_tor_browser(tor_browser_dir, "de-DE");
  await playbackInput(series);
  let { image, width, height } = robot.screen.capture();
  await writeImageBuffer("browser_screenshot.png",
                         { buffer: image, bufferFormat: "bgra",
                           width, height });
  browserProcess2.kill();
})();
