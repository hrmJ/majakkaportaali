/**
 *
 * Interaktio ja layout-muokkaus laululistasivulle.
 *
 */

function AddCustomSongPicker(text){
    if (text == "Jokin muu") {
        var button = $('<input type="submit" onclick="selectOther(this)" value="Valitse"/>');
        var input = $('<input  type="text" value="" placeholder="Kirjoita laulun nimi...">');
        return $('<span></span>').append(input).append(button)[0].outerHTML;
    }
    return text;
}

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
        $("#closewordeditlink").click(CloseWordEdit);
        $(".multisongs [type='button']").click(AddMultisongsRow);
        //Tavuta laulutyypit soft-hypheneilla.
        $(".data-left").each(function(){ $(this).html($(this).html().replace(/([^ ])(laul)/,"$1&shy;$2").replace(/ (\d+)/,"&nbsp;$1"))});

        //Sanojen katseluikkuna
        var slv = new SongListView();
        $(".songlistview-toggle").click(function(){slv.Toggle()});
        $("#alpha-select li").click(function(){slv.LoadData($(this))});
        //Rajoitetuille lauluvalinnoille modattu jquery ui -selectmenu
        $("select").select_withtext();
    }
});

