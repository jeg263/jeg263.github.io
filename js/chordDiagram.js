var chord = {originalData: null, showOtherData: true, multiplier: 0.9};

function chordDiagramMain() {
    //view variables
    var div;

    //data variables
    var allData; //fully processed data to build visualization on
    var csvData; //csv converted to json - is processed at times
    var originalData; //csv of data
    var splines = [];
    // var familyData; //family hierarchy of data

    //variables for fisheye distortion
    var fisheye;
    var fisheyeNegative;

    //size variables and updater based on multiplier
    var wReal = 1332,
        hReal = 1260,
        w = wReal * chord.multiplier,
        h = hReal * chord.multiplier,
        rx = w / 2,
        ry = h / 2,
        m0,
        rotate = 0;
    pi = Math.PI;
    var boundingSize = (ry - 157) * 2 + 200;
    function updateVariables() {
        w = wReal * chord.multiplier;
        h = hReal * chord.multiplier;
        rx = w / 2;
        ry = h / 2;
        boundingSize = (ry - 157) * 2 + 200;
    }

    //launch visualization
    $(document).ready(function() {
        //create fisheye distortion variables
        var fisheyeRadius = 50;
        var fisheyeDistortionFactor = 2;
        fisheye = d3v2.fisheye.circular()
            .radius(fisheyeRadius)
            .distortion(fisheyeDistortionFactor);
        fisheyeNegative = d3v2.fisheye.circular()
            .radius(fisheyeRadius)
            .distortion(fisheyeDistortionFactor);

        //load data
        $.ajax({
            type: "GET",
            url: "./data/data.csv",
            dataType: "text",
            success: function(data) {
                //load family data
                //Set original data
                originalData = data;
                chord.originalData = data;
                // setFilterControlVariables();
                // familyData = family.processFamilyData(json);
                resetCSVData();
                refreshVisualization(null, true);
                controller.onDataLoad();
                // d3v2.select("#mapContainer").classed("hidden", true);
                // d3v2.select("#mapContainer").classed("opacity0", true);
            }
        });
    });
    chord.refreshVisualization = function(filter, resetData) { refreshVisualization(filter, resetData); }
    function refreshVisualization(filter, resetData) {
        resetData = (typeof resetData !== 'undefined') ?  resetData : false;

        if (div) //doesn't run the first time the visualization is created
            div.selectAll("*").remove();
        var dataForVisualization;

        if (!chord.showOtherData)
            csvData = csvData.filter(function (p) { return p.buyer_name !== "" });

        if (filter) {
            var rawData = csvData.filter(filter);
            var filterData = processData(rawData);
            dataForVisualization = runFilter(allData, filterData);
        }
        else if (resetData) {
            dataForVisualization = getAllDataCopy();
        }
        else { dataForVisualization = allData }
        updateVariables();
        allData = dataForVisualization;
        constructVisualization(allData);

        if (chord.showOtherData) {
            if (chord.multiplier < 0.8) {
                div.select("#svgTop").classed("very-small", false).classed("super-small", false).classed("super-super-small", true);
            }
            else if (chord.multiplier < 0.9) {
                div.select("#svgTop").classed("very-small", false).classed("super-small", true).classed("super-super-small", false);
            }
            else {
                div.select("#svgTop").classed("very-small", true).classed("super-small", false).classed("super-super-small", false);
            }
        }
        else {
            if (chord.multiplier < 0.8) {
                div.select("#svgTop").classed("small", false).classed("very-small", true);
            }
            else if (chord.multiplier < 0.9) {
                div.select("#svgTop").classed("small", true).classed("very-small", false);
            }
            else {
                div.select("#svgTop").classed("small", false).classed("very-small", false);
            }
        }
    }
    function processData(rawData) {
        var json = rawData.map(function (obj) {
            obj = cleanDataLine(obj);
            obj.id = cleanName(obj.full_name) + obj.id;
            if (obj.origin && obj.id && obj.destination)
                return {"name": "root." + obj.origin + "." + obj.id, "visible": true, "imports": ["root." + obj.destination + "." + obj.id], "data": obj}
            else if (obj.origin && obj.id)
                return {"name": "root." + obj.origin + "." + obj.id, "visible": true, "imports": ["root.KOther." + obj.id], "data": obj}
            else
                return null;
        });

        json = json.filter(function (obj) { return obj !== null });

        for (var i in rawData) {
            var obj = cleanDataLine(rawData[i]);

            if (obj.origin && obj.id && obj.destination)
                json.push({"name": "root." + obj.destination + "." + obj.id, "visible": true, "imports": [], "data": obj});
            else if (obj.origin && obj.id)
                json.push({"name": "root.KOther." + obj.id, "visible": true, "imports": [], "data": obj});
        }
        resetCSVData();

        return json;
    }
    function constructVisualization(classes) {
        //Create container for svg
        var cluster = d3v2.layout.cluster()
            .size([360, ry - 180])
            .sort(function(a, b) { return d3v2.ascending(a.key, b.key); });
        var bundle = d3v2.layout.bundle();
        var line = d3v2.svg.line.radial()
            .interpolate("bundle")
            .tension(.85)
            .radius(function(d) { return d.y; })
            .angle(function(d) { return d.x / 180 * Math.PI; });

        div = d3v2.select("#bundle")
            .style("text-align", "center");
        var svg = div.append("svg:svg")
            .attr("id", "svgTop")
            .attr("width", boundingSize)
            .attr("height", boundingSize)
            .append("svg:g")
            .attr("class", "topG")
            .attr("transform", "translate(" + boundingSize / 2 + "," + boundingSize / 2 + ")");
        svg.append("svg:path")
            .attr("class", "arc")
            .attr("d", d3v2.svg.arc().outerRadius(ry - 180).innerRadius(0).startAngle(0).endAngle(2 * Math.PI))
            .on("mousedown", mousedown);
        var nodes = cluster.nodes(packages.root(classes)),
            links = packages.imports(nodes),
            splines = bundle(links);

        //image variables
        var path;
        var groupData;
        var textNodes;

        createPathLinks();
        groupByPlantation();
        createTextNodes();
        div.on("mousemove", function() {
            animateWith(this)
        });

        function createPathLinks() {
            path = svg.selectAll("path.link")
                .data(links)
                .enter().append("svg:path")
                .attr("class", function(d) {
                    var destinationLocation = d.source.imports[0].substr(5);
                    destinationLocation = destinationLocation.substr(0, destinationLocation.indexOf('.'));
                    return "link source-" + d.source.key + " target-" + d.target.key + " parent-" + destinationLocation })
                .classed("hidden-node", function (d) {
                    if (d.source.visible)
                        return false;
                    else
                        return true;
                })
                .attr("d", function(d, i) { return line(splines[i]); });
            groupData = svg.selectAll("g.group")
                .data(nodes.filter(function(d) { return (
                    d.key ==='HenryJohnson' || d.key ==='JesseBatey' || d.key === 'WhiteMarsh' || d.key === 'StThomassManor' || d.key === 'Newtown' || d.key === 'StInigoes' || d.key === 'KOther')
                    && d.children; }))
                .enter().append("group")
                .attr("class", "group")
                .attr("class", function (d) {
                    return "group-" + d.key
                });
        }
        function groupByPlantation() {
            var groupArc = d3v2.svg.arc()
                .innerRadius(ry - 177)
                .outerRadius(ry - 157)
                .startAngle(function(d) { return (findStartAngle(d.__data__.children)-0.5) * pi / 180;})
                .endAngle(function(d) { return (findEndAngle(d.__data__.children)+0.5) * pi / 180});

            var counter = 0;
            var counterTwo = 0;

            svg.selectAll("g.arc")
                .data(groupData[0])
                .enter().append("svg:path")
                .attr("d", groupArc)
                .attr("class", "groupArc")
                .attr("class", function (d) {
                    counter += 1;
                    if (chord.showOtherData && counter > 7)
                        return "arcs group-filler";
                    else if (!chord.showOtherData && counter > 6)
                        return "arcs group-filler";
                    else
                        return "arcs " + d.className.baseVal;
                })
                .attr("id", function () {
                    counterTwo += 1;
                    return "arc-" + counterTwo;
                })
                .append("svg:text").text(function(d) {
                return d.className.baseVal; });

            //Add group titles
            counter = 0;
            svg.selectAll('g.arc').data(groupData[0]).enter().append("text")
                .attr("class", function () {
                    counter += 1;
                    if (chord.showOtherData && counter > 7) {
                        return "none";
                    }
                    else if (!chord.showOtherData && counter > 6) {
                        return "none";
                    }
                    else {
                        return "arc-label"
                    }
                })
                .attr("x", 15)   //Move the text from the start angle of the arc
                .attr("dy", 16) //Move the text down
                .append("textPath")
                .attr("xlink:href",function(d,i){
                    i += 1;
                    return "#arc-" + i;})
                .text(function(d){
                    counter += 1;
                    var title = d.className.baseVal;
                    title = title.substr(title.indexOf("-") + 1);
                    title = getLocationTitleFor(title);
                    return title});
        }
        function createTextNodes() {
            textNodes = svg.selectAll("g.node")
                .data(nodes.filter(function(n) { return !n.children; }))
                .enter().append("svg:text")
                .attr("class", "node")
                .classed("hidden-node", function (d) {
                    if (d.visible)
                        return false;
                    else
                        return true;
                })
                .attr("id", function(d) {
                    var finalWord = "source";
                    if (d.imports.length > 0)
                        finalWord = "target";
                    return "node-" + d.key + "-" + finalWord; })
                .attr("transform", function(d) {
                    if ((d.x - 90) > 89) {
                        return "rotate(" + ((d.x - 90) - 180) + ")translate(" + -1 * (d.y + 25) + ", 2)";
                    }
                    else
                        return "rotate(" + (d.x - 90) + ")translate(" + (d.y + 25) + ")";
                })
                .classed("right-half", function(d) { return (d.x - 90) > 89})
                .text(function(d) {
                    if (d.data !== null) {
                        return d.data.full_name.substr(d.data.full_name.indexOf(" ") + 1); }
                    else
                        return d.key.replace(/_/g, ' ')
                })
                .attr("font-size", function (d) {
                    return getFontSizeForTextWith(d);
                })
                .on("click", click)
                .on("mouseover", mouseover)
                .on("mouseout", mouseout);
        }
        function animateWith(obj) {
            var angleDeg;
            focusFishEyes();
            animateGroupHeaders();
            animateLinkLines();
            animateTextNodes();

            function focusFishEyes() {
                //mouse position
                var mouseX = d3v2.mouse(obj)[0];
                var mouseY = d3v2.mouse(obj)[1];
                var radius = ry - 180;

                //center point of svg
                var centerX = 0;
                var centerY = 0;

                //re calculate mouse position in div to be position in svg
                var divWidth = $(obj).width();
                if (mouseX > divWidth / 2) {
                    mouseX = mouseX - divWidth / 2;
                }
                else {
                    mouseX = -1 * (divWidth / 2 - mouseX);
                }
                var divHeight = $(obj).height();
                if (mouseY > divHeight / 2) {
                    mouseY = mouseY - divHeight / 2;
                }
                else {
                    mouseY = -1 * (divHeight / 2 - mouseY);
                }

                //calculate mouse position in svg to be angle around center and distance from center
                var diffX = mouseX - centerX;
                var diffY = mouseY - centerY;
                var angle = Math.atan2(diffY, diffX);

                angleDeg = toDegrees(angle); //+ 90;
                if (angleDeg < 0)
                    angleDeg = 180 + 180 - (-1 * angleDeg);

                angleDeg += 90;
                if (angleDeg > 360)
                    angleDeg -= 360;



                var fisheyeY = Math.sqrt(Math.pow(diffX, 2) + Math.pow(diffY, 2)) - 21;

                if (fisheyeY > (radius + 120)) {
                    fisheyeY = 0;
                }
                else if (fisheyeY > (radius - 7)) {
                    fisheyeY = radius
                }
                else {
                    fisheyeY = 0;
                }

                //calculate negAngleDeg if near the top of circle (0 deg or around 360 deg)
                var negAngleDeg = angleDeg;
                if (negAngleDeg > 270)
                    negAngleDeg = -1 * (360 - angleDeg);
                else if (negAngleDeg < 90) {
                    negAngleDeg = 360 + negAngleDeg;
                }

                //focus distortion around mouse position
                fisheyeNegative.focus([negAngleDeg, fisheyeY]);
                fisheye.focus([angleDeg, fisheyeY]);
            }
            function animateGroupHeaders() {
                function findFisheyeStartAngle(children) {
                    children.forEach(function (d) {
                        if (d.x < 90 && angleDeg > 270)
                            d.fisheye = fisheyeNegative(d);
                        else if (d.x > 270 && angleDeg < 90)
                            d.fisheye = fisheyeNegative(d);
                        else
                            d.fisheye = fisheye(d)
                    });

                    var min = children[0].fisheye.x;
                    children.forEach(function(d) {
                        if (d.fisheye.x < min)
                            min = d.fisheye.x;
                    });
                    return min;
                }
                function findFisheyeEndAngle(children) {
                    var max = children[0].fisheye.x;
                    children.forEach(function(d) {
                        if (d.fisheye.x > max)
                            max = d.fisheye.x;
                    });
                    return max;
                }

                var newGroupArc = d3v2.svg.arc()
                    .innerRadius(ry - 177)
                    .outerRadius(ry - 157)
                    .startAngle(function(d) { return (findFisheyeStartAngle(d.__data__.children)-0.5) * pi / 180;})
                    .endAngle(function(d) { return (findFisheyeEndAngle(d.__data__.children)+0.5) * pi / 180});

                svg.selectAll("path.arcs").each(function (d) {}).attr("d", newGroupArc);
            }
            function animateLinkLines() {
                var newLine = d3v2.svg.line.radial()
                    .interpolate("bundle")
                    .tension(.85)
                    .radius(function (d) {
                        if (d.x < 90 && angleDeg > 270)
                            d.fisheye = fisheyeNegative(d);
                        else if (d.x > 270 && angleDeg < 90)
                            d.fisheye = fisheyeNegative(d);
                        else
                            d.fisheye = fisheye(d);

                        return d.fisheye.y;
                    })
                    .angle(function(d) { return d.fisheye.x / 180 * Math.PI; });

                var
                    newLinks = packages.imports(nodes),
                    newSplines = bundle(newLinks);

                //highlight node currently on and animate pathLinks
                path.each(function(d) {}).attr().attr("d", function(d, i) {
                    return newLine(newSplines[i]); })
                    .classed("target", function (d) {
                        return d.source.data.id === hoveredKey || d.target.data.id === hoveredKey
                    });
            }
            function animateTextNodes() {
                textNodes.each(function (d) {
                    if (d.x < 90 && angleDeg > 270)
                        d.fisheye = fisheyeNegative(d);
                    else if (d.x > 270 && angleDeg < 90)
                        d.fisheye = fisheyeNegative(d);
                    else
                        d.fisheye = fisheye(d)
                }).attr("transform", function(d) {
                    if ((d.fisheye.x - 90) > 89) {
                        return "rotate(" + ((d.fisheye.x - 90) - 180) + ")translate(" + -1 * (d.y + 25) + ", 2)";
                    }
                    else
                        return "rotate(" + (d.fisheye.x - 90) + ")translate(" + (d.y + 25) + ")";
                }).classed("target", function (d) {
                    return d.data.id === hoveredKey
                }).classed("right-half", function(d) { return (d.fisheye.x - 90) > 89})
                    .attr("font-size", function (d) {
                        return getFontSizeForTextWith(d)
                    });
            }
        }
        function getFontSizeForTextWith(d) {
            if (!d.fisheye)
                return 5;
            else {
                if (d.fisheye.z - 1 > 0.8)
                    return 10;
                else if (d.fisheye.z - 1 > 0.6)
                    return 7;
                else if (d.fisheye.z - 1 > 0.3)
                    return 5;
                else if (d.fisheye.z - 1 > 0)
                    return 3;
                else
                    return 5
            }
        }
        function toDegrees (angle) {
            return angle * (180 / Math.PI);
        }
        //Mouse events
        function mouse(e) {
            return [e.pageX - rx, e.pageY - ry];
        }
        function mousedown() {
            m0 = mouse(d3v2.event);
            d3v2.event.preventDefault();
        }
        var hoveredKey = null;
        var currentNode = null;
        var selectedNodeId = null;

        function mouseover(d) {
            hoveredKey = d.key;
            // console.log(d.key);
            // svg.selectAll("path.link.target-" + d.key)
            //     .classed("target", true)
            //     .each(updateNodes("source", "target", true));
            // svg.selectAll("path.link.source-" + d.key)
            //     .classed("source", true)
            //     .each(updateNodes("target", "target", true));
        }

        function mouseout(d) {
            hoveredKey = null;
            // svg.selectAll("path.link.source-" + d.key)
            //     .classed("source", false)
            //     .each(updateNodes("target", "target", false));
            // svg.selectAll("path.link.target-" + d.key)
            //     .classed("target", false)
            //     .each(updateNodes("source", "target", false));
        }
        function deselectNode() {
            var d = currentNode;
            selectedNodeId = null;
            if (d !== null) {
                svg.selectAll("path.link.target-" + d.key)
                    .classed("selected", false)
                    .each(updateNodes("source", "selected", null));
                svg.selectAll("path.link.source-" + d.key)
                    .classed("selected", false)
                    .each(updateNodes("target", "selected", null));
            }
        }
        // var keepD = null;
        function click(d) {
            controller.selectEnslavedPerson(d.data);
        }
        chord.selectNodeWithData = function(data) {
            deselectNode();
            var node = findNodeWithId(data.id);

            var nodeToSelect = svg.selectAll("text")[0].filter(function (d) {
                if (d.__data__.data)
                    return d.__data__.data.id === data.id;
                else
                    return false;

            });

            if (nodeToSelect && nodeToSelect.length > 0) {
                nodeToSelect = nodeToSelect[0];

                svg.selectAll("path.link.target-" + node.key)
                    .classed("selected", true)
                    .each(updateNodes("source", "selected", nodeToSelect));
                svg.selectAll("path.link.source-" + node.key)
                    .classed("selected", true)
                    .each(updateNodes("target", "selected", nodeToSelect));
            }

            currentNode = node;
            selectedNodeId = node.data.id;
        };
        chord.deselectAllNodes = function() {
            deselectNode();
        };
        function findNodeWithId(id) {
            for (var nodeId in allData) {
                var node = allData[nodeId];
                if (node.data.id === id) {
                    return node;
                }
            }
            return null;
        }
        function updateNodes(name, className, value, node) {
            return function(d) {
                if (value) this.parentNode.appendChild(value);
                svg.select("#node-" + d[name].key + "-" + name).classed(className, value);
            };
        }
        function findStartAngle(children) {
            var min = children[0].x;
            children.forEach(function(d) {
                if (d.x < min)
                    min = d.x;
            });
            return min;
        }
        function findEndAngle(children) {
            var max = children[0].x;
            children.forEach(function(d) {
                if (d.x > max)
                    max = d.x;
            });
            return max;
        }
    }
    function getAllDataCopy() {
        var rawData = csvData.map(function(p) {p.id = Number(p.id); return p;});
        return processData(rawData);
    }
    function resetCSVData() {
        csvData = csvJSON(originalData).map(function(p) {p.id = Number(p.id); return p;});
        //sort to group by buyer data
        // csvData.sort(function (a, b) {
        //     if (a.buyer_name > b.buyer_name) {
        //         return 1
        //     }
        //     else if (a.buyer_name == b.buyer_name) {
        //         if (a.farm_name > b.farm_name)
        //             return -1;
        //         return 1
        //     }
        //     else
        //         return -1;
        // });

        //sort by family
        csvData.sort(function (a, b) {
            if (a.last_name > b.last_name) {
                return 1
            }
            return -1;
        });
        var counter = 1;
        csvData.forEach(function (p) {
            var news = "";
            for (var i = 0; i < counter; i++)
                news += "a";
            p.full_name = news + " " + p.full_name;
            counter += 1;
        });
    }
    function runFilter(dataToFilter, filter) {
        var names = filter.map(function(d) {return d.name});

        var newData = dataToFilter;
        newData = newData.map(function(obj) {
            var newObj = obj;
            if (containsObject(obj.name, names))
                newObj.visible = true;
            else
                newObj.visible = false;
            return newObj;
        });
        return newData;
    }
    function getLocationTitleFor(title) {
        if (title === "HenryJohnson")
            return "Chatham";
        else if (title === "WhiteMarsh")
            return "White Marsh";
        else if (title === "StThomassManor")
            return "St. Thomas's Manor";
        else if (title === "Newtown")
            return "Newtown";
        else if (title === "StInigoes")
            return "St. Inigoe's";
        else if (title === "JesseBatey")
            return "West Oak";
        else
            return "Other";
    }
}
chordDiagramMain();