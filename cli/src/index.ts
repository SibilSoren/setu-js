import { Command } from 'commander';
import { init } from './commands/init.js';
import { create } from './commands/create.js';
import { add } from './commands/add.js';
import { generate } from './commands/generate.js';

const program = new Command();

program
  .name('yantr')
  .description('A Shadcn for Backend - Production-grade backend scaffolding CLI')
  .version('0.1.0-beta.5');

program
  .command('create')
  .argument('<project-name>', 'Name of the project folder to create')
  .description('Create a new project with YantrJS')
  .option('-y, --yes', 'Use defaults for all prompts')
  .option('-f, --framework <framework>', 'Framework: express, hono, fastify')
  .option('-r, --runtime <runtime>', 'Runtime: node, bun')
  .option('-t, --db-type <type>', 'Database type: postgres, mongodb, none')
  .option('--orm <orm>', 'ORM: prisma, drizzle, mongoose')
  .action(create);

program
  .command('init')
  .description('Initialize YantrJS in an existing project')
  .option('-y, --yes', 'Skip prompts and use defaults')
  .option('-f, --framework <framework>', 'Framework: express, hono, fastify')
  .action(init);

program
  .command('add')
  .description('Add a component to your project')
  .argument('<component>', 'Component to add (auth, logger, database, security)')
  .option('-o, --overwrite', 'Overwrite existing files')
  .option('-t, --type <type>', 'Database type for database component (postgres, mongodb)')
  .option('--orm <orm>', 'ORM to use (prisma, drizzle, mongoose)')
  .action(add);

program
  .command('generate')
  .alias('g')
  .description('Generate boilerplate code')
  .argument('<type>', 'Type of code to generate (route)')
  .argument('<name>', 'Name of the resource')
  .action(generate);

program.parse();
