var fs = require('fs');
var inquirer = require('inquirer');
var csv = require('ya-csv');
var Promise = require('bluebird');
var exec = Promise.promisify(require('child_process').exec);

Promise.promisifyAll(fs);
Promise.promisifyAll(inquirer);
Promise.promisifyAll(csv);

var getFilename = function() {
  console.log('\nReturned leads will be written to returnedLeads/leads.csv\nAny existing values will be overwritten.\n');
  var allCSVFiles = [];

  //Get list of all csv files in directory
  return new Promise(function(resolve) {
    fs.readdirAsync('csvFiles')
      .then(function(files) {
        for (var index in files) {
          var extension = files[index].split('.');
          if (extension[1] === 'csv') {
            allCSVFiles.push(files[index]);
          }
        }

        return allCSVFiles;
      })
      .then(function(allCSVFiles) {
        //Present list to user and get chosen file
        inquirer.promptAsync([
            {
              type: 'list',
              name: 'userChoice',
              message: 'Choose a file:',
              choices: allCSVFiles,
            },
          ], function(answer) {
          resolve(answer.userChoice);
        });
      })
      .catch(function(err) {
        throw err;
      });
  });
};

var parseFile = function() {
  var domains = [];
  return new Promise(function(resolve) {
    getFilename()
      .then(function(filename) {
        var reader = csv.createCsvFileReader('csvFiles/' + filename);
        return reader;
      })
      .then(function(reader) {
        reader.addListenerAsync('data', function(data) {
          domains.push(data[0]);
          resolve(domains);
        });
      })
      .catch(function(err) {
        throw err;
      });
  });
};

var runDig = function() {
  var timestamp = new Date();
  var leads = ['Returned leads (' + timestamp.toDateString() + '):'];
  var containsASPMX = function(e) {
    return new Promise(function(resolve) {
      exec('dig mx ' + e, function(error, stdout, stderr) {
        if (stdout.indexOf('ANSWER SECTION') === -1) {
          resolve(leads);
        } else {
          if (stdout.indexOf('aspmx') === -1) {
            leads.push(e);
            resolve(leads);
          } else {
            resolve(leads);
          }
        }
      });
    });
  };

  return new Promise(function(resolve) {
    parseFile()
      .then(function(domains) {
        Promise.each(domains, containsASPMX)
        .then(function() {
          resolve(leads);
        })
        .catch(function(err) {
          throw err;
        });
      });
  });
};

var writeLeads = function() {
  runDig()
    .then(function(leads) {
      console.log('Writing to file...');
      var writer = csv.createCsvFileWriter('returnedLeads/leads.csv', {flags: 'w', separator: '\n'});
      writer.writeRecordAsync(leads);
      writer.writeStream.end();
      console.log('Complete.');
    });
};

writeLeads();
