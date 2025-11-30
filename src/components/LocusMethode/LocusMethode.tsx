import React, {useState, useEffect, useCallback} from "react";
import {useNavigate} from "react-router-dom";
import {Button} from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import {Input} from "../ui/input";
import {Label} from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {LocusMethodeService} from "@/lib/LocusMethodeService";
import {
  MemoryPalace,
  ROOM_TEMPLATES,
  RoomTemplateType,
} from "@/lib/locusMethode";
import {useGamification} from "@/hooks/useGamification";
import {DeleteConfirm} from "../DeleteConfirm";

// Extract handler actions outside component
const handleNavigateToPalaceAction =
  (
    palaceId: string,
    navigate: ReturnType<typeof useNavigate>,
    service: LocusMethodeService,
  ) =>
  () => {
    service.setActivePalace(palaceId);
    navigate(`/locus-methode/${palaceId}`);
  };

const handleDeletePalaceAction =
  (
    palaceId: string,
    service: LocusMethodeService,
    onUpdate: () => void,
    onClose: () => void,
  ) =>
  () => {
    service.deletePalace(palaceId);
    onUpdate();
    onClose();
  };

export function LocusMethode() {
  const navigate = useNavigate();
  const service = LocusMethodeService.getInstance();
  const {trackListCreated} = useGamification();
  const [palaces, setPalaces] = useState<MemoryPalace[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newPalaceName, setNewPalaceName] = useState("");
  const [selectedTemplate, setSelectedTemplate] =
    useState<RoomTemplateType>("haus");
  const [deleteConfirm, setDeleteConfirm] = useState<{
    visible: boolean;
    palaceId: string | null;
  }>({visible: false, palaceId: null});

  const loadPalaces = useCallback(() => {
    setPalaces(service.getAllPalaces());
  }, [service]);

  useEffect(() => {
    document.title = "Loci-Methode - Gedächtnispaläste";
    loadPalaces();

    const handleUpdate = () => loadPalaces();
    service.on(handleUpdate);

    return () => {
      service.off(handleUpdate);
    };
  }, [service, loadPalaces]);

  const navigateToPalace = (palaceId: string) =>
    handleNavigateToPalaceAction(palaceId, navigate, service)();

  const handleCreatePalace = () => {
    if (newPalaceName.trim()) {
      const palace = service.createPalace(
        newPalaceName.trim(),
        selectedTemplate,
      );
      service.setActivePalace(palace.id);
      trackListCreated(newPalaceName.trim()); // Track as gamification activity
      loadPalaces();
      setIsCreateDialogOpen(false);
      setNewPalaceName("");
      navigate(`/locus-methode/${palace.id}`);
    }
  };

  const handleDeleteClick = (palaceId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteConfirm({visible: true, palaceId});
  };

  const confirmDelete = () => {
    if (deleteConfirm.palaceId) {
      handleDeletePalaceAction(
        deleteConfirm.palaceId,
        service,
        loadPalaces,
        () => setDeleteConfirm({visible: false, palaceId: null}),
      )();
    }
  };

  const stats = service.getStats();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Loci-Methode</h1>
          <p className="text-gray-600">
            Erstelle virtuelle Gedächtnispaläste mit der Loci-Methode. Platziere
            Informationen an bestimmten Orten im Raum für bessere Erinnerung.
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">Neuer Gedächtnispalast</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Neuen Gedächtnispalast erstellen</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="palace-name">Name des Gedächtnispalastes</Label>
                <Input
                  id="palace-name"
                  placeholder="z.B. Mein Studium, Vokabeln Englisch"
                  value={newPalaceName}
                  onChange={(e) => setNewPalaceName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleCreatePalace();
                    }
                  }}
                />
              </div>
              <div>
                <Label htmlFor="template-select">Raum-Vorlage wählen</Label>
                <Select
                  value={selectedTemplate}
                  onValueChange={(value) =>
                    setSelectedTemplate(value as RoomTemplateType)
                  }
                >
                  <SelectTrigger id="template-select">
                    <SelectValue placeholder="Vorlage wählen" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(ROOM_TEMPLATES).map((template) => (
                      <SelectItem key={template.type} value={template.type}>
                        {template.name} - {template.description}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Abbrechen
                </Button>
                <Button
                  onClick={handleCreatePalace}
                  disabled={!newPalaceName.trim()}
                >
                  Erstellen
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics */}
      {palaces.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-blue-600">
              {stats.totalPalaces}
            </div>
            <div className="text-sm text-gray-600">Gedächtnispaläste</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-green-600">
              {stats.totalObjects}
            </div>
            <div className="text-sm text-gray-600">Gespeicherte Objekte</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-purple-600">
              {stats.totalRoutes}
            </div>
            <div className="text-sm text-gray-600">Gedächtnisrouten</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-orange-600">
              {stats.averageObjectsPerPalace.toFixed(1)}
            </div>
            <div className="text-sm text-gray-600">Ø Objekte/Palast</div>
          </div>
        </div>
      )}

      {/* Palace List */}
      <div className="space-y-3">
        {palaces.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500 mb-4">
              Noch keine Gedächtnispaläste vorhanden.
            </p>
            <p className="text-gray-400 text-sm">
              Erstelle deinen ersten Gedächtnispalast, um die Loci-Methode zu
              nutzen.
            </p>
          </div>
        ) : (
          palaces.map((palace) => (
            <div key={palace.id} className="flex items-stretch gap-2 sm:gap-3">
              <Button
                variant="outline"
                className="flex-1 text-left justify-start h-auto py-3"
                onClick={() => navigateToPalace(palace.id)}
              >
                <div className="w-full">
                  <div className="font-semibold">{palace.name}</div>
                  <div className="text-sm text-gray-500">
                    {ROOM_TEMPLATES[palace.template].name} •{" "}
                    {palace.objects.length} Objekte • {palace.routes.length}{" "}
                    Routen
                  </div>
                </div>
              </Button>
              <Button
                variant="destructive"
                size="icon"
                className="flex-shrink-0"
                onClick={(e) => handleDeleteClick(palace.id, e)}
                aria-label={`${palace.name} löschen`}
              >
                ✕
              </Button>
            </div>
          ))
        )}
      </div>

      {/* Delete Confirmation */}
      <DeleteConfirm
        isVisible={deleteConfirm.visible}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteConfirm({visible: false, palaceId: null})}
        itemName="diesen Gedächtnispalast"
      />
    </div>
  );
}
