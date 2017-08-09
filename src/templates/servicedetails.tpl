<form name="detailsform" action="[@action]" method="POST">
    <section class="innercontent">
    <h2>[@theme]</h2>
        <div class="data-container">[@table]</div>
        <div class="form-input-container"><input type="submit" name="savedetails" value="Tallenna"></div>

        <section class="comments">
            <div><textarea id="newcomment" placeholder="Lisää huomio tai kommentti..."></textarea></div>
            <div class="commentdetails">
                <div>[@commentthemeselect]</div>
                <div><input type="text" placeholder="Nimesi" id="commentator"></input></div>
                <div><a href="javascript:void(0)" id="savecomment"> Tallenna kommentti</a></div>
            </div>
        </section>

    </section>
</form>
