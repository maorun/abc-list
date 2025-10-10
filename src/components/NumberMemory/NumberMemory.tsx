import React, {useState, useEffect, useCallback} from "react";
import {Button} from "../ui/button";
import {Input} from "../ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "../ui/tabs";
import {toast} from "sonner";
import {NumberMemoryService} from "@/lib/NumberMemoryService";
import {
  generateTrainingNumber,
  numberToMajorWord,
  getConsonantsForNumber,
  NumberAssociation,
  TrainingSession,
} from "@/lib/numberMemory";
import {useGamification} from "@/hooks/useGamification";

// Extract handlers outside component to prevent recreation on every render
const handleStartTraining = (
  type: TrainingSession["type"],
  service: NumberMemoryService,
  setCurrentNumber: (num: string) => void,
  setUserInput: (input: string) => void,
  setTrainingActive: (active: boolean) => void,
  setStartTime: (time: number) => void,
) => {
  const number = generateTrainingNumber(type);
  setCurrentNumber(number);
  setUserInput("");
  setTrainingActive(true);
  setStartTime(Date.now());
};

const handleSubmitAnswer = (
  currentNumber: string,
  userInput: string,
  startTime: number,
  currentType: TrainingSession["type"],
  service: NumberMemoryService,
  setTrainingActive: (active: boolean) => void,
  setCurrentNumber: (num: string) => void,
) => {
  const timeSpent = Math.floor((Date.now() - startTime) / 1000);
  const isCorrect = userInput.trim() === currentNumber;

  service.recordTrainingSession({
    type: currentType,
    numberToMemorize: currentNumber,
    userAnswer: userInput.trim(),
    isCorrect,
    timeSpent,
  });

  if (isCorrect) {
    toast.success("✓ Richtig! Sehr gut!");
  } else {
    toast.error(`✗ Leider falsch. Richtige Antwort: ${currentNumber}`);
  }

  setTrainingActive(false);
  setCurrentNumber("");
};

const handleAddAssociation = (
  number: string,
  image: string,
  story: string,
  service: NumberMemoryService,
  setNumber: (num: string) => void,
  setImage: (img: string) => void,
  setStory: (s: string) => void,
  setShowAddDialog: (show: boolean) => void,
  refreshAssociations: () => void,
) => {
  if (!number.trim() || !image.trim()) {
    toast.error("Bitte Zahl und Bild eingeben");
    return;
  }

  service.addAssociation({
    number: number.trim(),
    image: image.trim(),
    story: story.trim() || undefined,
    isCustom: true,
  });

  toast.success("Assoziation hinzugefügt!");
  setNumber("");
  setImage("");
  setStory("");
  setShowAddDialog(false);
  refreshAssociations();
};

const handleDeleteAssociation = (
  number: string,
  service: NumberMemoryService,
  refreshAssociations: () => void,
) => {
  service.deleteAssociation(number);
  toast.success("Assoziation gelöscht");
  refreshAssociations();
};

export function NumberMemory() {
  const [service] = useState(() => NumberMemoryService.getInstance());
  const [associations, setAssociations] = useState<NumberAssociation[]>([]);
  const [trainingHistory, setTrainingHistory] = useState<TrainingSession[]>([]);
  const [stats, setStats] = useState(service.getStatistics());

  const [currentType, setCurrentType] =
    useState<TrainingSession["type"]>("pin");
  const [currentNumber, setCurrentNumber] = useState("");
  const [userInput, setUserInput] = useState("");
  const [trainingActive, setTrainingActive] = useState(false);
  const [startTime, setStartTime] = useState(0);

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newNumber, setNewNumber] = useState("");
  const [newImage, setNewImage] = useState("");
  const [newStory, setNewStory] = useState("");

  const {trackSokratesSession} = useGamification();

  const loadData = useCallback(() => {
    setAssociations(service.getAllAssociations());
    setTrainingHistory(service.getTrainingHistory(10));
    setStats(service.getStatistics());
  }, [service]);

  useEffect(() => {
    const handleUpdate = () => {
      loadData();
    };

    loadData();
    service.addEventListener(handleUpdate);
    return () => service.removeEventListener(handleUpdate);
  }, [service, loadData]);

  const startTraining = () =>
    handleStartTraining(
      currentType,
      service,
      setCurrentNumber,
      setUserInput,
      setTrainingActive,
      setStartTime,
    );

  const submitAnswer = () => {
    handleSubmitAnswer(
      currentNumber,
      userInput,
      startTime,
      currentType,
      service,
      setTrainingActive,
      setCurrentNumber,
    );
    trackSokratesSession();
  };

  const addAssociation = () =>
    handleAddAssociation(
      newNumber,
      newImage,
      newStory,
      service,
      setNewNumber,
      setNewImage,
      setNewStory,
      setShowAddDialog,
      loadData,
    );

  const deleteAssociation = (number: string) =>
    handleDeleteAssociation(number, service, loadData);

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Zahlen-Merk-System</h1>
        <p className="text-gray-600">
          💡 Lernen Sie, Zahlen mit der Birkenbihl Major-System-Methode zu
          merken
        </p>
      </div>

      <Tabs defaultValue="training" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="training">🎯 Training</TabsTrigger>
          <TabsTrigger value="associations">📝 Assoziationen</TabsTrigger>
          <TabsTrigger value="history">📊 Verlauf</TabsTrigger>
          <TabsTrigger value="help">❓ Hilfe</TabsTrigger>
        </TabsList>

        {/* Training Tab */}
        <TabsContent value="training" className="space-y-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h2 className="font-semibold text-lg mb-3">
              Trainingsmodus wählen
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Button
                onClick={() => setCurrentType("pin")}
                variant={currentType === "pin" ? "default" : "outline"}
                className="w-full"
              >
                🔢 PIN (4 Ziffern)
              </Button>
              <Button
                onClick={() => setCurrentType("phone")}
                variant={currentType === "phone" ? "default" : "outline"}
                className="w-full"
              >
                📞 Telefon (10 Ziffern)
              </Button>
              <Button
                onClick={() => setCurrentType("date")}
                variant={currentType === "date" ? "default" : "outline"}
                className="w-full"
              >
                📅 Datum (8 Ziffern)
              </Button>
              <Button
                onClick={() => setCurrentType("custom")}
                variant={currentType === "custom" ? "default" : "outline"}
                className="w-full"
              >
                ✨ Beliebig (6-8)
              </Button>
            </div>
          </div>

          {!trainingActive ? (
            <div className="text-center py-8">
              <Button
                onClick={startTraining}
                size="lg"
                className="bg-green-600 hover:bg-green-700"
              >
                🚀 Training starten
              </Button>
            </div>
          ) : (
            <div className="bg-white border-2 border-blue-500 rounded-lg p-6 space-y-4">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">Merken Sie sich:</p>
                <p className="text-4xl font-bold tracking-wider mb-4">
                  {currentNumber}
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  Major-System-Konsonanten: {numberToMajorWord(currentNumber)}
                </p>
              </div>

              <div className="space-y-3">
                <Input
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder="Geben Sie die Zahl ein..."
                  className="text-center text-2xl tracking-wider"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") submitAnswer();
                  }}
                />
                <div className="flex gap-2 justify-center">
                  <Button onClick={submitAnswer} className="bg-blue-600">
                    ✓ Antwort prüfen
                  </Button>
                  <Button
                    onClick={() => setTrainingActive(false)}
                    variant="outline"
                  >
                    Abbrechen
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Statistics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white border rounded-lg p-4">
              <p className="text-sm text-gray-600">Erfolgsrate</p>
              <p className="text-2xl font-bold text-green-600">
                {Math.round(stats.successRate * 100)}%
              </p>
            </div>
            <div className="bg-white border rounded-lg p-4">
              <p className="text-sm text-gray-600">Sessions</p>
              <p className="text-2xl font-bold">
                {stats.totalTrainingSessions}
              </p>
            </div>
            <div className="bg-white border rounded-lg p-4">
              <p className="text-sm text-gray-600">Längste Zahl</p>
              <p className="text-2xl font-bold">
                {stats.longestNumberMemorized} Ziffern
              </p>
            </div>
            <div className="bg-white border rounded-lg p-4">
              <p className="text-sm text-gray-600">Eigene Bilder</p>
              <p className="text-2xl font-bold">
                {stats.customAssociationsCount}
              </p>
            </div>
          </div>
        </TabsContent>

        {/* Associations Tab */}
        <TabsContent value="associations" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Zahlenbilder</h2>
            <Button onClick={() => setShowAddDialog(true)}>
              ➕ Eigene Assoziation
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {associations.map((assoc) => (
              <div
                key={assoc.number}
                className={`border rounded-lg p-4 ${
                  assoc.isCustom ? "bg-blue-50 border-blue-300" : "bg-white"
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-2xl font-bold">{assoc.number}</span>
                  {assoc.isCustom && (
                    <Button
                      onClick={() => deleteAssociation(assoc.number)}
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-800"
                    >
                      ✕
                    </Button>
                  )}
                </div>
                <p className="font-semibold text-lg">{assoc.image}</p>
                {assoc.story && (
                  <p className="text-sm text-gray-600 mt-2">{assoc.story}</p>
                )}
                <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                  <span>
                    {getConsonantsForNumber(assoc.number)
                      .map((c) => c.join("/"))
                      .join("-")}
                  </span>
                  {assoc.reviewCount > 0 && (
                    <span>📖 {assoc.reviewCount}x</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-4">
          <h2 className="text-xl font-semibold">Letzte Trainings</h2>
          <div className="space-y-2">
            {trainingHistory.map((session) => (
              <div
                key={session.id}
                className={`border rounded-lg p-4 ${
                  session.isCorrect
                    ? "bg-green-50 border-green-300"
                    : "bg-red-50 border-red-300"
                }`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-mono text-lg">
                      {session.numberToMemorize}
                    </span>
                    <span className="ml-3 text-sm text-gray-600">
                      ({session.type})
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm">
                      {session.isCorrect ? "✓ Richtig" : "✗ Falsch"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {session.timeSpent}s
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* Help Tab */}
        <TabsContent value="help" className="space-y-4">
          <h2 className="text-xl font-semibold">
            Wie funktioniert das Major-System?
          </h2>

          <div className="bg-blue-50 p-4 rounded-lg space-y-3">
            <p>
              Das Major-System ist eine Gedächtnistechnik von Vera F.
              Birkenbihl, bei der Zahlen in Bilder umgewandelt werden. Jede
              Ziffer wird einem Konsonanten zugeordnet:
            </p>

            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <strong>0</strong> = S, Z (weicher S-Laut)
              </div>
              <div>
                <strong>1</strong> = T, D (dentale Laute)
              </div>
              <div>
                <strong>2</strong> = N (Nasal)
              </div>
              <div>
                <strong>3</strong> = M (Nasal)
              </div>
              <div>
                <strong>4</strong> = R (rollender Laut)
              </div>
              <div>
                <strong>5</strong> = L (flüssig)
              </div>
              <div>
                <strong>6</strong> = CH, J, SCH (weiche Laute)
              </div>
              <div>
                <strong>7</strong> = K, G (harte Laute)
              </div>
              <div>
                <strong>8</strong> = F, V, W (Frikative)
              </div>
              <div>
                <strong>9</strong> = P, B (Labiale)
              </div>
            </div>

            <div className="mt-4">
              <p className="font-semibold">Beispiele:</p>
              <ul className="list-disc ml-5 mt-2 space-y-1">
                <li>
                  <strong>1</strong> → <strong>T</strong>ee (Tasse Tee
                  vorstellen)
                </li>
                <li>
                  <strong>10</strong> → <strong>T</strong>o<strong>S</strong>e
                  (Dose vorstellen)
                </li>
                <li>
                  <strong>42</strong> → <strong>R</strong>ai<strong>N</strong>{" "}
                  (Regen vorstellen)
                </li>
              </ul>
            </div>

            <p className="mt-4 text-sm">
              💡 <strong>Tipp:</strong> Erstellen Sie lebendige, emotionale
              Bilder für Ihre Zahlen. Je ungewöhnlicher die Geschichte, desto
              besser merken Sie sich die Zahl!
            </p>
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Association Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Eigene Zahlen-Assoziation hinzufügen</DialogTitle>
            <DialogDescription>
              Erstellen Sie Ihr persönliches Zahlenbild nach dem Major-System
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label
                htmlFor="number-input"
                className="block text-sm font-medium mb-1"
              >
                Zahl
              </label>
              <Input
                id="number-input"
                type="text"
                value={newNumber}
                onChange={(e) => setNewNumber(e.target.value)}
                placeholder="z.B. 42"
              />
              {newNumber && (
                <p className="text-xs text-gray-500 mt-1">
                  Konsonanten: {numberToMajorWord(newNumber)}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="image-input"
                className="block text-sm font-medium mb-1"
              >
                Bild/Wort
              </label>
              <Input
                id="image-input"
                type="text"
                value={newImage}
                onChange={(e) => setNewImage(e.target.value)}
                placeholder="z.B. Regen"
              />
            </div>

            <div>
              <label
                htmlFor="story-input"
                className="block text-sm font-medium mb-1"
              >
                Geschichte (optional)
              </label>
              <Input
                id="story-input"
                type="text"
                value={newStory}
                onChange={(e) => setNewStory(e.target.value)}
                placeholder="Eine einprägsame Geschichte..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button onClick={addAssociation} className="bg-blue-600">
              ➕ Hinzufügen
            </Button>
            <Button onClick={() => setShowAddDialog(false)} variant="outline">
              Abbrechen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
