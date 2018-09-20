const robot = require("robotjs");
const Jimp = require('jimp');
const request = require('request-promise-native');
const util = require('util');
const child_process = require('child_process');
const spawn = child_process.spawn;
const exec = util.promisify(require('child_process').exec);
const fs = require('fs');
const fsAsync = fs.promises;
const path = require('path');
const mkdirp = require('mkdirp-promise');
const { JSDOM } = require("jsdom");

const { recordInput, playBackInput } = require("./user-input-repeater.js");

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

let downloadFile = (url, diskPath) => new Promise(
  resolve => request(url)
    .pipe(fs.createWriteStream(diskPath))
    .on("finish", resolve));

let download_langpacks = async (version) => {
  let xpiDir = `${tor_browser_dir}/Browser/TorBrowser/Data/Browser/profile.default/extensions`;
  let langpacks = await langpack_urls(version);
  for (let langpack of langpacks) {
    let remoteFileName = path.basename(langpack);
    let locale = remoteFileName.split(".")[0];
    let destFile = `${xpiDir}/langpack-${locale}@firefox.mozilla.org.xpi`;
    if (!fs.existsSync(destFile)) {
      console.log(`downloading ${langpack}`);
      await downloadFile(langpack, `${xpiDir}/langpack-${locale}@firefox.mozilla.org.xpi`);
    }
  }
  console.log("langpacks are fully downloaded");
};

let start_tor_browser = async (tor_browser_dir, locale) => {
  let profileDir = `${tor_browser_dir}/Browser/TorBrowser/Data/Browser/profile.default/`;
  console.log(profileDir);
  // Wipe custom prefs each time to make behavior reproducible.
  await fsAsync.unlink(profileDir + "prefs.js");
  await fsAsync.writeFile(profileDir + "user.js", `user_pref('intl.locale.requested', '${locale}');\n`);
  return spawn(`${tor_browser_dir}/Browser/firefox`);
};

let captureScreenToFile = async (filename) => {
  let { image, width, height } = robot.screen.capture();
  await writeImageBuffer(filename,
                         { buffer: image, bufferFormat: "bgra",
                           width, height });
};

let captureRawImage = async ({locale, imageDir, imageName}) => {
  await mkdirp(`${imageDir}/${locale}/`);
  let filename = `${imageDir}/${locale}/${imageName}.png`
  await captureScreenToFile(filename);
  return filename;
};

let acquireImagesForLocales = async ({inputSeries, imageName,
                                      locales, imageDir}) => {
  for (let locale of locales) {
    let browserProcess = await start_tor_browser(tor_browser_dir, locale);
    await playBackInput(inputSeries);
    await captureRawImage({locale, imageDir, imageName});
    browserProcess.kill();
  }
};

let recordInputSeries = async ({locale, imageDir, imageName}) => {
  let browserProcess = await start_tor_browser(tor_browser_dir, locale);
  let inputSeries = await recordInput();
  let filename = await captureRawImage({locale, imageDir, imageName});
  browserProcess.kill();
  return { filename, inputSeries };
};

let cropImage = async ({srcFile, destFile, rect: {x, y, w, h}}) => {
  let image = await Jimp.read(srcFile);
  image.crop(x, y, w, h);
  await new Promise(resolve => image.write(destFile, resolve));
};

/*
(async () => {
  let version = await get_firefox_version(tor_browser_dir);
  await download_langpacks(version);
  let inputSeries = await recordInputSeries();
  let locales = ["en-US", "de-DE", "fr-FR", "es-ES"];
  await acquireImagesForLocales(
    {inputSeries, imageName: "captcha", locales, imageDir: "images"});
  console.log("done!");
})();
*/
module.exports = { recordInputSeries,
                   download_langpacks,
                   acquireImagesForLocales,
                   cropImage};
