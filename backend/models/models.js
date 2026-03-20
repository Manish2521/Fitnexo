const mongoose = require('mongoose')

// ─── Attendance ───────────────────────────────────────────────────────────────
const attSchema = new mongoose.Schema({
  gymId:      { type: mongoose.Schema.Types.ObjectId, required: true },
  memberId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true },
  checkinAt:  { type: Date, default: Date.now },
  checkoutAt: Date,
  method:     { type: String, enum: ['biometric','qr','manual'], default: 'manual' },
  deviceSn:   String,
}, { timestamps: false })

attSchema.index({ gymId: 1, checkinAt: -1 })
attSchema.index({ memberId: 1, checkinAt: -1 })

// ─── Payment ─────────────────────────────────────────────────────────────────
const paySchema = new mongoose.Schema({
  gymId:      { type: mongoose.Schema.Types.ObjectId, required: true },
  memberId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Member' },
  memberName: { type: String, default: '' },
  plan:       { type: String, default: '' },
  amount:     { type: Number, required: true, min: 0 },
  method:     { type: String, enum: ['cash','upi','card','netbanking'], default: 'cash' },
  invoiceNo:  { type: String, unique: true, sparse: true },
  status:     { type: String, enum: ['paid','due','overdue'], default: 'paid' },
  notes:      { type: String, default: '' },
  collectedBy:{ type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true })

paySchema.index({ gymId: 1, createdAt: -1 })

paySchema.pre('save', async function (next) {
  if (!this.invoiceNo) {
    const count = await mongoose.model('Payment').countDocuments({ gymId: this.gymId })
    this.invoiceNo = `INV-${String(count + 1).padStart(4, '0')}`
  }
  next()
})

// ─── Staff ───────────────────────────────────────────────────────────────────
const staffSchema = new mongoose.Schema({
  gymId:    { type: mongoose.Schema.Types.ObjectId, required: true },
  name:     { type: String, required: true, trim: true },
  role:     { type: String, default: 'Staff' },
  phone:    { type: String, trim: true },
  email:    { type: String, lowercase: true, trim: true },
  salary:   { type: Number, default: 0 },
  joinDate: Date,
  status:   { type: String, enum: ['active','inactive','leave'], default: 'active' },
  address:  String,
}, { timestamps: true })

staffSchema.index({ gymId: 1 })

// ─── Lead ────────────────────────────────────────────────────────────────────
const leadSchema = new mongoose.Schema({
  gymId:       { type: mongoose.Schema.Types.ObjectId, required: true },
  name:        { type: String, required: true, trim: true },
  phone:       { type: String, trim: true },
  email:       { type: String, lowercase: true, trim: true },
  source:      { type: String, default: 'Walk-in' },
  interest:    { type: String, default: 'General Fitness' },
  status:      { type: String, enum: ['hot','warm','cold','converted'], default: 'warm' },
  followupDate:Date,
  notes:       { type: String, default: '' },
  assignedTo:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  convertedMemberId: { type: mongoose.Schema.Types.ObjectId, ref: 'Member' },
}, { timestamps: true })

leadSchema.index({ gymId: 1, status: 1 })

module.exports.Attendance = mongoose.model('Attendance', attSchema)
module.exports.Payment    = mongoose.model('Payment',    paySchema)
module.exports.Staff      = mongoose.model('Staff',      staffSchema)
module.exports.Lead       = mongoose.model('Lead',       leadSchema)
