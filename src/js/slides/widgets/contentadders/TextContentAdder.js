Slides = Slides || {};
Slides.Widgets = Slides.Widgets || {};
Slides.Widgets.ContentAdders = Slides.Widgets.ContentAdders || {};

/**
 *
 * Tekstidian lisäävä widget
 *
 * @param Presentation parent_presentation Esitys, johon widgetit liitetään.
 * @param string adderclass sisällön lisävän widgetin css-luokka
 * @param string addedclass itse sisällön css-luokka
 *
 */
Slides.Widgets.ContentAdders.TextContentAdder = function(parent_presentation){

    Slides.Widgets.ContentAdder.call(this, parent_presentation);

    this.adderclass = ".textcontentadder";
    this.addedclass = "addedcontent";

    /**
     * Luo tekstidia käyttäjän antaman inputin pohjalta
     */
    this.CreateContent = function(){
        var $content = $("<article class='added-text'></article>").text($(".textcontentadder textarea").val());
        this.$loaded_content =  this.GiveContainer().append($content);
    };

}

Slides.Widgets.ContentAdders.TextContentAdder.prototype = Object.create(Slides.Widgets.ContentAdder.prototype);
