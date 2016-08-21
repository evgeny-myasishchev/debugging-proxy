function toBuffer(stream, cb) {
  const bufs = [];
  stream.on('data', (d) => bufs.push(d));
  stream.on('end', () => cb(null, Buffer.concat(bufs)));
}

module.exports = {
  toBuffer,
};
