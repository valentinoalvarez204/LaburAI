import * as fs from 'fs';
const pdf = require('pdf-parse');

export async function extraerTextoPdf(bufferOPath: Buffer | string): Promise<string> {
  const dataBuffer = Buffer.isBuffer(bufferOPath) ? bufferOPath : fs.readFileSync(bufferOPath);
  try {
    const { PDFParse } = pdf;
    
    if (typeof PDFParse !== 'function') {
      throw new Error('No se encontró el constructor PDFParse en la librería');
    }

    // En esta versión moderna se usa como clase
    const parser = new PDFParse({ data: dataBuffer });
    await parser.load();
    const result = await parser.getText();
    
    // Liberamos memoria
    if (parser.destroy) await parser.destroy();

    return result.text || '';
  } catch (error) {
    console.error('Error al extraer texto del PDF:', error);
    throw new Error('No se pudo leer el archivo PDF: ' + error.message);
  }
}
