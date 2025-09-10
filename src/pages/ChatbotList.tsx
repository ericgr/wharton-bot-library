import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MoreHorizontal, Plus, Edit, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import UserProfileDropdown from "@/components/UserProfileDropdown";
import AuthGuard from "@/components/AuthGuard";

interface Chatbot {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

const ChatbotList = () => {
  const [chatbots, setChatbots] = useState<Chatbot[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [chatbotToDelete, setChatbotToDelete] = useState<Chatbot | null>(null);
  const [confirmationText, setConfirmationText] = useState("");
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    console.log("🔄 User state changed:", user ? "authenticated" : "not authenticated");
    if (user) {
      fetchChatbots();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchChatbots = async () => {
    if (!user) {
      console.log("❌ No user found, cannot fetch chatbots");
      setLoading(false);
      return;
    }

    console.log("🔍 Fetching chatbots for user:", user.id);
    
    try {
      const { data, error } = await supabase
        .from("chatbot_configs")
        .select("id, name, created_at, updated_at")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });

      if (error) {
        console.error("❌ Database error:", error);
        throw error;
      }
      
      console.log("✅ Fetched chatbots:", data);
      setChatbots(data || []);
    } catch (error) {
      console.error("Error fetching chatbots:", error);
      toast({
        title: "Error",
        description: "Failed to load chatbots",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    navigate("/builder");
  };

  const handleEdit = (chatbotId: string) => {
    navigate(`/builder/${chatbotId}`);
  };

  const handleDeleteClick = (chatbot: Chatbot) => {
    setChatbotToDelete(chatbot);
    setDeleteDialogOpen(true);
    setConfirmationText("");
  };

  const handleDeleteConfirm = async () => {
    if (!chatbotToDelete || confirmationText !== chatbotToDelete.name) {
      toast({
        title: "Error",
        description: "Please type the chatbot name exactly to confirm deletion",
        variant: "destructive",
      });
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
      setDeleteDialogOpen(false);
      setChatbotToDelete(null);
    } catch (error) {
      console.error("Error deleting chatbot:", error);
      toast({
        title: "Error",
        description: "Failed to delete chatbot",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading chatbots...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold">My Chatbots</h1>
              <p className="text-muted-foreground mt-2">
                Manage your chatbot configurations
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Button onClick={handleCreateNew} className="gap-2">
                <Plus className="h-4 w-4" />
                Create Chatbot
              </Button>
              <UserProfileDropdown />
            </div>
          </div>

          {chatbots.length === 0 ? (
            <div className="text-center py-16">
              <div className="max-w-md mx-auto">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <Plus className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No chatbots yet</h3>
                <p className="text-muted-foreground mb-6">
                  Get started by creating your first chatbot configuration
                </p>
                <Button onClick={handleCreateNew} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create Chatbot
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {chatbots.map((chatbot) => (
                <Card key={chatbot.id} className="group hover:shadow-lg transition-shadow bg-gradient-to-br from-sky-50 to-white">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle 
                      className="text-lg truncate pr-2 cursor-pointer hover:text-primary transition-colors"
                      onClick={() => handleEdit(chatbot.id)}
                    >
                      {chatbot.name}
                    </CardTitle>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(chatbot.id)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteClick(chatbot)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </CardHeader>
                  <CardContent
                    className="cursor-pointer"
                    onClick={() => handleEdit(chatbot.id)}
                  >
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">
                        Created: {formatDate(chatbot.created_at)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Updated: {formatDate(chatbot.updated_at)}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Chatbot</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the chatbot
                configuration "{chatbotToDelete?.name}".
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="py-4">
              <Label htmlFor="confirmation">
                Type the chatbot name "{chatbotToDelete?.name}" to confirm:
              </Label>
              <Input
                id="confirmation"
                value={confirmationText}
                onChange={(e) => setConfirmationText(e.target.value)}
                placeholder={chatbotToDelete?.name}
                className="mt-2"
              />
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteConfirm}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                disabled={confirmationText !== chatbotToDelete?.name}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AuthGuard>
  );
};

export default ChatbotList;