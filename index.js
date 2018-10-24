const path = require('path');
const opn = require('opn');
const { acquireImageForLocale, recordInputSeries,
        cropImage, get_manual_locales,
        gitAdd, download_langpacks
      } = require('./backend.js');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;


const imageDir = "images";
const tbbManualDir = "../user-manual";
let lastInputSeries;

app.use(express.static("static"));
app.use(express.json("json"));

app.get('/images/:locale/:name', (req, res) =>
        res.sendFile(`images/${req.params.locale}/${req.params.name}`,
                     {root:"."}));

app.get('/final/:locale/:name', (req, res) =>
        res.sendFile(`${req.params.locale}/media/${req.params.name}`,
                     {root:tbbManualDir}));

let msgToObject = msg => JSON.parse([...msg].join(""));

let cropImageForLocale = async ({locale, imageName, x, y, w, h }) => {
  console.log(locale, imageName, x, y, w, h);
  let srcFile = path.join("images", locale, `${imageName}.png`);
  let destFile = path.join(tbbManualDir, locale, "media", `${imageName}.png`);
  await cropImage({ srcFile, destFile, x, y, w, h });
  return destFile;
};

app.post("/ready", (req, res) => {
  console.log(req.body);
  res.json({"response":"ready"});
});

app.post("/prepare", async (req, res) => {
  let { imageName, locale, record } = req.body;
  let { filename, inputSeries } = await recordInputSeries(
    {locale, imageDir, imageName});
  if (record) {
    lastInputSeries = inputSeries;
  }
  res.json({ filename });
});

app.post("/crop", async (req, res) => {
  let { locale, imageName, x, y, w, h } = req.body;
  let filename = await cropImageForLocale({
    locale,
    imageName,
    x, y, w, h });
  res.json({ filename });
});

app.post("/locales", async (req, res) => {
  let { manual_dir } = req.body;
  res.json(await get_manual_locales(manual_dir));
});

app.post("/acquire", async (req, res) => {
  let { locale, imageName, x, y, w, h, } = req.body;
  await acquireImageForLocale({
    inputSeries: lastInputSeries,
    imageName, locale, imageDir,
  });
  let filename = await cropImageForLocale({
    locale,
    imageName,
    x, y, w, h,
  });
  res.json({ filename, locale, imageName });
});

app.post("/gitadd", async (req, res) => {
  let { imageName, manual_dir } = req.body;
  await gitAdd({ imageName, manual_dir });
});

app.listen(port, async () => {
  await download_langpacks("60.2.2");
  console.log(`Listening on port ${port}!`);
  opn("http://localhost:3000");
});

