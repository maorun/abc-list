import React, {useState, useRef, useEffect} from "react";
import {Button} from "@/components/ui/button";
import {Mic, MicOff, Volume2} from "lucide-react";
import {toast} from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

interface VoiceInputProps {
  onWordRecognized: (word: string) => void;
  isOpen: boolean;
  onClose: () => void;
  letter?: string;
}

export function VoiceInput({
  onWordRecognized,
  isOpen,
  onClose,
  letter,
}: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    // Check if speech recognition is supported
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
      setIsSupported(true);
      const recognition = new SpeechRecognition();

      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = "de-DE"; // German language for the app

      recognition.onstart = () => {
        setIsListening(true);
        setTranscript("");
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let finalTranscript = "";
        let interimTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            finalTranscript += result[0].transcript;
          } else {
            interimTranscript += result[0].transcript;
          }
        }

        setTranscript(finalTranscript || interimTranscript);

        if (finalTranscript) {
          const word = finalTranscript.trim();
          if (word) {
            onWordRecognized(word);
            toast.success(`Wort erkannt: "${word}"`);
            onClose();
          }
        }
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);

        switch (event.error) {
          case "no-speech":
            toast.error(
              "Keine Sprache erkannt. Bitte versuchen Sie es erneut.",
            );
            break;
          case "audio-capture":
            toast.error("Mikrofon-Zugriff verweigert.");
            break;
          case "not-allowed":
            toast.error("Mikrofon-Berechtigung verweigert.");
            break;
          default:
            toast.error("Spracherkennung fehlgeschlagen.");
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } else {
      setIsSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [onWordRecognized, onClose]);

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      try {
        recognitionRef.current.start();
      } catch (error) {
        console.error("Error starting speech recognition:", error);
        toast.error("Spracherkennung konnte nicht gestartet werden.");
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  };

  const handleClose = () => {
    stopListening();
    onClose();
  };

  if (!isSupported) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Spracheingabe nicht verfügbar</DialogTitle>
            <DialogDescription>
              Ihr Browser unterstützt keine Spracheingabe. Bitte verwenden Sie
              einen modernen Browser wie Chrome oder Firefox.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={handleClose}>Schließen</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent aria-describedby="voice-input-description">
        <DialogHeader>
          <DialogTitle>
            Spracheingabe{letter ? ` für Buchstabe ${letter}` : ""}
          </DialogTitle>
          <DialogDescription id="voice-input-description">
            Sprechen Sie ein Wort in Ihr Mikrofon. Die Spracherkennung läuft
            automatisch.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex justify-center">
            <Button
              size="lg"
              variant={isListening ? "destructive" : "default"}
              onClick={isListening ? stopListening : startListening}
              className="flex items-center gap-2"
              aria-label={
                isListening
                  ? "Spracherkennung stoppen"
                  : "Spracherkennung starten"
              }
            >
              {isListening ? (
                <>
                  <MicOff className="h-5 w-5" />
                  Aufnahme stoppen
                </>
              ) : (
                <>
                  <Mic className="h-5 w-5" />
                  Aufnahme starten
                </>
              )}
            </Button>
          </div>

          {isListening && (
            <div
              className="bg-blue-50 border border-blue-200 rounded-lg p-4"
              role="status"
              aria-live="polite"
              aria-label="Spracherkennung aktiv"
            >
              <div className="flex items-center gap-2 text-blue-700">
                <Volume2 className="h-4 w-4 animate-pulse" />
                <span className="text-sm font-medium">Höre zu...</span>
              </div>
              {transcript && (
                <div className="mt-2 text-sm text-gray-700">
                  <strong>Erkannt:</strong> {transcript}
                </div>
              )}
            </div>
          )}

          <div className="text-sm text-gray-600 space-y-1">
            <p>
              <strong>Tipps für bessere Erkennung:</strong>
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>Sprechen Sie deutlich und nicht zu schnell</li>
              <li>Vermeiden Sie Hintergrundgeräusche</li>
              <li>Sprechen Sie einzelne Wörter oder kurze Begriffe</li>
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Abbrechen
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
