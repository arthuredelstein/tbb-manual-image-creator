const ioHook = require('iohook');
const robot = require("robotjs");
const { KEYS } = require("./keyconstants.js");

console.log(KEYS);

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
