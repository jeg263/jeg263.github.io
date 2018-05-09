var controller = {};
//catherine Jackson
function controllerMain() {
    //filter control actions
    $(function(){
        var showChord = true;
        var showMap = false;
        var familySearchTerm = "";
        var ageSearchTerm = "";
        var showSidebar = true;
        var ageFilterOption = "greaterThan";
        var plantationFilterOption = "any";
        var buyerFilterOption = "any";
        var genderFilterOption = "any";
        var filterKatharineJackson = false;
        var searchWithinFilterConditions = false;

        $("#familyButton").click(function(result){
            controller.deselectEnslavedPerson();

            var ageFilter = function (p) {
                if (ageSearchTerm === "")
                    return true;
                else {
                    if (p.age !== "") {
                        if (ageFilterOption === "greaterThan")
                            return Number(p.age) > Number(ageSearchTerm);
                        else if (ageFilterOption === "lessThan")
                            return Number(p.age) < Number(ageSearchTerm);
                        else
                            return Number(p.age) === Number(ageSearchTerm);
                    }
                    else
                        return false;
                }
            };
            var genderFilter = function (p) {
                if (genderFilterOption === "any")
                    return true;
                else {
                    return p.gender === genderFilterOption;
                }
            };
            var buyerFilter = function (p) {
              if (buyerFilterOption === "any")
                  return true;
              else
                  return p.buyer_name === buyerFilterOption;
            };
            var plantationFilter = function (p) {
                if (plantationFilterOption === "any")
                    return true;
                else
                    return p.farm_name === plantationFilterOption;
            };

            //Family filter
            var familyCSVData = csvJSON(chord.originalData).map(function(p) {p.id = Number(p.id); return p;});
            var familyIds = (familyCSVData.filter(function (p) { return p.full_name === familySearchTerm }))[0];
            var familyArray = (familyIds) ? family.findFamilySetForId(familyIds.id) : [];

            var directFamilyLineFilter = function (p) {
                return (familyArray.length > 0 && familySearchTerm !== "") ? containsObject(p.id, familyArray) : true;
            };

            var combinedFilter = function (p) {
                return ageFilter(p) && genderFilter(p) && directFamilyLineFilter(p) && buyerFilter(p) && plantationFilter(p);
            };
            chord.refreshVisualization(combinedFilter);

            // if (familyArray.length > 0) {
            //     var directFamilyLineFilter = function (p) {
            //         return containsObject(p.id, familyArray) };
            //     chord.refreshVisualization(directFamilyLineFilter); }
            // else if (textValue === "")
            //     chord.refreshVisualization(null, true);
            // else
            //     chord.refreshVisualization(null);
        });
        $("#chordSelector").change(function(result){
            showChord = true;
            showMap = false;
            showHidePanels();
        });
        $("#mapSelector").change(function(result){
            showChord = false;
            showMap = true;
            showHidePanels();
        });
        $("#familySelector").change(function(result){
            showChord = false;
            showMap = false;
            showHidePanels();
        });
        function showHidePanels() {
            d3v2.select("#bundle").classed("hidden", !showChord);
            d3v2.select("#mapContainer").classed("hidden", !showMap);
            d3v2.select("#mapContainer").classed("opacity0", false);

            d3v2.select("#chordControlsContainer").classed("hidden", !showChord);
        }
        $('#move-button').mousedown(function() {
            showSidebar = !showSidebar;
            d3v2.select("#left-container").classed("stage-shrink", showSidebar);
            d3v2.select("#right-container").classed("stage-open", showSidebar);
            d3v2.select("#left-container").classed("stage-grow", !showSidebar);
            d3v2.select("#right-container").classed("stage-close", !showSidebar);

            d3v2.select("#rightButton").classed("open-button", showSidebar);
            d3v2.select("#leftButton").classed("open-button", !showSidebar);
        d3v2.select("#rightButton").classed("close-button", !showSidebar);
        d3v2.select("#leftButton").classed("close-button", showSidebar);

            // if (showSidebar) {
            //
            // else {
            //     d3v2.select("#rightButton").attr("display", "none !important");
            //     d3v2.select("#leftButton").attr("display", "block !important");
            // }
        });
        $('#otherCheckbox').click(function() {
            chord.showOtherData = !chord.showOtherData;
            chord.refreshVisualization(null, true);
        });
        $("#resetButton").click(function () {
            chord.multiplier = 0.9;
            chord.refreshVisualization(null, true);
        });
        $('#inputAge').keyup(function(){
            ageSearchTerm = $("#inputAge").val();
        });
        $('#inputAge').change(function() {
            ageSearchTerm = $("#inputAge").val();
        });
        $('#inputFamily').keyup(function(){
            familySearchTerm = $("#inputFamily").val();
        });
        $('#inputFamily').change(function() {
            familySearchTerm = $("#inputFamily").val();
        });
        d3v2.select("input[type=range]").on("change", function() {
            chord.multiplier = this.value / 100;
            chord.refreshVisualization(null);
        });
        $(".diagram-container-right").css({
            'height': ($(".diagram-container").height() + 'px')
        });
    //    Dropdown Age
        $('#dropdownOptionEquals').click(function () {
            ageFilterOption = "equals";
            $("#dropdownMenuButton").html("Equals");
        });
        $('#dropdownOptionGreaterThan').click(function () {
            ageFilterOption = "greaterThan";
            $("#dropdownMenuButton").html("Greater than");
        });
        $('#dropdownOptionLessThan').click(function () {
            ageFilterOption = "lessThan";
            $("#dropdownMenuButton").html("Less than");
        });
    //    Dropdown Plantation
        $('#dropdownOptionAnyPlantation').click(function () {
            plantationFilterOption = "any";
            $("#dropdownPlantationButton").html("Any");
        });
        $('#dropdownOptionWhiteMarsh').click(function () {
            plantationFilterOption = "White Marsh";
            $("#dropdownPlantationButton").html("White Marsh");
        });
        $('#dropdownOptionThomasMonor').click(function () {
            plantationFilterOption = "St. Thomas's Manor";
            $("#dropdownPlantationButton").html("St. Thomas's Manor");
        });
        $('#dropdownOptionSInigoes').click(function () {
            plantationFilterOption = "St. Inigoes";
            $("#dropdownPlantationButton").html("St. Inigoes");
        });
        $('#dropdownOptionNewtown').click(function () {
            plantationFilterOption = "Newtown";
            $("#dropdownPlantationButton").html("Newtown");
        });
    //    Dropdown Buyer
        $('#dropdownOptionAnyBuyer').click(function () {
            buyerFilterOption = "any";
            $("#dropdownBuyerButton").html("Any");
        });
        $('#dropdownOptionJBatey').click(function () {
            buyerFilterOption = "Jesse Batey";
            $("#dropdownBuyerButton").html("Jesse Batey");
        });
        $('#dropdownOptionHJohnson').click(function () {
            buyerFilterOption = "Henry Johnson";
            $("#dropdownBuyerButton").html("Henry Johnson");
        });
        $('#dropdownOptionOtherBuyer').click(function () {
            buyerFilterOption = "";
            $("#dropdownBuyerButton").html("Other");
        });
    //    Gender
        $('#dropdownOptionAnyGender').click(function () {
            genderFilterOption = "any";
            $("#dropdownGenderButton").html("Any");
        });
        $('#dropdownOptionMale').click(function () {
            genderFilterOption = "male";
            $("#dropdownGenderButton").html("Male");
        });
        $('#dropdownOptionFemale').click(function () {
            genderFilterOption = "female";
            $("#dropdownGenderButton").html("Female");
        });
    //    Katerine Jackson checkbox
        $('#katharineJacksonCheck').click(function() {
            filterKatharineJackson = !filterKatharineJackson;
        });
        $( "#katharineJacksonCheck" ).prop( "checked", filterKatharineJackson );
    //    Search Filter Conditions
        $('#searchWithinFilterConditionsCheck').click(function() {
            searchWithinFilterConditions = !searchWithinFilterConditions;
        });
        $( "#searchWithinFilterConditionsCheck" ).prop( "checked", searchWithinFilterConditions );
    });
    function setFilterControlVariables() {
        //typeahead family filter
        csvData = csvJSON(chord.originalData).map(function(p) {p.id = Number(p.id); return p;});
        var names = csvData.map(function(p) {return p.full_name});
        $(".typeahead").typeahead({ source:names });

        //show otherData checkbox
        $( "#otherCheckbox" ).prop( "checked", chord.showOtherData );
    }
    controller.onDataLoad = function() {
        d3v2.select("#mapContainer").classed("hidden", true);
        d3v2.select("#mapContainer").classed("opacity0", true);
        family.processFamilyData();
        setFilterControlVariables();
    };
    controller.selectEnslavedPerson = function(personData) {
        var name = personData.full_name.substr(personData.full_name.indexOf(" ") + 1);
        $("#selectPerson").val(name);
        mapData.mapDestinationPlantation = personData.destination;
        mapData.mapSourcePlantation = personData.origin;
        mapData.updateMap();
        chord.selectNodeWithData(personData);
    };
    controller.deselectEnslavedPerson = function() {
        mapData.mapDestinationPlantation = "";
        mapData.mapSourcePlantation = "";
        mapData.updateMap();
        chord.deselectAllNodes();
    }
}
controllerMain();