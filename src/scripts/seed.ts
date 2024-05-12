import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { FixturesModule } from '../fixtures/fixtures.module';
import { FixturesService } from '../fixtures/fixtures.service';

(async () => {
  const context = await NestFactory.createApplicationContext(AppModule);
  const fixturesModule = context.select<FixturesModule>(FixturesModule);
  const fixturesService = fixturesModule.get<FixturesService>(FixturesService);

  await fixturesService.resetDatabase();
  const stores = await fixturesService.stores.seed();
  const sections = await fixturesService.sections.seed(stores[0]);
  await fixturesService.users.seed(stores[0]);
  const repeatableTasks = await fixturesService.tasks.seedRepeatable(stores[0], sections);
  await fixturesService.tasks.seedDaily(stores[0], repeatableTasks);
})()
  .then(() => {
    console.log(`Success!`);
    process.exit(0);
  })
  .catch((error) => {
    console.log(error);
  });
