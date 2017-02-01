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
            chFunc({item: "fulltext", from: currentText,to: newVal});
            currentText = newVal
        });
        editor.onDidChangeCursorPosition(function(e){
        position = [e.position.column, e.position.lineNumber];
        })
    });

    var updateInProgress;
    function applyPatch(patch){
        updateInProgress = true;
        try{
        switch(patch.item){
            case "languageSelect": languageTag.value = patch.to; break;
            case "fulltext": editor.setValue(patch.to); break; // hokey solution for now
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
        return [
            {item: "languageSelect", to: languageTag.value},
            {item: "fulltext", to: currentText}
        ];
    }
    return {
        changeHandler: function(chFuncReq){ chEvt = chFuncReq; },
        applyPatch: applyPatch,
        readOnly: function(b){ 
                editor.updateOptions({readOnly:b}); 
                languageTag.disabled = b;
            },
        getState: getState
    }
})();