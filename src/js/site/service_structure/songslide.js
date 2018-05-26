GeneralStructure.SlotFactory = GeneralStructure.SlotFactory || {};

/**
 *
 * Laulusisällön lisäävä olio.
 *
 */
GeneralStructure.SlotFactory.songslide = function(){
    this.slideclass = ".songslide";
    this.segment_type = "songsegment";

    /**
     *
     * Lisää ajax-ladatun datan slottiin
     *
     * @param data dian tiedot ajax-responssina 
     *
     **/
    this.FillInData = function(data){
        var self = this;
        if(data.multiname){
            this.$lightbox.find("[value='multisong']").get(0).checked=true;
            this.$lightbox.find(".multisongheader").val(data.multiname).show();
        }
        if(data.restrictedto){
            this.$lightbox.find("[value='restrictedsong']").get(0).checked=true;
            this.$lightbox.find(".restrictionlist").val(data.restrictedto).show();
        }
        this.$lightbox.find(".songdescription").val(data.songdescription);
        this.AddAutoComplete();

        $("[value='restrictedsong']").click(function(){ 
            self.$lightbox.find(".restrictionlist").toggle();
        });

        self.$lightbox.find("[value='multisong']").click(function(){ 
            var $f = self.$lightbox.find(".multisongheader");
            if(!$f.is("visible")){
                $f.show();
            }
            else{
                $f.hide();
            }
        });
    };


    /**
     *
     * Kerää diaan liittyvän informaation tallentamista tai esikatselua
     * varten
     *
     **/
    this.SetSlideParams = function(){
        var $multiheader = this.$lightbox.find(".multisongheader");
        this.slide_params = {
            songdescription: this.$lightbox.find(".songdescription").val(),
            singlename: this.$lightbox.find(".segment-name").val(),
            multiname: ($multiheader.length ? $multiheader.val() : null),
            restrictedto: null
        }
        return this;
    }

    /**
     * Aseta autocomplete-mahdollisuus etsiä lauluja rajoitettuun listaan
     * Käytetään hyväksi jquery ui:n skriptiä useista autocomplete-arvoista
     * (https://jqueryui.com/autocomplete/#multiple)
     */
    this.AddAutoComplete = function(){
        var self = this;
        function split( val ) {
          return val.split( /,\s*/ );
        }
        function extractLast( term ) {
          return split( term ).pop();
        }
        self.$container.find("[name='restrictions_input']")
            // don't navigate away from the field on tab when selecting an item
            .on( "keydown", function( event ) {
              if ( event.keyCode === $.ui.keyCode.TAB &&
                  $( this ).autocomplete( "instance" ).menu.active ) {
                event.preventDefault();
              }
            })
            .autocomplete({ source: 
                            function(request, response){ 
                                var data = undefined;
                                $.getJSON("php/ajax/Loader.php",
                                    {
                                    action: "get_song_titles",
                                    title:extractLast(request.term)
                                    },
                                    response);
                            },
                            minLength: 0,
                            focus: function() {
                              // prevent value inserted on focus
                              return false;
                            },
                            select: function( event, ui ) {
                              var terms = split( this.value );
                              // remove the current input
                              terms.pop();
                              // add the selected item
                              terms.push( ui.item.value );
                              // add placeholder to get the comma-and-space at the end
                              terms.push( "" );
                              this.value = terms.join( ", " );
                              return false;
                        } });
    };


}
