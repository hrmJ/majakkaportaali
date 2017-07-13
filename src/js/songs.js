

/**
 *
 * Laululistan toimimiseen liittyvä javascript.
 *
 */


$(document).ready(function(){


      $( ".songinput" ).autocomplete({
        /**
         *
         * Lataa laulujen nimet tietokannasta ja syötä  laulun nimi tai sen osa,
         * kun käyttäjä aloittaa kirjoittamisen. Vaati jQuery UI:n.
         *
         */
          source: function( request, response ) { $.getJSON("php/loaders/songtitles.php",{songname:request.term},response);},
          minLength: 2,
          select: function( event, ui ) {
            log( "Selected: " + ui.item.value + " aka " + ui.item.id );
          }
        } );



    $(".multisongs [type='button']").click(
        /**
         * Lisää uusi rivi laulujen listaan tai poista viimeisin rivi.
         */
        function(){
            var $table = $(this).parent().prev("table");
            if($(this).hasClass('decreaser')){
                //Poista viimeisin, jos painettu miinuspainiketta ja jos vähintään 1 jäljellä
                if($table.find("tr").length>1) $table.find("tr:last-child").remove();
            }
            else{
                //Kopioi taulukon viimeinen rivi
                var $tr = $table.find("tr:last-child").clone(true);
                //Muuta kopioidun rivin numero niin, että se on yhden suurempi kuin alkuperäisessä rivissä
                var number = $tr.find("td:first-child").text().replace(/([^\d+]+ ?)(\d+)/,"$2")*1;
                var $newtr = $($tr.html().replace(new RegExp(number,"g"), number +1 ));
                //Tyhjennä itse laulun nimi
                $newtr.find("input").attr({"value":""});
                //Syötä uusi rivi taulukkoon
                $newtr.insertAfter($table.find("tr:last-child")).wrapAll("<tr></tr>");
            }
    });
});


