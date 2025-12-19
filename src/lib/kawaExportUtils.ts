import jsPDF from "jspdf";
import Papa from "papaparse";

export interface KawaCSVRow {
  Letter: string;
  Association: string;
}

export class KawaExportUtils {
  static exportToPDF(
    kawaWord: string,
    associations: Record<string, string>,
  ): void {
    const pdf = new jsPDF();
    const pageHeight = pdf.internal.pageSize.height;
    let yPosition = 20;
    const lineHeight = 8;
    const marginLeft = 20;
    const marginRight = 20;
    const pageWidth = pdf.internal.pageSize.width - marginLeft - marginRight;

    // Title
    pdf.setFontSize(20);
    pdf.setFont("helvetica", "bold");
    pdf.text(`KaWa: ${kawaWord}`, marginLeft, yPosition);
    yPosition += 15;

    // Export date
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    pdf.text(
      `Exportiert am: ${new Date().toLocaleDateString("de-DE")}`,
      marginLeft,
      yPosition,
    );
    yPosition += 15;

    // Associations
    Object.entries(associations).forEach(([letter, association]) => {
      if (!association || !association.trim()) return;

      // Check if we need a new page
      if (yPosition > pageHeight - 40) {
        pdf.addPage();
        yPosition = 20;
      }

      // Letter header
      pdf.setFontSize(14);
      pdf.setFont("helvetica", "bold");
      pdf.text(`${letter.toUpperCase()}`, marginLeft, yPosition);
      yPosition += lineHeight + 2;

      // Association text
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");

      const associationLines = pdf.splitTextToSize(association, pageWidth - 10);

      associationLines.forEach((line: string) => {
        if (yPosition > pageHeight - 20) {
          pdf.addPage();
          yPosition = 20;
        }
        pdf.text(line, marginLeft + 10, yPosition);
        yPosition += lineHeight;
      });

      yPosition += 5; // Extra space between letters
    });

    // Save the PDF
    const fileName = `kawa-${kawaWord}-${new Date().toISOString().split("T")[0]}.pdf`;
    pdf.save(fileName);
  }

  static exportToCSV(
    kawaWord: string,
    associations: Record<string, string>,
  ): void {
    const csvData: KawaCSVRow[] = [];

    Object.entries(associations).forEach(([letter, association]) => {
      if (association && association.trim()) {
        csvData.push({
          Letter: letter.toUpperCase(),
          Association: association,
        });
      }
    });

    const csv = Papa.unparse(csvData, {
      delimiter: ",",
      header: true,
      encoding: "utf-8",
    });

    const blob = new Blob([csv], {type: "text/csv;charset=utf-8;"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `kawa-${kawaWord}-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  static exportToMarkdown(
    kawaWord: string,
    associations: Record<string, string>,
  ): void {
    let markdown = `# KaWa: ${kawaWord}\n\n`;
    markdown += `*Exportiert am: ${new Date().toLocaleDateString("de-DE")}*\n\n`;
    markdown += `## Assoziationen\n\n`;

    Object.entries(associations).forEach(([letter, association]) => {
      if (association && association.trim()) {
        markdown += `**${letter.toUpperCase()}** - ${association}\n\n`;
      }
    });

    markdown += `\n---\n*Erstellt mit ABC-Listen App*\n`;

    const blob = new Blob([markdown], {type: "text/markdown;charset=utf-8;"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `kawa-${kawaWord}-${new Date().toISOString().split("T")[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}
