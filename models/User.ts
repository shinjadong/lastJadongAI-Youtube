import mongoose, { Schema, Document, Model } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  uid: string;
  platform_id?: string;
  email: string;
  password?: string;
  nickname: string;
  username: string;
  phone?: string;
  user_tp: string;
  gender?: string;
  birthday?: string;
  pt_yn: string;
  pt_tp?: string;
  help_yn: string;
  loyalty_yn: string;
  marketing_agree: string;
  algorithm_use_count: number;
  ca_channel_use_count: number;
  ca_use_count: number;
  cm_use_count: number;
  km_use_count: number;
  ca_channel_count: number;
  create_dt: Date;
  country: string;
  lang: string;
  membershipSuspended: boolean;
  membershipAskYn: string;
  prod_tp: string;
  code?: string;
  codeState?: string;
  hotMasterFlag: boolean;
  lectureId?: string;
  dormant_account_yn: string;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    uid: { type: String, required: true, unique: true },
    platform_id: { type: String },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    nickname: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    phone: { type: String },
    user_tp: { type: String, required: true, default: '10' }, // 10: 기본 사용자
    gender: { type: String, enum: ['M', 'F'] },
    birthday: { type: String },
    pt_yn: { type: String, enum: ['Y', 'N'], default: 'N' },
    pt_tp: { type: String },
    help_yn: { type: String, enum: ['Y', 'N'], default: 'Y' },
    loyalty_yn: { type: String, enum: ['Y', 'N'], default: 'N' },
    marketing_agree: { type: String, enum: ['Y', 'N'], default: 'N' },
    algorithm_use_count: { type: Number, default: 0 },
    ca_channel_use_count: { type: Number, default: 0 },
    ca_use_count: { type: Number, default: 0 },
    cm_use_count: { type: Number, default: 0 },
    km_use_count: { type: Number, default: 0 },
    ca_channel_count: { type: Number, default: 0 },
    create_dt: { type: Date, default: Date.now },
    country: { type: String, default: 'KR' },
    lang: { type: String, default: 'ko' },
    membershipSuspended: { type: Boolean, default: false },
    membershipAskYn: { type: String, enum: ['Y', 'N'], default: 'N' },
    prod_tp: { type: String, default: '10' }, // 10: 기본 플랜
    code: { type: String },
    codeState: { type: String },
    hotMasterFlag: { type: Boolean, default: false },
    lectureId: { type: String },
    dormant_account_yn: { type: String, enum: ['Y', 'N'], default: 'N' },
  },
  { timestamps: true }
);

// 비밀번호 해싱
UserSchema.pre('save', async function (next) {
  const user = this;
  if (!user.isModified('password')) return next();

  try {
    if (user.password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(user.password, salt);
    }
    next();
  } catch (error: any) {
    next(error);
  }
});

// 비밀번호 비교 메서드
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

// 모델이 이미 존재하는지 확인하고, 존재하지 않으면 새로 생성
const User: Model<IUser> = mongoose.models.User as Model<IUser> || mongoose.model<IUser>('User', UserSchema);

export default User; 