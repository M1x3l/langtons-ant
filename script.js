/**
 * @type HTMLInputElement
 */
const sequenceInput = document.querySelector("input#move-sequence");
/**
 * @type HTMLParagraphElement
 */
const posDisplay = document.querySelector("p#pos");
/**
 * @type HTMLInputElement
 */
const drawIntervalSlider = document.querySelector("input#draw-interval");
/**
 * @type HTMLParagraphElement
 */
const drawIntervalDisplay = document.querySelector("p#draw-interval-display");
/**
 * @type HTMLCanvasElement
 */
const canvas = document.querySelector("canvas#canvas");
const context = canvas.getContext("2d");
const width = canvas.width,
  height = canvas.height;
let imagedata = context.createImageData(width, height);

sequenceInput.addEventListener("input", (e) => {
  const target = e.target;
  const validCharacters = target.value.match(/[LR]/gi);
  validCharacters
    ? (target.value = validCharacters.join(""))
    : (target.value = "");
});

const sequence = sequenceInput.value
  .split("")
  .map((char) => (char.toLowerCase() == "r" ? "CCW" : "CW"));

const directions = {
  UP: 0,
  RIGHT: 1,
  DOWN: 2,
  LEFT: 3,
  CCW: -1,
  CW: 1,
};

let ant = {
  pos: {
    x: { value: Math.floor(width >> 1), min: 0, max: width },
    y: { value: Math.floor(height >> 1), min: 0, max: height },
  },
  facing: directions.UP,
};

// color = {
//     r : number,
//     g : number,
//     b : number,
//     a : number
// }

const turn = (direction) => {
  const facing = ant.facing;
  let newFacing = facing + direction;
  if (newFacing == 4) newFacing = 0;
  else if (newFacing == -1) newFacing = 3;

  ant.facing = newFacing;
};
const move = () => {
  switch (ant.facing) {
    case directions.UP:
      ant.pos.y.value += 1;
      break;
    case directions.RIGHT:
      ant.pos.x.value += 1;
      break;
    case directions.DOWN:
      ant.pos.y.value -= 1;
      break;
    case directions.LEFT:
      ant.pos.x.value -= 1;
      break;
    default:
      break;
  }
};
/**
 * @param {number} x
 * @param {number} y
 * @param {{
 * r : number,
 * g : number,
 * b : number,
 * a : number
 * }} color
 */
const setColor = (x, y, color) => {
  const index = (y * width + x) * 4;
  imagedata.data[index] = color.r;
  imagedata.data[index + 1] = color.g;
  imagedata.data[index + 2] = color.b;
  imagedata.data[index + 3] = color.a;
};
/**
 * @param {number} x
 * @param {number} y
 * @returns {{
 * r : number,
 * g : number,
 * b : number,
 * a : number
 * }}
 */
const getColor = (x, y) => {
  const index = (y * width + x) * 4;
  return {
    r: imagedata.data[index],
    g: imagedata.data[index + 1],
    b: imagedata.data[index + 2],
    a: imagedata.data[index + 3],
  };
};

function colorManager(x, y, targetColorArray, turnDirection) {
  turn(directions[turnDirection]);
  setColor(x, y, {
    r: targetColorArray[0],
    g: targetColorArray[1],
    b: targetColorArray[2],
    a: targetColorArray[3],
  });
  move();
}

let iterations = 0;

function antHandler() {
  ant.pos = wrapPosition(ant.pos);
  let [x, y] = [ant.pos.x.value % width, ant.pos.y.value % height];
  const currentColor = getColor(x, y);
  const colorString = `${currentColor.r}-${currentColor.g}-${currentColor.b}`;
  switch (colorString) {
    case "255-255-255":
      colorManager(x, y, [0, 0, 0, 255], "CW");
      break;
    case "0-0-0":
      // colorManager(x, y, [255, 255, 255, 255], "CCW");
      colorManager(x, y, [255, 0, 0, 255], "CW");
      break;
    case "255-0-0":
      colorManager(x, y, [0, 255, 0, 255], "CCW");
      break;
    case "0-255-0":
      // colorManager(x, y, [0, 0, 255, 255], "CCW");
      colorManager(x, y, [255, 255, 255, 255], "CCW");
      break;
    // case "0-0-255":
    //   colorManager(x, y, [255, 255, 0, 255], "CCW");
    //   break;
    // case "255-255-0":
    //   colorManager(x, y, [255, 0, 255, 255], "CW");
    //   break;
    // case "255-255-0":
    //   colorManager(x, y, [255, 0, 255, 255], "CCW");
    //   break;
    // case "255-0-255":
    //   colorManager(x, y, [0, 255, 255, 255], "CCW");
    //   break;
    // case "0-255-255":
    //   colorManager(x, y, [128, 0, 0, 255], "CCW");
    //   break;
    // case "128-0-0":
    //   colorManager(x, y, [0, 128, 0, 255], "CW");
    //   break;
    // case "0-128-0":
    //   colorManager(x, y, [0, 0, 128, 255], "CW");
    //   break;
    default:
      colorManager(x, y, [255, 255, 255, 255], "CW");
      break;
  }

  //#region drawing
  if ((iterations = iterations % getDrawInterval()) == 0) {
    context.putImageData(imagedata, 0, 0);
    posDisplay.innerText = `X: ${ant.pos.x.value} Y: ${ant.pos.y.value}`;
  }
  drawIntervalDisplay.innerText = drawIntervalSlider.value;
  iterations++;
  //#endregion
  return;
}

function wrapPosition(pos) {
  //if value < min  ->  sub v
  if (pos.x.value < pos.x.min) pos.x.value = pos.x.max - Math.abs(pos.x.value);
  if (pos.x.value > pos.x.max)
    pos.x.value = pos.x.min + (pos.x.value % pos.x.max);
  if (pos.y.value < pos.y.min) pos.y.value = pos.y.max - Math.abs(pos.y.value);
  if (pos.y.value > pos.y.max)
    pos.y.value = pos.y.min + (pos.y.value % pos.y.max);
  return pos;
}

function getDrawInterval() {
  return document.querySelector("input#draw-interval").value;
}

function generateRandomByte(offset = 0) {
  return Math.floor(Math.random() * 256 + offset);
}

console.log(`Interval ID: ${setInterval(antHandler, 0)}`);
