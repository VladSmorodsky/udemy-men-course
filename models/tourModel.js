const mongoose = require('mongoose');
const slugify = require('slugify');

const tourSchema = new mongoose.Schema({
    secret: {
      type: Boolean,
      default: false
    },
    name: {
      type: String,
      required: [true, 'Name value is required'],
      unique: true,
      trim: true,
      minLength: [10, 'Name value must be more then 10 symbols']
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'duration value is required']
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'maxGroupSize value is required']
    },
    difficulty: {
      type: String,
      required: [true, 'difficulty value is required'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty have values: easy, medium, difficult'
      }
    },
    ratingsAverage: Number,
    ratingsQuantity: {
      type: Number,
      default: 0
    },
    price: {
      type: Number,
      required: [true, 'Price value is required']
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function(val) {
          return val < this.price;
        },
        message: 'Discount ({VALUE}) can not be larger than price'
      }
    },
    summary: {
      type: String,
      trim: [true, 'Summary value is required']
    },
    description: {
      type: String,
      trim: true
    },
    imageCover: {
      type: String,
      required: [true, 'imageCover value is required']
    },
    images: [String],
    startLocation: {
      type: {
        type: String,
        default: 'Point',
        enum: ['Point']
      },
      coordinates: [Number],
      description: String,
      address: String
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point']
        },
        coordinates: [Number],
        description: String,
        day: Number
      }
    ],
    createDate: {
      type: Date,
      default: Date.now()
    },
    startDates: [Date]
  },
  {
    toJSON: {
      virtuals: true
    },
    toObject: {
      virtuals: true
    }
  }
);

tourSchema.virtual('durationWeeks').get(function() {
  return this.duration / 7;
});

tourSchema.pre('save', function(next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

tourSchema.pre(/^find/, function(next) {
  this.find({ secret: { $ne: true } });
  this.start = Date.now();
  next();
});

// tourSchema.post(/^find/, function(docs, next) {
//   console.log(`TIme duration: ${Date.now() - this.start} milisec`);
//   next();
// });

tourSchema.pre('aggregate', function(next) {
  console.log(this.pipeline().unshift([
    {
      $match: {
        secret: { $ne: true }
      }
    }
  ]));
  // this.pipeline().unshift([
  //   {
  //     $match: { secret: { $ne: true } }
  //   }
  // ]);
  next();
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;