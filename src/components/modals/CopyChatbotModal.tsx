import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Client {
  id: string;
  name: string;
}

interface Chatbot {
  id: string;
  name: string;
  config: any;
  client_id: string;
}

interface CopyChatbotModalProps {
  isOpen: boolean;
  onClose: () => void;
  chatbot: Chatbot | null;
  currentClientId: string;
  userId: string;
  onCopySuccess: (newClientId: string) => void;
}

const CopyChatbotModal = ({
  isOpen,
  onClose,
  chatbot,
  currentClientId,
  userId,
  onCopySuccess,
}: CopyChatbotModalProps) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClientId, setSelectedClientId] = useState(currentClientId);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      loadClients();
      setSelectedClientId(currentClientId);
    }
  }, [isOpen, currentClientId]);

  const loadClients = async () => {
    try {
      const { data, error } = await supabase
        .from("clients")
        .select("id, name")
        .eq("user_id", userId)
        .order("name");

      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      console.error("Error loading clients:", error);
      toast({
        title: "Error",
        description: "Failed to load clients",
        variant: "destructive",
      });
    }
  };

  const generateCopyName = async (originalName: string, targetClientId: string) => {
    let copyNumber = 1;
    let newName = `${originalName} (copy)`;
    
    // Check if there are existing copies and find the next number
    const { data: existingChatbots } = await supabase
      .from("chatbot_configs")
      .select("name")
      .eq("client_id", targetClientId)
      .eq("user_id", userId);

    if (existingChatbots) {
      const copyPattern = new RegExp(`^${originalName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')} \\(copy(?: (\\d+))?\\)$`);
      const existingCopyNumbers = existingChatbots
        .map(bot => {
          const match = bot.name.match(copyPattern);
          if (match) {
            return match[1] ? parseInt(match[1]) : 1;
          }
          return 0;
        })
        .filter(num => num > 0);

      if (existingCopyNumbers.length > 0) {
        copyNumber = Math.max(...existingCopyNumbers) + 1;
        newName = `${originalName} (copy ${copyNumber})`;
      }
    }

    return newName;
  };

  const handleCopy = async () => {
    if (!chatbot || !selectedClientId) return;

    setIsLoading(true);
    try {
      // Generate the new name with appropriate numbering
      const newName = await generateCopyName(chatbot.name, selectedClientId);

      // Create a copy of the config without the webhook_url for security
      const configCopy = { ...chatbot.config };
      delete configCopy.webhookUrl;

      // Insert the new chatbot
      const { error } = await supabase
        .from("chatbot_configs")
        .insert({
          name: newName,
          config: configCopy,
          client_id: selectedClientId,
          user_id: userId,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: `Chatbot copied successfully as "${newName}"`,
      });

      onCopySuccess(selectedClientId);
      onClose();
    } catch (error) {
      console.error("Error copying chatbot:", error);
      toast({
        title: "Error",
        description: "Failed to copy chatbot",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const selectedClient = clients.find(c => c.id === selectedClientId);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Copy Chatbot</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium">Source Chatbot</Label>
            <p className="text-sm text-muted-foreground mt-1">{chatbot?.name}</p>
          </div>

          <div>
            <Label htmlFor="client-select" className="text-sm font-medium">
              Destination Client
            </Label>
            <Select value={selectedClientId} onValueChange={setSelectedClientId}>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Select a client" />
              </SelectTrigger>
              <SelectContent>
                {clients.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {chatbot && selectedClient && (
            <div>
              <Label className="text-sm font-medium">New Chatbot Name</Label>
              <p className="text-sm text-muted-foreground mt-1">
                {chatbot.name} (copy)
                <span className="text-xs block">
                  Will be auto-numbered if duplicates exist
                </span>
              </p>
            </div>
          )}

          <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
            <strong>Note:</strong> All configuration will be copied except the webhook URL for security reasons.
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleCopy} disabled={isLoading || !selectedClientId}>
            {isLoading ? "Copying..." : "Copy Chatbot"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CopyChatbotModal;