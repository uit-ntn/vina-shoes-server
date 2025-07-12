import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './user.schema';
import { ListUserRequestDto } from './dto/list-user.dto';
import { UpdateUserStatusRequestDto } from './dto/update-user-status.dto';
import { UpdateUserRoleRequestDto } from './dto/update-user-role.dto';
import { UserStatus } from './dto/user-base.dto';
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
    return this.userModel.findOne({ email }).exec();
  }

  async findById(id: string): Promise<User | null> {
    return this.userModel.findById(id).exec();
  }

  async findAll(query: ListUserRequestDto) {
    const { page = 1, limit = 10, search, status } = query;
    
    const filter: any = {};
    if (search) {
      filter.$or = [
        { name: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') }
      ];
    }
    if (status) {
      filter.status = status;
    }

    const [users, total] = await Promise.all([
      this.userModel.find(filter)
        .skip((page - 1) * limit)
        .limit(limit)
        .exec(),
      this.userModel.countDocuments(filter)
    ]);

    return {
      users,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  async update(id: string, dto: UpdateUserRequestDto): Promise<User | null> {
    return this.userModel.findByIdAndUpdate(id, dto, { new: true }).exec();
  }

  async updatePassword(userId: string, password: string): Promise<User | null> {
    return this.userModel.findByIdAndUpdate(
      userId,
      { password },
      { new: true }
    ).exec();
  }

  async updateStatus(id: string, dto: UpdateUserStatusRequestDto) {
    const user = await this.userModel.findByIdAndUpdate(
      id,
      { status: dto.status },
      { new: true }
    ).exec();
    
    if (!user) throw new NotFoundException('User not found');
    
    return {
      id: user.id,
      status: user.status,
      message: 'User status updated successfully'
    };
  }

  async updateRole(id: string, dto: UpdateUserRoleRequestDto) {
    const user = await this.userModel.findByIdAndUpdate(
      id,
      { role: dto.role },
      { new: true }
    ).exec();
    
    if (!user) throw new NotFoundException('User not found');
    
    return {
      id: user.id,
      role: user.role,
      message: 'User role updated successfully'
    };
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

  async getStats() {
    const [total, active, inactive, banned] = await Promise.all([
      this.userModel.countDocuments(),
      this.userModel.countDocuments({ status: UserStatus.ACTIVE }),
      this.userModel.countDocuments({ status: UserStatus.INACTIVE }),
      this.userModel.countDocuments({ status: UserStatus.BANNED })
    ]);

    return {
      totalUsers: total,
      activeUsers: active,
      inactiveUsers: inactive,
      bannedUsers: banned
    };
  }

  async searchUsers(query: string) {
    return this.userModel.find({
      $or: [
        { name: new RegExp(query, 'i') },
        { email: new RegExp(query, 'i') }
      ]
    }).exec();
  }
}
