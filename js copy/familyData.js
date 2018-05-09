(function() {
    //process family data
    function findFamilySetForId(id) {
        for (var i = 0 in familyData) {
            var family = familyData[i];
            for (var j = 0 in family) {
                var num = family[j];
                if (num === id) {
                    return family;
                }
            }
        }
    }
    function processFamilyData(allPeopleJSON) {
        // allPeopleJSON.map(function (line) { allPeople.push(line); });
        var parents = allPeopleJSON.filter(function (p) { return p.parent === null });
        parents = parents.map(function (p) { return Number(p.id) });
        parents = parents.map(function (p) { return constructJSONForID(p, allPeopleJSON) });
        parents = parents.map(function (p) { return flattenJSON(p) });
        return parents;
    }
    function flattenJSON(json) {
        if (json.children.length > 0) {
            var array = [json.id];
            for (var child in json.children) {
                child = json.children[child];
                array = array.concat(flattenJSON(child));
            }
            return array;
        }
        else {
            return [json.id];
        }
    }
    function constructJSONForID(id, allPeopleJSON) {
        var obj = allPeopleJSON.filter(function(line) { return Number(line.id) === id });

        if (obj.length > 0) {
            obj = obj[0];
            var children = obj.children;
            // console.log(children);
            var newChildren = [];
            for (var child in children) {
                child = children[child];
                // console.log(child);
                newChildren.push(constructJSONForID(child, allPeopleJSON));
            }
            return {"id": id, "children": newChildren};
        }
        else if (obj.length > 1) {
            alert("problem");
        }
        else {
            return {"id": id, "children": []};
        }

    }
});