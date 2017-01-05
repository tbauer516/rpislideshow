var Module;
if (typeof Module === 'undefined') Module = eval('(function() { try { return Module || {} } catch(e) { return {} } })()');

(function() {
    function runWithFS() {

        function assert(check, msg) {
            if (!check) throw msg + new Error().stack;
        }

        /*
        FS_createPath....
        First param is the 'virtual' directory within emscripten..
        Second is the name of the file/folder

        Folders just need 4 params
        Module['FS_createPath']('/', 'en-us', true, true);
        Files need 5
        Module['FS_createLazyFile']('/', '0857.dic', '../../speechModels/0857.dic', true, false);

        For files the third param is the path (relaitve to the webworker's directory) to the file to load
        */

        Module['FS_createPath']('/', 'modelFiles', true, true);

        Module['FS_createLazyFile']('/', 'keyphrase.list', '../lib/keyphrase.list', true, false);
        Module['FS_createLazyFile']('/', 'keyphrase.dict', '../lib/keyphrase.dict', true, false);

        //These are files that are commonly found in an acoustic model
        // var items = ['feat.params',
        // 'mdef',
        // 'means',
        // 'mixture_weights',
        // 'noisedict',
        // 'sendump',
        // 'transition_matrices',
        // 'variances'];
        // 
        // for(var i=0; i<items.length; i++){
        //     Module['FS_createLazyFile']('/en-us', items[i], '../../speechModels/en-us/' + items[i], true, false);
        // }
    }


    if (Module['calledRun']) {
        runWithFS();
    } else {
        if (!Module['preRun']) Module['preRun'] = [];
        Module["preRun"].push(runWithFS); // FS is not initialized yet, wait for it
    }

})();
