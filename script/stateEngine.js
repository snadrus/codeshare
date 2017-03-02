window.stateEngine = (function(){
    var languageTag = document.getElementById("languageSelect");
    var currentLanguage = 'javascript';
    var currentText = [
                'function x() {',
                '\tconsole.log("Hello world!");',
                '}'
            ].join('\n');
    var editor;
    var position;
    var runOnLoad;

    require.config({ paths: { 'vs': '/node_modules/monaco-editor/min/vs' }});
    require(['vs/editor/editor.main'], function() {
        function createEditor() {
            editor = monaco.editor.create(document.getElementById('container'), {
                value: currentText,
                language: currentLanguage,
                fontFamily: "Hack",
                fontSize: 15
            });
        }
        createEditor();
        monaco.languages.getLanguages().forEach(function(lang){         // Get languages
            var opt = document.createElement("option");
            opt.value = lang.id;
            opt.innerText = lang.id;
            if (lang.id === currentLanguage) {
                opt.selected = true;
            }
            languageTag.appendChild(opt);
        });
        languageTag.onchange = function(e) {
            monaco.editor.setModelLanguage(editor.getModel(), languageTag.value);
            chFunc({item: "languageSelect", from: currentLanguage, to: languageTag.value});
            currentLanguage = languageTag.value;
        }

        // Setup monaco listeners for text change
        editor.onDidChangeModelContent(function(e){
            var newVal = editor.getValue();
            var range = [e.range.startLineNumber, e.range.startColumn, e.range.endLineNumber, e.range.endColumn];
            chFunc({item: "text", from: currentText,to: {range: range, text: e.text, val: newVal}});
            currentText = newVal
        });
        editor.onDidChangeCursorPosition(function(e){
            var tmp = [e.position.lineNumber, e.position.column];
            chFunc({item: "cursor:"+returnable.peerId, from: position, to: tmp});
            position = tmp;
        });
        document.getElementById('themeSelect').onchange = function(e){
            editor.updateOptions({theme: e.target.value});
            if (e.target.value === 'vs') {
                document.body.classList.remove('dark');
            } else {
                document.body.classList.add('dark');
            }
        }
        if (runOnLoad){
            runOnLoad();
        }
    });

    function patchText(val){
        if (val.to.range){
            editor.executeEdits("peer",[{ 
                identifier: val.id, 
                range: new monaco.Range(val.to.range[0], val.to.range[1], val.to.range[2], val.to.range[3]),  // startLine, startCol, EndLine, endCol
                text: val.to.text
            }]);
            if (editor.getValue() !== val.to.val) {
                console.log("bad merge");
                editor.setValue(val.to.val);
                editor.setPosition(position);
            }
        } else {
            editor.setValue(val.to);
        }
        currentText = editor.getValue();
    }

    var cursors = {}, decorations = [];
    function patchCursors(id, val){
        if (id===returnable.peerId)
            return;
        cursors[id] = val;
        decorations = editor.deltaDecorations(decorations, 
            Object.keys(cursors).map(function(peer){
                var pos = cursors[peer];
                return {
                    range: new monaco.Range(pos[0],pos[1],pos[0], pos[1]+1),
                    options: { inlineClassName: 'remoteCursor'}
                };
            })
        );
    }

    var updateInProgress;
    function applyPatch(patch){
        updateInProgress = true;
        try{
        switch(patch.item){
            case "languageSelect": languageTag.value = patch.to; break;
            case "text": patchText(patch);
            default:
                if (patch.item.slice(0,7)==="cursor:"){
                    patchCursors(patch.item.slice(7), patch.to);
                }
        }
        }catch(e){

        }
        updateInProgress = false;
    }

    var chEvt;
    function chFunc(patch) {
        if (updateInProgress || !chEvt) {
            return
        }
        chEvt(patch);
    }

    function getState() {
        var v= {val: [
                {item: "languageSelect", to: languageTag.value},
                {item: "text", to: currentText}
            ],
            type:"base"
        };
        return v;
    }
    var returnable = {
        changeHandler: function(chFuncReq){ chEvt = chFuncReq; },
        applyPatch: applyPatch,
        getState: getState,
        onLoad: function(f){ runOnLoad = f;},
        peerId: ""
    }
    return returnable;
})();