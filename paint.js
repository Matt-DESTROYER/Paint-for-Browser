// paint
let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");

// set canvas dimensions
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// selected colour
let color = "rgba(0, 0, 0, 1)";

// validate color function
function validateColor(color) {
    if (color === '') {
        return;
	}
    if (color.toLowerCase() === 'transparent') {
        return [0, 0, 0, 0];
	}
    if (color[0] === '#') {
        if (color.length < 7) {
            // convert #RGB and #RGBA to #RRGGBB and #RRGGBBAA
            color = '#' + color[1] + color[1] + color[2] + color[2] + color[3] + color[3] + (color.length > 4 ? color[4] + color[4] : '');
        }
        return [parseInt(color.substr(1, 2), 16), parseInt(color.substr(3, 2), 16), parseInt(color.substr(5, 2), 16), color.length > 7 ? parseInt(color.substr(7, 2), 16)/255 : 1];
    }
    if (color.indexOf('rgb') === -1) {
        // convert named colors
        let tempElem = document.body.appendChild(document.createElement('fictum'));
        let flag = 'rgb(1, 2, 3)';
        tempElem.style.color = flag;
        if (tempElem.style.color != flag) {
            return; // color set failed
        }
		tempElem.style.color = color;
        if (tempElem.style.color === flag || tempElem.style.color === '') {
            return; // color parse failed
		}
        color = getComputedStyle(tempElem).color;
        document.body.removeChild(tempElem);
    }
    if (color.indexOf('rgb') === 0) {
        if (color.indexOf('rgba') === -1) {
            color += ',1'; // convert 'rgb(R,G,B)' to 'rgb(R,G,B)A'
        }
		return color.match(/[\.\d]+/g).map(function (a) {
            return +a;
        });
    }
}

// custom color
function customColor() {
	let colorPlaceholder = validateColor(document.getElementById('color').value);
	try {
		color = "rgba(" + colorPlaceholder[0] + ", " + colorPlaceholder[1] + ", " + colorPlaceholder[2] + ", " + colorPlaceholder[3] + ")";
		document.getElementById('color').value = "";
		document.getElementById('color').placeholder = "custom color";
	} catch (err) {
		document.getElementById('color').value = "";
		document.getElementById('color').placeholder = "invalid input";
	}
}

// line width
let lineW = 1;
function lineWidth() {
	lineW = document.getElementById('lineWidth').value;
}

// selected drawing type
let shapes = ["line", "rectangle", "circle", "rubber", "thin pen"];
let shape = 4;

// drawn order
let order = [];

// drawn shapes
let rect = {
	x: [],
	y: [],
	w: [],
	h: [],
	fill: [],
	color: []
}
let circ = {
	x: [],
	y: [],
	r: [],
	fill: [],
	color: []
}
let line = {
	x1: [],
	y1: [],
	x2: [],
	y2: [],
	w: [],
	color: []
}
let thinpen = {
	x1: [],
	y1: [],
	x2: [],
	y2: [],
	color: []
}

// variable to determine whethter to fill or stroe shape
let fillShape = true;

// function to change fill type
function changeFillType() {
	if (fillShape) {
		fillShape = false;
		document.getElementById("fill type").innerHTML = "fill shapes";
	} else {
		fillShape = true;
		document.getElementById("fill type").innerHTML = "outline shapes";
	}
}

// function to save canvas as png
function download() {
	let download = document.getElementById("download");
	let img = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
	download.href = img;
};

// variable to check if already drawing or not
let alreadyDrawing = false;

// access to current and previous mouse position
let mouseX, mouseY, previousMouseX, previousMouseY;
canvas.addEventListener('mousemove', e => {
	let rect = canvas.getBoundingClientRect();
	mouseX = e.clientX - rect.left;
	mouseY = e.clientY - rect.top;
});

// access to mouse down/up
let mouseDown = false;
canvas.addEventListener('mousedown', e => {
	mouseDown = true;
});
canvas.addEventListener('mouseup', e => {
	mouseDown = false;
});

// rubber
function rubber() {
	let idx;
	for (let i = 0; i < order.length; i++) {
		idx = order[i][1];
		if (order[i][0] === "thin pen") {
			if (1===2) {
				line.x1.splice(idx, 1);
				line.y1.splice(idx, 1);
				line.x2.splice(idx, 1);
				line.y2.splice(idx, 1);
				line.color.splice(idx, 1);
			}
		} else if (order[i][0] === "line") {
			if (1===2) {
				line.x1.splice(idx, 1);
				line.y1.splice(idx, 1);
				line.x2.splice(idx, 1);
				line.y2.splice(idx, 1);
				line.color.splice(idx, 1);
			}
		} else if (order[i][0] === "rect") {
			if (mouseX > rect.x[idx] && mouseY > rect.y[idx] && mouseX < rect.x[idx] + rect.w[idx] && mouseY < rect.y[idx] + rect.h[idx]) {
				rect.x.splice(idx, 1);
				rect.y.splice(idx, 1);
				rect.w.splice(idx, 1);
				rect.h.splice(idx, 1);
				rect.fill.splice(idx, 1);
				rect.color.splice(idx, 1);
			}
		} else if (order[i][0] === "circ") {
			if (mouseX > circ.x[idx] - circ.r[idx] && mouseY > circ.y[idx] - circ.r[idx] && mouseX < circ.x[idx] + circ.r[idx] && mouseY < circ.y[idx] + circ.r[idx]) {
				circ.x.splice(idx, 1);
				circ.y.splice(idx, 1);
				circ.r.splice(idx, 1);
				circ.fill.splice(idx, 1);
				circ.color.splice(idx, 1);
			}
		}
	}
}

// undo
function undo() {
	if (order[order.length-1][0] === "thin pen") {
		thinpen.x1.splice(order[order.length-1][1][0], order[order.length-1][1].length);
		thinpen.y1.splice(order[order.length-1][1][0], order[order.length-1][1].length);
		thinpen.x2.splice(order[order.length-1][1][0], order[order.length-1][1].length);
		thinpen.y2.splice(order[order.length-1][1][0], order[order.length-1][1].length);
		thinpen.color.splice(order[order.length-1][1][0], order[order.length-1][1].length);
		order.splice(order.length-1, 1);
	} else if (order[order.length-1][0] === "line") {
		line.x1.splice(order[order.length-1][1], 1);
		line.y1.splice(order[order.length-1][1], 1);
		line.x2.splice(order[order.length-1][1], 1);
		line.y2.splice(order[order.length-1][1], 1);
		line.color.splice(order[order.length-1][1], 1);
		order.splice(order.length-1, 1);
	} else if (order[order.length-1][0] === "rect") {
		rect.x.splice(order[order.length-1][1], 1);
		rect.y.splice(order[order.length-1][1], 1);
		rect.w.splice(order[order.length-1][1], 1);
		rect.h.splice(order[order.length-1][1], 1);
		rect.color.splice(order[order.length-1][1], 1);
		order.splice(order.length-1, 1);
	} else if (order[order.length-1][0] === "circ") {
		circ.x.splice(order[order.length-1][1], 1);
		circ.y.splice(order[order.length-1][1], 1);
		circ.r.splice(order[order.length-1][1], 1);
		circ.fill.splice(order[order.length-1][1], 1);
		circ.color.splice(order[order.length-1][1], 1);
		order.splice(order.length-1, 1);
	}
}

// render
function render() {
	for (let i = 0; i < order.length; i++) {
		ctx.beginPath();
		if (order[i][0] === "thin pen") {
			ctx.strokeStyle = thinpen.color[order[i][1][0]];
			ctx.lineWidth = 1;
			for (let idx = 0; idx < order[i][1].length; idx++) {
				ctx.moveTo(thinpen.x1[order[i][1][idx]], thinpen.y1[order[i][1][idx]]);
				ctx.lineTo(thinpen.x2[order[i][1][idx]], thinpen.y2[order[i][1][idx]]);
			}
			ctx.stroke();
		} else if (order[i][0] === "line") {
			ctx.strokeStyle = line.color[order[i][1]];
			ctx.lineWidth = line.w[order[i][1]];
			ctx.moveTo(line.x1[order[i][1]], line.y1[order[i][1]]);
			ctx.lineTo(line.x2[order[i][1]], line.y2[order[i][1]]);
			ctx.stroke();
		} else if (order[i][0] === "rect") {
			if (rect.fill[order[i][1]]) {
				ctx.fillStyle = rect.color[order[i][1]];
			} else {
				ctx.strokeStyle = rect.color[order[i][1]];
			}
			ctx.rect(rect.x[order[i][1]], rect.y[order[i][1]], rect.w[order[i][1]], rect.h[order[i][1]]);
			if (rect.fill[order[i][1]]) {
				ctx.fill();
			} else {
				ctx.stroke();
			}
		} else if (order[i][0] === "circ") {
			if (circ.fill[order[i][1]]) {
				ctx.fillStyle = circ.color[order[i][1]];
			} else {
				ctx.strokeStyle = circ.color[order[i][1]];
			}
			ctx.arc(circ.x[order[i][1]], circ.y[order[i][1]], circ.r[order[i][1]], 0, Math.PI * 2);
			if (circ.fill[order[i][1]]) {
				ctx.fill();
			} else {
				ctx.stroke();
			}
		}
		ctx.closePath();
	}
}

let paint = setInterval(function () {
	if (mouseDown) {
		if (alreadyDrawing) {
			if (shapes[shape] === "thin pen") {
				thinpen.x1.push(previousMouseX);
				thinpen.y1.push(previousMouseY);
				thinpen.x2.push(mouseX);
				thinpen.y2.push(mouseY);
				thinpen.color.push(color);
				order[order.length-1][1].push(thinpen.x1.length-1);
			} else if (shapes[shape] === "line") {
				line.x2[line.x2.length-1] = mouseX;
				line.y2[line.y2.length-1] = mouseY;
			} else if (shapes[shape] === "rectangle") {
				rect.w[rect.w.length-1] = mouseX - rect.x[rect.x.length-1];
				rect.h[rect.h.length-1] = mouseY - rect.y[rect.y.length-1];
			} else if (shapes[shape] === "circle") {
				circ.r[circ.r.length-1] = Math.round(Math.sqrt(Math.pow(mouseX - circ.x[circ.x.length-1], 2) + Math.pow(mouseY - circ.y[circ.y.length-1], 2)));
			} else if (shapes[shape] === "rubber") {
				rubber();
			}
		} else if (previousMouseX === mouseX && previousMouseY === mouseY) {
			
		} else {
			if (shapes[shape] === "thin pen") {
				thinpen.x1.push(previousMouseX);
				thinpen.y1.push(previousMouseY);
				thinpen.x2.push(mouseX);
				thinpen.y2.push(mouseY);
				thinpen.color.push(color);
				order.push(["thin pen", [thinpen.x1.length-1]]);
			} else if (shapes[shape] === "line") {
				line.x1.push(mouseX);
				line.y1.push(mouseY);
				line.x2.push(mouseX);
				line.y2.push(mouseY);
				line.w.push(lineW);
				line.color.push(color);
				order.push(["line", line.x1.length-1]);
			} else if (shapes[shape] === "rectangle") {
				rect.x.push(mouseX);
				rect.y.push(mouseY);
				rect.w.push(0);
				rect.h.push(0);
				rect.fill.push(fillShape);
				rect.color.push(color);
				order.push(["rect", rect.x.length-1]);
			} else if (shapes[shape] === "circle") {
				circ.x.push(mouseX);
				circ.y.push(mouseY);
				circ.r.push(1);
				circ.fill.push(fillShape);
				circ.color.push(color);
				order.push(["circ", circ.x.length-1]);
			} else if (shapes[shape] === "rubber") {
				rubber();
			}
			alreadyDrawing = true;
		}
	} else {
		alreadyDrawing = false;
	}
	ctx.beginPath();
	ctx.fillStyle = "white";
	ctx.strokeStyle = "white";
	ctx.rect(0, 0, canvas.width, canvas.height);
	ctx.fill();
	ctx.stroke();
	ctx.closePath();
	render();
	previousMouseX = mouseX;
	previousMouseY = mouseY;
	if (shapes[shape] === "rubber") {
		ctx.beginPath();
		ctx.fillStyle = "white";
		ctx.strokeStyle = "black";
		ctx.arc(mouseX, mouseY, 10, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();
		ctx.closePath();
	}
}, 1);
