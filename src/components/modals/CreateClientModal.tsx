import { useState } from "react";
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

interface CreateClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClientCreated: () => void;
}

export const CreateClientModal = ({ isOpen, onClose, onClientCreated }: CreateClientModalProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [clientName, setClientName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

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
    if (!user) return;

    const trimmedName = clientName.trim();
    const validationError = validateClientName(trimmedName);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Check for duplicate name
      const { data: duplicateCheck } = await supabase
        .rpc('check_duplicate_client_name', {
          client_name: trimmedName,
          user_id_param: user.id
        });

      if (duplicateCheck) {
        setError("A client with this name already exists");
        setIsLoading(false);
        return;
      }

      // Create the client
      const { error: insertError } = await supabase
        .from("clients")
        .insert({
          name: trimmedName,
          user_id: user.id,
        });

      if (insertError) throw insertError;

      toast({
        title: "Success",
        description: "Client created successfully",
      });

      setClientName("");
      onClientCreated();
      onClose();
    } catch (error) {
      console.error("Error creating client:", error);
      toast({
        title: "Error",
        description: "Failed to create client",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setClientName("");
    setError("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Client</DialogTitle>
          <DialogDescription>
            Add a new client to manage their chatbots.
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
              {isLoading ? "Creating..." : "Create Client"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};