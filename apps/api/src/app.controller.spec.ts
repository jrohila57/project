import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;
  let appService: AppService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
    appService = app.get<AppService>(AppService);
  });

  describe('getHello', () => {
    it('should return the result from the service', () => {
      const result = 'Welcome to NestJS API!';
      jest.spyOn(appService, 'getHello').mockImplementation(() => result);
      expect(appController.getHello()).toEqual({ message: result });
    });
  });
});
