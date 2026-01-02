import * as p from '@clack/prompts';
import chalk from 'chalk';

export async function add(component: string, options: { overwrite?: boolean }) {
  p.intro(chalk.bgCyan(` setu add ${component} `));

  // TODO: Implement add logic
  // 1. Validate component name
  // 2. Fetch from registry
  // 3. Check if already installed
  // 4. Download template files
  // 5. Install dependencies
  // 6. Update setu.json

  const validComponents = ['auth', 'logger', 'database', 'security'];
  
  if (!validComponents.includes(component)) {
    p.log.error(`Unknown component: ${component}`);
    p.log.info(`Available components: ${validComponents.join(', ')}`);
    process.exit(1);
  }

  p.log.info(`Adding ${component} component...`);
  p.log.warning('Add command is under development');

  p.outro(chalk.green(`${component} added successfully!`));
}
