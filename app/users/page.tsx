"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/types/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Eye } from "lucide-react";

// Types

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type UserCard = Database["public"]["Tables"]["user_cards"]["Row"];
type CreditCard = Database["public"]["Tables"]["credit_cards"]["Row"];

export default function Page() {
  const supabase = createClientComponentClient<Database>();
  const { toast } = useToast();
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [userCards, setUserCards] = useState<UserCard[]>([]);
  const [creditCards, setCreditCards] = useState<CreditCard[]>([]);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [fetchingCards, setFetchingCards] = useState(false);

  useEffect(() => {
    fetchUsers();
    fetchCreditCards();
    // eslint-disable-next-line
  }, []);

  async function fetchUsers() {
    setLoading(true);
    const { data, error } = await supabase.from("profiles").select("*");
    if (error) {
      toast({ title: "Error fetching users", description: error.message, variant: "destructive" });
    } else {
      setUsers(data || []);
    }
    setLoading(false);
  }

  async function fetchCreditCards() {
    const { data, error } = await supabase.from("credit_cards").select("id, card_name");
    if (!error && data) setCreditCards(data);
  }

  async function openUserDetails(user: Profile) {
    setSelectedUser(user);
    setDetailsOpen(true);
    setFetchingCards(true);
    // Fetch user_cards for this user
    const { data, error } = await supabase
      .from("user_cards")
      .select("*")
      .eq("user_id", user.user_id);
    if (error) {
      toast({ title: "Error fetching user cards", description: error.message, variant: "destructive" });
      setUserCards([]);
    } else {
      setUserCards(data || []);
    }
    setFetchingCards(false);
  }

  function closeDetails() {
    setDetailsOpen(false);
    setSelectedUser(null);
    setUserCards([]);
  }

  function getCardName(card_id: string | null) {
    if (!card_id) return "-";
    const card = creditCards.find((c) => c.id === card_id);
    return card ? card.card_name : card_id;
  }

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">Users</h1>
      </div>
      <Card className="rounded-2xl shadow-md border p-4">
        <CardHeader className="pb-2">
          <h2 className="text-lg font-semibold">Registered Users</h2>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Mobile</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5}>Loading...</TableCell>
                  </TableRow>
                ) : users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5}>No users found.</TableCell>
                  </TableRow>
                ) : (
                  users.map((u) => (
                    <TableRow key={u.user_id}>
                      <TableCell>{u.full_name || <Badge variant="secondary">No Name</Badge>}</TableCell>
                      <TableCell>{u.email}</TableCell>
                      <TableCell>{u.mobile_number || <Badge variant="secondary">-</Badge>}</TableCell>
                      <TableCell>{u.created_at ? new Date(u.created_at).toLocaleString() : "-"}</TableCell>
                      <TableCell className="flex gap-2 justify-end">
                        <Button
                          size="icon"
                          variant="ghost"
                          aria-label="View Details"
                          onClick={() => openUserDetails(u)}
                        >
                          <Eye className="w-5 h-5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div>
                <div className="font-semibold">User ID:</div>
                <div className="break-all text-sm text-muted-foreground">{selectedUser.user_id}</div>
              </div>
              <div>
                <div className="font-semibold">Email:</div>
                <div className="text-sm">{selectedUser.email}</div>
              </div>
              <div>
                <div className="font-semibold">Linked Credit Cards:</div>
                {fetchingCards ? (
                  <div>Loading cards...</div>
                ) : userCards.length === 0 ? (
                  <div className="text-muted-foreground text-sm">No cards linked.</div>
                ) : (
                  <ul className="list-disc ml-5 space-y-1">
                    {userCards.map((uc) => (
                      <li key={uc.id} className="flex items-center gap-2">
                        <span className="font-medium">{getCardName(uc.card_id)}</span>
                        {uc.card_number && (
                          <span className="text-xs text-muted-foreground">({uc.card_number.slice(-4)})</span>
                        )}
                        {uc.is_active === false && <Badge variant="outline">Inactive</Badge>}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              {/* Optional: Link to transactions */}
              {/* <div>
                <Button variant="link" className="p-0 h-auto">View Transactions</Button>
              </div> */}
            </div>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={closeDetails}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 