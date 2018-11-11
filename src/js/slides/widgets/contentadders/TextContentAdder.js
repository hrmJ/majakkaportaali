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
    this.addedclass = "Teksti";

    /**
     * Luo tekstidia käyttäjän antaman inputin pohjalta
     */
    this.CreateContent = function(){
        var text = $(".textcontentadder textarea").val(),
            $content = $(`
                <input class='slot_name' type='hidden' value='${text.substr(0,50)}'></input>
                <article class='added-text'>
                    <p>
                        ${text}
                    </p>
                </article>
                `);
        this.$loaded_content =  this.GiveContainer().append($content);
    };

}

Slides.Widgets.ContentAdders.TextContentAdder.prototype = Object.create(Slides.Widgets.ContentAdder.prototype);
