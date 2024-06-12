const { loadConfig } = require('../config_parser');

const defaultValues = {
    database: {
        host: 'localhost',
        port: 5432
    },
    logging: {
        level: 'INFO'
    }
};

const preprocess = (config) => {
    if (config.logging && config.logging.level) {
        config.logging.level = config.logging.level.toUpperCase();
    }
};

test('loadConfig should load and validate configuration with defaults and preprocess', () => {
    const config = loadConfig('tests/config.json', 'config_schema.json', defaultValues, preprocess);
    expect(config).toHaveProperty('database');
    expect(config).toHaveProperty('logging');
    expect(config.logging.level).toBe('DEBUG');
});

test('loadConfig should use default values for missing config fields', () => {
    const config = loadConfig('tests/partial_config.json', 'config_schema.json', defaultValues, preprocess);
    expect(config.database.host).toBe('localhost');
    expect(config.logging.level).toBe('INFO');
});

test('loadConfig should throw an error for invalid configuration', () => {
    expect(() => {
        loadConfig('tests/invalid_config.json', 'config_schema.json', defaultValues, preprocess);
    }).toThrow('Config validation failed');
});
