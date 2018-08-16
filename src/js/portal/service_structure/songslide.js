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
        this.$lightbox.find("[value='multisong']").get(0).checked=false;
        if(data.is_multi){
            this.$lightbox.find("[value='multisong']").get(0).checked=true;
        }
        if(data.restrictedto){
            this.$lightbox.find("[value='restrictedsong']").get(0).checked=true;
            this.$lightbox.find(".restrictionlist").show();
            this.$lightbox.find("[name=restrictions_input]").val(data.restrictedto);
        }
        this.$lightbox.find(".songdescription").val(data.songdescription);
        this.AddAutoComplete();

        //Lisää toiminnallisuus valintalaatikkoihin
        this.$lightbox.find("[type='checkbox']").click(function(){ 
            $(this).parents(".checkbox-parent").next().toggle();
        });

    };


    /**
     *
     * Kerää diaan liittyvän informaation tallentamista tai esikatselua
     * varten
     *
     **/
    this.SetSlideParams = function(){
        this.slide_params = {
            songdescription: this.$lightbox.find(".songdescription").val(),
            singlename: this.$lightbox.find(".segment-name").val(),
            is_multi: (this.$lightbox.find("[value='multisong']").get(0).checked ? 1 : 0),
            restrictedto: this.$lightbox.find("[name='restrictions_input']").val()
        }
        if(!this.$lightbox.find("[value='restrictedsong']").get(0).checked){
            //Jos ei ruksia rajoita-laatikossa, ignooraa kirjoitetut rajoitukset
            this.slide_params.restrictedto = "";
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
