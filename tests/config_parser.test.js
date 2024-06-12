const { loadConfig } = require('../config_parser');

test('loadConfig should load and validate configuration', () => {
    const config = loadConfig('tests/config.json', 'config_schema.json');
    expect(config).toHaveProperty('database');
    expect(config).toHaveProperty('logging');
});

test('loadConfig should throw an error for invalid configuration', () => {
    expect(() => {
        loadConfig('tests/invalid_config.json', 'config_schema.json');
    }).toThrow('Config validation failed');
});
