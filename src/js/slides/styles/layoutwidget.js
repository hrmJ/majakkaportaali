/**
 * Olio, josta kaikki esityksen tyylinhallintawidgetit periytyvät.
 * Perii Itse ContentAdder-widgetistä
 *
 * @param Presentation parent_presentation Esitys, johon widgetit liitetään.
 *
 */
var LayoutWidget = function(parent_presentation){
    this.pres = parent_presentation;
    //jos luokalla on oma InitializeEvents-metodinsa, käynnistä se.
    if(this.hasOwnProperty("InitializeEvents"))
        this.InitializeEvents();
};

LayoutWidget.prototype = {
    defaults:{},
};

extend(ContentAdder, LayoutWidget);
