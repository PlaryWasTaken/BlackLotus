import mongoose from "mongoose";

const keySchema = new mongoose.Schema({
    identifier: { type: Number, require: true, unique: true},
    title: { type: String },
    description: { type: String },
    image: { type: String },
    footer: {type: Object},
    color: {type: String},
    msgId: {type: String},
    channelId: {type: String},
    guildId: {type: String},
    fieldNamePrefix: {type: String}
})

const model = mongoose.model("message models", keySchema);

module.exports = model;
export default model;