import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsDateString } from 'class-validator';

export class UpdateTrackingInfoDto {
  @ApiProperty({ 
    description: 'Tracking number',
    example: 'TRK123456789'
  })
  @IsString()
  @IsNotEmpty()
  trackingNumber: string;

  @ApiProperty({ 
    description: 'Carrier name',
    example: 'GHN Express'
  })
  @IsString()
  @IsNotEmpty()
  carrier: string;

  @ApiProperty({ 
    description: 'Estimated delivery date',
    required: false,
    example: '2024-01-15T10:00:00.000Z'
  })
  @IsOptional()
  @IsDateString()
  estimatedDelivery?: string;

  @ApiProperty({ 
    description: 'Delivery notes',
    required: false
  })
  @IsOptional()
  @IsString()
  deliveryNotes?: string;
}

export class ConfirmDeliveryDto {
  @ApiProperty({ 
    description: 'Actual delivery date',
    example: '2024-01-15T14:30:00.000Z'
  })
  @IsDateString()
  actualDelivery: string;

  @ApiProperty({ 
    description: 'Delivery confirmation notes',
    required: false
  })
  @IsOptional()
  @IsString()
  deliveryNotes?: string;
}

export class TrackingResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  orderNumber: string;

  @ApiProperty()
  status: string;

  @ApiProperty()
  trackingNumber: string;

  @ApiProperty()
  carrier: string;

  @ApiProperty({ required: false })
  estimatedDelivery?: Date;

  @ApiProperty({ required: false })
  actualDelivery?: Date;

  @ApiProperty({ required: false })
  deliveryNotes?: string;

  @ApiProperty({ example: 'Tracking information updated successfully' })
  message: string;
} 