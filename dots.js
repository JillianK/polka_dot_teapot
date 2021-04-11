let sz = 512;
let txtmap;
let minsize = 30;
let maxsize = 70;
let paddingFactor = 5;
let pixelSparsenessFactor = 0.4;
let colorList = [
    [170, 93, 212],
    [214, 84, 179],
    [255, 156, 102]
]

let txtmp;

function preload() {
  inittxtmp()
}

function drawLine(X1, Y1, X2, Y2, r, g, b){
  if(Math.abs(X1-X2)<1) {
    vertical(X1, Y1, Y2, r, g, b);
  }
  if(Math.abs(Y1-Y2)<2) {
    horizontal(X1, X2, Y1, r, g, b);
  }
  
  if(X1 < X2 && Y1<Y2) {
    midPointCase1(X1, Y1, X2, Y2, r, g, b);
  } else if(X1 > X2 && Y1< Y2) {
    midPointCase2(X1, Y1, X2, Y2, r, g, b);
  } else if(X1 > X2 && Y1 > Y2) {
    midPointCase3(X1, Y1, X2, Y2, r, g, b);
  } else if(X1 < X2 && Y1>Y2){
    midPointCase4(X1, Y1, X2, Y2, r, g, b);
  }
}

// Assumption: X1<X2, Y1< Y2
function midPointCase1(X1, Y1, X2, Y2, r, g, b)
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
      setTextureMapPixel(x, y, r, g, b);

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
          setTextureMapPixel(x, y, r, g, b);
      } 
    } else {
      let d=(2*dx)-dy;
      let x = X1, y = Y1;
      setTextureMapPixel(x, y, r, g, b);
      while (y <= Y2) {
        if (d>0) {
          x++;
          d = d+(2*(dx-dy));
        } else {
          d = d + 2*dx;
        }
        setTextureMapPixel(x, y, r, g, b);
        y++;
      }
    }
}


// Assumption: X1 > X2, Y1< Y2
function midPointCase2(X1, Y1, X2, Y2, r, g, b)
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
      setTextureMapPixel(x, y, r, g, b);

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
          setTextureMapPixel(x, y, r, g, b);
      }
    } else {
      let d=(2*dx)-dy;
      let x = X1, y = Y1;
      setTextureMapPixel(x, y, r, g, b);
      while (y <= Y2) {
        if (d>0) {
          x--;
          d = d+(2*(dx-dy));
        } else {
          d = d + 2*dx;
        }
        setTextureMapPixel(x, y, r, g, b);
        y++;
      }
    }
}

// Assumption: X1 > X2, Y1 > Y2 like 0,0 -> -10, -5
function midPointCase3(X1, Y1, X2, Y2, r, g, b)
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
      setTextureMapPixel(x, y, r, g, b);

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
          setTextureMapPixel(x, y, r, g, b);
      } 
    } else {
      let d=(2*dx)-dy;
      let x = X1, y = Y1;
      setTextureMapPixel(x, y, r, g, b);
      while (y >= Y2) {
        if (d>0) {
          x--;
          d = d+(2*(dx-dy));
        } else {
          d = d + 2*dx;
        }
        setTextureMapPixel(x, y, r, g, b);
        y--;
      }
    }
}

// Assumption: X1 < X2, Y1 > Y2 like 0,0 -> 10, -5
function midPointCase4(X1, Y1, X2, Y2, r, g, b)
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
    setTextureMapPixel(x, y, r, g, b);
 
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
        setTextureMapPixel(x, y, r, g, b);
    }
    } else {
      let d=(2*dx)-dy;
      let x = X1, y = Y1;
      setTextureMapPixel(x, y, r, g, b);
      while (y >= Y2) {
        if (d>0) {
          x++;
          d = d+(2*(dx-dy));
        } else {
          d = d + 2*dx;
        }
        setTextureMapPixel(x, y, r, g, b);
        y--;
      }
    }
}

function vertical(X1, Y1, Y2, r, g, b) {
  let y = Math.min(Y1, Y2);
  while(y<= Math.max(Y1, Y2)) {
    setTextureMapPixel(X1, y, r, g, b);
    y++;
  }
}


function horizontal(X1, X2, Y1, r, g, b) {
  let x = Math.min(X1, X2);
  while(x<= Math.max(X1, X2)) {
    setTextureMapPixel(x, Y1, r, g, b);
    x++;
  }
}

function drawCircle(radius, centerx, centery, r, g, b) {
  let x = radius;
  let y = 0;
  let delta = 1 - x;
  let step = 0.5
  
  while (x >= y) {
    drawLine(centerx, centery, x + centerx, y + centery, r, g, b);
    drawLine(centerx, centery, y + centerx, x + centery, r, g, b);
    drawLine(centerx, centery, -x + centerx, y + centery, r, g, b);
    drawLine(centerx, centery, -y + centerx, x + centery, r, g, b);
    drawLine(centerx, centery, -x + centerx, -y + centery, r, g, b);
    drawLine(centerx, centery, -y + centerx, -x + centery, r, g, b);
    drawLine(centerx, centery, x + centerx, -y + centery, r, g, b);
    drawLine(centerx, centery, y + centerx, -x + centery, r, g, b);
    y = y +step;
    
    if (delta < 0) {
        delta = delta+(2*y+1);
    }
    else {
        x-=step;
        delta = delta+(2*(y-x+1));
    }
  } 
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
        drawCircle(rad, x, y, r, g, b)
        circleList.push([x, y, rad])
        coveredArea = coveredArea + (Math.PI * Math.pow(rad, 2));
    } else {
        numAllowedFailedCircles = numAllowedFailedCircles - 1;
    }
  }
  return txtmp;
  
}