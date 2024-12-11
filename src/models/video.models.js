import mongoose, { Schema } from "mongoose";

const videoSchema = new Schema({
	tittle: {
		type: String,
		required: true,
	},
	description: { type: String },
	author: { type: String, required: true },
	url: { type: String, required: true },
});

export const video = mongoose.model("video", videoSchema);
