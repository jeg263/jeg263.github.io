$(document).ready(function() {
    $('#fullpage').fullpage({
        sectionsColor: ['#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff'],
        anchors: ['home', 'gu272Timeline', 'pathways', 'gu272Demographics', 'gu272FamilyTrees'],
        menu: '#menu',
        scrollOverflow: true,
        autoScrolling: false,
    });
});
$(document).scroll(function() {
    var y = $(this).scrollTop();
    if (y >= $('#titlePage').height()) {
        $('#header').show();

        if (y < $('#titlePage').height() + $('#history').height()) {
            $('#heading-bar-subtitle').html("Timeline");
        }
        else if (y < $('#titlePage').height() + $('#history').height() + $('#pathwaysPage').height()) {
            $('#heading-bar-subtitle').html("Pathways");
        }
        else if (y < $('#titlePage').height() + $('#history').height() + $('#pathwaysPage').height() +  $('#demographicsPage').height()) {
            $('#heading-bar-subtitle').html("Demographics");
        }
        else {
            $('#heading-bar-subtitle').html("Family Tree");
        }
    } else {
        $('#header').hide();
    }
});
//    fitToSection: false,
//    scrollingSpeed: 1000,