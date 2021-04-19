let sz = 512;
let txtmap;
let pixelSparsenessFactor = 0.4;
let minamountofcirclesontexturemap = 2;
// this is the MAX max size we should allow a user to pick for the circles, 
// otherwise they will overflow onto the next texture map
// taken into account the parameters such as pixelsparseness factor
// so we can choose what is the minimum number of circles to include on the texture map
let maxsizetoavoidoverflow = sz*pixelSparsenessFactor/minamountofcirclesontexturemap;
let minsize = 10;
let maxsize = 100;
let paddingFactor = 5;
let colorList = [
    [255, 0, 0]
]
let radialcolor = [0, 0, 0];
let radialmode = "none"

let txtmp;

// source: https://javascript.plainenglish.io/convert-hex-to-rgb-with-javascript-4984d16219c3

function hextorgb(hexcolor) {
    let hex = hexcolor.substr(1);
    let rgb_hex = hex.match(/.{1,2}/g);
    let rgb = [
        parseInt(rgb_hex[0], 16),
        parseInt(rgb_hex[1], 16),
        parseInt(rgb_hex[2], 16)
    ];
    return rgb;
}

function changeRadialMode(mode) {
  radialmode = mode;
}

function changeRadialColor(color) {
  let rgb = hextorgb(color);
  radialcolor = rgb;
}

function changesettings(minsize0, maxsize0, paddingFactor0, colors) {
  minsize = parseFloat(minsize0)
  maxsize = Math.min(parseFloat(maxsize0), maxsizetoavoidoverflow)
  paddingFactor = parseFloat(paddingFactor0)
  let newColorList = []
  for (let i = 0; i < colors.length; i+=1){
    let rgb = hextorgb(colors[i]);
    newColorList.push(rgb);
  }
  colorList = newColorList;
}

function preload() {
  inittxtmp()
}

function drawLine(X1, Y1, X2, Y2, r, g, b, r2, g2, b2, radius){
  if(Math.abs(X1-X2)<1) {
    vertical(X1, Y1, Y2, r, g, b,r2, g2, b2, radius);
  }
  if(Math.abs(Y1-Y2)<2) {
    horizontal(X1, X2, Y1, r, g, b, r2, g2, b2,radius);
  }
  
  if(X1 < X2 && Y1<Y2) {
    midPointCase1(X1, Y1, X2, Y2, r, g, b, r2, g2, b2,radius);
  } else if(X1 > X2 && Y1< Y2) {
    midPointCase2(X1, Y1, X2, Y2, r, g, b, r2, g2, b2,radius);
  } else if(X1 > X2 && Y1 > Y2) {
    midPointCase3(X1, Y1, X2, Y2, r, g, b, r2, g2, b2,radius);
  } else if(X1 < X2 && Y1>Y2){
    midPointCase4(X1, Y1, X2, Y2, r, g, b, r2, g2, b2,radius);
  }
}

// Assumption: X1<X2, Y1< Y2
function midPointCase1(X1, Y1, X2, Y2, r, g, b, r2, g2, b2,radius)
{
 
    // calculate dx & dy
    let dx = X2 - X1;
    let dy = Y2 - Y1;
    if(dy < dx) {
      // initial value of decision
      // parameter d
      let d = dy - (dx/2);
      let x = X1, y = Y1;

      // Plot initial given point
      // putpixel(x,y) can be used to
      // print pixel of line in graphics

      setTextureMapPixelWithGradient(r, g, b, r2, g2, b2, X1, Y1, x, y, radius)

      // iterate through value of X
      while (x < X2)
      {
          x++;

          // E or East is chosen
          if (d < 0)
              d = d + dy;

          // NE or North East is chosen
          else
          {
              d += (dy - dx);
              y++;
          }

          // Plot intermediate points
          // putpixel(x,y) is used to print
          // pixel of line in graphics

          setTextureMapPixelWithGradient(r, g, b, r2, g2, b2, X1, Y1, x, y, radius)
      } 
    } else {
      let d=(2*dx)-dy;
      let x = X1, y = Y1;
      setTextureMapPixelWithGradient(r, g, b, r2, g2, b2, X1, Y1, x, y, radius)
      while (y <= Y2) {
        if (d>0) {
          x++;
          d = d+(2*(dx-dy));
        } else {
          d = d + 2*dx;
        }
        setTextureMapPixelWithGradient(r, g, b, r2, g2, b2, X1, Y1, x, y, radius)
        y++;
      }
    }
}


// Assumption: X1 > X2, Y1< Y2
function midPointCase2(X1, Y1, X2, Y2, r, g, b, r2, g2, b2,radius)
{
 
    // calculate dx & dy
    let dx = X1 - X2;
    let dy = Y2 - Y1;
    if(dy < dx) {
      // initial value of decision
      // parameter d
      let d = dy - (dx/2);
      let x = X1, y = Y1;

      // Plot initial given point
      // putpixel(x,y) can be used to
      // print pixel of line in graphics
      setTextureMapPixelWithGradient(r, g, b, r2, g2, b2, X1, Y1, x, y, radius)

      // iterate through value of X
      while (x > X2)
      {
          x--;

          // E or East is chosen
          if (d < 0)
              d = d + dy;

          // NE or North East is chosen
          else
          {
              d += (dy - dx);
              y++;
          }

          // Plot intermediate points
          // putpixel(x,y) is used to print
          // pixel of line in graphics
          setTextureMapPixelWithGradient(r, g, b, r2, g2, b2, X1, Y1, x, y, radius)
      }
    } else {
      let d=(2*dx)-dy;
      let x = X1, y = Y1;
      setTextureMapPixelWithGradient(r, g, b, r2, g2, b2, X1, Y1, x, y, radius)
      while (y <= Y2) {
        if (d>0) {
          x--;
          d = d+(2*(dx-dy));
        } else {
          d = d + 2*dx;
        }
        setTextureMapPixelWithGradient(r, g, b, r2, g2, b2, X1, Y1, x, y, radius)
        y++;
      }
    }
}

// Assumption: X1 > X2, Y1 > Y2 like 0,0 -> -10, -5
function midPointCase3(X1, Y1, X2, Y2, r, g, b, r2, g2, b2,radius)
{
    // calculate dx & dy
    let dx = X1 - X2;
    let dy = Y1 - Y2;
    if(dy < dx) {
      // initial value of decision
      // parameter d
      let d = dy - (dx/2);
      let x = X1, y = Y1;

      // Plot initial given point
      // putpixel(x,y) can be used to
      // print pixel of line in graphics
      setTextureMapPixelWithGradient(r, g, b, r2, g2, b2, X1, Y1, x, y, radius)

      // iterate through value of X
      while (x > X2)
      {
          x--;

          // E or East is chosen
          if (d < 0)
              d = d + dy;

          // NE or North East is chosen
          else
          {
              d += (dy - dx);
              y--;
          }

          // Plot intermediate points
          // putpixel(x,y) is used to print
          // pixel of line in graphics
          setTextureMapPixelWithGradient(r, g, b, r2, g2, b2, X1, Y1, x, y, radius)
      } 
    } else {
      let d=(2*dx)-dy;
      let x = X1, y = Y1;

      setTextureMapPixelWithGradient(r, g, b, r2, g2, b2, X1, Y1, x, y, radius)
      while (y >= Y2) {
        if (d>0) {
          x--;
          d = d+(2*(dx-dy));
        } else {
          d = d + 2*dx;
        }

        setTextureMapPixelWithGradient(r, g, b, r2, g2, b2, X1, Y1, x, y, radius)
        y--;
      }
    }
}

// Assumption: X1 < X2, Y1 > Y2 like 0,0 -> 10, -5
function midPointCase4(X1, Y1, X2, Y2, r, g, b, r2, g2, b2,radius)
{
    // calculate dx & dy
    let dx = X2 - X1;
    let dy = Y1 - Y2;
  
    if (dy < dx) {
 
    // initial value of decision
    // parameter d
    let d = dy - (dx/2);
    let x = X1, y = Y1;

    // Plot initial given point
    // putpixel(x,y) can be used to
    // print pixel of line in graphics
    setTextureMapPixelWithGradient(r, g, b, r2, g2, b2, X1, Y1, x, y, radius)
 
    // iterate through value of X
    while (x < X2)
    {
        x++;
 
        // E or East is chosen
        if (d < 0)
            d = d + dy;
 
        // NE or North East is chosen
        else
        {
            d += (dy - dx);
            y--;
        }
 
        // Plot intermediate points
        // putpixel(x,y) is used to print
        // pixel of line in graphics

        setTextureMapPixelWithGradient(r, g, b, r2, g2, b2, X1, Y1, x, y, radius)
    }
    } else {
      let d=(2*dx)-dy;
      let x = X1, y = Y1;
      setTextureMapPixelWithGradient(r, g, b, r2, g2, b2, X1, Y1, x, y, radius)
      while (y >= Y2) {
        if (d>0) {
          x++;
          d = d+(2*(dx-dy));
        } else {
          d = d + 2*dx;
        }
        setTextureMapPixelWithGradient(r, g, b, r2, g2, b2, X1, Y1, x, y, radius)
        y--;
      }
    }
}

function vertical(X1, Y1, Y2, r, g, b,r2, g2, b2, radius) {
  let y = Math.min(Y1, Y2);
  while(y<= Math.max(Y1, Y2)) {
    setTextureMapPixelWithGradient(r, g, b, r2, g2, b2, X1, Y1, X1, y, radius)
    y++;
  }
}


function horizontal(X1, X2, Y1, r, g, b,r2, g2, b2,radius) {
  let x = Math.min(X1, X2);
  while(x<= Math.max(X1, X2)) {
    setTextureMapPixelWithGradient(r, g, b, r2, g2, b2, X1, Y1, x, Y1, radius)
    x++;
  }
}

function drawCircle(radius, centerx, centery, r, g, b, r2, g2, b2) {
  let x = radius;
  let y = 0;
  let e = 0;
  let step = 0.5;

  while(x >= y) {
    drawLine(centerx, centery, x + centerx, y + centery, r, g, b, r2, g2, b2, radius);
    drawLine(centerx, centery, y + centerx, x + centery, r, g, b, r2, g2, b2,radius);
    drawLine(centerx, centery, -1*x + centerx, y + centery, r, g, b, r2, g2, b2, radius);
    drawLine(centerx, centery, -1*y + centerx, x + centery, r, g, b, r2, g2, b2,radius);
    drawLine(centerx, centery, -1*x + centerx, -1*y + centery, r, g, b, r2, g2, b2,radius);
    drawLine(centerx, centery, -1*y + centerx, -1*x + centery, r, g, b, r2, g2, b2,radius);
    drawLine(centerx, centery, x + centerx, -1*y + centery, r, g, b, r2, g2, b2,radius);
    drawLine(centerx, centery, y + centerx, -1*x + centery, r, g, b, r2, g2, b2,radius);
    if (e <= 0) {
      y+=step;
      e+= (2*y+1);
    } else {
      x-=step;
      e-= (2*x+1);
    }
  }
}

function getcolor(r0, g0, b0, r1, b1, g1, x0, y0, x1, y1, radius) {
  // distance of current point to center / total radius
  const xDist = x0 - x1;
  const yDist = y0 - y1;
  const dist = Math.pow( Math.pow(xDist, 2) + Math.pow(yDist, 2), 0.5);
  let t = dist/radius;

  // https://www.alanzucconi.com/2016/01/06/colour-interpolation/

  let newr = r0/255.0 + (r1/255.0 - r0/255.0)*t;
  let newg = g0/255.0 + (g1/255.0 - g0/255.0)*t;
  let newb = b0/255.0 + (b1/255.0 - b0/255.0)*t;

  return [newr*255, newg*255, newb*255]

}

function setTextureMapPixelWithGradient(r0, g0, b0, r1, g1, b1, x0, y0, x, y, radius) {
  let color = getcolor(r0, g0, b0, r1, g1, b1, x0, y0, x, y, radius)
  if (r0 == r1) {color[0] = r0;}
  if (g0 == g1) {color[1] = g0;}
  if (b0 == b1) {color[2] = b0;} 
  setTextureMapPixel(x, y, color[0], color[1], color[2]);
}

function setTextureMapPixel(x, y, rr, gg, bb) {
  if (x < 0) {x = 0}
  if (y < 0) {y = 0}
  if (x > sz-1) {x = sz-1}
  if (y > sz-1) {y = sz-1}

  txtmp[Math.floor(x)][Math.floor(y)][0] = rr;
  txtmp[Math.floor(x)][Math.floor(y)][1] = gg;
  txtmp[Math.floor(x)][Math.floor(y)][2] = bb;
}

function inittxtmp() {
  let tm = []
  
  for (let i = 0; i < sz; i++) {
    let row = [];
    for (let j = 0; j < sz; j++) {
      row.push([255, 255, 255]);
    }
    tm.push(row);
  }
  txtmp = tm;
}

function random(min, max) { 
    return Math.random() * (max - min) + min;
} 

function isOverlapping(circleList, x, y, rad) {
    for(let i=0; i< circleList.length; i=i+1) {
        let circle = circleList[i];
        const xDist = circle[0] - x;
        const yDist = circle[1] - y;
        const dist = Math.pow( Math.pow(xDist, 2) + Math.pow(yDist, 2), 0.5)
        if(dist < rad + circle[2] + paddingFactor) {
            return true;
        }
    }
    return false;
}

function getDots() {
  inittxtmp()
  let circleList = [];
  let numAllowedFailedCircles = 20;
  let coveredArea = 0;
  print("");
  print("minsize " + minsize)
  print("maxsize " + maxsize)
  print("padding " + paddingFactor)
  print("mpadding divide by 2 " + paddingFactor/2)
  let rad1 = random(minsize, maxsize)
  print("random size " + rad1)
  print("");
  while(coveredArea < sz*sz*pixelSparsenessFactor && numAllowedFailedCircles >= 0){
    let x = random(0, sz)
    let y = random(0, sz)
    let rad = random(minsize, maxsize)
    x = Math.max(x, rad + (paddingFactor/2));
    x = Math.min(x, sz- rad - (paddingFactor/2));
    y = Math.max(y, rad + (paddingFactor/2));
    y = Math.min(y, sz - rad - (paddingFactor/2));
    let numTries = 0;
    while(numTries < 10 && isOverlapping(circleList, x, y, rad)) {
        x = random(0, sz)
        y = random(0, sz)
        rad = random(minsize, maxsize)
        x = Math.max(x, rad + (paddingFactor/2));
        x = Math.min(x, sz-rad - (paddingFactor/2));
        y = Math.max(y, rad + (paddingFactor/2));
        y = Math.min(y, sz - rad - (paddingFactor/2));
        numTries = numTries + 1;
    }
    if(numTries < 10) {
        let color = colorList[Math.floor(random(0, colorList.length))];
        let r = color[0];
        let g = color[1];
        let b = color[2];


        let r2;
        let g2;
        let b2;
        if (radialmode === "none") {
          r2 = r
          g2 = g
          b2 = b
        } else if (radialmode === "solid") {
          r2 = radialcolor[0];
          g2 = radialcolor[1];
          b2 = radialcolor[2];
        } else if (radialmode === "random") {
          let color2 = colorList[Math.floor(random(0, colorList.length))];
          r2 = random(0, 255);
          g2 = random(0, 255);
          b2 = random(0, 255);
        }

        print(r2 + " " + g2 + " " + b2);


        drawCircle(rad, x, y, r, g, b, r2, g2, b2)
        circleList.push([x, y, rad])
        coveredArea = coveredArea + (Math.PI * Math.pow(rad, 2));
    } else {
        numAllowedFailedCircles = numAllowedFailedCircles - 1;
    }
  }
  return txtmp;
  
}