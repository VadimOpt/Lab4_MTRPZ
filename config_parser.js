const fs = require('fs');
const Ajv = require('ajv');
const path = require('path');

const ajv = new Ajv({ allErrors: true, useDefaults: true });

function loadConfig(configPath, schemaPath, defaultValues = {}, preprocess = null) {
    try {
        console.log(`Loading schema from ${schemaPath}...`);
        const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf-8'));
        console.log('Schema loaded successfully.');

        console.log(`Loading config from ${configPath}...`);
        const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
        console.log('Config loaded successfully.');

        const finalConfig = { ...defaultValues, ...config };

        const validate = ajv.compile(schema);
        const valid = validate(finalConfig);

        if (!valid) {
            console.log('Validation errors:', validate.errors);
            throw new Error('Config validation failed');
        }

        if (preprocess) {
            console.log('Preprocessing configuration...');
            preprocess(finalConfig);
        }

        console.log('Config validated and loaded successfully.');
        return finalConfig;

    } catch (error) {
        console.error(`Error loading configuration: ${error.message}`);
        throw error;
    }
}

module.exports = { loadConfig };
