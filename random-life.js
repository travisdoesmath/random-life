const pixelWidth = 5,
    pixelsX = 200,
    pixelsY = 100

let timeStep = 64,
    minTimeStep = 4,
    maxTimeStep = 512;

let cells = [],
    cellCounts = [],
    nIterations = 0;

let randomShape = []

let initialPercentage = 0.19,
    lowPercentage = 0.15,
    highPercentage = 0.25,
    neighborRadius = 5

function createSlider(options) {
    var Slider = d3
        .sliderHorizontal()
        .tickFormat(options.tickFormat)
        .min(options.min)
        .max(options.max)
        .step(options.step)
        .width(450)
        .default(options.default)
        .displayValue(options.displayValue)
        .fill('#2196f3')
        .on('onchange', options.onchange)    
    
    if (options.div) {
        var sliderDiv = d3.select(options.div)
            .classed("row", true)
            .classed("justify-content-center", true)
            .classed("align-items-center", true)
            .append("div")
            .classed("col-xs-12 col-lg-6", true)
    } else {
        var sliderDiv = d3.select("#body")
            .append("div")
            .classed("row", true)
            .classed("justify-content-center", true)
            .classed("align-items-center", true)
            .append("div")
            .classed("col-xs-12 col-lg-6", true)
    }

    sliderDiv.append("h3")
        .text(options.title)

    sliderDiv
        .append("svg")
        // .attr("width", 500)
        // .attr("height", 100)
        .style("width","90%")
        .attr("viewBox", `0 0 500 60`)
        .append("g")
        .attr("transform","translate(20,20)")
        .call(Slider)
}

// initialPercentage slider
createSlider({
    div:'#percentage-slider',
    min:0,
    max:1,
    step:0.0001,
    tickFormat:x => `${(+x*100).toFixed(0)}%`,
    default:initialPercentage,
    onchange:val => {
            initialPercentage = val
        },
    title:'Initial Percentage'
})

// speed slider
createSlider({
    min:1,
    max:8,
    step:1,
    tickFormat:x => x,
    default:5,
    onchange:val => {
            timeStep = 2**(9 - val)
        },
    title:'Speed'
})

function initializePattern() {

    randomShape = [];

    let context = patternCanvas.node().getContext('2d');
    context.beginPath();
    context.clearRect(0, 0, (2 * neighborRadius + 1) * pixelWidth, (2 * neighborRadius + 1) * pixelWidth + 1)

    context.beginPath();
    context.fillStyle = 'red'
    context.fillRect(neighborRadius * pixelWidth, neighborRadius * pixelWidth, pixelWidth, pixelWidth)

    for (let i = 0; i < 8; i++) {
        r = 1 + (neighborRadius - 1) * Math.random()
        theta = Math.random() * Math.PI * 2
        x = Math.round(r * Math.cos(theta))
        y = Math.round(r * Math.sin(theta))
        context.beginPath()
        context.fillStyle = 'black'
        context.fillRect((x + neighborRadius) * pixelWidth, (y + neighborRadius)* pixelWidth, pixelWidth, pixelWidth)

        randomShape.push({
            x: x,
            y: y
        })
    }
}

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
                cell.neighbors.push({
                    x: x + randomShape[i].x, 
                    y: y + randomShape[i].y
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

let patternCanvas = d3.select('#patternCanvas')
    .attr('width', `${(2 * neighborRadius + 1) * pixelWidth}px`)
    .attr('height', `${(2 * neighborRadius + 1) * pixelWidth}px`)
    .style('border', 'solid 1px black')

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
    if (d3.event.key == "Escape" || d3.event.key.toLowerCase() == "p") {
        pause = !pause; 
        if (!pause) { play(); } 
    }
})

d3.select("#patternCanvas").on("click", () => {
    initializePattern();
    initializeCells(initialPercentage)
})

d3.select("#lifeCanvas").on("click", () => initializeCells(initialPercentage))

function play() {
    nIterations++;
    drawScreen();
    cells = evolve(cells);
    if (!pause) { setTimeout(play, timeStep); }
}


let pause = false;
initializePattern();
initializeCells(initialPercentage);

play();
