import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { Order, OrderSchema } from './order.schema';
import { CartModule } from '../cart/cart.module';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      { name: Order.name, schema: OrderSchema }
    ]),
    CartModule
  ],
  controllers: [OrderController],
  providers: [OrderService],
  exports: [OrderService]
})
export class OrderModule {}
