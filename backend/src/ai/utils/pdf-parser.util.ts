import * as fs from 'fs';
import { createWorker } from 'tesseract.js';
import { pdf } from 'pdf-to-img';

// Importación robusta de pdf-parse para entornos NestJS/NodeNext
const pdfParseModule = require('pdf-parse');
const PdfParseClass = pdfParseModule?.PDFParse ?? pdfParseModule?.default?.PDFParse ?? pdfParseModule;

async function ejecutarPdfParse(buffer: Buffer) {
  if (typeof PdfParseClass === 'function') {
    const parser = new PdfParseClass({ data: buffer });
    return parser.getText();
  }

  if (typeof pdfParseModule === 'function') {
    return pdfParseModule(buffer);
  }

  throw new Error('Importación inválida de pdf-parse');
}

/**
 * Utilidad robusta para extraer texto de un PDF.
 * Primero intenta con extracción directa y si el resultado es pobre, aplica OCR.
 */
export async function extraerTextoPdf(bufferOPath: Buffer | string): Promise<string> {
  const dataBuffer = Buffer.isBuffer(bufferOPath) ? bufferOPath : fs.readFileSync(bufferOPath);
  
  console.log('--- Iniciando extracción de texto de PDF ---');
  
  try {
    // 1. INTENTO DE EXTRACCIÓN DIRECTA (pdf-parse)
    console.log('[pdf-parse] Intentando extracción directa de texto...');
    const data = await ejecutarPdfParse(dataBuffer);
    let textoExtraido = '';

    if (typeof data === 'string') {
      textoExtraido = data.trim();
    } else if (data && typeof data.text === 'string') {
      textoExtraido = data.text.trim();
    }

    console.log(`[pdf-parse] Caracteres extraídos: ${textoExtraido.length}`);

    // 2. LOGICA DE FALLBACK OCR
    // Si extrae menos de 100 caracteres, probablemente sea un PDF escaneado (imagen)
    const UMBRAL_OCR = 100;
    
    if (textoExtraido.length < UMBRAL_OCR) {
      console.warn(`[OCR] Texto insuficiente (${textoExtraido.length} chars). Activando fallback OCR...`);
      
      const textoOCR = await aplicarOCR(dataBuffer);
      
      if (textoOCR.length > textoExtraido.length) {
        console.log(`[OCR] Éxito. OCR extrajo ${textoOCR.length} caracteres.`);
        textoExtraido = textoOCR;
      } else {
        console.warn('[OCR] El resultado del OCR fue menor que la extracción directa. Manteniendo original.');
      }
    }

    console.log('--- Finalización de extracción ---');
    return textoExtraido;
  } catch (error) {
    console.error('[EXTRAER_PDF_ERROR] Error crítico:', error.message);
    throw new Error('No se pudo procesar el archivo PDF: ' + error.message);
  }
}

/**
 * Convierte las páginas del PDF en imágenes y aplica Tesseract OCR.
 */
async function aplicarOCR(buffer: Buffer): Promise<string> {
  let textoFinal = '';
  let worker: any = null;

  try {
    console.log('[OCR] Inicializando Tesseract Worker (Idioma: spa + eng)...');
    worker = await createWorker(['spa', 'eng']);
    
    console.log('[OCR] Convirtiendo PDF a imágenes...');
    const paginas = await pdf(buffer, { scale: 2 });
    
    let nPagina = 1;
    for await (const imagenBuffer of paginas) {
      console.log(`[OCR] Analizando página ${nPagina}...`);
      if (worker) {
        const { data: { text } } = await worker.recognize(imagenBuffer);
        textoFinal += text + '\n';
      }
      nPagina++;
    }

    return textoFinal.trim();
  } catch (error: any) {
    console.error('[OCR_ERROR] Error al procesar imágenes o aplicar Tesseract:', error.message);
    return '';
  } finally {
    if (worker) {
      await worker.terminate();
    }
  }
}
