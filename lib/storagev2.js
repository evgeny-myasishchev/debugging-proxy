class Storage {
  constructor(db, streamsDir) {
    this.db = db;
    this.streamsDir = streamsDir;
  }

  saveRequest(req, cb) {
    return cb(new Error('Not implemented'));
  }
}

module.exports = Storage;
