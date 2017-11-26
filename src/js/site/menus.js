/**
 *
 * Valikoihin liittyvä js. Koko sivustolla käytössä olevat tapahtumat.
 *
 */
$(document).ready(function(){
    $(".hamburger").click(function(){$(this).next(".dropdown").slideToggle();});

    //Aseta taittovalikot toimintakuntoon
    $(".controller-subwindow").hide()
    $(".subwindow-opener").click(function(){ 
        //Avaa tai sulje tarkemmat fonttien muokkaussäätimet ym
        $(this).next().slideToggle(); 
        $(this).toggleClass("opened");
    });

});
