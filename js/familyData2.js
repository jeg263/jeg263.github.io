var family2 = {familyData: null};

function familyMain() {

    //process family data
    family2.processFamilyData = function() {
        $.ajax({
            type: "GET",
            url: url.url,
            dataType: "text",
            success: function(gsaDataCSV) {
                // var localFamilyData = csvFamilyJSON(gsaDataCSV);
                var superLocalData = csvComplexFamilyJSON(gsaDataCSV);

                family2.treeFamilyData = superLocalData;
                refreshTreeViews(null, null, "");

                var localFamilyData = csvFamilyJSON(gsaDataCSV);
                localFamilyData = localFamilyData.map(function (p) { return flattenJSON(p) })
                family.familyData = localFamilyData;
            }
        });

    };
    family2.findFamilySetForId = function(id) {  //find family with person of id
        for (var i = 0 in family2.familyData) { //loop through every family set in the array of familyData
            var fam = family2.familyData[i];
            for (var j = 0 in fam) {
                var num = fam[j];
                if (num === "" + id) {
                    return fam; //return the set
                }
            }
        }
    };
    function flattenJSON(json, checkingSpouse) { //flatten into an array of sets of ids
        if (json.children && json.children.length > 0) {
            var array = [json.id];
            for (var child in json.children) { //get id's of children to add to set - recursively flatten the tree
                child = json.children[child];
                array = array.concat(flattenJSON(child));
            }
            if (json.spouse && json.spouse.length > 0) {
                for (var sp in json.spouse) {
                    var spObj = json.spouse[sp];
                    if (!checkingSpouse)
                        array = array.concat(flattenJSON(spObj, true))
                }
            }
            return array;
        }
        else {
            if (json.spouse && json.spouse.length > 0) {
                var array = [json.id];
                for (var sp in json.spouse) {
                    var spObj = json.spouse[sp];
                    if (!checkingSpouse)
                        array = array.concat(flattenJSON(spObj, true))

                }
                return array;
            }
            else
                return [json.id]; //just one id
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
    function resetColors(tree, person) {

        function searchTree(id, node) {
            if (node.id === "" + id) {
                node.class = "man";
                if (node.marriages && node.marriages.length > 0) {
                    if (node.marriages[0].spouse.id !== "" + id && node.marriages[0].spouse.class !== "woman")
                        node.marriages[0].spouse.class = "man";
                }
                if (node.marriages && node.marriages.length > 0) {
                    if (node.marriages[0].spouse.id === "" + id)
                        node.marriages[0].spouse.class = "man";
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
                        node.marriages[0].spouse.class = "man";
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
            familyTreeController.selectEnslavedPerson(personData[0].data); //select person
        else
            familyTreeController.deselectEnslavedPerson(); //if person doesn't exist deselect
    }
    function refreshComplexTreeFromSelectedPerson(person, selectedClass) {
        var idEnd = person;
                var newID = "";
                for (var i = 0; i < idEnd.length; i++) {
                    var g = idEnd[i];
                    var q = parseFloat(g);
                    if (q || g === "0") {
                        newID += q;
                    }
                }
        person = newID;


        var treeDiv = d3.select('#graphMapWhatTree');
        if (treeDiv) //doesn't run the first time the visualization is created
            treeDiv.selectAll("*").remove();

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

        let newParents = [];

        for (var j in family2.treeFamilyData) {
            if (searchTree(person, family2.treeFamilyData[j]))
            {
                newParents.push(family2.treeFamilyData[j]);
            }
        }
        refreshTreeViews(newParents, person, selectedClass)
    };
    family2.refreshTreeFromLastName = function (searchTerm, person, familyRefresh) {
        let selectedClass = "selected-man";
        if (familyRefresh)
            selectedClass = "man";

        if (searchTerm === "" && person !== null) {
            refreshComplexTreeFromSelectedPerson(person, selectedClass)
        }
        else if (searchTerm === "" && person === null) {
            var treeDiv = d3.select('#graphMapWhatTree');
            if (treeDiv) //doesn't run the first time the visualization is created
                treeDiv.selectAll("*").remove();

            refreshTreeViews(null, person)
        }
        else {
            var treeDiv = d3.select('#graphMapWhatTree');
            if (treeDiv) //doesn't run the first time the visualization is created
                treeDiv.selectAll("*").remove();

            function searchTree(lastName, node) {
                if (node.last_name === "" + lastName)
                    return true;
                else {
                    var combinedConditional = false;
                    if (node.marriages && node.marriages.length > 0) {
                        if (node.marriages[0].spouse.last_name === "" + lastName)
                            return true;
                        else {
                            if (node.marriages[0].children && node.marriages[0].children.length > 0) {
                                for (var c in node.marriages[0].children) {
                                    combinedConditional = combinedConditional || searchTree(lastName, node.marriages[0].children[c])
                                    if (combinedConditional)
                                        return combinedConditional
                                }
                            }
                        }
                    }
                    return false;
                }
            }
            let newParents = [];

            for (var j in family2.treeFamilyData) {
                if (searchTree(searchTerm, family2.treeFamilyData[j]))
                {
                    newParents.push(family2.treeFamilyData[j]);
                }
            }
            refreshTreeViews(newParents, person, selectedClass)
        }
    };
    function refreshTreeViews(newParents, person, selectedClass) {
        if (newParents && newParents.length > 0) {
            d3.select('#noTreeDataTree').classed("hidden-other-label", true);
        }
        else {
            d3.select('#noTreeDataTree').classed("hidden-other-label", false);
        }

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

            var hundredMultiplier = Math.ceil(count / 4) * 155 - 75;
            var widthFinal = 0;

            if (len === 0) {
                widthFinal = 100;
            }
            else {
                widthFinal = 100 * (2 * len - 1)
            }

            var treeData = newParents[par];
            if (person && selectedClass !== "man")
                treeData = setColorToSelected(newParents[par], person);
            else if (person)
                resetColors(newParents[par], person);
            else
                resetColors(newParents[par], "");


            var familyName = "";

            dTree.init([treeData, familyName], {
                target: "#graphMapWhatTree",
                debug: true,
                height: hundredMultiplier,
                width: widthFinal,
                nodeWidth: 150,
                callbacks: {
                    nodeClick: function (clickedData, extra) {
                        // controller.selectEnslavedPerson()
                        if (clickedData.class === "man")
                            if (clickedData.identifier && clickedData.identifier !== "")
                                didSelectTreeNodeWith(parseInt(clickedData.identifier));
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
        }
    }
    family2.refreshTreeWText = function() {
        updateFamilyTreeText(null);
    };
}
familyMain();