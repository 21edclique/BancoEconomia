const fileReader = require('./file_reader');
const puppeteer = require('./puppeteer_pdf');

exports.generatePDF = async (request, response) => {
    const { nombreCredito, metodo, tasaAnual, monto, periodoMeses, seguro, tabla, totalInteres } = request.body;
    const html = `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Tabla Amortización</title>
        <style>${await fileReader.readCssStyles()}</style>
    </head>
    <body>
        <header>
            <span>TABLA DE AMORTIZACIÓN</span>
        </header>
        <div class="productInfo">
            <span>
                Método <b>${metodo}</b>
            </span>
            <span>
                Crédito <b>${nombreCredito}</b>
            </span>
            <span>
                Tasa de Interés Anual del <b>${tasaAnual} %</b>
            </span>
        </div>
        <div class="creditInfo">
            <div class="leftCol">
                <span>
                    <b>Plazo (Meses): </b> ${periodoMeses}
                </span>
                <span>
                    <b>Capital: </b>$ ${monto}
                </span>
            </div>
            <div class="rightCol">
                <span>
                    <b>Total de Interés: </b>$ ${totalInteres}
                </span>
                <span>
                    <b>Total Seguro: </b>$ ${seguro}
                </span>
            </div>
        </div>
        <table>
            <thead>
                <tr>
                    <th>N°</th>
                    <th>Capital</th>
                    <th>Interés</th>
                    <th>Seguro</th>
                    <th>Cuota</th>
                    <th>Saldo</th>
                </tr>
            </thead>
            <tbody>
                ${getRows(tabla)}
            </tbody>
        </table>
    </body>
    </html>`

    await puppeteer.generatePDF(html,`Reporte Amortización (${metodo})`, response);
}

function getRows(tabla){
    let rows = '';
    tabla.forEach(row => {
        rows += 
        `<tr>
            <td>${row.mes}</td>
            <td>$ ${row.capital}</td>
            <td>$ ${row.interes}</td>
            <td>$ ${row.tasaSeguro}</td>
            <td>$ ${row.cuota}</td>
            <td>$ ${row.saldo}</td>
        </tr>`
    });
    return rows;
}