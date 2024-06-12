const chokidar = require('chokidar');
const { loadConfig } = require('./config_parser'); 

/**
 * 
 *
 * @param {string} configPath 
 * @param {string} schemaPath 
 * @param {object} defaultValues  
 * @param {function} preprocess  
 * @param {object} options 
 * @param {function} onUpdate 
 */
function watchConfig(configPath, schemaPath, defaultValues, preprocess, options, onUpdate) {
    const watcher = chokidar.watch([configPath, schemaPath], {
        persistent: true,
        ignoreInitial: true
    });

    watcher.on('change', async (path) => {
        console.log(`File changed: ${path}`);
        try {
            const config = await loadConfig(configPath, schemaPath, defaultValues, preprocess, { ...options, cache: false });
            if (onUpdate) {
                onUpdate(config);
            }
        } catch (error) {
            console.error(`Error reloading configuration: ${error.message}`);
        }
    });

    watcher.on('error', (error) => {
        console.error(`Watcher error: ${error.message}`);
    });

    console.log('Watching for configuration changes...');
}

module.exports = { watchConfig };