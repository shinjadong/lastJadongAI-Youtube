import mongoose, { Schema, Document, Model } from 'mongoose';

interface LimitMap {
  "10": number; // 기본 플랜
  "20": number; // 프리미엄 플랜
  "21": number; // 스타터 플랜
  "22": number; // 프로 플랜
  "23": number; // 엔터프라이즈 플랜
  "24": number; // 체험 플랜
  "25": number; // 무제한 플랜
  "61": number; // 추가 멤버십 유형
}

export interface IMembershipLimit extends Document {
  wt_use_count: LimitMap;
  ca_channel_count: LimitMap;
  ca_channel_use_count: LimitMap;
  ca_use_count: LimitMap;
  cm_use_count: LimitMap;
  km_use_count: LimitMap;
  algorithm_use_count: LimitMap;
}

const limitMapSchema = {
  "10": { type: Number, required: true },
  "20": { type: Number, required: true },
  "21": { type: Number, required: true },
  "22": { type: Number, required: true },
  "23": { type: Number, required: true },
  "24": { type: Number, required: true },
  "25": { type: Number, required: true },
  "61": { type: Number, required: true }, // 추가 멤버십 유형
};

const MembershipLimitSchema = new Schema<IMembershipLimit>(
  {
    wt_use_count: limitMapSchema,
    ca_channel_count: limitMapSchema,
    ca_channel_use_count: limitMapSchema,
    ca_use_count: limitMapSchema,
    cm_use_count: limitMapSchema,
    km_use_count: limitMapSchema,
    algorithm_use_count: limitMapSchema,
  },
  { timestamps: true }
);

// 모델이 이미 존재하는지 확인하고, 존재하지 않으면 새로 생성
const MembershipLimit: Model<IMembershipLimit> = mongoose.models.MembershipLimit as Model<IMembershipLimit> || 
  mongoose.model<IMembershipLimit>('MembershipLimit', MembershipLimitSchema);

export default MembershipLimit; 