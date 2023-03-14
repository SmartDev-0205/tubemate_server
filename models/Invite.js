const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const inviteSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User" },
    invited: { type: Schema.Types.ObjectId, ref: "User" },
  },
  {
    timestamps: true,
  }
);

const Invite = mongoose.model("Invite", inviteSchema);

module.exports = Invite;
