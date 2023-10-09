import mongoose from "mongoose";

const keySchema = new mongoose.Schema({
    name: {type: String},
    defaultRoles: {type: Array},
    position: {type: Number},
    minimumMemberAmmout: {type: Number},
    roleId: {type: String}
})

const model = mongoose.model("Constelations", keySchema);

module.exports = model;
export default model;