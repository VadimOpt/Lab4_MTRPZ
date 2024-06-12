const { loadConfig } = require('./config_parser');
const { watchConfig } = require('./watchConfig');

const configPath = 'path/to/config.json';
const schemaPath = 'path/to/config_schema.json';
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
    cache: true,
    log: true,
    watch: true,
    onError: (error) => {
        console.error('Custom error handler:', error.message);
    }
};

async function initializeConfig() {
    try {
        const config = await loadConfig(configPath, schemaPath, defaultValues, preprocess, options);
        console.log('Initial configuration loaded:', config);
        watchConfig(configPath, schemaPath, defaultValues, preprocess, options, (newConfig) => {
            console.log('Configuration updated:', newConfig);
        });
    } catch (error) {
        console.error('Failed to load initial configuration:', error.message);
    }
}

initializeConfig();
