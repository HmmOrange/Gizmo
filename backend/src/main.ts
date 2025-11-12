import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger } from '@nestjs/common';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    const globalPrefix = 'api';
    app.setGlobalPrefix(globalPrefix);
    const config = new DocumentBuilder()
        .setTitle('Gizmo Project')
        .setDescription('API Description for Gizmo Project')
        .setVersion('1.0')
        .addTag('gizmo')
        .build();
    const documentFactory = () => SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('swagger', app, documentFactory);
    const port = process.env.PORT || 3000;
    await app.listen(port, '0.0.0.0');
    Logger.log(
        `Application is running on: http://localhost:${port}/${globalPrefix}`,
    );
    Logger.log(`Swagger available at: http://localhost:${port}/swagger`);
}
bootstrap();
