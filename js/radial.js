// Usage: n = # of sides
// rad = radius from the circumcenter of a polygon.
// rotate = angle of rotation in radians, clockwise. (Starting point @ 0 radians)

// Gets a point based on a discrete arc around a center
// Point: {x, y}
function getPoint(i, n, rad, rotate, centerX, centerY) {
    var THETA = 2 * Math.PI / n;

    var point = {
        x: rad * Math.cos(THETA * i + rotate) + centerX,
        y: rad * Math.sin(THETA * i + rotate) + centerY
    };

    return point;
}

// Gets a list of points for a regular polygon
function getPoints(n, rad, rotate, centerX, centerY) {
    var THETA = 2 * Math.PI / n;

    var points = [];
    for (var i = 0; i < n; i++) {
        points.push(getPoint(i, n, rad, rotate, centerX, centerY));
    }

    return points;
}

// Draws a regular polygon onto a context.
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

// Draws spokes of a regular polygon.
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
    context.stroke();
}

// Draws text at a specific point of a regular polygon.
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

// Draws the inner radar/star plot of the graph based on a series of values.
// Values: values ranging depending on the # of steps.
// e.g. value 5 out of 6 steps generates a point on the 2nd largest step.
// or value 12 out of 6 steps generates a point twice as large as the radius.
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

// Generate the graph onto a canvas of id "chart".
function generate() {
    var canvas = document.getElementById("chart");
    var context = canvas.getContext("2d");

    var sides = $("#sidesNum").val();
    var steps = $("#stepsNum").val();

    // Clear the context.
    context.clearRect(0, 0, canvas.width, canvas.height);

    // Rotate the angle so the starting poiint is at top.
    var rotate = 3 * Math.PI / 2;
    // Assume the radius is half the canvas height - 40px to account for text.
    var rad = canvas.height / 2 - 40;

    // Get tinycolors of the input colors for future manipulation.
    var lineColor = tinycolor($("#lineColor").val());
    var radColor = tinycolor($("#radColor").val());

    // Set lines to full opacity.
    lineColor.setAlpha(1);
    // Set the plot to half opacity.
    radColor.setAlpha(0.5);
    
    // Generate the outer polygon w/ a line width of 4px.
    context.lineWidth = 4;
    // Set the line strokes to line color.
    context.strokeStyle = lineColor.toRgbString();
    drawPolygon(sides, rad, rotate, canvas, context);

    // Generate a series of inner polygons w/ a line width of 2px depending on # of steps.
    context.lineWidth = 2;
    // Lighten the inner polygon line colors by 25%.
    lineColor.lighten(25);
    context.strokeStyle = lineColor.toRgbString();
    var i;
    for (i = 1; i < steps; i++) {
        drawPolygon(sides, rad * (1 - i / steps), rotate, canvas, context);
    }
    // Draw the final spokes from center.
    drawStrokes(sides, rad, rotate, canvas, context);

    // Set the font for drawn text.
    context.font = "bold 20px Calibri";
    context.fillStyle = "black";
    context.textAlign = "center";
    // Assume all label-value pairs are hidden.
    $("#labels input").hide();
    $("#values input").hide();
    var values = [];
    for (i = 0; i < sides; i++) {
        // Re-show pairs based on # of sides.
        $("#label" + i).show();
        $("#value" + i).show();
    
        // Draw each text clockwise starting at top based on labels.
        drawText(i, sides, rad + 16, rotate, canvas, context, $("#label" + i).val());
        values.push(parseFloat($("#value" + i).val()));
    }

    // Draw a filled plot based on the gathered values.
    context.lineWidth = 1;
    context.strokeStyle = radColor.toRgbString();
    context.fillStyle = radColor.toRgbString();
    drawValues(sides, rad, rotate, canvas, context, values, steps);
}

// Wait until page has been generated.
$(document).ready(function () {
    window.MAX_SIDES = parseInt($("#sidesNum").attr('max'));

    // Disable submit form causing page refresh.
    $('form').submit(function () {
        return false;
    });

    // Set onchange event of sides input.
    $("#sidesNum").change(function () {
        // If less than 3, assume value of 0.
        if ($(this).val() < 3) $(this).val(0);
        // Else if sides are greater than the preset max sides, assume max sides.
        else if ($(this).val() > MAX_SIDES) $(this).val(MAX_SIDES);

        generate();
    });

    // Generate the label-value input pairs.
    for(var i = 0; i < MAX_SIDES; i++) {
        $("#labels ul")
            .append($("<li>").append($("<input>").attr('id', 'label' + i)));
        $("#values ul")
            .append($("<li>")
                .append($("<input>")
                    .attr('type', 'number')
                    .attr('min', '0')
                    .attr('max', '20')
                    .attr('id', 'value' + i)
                    .attr('step', 'any')
                    .val(0)
                )
            );
    }

    for(var i = 0; i < MAX_SIDES; i++) {
        // Set the labels to generate onchange.
        $("#labels input").change(function() {
            generate();
        });

        // Set the values to generate onchange.
        $("#values input").change(function() {
            // Parse by float as to either implicitly strip text or return NaN.
            $(this).val(parseFloat($(this).val()));
            // If NaN (e.g. "text" or "t9") or less than 0, assume 0.
            if(isNaN($(this).val()) || $(this).val() < 0) {
                $(this).val(0);
            }
            // Else if value is greater than steps, assume steps.
            else if($(this).val() > parseInt($("#stepsNum").val())) {
                $(this).val($("#stepsNum").val());
            }

            generate();
        });
    }
    // Assume all input values to be hidden on start.
    $("#labels input").hide();
    $("#values input").hide();

    // Set steps to generate onchange.
    $("#stepsNum").change(function () {
        generate();
    });

    // Set line color to generate onchange.
    $("#lineColor").change(function() {
        generate();
    });

    // Set the radar color to generate onchange.
    $("#radColor").change(function() {
        generate();
    });
});