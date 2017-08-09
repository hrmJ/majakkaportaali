/**
*
* Sisältää javascript-koodin messudetaljisivua varten.
*
*/
$(document).ready(function(){
    if($("body").hasClass("servicedetails")){
        $(".commentdetails").hide();
        $("#newcomment").click(function(){
            $(this).animate({"height":"6em"}); 
            $(".commentdetails").show();
            ScrollToCenter($(".commentdetails"));
        });
    }
});
