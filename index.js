var fs = require('fs');
var inquirer = require('inquirer');
var Promise = require('bluebird');
Promise.promisifyAll(fs);
Promise.promisifyAll(inquirer);

var getFile = function() {
  var allFiles = [];

  //Get list of all csv files in directory
  return new Promise(function(resolve) {
    fs.readdirAsync('csvFiles')
      .then(function(files) {
        for (var index in files) {
          var extension = files[index].split('.');
          if (extension[1] === 'csv') {
            allFiles.push(files[index]);
          }
        }

        return allFiles;
      })
      .then(function(allFiles) {
        //Present list to user and get chosen file
        inquirer.promptAsync([
            {
              type: 'list',
              name: 'userChoice',
              message: 'Choose a file:',
              choices: allFiles,
            },
          ], function(answer) {
          console.log('You have chosen: ' + answer.userChoice);
          resolve(answer.userChoice);
        });
      })
      .catch(function(err) {
        throw err;
      });
  });
};

var parseFile = function() {

};
