import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IVideo extends Document {
  videoId: string;
  title: string;
  thumbnail: string;
  duration: string;
  views: number;
  subscribers: number;
  contribution: string;
  performance: string;
  exposureProbability: number;
  totalVideos: number;
  publishDate: Date;
  channelId: string;
  channelTitle: string;
  keyword: string;
  round_no: string;
  uid: string;
  create_dt: Date;
  update_dt: Date;
}

const VideoSchema = new Schema<IVideo>(
  {
    videoId: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    thumbnail: { type: String, required: true },
    duration: { type: String, required: true },
    views: { type: Number, required: true, default: 0 },
    subscribers: { type: Number, required: true, default: 0 },
    contribution: { type: String, enum: ['Good', 'Normal', 'Bad', 'Worst'], default: 'Normal' },
    performance: { type: String, enum: ['Good', 'Normal', 'Bad', 'Worst'], default: 'Normal' },
    exposureProbability: { type: Number, default: 0 },
    totalVideos: { type: Number, default: 0 },
    publishDate: { type: Date, required: true },
    channelId: { type: String, required: true },
    channelTitle: { type: String, required: true },
    keyword: { type: String, required: true },
    round_no: { type: String, required: true },
    uid: { type: String, required: true },
    create_dt: { type: Date, default: Date.now },
    update_dt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// 모델이 이미 존재하는지 확인하고, 존재하지 않으면 새로 생성
const Video: Model<IVideo> = mongoose.models.Video as Model<IVideo> || 
  mongoose.model<IVideo>('Video', VideoSchema);

export default Video; 