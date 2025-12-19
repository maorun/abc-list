import {describe, it, expect, beforeEach, vi} from "vitest";

// Mock jsPDF
const mockSave = vi.fn();
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
    unparse: vi.fn(),
  },
}));

import {KawaExportUtils} from "@/lib/kawaExportUtils";
import Papa from "papaparse";

describe("KawaExportUtils", () => {
  const testKawaData = {
    D: "Docker Container",
    O: "Orchestration",
    C: "Cloud Native",
    K: "Kubernetes",
    E: "Efficient Deployment",
    R: "Reliability",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(Papa.unparse).mockReturnValue(
      "Letter,Association\nD,Docker Container",
    );

    // Mock DOM APIs
    global.URL.createObjectURL = vi.fn(() => "blob:url");
    global.URL.revokeObjectURL = vi.fn();

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
    it("should generate PDF with KaWa word and associations", () => {
      KawaExportUtils.exportToPDF("DOCKER", testKawaData);

      expect(mockSave).toHaveBeenCalledWith(
        expect.stringMatching(/kawa-DOCKER-\d{4}-\d{2}-\d{2}\.pdf/),
      );
    });

    it("should handle empty associations", () => {
      const emptyData = {D: "", O: "", C: "", K: "", E: "", R: ""};
      KawaExportUtils.exportToPDF("DOCKER", emptyData);

      expect(mockSave).toHaveBeenCalled();
    });
  });

  describe("exportToCSV", () => {
    it("should generate CSV with correct structure", () => {
      KawaExportUtils.exportToCSV("DOCKER", testKawaData);

      expect(Papa.unparse).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            Letter: "D",
            Association: "Docker Container",
          }),
          expect.objectContaining({
            Letter: "O",
            Association: "Orchestration",
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
      KawaExportUtils.exportToCSV("DOCKER", testKawaData);

      expect(document.createElement).toHaveBeenCalledWith("a");
      expect(document.body.appendChild).toHaveBeenCalled();
      expect(document.body.removeChild).toHaveBeenCalled();
    });

    it("should skip empty associations", () => {
      const dataWithEmpty = {
        D: "Docker",
        O: "",
        C: "Cloud",
      };
      KawaExportUtils.exportToCSV("DOC", dataWithEmpty);

      expect(Papa.unparse).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({Letter: "D", Association: "Docker"}),
          expect.objectContaining({Letter: "C", Association: "Cloud"}),
        ]),
        expect.any(Object),
      );
    });
  });

  describe("exportToMarkdown", () => {
    it("should generate markdown with correct format", () => {
      KawaExportUtils.exportToMarkdown("DOCKER", testKawaData);

      expect(global.Blob).toHaveBeenCalledWith(
        [expect.stringContaining("# KaWa: DOCKER")],
        {type: "text/markdown;charset=utf-8;"},
      );

      // Check that Blob was called with content containing the associations
      const blobCall = vi.mocked(global.Blob).mock.calls[0];
      const content = blobCall[0][0] as string;
      expect(content).toContain("**D** - Docker Container");
      expect(content).toContain("**O** - Orchestration");
    });

    it("should create download link", () => {
      KawaExportUtils.exportToMarkdown("DOCKER", testKawaData);

      expect(document.createElement).toHaveBeenCalledWith("a");
      expect(document.body.appendChild).toHaveBeenCalled();
    });

    it("should handle empty associations gracefully", () => {
      const dataWithEmpty = {
        D: "Docker",
        O: "",
        C: "Cloud",
      };
      KawaExportUtils.exportToMarkdown("DOC", dataWithEmpty);

      const blobCall = vi.mocked(global.Blob).mock.calls[0];
      const content = blobCall[0][0] as string;
      expect(content).toContain("**D** - Docker");
      expect(content).toContain("**C** - Cloud");
      expect(content).not.toContain("**O** -");
    });
  });
});
