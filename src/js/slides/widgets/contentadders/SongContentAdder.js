Slides = Slides || {};
Slides.Widgets = Slides.Widgets || {};
Slides.Widgets.ContentAdders = Slides.Widgets.ContentAdders || {};

/**
 *
 * Raamattusisällöt lisäävä widget
 *
 * @param Presentation parent_presentation Esitys, johon widgetit liitetään.
 * @param adderclass string css-luokka, josta widgetin sijainnin sivulla tunnistaa
 *
 */
Slides.Widgets.ContentAdders.SongContentAdder = function(parent_presentation) {

    Slides.Widgets.ContentAdder.call(this, parent_presentation);

    this.adderclass = ".songcontentadder";
    this.addedclass = "song";

    //Parametrit laulujen automaattista täydennystä varten:
    this.autocomp = {
        source : function(request, response){
            $.getJSON("php/loadsongs.php",
                {songname:request.term},
                response);
        },
        minLength : 0,
        select: (event, input) => this.CreateContent(input.item.value),
    }

    
    /**
     * Luo lauludia käyttäjän valinnan pohjalta
     *
     * @param string songname etsittävän laulun nimi (ainoastaan jos kutsuttu autocompletin select-parametrilla)
     *
     */
    this.CreateContent = function(songname){
        var $container = this.GiveContainer();
        var self=this;
        $(".songcontentadder .addtoprescontrols").hide();
        if(songname == undefined) songname = $("#songsearch").val();
        $.getJSON("php/loadsongs.php",
            {songname:songname,content:"yes"},
            function(data){
                if(data.verses != null){
                    $container.append(self.CreateTitleSlide(data.title));
                    //Säkeistöt
                    $.each(data.verses.split(/\n{2,}/),function(idx,verse){
                        $container.append("<article class='verse'><p> " + verse.replace(/\n/g,"\n<br>")  + "</p></article>")});
                    //Tallenna valmis data olion $loaded_content-parametriin
                    self.$loaded_content = $container;
                    $(".songcontentadder .addtoprescontrols").show();
                }
            });
    };

    /**
     * Luo laulun otsikkodia (sisältää mahdolliset tekijätiedot)
     */
    this.CreateTitleSlide = function(title, song, lyrics, translator){
        //Luo otsikko ja div mahdollisille metatiedoille
        var $slide = $("<article></article>").append("<h2>" + title + "</h2>").append("<div class='byline'></div>");
        if(song !== undefined) $slide.find(".byline").append("<div> Säv. " + song  + "</div>");
        if(lyrics !== undefined) $slide.find(".byline").append("<div> San. " + lyrics  + "</div>");
        if(translator !== undefined) $slide.find(".byline").append("<div> Suom. " + translator  + "</div>");
        return $slide;
    };

};

Slides.Widgets.ContentAdders.SongContentAdder.prototype = Object.create(Slides.Widgets.ContentAdder.prototype);
