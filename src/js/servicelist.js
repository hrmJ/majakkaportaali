$(document).ready(function(){
    $("tr").click(function(){
        window.location="servicedetails.php?id=" + this.id.replace(/[^_]+_/,"");
    })
})
