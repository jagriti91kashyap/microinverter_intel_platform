import ExcelJS from 'exceljs';
import { ScrapeResult } from './types';
import * as path from 'path';
import * as fs from 'fs';

export class ExcelExporter {
  async exportToExcel(results: ScrapeResult[], outputPath: string): Promise<string> {
    const workbook = new ExcelJS.Workbook();
    
    workbook.creator = 'Enphase Video Scraper';
    workbook.created = new Date();
    workbook.modified = new Date();

    results.forEach(result => {
      const sheetName = `${result.country} (${result.locale})`.substring(0, 31);
      const worksheet = workbook.addWorksheet(sheetName);

      worksheet.columns = [
        { header: 'Category', key: 'category', width: 25 },
        { header: 'Document Name', key: 'documentName', width: 50 },
        { header: 'Document Type', key: 'documentType', width: 20 },
        { header: 'URL', key: 'url', width: 80 }
      ];

      const headerRow = worksheet.getRow(1);
      headerRow.font = { bold: true, size: 11 };
      headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFD9D9D9' }
      };
      headerRow.alignment = { vertical: 'middle', horizontal: 'left' };
      headerRow.height = 20;

      result.videos.forEach(video => {
        const row = worksheet.addRow({
          category: video.category,
          documentName: video.documentName,
          documentType: video.documentType,
          url: video.url
        });

        const urlCell = row.getCell(4);
        urlCell.value = {
          text: video.url,
          hyperlink: video.url
        };
        urlCell.font = { color: { argb: 'FF0563C1' }, underline: true };
      });

      worksheet.autoFilter = {
        from: 'A1',
        to: 'D1'
      };

      worksheet.views = [
        { state: 'frozen', xSplit: 0, ySplit: 1 }
      ];
    });

    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    await workbook.xlsx.writeFile(outputPath);
    
    return outputPath;
  }

  generateOutputPath(): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
    const outputDir = path.join(process.cwd(), 'output');
    return path.join(outputDir, `enphase-videos-${timestamp}.xlsx`);
  }
}
