const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on('uncaughtException', error => {
  console.log(error.name, error.message);
  process.exit(1);
});

dotenv.config({ path: './.env' });

const db = process.env.DB.replace('<PASSWORD>', process.env.DB_PASSWORD);

mongoose.connect(db).then(con => console.log('DB connected successfully!'));

const app = require('./app');

const port = process.env.PORT || 3001;

const server = app.listen(port, () => {
  console.log(`Server running on port ${port}...`);
});

process.on('unhandledRejection', (error) => {
  console.log(error.name, error.message);
  server.close();
  process.exit(1);
});