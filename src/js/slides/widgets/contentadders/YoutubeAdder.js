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
Slides.Widgets.ContentAdders.YoutubeAdder = function(parent_presentation){

    Slides.Widgets.ContentAdder.call(this, parent_presentation);

    this.adderclass = ".youtubeadder";
    this.addedclass = "addedcontent";

    /**
     *
     * Luo youtubedian.
     *
     */
    this.CreateContent = function(){
        var url = $('#youtubeadder_url').val().replace("watch?v=","embed/");
        this.$loaded_content = $(`
            <section class='infocontent Teksti'>
                <article class=''>
                    <input type='hidden' value='Youtube-video'>
                        <iframe width="560" height="315" src="${url}" 
                        frameborder="0" allow="autoplay; encrypted-media" 
                        allowfullscreen></iframe>
                </article>
            </section>
            `)
    };

}

Slides.Widgets.ContentAdders.YoutubeAdder.prototype = Object.create(Slides.Widgets.ContentAdder.prototype);
