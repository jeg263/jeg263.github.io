//Helper functions
String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.split(search).join(replacement);
};
function cleanName(name) {
    return name.replaceAll(".", "").replaceAll(" ", "").replaceAll("\'", "").replaceAll("?", "").replaceAll("[", "").replaceAll("]", "");
}
function cleanDataLine(obj) {
    obj.origin = cleanName(obj.farm_name);
    // obj.id = cleanName(obj.full_name) + obj.id;
    obj.destination = cleanName(obj.buyer_name);
    return obj;
}
function csvJSON(csv){
    var lines = csv.split("\n")
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

    return result // JavaScript object
}
function containsObject(obj, list) {
    var i;
    for (i = 0; i < list.length; i++) {
        if (list[i] === obj) {
            return true;
        }
    }

    return false;
}