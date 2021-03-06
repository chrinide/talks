var width = 960,
height = 500;

var projection_ortho = d3.geo.orthographic()
    .scale(248)
    .clipAngle(90);

var projection_eqrect = d3.geo.equirectangular()
    .scale(153)
    .translate([width / 2, height / 2])
    .precision(.1);

var projection = d3.geo.mercator();
    // .scale(248) 
    // .clipAngle(90);

var canvas = d3.select("body").append("canvas")
    .attr("width", width)
    .attr("height", height);

var c = canvas.node().getContext("2d");

var path = d3.geo.path()
    .projection(projection)
    .context(c);

var title = d3.select("h1");

// queue()
//     .defer(d3.json, "data/world-110m.json")
//     .defer(d3.tsv, "data/world-country-names.tsv")
//     .await(ready);

function ready(error, world, names) {
    var globe = {type: "Sphere"},
    land = topojson.feature(world, world.objects.land),
    countries = topojson.feature(world, world.objects.countries).features,
    borders = topojson.mesh(world, world.objects.countries, function(a, b) { return a !== b; }),
    i = -1,
    n = countries.length;

    countries = countries.filter(function(d) {
        return names.some(function(n) {
            if (d.id == n.id) return d.name = n.name;
        });
    }).sort(function(a, b) {
        return a.name.localeCompare(b.name);
    });


    function transition() {
        d3.transition()
            .duration(1250)
            .each("start", function() {
                title.text(countries[i = (i + 1) % n].name);
            })
                .tween("rotate", function() {
                    var p = d3.geo.centroid(countries[i]),
                    r = d3.interpolate(projection.rotate(), [-p[0], -p[1]]);
                    return function(t) {
                        projection.rotate(r(t));
                        c.clearRect(0, 0, width, height);
                        c.fillStyle = "#bbb", c.beginPath(), path(land), c.fill();
                        c.fillStyle = "#f00", c.beginPath(), path(countries[i]), c.fill();
                        c.strokeStyle = "#fff", c.lineWidth = .5, c.beginPath(), path(borders), c.stroke();
                        c.strokeStyle = "#000", c.lineWidth = 2, c.beginPath(), path(globe), c.stroke();
                    };
                })
            .transition()
            .each("end", transition);
    };

    var drawMap = function(){
        c.clearRect(0, 0, width, height);
        c.fillStyle = "#bbb", c.beginPath(), path(land), c.fill();
        c.fillStyle = "#f00", c.beginPath(), path(countries[i]), c.fill();
        c.strokeStyle = "#fff", c.lineWidth = .5, c.beginPath(), path(borders), c.stroke();
        c.strokeStyle = "#000", c.lineWidth = 2, c.beginPath(), path(globe), c.stroke();
    };

    drawMap();
}

function draw(ht) {
    $("#mapContainer").html("<svg id='map' xmlns='http://www.w3.org/2000/svg' width='100%' height='" + ht + "'></svg>");
    map = d3.select("svg");
    var width = $("svg").parent().width();
    var height = ht;

    // I discovered that the unscaled equirectangular map is 640x360. Thus, we
    // should scale our map accordingly. Depending on the width ratio of the new
    // container, the scale will be this ratio * 100. You could also use the height 
    // instead. The aspect ratio of an equirectangular map is 2:1, so that's why
    // our height is half of our width.

    projection = d3.geo.equirectangular().scale((width/640)*100).translate([width/2, height/2]);
    var path = d3.geo.path().projection(projection);
    d3.json('data/world-110m.json', function(collection) {
        map.selectAll('path').data(collection.features).enter()
            .append('path')
            .attr('d', path)
            .attr("width", width)
            .attr("height", width/2);
    });
}

draw($("#mapContainer").width()/2);
