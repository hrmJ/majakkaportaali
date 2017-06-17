$(document).ready(function(){
    //Siirtyminen messudetaljinäkymään
    $("tr").click(function(){
        if($("#respfilter").val()=="Yleisnäkymä") window.location="servicedetails.php?id=" + this.id.replace(/[^_]+_/,"");
    });
    //Suodattaminen vastuun mukaan
    $("#respfilter") .change(function(){
        if(!this.value.match(/----/)) window.location="servicelist.php?filterby=" + this.value;
    });
})
