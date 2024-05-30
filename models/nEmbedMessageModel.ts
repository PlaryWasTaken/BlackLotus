import mongoose, {HydratedDocument, HydratedDocumentFromSchema} from "mongoose";

const messageSchema = new mongoose.Schema({
    identifier: { type: Number, require: true, unique: true},
    msgId: {type: String},
    channelId: {type: String},
    guildId: {type: String},

    fieldNamePrefix: {type: String},

    title: { type: String },
    description: { type: String },
    image: { type: String },
    footer: {type: Object},
    color: {type: String},
})

const model = mongoose.model("message models", messageSchema);

module.exports = model;
export default model;

export type EmbedMessageModel = HydratedDocumentFromSchema<typeof messageSchema>