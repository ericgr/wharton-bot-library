import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Client {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

interface EditClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client;
  onClientUpdated: () => void;
}

export const EditClientModal = ({ isOpen, onClose, client, onClientUpdated }: EditClientModalProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [clientName, setClientName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen && client) {
      setClientName(client.name);
      setError("");
    }
  }, [isOpen, client]);

  const validateClientName = (name: string) => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      return "Client name is required";
    }
    if (trimmedName.length > 100) {
      return "Client name must be 100 characters or less";
    }
    return "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !client) return;

    const trimmedName = clientName.trim();
    const validationError = validateClientName(trimmedName);
    if (validationError) {
      setError(validationError);
      return;
    }

    // If name hasn't changed, just close
    if (trimmedName === client.name) {
      onClose();
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Check for duplicate name (excluding current client)
      const { data: duplicateCheck } = await supabase
        .rpc('check_duplicate_client_name', {
          client_name: trimmedName,
          user_id_param: user.id,
          exclude_client_id: client.id
        });

      if (duplicateCheck) {
        setError("A client with this name already exists");
        setIsLoading(false);
        return;
      }

      // Update the client
      const { error: updateError } = await supabase
        .from("clients")
        .update({
          name: trimmedName,
        })
        .eq("id", client.id);

      if (updateError) throw updateError;

      toast({
        title: "Success",
        description: "Client updated successfully",
      });

      onClientUpdated();
      onClose();
    } catch (error) {
      console.error("Error updating client:", error);
      toast({
        title: "Error",
        description: "Failed to update client",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setClientName(client?.name || "");
    setError("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Client</DialogTitle>
          <DialogDescription>
            Update the client information.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="client-name">Client Name</Label>
              <Input
                id="client-name"
                value={clientName}
                onChange={(e) => {
                  setClientName(e.target.value);
                  setError("");
                }}
                placeholder="Enter client name"
                maxLength={100}
                required
              />
              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}
              <p className="text-xs text-muted-foreground">
                {clientName.length}/100 characters
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !clientName.trim()}>
              {isLoading ? "Updating..." : "Update Client"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};