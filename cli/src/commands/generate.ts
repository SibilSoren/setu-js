import * as p from '@clack/prompts';
import chalk from 'chalk';

export async function generate(type: string, name: string) {
  p.intro(chalk.bgCyan(` setu generate ${type} ${name} `));

  // TODO: Implement generate logic
  // 1. Validate type (route, controller, service)
  // 2. Read setu.json for srcDir
  // 3. Generate files from templates
  // 4. Auto-link to app entry

  const validTypes = ['route'];

  if (!validTypes.includes(type)) {
    p.log.error(`Unknown type: ${type}`);
    p.log.info(`Available types: ${validTypes.join(', ')}`);
    process.exit(1);
  }

  p.log.info(`Generating ${type}: ${name}...`);
  p.log.warning('Generate command is under development');

  p.outro(chalk.green(`${type} "${name}" generated successfully!`));
}
