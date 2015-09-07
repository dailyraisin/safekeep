'use strict';

var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp');
var mv = require('mv');
var Rsync = require('rsync');

var source = process.argv[2];
var dest = process.argv[3];


function Inkwell (source, dest) {
    this.source = source;
    this.dest = dest;
    //var ignore = "";
    //var self = this;
}

Inkwell.prototype.initialize = function() { // verify that there are two arguments, source and destination, and that source is a directory
    var self = this;
    if (this.source === undefined) {
        console.log("Usage: inkwell source destination");
        process.exit(1);
    }

    else if (this.dest === undefined) {
        console.log("Usage: inkwell source destination");
        process.exit(1);
    }

    if (fs.lstatSync(this.source).isDirectory() === false) {
        console.log(self.source + " is not a directory. I can only back up directories.");
        process.exit(1);
    }
    this.formatArgs();
};

Inkwell.prototype.formatArgs = function() { // make sure source and dest are full paths, remove trailing slashes, avoid double nesting, add basename of source to destination
    var self = this;
    this.source = path.resolve(this.source); // return absolute path and remove possible trailing slash
    this.dest = path.resolve(this.dest);

    if (path.basename(this.dest) == path.basename(this.source )) {
        self.dest = path.dirname(self.dest);
    }

    dest = dest + "/" + path.basename(this.source);
    //console.log ("this should be absolute path:" + self.dest + self.source);

    this.finalVariables();
};


Inkwell.prototype.finalVariables = function() {
    this.ignore = this.source + "/.backupignore";
    this.date = new Date().yyyymmddHHMMSS();
    this.incomplete = this.dest + "/incomplete-back-" + this.date;
    this.complete = this.dest + "/back-" + this.date;
    this.current = this.dest + "/current";
    this.linkDest = this.current;
    this.finalChecklist();
};


Inkwell.prototype.finalChecklist = function() { //ensure destination folders exist, ignore exists
    var self = this;
    mkdirp(this.dest, function (err) {
        if (err) {
            console.log("Unable to create " + self.dest);
            process.exit(1);
        }
        else console.log("Created " + self.dest);
    });
    mkdirp(this.complete, function (err) {
        if (err) {
            console.log("Unable to create " + self.complete);
            process.exit(1);
        }
        else console.log("Created " + self.complete);
    });
    mkdirp(this.current, function (err) {
        if (err) {
            console.log("Unable to create " + self.current);
            process.exit(1);
        }
        else console.log("Created " + self.current);
    });
    fs.access(this.dest, fs.W_OK, function(err) {
        if (err) {
            console.log(self.dest + " is not writable");
            process.exit(1);
        }
    });
    fs.access(this.ignore, fs.R_OK, function(err) { // if IGNORE file doesn't exist, exit
        if (err) {
            console.log(self.ignore + " does not exist");
            process.exit(1);
        }
    });
    this.rSync();
};


Inkwell.prototype.rSync = function() {
    var self = this;
    var rsync = new Rsync()
    .flags('az')
	  .set('delete')
	  .set('delete-excluded')
	  .set('exclude-from', this.ignore)
	  .set('link-dest', this.linkDest)
	  .source(this.source)
	  .destination(this.incomplete);

    //console.log(rsync.command()); //prints rsync command as if in bash
    rsync.execute(function(error, code, cmd){
        if (code === 0) { //exit code 0 means rsync was successful
            self.moveToComplete();
        }
        else {
            console.log("rsync was unsuccessful " + cmd);
            process.exit(1);
        }
    });
    
    
};

Inkwell.prototype.moveToComplete = function() {
    console.log("Now's the time to move incomplete to complete.");
    mv(this.incomplete, this.complete, function(err) {});
    this.clearOldLink();
};

Inkwell.prototype.clearOldLink = function() {
    console.log("Now's the time to clear /current");
    fs.unlink(this.current, function(){}); //maybe put makeNewLink as callback
    this.makeNewLink();
};

Inkwell.prototype.makeNewLink = function() {
    console.log("Now's the time to link /current");
    fs.symlink(this.current, path.basename(this.complete) + "/", function(){}); //not sure about order here
};

Date.prototype.yyyymmddHHMMSS = function(){
    var yyyy = this.getFullYear().toString();
    var mm = (this.getMonth()+1).toString(); // getMonth() is zero-based
    var dd = this.getDate().toString();
    var HH = this.getHours().toString();
    var MM = this.getMinutes().toString();
    var SS = this.getSeconds().toString();
    return yyyy + "-"+ (mm[1]?mm:"0"+mm[0]) + "-" + (dd[1]?dd:"0"+dd[0]) + "." + HH + "-" + MM + "-" + SS; // padding
};




var inkwell = new Inkwell(source, dest);
inkwell.initialize();
