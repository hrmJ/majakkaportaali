$(document).ready(function(){
    //Siirtyminen messudetaljinäkymään
    $("tr").click(function(){window.location="servicedetails.php?id=" + this.id.replace(/[^_]+_/,"");});
    //Suodattaminen vastuun mukaan
    $("#respfilter") .change(function(){window.location="servicelist.php?filterby=" + this.value;});
})
