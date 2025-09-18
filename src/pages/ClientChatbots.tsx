import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Plus, Bot, MoreVertical, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import AuthGuard from "@/components/AuthGuard";
import UserProfileDropdown from "@/components/UserProfileDropdown";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Chatbot {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

interface Client {
  id: string;
  name: string;
}

const ClientChatbots = () => {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [client, setClient] = useState<Client | null>(null);
  const [chatbots, setChatbots] = useState<Chatbot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [chatbotToDelete, setChatbotToDelete] = useState<Chatbot | null>(null);
  const [deleteConfirmName, setDeleteConfirmName] = useState("");

  useEffect(() => {
    if (clientId && user) {
      loadClientAndChatbots();
    }
  }, [clientId, user]);

  const loadClientAndChatbots = async () => {
    if (!clientId || !user) return;

    setIsLoading(true);
    try {
      // Load client details
      const { data: clientData, error: clientError } = await supabase
        .from("clients")
        .select("*")
        .eq("id", clientId)
        .eq("user_id", user.id)
        .single();

      if (clientError) throw clientError;
      setClient(clientData);

      // Load chatbots for this client
      const { data: chatbotsData, error: chatbotsError } = await supabase
        .from("chatbot_configs")
        .select("*")
        .eq("client_id", clientId)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (chatbotsError) throw chatbotsError;
      setChatbots(chatbotsData || []);
    } catch (error) {
      console.error("Error loading data:", error);
      toast({
        title: "Error",
        description: "Failed to load client data",
        variant: "destructive",
      });
      navigate("/clients");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateChatbot = () => {
    navigate(`/clients/${clientId}/builder`);
  };

  const handleEditChatbot = (chatbotId: string) => {
    navigate(`/clients/${clientId}/builder/${chatbotId}`);
  };

  const handleDeleteClick = (chatbot: Chatbot) => {
    setChatbotToDelete(chatbot);
    setDeleteConfirmName("");
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!chatbotToDelete || deleteConfirmName !== chatbotToDelete.name) {
      return;
    }

    try {
      const { error } = await supabase
        .from("chatbot_configs")
        .delete()
        .eq("id", chatbotToDelete.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Chatbot deleted successfully",
      });

      setChatbots(chatbots.filter(c => c.id !== chatbotToDelete.id));
      setIsDeleteDialogOpen(false);
      setChatbotToDelete(null);
      setDeleteConfirmName("");
    } catch (error) {
      console.error("Error deleting chatbot:", error);
      toast({
        title: "Error",
        description: "Failed to delete chatbot",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading chatbots...</p>
          </div>
        </div>
      </AuthGuard>
    );
  }

  if (!client) {
    return null;
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => navigate("/clients")} className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to All Clients
              </Button>
              <div className="h-6 w-px bg-border" />
              <div>
                <h1 className="text-3xl font-bold">{client.name}</h1>
                <p className="text-muted-foreground mt-1">
                  Manage chatbots for this client
                </p>
              </div>
            </div>
            <UserProfileDropdown />
          </div>

          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {chatbots.length} {chatbots.length === 1 ? "chatbot" : "chatbots"}
              </span>
            </div>
            <Button onClick={handleCreateChatbot} className="gap-2">
              <Plus className="h-4 w-4" />
              Create New Chatbot
            </Button>
          </div>

          {chatbots.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <Bot className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No chatbots yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first chatbot for {client.name}
                </p>
                <Button onClick={handleCreateChatbot} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create New Chatbot
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {chatbots.map((chatbot) => (
                <Card
                  key={chatbot.id}
                  className="hover:shadow-lg transition-shadow cursor-pointer group"
                >
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle
                      className="text-lg font-semibold truncate flex-1 mr-2"
                      onClick={() => handleEditChatbot(chatbot.id)}
                    >
                      {chatbot.name}
                    </CardTitle>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleEditChatbot(chatbot.id)}
                          className="gap-2"
                        >
                          <Edit className="h-4 w-4" />
                          Edit Chatbot
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteClick(chatbot)}
                          className="gap-2 text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete Chatbot
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </CardHeader>
                  <CardContent onClick={() => handleEditChatbot(chatbot.id)}>
                    <div className="text-sm text-muted-foreground">
                      <p>Created: {new Date(chatbot.created_at).toLocaleDateString()}</p>
                      <p>Updated: {new Date(chatbot.updated_at).toLocaleDateString()}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Chatbot</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the chatbot
                  and all associated data.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="my-4">
                <Label htmlFor="delete-confirm">
                  Type the chatbot name "{chatbotToDelete?.name}" to confirm:
                </Label>
                <Input
                  id="delete-confirm"
                  value={deleteConfirmName}
                  onChange={(e) => setDeleteConfirmName(e.target.value)}
                  placeholder={chatbotToDelete?.name}
                  className="mt-2"
                />
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteConfirm}
                  disabled={deleteConfirmName !== chatbotToDelete?.name}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete Chatbot
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </AuthGuard>
  );
};

export default ClientChatbots;