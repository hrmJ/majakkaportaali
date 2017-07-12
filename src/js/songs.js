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
            var $tr = $table.find("tr:last-child").clone(true);
            var number = $tr.find("td:first-child").text().replace(/([^\d+]+ ?)(\d+)/,"$2") *1 + 1;
            console.log(number);
            //td.textContent.
            //$table.append($tr);
    });
});


