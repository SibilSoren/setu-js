import { Command } from 'commander';
import { init } from './commands/init.js';
import { add } from './commands/add.js';
import { generate } from './commands/generate.js';

const program = new Command();

program
  .name('yantr')
  .description('A Shadcn for Backend - Production-grade backend scaffolding CLI')
  .version('0.1.0-beta.2');

program
  .command('init')
  .description('Initialize Setu in your project')
  .option('-y, --yes', 'Skip prompts and use defaults')
  .action(init);

program
  .command('add')
  .description('Add a component to your project')
  .argument('<component>', 'Component to add (auth, logger, database, security)')
  .option('-o, --overwrite', 'Overwrite existing files')
  .action(add);

program
  .command('generate')
  .alias('g')
  .description('Generate boilerplate code')
  .argument('<type>', 'Type of code to generate (route)')
  .argument('<name>', 'Name of the resource')
  .action(generate);

program.parse();
