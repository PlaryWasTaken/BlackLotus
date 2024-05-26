import mongoose from "mongoose";

const keySchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    blacklisted: { type: Boolean, default: false },
    blackLotus: {
        displayName: {type: String, required: true },
        invite: { type: String, required: true },
        constelation: {type: mongoose.Types.ObjectId, ref: 'Constelations'},
        representant: {type: String, required: true },
        staffs: {type: Array, required: true },
        role: {type: String, required: false },
        embedWorthy: {type: Boolean, required: true, default: true },
        trackGrowth: {type: Boolean, required: false, default: true },
        trackNameChanges: {type: Boolean, required: false, default: true },
        joinedAt: {type: Number, required: false, default: Date.now() }
    },
    partnerships: {
        channelId: { type: String, required: false }, // Channel id of the partnerships channel
        mentionId: { type: String, required: false }, // Mention id of the partnerships role
        message: { type: String, required: false }, // Guild defined message to send when making partnerships
        timer: {type: Number, required: false, default: 0}, // Guild cooldown for partnerships
        notify: {type: Boolean, required: false, default: false }, // Whether to notify the representant when the cooldown expires
        notified: {type: Boolean, required: false, default: false } // Whether the representant has been notified
    },
    configs: {
        autoBanLevel: {type: Number, required: false, default: -1}, // Minimum report level to auto ban
    },
})

const model = mongoose.model("Guilds Data", keySchema);

export default model;