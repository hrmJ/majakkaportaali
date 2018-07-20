
/**
 *
 * Moduuli, jonka avaulla valitaan raamatunkohtia tietokannasta
 *
 **/
var BibleModule = function(){


    /**
     *
     * Liittää raamatunosoitteiden poimijan käyytäjän määrittelemään elementtiin
     *
     * @param $parent_el jquery-representaatio elementistä, jonka sisälle syötetään
     *
     */
    function AttachAddressPicker($parent_el){
    
        var picker = new BibleAddressPicker();
        picker.AttachTo($parent_el).AddPickerEvents();
    
    }


    /**
     *
     * Raamatunkohtien valitsin
     *
     */
    var BibleAddressPicker = function(){ 

        this.address = {
            start: {},
            end: {},
        };

        this.testament = "";

        this.$picker = $(`<div> 
                    <div class='testament_select'>
                        <div><input type="radio" name="testament" value="ot">Vanha testamentti</input></div>
                        <div><input type="radio" name="testament" value="nt">Uusi testamentti</input></div>
                    </div>
                    <div class="verseselector startverse">
                        <div class="selector-wrapper">
                            <div>
                                <select class="book">
                                    <option>Valitse kirja</option>
                                </select>
                            </div>
                            <div>
                                <select class="chapter">
                                    <option>Valitse luku</option>
                                </select>
                            </div>
                            <div>
                                <select class="verse">
                                    <option>Valitse jae</option>
                                </select>
                                <div class="versepreview"></div>
                            </div>
                        </div>
                        <div>
                        <div class="arrow_box between-verse-selectors">Mihin asti?</div>
                    </div>
                </div>
            </div>`);



        /**
         *
         * Liitä valitsin DOMiin
         *
         * @param $parent_el jquery-representaatio elementistä, jonka sisälle syötetään
         *
         */
        this.AttachTo = function($parent_el){
            this.$picker.find("[value='ot'],[value='nt']").prop({"checked":false});
            $parent_el.append(this.$picker);
            return this;
        };


        /**
         *
         * Lisää tapahtumat valitsimeen
         *
         */
        this.AddPickerEvents = function(){
            this.$picker.find("[name='testament']").click(this.GetBookNames.bind(this));
            this.$picker.find(".book").change(this.GetChapters.bind(this));
            this.$picker.find(".chapter").change(this.GetVerses.bind(this));
            //$(".book, .chapter, .verse")
            //    .click(function(){pres.controls.biblecontentadder.LoadBooknames($(this))})
            //    .change(function(){pres.controls.biblecontentadder.PreLoad($(this))});
            ////Poista loppujae, jos määritelty uusi alkujakeen kirja /  luku / testamentti
            //$("[value='ot'],[value='nt'],.book,.chapter").click(function(){
            //    if($(this).parents(".endverse").length==0){
            //         $(".endverse").remove();
            //         $(".between-verse-selectors, .versepreview").hide();
            //    }
            //});;
            //
            return this;
        }

        /**
         *
         * Lataa Raamatun kirjojen nimet tietokannasta (joko ut tai vt)
         *
         */
        this.GetBookNames = function(){
            this.testament = this.$picker.find("[name='testament']:checked").val();
            this.book = '';
            this.verse = '';
            $.getJSON("php/ajax/Loader.php",
                {
                    "action": "load_booknames",
                    "testament": this.testament
                },this.SetBookNames.bind(this));
        };


        /**
         *
         * Lataa yhden raamatun kirjan luvut
         *
         */
        this.GetChapters = function(){
            this.book = this.$picker.find(".book").val();
            this.verse = '';
            $.getJSON("php/ajax/Loader.php",
                {
                    "action": "load_chapters",
                    "testament": this.testament,
                    "book": this.book
                }, this.SetChapters.bind(this));
        }


        /**
         *
         * Lataa yhden raamatun kirjan luvun jakeet
         *
         */
        this.GetVerses = function(){
            this.chapter = this.$picker.find(".chapter").val();
            $.getJSON("php/ajax/Loader.php",
                {
                    "action": "load_verses",
                    "testament": this.testament,
                    "book": this.book,
                    "chapter": this.chapter
                }, this.SetVerses.bind(this));
        }


        /**
         *
         * Liittää Raamatun kirjojen nimet valitsimiin
         *
         * @param data taulukko kirjojen nimistä
         * 
         */
        this.SetBookNames = function(data){
            var self = this;
            this.$picker.find(".book, .chapter, .verse").find("option:gt(0)").remove();
            //ES2015 testi: TODO muista yhteensopiva versio
            $(data.map(bookname => `<option>${bookname}</option>`).join("\n"))
                .appendTo(self.$picker.find(".book"));
        };

        /**
         *
         * Liittää kirjan lukujen numerot valitsimeen
         *
         * @param data taulukko lukujen numeroista
         * 
         */
        this.SetChapters = function(data){
            var self = this;
            this.$picker.find(".chapter, .verse").find("option:gt(0)").remove();
            //ES2015 testi: TODO muista yhteensopiva versio
            $(data.map(ch => `<option>${ch*1}</option>`).join("\n"))
                .appendTo(self.$picker.find(".chapter"));
        };

        /**
         *
         * Liittää luvun jakeiden numerot valitsimeen
         *
         * @param data taulukko jakeiden numeroista
         * 
         */
        this.SetVerses = function(data){
            var self = this;
            this.$picker.find(".verse").find("option:gt(0)").remove();
            //ES2015 testi: TODO muista yhteensopiva versio
            $(data.map(verseno => `<option>${verseno*1}</option>`).join("\n"))
                .appendTo(self.$picker.find(".verse"));
        };

    
    };

    /**
     *
     *
     */
    BibleAddressPicker.prototype = {


        /**
         *
         * Lataa kirjojen nimet tietokannasta (joka vanhasta tai uudesta testamentista)
         *
         * @param object $launcher jquery-elementti, joka tapahtuman laukaisi (joko radiobuttonit tai lista)
         *
         */
        LoadBooknames: function($launcher){
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
        },

        /**
         * Lataa kappaleiden tai jakeiden lukumäärä valitun kirjan nimen / kappaleen perusteella
         *
         *
         * @param object launcher toiminnon laukaissut kirjanvalitsin
         *
         */
        PreLoad: function($launcher){
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

        },

        /**
         * Näyttää pienen esikatseluikkunan siitä Raamatun jakeesta, joka valittu
         *
         * @param  object $selectparent se elementti, jonka lapsena käytetty jakeen valitsin on
         * @param  array data ajax-kyselyn palauttama taulukko jakeista
         *
         */
        ShowVersePreview: function($selectparent,data){
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
        },

        /**
         * Merkitse muistiin Raamatunkohdan alku- ja loppukohta
         */
        UpdateAddress: function(){
            var self = this;
            $(".startverse select").each(function(){ self.address.start[$(this).attr("class")] = $(this).val()});
            $(".endverse select").each(function(){ self.address.end[$(this).attr("class")] = $(this).val()});
        },

        /**
         * Luo jquery-elementti, joka syötetään Raamatunkohdan otsikoksi
         */
        CreateTitle: function(){
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
            },

    } 


    return {
    
        AttachAddressPicker,
    
    };

}();

