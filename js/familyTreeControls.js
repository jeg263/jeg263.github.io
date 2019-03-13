var familyTreeController = {};
//chord
//family
//familyData
//catherine Jackson
function familyTreeControllerMain() {
    var familySearchTerm = "";
    var selectPersonSearchTerm = "";
    var familySearchTerm = "";
    var searchWithinFilterConditions = false;

    $(function(){
        function getCombinedFilter() { //build filter for data based on options on right side

            var directFamilyLineFilter = function (p) {
                //Family filter
                var familyCSVData = csvJSON(chord.originalData).map(function(p) {p.id = Number(p.id); return p;});
                var familyIds = (familyCSVData.filter(function (p) { return p.last_name === familySearchTerm }))[0];
                var familyArray = (familyIds) ? family2.findFamilySetForId(familyIds.id) : [];


                return (familyArray && familyArray.length > 0 && familySearchTerm !== "") ? containsObject("" + p.id, familyArray) : true;
            };
            return directFamilyLineFilter;
        }

        $('#inputFamilyTree').keyup(function(){
            familySearchTerm = $("#inputFamilyTree").val(); //get family filter characters as typed
        });
        $('#inputFamilyTree').change(function() {
            familySearchTerm = $("#inputFamilyTree").val(); //get family filter as typed
            updateFilterConditionsForSelect();
        });
        $("#resetButtonTree").click(function () { //set all variables (except multiplier)
            // chord.multiplier = 0.9;
            selectPersonSearchTerm = "";
            familySearchTerm = "";

            $("#inputFamilyTree").val("");
            $("#selectPersonTree").val("");

            familyTreeController.deselectEnslavedPerson(); //de-select person and reset data
            var combinedFilter = getCombinedFilter();
            // chord.refreshVisualization(combinedFilter);
            updateFilterConditionsForSelect();

        });
        $('#selectPersonTree').keyup(function(){
            selectPersonSearchTerm = $("#selectPersonTree").val(); //get name of person to select as typed
        });
        $('#selectPersonTree').change(function() {
            selectPersonSearchTerm = $("#selectPersonTree").val(); //get name of person to select as typed
        });
        $("#familyButtonTree").click(function(result){ //filter results
            familyTreeController.deselectEnslavedPerson(); //deselect first
            var combinedFilter = getCombinedFilter(); //build filter
            // chord.refreshVisualization(combinedFilter); //refresh visualization using filter
            updateFilterConditionsForSelect(); //Update filter conditions
            if (familySearchTerm) {
                var personData = chord.getAllData().filter(function(data) { //find selected person
                    if (data.data.last_name === familySearchTerm)
                        return true;
                    return false;
                });
                if (personData && personData.length > 0) {
                    var indexOfPersonToFilter = 0;

                    for (i = 0; i < personData.length; i++) {
                        if (personData[i].data.father_id !== "" || personData[i].data.mother_id !== "") {
                            indexOfPersonToFilter = i;
                            break;
                        }
                    }
                    family2.refreshTreeWIthSelectedPerson(personData[indexOfPersonToFilter].data, true);
                }
                // controller.selectEnslavedPerson(personData[0].data); //select person
                // // if (enjoyhint_instance)
                // //     enjoyhint_instance.trigger('next');
                // var name = personData.full_name.substr(personData.full_name.indexOf(" ") + 1); //get persons name to set to text of input
                // selectPersonSearchTerm = name;
                // $("#selectPerson").val(name);
                // mapData.mapDestinationPlantation = personData.destination; //get data based on selection
                // mapData.mapSourcePlantation = personData.origin;
                // mapData.updateMap(); //update map
                // chord.selectNodeWithData(personData); //update roots wheel
                // family.refreshTreeWIthSelectedPerson(personData);
            }
        });
        function updateFilterConditionsForSelect() { //on filter conditions update - reset names for autocompletes and reset all input variables to be ""
            csvData = csvJSON(chord.originalData).map(function(p) {p.id = Number(p.id); return p;});

            var combinedFilter = getCombinedFilter();

            if (searchWithinFilterConditions && combinedFilter) {
                csvData.filter(combinedFilter);
                var names = csvData.filter(combinedFilter).map(function(p) {return p.full_name});
                $("#selectPersonTree").typeahead('destroy').typeahead({ source:names });
            }
            else {
                // csvData = csvJSON(chord.originalData).map(function(p) {p.id = Number(p.id); return p;});
                var names = csvData.map(function(p) {return p.full_name});
                $("#selectPersonTree").typeahead('destroy').typeahead({ source:names });
            }
        }
        familyTreeController.selectEnslavedPerson = function(personData) { //select person
            // if (enjoyhint_instance)
            //     enjoyhint_instance.trigger('next');
            var name = personData.full_name.substr(personData.full_name.indexOf(" ") + 1); //get persons name to set to text of input
            selectPersonSearchTerm = name;
            $("#selectPersonTree").val(name);
            // mapData.mapDestinationPlantation = personData.destination; //get data based on selection
            // mapData.mapSourcePlantation = personData.origin;
            // mapData.updateMap(); //update map
            // chord.selectNodeWithData(personData); //update roots wheel
            family2.refreshTreeWIthSelectedPerson(personData);
        };
        familyTreeController.deselectEnslavedPerson = function() {
            $("#selectPersonTree").val(""); //undo all data and update visualizations
            // mapData.mapDestinationPlantation = "";
            // mapData.mapSourcePlantation = "";
            // mapData.updateMap();
            // chord.deselectAllNodes();
            family2.refreshTreeWIthSelectedPerson(null);
        };
        $("#selectButtonTree").click(function(result){ //triggered when selecting a person
            var personData = chord.getAllData().filter(function(data) { //find selected person
                if (data.data.full_name.substr(data.data.full_name.indexOf(" ") + 1) === selectPersonSearchTerm)
                    return true;
                return false;
            });
            if (personData && personData.length > 0)
                familyTreeController.selectEnslavedPerson(personData[0].data); //select person
            else
                familyTreeController.deselectEnslavedPerson(); //if person doesn't exist deselect
        });


        function setFilterControlVariables() { //set intial filter variables
            //typeahead family filter
            csvData = csvJSON(chord.originalData).map(function(p) {p.id = Number(p.id); return p;});
            var names = csvData.map(function(p) {return p.last_name}).reduce(function(p,c,i,a){
                if (p.indexOf(c) == -1) p.push(c);
                else p.push('')
                return p;
            }, []);
            names = names.filter(function (d) {
                if (d !== "")
                    return true;
                else
                    return false;
            })
            $("#inputFamilyTree").typeahead({ source:names });

            updateFilterConditionsForSelect();
        }
        familyTreeController.onDataLoad = function() { //on data load for first time hide map and get family data
            // d3v2.select("#mapContainer").classed("hidden", true);
            // d3v2.select("#mapContainer").classed("opacity0", true);
            family2.processFamilyData();
            setFilterControlVariables();
        };
    });
}
familyTreeControllerMain();