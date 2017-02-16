window.ct = (function(){ // source control at its lightest
    var peerId, state={}, messageFn, oldIDs = [];
    return {
        I_AM: function(id, inStates, inMessageFn, stateApplier){
            peerId = id;
            messageFn = inMessageFn;
            inStates.val.forEach(function(s){ 
                state[s.item] = s.to;
                stateApplier(s);
            });

        },
        FromServer: function(data, stateApplier){ // returns nothing
            if (state[data.item] == data.to) {
                return; // just an echo, ignore it.
            }
            if (state[data.item] !== data.from){
                var fromUs = oldIDs.indexOf(data.was);
                if (fromUs > -1){
                    // the server is catching-up to updates we made already. 
                    oldIDs = oldIDs.slice(fromUs+1);
                    return;
                }
                // FUTURE: merge data & our current state so that:
                    // 1. We don't have state interruptions (lessened now)
                    // 2. Server is surprised less
            }
            
            stateApplier(data);
            state[data.item] = data.to;
        },
        ClientSelfChange: function(data){ // augment data object if needed. 
            // data has: item, from, to
            if (state[data.item]===data.to){
                return false; // just us seeing ourselves update from server;
            }
            data.id = Math.random();
            oldIDs.push(data.id);
            state[data.item] = data.to;
            return true;
        },
        ServerSelfChange: function(data){ // augment data object if needed
            // data has: item, from, to
            state[data.item] = data.to;
            data.id = Math.random()
        },
        FromClient: function(data, stateApplier){ // Merge case. 
            if (state[data.item]===data.to || state[data.item]===data.to.val) { // do nothing
                return false; // No updates necessary
            }

            data.was = data.id;
            data.type="ok";

            if (state[data.item]!==data.from) { // merge case
                var us = state[data.item];
                var them = data.to;

                messageFn("Blind merge! Re-read your code.");
                //data.to = state[data.item];
                // TODO adjust data.to.range if we have edited above/before it
                data.was = undefined; // don't remember you saw this before
            }

            state[data.item] = (data.to && data.to.val? data.to.val : data.to);
            stateApplier(data);
            data.id = Math.random();
            return data;
        }
    }
})();