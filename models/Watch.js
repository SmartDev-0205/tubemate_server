const mongoose = require("mongoose")
const Schema = mongoose.Schema

const watchSchema = new Schema({
  user: {type: Schema.Types.ObjectId, ref: "User"},
  
}, {
  timestamps: true
})