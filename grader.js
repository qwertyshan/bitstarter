#!/usr/bin/env node

var sys = require('util');
var rest = require('restler');
var fs = require('fs');
var program = require('commander');
var cheerio = require('cheerio');
var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";
var URL_DEFAULT = "http://mysterious-chamber-6674.herokuapp.com";
var DOWNLOAD_FILE = "tempDownload.html";


var getWebFile = function(fileurl) {
    rest.get(fileurl).on('complete', function(response){
	if (response instanceof Error) {
	    console.log('Error in file download: ' + result.message);
	    process.exit(1);
	} else {
	    fs.writeFile(DOWNLOAD_FILE, response, function(err) {
		if(err) {
		    console.log(err);
		    process.exit(1);
		} else {
//		    console.log("File tempDownload.html was written!");
		    return cheerioHtmlFile(DOWNLOAD_FILE);
		}
	    });
	}
    });
};



var assertFileExists = function(infile) {
    var instr = infile.toString();
    if (!fs.existsSync(instr)) {
	console.log("%s does not exist. Exiting.", instr);
	process.exit(1);
    }return instr;
};

var cheerioHtmlFile = function(htmlfile) {
    return cheerio.load(fs.readFileSync(htmlfile));
};

var loadChecks = function(checksfile) {
    return JSON.parse(fs.readFileSync(checksfile));
};

var checkHtmlFile = function(htmlfile, checksfile) {
    if (htmlfile.substring(0,5)=='http:') {
	getWebFile(htmlfile);
	$ = cheerioHtmlFile(DOWNLOAD_FILE);
    } else {
	$ = cheerioHtmlFile(htmlfile);
    }  
    var checks = loadChecks(checksfile).sort();
    var out = {};
    for(var ii in checks) {
	var present = $(checks[ii]).length > 0;
	out[checks[ii]] = present;
    }
    return out; 
};



var clone = function(fn) {
    return fn.bind({});
};

if (require.main == module) {
    program
         .option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
         .option('-f, --file <html_file>', 'Path to index.html', clone(assertFileExists), HTMLFILE_DEFAULT)
         .option('-u, --url <url>', 'URL for html file')
	 .parse(process.argv);
    if (program.url) {
	var checkJson = checkHtmlFile(program.url, program.checks);
    } else {
	var checkJson = checkHtmlFile(program.file, program.checks);
    }
    var outJson = JSON.stringify(checkJson, null, 4);
    console.log(outJson);
} else {
    exports.checkHtmlFile = checkHtmlFile;
}


