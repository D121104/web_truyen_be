import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { UsersModule } from './modules/users/users.module'
import { ConfigModule } from '@nestjs/config'
import { MongooseModule } from '@nestjs/mongoose'
import { ConfigService } from '@nestjs/config'
import { BooksModule } from './modules/books/books.module'
import { BuyHistoriesModule } from './modules/buy.histories/buy.histories.module'
import { ChaptersModule } from './modules/chapters/chapters.module'
import { TranslatorGroupsModule } from './modules/translator.groups/translator.groups.module'
import { AuthModule } from './auth/auth.module'
import { APP_GUARD } from '@nestjs/core'
import { JwtAuthGuard } from '@/auth/passport/jwt-auth.guard'
import { UploadModule } from './upload/upload.module';

@Module({
  imports: [
    UsersModule,
    BooksModule,
    BuyHistoriesModule,
    ChaptersModule,
    TranslatorGroupsModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UploadModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
