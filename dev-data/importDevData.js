const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Tour = require('./../models/tourModel');

dotenv.config({ path: './.env' });

const db = process.env.DB.replace('<PASSWORD>', process.env.DB_PASSWORD);

mongoose.connect(db).then(con => console.log('DB connected successfully!'));

const tours = JSON.parse(fs.readFileSync(`${__dirname}/data/tours.json`, 'utf-8'));

const importData = async () => {
  try {
    console.log(tours[0]);
    await Tour.create(tours);
    console.log('Data imported successfully!');
  } catch (error) {
    console.log(error);
  }

  process.exit();
};

const deleteData = async () => {
  try {
    await Tour.deleteMany();
    console.log('Data deleted successfully!');
  } catch (error) {
    console.log(error);
  }

  process.exit();
};

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}

// process.argv.map(arg => {
//   if (arg === '--import') {
//     importData();
//   } else if (arg === '--delete') {
//     deleteData();
//   }
// });

