import React, {useEffect, useRef, useState, useCallback} from "react";
import {useParams, useNavigate} from "react-router-dom";
import {Button} from "../ui/button";
import {Dialog, DialogContent, DialogHeader, DialogTitle} from "../ui/dialog";
import {Input} from "../ui/input";
import {Label} from "../ui/label";
import {Textarea} from "../ui/textarea";
import {LocusMethodeService} from "@/lib/LocusMethodeService";
import {MemoryPalace, MemoryObject, ROOM_TEMPLATES} from "@/lib/locusMethode";
import {DeleteConfirm} from "../DeleteConfirm";

// Extract handler actions outside component
const handleBackToListAction =
  (navigate: ReturnType<typeof useNavigate>) => () => {
    navigate("/locus-methode");
  };

const handleCanvasClickAction = (
  e: React.MouseEvent<HTMLCanvasElement>,
  canvasRef: React.RefObject<HTMLCanvasElement>,
  palaceId: string,
  service: LocusMethodeService,
  setSelectedObject: (obj: MemoryObject | null) => void,
  setIsAddDialogOpen: (open: boolean) => void,
  setClickPosition: (pos: {x: number; y: number}) => void,
) => {
  const canvas = canvasRef.current;
  if (!canvas) return;

  const rect = canvas.getBoundingClientRect();
  const x = ((e.clientX - rect.left) / rect.width) * 100;
  const y = ((e.clientY - rect.top) / rect.height) * 100;

  // Check if clicked on an existing object
  const palace = service.getPalace(palaceId);
  if (palace) {
    const clickedObject = palace.objects.find((obj) => {
      const dx = Math.abs(obj.x - x);
      const dy = Math.abs(obj.y - y);
      const clickRadius = (obj.size / rect.width) * 100;
      return dx < clickRadius && dy < clickRadius;
    });

    if (clickedObject) {
      setSelectedObject(clickedObject);
      return;
    }
  }

  // No object clicked, prepare to add new object
  setClickPosition({x, y});
  setIsAddDialogOpen(true);
};

export function LocusMethodeRoom() {
  const {id} = useParams<{id: string}>();
  const navigate = useNavigate();
  const service = LocusMethodeService.getInstance();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [palace, setPalace] = useState<MemoryPalace | null>(null);
  const [selectedObject, setSelectedObject] = useState<MemoryObject | null>(
    null,
  );
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [clickPosition, setClickPosition] = useState<{x: number; y: number}>({
    x: 50,
    y: 50,
  });
  const [newObjectContent, setNewObjectContent] = useState("");
  const [newObjectNotes, setNewObjectNotes] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<{
    visible: boolean;
    objectId: string | null;
  }>({visible: false, objectId: null});

  // Stable back handler
  const backToList = useCallback(
    () => handleBackToListAction(navigate)(),
    [navigate],
  );

  useEffect(() => {
    if (id) {
      const loadedPalace = service.getPalace(id);
      if (loadedPalace) {
        setPalace(loadedPalace);
        document.title = `Loci-Methode - ${loadedPalace.name}`;
        drawPalace(loadedPalace);
      } else {
        navigate("/locus-methode");
      }
    }

    const handleUpdate = () => {
      if (id) {
        const updatedPalace = service.getPalace(id);
        if (updatedPalace) {
          setPalace(updatedPalace);
          drawPalace(updatedPalace);
        }
      }
    };

    service.on(handleUpdate);
    return () => {
      service.off(handleUpdate);
    };
  }, [id, service, navigate, drawPalace]);

  const drawPalace = useCallback((palaceData: MemoryPalace) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Save canvas state
    ctx.save();

    // Set canvas size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background
    const template = ROOM_TEMPLATES[palaceData.template];
    ctx.fillStyle = template.backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw landmarks
    template.landmarks.forEach((landmark) => {
      ctx.save(); // Save state before drawing each landmark
      const x = (landmark.x / 100) * canvas.width;
      const y = (landmark.y / 100) * canvas.height;

      // Draw landmark icon
      ctx.font = "32px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "#000"; // Reset fill style for icons
      ctx.fillText(landmark.icon, x, y);

      // Draw landmark label
      ctx.font = "12px Arial";
      ctx.fillStyle = "#666";
      ctx.fillText(landmark.label, x, y + 25);
      ctx.restore(); // Restore state after drawing landmark
    });

    // Draw memory objects
    palaceData.objects.forEach((obj) => {
      ctx.save(); // Save state before drawing each object
      const x = (obj.x / 100) * canvas.width;
      const y = (obj.y / 100) * canvas.height;

      // Draw object circle
      ctx.fillStyle = obj.color;
      ctx.beginPath();
      ctx.arc(x, y, obj.size / 2, 0, 2 * Math.PI);
      ctx.fill();

      // Draw symbol if exists
      if (obj.symbol) {
        ctx.font = "24px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "#000"; // Ensure text is visible
        ctx.fillText(obj.symbol, x, y);
      }

      // Draw content text
      ctx.font = "11px Arial";
      ctx.fillStyle = "#000";
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      const maxWidth = 80;
      const words = obj.content.split(" ");
      let line = "";
      let lineY = y + obj.size / 2 + 5;

      words.forEach((word, index) => {
        const testLine = line + word + " ";
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && index > 0) {
          ctx.fillText(line, x, lineY);
          line = word + " ";
          lineY += 12;
        } else {
          line = testLine;
        }
      });
      ctx.fillText(line, x, lineY);
      ctx.restore(); // Restore state after drawing object
    });

    // Draw routes if any
    palaceData.routes.forEach((route) => {
      if (route.objectIds.length < 2) return;

      ctx.save(); // Save state before drawing route
      ctx.strokeStyle = "#3B82F6";
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();

      route.objectIds.forEach((objId, index) => {
        const obj = palaceData.objects.find((o) => o.id === objId);
        if (!obj) return;

        const x = (obj.x / 100) * canvas.width;
        const y = (obj.y / 100) * canvas.height;

        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });

      ctx.stroke();
      ctx.restore(); // Restore state after drawing route
    });

    // Restore main canvas state
    ctx.restore();
  }, []);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!id) return;
    handleCanvasClickAction(
      e,
      canvasRef,
      id,
      service,
      setSelectedObject,
      setIsAddDialogOpen,
      setClickPosition,
    );
  };

  const handleAddObject = () => {
    if (!id || !newObjectContent.trim()) return;

    service.addObject(
      id,
      newObjectContent.trim(),
      clickPosition.x,
      clickPosition.y,
    );
    const updatedPalace = service.getPalace(id);
    if (updatedPalace) {
      setPalace(updatedPalace);
      drawPalace(updatedPalace);
    }

    setIsAddDialogOpen(false);
    setNewObjectContent("");
    setNewObjectNotes("");
  };

  const handleDeleteObject = () => {
    if (!id || !deleteConfirm.objectId) return;

    service.deleteObject(id, deleteConfirm.objectId);
    const updatedPalace = service.getPalace(id);
    if (updatedPalace) {
      setPalace(updatedPalace);
      drawPalace(updatedPalace);
    }

    setSelectedObject(null);
    setDeleteConfirm({visible: false, objectId: null});
  };

  if (!palace) {
    return <div>Lade Gedächtnispalast...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">{palace.name}</h1>
          <p className="text-gray-600">
            {ROOM_TEMPLATES[palace.template].name} • {palace.objects.length}{" "}
            Objekte • {palace.routes.length} Routen
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={backToList}>
            ← Zurück zur Übersicht
          </Button>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Anleitung:</strong> Klicke auf die Leinwand, um ein neues
          Objekt zu platzieren. Klicke auf ein bestehendes Objekt, um Details
          anzuzeigen oder es zu löschen.
        </p>
      </div>

      {/* Canvas */}
      <div className="bg-white rounded-lg shadow p-4">
        <canvas
          ref={canvasRef}
          onClick={handleCanvasClick}
          className="w-full border border-gray-300 rounded cursor-crosshair"
          style={{height: "500px", maxHeight: "70vh"}}
        />
      </div>

      {/* Add Object Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Neues Objekt platzieren</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="object-content">
                Inhalt (was möchtest du dir merken?)
              </Label>
              <Input
                id="object-content"
                placeholder="z.B. Hauptstadt von Frankreich: Paris"
                value={newObjectContent}
                onChange={(e) => setNewObjectContent(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleAddObject();
                  }
                }}
              />
            </div>
            <div>
              <Label htmlFor="object-notes">
                Zusätzliche Notizen (optional)
              </Label>
              <Textarea
                id="object-notes"
                placeholder="Merkhilfen, Assoziationen, etc."
                value={newObjectNotes}
                onChange={(e) => setNewObjectNotes(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsAddDialogOpen(false)}
              >
                Abbrechen
              </Button>
              <Button
                onClick={handleAddObject}
                disabled={!newObjectContent.trim()}
              >
                Platzieren
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Object Details Dialog */}
      <Dialog
        open={!!selectedObject}
        onOpenChange={(open) => !open && setSelectedObject(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Objekt-Details</DialogTitle>
          </DialogHeader>
          {selectedObject && (
            <div className="space-y-4">
              <div>
                <Label>Inhalt</Label>
                <p className="text-sm mt-1">{selectedObject.content}</p>
              </div>
              {selectedObject.notes && (
                <div>
                  <Label>Notizen</Label>
                  <p className="text-sm mt-1 text-gray-600">
                    {selectedObject.notes}
                  </p>
                </div>
              )}
              <div>
                <Label>Statistik</Label>
                <p className="text-sm mt-1 text-gray-600">
                  Erstellt:{" "}
                  {new Date(selectedObject.createdAt).toLocaleDateString()}
                  <br />
                  Gemerkt: {selectedObject.reviewCount} Mal
                </p>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setSelectedObject(null)}
                >
                  Schließen
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    setDeleteConfirm({
                      visible: true,
                      objectId: selectedObject.id,
                    });
                    setSelectedObject(null);
                  }}
                >
                  Löschen
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <DeleteConfirm
        isVisible={deleteConfirm.visible}
        onConfirm={handleDeleteObject}
        onCancel={() => setDeleteConfirm({visible: false, objectId: null})}
        itemName="dieses Objekt"
      />
    </div>
  );
}
