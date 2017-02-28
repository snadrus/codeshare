/*
Although the source is left readable for auditing & open-ness, this source code is not
free software and requires a licence for use. 
*/
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
        beClient(conn, v);

    });
    peer.on('close', function(){errMsg("Closed");startServer();});
    peer.on('disconnected', function(){errMsg("Disconnected");startServer();});
    peer.on('error', function(e){errMsg("Error: "+e);startServer();});
 }

 function beClient(conn, v) {
    conn.on('open', function(){ 
        room.value = v; 
        errMsg("Connected");
        conn.send({type: "base-request"});
    });
    conn.on('data', function(data){
         if (data.type==="base"){
             ct.I_AM(peer.id, data, errMsg, stateEngine.applyPatch);
         } else {
             ct.FromServer(data, stateEngine.applyPatch);
         }
     });

    conn.on('close', function(){errMsg("Closed");startServer();});
    conn.on('error', function(e){errMsg("Error: "+e);startServer();});

    // For Debug!
    stateEngine.changeHandler(function(ch){
        if (ct.ClientSelfChange(ch)) {
            conn.send(ch);
        }
     })
 }

 // V2 approved above here

 function beServer(peer) {
     var connections = [];
     stateEngine.onLoad(function(){
         ct.I_AM(peer.id, stateEngine.getState(), errMsg, function(){});
     });
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
         function removeConnection(){
             connections = connections.filter(function(c){ return c !== conn;});
             errMsg('Someone disconnected. '+connections.length+" remaining.");
         }
         conn.on('close', removeConnection);
         conn.on('error', removeConnection);
         stateEngine.changeHandler(function(ch){  // from, to, and uuid
             ct.ServerSelfChange(ch); // Names it & records it
             connections.forEach(function(c){
                 c.send(ch);
             });
         });
         conn.on('data', function(d){
             if (d.type==="base-request"){
                 conn.send(stateEngine.getState());
                 return;
             }
             var v = ct.FromClient(d, stateEngine.applyPatch);
             if (v){
                connections.forEach(function(c){
                    c.send(v);
                });
             }
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