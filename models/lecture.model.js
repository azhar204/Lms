import mongoose from "mongoose";

const lectureSchema = new mongoose.Schema({
  lectureTitle: {
    type: String,
    required: true,
    trim: true,
  },
  videoUrl: {
    type: String,
  },
  publicId: {
    type: String,
  },
  isPreviewFree: {
    type: Boolean,
    default: false,
  },
  isLive: {
    type: Boolean,
    default: false,
  },
  streamId: {
    type: String,
  },
  streamUrl: {
    type: String, 
  },
  joinUrl: {
    type: String, 
  },
  streamKey: {
    type: String, 
  },
  startTime: {
    type: Date, 
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const Lecture = mongoose.model("Lecture", lectureSchema);