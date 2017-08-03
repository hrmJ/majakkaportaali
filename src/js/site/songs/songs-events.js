/**
 *
 * Interaktio ja layout-muokkaus laululistasivulle.
 *
 */

$(document).ready (function(){
    if($("body").hasClass("songs")){
        $(".songinput").autocomplete(autocompsongtitle);
        $(".songinput, select").on("change paste keyup",CheckIfLyricsExist);
        //Tarkista jo syötetyistä lauluista, onko niitä tietokannassa
        $(".songinput, select").each(function(){CheckIfLyricsExist($(this),$(this).val())});
        $(".lyricsindicator").click(ShowLyricsWindow);
        $(".sideroller").hide();
        $(".menu").menu({position: { my: "bottom", at: "right-5 top+5" }});
        $(".sideroller > p > a").click(EditLyrics);
        $(".multisongs [type='button']").click(AddMultisongsRow);
    }
});

