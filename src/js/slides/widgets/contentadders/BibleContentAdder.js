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
Slides.Widgets.ContentAdders.BibleContentAdder = function(parent_presentation){

    Slides.Widgets.ContentAdders.ContentAdder.call(this, parent_presentation);

    this.adderclass = ".biblecontentadder";
    this.addedclass = "bibletext";
    this.address =  {"start":{},"end":{}};

    /**
     * Luo tekstidia käyttäjän antaman inputin pohjalta
     */
    this.CreateContent = function(){
        return "";
    };


    /**
     *
     * Lataa kirjojen nimet tietokannasta (joka vanhasta tai uudesta testamentista)
     *
     * @param object $launcher jquery-elementti, joka tapahtuman laukaisi (joko radiobuttonit tai lista)
     *
     */
    this.LoadBooknames = function($launcher){
        if($launcher.get(0).tagName=="SELECT" && $(".book:eq(0)").children().length<5){
            alert("Valitse ensin vanha tai uusi testamentti.");
        }
        else if($launcher.attr("name")=="testament"){
            //Lataa kirjojen nimet select-elementtiin
            $(".book option:gt(0)").remove();
            $.getJSON("php/loadbibleverses.php",{"testament":$("[name='testament']:checked").val()},
                function(data){
                    $.each(data, function(idx,bookname){$("<option></option>").text(bookname).appendTo(".book") } )});
            //Poista vanhat luvut ja jakeet
            $(".book, .chapter, .verse").find("option:gt(0)").remove();
        }
    };

    /**
     * Lataa kappaleiden tai jakeiden lukumäärä valitun kirjan nimen / kappaleen perusteella
     *
     *
     * @param object launcher toiminnon laukaissut kirjanvalitsin
     *
     */
    this.PreLoad = function($launcher){
        //etsi seuraava select-elementti
        var self = this;
        var $selectparent = $launcher.parents(".verseselector");
        var $subselect = $launcher.parent().next().find("select")
        if($subselect.length>0) $subselect.find("option:gt(0)").remove();

        var params = {"testament": $("[name='testament']:checked").val(),
                      "book": $selectparent.find(".book").val(),
                      "chapter": $selectparent.find(".chapter").val(),
                      "verse": $selectparent.find(".verse").val()};

        //Jos haetaan ylemmän tason elementtejä, poista oliosta alemman tason muuttujat
        if($launcher.hasClass("book") || $launcher.hasClass("chapter")) delete params.verse;
        if($launcher.hasClass("book")) delete params.chapter;

        $.getJSON("php/loadbibleverses.php",params, function(data){
                if($launcher.hasClass("verse")){ 
                    self.ShowVersePreview($selectparent, data);
                    self.CreateTitle();
                    self.LoadContent();
                }
                else{
                    $.each(data, function(idx,chapter){$("<option></option>").text(chapter).appendTo($subselect) });
                    $subselect.parent().next().find("select option:gt(0)").remove();
                }
        });

    };

    /**
     * Näyttää pienen esikatseluikkunan siitä Raamatun jakeesta, joka valittu
     *
     * @param  object $selectparent se elementti, jonka lapsena käytetty jakeen valitsin on
     * @param  array data ajax-kyselyn palauttama taulukko jakeista
     *
     */
    this.ShowVersePreview = function($selectparent,data){
            //Näytä jakeen esikatselu ja tee siitä klikkauksella poistettava
            $selectparent.find(".versepreview").text(data[0]).fadeIn().click(function(){$(this).fadeOut()});
            if($selectparent.hasClass("startverse") && $selectparent.find(".between-verse-selectors").is(":hidden")){
                $selectparent.find(".between-verse-selectors").slideDown("slow");
                $selectparent.find(".verseselector").text(data[0]).fadeIn().click(function(){$(this).fadeOut()});
                //Lisää viimeisen jakeen valitsin
                var $endverseselectors = $selectparent.clone(true).insertAfter($selectparent);
                $endverseselectors.find(".between-verse-selectors").remove();
                //Kopioi lähtöjakeen osoite loppujakeeseen
                $selectparent.find("select").each(function(){
                    $endverseselectors.find("." + $(this).attr("class")).val($(this).val());
                })
                $(".verseselector:eq(1)").removeClass("startverse").addClass("endverse");
            }
    };

    /**
     * Merkitse muistiin Raamatunkohdan alku- ja loppukohta
     */
    this.UpdateAddress = function(){
        var self = this;
        $(".startverse select").each(function(){ self.address.start[$(this).attr("class")] = $(this).val()});
        $(".endverse select").each(function(){ self.address.end[$(this).attr("class")] = $(this).val()});
    };

    /**
     * Luo jquery-elementti, joka syötetään Raamatunkohdan otsikoksi
     */
    this.CreateTitle = function(){
        var self = this;
        var addresstext = "";
        this.UpdateAddress();
        $.each(this.address.start, function(key,val){
            var sep = key == "chapter" ? ":" : " ";
            addresstext += val + sep; });
        addresstext = addresstext.trim();

        if (!(self.address.start.book == self.address.end.book && 
            self.address.start.chapter == self.address.end.chapter && 
            self.address.start.verse == self.address.end.verse)){
                //Jos ei sama alku- ja loppujae
                if (self.address.start.chapter == self.address.end.chapter){
                    //Jos sama luku
                    addresstext += "-" + self.address.end.verse;
                }
                else{
                    //Jos eri luku
                    addresstext += "-" + self.address.end.chapter  + ":"  + self.address.end.verse;
                }
            }
        this.$title = $("<h2></h2>").text(addresstext);
        };

    /**
     * Lataa varsinainen raamattusisältö
     */
    this.LoadContent = function(){
        var self = this;
        $(".biblecontentadder .addtoprescontrols").hide()
        var params = {"testament": $("[name='testament']:checked").val(),
                      "startbook": this.address.start.book,
                      "endbook": this.address.end.book,
                      "startchapter": this.address.start.chapter,
                      "endchapter": this.address.end.chapter,
                      "startverse": this.address.start.verse,
                      "endverse": this.address.end.verse};

        $.getJSON("php/loadbibleverses.php",params, function(data){
            self.$loaded_content = self.GiveContainer();
            var $segment = $("<article class='bibleverse'></article>");
            $segment.append(self.$title);
            console.log(self.$title);
            for(idx=0;idx<data.length;idx++){
                //Pilko kahden jakeen mittaisiksi dioiksi, mutta laita otsikko ja eka jae samaan
                if((idx + 1 )% 2 > 0 && idx > 0){
                    self.$loaded_content.append($segment);
                    //Jos ei vika jae, luo uusi dia
                    if(idx<data.length) var $segment = $("<article class='bibleverse'></article>");
                }
                $("<p></p>").text(data[idx]).appendTo($segment);
            }
            //Jos jakeita on pariton määrä, lisää viimeinen. Muussa tapauksessa
            if((data.length -1) % 2 > 0 || data.length==1) self.$loaded_content.append($segment);
            else{
                var $slide = $("<article class='bibleverse'></article>");
                $slide.append($("<p></p>").text(data[data.length-1]));
                $slide.appendTo(self.$loaded_content);
            }

            //Kun kaikki valmista, palauta sisällön lisäämisvaihtoehdot näkyviin
            $(".biblecontentadder .addtoprescontrols").show()
        });
    };

} 

Slides.Widgets.ContentAdders.BibleContentAdder.prototype = Object.create(Slides.Widgets.ContentAdders.ContentAdder.prototype);
