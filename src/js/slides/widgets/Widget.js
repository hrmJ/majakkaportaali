Slides = Slides || {};
Slides.Widgets = Slides.Widgets || {};

/**
 * Olio, josta kaikki esityksen hallintawidgetit periytyvät.
 *
 * @param Presentation parent_presentation Esitys, johon widgetit liitetään.
 * @param object loaded_content valmis ajax-ladattu sisältö
 *
 */
Slides.Widgets.Widget = function(parent_presentation){
    this.pres = parent_presentation;
    this.$loaded_content = undefined;
};

