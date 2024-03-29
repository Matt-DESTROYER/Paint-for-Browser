// get canvas & ctx
let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");

// resize canvas
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// event listeners
let mouseX, mouseY, pmouseX, pmouseY, mouseDown = false;
if ("ontouchstart" in window) {
	alert("Tablet touches enabled");
	function ongoingTouchIndexById(idToFind) {
		for (let i = 0; i < ongoingTouches.length; i++) if (ongoingTouches[i].identifier === idToFind) return i;
		return -1;
	}
	window.addEventListener("touchstart", function (e) {
		e.preventDefault();
		let touches = e.changedTouches;
		pmouseX = mouseX;
		pmouseY = mouseY;
		mouseX = touches[0].pageX;
		mouseY = touches[0].pageY;
		mouseDown = true;
	}, false);
	window.addEventListener("touchend", function (e) {
		e.preventDefault();
		let touches = e.changedTouches;
		let idx = ongoingTouchIndexById(touches[0].identifier);
		if (idx >= 0) {
			pmouseX = mouseX;
			pmouseY = mouseY;
			mouseX = touches[0].pageX;
			mouseY = touches[0].pageY;
		}
		if (touches.length === 0) {
			mouseDown = false;
		}
	}, false);
	window.addEventListener("touchmove", function (e) {
		e.preventDefault();
		let touches = e.changedTouches;
		pmouseX = mouseX;
		pmouseY = mouseY;
		mouseX = touches[0].pageX;
		mouseY = touches[0].pageY;
	}, false);
}
window.addEventListener("mousemove", e => {
	let rect = canvas.getBoundingClientRect();
	pmouseX = mouseX;
	pmouseY = mouseY;
	mouseX = e.clientX - rect.left;
	mouseY = e.clientY - rect.top;
});
window.addEventListener("mousedown", e => {
	mouseDown = true;
});
window.addEventListener("mouseup", e => {
	mouseDown = false;
});

// Point
class Point {
	constructor(x, y) {
		this.x = x;
		this.y = y;
	}
}
// Object Classes
// Rectangle
class RectangleObject {
	constructor(x, y, width, height, colour, fill = true, thickness = 0) {
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
		this.colour = colour;
		this.fill = fill;
		this.thickness = thickness;
	}
	render() {
		ctx.beginPath();
		ctx.lineJoin = "miter";
		ctx.lineCap = "butt";
		ctx.fillStyle = this.colour;
		ctx.strokeStyle = this.colour;
		ctx.lineWidth = this.thickness;
		ctx.rect(this.x, this.y, this.width, this.height);
		if (this.fill) ctx.fill();
		if (this.thickness > 0) ctx.stroke();
		ctx.closePath();
	}
}
// Circle
class CircleObject {
	constructor(x, y, radius, colour, fill = true, thickness = 0) {
		this.x = x;
		this.y = y;
		this.radius = radius;
		this.colour = colour;
		this.fill = fill;
		this.thickness = thickness;
	}
	render() {
		ctx.beginPath();
		ctx.fillStyle = this.colour;
		ctx.strokeStyle = this.colour;
		ctx.lineWidth = this.thickness;
		ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
		if (this.fill) ctx.fill();
		if (this.thickness > 0) ctx.stroke();
		ctx.closePath();
	}
}
// Oval
class OvalObject {
	constructor(x, y, xRadius, yRadius, colour, fill = true, thickness = 0) {
		this.x = x;
		this.y = y;
		this.xRadius = xRadius;
		this.yRadius = yRadius;
		this.colour = colour;
		this.fill = fill;
		this.thickness = thickness;
	}
	render() {
		ctx.beginPath();
		ctx.fillStyle = this.colour;
		ctx.strokeStyle = this.colour;
		ctx.lineWidth = this.thickness;
		ctx.ellipse(this.x, this.y, this.xRadius, this.yRadius, 0, 0, 2 * Math.PI);
		if (this.fill) ctx.fill();
		if (this.thickness > 0) ctx.stroke();
		ctx.closePath();
	}
}
// Line
class LineObject {
	constructor(x1, y1, x2, y2, colour, thickness = 1) {
		this.x1 = x1;
		this.y1 = y1;
		this.x2 = x2;
		this.y2 = y2;
		this.colour = colour;
		this.thickness = thickness;
	}
	render() {
		ctx.beginPath();
		ctx.lineCap = "round";
		ctx.strokeStyle = this.colour;
		ctx.lineWidth = this.thickness;
		ctx.moveTo(this.x1, this.y1);
		ctx.lineTo(this.x2, this.y2);
		ctx.stroke();
		ctx.closePath();
	}
}
// Group of lines
class LineGroup {
	constructor(points = [], colour = "black", thickness = 1) {
		this.points = points;
		this.colour = colour;
		this.thickness = thickness;
	}
	render() {
		ctx.beginPath();
		ctx.lineJoin = "round";
		ctx.lineCap = "round";
		ctx.strokeStyle = this.colour;
		ctx.lineWidth = this.thickness;
		ctx.strokeStyle = this.colour;
		ctx.lineWidth = this.thickness;
		ctx.moveTo(this.points[0].x, this.points[0].y);
		this.points.forEach(x => ctx.lineTo(x.x, x.y));
		ctx.stroke();
		ctx.closePath();
	}
}
class RubberObject {
	constructor(points = [], colour = "black", thickness = 1) {
		this.points = points;
		this.colour = colour;
		this.thickness = thickness;
	}
	render() {
		if (this.points.length > 1) {
			ctx.globalCompositeOperation = "destination-out";
			ctx.beginPath();
			ctx.strokeStyle = this.colour;
			ctx.lineWidth = this.thickness;
			ctx.lineJoin = "round";
			ctx.lineCap = "round";
			ctx.strokeStyle = this.colour;
			ctx.lineWidth = this.thickness;
			ctx.moveTo(this.points[0].x, this.points[0].y);
			this.points.forEach(x => ctx.lineTo(x.x, x.y));
			ctx.stroke();
			ctx.closePath();
			ctx.globalCompositeOperation = "source-over";
		}
	}
}

let Paint = {
	objects: [],
	backup: [],
	type: "pen",
	colour: "black",
	fill: true,
	thickness: 1,
	drawing: false,
	update: function () {
		if (this.drawing) {
			if (mouseX !== pmouseX || mouseY !== pmouseY) {
				switch (this.type) {
					case "pen":
						this.objects[this.objects.length - 1].points.push(new Point(mouseX, mouseY));
						break;
					case "rectangle":
						this.objects[this.objects.length - 1].width = mouseX - this.objects[this.objects.length - 1].x;
						this.objects[this.objects.length - 1].height = mouseY - this.objects[this.objects.length - 1].y;
						break;
					case "circle":
						this.objects[this.objects.length - 1].radius = Math.sqrt(Math.pow(this.objects[this.objects.length - 1].x - mouseX, 2) + Math.pow(this.objects[this.objects.length - 1].y - mouseY, 2));
						break;
					case "oval":
						this.objects[this.objects.length - 1].xRadius = Math.abs(mouseX - this.objects[this.objects.length - 1].x);
						this.objects[this.objects.length - 1].yRadius = Math.abs(mouseY - this.objects[this.objects.length - 1].y);
						break;
					case "line":
						this.objects[this.objects.length - 1].x2 = mouseX;
						this.objects[this.objects.length - 1].y2 = mouseY;
						break;
					case "rubber":
						this.objects[this.objects.length - 1].points.push(new Point(mouseX, mouseY));
						break;
					default:
						break;
				}
				this.backup = this.objects.slice();
				if (!mouseDown) this.drawing = false;
			}
		} else if (mouseDown) {
			this.drawing = true;
			switch (this.type) {
				case "pen":
					this.objects.push(new LineGroup([new Point(mouseX, mouseY)], this.colour, this.thickness));
					break;
				case "rectangle":
					this.objects.push(new RectangleObject(mouseX, mouseY, 0, 0, this.colour, this.fill, this.thickness));
					break;
				case "circle":
					this.objects.push(new CircleObject(mouseX, mouseY, 0, this.colour, this.fill, this.thickness));
					break;
				case "oval":
					this.objects.push(new OvalObject(mouseX, mouseY, 0, 0, this.colour, this.fill, this.thickness));
					break;
				case "line":
					this.objects.push(new LineObject(mouseX, mouseY, mouseX, mouseY, this.colour, this.thickness));
					break;
				case "rubber":
					this.objects.push(new RubberObject([new Point(mouseX, mouseY)], this.colour, this.thickness));
					break;
				default:
					break;
			}
			this.backup = this.objects.slice();
		}
	},
	render: function () {
		ctx.beginPath();
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.closePath();
		this.objects.forEach(x => x.render());
	}
};

// undo function
function undo() {
	if (Paint.objects.length > 0) Paint.objects.pop();
}
// redo function
function redo() {
	if (Paint.backup.length > Paint.objects.length) Paint.objects.push(Paint.backup[Paint.objects.length]);
}

// download canvas as png
function download() {
	document.getElementById("download").href = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
}

function paint() {
	Paint.update();
	Paint.render();
	window.requestAnimationFrame(paint);
}

window.requestAnimationFrame(paint);
