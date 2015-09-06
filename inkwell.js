var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp');
//var Rsync = require('rsync');

var SOURCE = process.argv[2];
var DEST = process.argv[3];


if (SOURCE === undefined) {
  console.log("Usage: inkwell source destination");
  process.exit(1);
}

else if (DEST === undefined) {
  console.log("Usage: inkwell source destination");
  process.exit(1);
}

if (fs.lstatSync(SOURCE).isDirectory() === false) {
  console.log(SOURCE + " is not a directory. I can only back up directories.");
  process.exit(1);
}

SOURCE = path.resolve(SOURCE); // return absolute path and remove possible trailing slash
DEST = path.resolve(DEST);

var IGNORE = SOURCE + "/.backupignore";

if (path.basename(DEST) == path.basename(SOURCE)) {
  DEST = path.dirname(DEST);
}

DEST = DEST + "/" + path.basename(SOURCE);
console.log (DEST);

/*var d = new Date();
var DATE = d.yyyymmddHHMMSS();
var INCOMPLETE = DEST + "/incomplete-back-" + DATE;
var COMPLETE = DEST + "/back-" + DATE;
var CURRENT = DEST + "/current";
*/
if (fs.lstatSync(DEST).isDirectory() === false) {
  mkdirp(DEST, function (err) {
    if (err) {
      console.log("Unable to create destination directory.");
      process.exit(1);
    }
    else console.log("Created " + DEST);
  });
}

/*
var rsync = new Rsync()
	.flags('az')
	.source(SOURCE)
	.destination(INCOMPLETE);

rsync.execute(function(error, code, cmd){

});


console.log(rsync.command()); //prints rsync command as if in bash
*/
Date.prototype.yyyymmddHHMMSS = function(){
  var yyyy = this.getFullYear().toString();
  var mm = (this.getMonth()+1).toString(); // getMonth() is zero-based
  var dd = this.getDate().toString();
  var HH = this.getHours().toString();
  var MM = this.getMinutes().toString();
  var SS = this.getSeconds().toString();
  return yyyy + "-"+ (mm[1]?mm:"0"+mm[0]) + "-" + (dd[1]?dd:"0"+dd[0]) + "." + HH + "-" + MM + "-" + SS; // padding
};