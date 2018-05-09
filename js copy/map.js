var mapData = {mapSVG: null, plantationData: null, plantationSelection: null, projection: null};
var mapSourcePlantation = "";
var mapDestinationPlantation = "";
function mapMain() {
    var mapSVG;
    var plantationData;
    var plantationSelection = null;

    var width = d3.select("#history")._groups[0][0].clientWidth * 0.50;
    var height = d3.select("#history")._groups[0][0].clientHeight / 3;

    // var width = height = 500;

    // D3 Projection
    var projection = d3.geoAlbersUsa()
        .translate([width * .05, height/3.5])    // translate to center of screen
        .scale([1800]);          // scale things down so see entire US
    mapData.projection = projection;

    // Define path generator
    var path = d3.geoPath()         // path generator that will convert GeoJSON to SVG paths
        .projection(projection);  // tell path generator to use albersUsa projection

    // Load GeoJSON data and merge with states data
    d3.json("data/us-se-map.json", function(mapData) {
        //Width and height of map
        var width = d3.select("#history")._groups[0][0].clientWidth;
        var height = d3.select("#history")._groups[0][0].clientHeight;

        // Bind the data to the SVG and create one path per GeoJSON feature
        var svg = d3.select("#map")
            .append("svg")
            .attr("width", width)
            .attr("height", height)
            .attr("class", "map");

        svg.selectAll("path")
            .data(mapData.features)
            .enter()
            .append("path")
            .attr("d", path)
            .attr("id", function(d) {
                return d.properties.name.replace(/\s/g, '').toLowerCase()
            })
            .attr("class", "state")
            .style("stroke", "#fff")
            .style("stroke-width", "1")
            .style("fill", "#b6babd");

        // svg.selectAll("circle")
        // 	.data(plantationData)
        // 	.enter()
        // 	.append("circle")
        // 	.attr("cx", function(d) {
        // 		return projection([d.lon, d.lat])[0];
        // 	})
        // 	.attr("cy", function(d) {
        // 		return projection([d.lon, d.lat])[1];
        // 	})`
        // });
    });

    d3.json("data/plantation-location.json", function(data) {
        plantationData = data;
        plantationData = plantationData.map(function(d) { d.originalName = d.name; d.name = cleanName(d.name); return d});
        mapSVG = d3.select(".map");

        plantationSelection = d3.select(".map")
            .selectAll('g')
            .data(plantationData)
            .enter()
            .append("g")
            .attr("class", function(d) {
                return "not_plantation";
            })
            // .attr("display", "none")
            .attr("id", function(d) {
                return d.name.replace(/[\s\.\']/g, '').toLowerCase()
            });

        var x = -20,
            y = -20;

        var colors = ["#41b6c4","#2c7fb8","#253494","#7fcdbb","#ffffcc","#c7e9b4"];

        plantationSelection
            .append("text")
            .text(function(d) {
                return d.originalName;
            })
            .attr("class", "location")
            .attr("text-anchor", "middle")
            .attr("x", function(d, i) {
                if (i % 2 == 0) {
                    return projection([d.lon, d.lat])[0] + 50;
                }
                return projection([d.lon, d.lat])[0] - 50;
            })
            .attr("y", function(d, i) {
                if (i <= 2) {
                    return projection([d.lon, d.lat])[1] - 30;
                }
                return projection([d.lon, d.lat])[1] + 30;
            })

        var imgWidth = 20,
            imgHeight = 24;
        plantationSelection
            .append("circle")
            .attr("class", "location")
            .attr("cx", function(d) {
                return projection([d.lon, d.lat])[0]
            })
            .attr("cy", function(d) {
                return projection([d.lon, d.lat])[1];
            })
            .attr("r", function(d) {
                return d.count * 0.08;
            })
            .attr("fill", function(d, i) {
                return colors[i % colors.length];
            })


            // plantationSelection
            .append("svg:image")
            .attr("class", function(d) {
                if (d.name !== "GeorgetownUniversity") {
                    return "plantation";
                }
            })
            .attr("x", function(d) {
                return projection([d.lon, d.lat])[0] - imgWidth / 2.3;
            })
            .attr("y", function(d) {
                return projection([d.lon, d.lat])[1] - imgHeight;
            })
            .attr('width', imgWidth)
            .attr('height', imgHeight)
            .attr("xlink:href", "images/pin.svg");
        // .attr("display", "none")

        mapData.mapSVG = mapSVG;
        mapData.plantationData = plantationData;
        mapData.plantationSelection = plantationSelection;
    });

}
mapMain();
var updateMap = function() {

    var mapSVG = mapData.mapSVG;
    var plantationData = mapData.plantationData;
    var plantationSelection = mapData.plantationSelection;
    var projection = mapData.projection;

    mapSVG.selectAll("#migrationPath").remove();

    if (mapDestinationPlantation !== "") {
        var destination = plantationData.find(function (d) {
            if (mapDestinationPlantation === "HenryJohnson") {
                mapDestinationPlantation = "ChathamPlantation";
            }
            else if (mapDestinationPlantation === "JesseBatey") {
                mapDestinationPlantation = "WestOakPlantation";
            }
            if (d.name === mapDestinationPlantation) {
                return d;
            }
        });
        var source = plantationData.find(function (d) {
            if (d.name === mapSourcePlantation) {
                return d;
            }
        });
        var destinationIndex = plantationData.indexOf(destination);
        var sourceIndex = plantationData.indexOf(source);

        plantationSelection.attr("class", function(d) {
            if (d.name !== "GeorgetownUniversity" && d.name === mapDestinationPlantation || d.name === mapSourcePlantation) {
                return "plantation";
            }
            else {
                return "not_plantation";
            }
        });

        mapSVG.append("path").attr("id", "migrationPath").attr("d", function(d) {
            var target = {x: projection([plantationData[destinationIndex].lon, plantationData[destinationIndex].lat])[0], y: projection([plantationData[destinationIndex].lon, plantationData[destinationIndex].lat])[1]};
            var source = {x: projection([plantationData[sourceIndex].lon, plantationData[sourceIndex].lat])[0], y: projection([plantationData[sourceIndex].lon, plantationData[sourceIndex].lat])[1]};

            var dx = target.x - source.x,
                dy = target.y - source.y,
                dr = Math.sqrt(dx * dx + dy * dy);
            return "M" + source.x + "," + source.y + "A" + dr + "," + dr +
                " 0 0,1 " + target.x + "," + target.y;
        }).attr("class", "migrationPath");
    }
};