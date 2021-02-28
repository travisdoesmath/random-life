const pixelWidth = 5,
    pixelsX = 200,
    pixelsY = 100

let timeStep = 64,
    minTimeStep = 4,
    maxTimeStep = 512;

let cells = [],
    cellCounts = [],
    nIterations = 0;

let initialPercentage = 0.185,
    neighborRadius = 5

function initializeCells(p) {
    nIterations = 0;
    cells = [];
    for (let x = 0; x < pixelsX; x++) {
        let row = [];
        for (let y = 0; y < pixelsY; y++) {
            cell = {
                value: Math.random() < p,
                neighbors: []
            }
            for (let i = 0; i < 8; i++) {
                r = 1 + (neighborRadius - 1) * Math.random()
                theta = Math.random() * Math.PI * 2
                cell.neighbors.push({
                    x: x + Math.round(r * Math.cos(theta)), 
                    y: y + Math.round(r * Math.sin(theta))
                })
            }
            row.push(cell);
        }
        cells.push(row)
    }    
}

function getNumberOfLiveCells(x, y) {
    cell = cells[x][y]
    let n = 0;

    for (let i = 0; i < cell.neighbors.length; i++) {
        let x = cell.neighbors[i].x;
        let y = cell.neighbors[i].y;
        if (isAlive(x, y)) n++;
    }

    return n;
}

function isAlive(x, y) {
    try {
        if (x < 0) x = pixelsX + x;
        if (y < 0) y = pixelsY + y;
        x = x % pixelsX;
        y = y % pixelsY;
        value = cells[x][y].value;    
    }
    catch(error) {
        console.log(`x: ${x}, y: ${y}`)
    }
    return value;
}

function evolve(cells) {
    let newCells = [];
    for (let x = 0; x < pixelsX; x++) {
        let row = [];
        for (let y = 0; y < pixelsY; y++) {
            // Conway's life rules
            if (cells[x][y].value) {
                // cell is currently alive
                n = getNumberOfLiveCells(x, y);
                if (n == 2 || n == 3) {
                    row.push({
                        value: true,
                        neighbors: cells[x][y].neighbors
                    });
                } else {
                    row.push({
                        value: false,
                        neighbors: cells[x][y].neighbors
                    });
                }
            } else {
                // cell is currently dead
                n = getNumberOfLiveCells(x, y);
                if (n == 3) {
                    row.push({
                        value: true,
                        neighbors: cells[x][y].neighbors
                    });
                } else {
                    row.push({
                        value: false,
                        neighbors: cells[x][y].neighbors
                    });
                }
            }
        }
        newCells.push(row)
    }        
    return newCells;
}

let lifeCanvas = d3.select('#lifeCanvas')
    .attr('width', `${pixelsX * pixelWidth}px`)
    .attr('height', `${pixelsY * pixelWidth}px`)

function drawScreen() {
    let context = lifeCanvas.node().getContext('2d');
    context.beginPath();
    context.clearRect(0, 0, pixelWidth * pixelsX, pixelWidth * pixelsY)
    context.fill()

    for (let x = 0; x < pixelsX; x++) {
        for (let y = 0; y < pixelsY; y++) {
            if (cells[x][y].value) {
                context.beginPath();
                context.fillRect(pixelWidth * x, pixelWidth * y, pixelWidth, pixelWidth)
            }
        }
    }


}

d3.select("body").on("keydown", function(d) {
    if (['1','2','3','4','5','6','7','8','9'].includes(d3.event.key) && !pause) {
        // let p = .15+(+d3.event.key - 1)/20
        let lowPercentage = .15
        let highPercentage = .22

        let p = lowPercentage + (+d3.event.key - 1)/8 * (highPercentage - lowPercentage)
        console.log(p)

        initializeCells(p)
    }

    if (d3.event.key == "ArrowLeft" && timeStep < maxTimeStep) {
        timeStep = timeStep * 2;
    }

    if (d3.event.key == "ArrowRight" && timeStep > minTimeStep) {
        timeStep = timeStep * .5;
    }



    if (d3.event.key == "Escape" || d3.event.key.toLowerCase() == "p") {
        pause = !pause; 
        if (!pause) { play(); } 
    }
})

function play() {
    nIterations++;
    drawScreen();
    cells = evolve(cells);
    if (!pause) { setTimeout(play, timeStep); }
}


let pause = false;
initializeCells(initialPercentage);

play();
