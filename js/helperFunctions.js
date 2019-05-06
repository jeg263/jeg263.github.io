//Helper functions
String.prototype.replaceAll = function(search, replacement) { //replace all of one character with another in a string
    var target = this;
    return target.split(search).join(replacement);
};
function cleanName(name) { //Clean name for data visualization so that it makes for a good id
    return name.replaceAll(".", "").replaceAll(" ", "").replaceAll("\'", "").replaceAll("?", "").replaceAll("[", "").replaceAll("]", "");
}
function cleanDataLine(obj) { //sets origin and destination with cleaned data
    obj.origin = cleanName(obj.farm_name);
    obj.destination = cleanName(obj.buyer_name);
    return obj;
}
function getSex(sexToConvert) {
    if (sexToConvert === "M") {
        return "male";
    }
    else if (sexToConvert === "F") {
        return "female";
    }
    else {
        return "unknown";
    }
}

function csvJSON(csv){ //Convert CSV to JSON
    var lines = csv.split("\n");
    var result = [];
    var headers = lines[0].split(",");

    lines.map(function(line, indexLine){
        if (indexLine < 1) return // Jump header line

        var obj = {};
        var currentline = line.split(",");

        headers.map(function(header, indexHeader){
            obj[header] = currentline[indexHeader]
        });

        result.push(obj)
    });

    result.pop(); // remove the last item because undefined values

    // result = csvJSON(result);

    result = result.map(function(d) {
        return {
            id: d["ID"],
            gsa_document: d["GSA Document"],
            first_name: d["First name"],
            last_name: d["Last name"],
            full_name: d["First name"] + " " + d["Last name"],
            age: d["Age"],
            year: d["Year"],
            birthdate: d["Year"],
            farm_name: d["Location"],
            buyer_name: d["Buyer"],
            spouse_id: d["Spouse ID"],
            father_id: d["Father ID"],
            mother_id: d["Mother ID"],
            initial_51: d["Initial 51"],
            katherine_jackson: d["Katherine Jackson"],
            ran_away: d["Ran away"],
            height: d["Height (inches)"],
            gender: getSex(d["Sex"]),
            extra_info: d["Notes"]
        }
    });
    result = result.map(function (recordToMap) {
        if (recordToMap.buyer_name.includes("Johnson")) {
            recordToMap.buyer_name = "HenryJohnson"
        }
        else if (recordToMap.buyer_name.includes("Batey")) {
            recordToMap.buyer_name = "JesseBatey"
        }

        if (recordToMap.farm_name === "St. Thomas") {
            recordToMap.farm_name = "St. Thomas's Manor"
        }

        return recordToMap;
    });

    return result // JavaScript object
}
function csvComplexFamilyJSON(csv) {
    function uniq(a) {
        var seen = {};
        return a.filter(function(item) {
            return seen.hasOwnProperty(item) ? false : (seen[item] = true);
        });
    }

    var result = csvJSON(csv);
    var spouses = result.filter(function (d) {
        if (d.spouse_id !== "")
            return true;
    });
    spouses = spouses.map(function (d) {
        let current = parseInt(d.id);
        let spouse = parseInt(d.spouse_id);
        if (current < spouse) {
            return [current, spouse];
        }
        else {
            return [spouse, current];
        }
    });
    var children_spouses = result.filter(function (d) {
        if (d.father_id !== "" || d.mother_id !== "") {
            return true;
        }
    });
    children_spouses = children_spouses.map(function (d) {
        var father = null;
        if (d.father_id && d.father_id !== "") {
            father = parseInt(d.father_id);
        }
        var mother = null;
        if (d.mother_id && d.mother_id !== "") {
            mother = parseInt(d.mother_id);
        }
        if (father === null) {
            return [mother, null];
        }
        else if (mother === null) {
            return [father, null];
        }
        else if (father < mother) {
            return [father, mother];
        }
        else {
            return [mother, father];
        }
    });
    spouses = spouses.concat(children_spouses);
    spouses = uniq(spouses);

    var spouses_hash = {};

    spouses.forEach(s => {
        let first = s[0];
        let second = s[1];

        if (first in spouses_hash) {
            spouses_hash[first].push(s)
        }
        else {
            spouses_hash[first] = [s]
        }

        if (second !== null) {
            if (second in spouses_hash) {
                spouses_hash[second].push(s)
            }
            else {
                spouses_hash[second] = [s]
            }
        }

    });

    let null_parents = result.filter(function (d) {
        if (d.mother_id === "" && d.father_id === "" && d.id !== "")
            return true;
    });

    let null_parent_ids = new Set(null_parents.map(function (d) {
        return parseInt(d.id)
    }));

    let added_parents = {};
    null_parents = null_parents.filter(function (d) {
        if (d.spouse_id === "") {
            return true;
        }
        else if (null_parent_ids.has(parseInt(d.spouse_id))) {
            let i1 = parseInt(d.id);
            let i2 = parseInt(d.spouse_id);
            if (i2 < i1) {
                let i1Temp = i1;
                i1 = i2;
                i2 = i1Temp;
            }
            if (i1 in added_parents) {
                if (!new Set(added_parents[i1]).has(i2)) {
                    added_parents[i1].push(i2);
                    return true;
                }
            }
            else {
                added_parents[i1] = [i2];
                return true;
            }
        }
        return false;
    });
    let starter_parent_ids = new Set(null_parents.map(function (d) {
        return parseInt(d.id)
    }));

    let single_parent_children = {};
    let single_parent_children_array = result.filter(function (d) {
        if ((d.mother_id === "" && d.father_id !== "" && d.id !== "") || (d.mother_id !== "" && d.father_id === "" && d.id !== ""))
            return true;
    });
    single_parent_children_array.forEach(function (d) {
        let parent = "";
        if (d.mother_id !== "")
            parent = d.mother_id;
        else
            parent = d.father_id;

        let id = parseInt(d.id);
        if (parent in single_parent_children) {
            single_parent_children[parent].push(id)
        }
        else {
            single_parent_children[parent] = [id]
        }
    });
    let people = {};
    result.forEach(function (d) {
       if (d.id !== "")
           people[parseInt(d.id)] = d
    });

    // .map(function (d) {
    //     return parseInt(d.id)
    // });

    function getChildWithId(id) {
        let person = people[id];

        let new_person = {
            "class": "man",
            "id": person.id,
            "marriages": [],
            "name": person.first_name + " " + person.last_name,
            "last_name": person.last_name,
            "textClass": "emphasis"
        };

        if (id in single_parent_children) {
            let children = single_parent_children[id];

            let marriage = {
                "children": [],
                "spouse": {
                    "id": null,
                    "class": "woman",
                    "name": "Unknown",
                    "last_name": "Unknown"
                }
            };

            children.forEach(function (childId) {
                marriage["children"].push(getChildWithId(childId))
            });

            new_person["marriages"].push(marriage)
        }
        else if (id in spouses_hash) {
            let marriages = spouses_hash[id];

            marriages.forEach(function (marriage) {
                let children = getChildrenIdWithParentIds(marriage[0].toString(), marriage[1].toString());

                let spouse = marriage[0];
                if (id === marriage[0]) {
                    spouse = marriage[1]
                }

                let marriageObj = {
                    "children": [],
                    "spouse": {
                        "id": null,
                        "class": "woman",
                        "name": "Unknown",
                        "last_name": "Unknown"
                    }
                };

                if (spouse !== null) {
                    let spousePerson = people[spouse];

                    marriageObj["spouse"]["class"] = "man";
                    marriageObj["spouse"]["id"] = spousePerson.id;
                    marriageObj["spouse"]["name"] = spousePerson.first_name + " " + spousePerson.last_name;
                    marriageObj["spouse"]["last_name"] = spousePerson.last_name;
                }

                children.forEach(function (childId) {
                    marriageObj["children"].push(getChildWithId(childId))
                });

                new_person["marriages"].push(marriageObj)
            })
        }

        return new_person;
    }

    function getChildrenIdWithParentIds(id1, id2) {
        return result.filter(function (d) {
            if ((d.mother_id === id1 && d.father_id === id2) || (d.mother_id === id2 && d.father_id === id1))
                return true;
            return false;
        }).map(function (d) {
            return d.id;
        });
    }

    let familyTrees = [];
    while (starter_parent_ids.size > 0) {
        let it = starter_parent_ids.values();
        //get first entry:
        let first = it.next();
        //get value out of the iterator entry:
        let newNullParent  = first.value;
        let person = people[newNullParent];

        starter_parent_ids.delete(newNullParent);

        let new_person = {
            "class": "man",
            "id": person.id,
            "marriages": [],
            "name": person.first_name + " " + person.last_name,
            "last_name": person.last_name,
            "textClass": "emphasis"
        };

        if (newNullParent in single_parent_children) {
            let children = single_parent_children[newNullParent];

            let marriage = {
                "children": [],
                "spouse": {
                    "id": null,
                    "class": "woman",
                    "name": "Unknown",
                    "last_name": "Unknown"
                }
            };

            children.forEach(function (childId) {
                marriage["children"].push(getChildWithId(childId))
            });

            new_person["marriages"].push(marriage)
        }
        else if (newNullParent in spouses_hash) {
            let marriages = spouses_hash[newNullParent];

            marriages.forEach(function (marriage) {
                let children = getChildrenIdWithParentIds(marriage[0].toString(), marriage[1].toString());

                let spouse = marriage[0];
                if (newNullParent === marriage[0]) {
                    spouse = marriage[1]
                }

                let marriageObj = {
                    "children": [],
                    "spouse": {
                        "id": null,
                        "class": "woman",
                        "name": "Unknown",
                        "last_name": "Unknown"
                    }
                };

                if (spouse !== null) {
                    let spousePerson = people[spouse];

                    marriageObj["spouse"]["class"] = "man";
                    marriageObj["spouse"]["id"] = spousePerson.id;
                    marriageObj["spouse"]["name"] = spousePerson.first_name + " " + spousePerson.last_name;
                    marriageObj["spouse"]["last_name"] = spousePerson.last_name;
                }
                children.forEach(function (childId) {
                    marriageObj["children"].push(getChildWithId(childId))
                });

                new_person["marriages"].push(marriageObj)
            })
        }
        familyTrees.push(new_person)
    }


    function searchTree(id, node) {
        if (node.id === "" + id)
            return node;
        else {
            if (node.marriages && node.marriages.length > 0) {
                if (node.marriages[0].spouse.id !== "" + id)
                {
                    if (node.marriages[0].children && node.marriages[0].children.length > 0) {
                        for (var c in node.marriages[0].children) {
                            let result = searchTree(id, node.marriages[0].children[c]);
                            if (result !== null)
                                return result;
                        }
                    }
                }
            }
        }
        return null;
    }

    function splitTree(tree, node) {
        if (node.marriages && node.marriages.length > 0) {
            if (node.marriages.length > 1) {
                let newTree = JSON.parse(JSON.stringify(tree));
                let nodeToChange = searchTree(node.id, newTree);

                let marriageToRemove = node.marriages.pop();
                nodeToChange.marriages = [marriageToRemove];
                familyTrees.push(nodeToChange);

                return true
            }
            else
            {
                if (node.marriages[0].children && node.marriages[0].children.length > 0) {
                    for (var c in node.marriages[0].children) {
                        let result = splitTree(tree, node.marriages[0].children[c]);
                        if (result === true)
                            return result;
                    }
                }
            }
        }
        return false;
    }
    function repeatSplitTree() {
        for (var i = 0; i < familyTrees.length; i++) {
            let tree = familyTrees[i];
            let result = splitTree(tree, tree);
            if (result) {
                repeatSplitTree();
                i = familyTrees.length + 1;
            }
        }
    }
    repeatSplitTree();

    return familyTrees;
}
function csvFamilyJSON(csv) {
    var result = csvJSON(csv);
    var nullParents = result.filter(function (d) {
        if (d.father_id === "" && d.mother_id === "" && d.id !== "")
            return true;
    });
    var hash = {};
    nullParents = nullParents.filter(function (d) {
        if (d.spouse_id !== "") {
            if (hash.hasOwnProperty(d.id))
                return false;
            hash[d.spouse_id] = 1;

        }
        return true;
    });
    function mapRelationships(data) {
        data.map(function (d) {
            var spouse = result.filter(function(d2) {
                if (d.spouse_id !== "" && d2.id === d.spouse_id)
                    return true;
            });
            d.children = [];
            var children = result.filter(function(d2) {
                if (d2.father_id === "" && d2.mother_id === "")
                    return false;
                if (d2.father_id === d.id || d2.mother_id === d.id)
                    return true;
            });
            d.children = children;
            d.spouse = spouse;
            return d;
        });
        return data;
    }
    function recursiveMapRelationships(data) {
        if (data.length > 0) {
            data = mapRelationships(data);
            data.map(function(d) {
                recursiveMapRelationships(d.children)
            });
        }
    }
    recursiveMapRelationships(nullParents);
    return nullParents;
}
function containsObject(obj, list) { //Check if an array contains an object
    var i;
    for (i = 0; i < list.length; i++) {
        if (list[i] === obj) {
            return true;
        }
    }

    return false;
}