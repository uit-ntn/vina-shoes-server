import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  BANNED = 'banned'
}

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user'
}

@Schema({ timestamps: true })
export class User extends Document {
  declare _id: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ default: '' })
  phone: string;

  @Prop({ default: '' })
  avatarUrl: string;

  @Prop({ default: UserRole.USER, enum: UserRole })
  role: string;

  @Prop({ default: UserStatus.ACTIVE, enum: UserStatus })
  status: UserStatus;

  @Prop({ type: Boolean, default: false })
  emailVerified: boolean;

  @Prop({ type: String, default: null })
  verificationToken: string;

  @Prop({ type: Date, default: null })
  verificationExpires: Date;

  @Prop({ type: Date, default: () => new Date(0) })
  lastLoginAt: Date;

  @Prop({ type: Date, default: () => new Date(0) })
  passwordChangedAt: Date;

  @Prop({ type: [String], default: [] })
  refreshTokens: string[];

  @Prop({ type: Boolean, default: false })
  twoFactorEnabled: boolean;

  @Prop({ 
    type: {
      language: { type: String, default: 'vi' },
      newsletter: { type: Boolean, default: true }
    },
    default: () => ({ language: 'vi', newsletter: true })
  })
  preferences: {
    language: string;
    newsletter: boolean;
  };

  @Prop({ type: [Object], default: [] })
  addresses: any[];

  @Prop({ type: Date, default: null })
  deletedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
