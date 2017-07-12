/**
 *
 * Laululistan toimimiseen liittyvä javascript.
 *
 */


$(document).ready(function(){
    $(".multisongs [type='button']").click(
        /**
         * Lisää tai poista uusi rivi laulujen listaan.
         */
        function(){
            var $table = $(this).parent().prev("table");
            //Kopioi taulukon viimeinen rivi
            var $tr = $table.find("tr:last-child").clone(true);
            //Muuta kopioidun rivin numero niin, että se on yhden suurempi kuin alkuperäisessä rivissä
            var number = $tr.find("td:first-child").text().replace(/([^\d+]+ ?)(\d+)/,function(match,p1,p2){ return p2*1+1});
            var $newtr = $($tr.html().replace(new RegExp(number-1,"g"), number));
            //Tyhjennä itse laulun nimi
            $newtr.find("input").attr({"value":""});
            //Syötä uusi rivi taulukkoon
            $newtr.insertAfter($table.find("tr:last-child")).wrapAll("<tr></tr>");
    });
});


