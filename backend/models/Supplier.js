import mongoose from 'mongoose';

const supplierSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a supplier name'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  phone: {
    type: String,
    required: [true, 'Please add a phone number']
  },
  city: {
    type: String,
    required: false
  },
  company: {
    type: String,
    required: [true, 'Please add a company name']
  },
  contactPerson: {
    type: String,
    required: false
  },
  paymentTerms: {
    type: String,
    required: false,
    default: 'Net 30'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Supplier = mongoose.model('Supplier', supplierSchema);

export default Supplier; 