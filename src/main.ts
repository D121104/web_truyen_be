import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { ConfigService } from '@nestjs/config'
import { ValidationPipe } from '@nestjs/common'
import cookieParser from 'cookie-parser'
import { TransformInterceptor } from './core/transform.interceptor'
import { NestExpressApplication } from '@nestjs/platform-express'
import { join } from 'path'

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule)
  const configService = app.get(ConfigService)
  const port = configService.get<number>('PORT')

  app.enableCors({
    origin: 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  })

  app.useStaticAssets(join(__dirname, '..', 'public'))

  app.setBaseViewsDir(join(__dirname, '..', 'public'))

  app.setViewEngine('hbs')

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    })
  )

  app.useGlobalInterceptors(new TransformInterceptor())
  app.use(cookieParser())
  app.setGlobalPrefix('api', { exclude: [''] })
  await app.listen(port)
}
bootstrap()
