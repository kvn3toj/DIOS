#!/usr/bin/env node

import { Command } from 'commander';
import * as chalk from 'chalk';
import { generateComponent } from './generators/component.generator';
import { generateEndpoint } from './generators/endpoint.generator';
import { generateEntity } from './generators/entity.generator';
import { generateService } from './generators/service.generator';

const program = new Command();

program.version('1.0.0').description('SuperApp CLI - Development Tools');

program
  .command('generate')
  .alias('g')
  .description('Generate various application components')
  .option('-c, --component <name>', 'Generate a new component')
  .option('-e, --endpoint <name>', 'Generate a new API endpoint')
  .option('-en, --entity <name>', 'Generate a new database entity')
  .option('-s, --service <name>', 'Generate a new service')
  .action(async (options) => {
    try {
      if (options.component) {
        await generateComponent(options.component);
        console.log(
          chalk.green(`✓ Component ${options.component} generated successfully`)
        );
      }
      if (options.endpoint) {
        await generateEndpoint(options.endpoint);
        console.log(
          chalk.green(
            `✓ API endpoint ${options.endpoint} generated successfully`
          )
        );
      }
      if (options.entity) {
        await generateEntity(options.entity);
        console.log(
          chalk.green(`✓ Entity ${options.entity} generated successfully`)
        );
      }
      if (options.service) {
        await generateService(options.service);
        console.log(
          chalk.green(`✓ Service ${options.service} generated successfully`)
        );
      }
    } catch (error) {
      console.error(chalk.red('Error:'), error.message);
      process.exit(1);
    }
  });

program.parse(process.argv);
