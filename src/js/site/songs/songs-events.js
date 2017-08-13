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
        $("#editwordslink").click(EditLyrics);
        $("#closewordeditlink").click(function(){$(".sideroller").hide();$(".side-main").show()});
        $(".multisongs [type='button']").click(AddMultisongsRow);
        //Tavuta laulutyypit soft-hypheneilla.
        $(".data-left").each(function(){ $(this).html($(this).html().replace(/([^ ])(laul)/,"$1&shy;$2").replace(/ (\d+)/,"&nbsp;$1"))});

        //Sanojen katseluikkuna
        var slv = new SongListView();
        $(".songlistview-toggle").click(function(){slv.Toggle()});
        $("#alpha-select li").click(function(){slv.LoadData($(this))});
    }
});

