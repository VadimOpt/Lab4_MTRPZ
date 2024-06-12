const fs = require('fs').promises;
const Ajv = require('ajv');
const path = require('path');

const ajv = new Ajv({ allErrors: true, useDefaults: true });

let configCache = {};

async function loadConfig(configPath, schemaPath, defaultValues = {}, preprocess = null, options = { cache: true, log: true }) {
    const log = options.log ? console.log : () => {};
    const onError = options.onError || ((error) => { throw error; });

    try {
        log(`Checking if files exist...`);
        await Promise.all([configPath, schemaPath].map(async (file) => {
            try {
                await fs.access(file);
            } catch {
                throw new Error(`File not found: ${file}`);
            }
        }));

        const cacheKey = `${configPath}:${schemaPath}`;
        if (options.cache && configCache[cacheKey]) {
            log('Returning cached configuration.');
            return configCache[cacheKey];
        }

        log(`Loading schema from ${schemaPath}...`);
        const schema = JSON.parse(await fs.readFile(schemaPath, 'utf-8'));
        log('Schema loaded successfully.');

        log(`Loading config from ${configPath}...`);
        const config = JSON.parse(await fs.readFile(configPath, 'utf-8'));
        log('Config loaded successfully.');

        const finalConfig = JSON.parse(JSON.stringify({ ...defaultValues, ...config })); // Deep copy to avoid mutation

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
        onError(error);
        throw error;
    }
}

module.exports = { loadConfig };



