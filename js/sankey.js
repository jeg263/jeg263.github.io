// objSankey.updateData(new_dataJson);

var sankey = {originalData: null, showOtherData: true, magnifyNamesConditionBox: true, multiplier: 0.9};
function buildSankey() {
    function partitionData(data, field) {
        var partitionSortedData = {};
        data.forEach(function (d) {
            var plantationName = d[field];
            if (plantationName === "") {
                plantationName = "Other";
            }
            if (partitionSortedData[plantationName]) {
                var existingDataInside = partitionSortedData[plantationName];
                existingDataInside.push(d);
                partitionSortedData[plantationName] = existingDataInside;
            }
            else
                partitionSortedData[plantationName] = [d];
        });
        return partitionSortedData;
    }
    function bucketPartition(partitionSortedData, field) {
        for (var key in Object.keys(partitionSortedData)) {
            var partitionArray = partitionSortedData[Object.keys(partitionSortedData)[key]];
            if (partitionArray)
                partitionSortedData[Object.keys(partitionSortedData)[key]] = partitionData(partitionArray, field);
        }
        return partitionSortedData;
    }
    function countPartition(partitionSortedData, excluding) {
        for (var key in Object.keys(partitionSortedData)) {
            var partitionArray = partitionSortedData[Object.keys(partitionSortedData)[key]];
            if (partitionArray) {
                if (excluding) {
                    var temp = partitionArray.filter(function (d) {
                        for (var thingToExclude of excluding) {
                            if (d[thingToExclude.name] === thingToExclude.value) {
                                return false;
                            }
                        }
                        return true;
                    });
                    partitionSortedData[Object.keys(partitionSortedData)[key]] = temp.length;
                }
                else
                    partitionSortedData[Object.keys(partitionSortedData)[key]] = partitionArray.length;
            }
        }
        return partitionSortedData;
    }
    function countBucket(bucketSortedData, excluding) {
        for (var key in Object.keys(bucketSortedData)) {
            var partitionObj = bucketSortedData[Object.keys(bucketSortedData)[key]];
            if (partitionObj)
                bucketSortedData[Object.keys(bucketSortedData)[key]] = countPartition(partitionObj, excluding);
        }
        return bucketSortedData;
    }
    function buildConnectionSet(data, field1, field1IdMap, field2, field2IdMap, excluding) {
        var fieldOneData = partitionData(data, field1);
        var field2Data = bucketPartition(fieldOneData, field2);
        var countedData = countBucket(field2Data, excluding);

        var allConnections = [];

        for (var key_num in Object.keys(countedData)) {
            var key = Object.keys(countedData)[key_num];

            // var keysList = Object.keys(field1IdMap);
            if (key in field1IdMap) {
                var value = field1IdMap[key];
                var innerFields = countedData[key];
                if (innerFields) {
                    for (var innerKey of Object.keys(innerFields)) {
                        if (innerKey in field2IdMap) {
                            var innerValue = field2IdMap[innerKey];
                            var connectingCount = innerFields[innerKey];

                            allConnections.push({source: value, target: innerValue, value: connectingCount});
                        }
                    }
                }
            }
        }

        return allConnections;

    }
    function resetData(data) {
        var newData = csvJSON(data).filter(function(p) { return (p.id !== null && p.id !== "" && p.id !== undefined);});
        // var plantationSortedData = {};
        // plantationSortedData = partitionData(newData, 'farm_name');
        // var initialFiftyOne = bucketPartition(plantationSortedData, 'initial_51');
        // var count = countBucket(initialFiftyOne);

        var plantationsFields = {"Newtown": 1, "Other": 2, "St. Inigoes": 3, "St. Thomas's Manor": 4, "White Marsh": 5};
        var buyerFields = {"HenryJohnson": 7, "JesseBatey": 8, "Other": 9}

        var result = buildConnectionSet(newData, 'farm_name', plantationsFields, 'initial_51', {"1": 6});
        var result2 = buildConnectionSet(newData, 'initial_51', {"1": 6}, 'buyer_name', buyerFields);
        var result3 = buildConnectionSet(newData, 'farm_name', plantationsFields, 'katherine_jackson', {"1": 0}, [{name: 'initial_51', value: "1"}]);
        var result4 = buildConnectionSet(newData, 'katherine_jackson', {"1": 0}, 'buyer_name', buyerFields);
        // var result3 = buildConnectionSet(newData, 'farm_name', plantationsFields, 'buyer_name', buyerFields);
        var result5 = buildConnectionSet(newData, 'initial_51', {"1": 6}, 'katherine_jackson', {"1": 0});
        // var result5 = buildConnectionSet(newData, 'farm_name', plantationsFields, 'buyer_name', buyerFields);
        var result6 = buildConnectionSet(newData, 'farm_name', plantationsFields, 'buyer_name', buyerFields, [{name: "initial_51", value: "1"}, {name: "katherine_jackson", value: "1"}]);


        var result7 = buildConnectionSet(newData, 'buyer_name', buyerFields, 'ran_away', {"1": 10});
        var result8 = buildConnectionSet(newData, 'buyer_name', buyerFields, 'buyer_name', {"JesseBatey": 11, "HenryJohnson": 11, "Other": 11}, [{name: 'ran_away', value: "1"}]);

        var all_results = result.concat(result2).concat(result3).concat(result4).concat(result6).concat(result7).concat(result8);

        // {name: "katherine_jackson", value: "1"}
        var configSankey = {
            margin: { top: 10, left: 10, right: 10, bottom: 10 },
            nodes: {
                dynamicSizeFontNode: {
                    enabled: true,
                    minSize: 14,
                    maxSize: 30
                },
                fontSize: 14, // if dynamicSizeFontNode not enabled
                draggableX: false, // default [ false ]
                draggableY: true, // default [ true ]
                colors: d3.scaleOrdinal(d3.schemeCategory10)
            },
            links: {
                formatValue: function(val) {
                    return d3.format(",.0f")(val) + ' persons';
                },
                unit: 'persons' // if not set formatValue function
            },
            tooltip: {
                infoDiv: true,  // if false display default tooltip
                labelSource: 'Coming from:',
                labelTarget: 'Going to:'
            },
            emptyNodes: [11]
        };

            // [
            // {source: 0, target: 4, value: 2},
            //     {source: 1, target: 4, value: 3},
            //     {source: 2, target: 4, value: 1},
            //     {source: 3, target: 4, value: 4},
            //
            //
            //     {source: 0, target: 7, value: 2},
            //     {source: 1, target: 7, value: 1},
            //     {source: 2, target: 7, value: 3},
            //     {source: 3, target: 7, value: 2},
            //     {source: 7, target: 5, value: 5},
            //     {source: 7, target: 4, value: 3},
            //
            //
            //     {source: 0, target: 5, value: 2},
            //     {source: 1, target: 5, value: 1},
            //     {source: 2, target: 5, value: 4},
            //     {source: 3, target: 5, value: 5},
            //     {source: 0, target: 6, value: 1},
            //     {source: 1, target: 6, value: 0},
            //     {source: 2, target: 6, value: 0},
            //     {source: 3, target: 6, value: 1},
            //     {source: 5, target: 6, value: 1},
            //     {source: 4, target: 6, value: 0},
            // ]

        var datajson = {nodes: [
            {id: 0, name: "Katherine Jackson", color: "orange"},
            {id: 1, name: "Newtown", color: "#008380"},
            {id: 2, name: "Other Plantation", color: "#004283"},
            {id: 3, name: "St. Inigoes", color: "#D52B1E"},
            {id: 4, name: "St. Thomas's Manor", color: "#FFDC12"},
            {id: 5, name: "White Marsh", color: "#0077C5"},
            {id: 6, name: "Initial 51", color: "brown"},
            {id: 7, name: "Chatham", color: "#FF8000"},
            {id: 8, name: "West Oak", color: "#53B447"},
            {id: 9, name: "Other Buyer", color: "#7A3DD8"},
            {id: 10, name: "Ran away", color: "#fede28"},
            {id: 11, name: "Never Ran away", color: "#fede28"}
        ],
            links: all_results};

        var objSankey = sk.createSankey('#sankeyChart', configSankey, datajson);

    }
    $(document).ready(function() {
        var originalData;

        $.ajax({
            type: "GET",
            url: "https://docs.google.com/spreadsheets/d/e/2PACX-1vSziKv8bLNEJRq0UgbAzYp5OJIYTwZXdXPEUX8VlDv0lzUAu4I_tLQVHmYob91BPUaYgCMZnF87mOSl/pub?gid=953071699&single=true&output=csv",
            dataType: "text",
            success: function(data) {
                //Set original data
                originalData = data;
                sankey.originalData = data;
                resetData(data);
                // refreshVisualization(null, true);
                // controller.onDataLoad();
                // controller.didUpdateMultiplier(); //multiplier was updated above
            }
        });
    });
}
buildSankey();