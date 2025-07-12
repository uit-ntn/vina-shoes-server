import { ApiProperty } from '@nestjs/swagger';
import { UserBaseDto } from './user-base.dto';

export class GetUserRequestParamsDto {
  @ApiProperty()
  id: string;
}

export class GetUserResponseDto {
  @ApiProperty({ type: UserBaseDto })
  user: UserBaseDto;
}
