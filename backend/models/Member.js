const mongoose = require('mongoose')

const schema = new mongoose.Schema({
  gymId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  memberCode: { type: String },
  firstName:  { type: String, required: true, trim: true },
  lastName:   { type: String, trim: true, default: '' },
  phone:      { type: String, required: true, trim: true },
  email:      { type: String, lowercase: true, trim: true, default: '' },
  dob:        Date,
  gender:     { type: String, enum: ['male','female','other'], default: 'male' },
  address:    { type: String, default: '' },
  plan:       { type: String, default: 'Standard 1M' },
  joinDate:   { type: Date, default: Date.now },
  expiryDate: Date,
  status:     { type: String, enum: ['active','expired','expiring','frozen'], default: 'active' },
  balanceDue: { type: Number, default: 0 },
  biometricId:Number,
  notes:      { type: String, default: '' },
}, { timestamps: true })

schema.index({ gymId: 1, status: 1 })
schema.index({ gymId: 1, phone: 1 })
schema.index({ gymId: 1, expiryDate: 1 })

schema.pre('save', async function (next) {
  if (!this.memberCode) {
    const count = await mongoose.model('Member').countDocuments({ gymId: this.gymId })
    this.memberCode = `M${String(count + 1).padStart(4, '0')}`
  }
  // auto set status based on expiry
  if (this.expiryDate) {
    const days = Math.ceil((this.expiryDate - new Date()) / (1000 * 60 * 60 * 24))
    if (days < 0) this.status = 'expired'
    else if (days <= 7) this.status = 'expiring'
    else this.status = 'active'
  }
  next()
})

module.exports = mongoose.model('Member', schema)
