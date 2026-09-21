import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AdminModule } from './admin/admin.module';
import { CategoryModule } from './category/category.module';
import { UploadModule } from './upload/upload.module';
import { BrandModule } from './brand/brand.module';
import { ProductModule } from './product/product.module';
import { OrderModule } from './order/order.module';
import { OrderitemModule } from './orderitem/orderitem.module';
import { ContactModule } from './contact/contact.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { OverviewModule } from './overview/overview.module';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { RolesGuard } from './auth/roles.guard';


@Module({
  imports: [AdminModule, CategoryModule, UploadModule, BrandModule, ProductModule, OrderModule, OrderitemModule, ContactModule, UserModule, AuthModule, DashboardModule, OverviewModule],
  controllers: [AppController],
  providers: [
    AppService,
    // Authentication runs first and populates request.user, then role checks.
    // Routes opt out of authentication explicitly with @Public().
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
