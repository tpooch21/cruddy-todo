const fs = require('fs');
const path = require('path');
const _ = require('underscore');
const counter = require('./counter');

const promise = require('bluebird');
const readFilePromise = promise.promisify(fs.readFile);
var items = {};

// Public API - Fix these CRUD functions ///////////////////////////////////////

exports.create = (text, callback) => {

  console.log('testing create feature...');

  counter.getNextUniqueId((error, id) => {
    console.log('logging from create (id)=> ', id);
    // create the path with a file name starting with id.text
    var filePath = path.join(exports.dataDir, `${id}.txt`);
    console.log(filePath);
    // write to path file
    fs.writeFile(filePath, text, (err) => {
      if (err) {
        callback(err);
      } else {
        callback(null, { id, text });
      }
    })
  });
};

exports.readAll = (callback) => {
  // Read the file directory of dataDir
  fs.readdir(exports.dataDir, (error, files) => {
    if (error) {
      callback(error);
    } else {
      var data = _.map(files, (file) => {

        console.log('inside map function (file)=>', file);
        var id = file.slice(0, 5);
        console.log('inside map function (id)=>', id, file);

        var filePath = path.join(exports.dataDir, file);

        return readFilePromise(filePath).then(fileData => {
            console.log('todos => ', { id: id, text: fileData.toString()})
            return { id: id, text: fileData.toString()};
          });
      });

      console.log('data => ', data)

      promise.all(data).then(items => callback(null, items), (error) => callback(error));

    }
  })
  // Error callback
  // if error, throw callback error
  //

  // var data = _.map(items, (text, id) => {
  //   return { id, text };
  // });
  // callback(null, data);
};

exports.readOne = (id, callback) => {
  var filePath = path.join(exports.dataDir, `${id}.txt`);
  fs.readFile(filePath, (error, fileData) => {
    if (error) {
      callback(error);
    } else {
      callback(null, { id: id, text: fileData.toString() });
    }
  });
};

exports.update = (id, text, callback) => {
  var filePath = path.join(exports.dataDir, `${id}.txt`);
  fs.writeFile(filePath, text, (error) => {
    if (error) {
      callback(error);
    } else {
      callback(null, { id, text });
    }
  })
};

exports.delete = (id, callback) => {
  var item = items[id];
  delete items[id];
  if (!item) {
    // report an error if item not found
    callback(new Error(`No item with id: ${id}`));
  } else {
    callback();
  }
};

// Config+Initialization code -- DO NOT MODIFY /////////////////////////////////

exports.dataDir = path.join(__dirname, 'dataDir');

exports.initialize = () => {
  if (!fs.existsSync(exports.dataDir)) {
    fs.mkdirSync(exports.dataDir);
  }
};
