import { ApiProperty } from '@nestjs/swagger';
import { OrderStatus } from '../order.schema';

export class OrderResponseDto {
    @ApiProperty({ example: '686e55be77dce804acca2546' })
    id: string;

    @ApiProperty({ enum: OrderStatus, example: 'shipped' })
    status: OrderStatus;

    @ApiProperty({ example: 2934938 })
    total: number;

    @ApiProperty({ example: 'credit_card' })
    paymentMethod: string;

    @ApiProperty({
        example: {
            street: 'Street 46',
            city: 'HCM',
            country: 'VN',
            postalCode: '700000'
        }
    })
    shippingAddress: {
        street: string;
        city: string;
        country: string;
        postalCode: string;
    };
    @ApiProperty({
        example: [
            {
                productId: '1234567890abcdef',
                name: 'Product Name',
                quantity: 2,
                price: 500000
            }
        ]
    })
    items: {
        productId: string;
        name: string;
        quantity: number;
        price: number;
    }[];

    @ApiProperty()
    createdAt: Date;

    @ApiProperty()
    updatedAt: Date;
}

export class OrdersResponseDto {
    @ApiProperty({ type: [OrderResponseDto] })
    orders: OrderResponseDto[];

    @ApiProperty({ example: 10 })
    total: number;

    @ApiProperty({ example: 1 })
    page: number;

    @ApiProperty({ example: 10 })
    limit: number;
}
