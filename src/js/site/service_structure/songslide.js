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
     * Aseta autocomplete-mahdollisuus etsiä lauluja rajoitettuun listaan
     * Käytetään hyväksi jquery ui:n skriptiä useista autocomplete-arvoista (https://jqueryui.com/autocomplete/#multiple)
     */
    this.AddAutoComplete = function(){
        var self = this;
        function split( val ) {
          return val.split( /,\s*/ );
        }
        function extractLast( term ) {
          return split( term ).pop();
        }
        $("[value='restrictedsong']").click(function(){ self.$container.find(".restrictionlist").toggle() });
        self.$container.find(".restrictionlist")
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
                                $.getJSON(loaderpath + "/songtitles.php",{songname:extractLast(request.term),fullname:"no"},response);
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

