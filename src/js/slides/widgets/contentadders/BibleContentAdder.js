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

    Slides.Widgets.ContentAdder.call(this, parent_presentation);

    this.adderclass = ".biblecontentadder";
    this.addedclass = "bibletext";
    this.addedclass2 = "Raamattudia";
    this.address =  {"start":{},"end":{}};

    /**
     *
     * Alustaa toiminnallisuuden 
     *
     */
    this.Initialize = function(){
        this.pickerpair = new BibleModule.PickerPair();
        this.pickerpair.SetAsSingle().SetCallBack(this.LoadContent.bind(this));
        this.pickerpair.Initialize($("#biblepicker"));
        $(".biblecontentadder .addtoprescontrols").hide().insertAfter("#biblepicker");
        $(".biblecontentadder .pickerpair_controls").show();
    };

    /**
     * Luo tekstidia käyttäjän antaman inputin pohjalta
     *
     *
     */
    this.CreateContent = function(){
        var address = this.pickerpair.GetHumanReadableAddress(),
            $section = $(`<section class="bibletext Raamattudia">
                            <article class="bibleverse">
                                <h2>${address}</h2>
                                <p>${this.verses[0]}</p>
                            </article>
                        </section>`);

        if(this.verses.length > 1){
            $section.append(
                this.verses.slice(1,).map(
                    (verse) => `<article class='bibleverse'><p>${verse}</p></article>`
                )
            );
        }

        this.$loaded_content = $section;
    };



    /**
     *
     * Luo jquery-elementin, joka syötetään Raamatunkohdan otsikoksi
     *
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
        var path = Utilities.GetAjaxPath("Loader.php"),
            start = this.pickerpair.startpicker.GetAddress(),
            end = this.pickerpair.endpicker.GetAddress();

        $.getJSON(path,{
            action: "load_grouped_verses",
            testament: this.pickerpair.startpicker.testament,
            start: [start.book, start.chapter, start.verse],
            end: [end.book, end.chapter, end.verse]
        }, (verses) => {
            this.verses = verses;
            this.AddToPres();
        }
        );
    };

} 

Slides.Widgets.ContentAdders.BibleContentAdder.prototype = Object.create(Slides.Widgets.ContentAdder.prototype);

