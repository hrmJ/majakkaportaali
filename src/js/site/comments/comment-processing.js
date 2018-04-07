/**
*
* Sisältää javascript-koodin 
* kommenttien prosessoimista varten
*
*/

var loaderpath = "php/ajax";


/**
 *
 * Laajenna näkyviin uuden kommentin kirjoituskenttä
 *
 */
function ExpandCommentField(){
    $(this).animate({"height":"6em"}); 
    var $details = $(this).parent().parent().find(".commentdetails:eq(0)");
    $details.show();
    ScrollToCenter($details);
}



/**
 *
 * Lataa kaikki kommentit tietokannasta dokumenttiin
 * Lataa myös uuden kommentin syöttämiseen tarvittavat tiedot.
 *
 */
function LoadComments(){
    $.get("php/ajax/Loader.php", {
        action: "load_comments",
        service_id: 2
        },
        function(data){
            $(".loadedcomments").html(data);
            $(".newcomment, .commentator").val("");
            $(".newcomment:eq(0)").height("3em");
            $(".comment comment-insert-controls, .commentdetails").hide()
            $(".comment-answer-link")
                .click(CreateCommentAnswerField)
                .each(function(){
                //Muuta vastauslinkin tekstiä ketjujen osalta
                if($(this).parent().parent().find(".comment").length>0) $(this).text("Jatka viestiketjua");
            });
            //Huom! Varmistetan, ettei tallennustapahtuma tule sidotuksi kahdesti
            $(".savecomment")
                .unbind("click",SaveComment)
                .bind("click",SaveComment);
            $(".newcomment:eq(0)").click(ExpandCommentField);
    }
    );

}

/**
 *
 * Tallenna syötetty kommentti
 *
 */
function SaveComment(){
    console.log("raz!");
    $container = $(this).parent().parent().parent();
    var theme = "";
    var replyto = 0;
    var id = $container.parent().attr("id");
    if(id){
        replyto = id.replace(/c_/,"");
    }
    if($container.find("select").length>0){
        theme = $container.find("select").get(0).selectedIndex>1 ? $container.find("select").val() : "";
    }
    var queryparams = {action: "save_comment",
                       service_id:2,
                       theme: theme,
                       content:$container.find(".newcomment").val(),
                       commentator:$container.find(".commentator").val(),
                       replyto:replyto
                      };
    $.get("php/ajax/Loader.php",queryparams, function(data){
        LoadComments();
    });
}

/**
 *
 * Syötä tekstikenttä kommenttiin tai viestiketjuun
 * vastaamista varten.
 *
 */
function CreateCommentAnswerField(){
    var $commentbox = $(this).parents(".comment");
    if( !$commentbox.find(".comment_controls").length ){
        $(".comment_controls:eq(0)").clone(true)
            .appendTo($commentbox)
            .css({"margin-top":"1em"})
            .hide().slideDown()
            .children().show();
    }
}


