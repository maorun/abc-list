import jsPDF from "jspdf";
import Papa from "papaparse";
import {z} from "zod";
import {WordWithExplanation} from "@/components/List/types";

export interface ExportedList {
  name: string;
  version: number;
  exportDate: string;
  words: Record<string, WordWithExplanation[]>;
}

export interface CSVRow {
  Letter: string;
  Word: string;
  Explanation: string;
  Imported: boolean;
  Timestamp?: string;
}

// Zod schema for runtime validation of CSV rows
const CSVRowSchema = z.object({
  Letter: z.string().min(1, "Letter is required"),
  Word: z.string().min(1, "Word is required"),
  Explanation: z.string().optional().default(""),
  Imported: z
    .union([z.boolean(), z.string()])
    .transform((val) => {
      if (typeof val === "string") {
        return val.toLowerCase() === "true" || val === "1";
      }
      return Boolean(val);
    })
    .optional()
    .default(false),
  Timestamp: z.string().optional(),
});

export class ExportUtils {
  static exportToPDF(
    listName: string,
    words: Record<string, WordWithExplanation[]>,
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
    pdf.text(`ABC-Liste: ${listName}`, marginLeft, yPosition);
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

    const alphabet = Array.from({length: 26}, (_, i) =>
      String.fromCharCode(97 + i),
    );

    alphabet.forEach((letter) => {
      const letterWords = words[letter] || [];
      if (letterWords.length === 0) return;

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

      // Words for this letter
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");

      letterWords.forEach((wordObj) => {
        // Check if we need a new page
        if (yPosition > pageHeight - 20) {
          pdf.addPage();
          yPosition = 20;
        }

        // Word
        pdf.setFont("helvetica", "bold");
        pdf.text(`• ${wordObj.text}`, marginLeft + 10, yPosition);
        yPosition += lineHeight;

        // Explanation (if exists)
        if (wordObj.explanation && wordObj.explanation.trim()) {
          pdf.setFont("helvetica", "normal");
          const explanationLines = pdf.splitTextToSize(
            `  ${wordObj.explanation}`,
            pageWidth - 20,
          );

          explanationLines.forEach((line: string) => {
            if (yPosition > pageHeight - 20) {
              pdf.addPage();
              yPosition = 20;
            }
            pdf.text(line, marginLeft + 10, yPosition);
            yPosition += lineHeight;
          });
        }
        yPosition += 2; // Extra space between words
      });
      yPosition += 5; // Extra space between letters
    });

    // Save the PDF
    const fileName = `abc-liste-${listName}-${new Date().toISOString().split("T")[0]}.pdf`;
    pdf.save(fileName);
  }

  static exportToCSV(
    listName: string,
    words: Record<string, WordWithExplanation[]>,
  ): void {
    const csvData: CSVRow[] = [];
    const alphabet = Array.from({length: 26}, (_, i) =>
      String.fromCharCode(97 + i),
    );

    alphabet.forEach((letter) => {
      const letterWords = words[letter] || [];
      letterWords.forEach((wordObj) => {
        csvData.push({
          Letter: letter.toUpperCase(),
          Word: wordObj.text,
          Explanation: wordObj.explanation || "",
          Imported: wordObj.imported || false,
          Timestamp: wordObj.timestamp
            ? new Date(wordObj.timestamp).toISOString()
            : "",
        });
      });
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
    a.download = `abc-liste-${listName}-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  static exportToMarkdown(
    listName: string,
    words: Record<string, WordWithExplanation[]>,
  ): void {
    let markdown = `# ABC-Liste: ${listName}\n\n`;
    markdown += `*Exportiert am: ${new Date().toLocaleDateString("de-DE")}*\n\n`;

    const alphabet = Array.from({length: 26}, (_, i) =>
      String.fromCharCode(97 + i),
    );

    alphabet.forEach((letter) => {
      const letterWords = words[letter] || [];
      if (letterWords.length === 0) return;

      markdown += `## ${letter.toUpperCase()}\n\n`;

      letterWords.forEach((wordObj) => {
        markdown += `- **${wordObj.text}**`;
        if (wordObj.explanation && wordObj.explanation.trim()) {
          markdown += `: ${wordObj.explanation}`;
        }
        if (wordObj.imported) {
          markdown += ` *(importiert)*`;
        }
        markdown += `\n`;
      });
      markdown += `\n`;
    });

    markdown += `\n---\n*Erstellt mit ABC-Listen App*\n`;

    const blob = new Blob([markdown], {type: "text/markdown;charset=utf-8;"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `abc-liste-${listName}-${new Date().toISOString().split("T")[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  static parseCSVFile(file: File): Promise<CSVRow[]> {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        encoding: "utf-8",
        complete: (results) => {
          if (results.errors.length > 0) {
            reject(new Error(`CSV Parse Error: ${results.errors[0].message}`));
            return;
          }

          try {
            // Validate and transform the data using Zod schema
            const validatedRows: CSVRow[] = [];
            const rawData = results.data as unknown[];

            // Check if we have any data and required columns exist
            if (rawData.length > 0) {
              const firstRow = rawData[0] as Record<string, unknown>;
              if (!("Letter" in firstRow) || !("Word" in firstRow)) {
                reject(
                  new Error(
                    "CSV muss mindestens die Spalten 'Letter' und 'Word' enthalten",
                  ),
                );
                return;
              }
            }

            for (let i = 0; i < rawData.length; i++) {
              try {
                const validatedRow = CSVRowSchema.parse(rawData[i]);
                validatedRows.push(validatedRow);
              } catch (zodError) {
                const errorMessage =
                  zodError instanceof z.ZodError
                    ? zodError.errors
                        .map((e) => `${e.path.join(".")}: ${e.message}`)
                        .join(", ")
                    : "Unbekannter Validierungsfehler";
                reject(
                  new Error(
                    `Validierungsfehler in Zeile ${i + 1}: ${errorMessage}`,
                  ),
                );
                return;
              }
            }

            resolve(validatedRows);
          } catch (error) {
            reject(
              new Error(
                `Fehler beim Validieren der CSV-Daten: ${error instanceof Error ? error.message : "Unbekannter Fehler"}`,
              ),
            );
          }
        },
        error: (error) => {
          reject(
            new Error(`Fehler beim Lesen der CSV-Datei: ${error.message}`),
          );
        },
      });
    });
  }

  static csvToExportedList(csvRows: CSVRow[], listName: string): ExportedList {
    const words: Record<string, WordWithExplanation[]> = {};
    const alphabet = Array.from({length: 26}, (_, i) =>
      String.fromCharCode(97 + i),
    );

    // Initialize all letters
    alphabet.forEach((letter) => {
      words[letter] = [];
    });

    csvRows.forEach((row) => {
      const letter = row.Letter.toLowerCase();
      if (alphabet.includes(letter) && row.Word && row.Word.trim()) {
        const wordObj: WordWithExplanation = {
          text: row.Word.trim(),
          explanation: row.Explanation || "",
          version: 1,
          imported: true, // Mark as imported since it's from CSV
          timestamp: row.Timestamp
            ? new Date(row.Timestamp).getTime()
            : Date.now(),
        };
        words[letter].push(wordObj);
      }
    });

    return {
      name: listName,
      version: 1,
      exportDate: new Date().toISOString(),
      words,
    };
  }
}
