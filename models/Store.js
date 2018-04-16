const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const slug = require('slugs');

const storeSchema = new mongoose.Schema({
  name: {
    type: String, 
    trim: true,
    required: 'Please, enter a store name',
  },
  slug: String,
  description: {
    type: String,
    trim: true,
  },
  tags: [String],
  created: {
    type: Date,
    default: Date.now()
  },
  location: {
    type: {
      type: String,
      default: 'Point',
    },
    coordinates: [{
      type: Number,
      required: 'You must supply coordinates!'
    }],
    address: {
      type: String,
      required: 'You must supply a valid address!'
    }
  },
  photo: {
    type: String,
    required: false,
  }
});

storeSchema.pre('save', async function(next) {
  if (!this.isModified('name')) {
    next();
  }
  this.slug = slug(this.name);
  // generate correct slug for stores with similar names
  const slugRegex = new RegExp(`^(${this.slug})((-[0-9]*$)?)$`, 'i');
  const storesWithSlug = await this.constructor.find({ slug: slugRegex });
  if (storesWithSlug.length) {
    this.slug = `${this.slug}-${this.slug}-${storesWithSlug.length + 1}`;
  }
  next();
});

module.exports = mongoose.model('Store', storeSchema);