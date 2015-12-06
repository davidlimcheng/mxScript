var fs = require('fs');
var inquirer = require('inquirer');
var csv = require('ya-csv');
var Promise = require('bluebird');

Promise.promisifyAll(fs);
Promise.promisifyAll(inquirer);
Promise.promisifyAll(csv);

var getFilename = function() {
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
  return new Promise(function(resolve) {
    parseFile()
      .then(function(domains) {
        console.log(domains);
      });
  });
};

runDig();
