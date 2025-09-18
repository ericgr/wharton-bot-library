import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Building2, MoreVertical, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import AuthGuard from "@/components/AuthGuard";
import UserProfileDropdown from "@/components/UserProfileDropdown";
import { CreateClientModal } from "@/components/modals/CreateClientModal";
import { EditClientModal } from "@/components/modals/EditClientModal";
import { DeleteClientModal } from "@/components/modals/DeleteClientModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Client {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

const ClientList = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  useEffect(() => {
    if (user) {
      fetchClients();
    }
  }, [user]);

  const fetchClients = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      console.error("Error fetching clients:", error);
      toast({
        title: "Error",
        description: "Failed to load clients",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClientClick = (clientId: string) => {
    navigate(`/clients/${clientId}/chatbots`);
  };

  const handleCreateClient = () => {
    setIsCreateModalOpen(true);
  };

  const handleEditClient = (client: Client) => {
    setSelectedClient(client);
    setIsEditModalOpen(true);
  };

  const handleDeleteClient = (client: Client) => {
    setSelectedClient(client);
    setIsDeleteModalOpen(true);
  };

  const handleClientCreated = () => {
    fetchClients();
    setIsCreateModalOpen(false);
  };

  const handleClientUpdated = () => {
    fetchClients();
    setIsEditModalOpen(false);
    setSelectedClient(null);
  };

  const handleClientDeleted = () => {
    fetchClients();
    setIsDeleteModalOpen(false);
    setSelectedClient(null);
  };

  if (isLoading) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading clients...</p>
          </div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold">My Clients</h1>
              <p className="text-muted-foreground mt-2">
                Manage your clients and their chatbots
              </p>
            </div>
            <UserProfileDropdown />
          </div>

          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {clients.length} {clients.length === 1 ? "client" : "clients"}
              </span>
            </div>
            <Button onClick={handleCreateClient} className="gap-2">
              <Plus className="h-4 w-4" />
              Create New Client
            </Button>
          </div>

          {clients.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No clients yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first client to get started with chatbot management
                </p>
                <Button onClick={handleCreateClient} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create New Client
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {clients.map((client) => (
                <Card
                  key={client.id}
                  className="hover:shadow-lg transition-shadow cursor-pointer group"
                  style={{ background: 'var(--gradient-client)' }}
                >
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle
                      className="text-lg font-semibold truncate flex-1 mr-2"
                      onClick={() => handleClientClick(client.id)}
                    >
                      {client.name}
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
                          onClick={() => handleEditClient(client)}
                          className="gap-2"
                        >
                          <Edit className="h-4 w-4" />
                          Edit Client
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteClient(client)}
                          className="gap-2 text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete Client
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </CardHeader>
                  <CardContent onClick={() => handleClientClick(client.id)}>
                    <div className="text-sm text-muted-foreground">
                      <p>Created: {new Date(client.created_at).toLocaleDateString()}</p>
                      <p>Updated: {new Date(client.updated_at).toLocaleDateString()}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <CreateClientModal
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            onClientCreated={handleClientCreated}
          />

          {selectedClient && (
            <>
              <EditClientModal
                isOpen={isEditModalOpen}
                onClose={() => {
                  setIsEditModalOpen(false);
                  setSelectedClient(null);
                }}
                client={selectedClient}
                onClientUpdated={handleClientUpdated}
              />

              <DeleteClientModal
                isOpen={isDeleteModalOpen}
                onClose={() => {
                  setIsDeleteModalOpen(false);
                  setSelectedClient(null);
                }}
                client={selectedClient}
                onClientDeleted={handleClientDeleted}
              />
            </>
          )}
        </div>
      </div>
    </AuthGuard>
  );
};

export default ClientList;