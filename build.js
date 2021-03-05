const fs = require('fs');
const path = require('path');
const fse = require('fs-extra');
const glob = require('glob');

// Keep this array in sync with script.js
const colorPalettes = [
  'Salmon',
  'Pink',
  'Gold',
  'White',
  'Yellow',
  'Cyan',
  'Purple',
  'Blue',
  'Dark',
  'Black',
];

const sourcesDir = path.resolve(__dirname, 'Sources');
const templateDir = path.resolve(__dirname, 'Web.template.saver');
const outputDir = path.resolve(__dirname, 'build');

fse.mkdirpSync(outputDir);

// Cleanup
const existing = glob.sync(path.resolve(outputDir, '*.saver'));
existing.forEach(file => {
  console.log(`Cleaning ${file}`);
  fse.removeSync(file);
});

// Build variants
createWebSaver('Shuffle', undefined);
colorPalettes.forEach((name, i) => {
  createWebSaver(name, i);
});

function createWebSaver(colorPaletteName, colorPaletteIndex = undefined) {
  const saverName = `CTV_${colorPaletteName}`;

  console.log(`Exporting OSX Screen saver: ${saverName}`);

  const saverDir = webSaverDir(saverName);
  const resourcesDir = path.resolve(saverDir, 'Contents', 'Resources');

  fse.copySync(templateDir, saverDir);
  fse.copySync(sourcesDir, resourcesDir);

  replaceFiles(saverDir, saverName, colorPaletteIndex);
}

function webSaverDir(saverName) {
  return path.resolve(outputDir, `${saverName}.saver`);
}

function replaceFiles(saverDir, saverName, colorPaletteIndex) {
  const htmlPath = path.resolve(saverDir, 'Contents', 'Resources', 'index.html');
  const plistPath = path.resolve(saverDir, 'Contents', 'Info.plist');

  let html = String(fs.readFileSync(htmlPath));
  html = html.replace(
    /COLOR_PALETTE = undefined/g,
    `COLOR_PALETTE = ${colorPaletteIndex}`
  );

  let plist = String(fs.readFileSync(plistPath));
  plist = plist.replace(
    /<key>CFBundleName<\/key>\s+<string>Web<\/string>/mg,
    `<key>CFBundleName</key><string>${saverName}</string>`
  );
  plist = plist.replace(
    /<key>CFBundleIdentifier<\/key>\s+<string>com.yourcompany.Web<\/string>/mg,
    `<key>CFBundleIdentifier</key><string>io.github.kalabasa.${saverName}</string>`
  );

  fs.writeFileSync(htmlPath, html);
  fs.writeFileSync(plistPath, plist);
}