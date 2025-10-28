/**
 * PDF Text Extraction Utility
 * Extracts text content from PDF files for AI analysis
 */

let pdfjsLib: any = null;
let loadPromise: Promise<any> | null = null;

async function loadPdfJs(): Promise<any> {
    if (pdfjsLib) return pdfjsLib;
    if (loadPromise) return loadPromise;

    // @ts-expect-error - pdfjs-dist/build/pdf.mjs is not a module
    loadPromise = import("pdfjs-dist/build/pdf.mjs").then((lib) => {
        // Set the worker source to use local file
        lib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
        pdfjsLib = lib;
        return lib;
    });

    return loadPromise;
}

export interface PdfTextResult {
    text: string;
    error?: string;
}

/**
 * Extracts all text content from a PDF file
 * @param file - The PDF file to extract text from
 * @returns Promise with extracted text and optional error
 */
export async function extractTextFromPdf(file: File): Promise<PdfTextResult> {
    try {
        const lib = await loadPdfJs();

        // Convert file to array buffer
        const arrayBuffer = await file.arrayBuffer();
        
        // Load the PDF document
        const pdf = await lib.getDocument({ data: arrayBuffer }).promise;
        
        const numPages = pdf.numPages;
        let fullText = "";

        // Extract text from each page
        for (let pageNum = 1; pageNum <= numPages; pageNum++) {
            const page = await pdf.getPage(pageNum);
            const textContent = await page.getTextContent();
            
            // Combine all text items from the page
            const pageText = textContent.items
                .map((item: any) => item.str)
                .join(" ");
            
            fullText += pageText + "\n\n";
        }

        return {
            text: fullText.trim(),
        };
    } catch (error) {
        console.error("PDF text extraction error:", error);
        return {
            text: "",
            error: error instanceof Error ? error.message : "Failed to extract text from PDF",
        };
    }
}

/**
 * Extracts text from the first page only (faster for large PDFs)
 * @param file - The PDF file to extract text from
 * @returns Promise with extracted text from first page
 */
export async function extractTextFromFirstPage(file: File): Promise<PdfTextResult> {
    try {
        const lib = await loadPdfJs();

        const arrayBuffer = await file.arrayBuffer();
        const pdf = await lib.getDocument({ data: arrayBuffer }).promise;
        const page = await pdf.getPage(1);
        const textContent = await page.getTextContent();
        
        const text = textContent.items
            .map((item: any) => item.str)
            .join(" ");

        return {
            text: text.trim(),
        };
    } catch (error) {
        console.error("PDF text extraction error:", error);
        return {
            text: "",
            error: error instanceof Error ? error.message : "Failed to extract text from PDF",
        };
    }
}
