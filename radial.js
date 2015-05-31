function getPoint(i, n, rad, rotate, centerX, centerY) {
    var THETA = 2 * Math.PI / n;

    var point = {
        x: rad * Math.cos(THETA * i + rotate) + centerX,
        y: rad * Math.sin(THETA * i + rotate) + centerY
    };

    return point;
}

function getPoints(n, rad, rotate, centerX, centerY) {
    var THETA = 2 * Math.PI / n;

    var points = [];
    for (var i = 0; i < n; i++) {
        points.push(getPoint(i, n, rad, rotate, centerX, centerY));
    }

    return points;
}

function drawPolygon(n, rad, rotate, canvas, context) {
    var points = getPoints(n, rad, rotate, canvas.width / 2, canvas.height / 2);

    context.beginPath();
    context.moveTo(points[0].x, points[0].y);
    for (var i = 1; i < n; i++) {
        context.lineTo(points[i].x, points[i].y);
    }
    context.closePath();
    context.stroke();

    context.fillStyle = "rgb(240,240,240)";
    context.fill();
}

function drawStrokes(n, rad, rotate, canvas, context) {
    var center = {
        x: canvas.width / 2,
        y: canvas.height / 2
    };

    var points = getPoints(n, rad, rotate, canvas.width / 2, canvas.height / 2);

    context.beginPath();
    for (var i = 0; i < n; i++) {
        context.moveTo(center.x, center.y);
        context.lineTo(points[i].x, points[i].y);
    }
    context.stroke();}

function drawText(i, n, rad, rotate, canvas, context, text) {
    var point = getPoint(i, n, rad, rotate, canvas.width / 2, canvas.height / 2);

    var x = Math.round(canvas.width / 2 - point.x);
    if(x < 0) {
        context.textAlign = "left";
    }
    else if(x > 0) {
        context.textAlign = "right";
    }
    else {
        context.textAlign = "center";
    }

    context.fillText(text, point.x, point.y);
}

function drawValues(n, rad, rotate, canvas, context, values, steps) {
    var points = [];
    for(var i = 0; i < n; i++) {
        points.push(getPoint(i, n, rad * values[i] / steps, rotate, canvas.width / 2, canvas.height / 2));
        
    }

    context.beginPath();
    context.moveTo(points[0].x, points[0].y);
    for (var i = 1; i < n; i++) {
        context.lineTo(points[i].x, points[i].y);
    }
    context.closePath();
    context.stroke();
    context.fill();
}

function generate() {
    var canvas = document.getElementById("myCanvas");
    var context = canvas.getContext("2d");

    var sides = $("#sidesNum").val();
    var steps = $("#stepsNum").val();

    context.clearRect(0, 0, canvas.width, canvas.height);

    var rotate = 3 * Math.PI / 2;
    var rad = canvas.height / 2 - 40;

    var lineColor = tinycolor($("#lineColor").val());
    var radColor = tinycolor($("#radColor").val());

    lineColor.setAlpha(1);
    radColor.setAlpha(0.5);
    
    context.lineWidth = 4;
    context.strokeStyle = lineColor.toRgbString();
    drawPolygon(sides, rad, rotate, canvas, context);

    context.lineWidth = 2;
    lineColor.lighten(25);
    context.strokeStyle = lineColor.toRgbString();
    var i;
    for (i = 1; i < steps; i++) {
        drawPolygon(sides, rad * (1 - i / steps), rotate, canvas, context);
    }
    drawStrokes(sides, rad, rotate, canvas, context);

    context.font = "bold 20px Calibri";
    context.fillStyle = "black";
    context.textAlign = "center";
    $("#labels input").hide();
    $("#values input").hide();
    var values = [];
    for (i = 0; i < sides; i++) {
        $("#label" + i).show();
        $("#value" + i).show();
    
        drawText(i, sides, rad + 16, rotate, canvas, context, $("#label" + i).val());
        values.push(parseFloat($("#value" + i).val()));
    }
    context.lineWidth = 1;

    context.strokeStyle = radColor.toRgbString();
    context.fillStyle = radColor.toRgbString();
    drawValues(sides, rad, rotate, canvas, context, values, steps);
}

$(document).ready(function () {
    window.MAX_SIDES = parseInt($("#sidesNum").attr('max'));

    $('form').submit(function () {
        return false;
    });

    $("#sidesNum").change(function () {
        if ($(this).val() < 3) $(this).val(0);
        else if ($(this).val() > MAX_SIDES) $(this).val(MAX_SIDES);

        generate();
    });

    for(var i = 0; i < MAX_SIDES; i++) {
        $("#labels ul")
            .append($("<li>").append($("<input>").attr('id', 'label' + i)));
        $("#values ul")
            .append($("<li>").append($("<input>").attr('id', 'value' + i).val(0)));
    }

    for(var i = 0; i < MAX_SIDES; i++) {
        $("#labels input").change(function() {
            generate();
        });

        $("#values input").change(function() {
            $(this).val(parseFloat($(this).val()));
            if(isNaN($(this).val()) || $(this).val() < 0) {
                $(this).val(0);
            }
            else if($(this).val() > parseInt($("#stepsNum").val())) {
                $(this).val($("#stepsNum").val());
            }

            generate();
        });
    }
    $("#labels input").hide();
    $("#values input").hide();

    $("#stepsNum").change(function () {
        generate();
    });

    $("#lineColor").change(function() {
        generate();
    });

    $("#radColor").change(function() {
        generate();
    });
});