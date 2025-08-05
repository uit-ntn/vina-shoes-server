import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEnum, IsOptional, IsNumber, IsPositive, MaxLength } from 'class-validator';
import { ReturnStatus } from '../order.schema';

export class CreateReturnRequestDto {
  @ApiProperty({ 
    description: 'Reason for return',
    example: 'Product defective'
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  reason: string;

  @ApiProperty({ 
    description: 'Additional notes',
    required: false
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;
}

export class ProcessReturnRequestDto {
  @ApiProperty({ 
    description: 'New return status',
    enum: ReturnStatus
  })
  @IsEnum(ReturnStatus)
  status: ReturnStatus;

  @ApiProperty({ 
    description: 'Return tracking number',
    required: false
  })
  @IsOptional()
  @IsString()
  returnTrackingNumber?: string;

  @ApiProperty({ 
    description: 'Refund amount',
    required: false
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  refundAmount?: number;

  @ApiProperty({ 
    description: 'Admin notes',
    required: false
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;
}

export class ReturnRequestResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ enum: ReturnStatus })
  returnStatus: ReturnStatus;

  @ApiProperty()
  reason: string;

  @ApiProperty()
  requestedAt: Date;

  @ApiProperty({ required: false })
  approvedAt?: Date;

  @ApiProperty({ required: false })
  returnTrackingNumber?: string;

  @ApiProperty({ required: false })
  refundAmount?: number;

  @ApiProperty({ required: false })
  refundedAt?: Date;

  @ApiProperty({ example: 'Return request processed successfully' })
  message: string;
} 