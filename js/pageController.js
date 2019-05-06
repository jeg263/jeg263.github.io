// Scroll to section of timeline or to a page
function scrollToSection(type, id, action) {
    if (type == "timeline") {
        if (action == "click") {
            $('html, body').animate({
            scrollTop: $("#blank-" + id).offset().top
            }, 1000);
            $("#date-" + id).addClass("selected")
        }
        else if (action == "scroll") {
            if (id == 1) {
                if ($(".historic-map").hasClass("historic-map-selected")) {
                    $(".historic-map").removeClass("historic-map-selected")
                }
                $(".historic-map").addClass("active");
            }
            if (id > 2) {
                $(".historic-map").removeClass("active");
            }
            if (id == 2) {
                $(".historic-map").addClass("historic-map-selected")
            }
            if (id == 3 || id == 4) {
                $(".historic-map").fadeOut()
            }   
            $("#date-" + id).addClass("selected")
        }
    }
};

// Full page scroll 
$(document).ready(function() {
    $('#fullpage').fullpage({
        sectionsColor: ['#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff'],
        anchors: ['home', 'gu272History', 'gu272Passage','pathways', 'gu272Demographics', 'familyTreePage', 'routes', 'about'],
        menu: '#menu',
        scrollOverflow: true,
        autoScrolling: false,
    });

    //'gu272FamilyTrees' //'#ffffff'
});

//Hover event listener
$(".date").hover(
    function() {    //handlerIn
        $(this).css("opacity", "0.8");
        $(this.firstElementChild).css("display", "block");
    },          
    function() {    //handlerOut
        $(this).css("opacity", "0.5");
        $(this.firstElementChild).css("display", "none");
});

//Scroll event listener 
$(document).scroll(function() {
    // Change header subtitle on scroll
    var y = $(this).scrollTop();
    if (y >= $('#titlePage').height()) {
        $('#header').show();

        if (y < $('#titlePage').height() + $('#historyPage').height()) {
            $('#heading-bar-subtitle').html("History");
        }
        else if (y < $('#titlePage').height() + $('#historyPage').height() + $('#passagePage').height()) {
            $('#heading-bar-subtitle').html("Passage");
        }
        else if (y < $('#titlePage').height() + $('#historyPage').height() + 
            $('#passagePage').height() + $('#pathwaysPage').height()) {
            $('#heading-bar-subtitle').html("Pathways");
            // controller.forceReload();
        }
        else if (y < $('#titlePage').height() + $('#historyPage').height() + 
            $('#passagePage').height() + $('#pathwaysPage').height() + $('#demographicsPage').height()) {
            $('#heading-bar-subtitle').html("Demographics");
        }
        else if (y < $('#titlePage').height() + $('#historyPage').height() +
            $('#passagePage').height() + $('#pathwaysPage').height() + $('#demographicsPage').height() +
            $('#gu272familyTreesPage').height()) {
            $('#heading-bar-subtitle').html("Family Trees");
        }
        else if (y < $('#titlePage').height() + $('#historyPage').height() +
            $('#passagePage').height() + $('#pathwaysPage').height() + $('#demographicsPage').height() +
            $('#gu272familyTreesPage').height() + $('#newVizPage').height()) {
            $('#heading-bar-subtitle').html("Routes");
        }
        else {
            $('#heading-bar-subtitle').html("About");
        }
    } else {
        $('#header').hide();
    }

});