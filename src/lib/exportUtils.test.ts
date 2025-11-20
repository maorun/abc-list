import {describe, it, expect, beforeEach, vi} from "vitest";

// Mock jsPDF to avoid actual PDF generation in tests
const mockSave = vi.fn();
// Vitest v4 requires proper constructor pattern for mocks
vi.mock("jspdf", () => ({
  default: vi.fn(function (this: unknown) {
    return {
      setFontSize: vi.fn(),
      setFont: vi.fn(),
      text: vi.fn(),
      addPage: vi.fn(),
      splitTextToSize: vi.fn().mockReturnValue(["test line"]),
      save: mockSave,
      internal: {
        pageSize: {
          height: 297,
          width: 210,
        },
      },
    };
  }),
}));

// Mock Papa Parse
vi.mock("papaparse", () => ({
  default: {
    parse: vi.fn(),
    unparse: vi.fn(),
  },
}));

import {ExportUtils, CSVRow} from "@/lib/exportUtils";
import {WordWithExplanation} from "@/components/List/types";
import Papa from "papaparse";

describe("ExportUtils", () => {
  const testWords: Record<string, WordWithExplanation[]> = {
    a: [
      {text: "Apple", explanation: "A red fruit", version: 1, imported: false},
      {text: "Ant", explanation: "Small insect", version: 1, imported: true},
    ],
    b: [
      {text: "Ball", explanation: "Round object", version: 1, imported: false},
    ],
    c: [],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(Papa.unparse).mockReturnValue(
      "Letter,Word,Explanation,Imported\nA,Apple,A red fruit,false",
    );

    // Mock URL.createObjectURL and related DOM APIs
    global.URL.createObjectURL = vi.fn(() => "blob:url");
    global.URL.revokeObjectURL = vi.fn();

    // Mock Blob constructor - Vitest v4 requires proper constructor pattern
    global.Blob = vi.fn(function (
      this: Blob,
      content: BlobPart[],
      options?: BlobPropertyBag,
    ) {
      return {
        type: options?.type || "",
        size: content[0]?.toString().length || 0,
      } as Blob;
    }) as unknown as typeof Blob;

    // Mock document.createElement and DOM manipulation
    const mockElement = {
      href: "",
      download: "",
      click: vi.fn(),
    };
    vi.spyOn(document, "createElement").mockReturnValue(
      mockElement as unknown as HTMLAnchorElement,
    );
    vi.spyOn(document.body, "appendChild").mockImplementation(
      () => mockElement as unknown as HTMLAnchorElement,
    );
    vi.spyOn(document.body, "removeChild").mockImplementation(
      () => mockElement as unknown as HTMLAnchorElement,
    );
  });

  describe("exportToPDF", () => {
    it("should call PDF generation with correct parameters", () => {
      ExportUtils.exportToPDF("Test List", testWords);

      expect(mockSave).toHaveBeenCalledWith(
        expect.stringMatching(/abc-liste-Test List-\d{4}-\d{2}-\d{2}\.pdf/),
      );
    });
  });

  describe("exportToCSV", () => {
    it("should generate CSV with correct structure", () => {
      ExportUtils.exportToCSV("Test List", testWords);

      expect(Papa.unparse).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            Letter: "A",
            Word: "Apple",
            Explanation: "A red fruit",
            Imported: false,
          }),
          expect.objectContaining({
            Letter: "A",
            Word: "Ant",
            Explanation: "Small insect",
            Imported: true,
          }),
          expect.objectContaining({
            Letter: "B",
            Word: "Ball",
            Explanation: "Round object",
            Imported: false,
          }),
        ]),
        expect.objectContaining({
          delimiter: ",",
          header: true,
          encoding: "utf-8",
        }),
      );
    });

    it("should create and download CSV file", () => {
      ExportUtils.exportToCSV("Test List", testWords);

      expect(document.createElement).toHaveBeenCalledWith("a");
      expect(document.body.appendChild).toHaveBeenCalled();
      expect(document.body.removeChild).toHaveBeenCalled();
    });
  });

  describe("exportToMarkdown", () => {
    it("should generate markdown with correct format", () => {
      ExportUtils.exportToMarkdown("Test List", testWords);

      expect(global.Blob).toHaveBeenCalledWith(
        [expect.stringContaining("# ABC-Liste: Test List")],
        {type: "text/markdown;charset=utf-8;"},
      );

      expect(document.createElement).toHaveBeenCalledWith("a");
    });
  });

  describe("parseCSVFile", () => {
    it("should resolve with parsed CSV data", async () => {
      const mockFile = new File(["test"], "test.csv", {type: "text/csv"});
      const mockCsvData: CSVRow[] = [
        {Letter: "A", Word: "Apple", Explanation: "Fruit", Imported: false},
      ];

      vi.mocked(Papa.parse).mockImplementation(
        (file, options: Papa.ParseConfig) => {
          options.complete({data: mockCsvData, errors: []});
        },
      );

      const result = await ExportUtils.parseCSVFile(mockFile);

      expect(result).toEqual(mockCsvData);
      expect(Papa.parse).toHaveBeenCalledWith(
        mockFile,
        expect.objectContaining({
          header: true,
          skipEmptyLines: true,
          encoding: "utf-8",
        }),
      );
    });

    it("should reject on parse errors", async () => {
      const mockFile = new File(["test"], "test.csv", {type: "text/csv"});

      vi.mocked(Papa.parse).mockImplementation(
        (file, options: Papa.ParseConfig) => {
          options.complete({
            data: [],
            errors: [{message: "Parse error"}],
          });
        },
      );

      await expect(ExportUtils.parseCSVFile(mockFile)).rejects.toThrow(
        "CSV Parse Error: Parse error",
      );
    });

    it("should reject if required columns are missing", async () => {
      const mockFile = new File(["test"], "test.csv", {type: "text/csv"});
      const invalidData = [{InvalidColumn: "value"}];

      vi.mocked(Papa.parse).mockImplementation(
        (file, options: Papa.ParseConfig) => {
          options.complete({data: invalidData, errors: []});
        },
      );

      await expect(ExportUtils.parseCSVFile(mockFile)).rejects.toThrow(
        "CSV muss mindestens die Spalten 'Letter' und 'Word' enthalten",
      );
    });
  });

  describe("csvToExportedList", () => {
    it("should convert CSV rows to exported list format", () => {
      const csvRows: CSVRow[] = [
        {Letter: "A", Word: "Apple", Explanation: "Fruit", Imported: false},
        {Letter: "B", Word: "Ball", Explanation: "Toy", Imported: false},
        {Letter: "a", Word: "Ant", Explanation: "Insect", Imported: false}, // Test lowercase
      ];

      const result = ExportUtils.csvToExportedList(csvRows, "Test List");

      expect(result.name).toBe("Test List");
      expect(result.words.a).toHaveLength(2);
      expect(result.words.a[0]).toEqual(
        expect.objectContaining({
          text: "Apple",
          explanation: "Fruit",
          imported: true,
        }),
      );
      expect(result.words.b).toHaveLength(1);
      expect(result.words.b[0]).toEqual(
        expect.objectContaining({
          text: "Ball",
          explanation: "Toy",
          imported: true,
        }),
      );
    });

    it("should filter out invalid entries", () => {
      const csvRows: CSVRow[] = [
        {Letter: "A", Word: "Apple", Explanation: "Fruit", Imported: false},
        {Letter: "Z", Word: "", Explanation: "Empty", Imported: false}, // Empty word
        {
          Letter: "Invalid",
          Word: "Test",
          Explanation: "Invalid letter",
          Imported: false,
        }, // Invalid letter
      ];

      const result = ExportUtils.csvToExportedList(csvRows, "Test List");

      expect(result.words.a).toHaveLength(1);
      expect(result.words.z).toHaveLength(0);
    });
  });
});
