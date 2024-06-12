const fs = require('fs');
const Ajv = require('ajv');
const path = require('path');

const ajv = new Ajv({ allErrors: true, useDefaults: true });

let configCache = {};

function loadConfig(configPath, schemaPath, defaultValues = {}, preprocess = null, options = { cache: true, log: true }) {
    const log = options.log ? console.log : () => {};

    try {
        log(`Checking if files exist...`);
        if (!fs.existsSync(configPath)) {
            throw new Error(`Config file not found: ${configPath}`);
        }
        if (!fs.existsSync(schemaPath)) {
            throw new Error(`Schema file not found: ${schemaPath}`);
        }

        const cacheKey = `${configPath}:${schemaPath}`;
        if (options.cache && configCache[cacheKey]) {
            log('Returning cached configuration.');
            return configCache[cacheKey];
        }

        log(`Loading schema from ${schemaPath}...`);
        const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf-8'));
        log('Schema loaded successfully.');

        log(`Loading config from ${configPath}...`);
        const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
        log('Config loaded successfully.');

        const finalConfig = { ...defaultValues, ...config };

        const validate = ajv.compile(schema);
        const valid = validate(finalConfig);

        if (!valid) {
            log('Validation errors:', validate.errors);
            throw new Error('Config validation failed');
        }

        if (preprocess) {
            log('Preprocessing configuration...');
            preprocess(finalConfig);
        }

        log('Config validated and loaded successfully.');

        if (options.cache) {
            configCache[cacheKey] = finalConfig;
        }

        return finalConfig;

    } catch (error) {
        console.error(`Error loading configuration: ${error.message}`);
        throw error;
    }
}

module.exports = { loadConfig };
