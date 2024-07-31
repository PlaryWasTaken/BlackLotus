import mongoose, {HydratedDocument} from "mongoose";
import {Constellation} from "#models/constellation";

const keySchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    blacklisted: { type: Boolean, default: false },
    modules: {
        blackLotus: {
            displayName: {type: String, required: false },
            invite: { type: String, required: false },
            constellation: {type: mongoose.Types.ObjectId, ref: 'Constellations', autopopulate: true },
            representant: {type: String, required: false },
            staffs: {type: Array, required: false },
            role: {type: String, required: false },
            embedWorthy: {type: Boolean, required: false },
            trackGrowth: {type: Boolean, required: false },
            trackNameChanges: {type: Boolean, required: false },
            joinedAt: {type: Number, required: false }
        },

        partnerships: {
            channelId: { type: String, required: false }, // Channel id of the partnerships channel
            mentionId: { type: String, required: false }, // Mention id of the partnerships role
            message: { type: String, required: false }, // Guild defined message to send when making partnerships
            timer: {type: Number, required: false, default: 0}, // Guild cooldown for partnerships
            notify: {type: Boolean, required: false, default: false }, // Whether to notify the representant when the cooldown expires
            notified: {type: Boolean, required: false, default: false } // Whether the representant has been notified
        },

        syndicate: {
            displayName: {type: String, required: false },
            invite: { type: String, required: false },
            representant: {type: String, required: false },
            staffs: {type: Array, required: false }, // Useless for now, keeping in the schema just in case
            role: {type: String, required: false },
            embedWorthy: {type: Boolean, required: false },
            trackNameChanges: {type: Boolean, required: false },
            joinedAt: {type: Number, required: false }
        },
    },
    configs: { type: Map, default: new Map(), required: false }
}).plugin(require('mongoose-autopopulate'));

export default mongoose.model("Guilds", keySchema);


export type GuildDocument = HydratedDocument<{
    id: string;
    blacklisted: boolean;
    modules: {
        blackLotus?: {
            displayName: string;
            invite: string;
            constellation: Constellation;
            representant: string;
            staffs: Array<any>;
            role: string;
            embedWorthy: boolean;
            trackGrowth: boolean | null;
            trackNameChanges: boolean | null;
            joinedAt: number | null;
        };
        partnerships?: {
            channelId: string | null;
            mentionId: string | null;
            message: string | null;
            timer: number | null;
            notify: boolean | null;
            notified: boolean | null;
        };
        syndicate?: {
            displayName: string;
            invite: string;
            representant: string;
            staffs: Array<any>;
            role: string;
            embedWorthy: boolean;
            trackNameChanges: boolean | null;
        };
    }
    configs?: Map<string, any>;
}>