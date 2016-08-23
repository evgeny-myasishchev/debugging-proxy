process.env.NODE_ENV = process.env.NODE_ENV || 'development';
const app = require('./app');

app.start((err) => {
  if (err) throw err;
});
