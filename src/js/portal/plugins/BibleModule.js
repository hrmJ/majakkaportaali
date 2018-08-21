
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
     * @param title Raamatunkohdan otsikko / rooli
     *
     */
    function AttachAddressPicker($parent_el, title){
        var title = title || "";
        var cont = new PickerContainer(title);
        cont.AttachTo($parent_el);
        return cont;
    }

    /**
     *
     * (Mahdollisesti) usean jaeparin muodostama kokonaisuus
     *
     * @param title Raamatunkohdan otsikko / rooli
     *
     */
    var PickerContainer = function(title){ 

        this.title = title;
        this.callback = undefined;
        this.picker_pairs = [];
        this.$supercont = $(`<div class='bible_address_container'>`);
        this.$header = $(`<div class='bible_address_header closed'>
                            <div class='address_name'>
                                ${title}
                            </div>
                            <div class='address_information'>
                                <span class='visible_address'></span>
                                <input type='hidden' class='saved_address'></input>
                            </div>
                        </div>`);
        this.$cont = $(`<div class='address_pickers'>
                        </div>`);


        /**
         *
         * Asettaa funktion tarkkailemaan valitsimissa tapahtuvia muutoksia
         *
         * @param callback asetettava funktio
         *
         */
        this.SetCallBack = function(callback){
            this.callback = callback;
        }

        /**
         *
         * Liittää mukaan tapahtumat
         *
         */
        this.Initialize = function(){
            this.$header.click(this.ShowPickers.bind(this));
            this.AddPickerPair();
        };

        /**
         *
         * Liittää osaksi DOMia
         *
         * @param $parent_el elementti, johon valitsin liitetään
         *
         */
        this.AttachTo = function($parent_el){
            this.$supercont.appendTo($parent_el);
            this.$header.appendTo(this.$supercont);
            this.$cont.insertAfter(this.$header);
            this.$addmore_link = $("<i class='fa fa-plus add_picker_pair'></i>")
                .click(this.AddPickerPair.bind(this));
            this.$addmore_link_cont = $("<div class='add_picker_pair'></div>")
                .append(this.$addmore_link)
                .appendTo(this.$cont)
                .hide();
            if(this.$cont.find(".fa-pencil").is(":visible")){
                this.$addmore_link_cont.show();
            }
        };

        /**
         *
         * Näyttää raamatunkohtien valitsimet.
         *
         */
        this.ShowPickers = function(){
            var self = this;
            this.$cont.slideToggle(function(){
               self.$header.toggleClass("opened").toggleClass("closed");
            });
        };


        /**
         *
         * Lisää uuden alku- + loppujaeparin
         *
         */
        this.AddPickerPair = function(){
            var picker = new PickerPair();
            picker.Initialize(this.$cont);
            if(this.callback){
                picker.SetCallBack(this.callback);
            }
            if(this.$addmore_link_cont){
                this.$addmore_link_cont.insertAfter(picker.$cont).hide();
            }
            this.picker_pairs.push(picker);
            //this.$addmore_link_cont.after(picker.$controls);
        };
    }

    /**
     *
     * Alku- ja loppujakeen valitsimen muodostama kokonaisuus
     *
     *
     */
    var PickerPair = function(){ 

        this.callback = undefined;
        this.$status = $("<div class='bible_address_status'><span class='status_text'></span></div>");
        this.startpicker = new StartAddressPicker();
        this.endpicker = new EndAddressPicker();

        this.Initialize = function($parent_el){
            this.$cont = $("<div class='pickerpair'></div>").appendTo($parent_el);
            this.$confirm_link = $("<a href='javascript:void(0);'>Valmis</a>").click(this.Confirm.bind(this));;
            this.$edit_link = $("<i class='fa fa-pencil addr_edit_link'></i>")
                .click(this.Edit.bind(this))
                .appendTo(this.$status);
            this.startpicker.AttachTo(this.$cont).AddPickerEvents();
            this.endpicker.AddPickerEvents();
            this.endpicker.$picker
                .insertAfter(this.startpicker.$picker)
                .hide();
            this.startpicker.$picker
                .find(".verse").change(this.AttachEndPicker.bind(this));
            this.$controls = $("<div class='pickerpair_controls'></div>")
                .append(this.$confirm_link)
                .insertAfter(this.endpicker.$picker);
            this.$status.insertBefore(this.startpicker.$picker);
        }


        /**
         *
         * Muokkaa kerran jo vahvistettua
         *
         */
        this.Edit = function(){
            this.startpicker.$picker
                .find("[value='" + this.startpicker.testament + "']")
                .prop({"checked":true});
            this.$status.hide();
            this.startpicker.$picker.show();
            this.endpicker.$picker.show();
            this.$confirm_link.show();
            this.$cont.addClass("pickerpair");
            this.startpicker.$picker.find(".between-verse-selectors").show();
        };

        /**
         *
         * Asettaa funktion tarkkailemaan valitsimissa tapahtuvia muutoksia
         *
         * @param callback asetettava funktio
         *
         */
        this.SetCallBack = function(callback){
            this.callback = callback;
        }


        /**
         *
         * Tekee jaeparista yksittäisen, jolloin ei yritetä luoda
         * mahdollisuutta useilla jaepareille
         *
         * @param callback asetettava funktio
         *
         */
        this.SetAsSingle = function(){
            this.is_single = true;
            return this;
        }

        /**
         *
         * Vahvistaa valitun raamatunkohdan
         *
         */
        this.Confirm = function(){

            if(!this.is_single){

                var addr = this.GetHumanReadableAddress(),
                    $par_el = this.startpicker.$picker.parents(".address_pickers");
            
                this.startpicker.$picker.hide();
                this.endpicker.$picker.hide();
                this.$status.find(".status_text").text(addr);
                this.$cont.removeClass("pickerpair");

                var $all_addresses = $par_el.find(".status_text"),
                    address_string = "";

                $all_addresses.each(function(){
                    if(address_string){
                        address_string += "; ";
                    }
                    address_string += $(this).text();
                });

                $par_el.prev().find(".address_information").text(address_string);
                this.startpicker.$picker.parents(".bible_address_container:eq(0)")
                    .find(".add_picker_pair").show();

                this.$confirm_link.hide()
                this.$status.show();
            
            }

            if(this.callback){
                this.callback();
            }
        }

        /**
         *
         * Muodostaa helposti luettavissa olevan merkkijonon osoitteesta.
         *
         */
        this.GetHumanReadableAddress = function(){
            var start = this.startpicker.GetAddress(),
                end = this.endpicker.GetAddress(),
                addr = start.book + ' ' + start.chapter;
            if(start.book !== end.book){
                addr += ":" + start.verse + " - " + end.book + " " + end.chapter + ": " + end.verse;
            }
            else if(start.chapter == end.chapter && start.verse == end.verse) {
                addr += ":" + start.verse;
            }
            else if(start.chapter == end.chapter) {
                addr += ":" + start.verse + " - " +  end.verse;
            }
            else if(start.chapter !== end.chapter) {
                addr += ":" + start.verse + " - " +  end.chapter + ": " + end.verse;
            }
            return  addr;
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
            this.$controls.show();
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

        this.$picker = $(`<div class='bible_address_picker'> 
                    <div class="verseselector startverse">
                        <div class="selector-wrapper">
                            <div>
                                <select class="book">
                                    <option>Kirja</option>
                                </select>
                            </div>
                            <div>
                                <select class="chapter">
                                    <option>Luku</option>
                                </select>
                            </div>
                            <div>
                                <select class="verse">
                                    <option>Jae</option>
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
                address[type] = self[type];
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
            var self = this
                booknames = undefined,
                chapters = undefined,
                verses = undefined;
            self.testament = testament;
            self.book = address.book;
            self.chapter = address.chapter;
            self.verse = address.verse;
            if(this.$picker.find(".book").length < 2){
                //Jos ei valmiiksi ladattuja kirjojen, kappaleiden ym. nimiä
                return $.when($.when(self.GetBookNames())
                    .done(function(){
                        $.when(self.GetChapters())
                            .done(function(){
                                $.when(self.GetVerses())
                                    .done(function(){
                                        $.each(Object.keys(address), function(idx, type){
                                            self.$picker.find("." + type).val(address[type]);
                                        });
                                });
                            });
                        }));
            }
            else{
                $.each(Object.keys(address), function(idx, type){
                    self.$picker.find("." + type).val(address[type]);
                    self[type] = address[type];
                });
            }
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
            return this;
        }

        /**
         *
         * Lataa Raamatun kirjojen nimet tietokannasta (joko ut tai vt)
         *
         * @param event tapahtuma
         *
         */
        this.GetBookNames = function(event){
            var path = Utilities.GetAjaxPath("Loader.php");
            if(event){
                //Jos ajettu valintatapahtuman seurauksena eikä automaattisesti
                this.testament = this.$picker.find("[name='testament']:checked").val();
                this.book = '';
                this.verse = '';
                if(this.type=="start"){
                    this.$picker.parents(".pickerpair")
                        .find(".between-verse-selectors, .bible_address_picker:eq(1)").hide();
                }
            }
            return $.getJSON(path,
                {
                    "action": "load_booknames",
                    "testament": this.testament
                },this.SetBookNames.bind(this));
        };


        /**
         *
         * Lataa yhden raamatun kirjan luvut
         *
         * @param event tapahtuma
         *
         */
        this.GetChapters = function(event){
            var path = Utilities.GetAjaxPath("Loader.php");
            if(event){
                this.book = this.$picker.find(".book").val();
                this.verse = '';
            }

            return $.getJSON(path,
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
         * @param event tapahtuma
         *
         */
        this.GetVerses = function(event){
            var path = Utilities.GetAjaxPath("Loader.php");
            if(event){
                this.chapter = this.$picker.find(".chapter").val();
            }
            return $.getJSON(path,
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
            var self = this,
                path = Utilities.GetAjaxPath("Loader.php");
            this.verse = this.$picker.find(".verse").val();
            $.getJSON(path,
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
        $("<div class='after-verse-selectors'></div>")
            .appendTo(this.$picker);


    };


    EndAddressPicker.prototype = Object.create(BibleAddressPicker.prototype);


    return {
    
        AttachAddressPicker,
        PickerPair
    
    };

}();

