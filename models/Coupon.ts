import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICoupon extends Document {
  code: string;
  discount: number;
  discount_type: string;
  valid_from: Date;
  valid_to: Date;
  is_used: boolean;
  user_id: string;
  create_dt: Date;
}

const CouponSchema = new Schema<ICoupon>(
  {
    code: { type: String, required: true, unique: true },
    discount: { type: Number, required: true },
    discount_type: { type: String, enum: ['percentage', 'fixed'], required: true },
    valid_from: { type: Date, required: true },
    valid_to: { type: Date, required: true },
    is_used: { type: Boolean, default: false },
    user_id: { type: String, required: true },
    create_dt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// 모델이 이미 존재하는지 확인하고, 존재하지 않으면 새로 생성
const Coupon: Model<ICoupon> = mongoose.models.Coupon as Model<ICoupon> || 
  mongoose.model<ICoupon>('Coupon', CouponSchema);

export default Coupon; 