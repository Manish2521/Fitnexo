const mongoose = require('mongoose')
const bcrypt   = require('bcryptjs')

const schema = new mongoose.Schema({
  gymName:  { type: String, default: 'My Gym' },
  name:     { type: String, required: true, trim: true },
  email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone:    { type: String, trim: true },
  password: { type: String, required: true, minlength: 6 },
  role:     { type: String, enum: ['admin','manager','trainer','receptionist'], default: 'admin' },
  city:     String,
  plan:     { type: String, default: 'pro' },
  isActive: { type: Boolean, default: true },
}, { timestamps: true })

schema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()
  this.password = await bcrypt.hash(this.password, 12)
  next()
})

schema.methods.comparePassword = function (pw) {
  return bcrypt.compare(pw, this.password)
}

schema.methods.toJSON = function () {
  const obj = this.toObject()
  delete obj.password
  return obj
}

module.exports = mongoose.model('User', schema)
