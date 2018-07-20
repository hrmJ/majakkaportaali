
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
        var picker = new PickerPair();
        picker.Initialize($parent_el);
    }

    /**
     *
     * Alku- ja loppujakeen valitsimen muodostama kokonaisuus
     *
     * @param $parent_el elementti, johon valitsin liitetään
     *
     */
    var PickerPair = function($parent_el){ 

        this.Initialize = function($parent_el){
            this.startpicker = new StartAddressPicker();
            this.startpicker.AttachTo($parent_el).AddPickerEvents();
            this.endpicker = new EndAddressPicker();
            this.endpicker.AddPickerEvents();
            this.endpicker.$picker
                .insertAfter(this.startpicker.$picker)
                .hide();
            this.startpicker.$picker
                .find(".verse").change(this.AttachEndPicker.bind(this));
        }

        /**
         *
         * Liittää loppujakeen valitsimen.
         *
         */
        this.AttachEndPicker = function(){
            var self = this;
            $.each([".book",".chapter",".verse"],function(idx, type){
                self.endpicker.$picker.find(type).html(
                    self.startpicker.$picker.find(type).html()
                );
            });
            this.endpicker.SetAddress(this.startpicker.GetAddress(), 
                this.startpicker.testament);
            this.startpicker.$picker.find(".between-verse-selectors").slideDown("slow");
            this.endpicker.$picker.show();
        //};
        };

    };


    /**
     *
     * Raamatunkohtien valitsin
     *
     */
    var BibleAddressPicker = function(){ 

        this.testament = "";
        this.book = "";
        this.chapter = "";
        this.verse = "";

        this.$picker = $(`<div> 
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
                </div>
            </div>`);


        /**
         *
         * Liittää valitsimen DOMiin
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
         * Palauttaa tämänhetkisen osoitteen muodossa {book:..,chapter:...,verse:...}
         *
         */
        this.GetAddress = function(){
            var address = {}
                self = this;
            $.each(["book","chapter","verse"],function(idx, type){
                address[type] = self.$picker.find("." + type).val();
            });

            return address;
        };


        /**
         *
         * Asettaa osoitteen valmiiksi määritellyn olion perusteella
         *
         * @param address osoite muodossa {book:..,chapter:...,verse:...}
         * @param testament nt tai ot
         *
         */
        this.SetAddress = function(address, testament){
            var self = this;
            self.testament = testament;
            $.each(Object.keys(address), function(idx, type){
                self.$picker.find("." + type).val(address[type]);
                self[type] = address[type];
            });
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
            this.$picker.find(".verse").change(this.PreviewVerse.bind(this));
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


        /**
         *
         * Näyttää esikatselunäkymän jakeesta
         * 
         */
        this.PreviewVerse = function(){
            var self = this;
            this.verse = this.$picker.find(".verse").val();
            $.getJSON("php/ajax/Loader.php",
                {
                    "action": "load_verse_content",
                    "testament": this.testament,
                    "startverse": [this.book, this.chapter, this.verse],
                    "endverse": null,
                }, function(verse){
                    self.$picker.find(".versepreview")
                        .text(verse[0])
                        .fadeIn()
                        .click(function(){$(this).fadeOut()});
                    setTimeout(x => (self.$picker.find(".versepreview").fadeOut()), 4000);
                });
        };
    
    };

    /**
     *
     * Valitsin sille jakeelle, josta asti valitaan. Perii BibleAddressPicker:stä.
     *
     */
    var StartAddressPicker = function(){
        this.type = "start";
        BibleAddressPicker.call(this);

        $(`<div class='testament_select'>
            <div><input type="radio" name="testament" value="ot">Vanha testamentti</input></div>
            <div><input type="radio" name="testament" value="nt">Uusi testamentti</input></div>
        </div>`).prependTo(this.$picker);

        $(`<div>
        <div class="arrow_box between-verse-selectors">Mihin asti?</div>
        </div>`).appendTo(this.$picker);
    };

    StartAddressPicker.prototype = Object.create(BibleAddressPicker.prototype);

    /**
     *
     * Valitsin sille jakeelle, johon asti valitaan. Perii BibleAddressPicker:stä.
     *
     */
    var EndAddressPicker = function(){
        this.type = "end";
        BibleAddressPicker.call(this);
    };

    EndAddressPicker.prototype = Object.create(BibleAddressPicker.prototype);


    return {
    
        AttachAddressPicker,
    
    };

}();

