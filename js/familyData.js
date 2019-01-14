var family = {familyData: null};

function familyMain() {

    function convertToTreeStructure(jsonStructureData, allPersonsFlat) {
        var newStructure = [];
        for (var i in jsonStructureData) {
            var child = jsonStructureData[i];
            var spouseObj = null;

            if (child.spouse && child.spouse.length > 0) {
                spouseObj = child.spouse[0];
            }

            if (child.children && child.children.length > 0) {
                var spouse = null;
                if (spouseObj) {
                    spouse = {
                        "name": spouseObj.first_name,
                        "class": "man",
                        "id": spouseObj.id,
                    };
                }
                else {
                    spouse = {
                        "name": "Unknown",
                        "class": "woman"
                    };
                }

                newStructure.push( {
                    "name": child.first_name,
                    "textClass": "emphasis",
                    "id": child.id,
                    "class": "man",
                    "marriages": [{
                        "spouse": spouse,
                        "children": convertToTreeStructure(child.children, allPersonsFlat)
                    }]
                })
            }
            else {
                newStructure.push({
                    "name": child.first_name,
                    "id": child.id,
                    "class": "man"
                });
            }
        }
        return newStructure
    }

    //process family data
    family.processFamilyData = function() {
        $.ajax({
            type: "GET",
            url: "./data/gsaDataFile.csv",
            dataType: "text",
            success: function(gsaDataCSV) {
                var localFamilyData = csvFamilyJSON(gsaDataCSV);
                localFamilyData = localFamilyData.map(function (p) { return flattenJSON(p) })
                family.familyData = localFamilyData;

                var secondLocalFamilyData = csvFamilyJSON(gsaDataCSV);
                var jsonFamilyData = secondLocalFamilyData.filter(function (d) {
                    if (d.children.length > 0)
                        return true;
                    return false;
                });

                // var newAllPersonData = csvJSON(gsaDataCSV);
                var newParents = convertToTreeStructure(jsonFamilyData, csvJSON(gsaDataCSV));
                family.treeFamilyData = newParents;
                updateTree();
            }
        });

        // $.getJSON("./data/gsaDataFile.json", function (allPeopleJSON) {
        //     var localFamilyData = csvFamilyJSON(gsaDataCSV);
        //     localFamilyData = localFamilyData.map(function (p) { return flattenJSON(p) })
        //     family.familyData = localFamilyData;
        //
        //     var secondLocalFamilyData = csvFamilyJSON(gsaDataCSV);
        //     var jsonFamilyData = secondLocalFamilyData.filter(function (d) {
        //         if (d.children.length > 0)
        //             return true;
        //         return false;
        //     });
        //
        //     // var newAllPersonData = csvJSON(gsaDataCSV);
        //     var newParents = convertToTreeStructure(jsonFamilyData, csvJSON(gsaDataCSV));
        //     family.treeFamilyData = newParents;
        //     updateTree();
        // });
    };
    family.findFamilySetForId = function(id) {  //find family with person of id
        for (var i = 0 in family.familyData) { //loop through every family set in the array of familyData
            var fam = family.familyData[i];
            for (var j = 0 in fam) {
                var num = fam[j];
                if (num === "" + id) {
                    return fam; //return the set
                }
            }
        }
    };
    function flattenJSON(json) { //flatten into an array of sets of ids
        if (json.children.length > 0) {
            var array = [json.id];
            for (var child in json.children) { //get id's of children to add to set - recursively flatten the tree
                child = json.children[child];
                array = array.concat(flattenJSON(child));
            }
            return array;
        }
        else {
            return [json.id]; //just one id
        }
    }
}
function updateTree(person, personObj, treeObj) {
    var treeDiv = d3.select('#graphMapWhat');
    if (treeDiv) //doesn't run the first time the visualization is created
        treeDiv.selectAll("*").remove();

    // var newParents = [{
    //     "name": "none",
    //     "textClass": "emphasis",
    //     "id": "1",
    //     "class": "man",
    //     "marriages": []
    // }];
    var newParents = null;
    if (person) {

        // newParents = [family.treeFamilyData[1]];
        if (personObj)
            newParents = [{
                "name": personObj.first_name,
                "textClass": "emphasis",
                "id": personObj.id,
                "class": "selected-man",
                "marriages": []
            }];
        else if (treeObj) {
            newParents = [{
                "name": personObj.name,
                "textClass": "emphasis",
                "id": personObj.id,
                "class": "selected-man",
                "marriages": []
            }];
        }

        function searchTree(id, node) {
            if (node.id === "" + id)
                return true;
            else {
                var combinedConditional = false;
                if (node.marriages && node.marriages.length > 0) {
                    if (node.marriages[0].spouse.id === "" + id)
                        return true;
                    else {
                        if (node.marriages[0].children && node.marriages[0].children.length > 0) {
                            for (var c in node.marriages[0].children) {
                                combinedConditional = combinedConditional || searchTree(id, node.marriages[0].children[c])
                                if (combinedConditional)
                                    return combinedConditional
                            }
                        }
                    }
                }
                return false;
            }
        }
        for (var j in family.treeFamilyData) {
            if (searchTree(person, family.treeFamilyData[j]))
            {
                newParents = [family.treeFamilyData[j]];
                break;
            }
        }
    }
        // newParents = [family.treeFamilyData[1]];

    // if (newParents && newParents.length > 0)
    //     newParents = newParents[0];
    for (var par in newParents) {
        function getLongestParent(parent) {
            if (parent.marriages && parent.marriages.length > 0) {
                var lengthsArray = [];
                var children = parent.marriages[0].children;

                if (children.length > 0) {
                    for (var childI in children) {
                        var child = children[childI];
                        var childLength = 1 + getLongestParent(child);
                        lengthsArray.push(childLength);
                    }
                    return lengthsArray.reduce(function (a, b) {
                        return Math.max(a, b);
                    });
                }
                else {
                    return 1;
                }
            }
            else {
                return 1;
            }
        }

        function getEdgeNodes(parent) {
            if (parent.marriages && parent.marriages.length > 0) {
                var lengthsArray = [];
                var children = parent.marriages[0].children;

                if (children.length > 0) {
                    var childrenCounter = 0;
                    for (var childI in children) {
                        var child = children[childI];
                        childrenCounter += getEdgeNodes(child);
                    }
                    return childrenCounter;
                }
                else {
                    return 1;
                }
            }
            else {
                return 1;
            }
        }

        var len = getLongestParent(newParents[par]);
        var count = getEdgeNodes(newParents[par]);

        if (count === 0)
            count = 1;

        var hundredMultiplier = Math.ceil(count / 4) * 155;
        var widthFinal = 0;

        if (len === 0) {
            widthFinal = 100;
        }
        else {
            widthFinal = 100 * (2 * len - 1)
        }

        var treeData = newParents[par];
        if (person)
            treeData = setColorToSelected(newParents[par], person);


        var familyName = personObj.last_name;
        if (familyName === "")
            familyName = "Unknown";

        dTree.init([treeData, familyName], {
            target: "#graphMapWhat",
            debug: true,
            height: hundredMultiplier,
            width: widthFinal,
            nodeWidth: 100,
            callbacks: {
                nodeClick: function (clickedData, extra) {
                    // controller.selectEnslavedPerson()
                    if (clickedData.class === "man")
                        didSelectTreeNodeWith(clickedData.id);
                    // if (clickedData.class === "man")
                    //     updateTree(clickedData.id, null, clickedData);
                },
                textRenderer: function (name, extra, textClass) {
                    if (extra && extra.nickname)
                        name = name + " (" + extra.nickname + ")";
                    return "<p align='center' class='" + textClass + "'>" + name + "</p>";
                }
            }
        });
        break;
    }
}
function setColorToSelected(tree, person) {

    function searchTree(id, node) {
        if (node.id === "" + id) {
            node.class = "selected-man";
            if (node.marriages && node.marriages.length > 0) {
                if (node.marriages[0].spouse.id !== "" + id && node.marriages[0].spouse.class !== "woman")
                    node.marriages[0].spouse.class = "man";
            }
            if (node.marriages && node.marriages.length > 0) {
                if (node.marriages[0].spouse.id === "" + id)
                    node.marriages[0].spouse.class = "selected-man";
                else {
                    if (node.marriages[0].spouse.class === "selected-man") {
                        node.marriages[0].spouse.class = "man";
                    }
                    if (node.marriages[0].children && node.marriages[0].children.length > 0) {
                        for (var c in node.marriages[0].children) {
                            searchTree(id, node.marriages[0].children[c]);
                        }
                    }
                }
            }
        }
        else {
            if (node.class === "selected-man") {
                node.class = "man";
            }
            if (node.marriages && node.marriages.length > 0) {
                if (node.marriages[0].spouse.id === "" + id && node.marriages[0].spouse.class !== "woman")
                    node.marriages[0].spouse.class = "selected-man";
                else {
                    if (node.marriages[0].spouse.class === "selected-man") {
                        node.marriages[0].spouse.class = "man";
                    }
                }
                if (node.marriages[0].children && node.marriages[0].children.length > 0) {
                    for (var c in node.marriages[0].children) {
                        searchTree(id, node.marriages[0].children[c]);
                    }
                }
            }
        }
    }
    searchTree(person, tree);


    return tree;
}
function didSelectTreeNodeWith(id) {
    var personData = chord.getAllData().filter(function(data) { //find selected person

        var idEnd = data.data.id;
        var newID = "";
        for (var i = 0; i < idEnd.length; i++) {
            var g = idEnd[i];
            var q = parseFloat(g);
            if (q || g === "0") {
                newID += q;
            }
        }

        if (parseFloat(newID) === id)
            return true;
        return false;
    });
    if (personData && personData.length > 0)
        controller.selectEnslavedPerson(personData[0].data); //select person
    else
        controller.deselectEnslavedPerson(); //if person doesn't exist deselect
}
family.refreshTreeWIthSelectedPerson = function(familyData) {

    if (familyData) {
        d3.select('#noTreeData').classed("hidden-other-label", true);
        var idEnd = familyData.id;
        var newID = "";
        for (var i = 0; i < idEnd.length; i++) {
            var g = idEnd[i];
            var q = parseFloat(g);
            if (q || g === "0") {
                newID += q;
            }
        }
        updateTree(parseFloat(newID), familyData);
    }
    else {
        d3.select('#noTreeData').classed("hidden-other-label", false);
        updateTree()
    }
};
family.refreshTreeWText = function() {
    updateFamilyTreeText(null);
};
familyMain();