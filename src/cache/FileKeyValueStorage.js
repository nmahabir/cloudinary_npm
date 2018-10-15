const fs = require('fs');
const path = require('path');
const rimraf = require('../utils/rimraf');

class FileKeyValueStorage {
  constructor({baseFolder} = {}) {
    this.init(baseFolder);
  }

  init(baseFolder) {
    if (baseFolder) {
      fs.access(baseFolder, (err, result) => {
        if (err) throw err;
        this.baseFolder = baseFolder;
      });
    } else {
      fs.mkdtemp('cloudinary_cache_', (err, folder) => {
        if (err) throw err;
        console.info("Created temporary cache folder at " + folder);
        this.baseFolder = folder;
      })
    }
  }

  get(key) {
    let value = fs.readFileSync(this.getFilename(key));
    try {
      return JSON.parse(value);
    } catch(e) {
      throw "Cannot parse cache value";
    }
  }

  set(key, value) {
    fs.writeFileSync(this.getFilename(key), JSON.stringify(value));
  }

  clear() {
    let files = fs.readdirSync(this.baseFolder);
    for(let file of files) {
      fs.unlinkSync(path.join(this.baseFolder, file));
    }
  }

  deleteBaseFolder() {
    rimraf(this.baseFolder);
  }

  getFilename(key) {
    return path.format({name: key, ext: '.json', dir: this.baseFolder});
  }

}

module.exports = FileKeyValueStorage;