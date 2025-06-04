import mongoose from 'mongoose';

const SettingSchema = new mongoose.Schema({
  minStockThreshold: {
    type: Number,
    default: 10
  },
  company: {
    name: {
      type: String,
      default: 'O.T.R.A FOOD DISTRIBUTION'
    },
    address: {
      type: String,
      default: ''
    },
    phone: {
      type: String,
      default: ''
    },
    email: {
      type: String,
      default: ''
    },
    logo: {
      type: String,
      default: ''
    }
  },
  locale: {
    language: {
      type: String,
      default: 'en'
    },
    currency: {
      type: String,
      default: 'USD'
    },
    dateFormat: {
      type: String,
      default: 'MM/DD/YYYY'
    }
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

const Setting = mongoose.model('Setting', SettingSchema); 

export default Setting; 