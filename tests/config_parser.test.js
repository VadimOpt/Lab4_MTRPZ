const { loadConfig } = require('../config_parser');
const { watchConfig } = require('../watchConfig');
const fs = require('fs');

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

const options = {
    cache: false,
    log: false
};

test('loadConfig should load and validate configuration with defaults and preprocess', async () => {
    const config = await loadConfig('tests/config.json', 'config_schema.json', defaultValues, preprocess, options);
    expect(config).toHaveProperty('database');
    expect(config).toHaveProperty('logging');
    expect(config.logging.level).toBe('DEBUG');
});

test('loadConfig should use default values for missing config fields', async () => {
    const config = await loadConfig('tests/partial_config.json', 'config_schema.json', defaultValues, preprocess, options);
    expect(config.database.host).toBe('localhost');
    expect(config.logging.level).toBe('INFO');
});

// test('loadConfig should throw an error for invalid configuration', async () => {
//     await expect(loadConfig('tests/invalid_config.json', 'config_schema.json', defaultValues, preprocess, options)).rejects.toThrow('Config validation failed');
// });

test('loadConfig should cache the configuration', async () => {
    const config1 = await loadConfig('tests/config.json', 'config_schema.json', defaultValues, preprocess, { ...options, cache: true });
    const config2 = await loadConfig('tests/config.json', 'config_schema.json', defaultValues, preprocess, { ...options, cache: true });
    expect(config1).toBe(config2);
});

test('watchConfig should reload configuration on file change', (done) => {
    const configPath = 'tests/config.json';
    const schemaPath = 'config_schema.json';

    const onUpdate = (newConfig) => {
        expect(newConfig).toHaveProperty('database');
        expect(newConfig).toHaveProperty('logging');
        done();
    };

    watchConfig(configPath, schemaPath, defaultValues, preprocess, options, onUpdate);

    // Триггерим изменение файла через небольшую задержку
    setTimeout(() => {
        fs.writeFileSync(configPath, JSON.stringify({ database: { username: 'newUser', password: 'newPassword' }, logging: { level: 'DEBUG', file: 'app.log' } }));
    }, 1000);
}, 10000); // Увеличен таймаут до 10 секунд
