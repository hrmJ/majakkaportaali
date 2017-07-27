/**
 *
 * Valikoihin liittyvä js.
 *
 */
$(document).ready(function(){
    $(".dropdown").hide();
    $(".hamburger").click(function(){$(this).next(".dropdown").slideToggle();});
});
