// get canvas context
const ctx = document
	.getElementById("canvas")
	.getContext("2d");

// resize canvas
ctx.canvas.width = window.innerWidth;
ctx.canvas.height = window.innerHeight;

// mouse input object
const mouse = Object.seal({
	x: null,
	y: null,
	down: false,
	prev: Object.seal({
		x: null,
		y: null,
		down: false
	}),
	updatePrev: function () {
		this.prev.x = this.x;
		this.prev.y = this.y;
		this.prev.down = this.down;
	}
});

// event listeners
if ("ontouchstart" in window) {
	window.alert("Tablet touches enabled");

	function ongoingTouchIndexById(idToFind) {
		for (let i = 0; i < ongoingTouches.length; i++)
			if (ongoingTouches[i].identifier === idToFind)
				return i;
		return -1;
	}

	window.addEventListener("touchstart", (e) => {
		e.preventDefault();

		const touches = e.changedTouches;

		mouse.updatePrev();

		mouse.x = touches[0].pageX;
		mouse.y = touches[0].pageY;
		mouse.down = true;
	}, false);

	window.addEventListener("touchend", (e) => {
		e.preventDefault();

		const touches = e.changedTouches;

		const idx = ongoingTouchIndexById(touches[0].identifier);
		if (idx >= 0) {
			mouse.updatePrev();
			mouse.x = touches[0].pageX;
			mouse.y = touches[0].pageY;
		}

		if (touches.length === 0) {
			mouse.down = false;
		}
	}, false);

	window.addEventListener("touchmove", (e) => {
		e.preventDefault();

		const touches = e.changedTouches;

		mouse.updatePrev();

		mouse.x = touches[0].pageX;
		mouse.y = touches[0].pageY;
	}, false);
}
window.addEventListener("resize", () => {
	ctx.canvas.width = window.innerWidth;
	ctx.canvas.height = window.innerHeight;
});
window.addEventListener("mousemove", (e) => {
	const rect = ctx.canvas.getBoundingClientRect();

	mouse.updatePrev();

	mouse.x = e.clientX - rect.left;
	mouse.y = e.clientY - rect.top;
});
ctx.canvas.addEventListener("mousedown", (e) => {
	mouse.down = true;
});
ctx.canvas.addEventListener("mouseup", (e) => {
	mouse.down = false;
});

// Point
class Point {
	constructor(x, y) {
		this.x = x;
		this.y = y;
	}
	clone() {
		return new Point(this.x, this.y);
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
	clone() {
		return new RectangleObject(this.x, this.y, this.width, this.height, this.colour, this.fill, this.thickness);
	}
	render() {
		ctx.beginPath();

		ctx.lineJoin = "miter";
		ctx.lineCap = "butt";
		ctx.fillStyle = this.colour;
		ctx.strokeStyle = this.colour;
		ctx.lineWidth = this.thickness;

		ctx.rect(this.x, this.y, this.width, this.height);

		if (this.fill)
			ctx.fill();
		if (this.thickness > 0)
			ctx.stroke();

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
	clone() {
		return new CircleObject(this.x, this.y, this.radius, this.colour, this.fill, this.thickness);
	}
	render() {
		ctx.beginPath();

		ctx.fillStyle = this.colour;
		ctx.strokeStyle = this.colour;
		ctx.lineWidth = this.thickness;

		ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);

		if (this.fill)
			ctx.fill();
		if (this.thickness > 0)
			ctx.stroke();

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
	clone() {
		return new OvalObject(this.x, this.y, this.xRadius, this.yRadius, this.colour, this.fill, this.thickness);
	}
	render() {
		ctx.beginPath();

		ctx.fillStyle = this.colour;
		ctx.strokeStyle = this.colour;
		ctx.lineWidth = this.thickness;

		ctx.ellipse(this.x, this.y, this.xRadius, this.yRadius, 0, 0, 2 * Math.PI);

		if (this.fill)
			ctx.fill();
		if (this.thickness > 0)
			ctx.stroke();

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
	clone() {
		return new LineObject(this.x1, this.y1, this.x2, this.y2, this.colour, this.thickness);
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

const Paint = Object.seal({
	colours: Object.freeze(["red", "orange", "yellow", "lightblue", "blue", "green", "lightgreen", "gray", "black"]),
	objects: [],
	backup: [],
	type: "pen",
	colour: "black",
	fill: true,
	thickness: 1,
	drawing: false,
	init: function() {
		for (const colour of this.colours) {
			document.querySelector(".colour." + colour)
				.addEventListener("click", () => Paint.colour = colour);
		}

		document.getElementById("pen-thickness")
			.addEventListener("input", (e) => Paint.thickness = e.target.value);

		document.getElementById("colour-picker")
			.addEventListener("input", (e) => Paint.colour = e.target.value);

		document.getElementById("draw-type")
			.addEventListener("change", (e) => Paint.type = e.target.value);

		// undo function
		document.getElementById("undo")
			.addEventListener("click", function undo() {
				if (Paint.objects.length > 0)
					Paint.objects.pop();
			});
		// redo function
		document.getElementById("redo")
			.addEventListener("click", function redo() {
				if (Paint.backup.length > Paint.objects.length)
					Paint.objects.push(Paint.backup[Paint.objects.length]);
			});

		// download canvas as png
		document.getElementById("saveas")
			.addEventListener("click", (function() {
				const download = document.getElementById("download");
				return function download() {
					download.href = ctx.canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
				};
			})());

		function paint() {
			Paint.update();
			Paint.render();
			window.requestAnimationFrame(paint);
		}

		paint();
	},
	update: function () {
		if (this.drawing) {
			if (mouse.x !== mouse.prev.x || mouse.y !== mouse.prev.y) {
				switch (this.type) {
					case "pen":
						this.objects[this.objects.length - 1].points.push(new Point(mouse.x, mouse.y));
						break;
					case "rectangle":
						this.objects[this.objects.length - 1].width = mouse.x - this.objects[this.objects.length - 1].x;
						this.objects[this.objects.length - 1].height = mouse.y - this.objects[this.objects.length - 1].y;
						break;
					case "circle":
						this.objects[this.objects.length - 1].radius = Math.sqrt(Math.pow(this.objects[this.objects.length - 1].x - mouse.x, 2) + Math.pow(this.objects[this.objects.length - 1].y - mouse.y, 2));
						break;
					case "oval":
						this.objects[this.objects.length - 1].xRadius = Math.abs(mouse.x - this.objects[this.objects.length - 1].x);
						this.objects[this.objects.length - 1].yRadius = Math.abs(mouse.y - this.objects[this.objects.length - 1].y);
						break;
					case "line":
						this.objects[this.objects.length - 1].x2 = mouse.x;
						this.objects[this.objects.length - 1].y2 = mouse.y;
						break;
					case "rubber":
						this.objects[this.objects.length - 1].points.push(new Point(mouse.x, mouse.y));
						break;
					default:
						break;
				}
				this.backup = this.objects.slice();
				if (!mouse.down)
					this.drawing = false;
			}
		} else if (mouse.down) {
			this.drawing = true;
			switch (this.type) {
				case "pen":
					this.objects.push(new LineGroup([new Point(mouse.x, mouse.y)], this.colour, this.thickness));
					break;
				case "rectangle":
					this.objects.push(new RectangleObject(mouse.x, mouse.y, 0, 0, this.colour, this.fill, this.thickness));
					break;
				case "circle":
					this.objects.push(new CircleObject(mouse.x, mouse.y, 0, this.colour, this.fill, this.thickness));
					break;
				case "oval":
					this.objects.push(new OvalObject(mouse.x, mouse.y, 0, 0, this.colour, this.fill, this.thickness));
					break;
				case "line":
					this.objects.push(new LineObject(mouse.x, mouse.y, mouse.x, mouse.y, this.colour, this.thickness));
					break;
				case "rubber":
					this.objects.push(new RubberObject([new Point(mouse.x, mouse.y)], this.colour, this.thickness));
					break;
				default:
					break;
			}
			this.backup = this.objects.slice();
		}
	},
	render: function () {
		ctx.beginPath();
		ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
		ctx.closePath();
		this.objects.forEach((x) => x.render());
	}
});


Paint.init();
