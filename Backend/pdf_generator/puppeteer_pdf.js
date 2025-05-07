const puppeteer = require('puppeteer');

exports.generatePDF = async (targetHtml, filename, response) => {
    try{
        const browser = await puppeteer.launch({
            headless: true,
            args: [
              '--no-sandbox',
              '--headless',
              '--disable-gpu',
              '--disable-dev-shm-usage'
            ]
        });

        const page = await browser.newPage();
        await page.setContent(targetHtml);
    
        // Ponerle nombre a la pestaña
        await page.evaluate((filename) => {
            document.title = filename;
        }, filename);

        // Opciones del PDF
        const pdfBuffer = await page.pdf({
            // EN CASO DE QUERER generar localmente, descomentar "path" y CAMBIAR LA DIRECCIÓN DONDE SE GENERA EL PDF,
            // EN ESTE CASO SE GENERA EN EL MISMO DIRECTORIO DONDE SE LLAMA EL MÓDULO PUPPETEER_PDF
            // path: `${filename}.pdf`,
            format: 'A4',
            printBackground: true,
            margin: {
                top: '0.5cm',
                right: '0.5cm',
                bottom: '0.5cm',
                left: '0.5cm'
            }
        });
    
        await browser.close();

        response.setHeader('Content-Type', 'application/pdf');
        response.setHeader('Content-Disposition', `inline; filename=${filename}.pdf`);
        response.end(pdfBuffer);
            
    }catch(ex){
        console.error("Error al tratar de generar reporte:", ex);
        response.status(500).json({ error: 'Error al generar el archivo PDF.' });
    }
}
