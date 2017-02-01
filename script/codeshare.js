window.codeshare = (function(){
 "use strict";
 var room = document.getElementById("room");
 var roomInput = document.getElementById("roomInput");
 var errConsole = document.getElementById('err');

 var peer;

 function startServer() {
    roomInput.focus();

    stateEngine.changeHandler(null);
    // Server setup:
    var roomName = window.room.getName();
    room.value = roomName;

    peer = new Peer("CodeShare-"+roomName, {key: '1p6rpt2mga2a9k9'});
    peer.on('open', function(){beServer(peer)});

    peer.on('error', function(err){
        //if (err.type==='unavailable-id'){
            startServer();
    });
 }
    
 function joinRoom() {
    var v = roomInput.value;
    roomInput.value = '';
    if (peer && peer.destroy) 
        peer.destroy();
    peer = new Peer({key:'1p6rpt2mga2a9k9'}); // random id ok
    peer.on("open", function(id){
        var conn = peer.connect("CodeShare-"+v);
        conn.on('open', function(){ 
            room.value = v; 
            beClient(conn);
        });
    });
    peer.on('close', function(){errMsg("Closed");startServer();});
    peer.on('disconnected', function(){errMsg("Disconnected");startServer();});
    peer.on('error', function(e){errMsg("Error: "+e);startServer();});
 }

 function beClient(conn) {
     errMsg("Connected");
     conn.on('data', function(data){
         var patches = commitLog.finalize(data);
         patches.forEach(stateEngine.applyPatch);
     });

     conn.on('close', function(){errMsg("Closed");startServer();});
     conn.on('error', function(e){errMsg("Error: "+e);startServer();});

     // For Debug!
     console.log("Youre the client, updates blocked for now");
     stateEngine.readOnly(true);

     stateEngine.changeHandler(function(ch){
         commitLog.propose(ch);
         conn.send(ch);
     })
 }

 // V2 approved above here

 function beServer(peer) {
     var connections = [];
     var raft;
     peer.on('connection', function(conn){  // possibly > 1
         // setup gaggle, monaco
         connections.push(conn);
         errMsg(''+ connections.length + " connected");
         /*raft = gaggle({
            id: uuid.v4(),
            clusterSize: connections.length+1, //server too
            channel: {
                name: 'myOwn*****'
            }
         });*/
         stateEngine.getState().forEach(function(s){conn.send(s)});
         function removeConnection(){
             connections = connections.filter(function(c){ return c !== conn;});
             errMsg('Someone disconnected. '+connections.length+" remaining.");
         }
         conn.on('close', removeConnection);
         conn.on('error', removeConnection);
         stateEngine.changeHandler(function(ch){  // from, to, and uuid
             var patchesIGNORED = commitLog.finalize([ch]);
             connections.forEach(function(c){
                 c.send([ch]);
             });
         });
         conn.on('data', function(d){
             var patches = commitLog.merge(d);
             patches.forEach(function(p){
                 connections.forEach(function(c){
                     c.send(p);
                 });
             });
         });
     });
 }
 window.addEventListener('onbeforeunload', function(){ // clean-up old IDs
     peer.destroy();
 });


 var msgClear;
 function errMsg(m){
     errConsole.innerText = m;
     clearTimeout(msgClear);
     msgClear = setTimeout(function(){errConsole.innerText = ''}, 5000);
 }

 startServer();

 return {
     joinRoom: joinRoom
 }
})();