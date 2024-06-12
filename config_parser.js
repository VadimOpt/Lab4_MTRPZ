const fs = require('fs');
const Ajv = require('ajv');

const ajv = new Ajv({ allErrors: true, useDefaults: true });

function loadConfig(configPath, schemaPath) {
    const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf-8'));
    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

    const validate = ajv.compile(schema);
    const valid = validate(config);

    if (!valid) {
        console.log('Validation errors:', validate.errors);
        throw new Error('Config validation failed');
    }

    return config;
}

module.exports = { loadConfig };
