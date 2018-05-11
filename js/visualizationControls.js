var controller = {};
//catherine Jackson
function controllerMain() {
    var showChord = true;
    var showMap = false;
    var selectPersonSearchTerm = "";
    var familySearchTerm = "";
    var ageSearchTerm = "";
    var showSidebar = true;
    var ageFilterOption = "greaterThan";
    var plantationFilterOption = "any";
    var buyerFilterOption = "any";
    var genderFilterOption = "any";
    var filterKatharineJackson = false;
    var searchWithinFilterConditions = false;
    //filter control actions
    $(function(){
        // var showChord = true;
        // var showMap = false;
        // var familySearchTerm = "";
        // selectPersonSearchTerm = "";
        // var ageSearchTerm = "";
        // var showSidebar = true;
        // var ageFilterOption = "greaterThan";
        // var plantationFilterOption = "any";
        // var buyerFilterOption = "any";
        // var genderFilterOption = "any";
        // var filterKatharineJackson = false;
        // var searchWithinFilterConditions = false;

//         var tour = new Tour({
//             steps: [
//                 {
//                     element: "#rightButton",
//                     title: "Exam Enrolment",
//                     content: "First let's enrol to an exam"
//                 }
//             ],
//
//             // backdrop: true,
//             // storage: false
//         });
//
// // Clear session data
//         localStorage.clear();
//
// // Initialize the tour
//         tour.init();
//
// // Start the tour
//         tour.start();

        $("#selectButton").click(function(result){
            var personData = chord.getAllData().filter(function(data) {
                if (data.data.full_name.substr(data.data.full_name.indexOf(" ") + 1) === selectPersonSearchTerm)
                    return true;
                return false;
            });
            if (personData && personData.length > 0)
                controller.selectEnslavedPerson(personData[0].data);
            else
                controller.deselectEnslavedPerson();
        });
        $("#familyButton").click(function(result){
            controller.deselectEnslavedPerson();
            var combinedFilter = getCombinedFilter();
            chord.refreshVisualization(combinedFilter);
            updateFilterConditionsForSelect();

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
            // if (enjoyhint_instance)
            //     enjoyhint_instance.trigger('next');
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
            // chord.multiplier = 0.9;
            selectPersonSearchTerm = "";
            familySearchTerm = "";
            ageSearchTerm = "";
            ageFilterOption = "greaterThan";
            plantationFilterOption = "any";
            buyerFilterOption = "any";
            genderFilterOption = "any";
            filterKatharineJackson = false;
            $("#inputAge").val("");
            $("#inputFamily").val("");
            $("#selectPerson").val("");
            $("#dropdownBuyerButton").html("Any");
            $("#dropdownGenderButton").html("Any");
            $("#dropdownMenuButton").html("Greater than");
            $("#dropdownPlantationButton").html("Any");

            controller.deselectEnslavedPerson();
            var combinedFilter = getCombinedFilter();
            chord.refreshVisualization(combinedFilter);
            updateFilterConditionsForSelect();

        });
        $('#inputAge').keyup(function(){
            ageSearchTerm = $("#inputAge").val();
        });
        $('#inputAge').change(function() {
            ageSearchTerm = $("#inputAge").val();
            updateFilterConditionsForSelect();
        });
        $('#inputFamily').keyup(function(){
            familySearchTerm = $("#inputFamily").val();
        });
        $('#inputFamily').change(function() {
            familySearchTerm = $("#inputFamily").val();
            updateFilterConditionsForSelect();
        });
        $('#selectPerson').keyup(function(){
            selectPersonSearchTerm = $("#selectPerson").val();
        });
        $('#selectPerson').change(function() {
            selectPersonSearchTerm = $("#selectPerson").val();
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
            updateFilterConditionsForSelect();
        });
        $('#dropdownOptionGreaterThan').click(function () {
            ageFilterOption = "greaterThan";
            $("#dropdownMenuButton").html("Greater than");
            updateFilterConditionsForSelect();
        });
        $('#dropdownOptionLessThan').click(function () {
            ageFilterOption = "lessThan";
            $("#dropdownMenuButton").html("Less than");
            updateFilterConditionsForSelect();
        });
    //    Dropdown Plantation
        $('#dropdownOptionAnyPlantation').click(function () {
            plantationFilterOption = "any";
            $("#dropdownPlantationButton").html("Any");
            updateFilterConditionsForSelect();
        });
        $('#dropdownOptionWhiteMarsh').click(function () {
            plantationFilterOption = "White Marsh";
            $("#dropdownPlantationButton").html("White Marsh");
            updateFilterConditionsForSelect();
        });
        $('#dropdownOptionThomasMonor').click(function () {
            plantationFilterOption = "St. Thomas's Manor";
            $("#dropdownPlantationButton").html("St. Thomas's Manor");
            updateFilterConditionsForSelect();
        });
        $('#dropdownOptionSInigoes').click(function () {
            plantationFilterOption = "St. Inigoes";
            $("#dropdownPlantationButton").html("St. Inigoes");
            updateFilterConditionsForSelect();
        });
        $('#dropdownOptionNewtown').click(function () {
            plantationFilterOption = "Newtown";
            $("#dropdownPlantationButton").html("Newtown");
            updateFilterConditionsForSelect();
        });
    //    Dropdown Buyer
        $('#dropdownOptionAnyBuyer').click(function () {
            buyerFilterOption = "any";
            $("#dropdownBuyerButton").html("Any");
            updateFilterConditionsForSelect();
        });
        $('#dropdownOptionJBatey').click(function () {
            buyerFilterOption = "Jesse Batey";
            $("#dropdownBuyerButton").html("Jesse Batey");
            updateFilterConditionsForSelect();
        });
        $('#dropdownOptionHJohnson').click(function () {
            buyerFilterOption = "Henry Johnson";
            $("#dropdownBuyerButton").html("Henry Johnson");
            updateFilterConditionsForSelect();
        });
        $('#dropdownOptionOtherBuyer').click(function () {
            buyerFilterOption = "";
            $("#dropdownBuyerButton").html("Other");
            updateFilterConditionsForSelect();
        });
    //    Gender
        $('#dropdownOptionAnyGender').click(function () {
            genderFilterOption = "any";
            $("#dropdownGenderButton").html("Any");
            updateFilterConditionsForSelect();
        });
        $('#dropdownOptionMale').click(function () {
            genderFilterOption = "male";
            $("#dropdownGenderButton").html("Male");
            updateFilterConditionsForSelect();
        });
        $('#dropdownOptionFemale').click(function () {
            genderFilterOption = "female";
            $("#dropdownGenderButton").html("Female");
            updateFilterConditionsForSelect();
        });
    //    Katerine Jackson checkbox
        $('#katharineJacksonCheck').click(function() {
            filterKatharineJackson = !filterKatharineJackson;
            updateFilterConditionsForSelect();
        });
        $( "#katharineJacksonCheck" ).prop( "checked", filterKatharineJackson );
    //    Search Filter Conditions
        $('#searchWithinFilterConditionsCheck').click(function() {
            searchWithinFilterConditions = !searchWithinFilterConditions;
            updateFilterConditionsForSelect();
        });
        $( "#searchWithinFilterConditionsCheck" ).prop( "checked", searchWithinFilterConditions );
        chord.magnifyNamesConditionBox = true;
        $('#magnifyNamesConditionBox').click(function() {
            chord.magnifyNamesConditionBox = !chord.magnifyNamesConditionBox;
        });
        $( "#magnifyNamesConditionBox" ).prop( "checked", chord.magnifyNamesConditionBox );
    });
    function getCombinedFilter() {
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
        return combinedFilter;
    }
    function updateFilterConditionsForSelect() {
        csvData = csvJSON(chord.originalData).map(function(p) {p.id = Number(p.id); return p;});

        var combinedFilter = getCombinedFilter();

        if (searchWithinFilterConditions && combinedFilter) {
            csvData.filter(combinedFilter);
            var names = csvData.filter(combinedFilter).map(function(p) {return p.full_name});
            $("#selectPerson").typeahead('destroy').typeahead({ source:names });
        }
        else {
            // csvData = csvJSON(chord.originalData).map(function(p) {p.id = Number(p.id); return p;});
            var names = csvData.map(function(p) {return p.full_name});
            $("#selectPerson").typeahead('destroy').typeahead({ source:names });
        }
    }
    function setFilterControlVariables() {
        //typeahead family filter
        csvData = csvJSON(chord.originalData).map(function(p) {p.id = Number(p.id); return p;});
        var names = csvData.map(function(p) {return p.full_name});
        $("#inputFamily").typeahead({ source:names });

        //show otherData checkbox
        $( "#otherCheckbox" ).prop( "checked", chord.showOtherData );
        updateFilterConditionsForSelect();
    }
    controller.onDataLoad = function() {
        d3v2.select("#mapContainer").classed("hidden", true);
        d3v2.select("#mapContainer").classed("opacity0", true);
        family.processFamilyData();
        setFilterControlVariables();
    };
    controller.selectEnslavedPerson = function(personData) {
        // if (enjoyhint_instance)
        //     enjoyhint_instance.trigger('next');
        var name = personData.full_name.substr(personData.full_name.indexOf(" ") + 1);
        selectPersonSearchTerm = name;
        $("#selectPerson").val(name);
        mapData.mapDestinationPlantation = personData.destination;
        mapData.mapSourcePlantation = personData.origin;
        mapData.updateMap();
        chord.selectNodeWithData(personData);
    };
    controller.deselectEnslavedPerson = function() {
        $("#selectPerson").val("");
        mapData.mapDestinationPlantation = "";
        mapData.mapSourcePlantation = "";
        mapData.updateMap();
        chord.deselectAllNodes();
    };
    controller.didUpdateMultiplier = function () {
        $(document).ready(function() {
            document.getElementById("multiplierRange").value = chord.multiplier * 100;
        });
    };
}
controllerMain();