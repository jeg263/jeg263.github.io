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