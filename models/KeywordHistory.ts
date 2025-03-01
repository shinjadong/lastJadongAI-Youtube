import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IKeywordHistory extends Document {
  keyword: string;
  newKeyword?: boolean;
  country: string;
  lang: string;
  recKeywords?: string[];
  deletedKeywords?: string[];
  round_no: string;
  status: string;
  uid: string;
  use_yn: string;
  scheduler_yn: string;
  video_tp: string;
  level: number;
  create_user: string;
  create_dt: Date;
  update_user: string;
  update_dt: Date;
}

const KeywordHistorySchema = new Schema<IKeywordHistory>(
  {
    keyword: { type: String, required: true },
    newKeyword: { type: Boolean, default: false },
    country: { type: String, required: true, default: 'KR' },
    lang: { type: String, required: true, default: 'ko' },
    recKeywords: { type: [String], default: [] },
    deletedKeywords: { type: [String], default: [] },
    round_no: { type: String, required: true },
    status: { type: String, required: true, default: '0' }, // 0: 비활성, 1: 활성
    uid: { type: String, required: true },
    use_yn: { type: String, enum: ['Y', 'N'], default: 'Y' },
    scheduler_yn: { type: String, enum: ['Y', 'N'], default: 'N' },
    video_tp: { type: String, default: '02' },
    level: { type: Number, default: 1 },
    create_user: { type: String, required: true },
    create_dt: { type: Date, default: Date.now },
    update_user: { type: String, required: true },
    update_dt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// 모델이 이미 존재하는지 확인하고, 존재하지 않으면 새로 생성
const KeywordHistory: Model<IKeywordHistory> = mongoose.models.KeywordHistory as Model<IKeywordHistory> || 
  mongoose.model<IKeywordHistory>('KeywordHistory', KeywordHistorySchema);

export default KeywordHistory; 