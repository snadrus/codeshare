// propose, merge, and finalize
window.commitLog = (function(){
    function finalize(changeArray) {
        // currently only callable by the server for their changes.
        // just return the changes. 
        return changeArray;
    }

    return {
        merge: function(){},   // only useful for client writes. Skipping for now.
        propose: function(){}, // only useful for client writes. Skipping for now.
        finalize: finalize
    }
})();