const fs = require('fs').promises;
// IMPORTANTE! la dirección se debe cambiar dependiendo del directorio donde se va a llamar al módulo pdf_builder
const cssFileDir = './pdf_generator/styles.css'

exports.readCssStyles = async () => {
    try {
        return await fs.readFile(cssFileDir, 'utf8');
    } catch (error) {
        console.error('Error leyendo el archivo:', error);
    }
}