import mongoose from "mongoose";

const keySchema = new mongoose.Schema({
    id: { type: Number, require: true },
    reportedIds: [{ type: String }],
    reason: { type: String },
    images: { type: Array },
    userId: { type: String },
    guildId: { type: String },
    level: { type: Number },
})

const model = mongoose.model("Reports Black", keySchema);

module.exports = model;
export default model;