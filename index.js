const ioHook = require('iohook');
const robot = require("robotjs");

const KEYS = {
  "0": "audio_play",
  "1": "escape",
  "14": "backspace",
  "15": "tab",
  "16": "q",
  "17": "w",
  "18": "e",
  "19": "r",
  "20": "t",
  "21": "y",
  "22": "u",
  "23": "i",
  "24": "o",
  "25": "p",
  "26": "[",
  "27": "]",
  "28": "enter",
  "29": "control",
  "30": "a",
  "31": "s",
  "32": "d",
  "33": "f",
  "34": "g",
  "35": "h",
  "36": "j",
  "3612": "enter",
  "3613": "control",
  "3637": "/",
  "3637": "/",
  "3640": "alt",
  "3653": "pause",
  "3655": "home",
  "3657": "pageup",
  "3663": "end",
  "3665": "pagedown",
  "3666": "insert",
  "3667": "delete",
  "3675": "command",
  "3676": "platform",
  "3677": "menu",
  "37": "k",
  "38": "l",
  "39": ";",
  "40": "'",
  "41": "`",
  "42": "shift",
  "43": "\\",
  "44": "z",
  "45": "x",
  "46": "c",
  "47": "v",
  "48": "b",
  "49": "n",
  "50": "m",
  "51": ",",
  "52": ".",
  "53": "/",
  "54": "shift",
  "55": "*",
  "56": "alt",
  "57": "space",
  "57376": "audio_mute",
  "57377": "calculator",
  "57390": "audio_vol_down",
  "57392": "audio_vol_up",
  "57416": "up",
  "57419": "left",
  "57421": "right",
  "57424": "down",
  "58": "capslock",
  "59": "f1",
  "60": "f2",
  "61": "f3",
  "62": "f4",
  "63": "f5",
  "64": "f6",
  "65": "f7",
  "66": "f8",
  "67": "f9",
  "68": "f10",
  "69": "numlock",
  "70": "scrolllock",
  "71": "numpad_7",
  "72": "numpad_8",
  "73": "numpad_9",
  "74": "-",
  "75": "numpad_4",
  "76": "numpad_5",
  "77": "numpad_6",
  "79": "numpad_1",
  "80": "numpad_2",
  "81": "numpad_3",
  "82": "numpad_0",
  "83": ".",
  "87": "f11",
  "88": "f12",
}

const BUTTONS = [null, "left", "middle", "right"];

let sleep = timeMs => new Promise(resolve => setTimeout(resolve, timeMs));

let recordSeries = () => new Promise(resolve => {
  let eventSeries = [];
  let startTime = Date.now();
  for (let type of ["mousedown", "mousedrag", "mouseup", "mousemove", "mousewheel", "keydown", "keyup"]) {
    ioHook.on(type, event => {
      event['timeStamp'] = Date.now() - startTime;
      if (type === "keydown`") {
        console.log(event["keycode"]);
      }
      eventSeries.push(event);
    });
  }
  ioHook.registerShortcut([29, 57], () => {
    ioHook.stop();
    resolve(eventSeries);
  });
  ioHook.start();
});

let playback = async (eventSeries) => {
  let startTime = Date.now();
  for (let event of eventSeries) {
    let delta = event.timeStamp  - (Date.now() - startTime);
    if (!((event.type === "mousemove" ||
           event.type === "mousedrag") &&
          event.type === delta < 0)) {
      await sleep(delta);
      switch (event.type) {
      case "mousemove":
        robot.moveMouse(event.x, event.y);
        break;
      case "mousedrag":
        robot.dragMouse(event.x, event.y);
        break;
      case "mousedown":
        robot.mouseToggle("down", BUTTONS[event.button]);
        break;
      case "mouseup":
        robot.mouseToggle("up", BUTTONS[event.button]);
        break;
      case "mousewheel":
        console.log(event);
        break;
      case "keydown":
//        robot.keyToggle("down");
        break;
      case "keyup":
//        robot.keyToggle("up");
        break;
      }
    }
  }
};

(async () => {
  let series = await recordSeries();
//  console.log(JSON.stringify(series));
  await playback(series);
})();



/*
// Speed up the mouse.
robot.setMouseDelay(2);

var twoPI = Math.PI * 2.0;
var screenSize = robot.getScreenSize();
var height = (screenSize.height / 2) - 10;
var width = screenSize.width;

for (var x = 0; x < width; x++)
{
  y = height * Math.sin((twoPI * x) / width) + height;
  robot.moveMouse(x, y);
}
*/
/*const screenshot = require('screenshot-desktop');

(async () => {
  try {
    await screenshot();
  } catch (e) {
    console.log(e);
  }
})();
*/
