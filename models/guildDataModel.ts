import mongoose from "mongoose";

const keySchema = new mongoose.Schema({
    id: { type: String, require: true, unique: true },
    blacklisted: { type: Boolean, require: false, default: false },
    blackLotus: {
        displayName: {type: String, require: true },
        invite: { type: String, require: true },
        constelation: {type: mongoose.Types.ObjectId, ref: 'Constelations'},
        representant: {type: String, require: true },
        staffs: {type: Array, require: true },
        role: {type: String, require: true },
        embedWorthy: {type: Boolean, require: true, default: true },
        trackGrowth: {type: Boolean, require: false, default: true },
        trackNameChanges: {type: Boolean, require: false, default: true },
    },
    partnerships: {
        channelId: { type: String, require: true }, // Channel id of the partnerships channel
        mentionId: { type: String, require: true }, // Mention id of the partnerships role
        message: { type: String, require: true }, // Guild defined message to send when making partnerships
        timer: {type: Number, require: false, default: 0}, // Guild cooldown for partnerships
        notify: {type: Boolean, require: false, default: false }, // Whether to notify the representant when the cooldown expires
        notified: {type: Boolean, require: false, default: false } // Whether the representant has been notified
    },
    configs: {
        autoBanLevel: {type: Number, require: false, default: -1}, // Minimum report level to auto ban
    },
})

const model = mongoose.model("Guilds Data", keySchema);

module.exports.model = model;
module.exports = model;
export default model;