import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OrderItemController } from './order-item.controller';
import { OrderItemService } from './order-item.service';
import { OrderItem, OrderItemSchema } from './order-item.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: OrderItem.name, schema: OrderItemSchema }])
  ],
  controllers: [OrderItemController],
  providers: [OrderItemService],
  exports: [OrderItemService]
})
export class OrderItemModule {}
