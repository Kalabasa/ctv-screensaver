const graphicsContainer = document.getElementById('graphicsContainer');
const mainText = document.getElementById('mainText');
const timeSizer = document.getElementById('timeSizer');

const timeFormatOptions = {
  hour: '2-digit',
  minute: '2-digit',
};

const color = {
  turq: '#00C4CC',
  darkTurq: '#033D68',
  lightBlue: '#A7DCFA',
  blue: '#399BE6',
  darkBlue: '#395BDC',
  purple: '#A548FF',
  darkPurple: '#7D2AE8',
  pink: '#D46BE4',
  grape: '#3B1B72',
  salmon: '#FD7F84',
  wine: '#89246A',
  yellow: '#FFD501',
  gold: '#FBBE28',
  tvCyan: '#0FFDC3',
  tvMagenta: '#FF69FF',
  tvYellow: '#F6FF36',
  white: '#FFFFFF',
  black: '#000000',
};

// [bg, fg, ...rayColors][]
const colorPalettes = [
  // Best team - salmon
  [color.salmon, color.white, color.purple, color.pink, color.gold, color.tvCyan],
  // Every ingredient - pink
  [color.tvMagenta, color.white, color.darkPurple, color.salmon, color.lightBlue, color.white],
  // Empower everyone - gold
  [color.gold, color.grape, color.grape, color.purple, color.yellow, color.white],
  // For change - white
  [color.white, color.grape, color.purple, color.pink, color.gold, color.tvCyan],
  // For billions - yellow
  [color.tvYellow, color.grape, color.darkBlue, color.blue, color.purple, color.lightBlue, color.white],
  // Design anything - cyan
  [color.tvCyan, color.grape, color.grape, color.darkBlue, color.purple, color.white],
  // Publish anywhere - purple
  [color.purple, color.white, color.darkPurple, color.salmon, color.gold, color.lightBlue, color.white],
  // Every language - blue
  [color.darkBlue, color.white, color.blue, color.pink, color.salmon, color.white],
  // Every device - dark
  [color.grape, color.white, color.purple, color.salmon, color.tvCyan, color.lightBlue],
  // black
  [color.black, color.white, color.tvMagenta, color.blue, color.tvCyan, color.tvYellow],
];

let timeStringCached = '';
let graphics = [];

const timeSeed = Date.now();
const timeRandom = () => ((timeSeed * 51327) % 311731) / 311731;

init();

function init() {
  fillTimeSizer();

  const colorPaletteIndex = window['COLOR_PALETTE'] !== undefined
    ? window['COLOR_PALETTE']
    : Math.floor(timeRandom() * colorPalettes.length);
  const colorPalette = colorPalettes[colorPaletteIndex];
  const [backgroundColor, foregroundColor] = colorPalette;
  const raysColorPalette = colorPalette.slice(2);

  const backgroundGraphic = new BackgroundGraphic(graphicsContainer, [backgroundColor, ...raysColorPalette]);
  graphics.push(backgroundGraphic);

  mainText.style.color = foregroundColor;

  requestAnimationFrame(mainLoop);
}

function mainLoop() {
  const timeSegments = getTimeSegments();
  const timeString = timeSegments.join(isBlinkOn() ? ' ' : ':');
  if (timeStringCached !== timeString) {
    timeStringCached = timeString;
    renderMainText(timeSegments);
  }

  graphics.forEach(graphic => graphic.onUpdate());

  requestAnimationFrame(mainLoop);
}

function renderMainText(timeSegments) {
  if (mainText.childElementCount !== timeSegments.length * 2 - 1) {
    createMainText(timeSegments);
  }
  updateMainText(timeSegments);
}

function createMainText(timeSegments) {
  while (mainText.firstChild) {
    mainText.removeChild(mainText.lastChild);
  }

  for (let i = 0; i < timeSegments.length; i++) {
    if (i > 0) {
      const separator = document.createElement('span');
      separator.textContent = ':'
      separator.classList.add('separator');
      mainText.appendChild(separator);
    }
    const segment = document.createElement('span');
    segment.classList.add('segment');
    mainText.appendChild(segment);
  }
}

function updateMainText(timeSegments) {
  const blinkOn = isBlinkOn();
  mainText.classList.toggle('blink', blinkOn);

  const segmentElements = mainText.querySelectorAll('.segment');
  for (let i = 0; i < timeSegments.length; i++) {
    segmentElements[i].textContent = timeSegments[i];
  }
}

function isBlinkOn() {
  return new Date().getSeconds() % 2 !== 0;
}

function fillTimeSizer() {
  const date = new Date();
  date.setHours(18, 38, 38);
  timeSizer.textContent = getTimeSegments(date).join(':');
}

function getTimeSegments(date = new Date()) {
  let timeString = date.toLocaleTimeString(navigator.language, timeFormatOptions);
  // Sorry but AM/PM has to go. You can look outside the window to determine if it's day or night.
  timeString = timeString.replaceAll(/\b(A\.?M\.?|P\.?M\.?|)\b/gi, '').trim();
  return timeString.split(':');
}
