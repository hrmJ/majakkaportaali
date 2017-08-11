<form name="detailsform" action="[@action]" method="POST">
    <section class="innercontent">
    <input type="hidden" id="service_id" value="[@service_id]"></input>
    <h2>[@theme]</h2>
        <div class="data-container">[@table]</div>
        <div class="form-input-container"><input type="submit" name="savedetails" value="Tallenna"></div>

        <section class="comments">

            [@comment-insert-controls]

            <div class="loadedcomments">
            </div>
        </section>

    </section>
</form>
