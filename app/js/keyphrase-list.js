
var Module;

if (typeof Module === 'undefined') Module = eval('(function() { try { return Module || {} } catch(e) { return {} } })()');

if (!Module.expectedDataFileDownloads) {
  Module.expectedDataFileDownloads = 0;
  Module.finishedDataFileDownloads = 0;
}
Module.expectedDataFileDownloads++;
(function() {
 var loadPackage = function(metadata) {

  function runWithFS() {

    function assert(check, msg) {
      if (!check) throw msg + new Error().stack;
    }
var fileData0 = [];
fileData0.push.apply(fileData0, [77, 65, 71, 73, 67, 32, 87, 69, 65, 84, 72, 69, 82, 32, 47, 49, 46, 48, 47, 10, 77, 65, 71, 73, 67, 32, 67, 76, 79, 83, 69, 32, 47, 49, 46, 48, 47, 10]);
Module['FS_createDataFile']('/', 'keyphrase.list', fileData0, true, true, false);

  }
  if (Module['calledRun']) {
    runWithFS();
  } else {
    if (!Module['preRun']) Module['preRun'] = [];
    Module["preRun"].push(runWithFS); // FS is not initialized yet, wait for it
  }

 }
 loadPackage({"files": []});

})();
