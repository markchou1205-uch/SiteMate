
import * as pdfjsLib from 'pdfjs-dist';

if (typeof window !== 'undefined') {
    const version = pdfjsLib.version;
    const cMapUrl = `https://unpkg.com/pdfjs-dist@${version}/cmaps/`;

    pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${version}/pdf.worker.min.js`;
    (pdfjsLib.GlobalWorkerOptions as any).cMapUrl = cMapUrl;
    (pdfjsLib.GlobalWorkerOptions as any).cMapPacked = true;
    (pdfjsLib.GlobalWorkerOptions as any).standardFontDataUrl = `https://unpkg.com/pdfjs-dist@${version}/standard_fonts/`;
}

export { pdfjsLib };
