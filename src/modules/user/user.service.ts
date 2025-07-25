import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserStatus } from './user.schema';
import { UserStatus as UserStatusDto } from './dto/user-base.dto';
import { CreateUserRequestDto } from './dto/create-user.dto';
import { UpdateUserRequestDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>
  ) {}

  async create(dto: CreateUserRequestDto): Promise<User> {
    const user = new this.userModel(dto);
    return user.save();
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email, deletedAt: null });
  }

  async findById(id: string): Promise<User | null> {
    return this.userModel.findOne({ _id: id, deletedAt: null });
  }

  async findByVerificationToken(token: string): Promise<User | null> {
    return this.userModel.findOne({
      verificationToken: token,
      deletedAt: null
    });
  }

  async verifyEmail(userId: string): Promise<void> {
    await this.userModel.updateOne(
      { _id: userId },
      {
        $set: {
          emailVerified: true,
          verificationToken: null,
          verificationExpires: null,
          status: UserStatus.ACTIVE
        }
      }
    );
  }

  async updateVerificationToken(
    userId: string,
    token: string,
    expires: Date
  ): Promise<void> {
    await this.userModel.updateOne(
      { _id: userId },
      {
        $set: {
          verificationToken: token,
          verificationExpires: expires
        }
      }
    );
  }

  async updatePassword(userId: string, newPassword: string): Promise<void> {
    await this.userModel.updateOne(
      { _id: userId },
      { 
        $set: { 
          password: newPassword,
          passwordChangedAt: new Date()
        } 
      }
    );
  }

  async addRefreshToken(userId: string, refreshToken: string): Promise<void> {
    await this.userModel.updateOne(
      { _id: userId },
      { $push: { refreshTokens: refreshToken } }
    );
  }

  async removeRefreshToken(userId: string, refreshToken: string): Promise<void> {
    await this.userModel.updateOne(
      { _id: userId },
      { $pull: { refreshTokens: refreshToken } }
    );
  }

  async clearAllRefreshTokens(userId: string): Promise<void> {
    await this.userModel.updateOne(
      { _id: userId },
      { $set: { refreshTokens: [] } }
    );
  }

  async validateRefreshToken(userId: string, refreshToken: string): Promise<boolean> {
    const user = await this.userModel.findOne({
      _id: userId,
      refreshTokens: refreshToken,
      deletedAt: null
    });
    return !!user;
  }

  async findAll() {
    return this.userModel.find({ deletedAt: null }).exec();
  }

  async update(id: string, dto: UpdateUserRequestDto): Promise<User | null> {
    return this.userModel.findByIdAndUpdate(id, dto, { new: true }).exec();
  }





  async remove(id: string) {
    const user = await this.userModel.findByIdAndDelete(id).exec();
    if (!user) throw new NotFoundException('User not found');
    return { message: 'User deleted successfully' };
  }

  async softDelete(id: string) {
    const user = await this.userModel.findByIdAndUpdate(
      id,
      { 
        deletedAt: new Date(),
        status: UserStatus.INACTIVE 
      },
      { new: true }
    ).exec();
    
    if (!user) throw new NotFoundException('User not found');
    
    return { message: 'User has been soft deleted' };
  }

  async restore(id: string) {
    const user = await this.userModel.findByIdAndUpdate(
      id,
      { 
        deletedAt: null,
        status: UserStatus.ACTIVE 
      },
      { new: true }
    ).exec();
    
    if (!user) throw new NotFoundException('User not found');
    
    return { 
      message: 'User has been restored',
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    };
  }

  async updateLastLogin(id: string) {
    const user = await this.userModel.findByIdAndUpdate(
      id,
      { lastLoginAt: new Date() },
      { new: true }
    ).exec();
    
    if (!user) throw new NotFoundException('User not found');
    
    return { 
      message: 'Last login time updated',
      lastLoginAt: user.lastLoginAt
    };
  }

  async findDeleted() {
    return this.userModel.find({ 
      deletedAt: { $ne: null } 
    }).exec();
  }

  async countByStatus() {
    return this.userModel.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]).exec();
  }



  async searchUsers(query: string) {
    return this.userModel.find({
      $or: [
        { name: new RegExp(query, 'i') },
        { email: new RegExp(query, 'i') }
      ],
      deletedAt: null
    }).exec();
  }
}
