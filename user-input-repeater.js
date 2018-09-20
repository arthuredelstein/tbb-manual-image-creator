const ioHook = require('iohook');
const robot = require("robotjs");
const Jimp = require('jimp');

const { KEYS } = require("./keyconstants.js");

const BUTTONS = [null, "left", "middle", "right"];

let sleep = timeMs => new Promise(resolve => setTimeout(resolve, timeMs));

let recordInput = () => new Promise(resolve => {
  let eventSeries = [];
  let startTime = Date.now();
  for (let type of ["mousedown", "mousedrag", "mouseup", "mousemove", "mousewheel", "keydown", "keyup"]) {
    ioHook.on(type, event => {
      event['timeStamp'] = Date.now() - startTime;
      eventSeries.push(event);
    });
  }
  // Stop recording on Ctrl+Space
  let shortcutId = ioHook.registerShortcut([29, 57], () => {
    ioHook.stop();
    resolve(eventSeries);
    ioHook.unregisterShortcut(shortcutId);
  });
  ioHook.start();
});

let robotKeyCode = (ioHookKeyCode) =>
    ioHookKeyCode && KEYS[ioHookKeyCode.toString()];

let playBackInput = async (eventSeries) => {
  let startTime = Date.now();
  let downKeys = new Set();
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
        break;
      case "keydown":
        {
          let code = robotKeyCode(event.keycode);
          if (code) {
            robot.keyToggle(code, "down");
            downKeys.add(code);
          }
        }
        break;
      case "keyup":
        {
          let code = robotKeyCode(event.keycode);
          if (code) {
            robot.keyToggle(code, "up");
            downKeys.delete(code);
          }
        }
      }
    }
    // Make sure all keys are up at the end.
    for (let code of downKeys) {
      robot.keyToggle(code, "up");
    }
  }
};

module.exports = { recordInput, playBackInput };
