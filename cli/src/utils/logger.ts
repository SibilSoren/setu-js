import chalk from 'chalk';

export const logger = {
  info: (message: string) => console.log(chalk.blue('ℹ'), message),
  success: (message: string) => console.log(chalk.green('✓'), message),
  warning: (message: string) => console.log(chalk.yellow('⚠'), message),
  error: (message: string) => console.log(chalk.red('✖'), message),
  
  // Styled headers
  header: (message: string) => console.log(chalk.bold.cyan(`\n${message}\n`)),
  
  // For command output
  step: (step: number, message: string) => 
    console.log(chalk.gray(`[${step}]`), message),
  
  // For file operations
  created: (filepath: string) => 
    console.log(chalk.green('  +'), chalk.gray(filepath)),
  modified: (filepath: string) => 
    console.log(chalk.yellow('  ~'), chalk.gray(filepath)),
  deleted: (filepath: string) => 
    console.log(chalk.red('  -'), chalk.gray(filepath)),
};

export default logger;
