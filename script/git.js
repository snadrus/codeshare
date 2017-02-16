window.git = (function(){ // source control at its lightest
    var peerId="";
    var last={id:"0"}; // base of a "one-level-deep" git tree
    var proposals = []; // stuff on top that has no quorum
    function pullRebase(diffArray) { // clients receiving a message
        var pidx;
        proposals.reduceRight(function(ig,v, idx){ // Undo proposals
            pidx[p.id] = idx;
            stateEngine.applyPatch({item: v.item, from:v.to, to:v.from});
        });
        
        var pSli;
        diffArray.forEach(function(d){      //apply array (naming maybe)
            nameIt(d);
            if(d.was && pidx[d.was]> pSli) 
                pSli=pidx[d.was]; 
            stateEngine.applyPatch(d); 
            last=d;
        });
         
        proposals = proposals.slice(pSli); // get chill about being accepted
        // reapply unaccepted proposals. IDs should change, but they're already getting merged, so eh.
        proposals.forEach(stateEngine.applyPatch); // TODO real merge since its a rebase
    }
    function nameIt(diff){
        if(diff.id) 
            return; 
        diff.base = last.id;
        diff.id = md5(lastId+":"+peerId)}

    function merge(diff, ){
        // diff contains: {base: md5, type:"fulltext", from: text, to: text, id: md5}
        // returns an array of changes for all to apply

        // This client write (with some .base) needs merging (3-way?)
        // TODO!!!!!!!!!!!!!!!!!!
                // set diff.was , id, and better merge (3-way)
                // before sharing.  2way first if ugly then???
        //TODO!!! then offer a merge
    }
    return {
        merge: merge,
        commit: function(diff){nameIt(diff);proposals.push(diff);}, //client writes.
        pullRebase: pullRebase,
        push: function(d){nameIt(d); last = d;},
        setPeerId: function(p, state){peerId=p;}
    }
})();