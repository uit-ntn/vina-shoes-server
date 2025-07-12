import { ApiProperty } from '@nestjs/swagger';
import { UserBaseDto } from './user-base.dto';

export class FindDeletedUsersResponseDto {
  @ApiProperty({ type: [UserBaseDto] })
  users: UserBaseDto[];
}
