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
            return d3.format(",.0f")(val) + ' TWh';
        },
        unit: 'TWh' // if not set formatValue function
    },
    tooltip: {
        infoDiv: true,  // if false display default tooltip
        labelSource: 'Input:',
        labelTarget: 'Output:'
    }
}

var datajson = {nodes: [
    {id: 0, name: "White Marsh", color: "green"},
    {id: 1, name: "St. Thomas's Mannor", color: "yellow"},
    {id: 2, name: "St. Inigoes", color: "blue"},
    {id: 3, name: "Newtown", color: "blue"},
    {id: 4, name: "Chatham", color: "red"},
    {id: 5, name: "West Oak", color: "purple"},
    {id: 6, name: "Runnaway", color: "brown"},
    {id: 7, name: "Katherine Jackson", color: "orange"}
],
    links: [
        {source: 0, target: 4, value: 2},
        {source: 1, target: 4, value: 3},
        {source: 2, target: 4, value: 1},
        {source: 3, target: 4, value: 4},


        {source: 0, target: 7, value: 2},
        {source: 1, target: 7, value: 1},
        {source: 2, target: 7, value: 3},
        {source: 3, target: 7, value: 2},
        {source: 7, target: 5, value: 5},
        {source: 7, target: 4, value: 3},


        {source: 0, target: 5, value: 2},
        {source: 1, target: 5, value: 1},
        {source: 2, target: 5, value: 4},
        {source: 3, target: 5, value: 5},
        {source: 0, target: 6, value: 1},
        {source: 1, target: 6, value: 0},
        {source: 2, target: 6, value: 0},
        {source: 3, target: 6, value: 1},
        {source: 5, target: 6, value: 1},
        {source: 4, target: 6, value: 0},
    ]};

var objSankey = sk.createSankey('#sankeyChart', configSankey, datajson);
// objSankey.updateData(new_dataJson);