"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/types/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { Pencil, Trash2, Plus } from "lucide-react";

// Inline Switch component (shadcn/ui style)
function Switch({ checked, onCheckedChange, id }: { checked: boolean; onCheckedChange: (v: boolean) => void; id?: string }) {
  return (
    <button
      type="button"
      id={id}
      aria-pressed={checked}
      onClick={() => onCheckedChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${checked ? "bg-primary" : "bg-muted"}`}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${checked ? "translate-x-6" : "translate-x-1"}`} />
    </button>
  );
}

// Inline DatePicker (native input for now)
function DatePicker({ value, onChange, id }: { value: string; onChange: (v: string) => void; id?: string }) {
  return <Input id={id} type="date" value={value} onChange={e => onChange(e.target.value)} />;
}

// Types

type Transaction = Database["public"]["Tables"]["transactions"]["Row"];
type InsertTransaction = Database["public"]["Tables"]["transactions"]["Insert"];
type UpdateTransaction = Database["public"]["Tables"]["transactions"]["Update"];
type UserCard = Database["public"]["Tables"]["user_cards"]["Row"];
type CreditCard = Database["public"]["Tables"]["credit_cards"]["Row"];
type SpendCategory = Database["public"]["Tables"]["spend_categories"]["Row"];
type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export default function Page() {
  const supabase = createClientComponentClient<Database>();
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [userCards, setUserCards] = useState<UserCard[]>([]);
  const [creditCards, setCreditCards] = useState<CreditCard[]>([]);
  const [categories, setCategories] = useState<SpendCategory[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTransaction, setEditTransaction] = useState<Transaction | null>(null);
  const [form, setForm] = useState<InsertTransaction>({
    user_card_id: "",
    category_id: "",
    amount: 0,
    transaction_date: "",
    merchant_name: "",
    reward_multiplier: null,
    reward_points_earned: null,
    description: null,
    id: undefined,
    created_at: undefined,
    updated_at: undefined,
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [userSearch, setUserSearch] = useState("");
  const [userCardSearch, setUserCardSearch] = useState("");
  const [categorySearch, setCategorySearch] = useState("");

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, []);

  async function fetchData() {
    setLoading(true);
    const [txRes, ucRes, ccRes, catRes, profRes] = await Promise.all([
      supabase.from("transactions").select("*"),
      supabase.from("user_cards").select("*"),
      supabase.from("credit_cards").select("*"),
      supabase.from("spend_categories").select("*"),
      supabase.from("profiles").select("*"),
    ]);
    if (txRes.error) toast({ title: "Error fetching transactions", description: txRes.error.message, variant: "destructive" });
    else setTransactions(txRes.data || []);
    if (ucRes.error) toast({ title: "Error fetching user cards", description: ucRes.error.message, variant: "destructive" });
    else setUserCards(ucRes.data || []);
    if (ccRes.error) toast({ title: "Error fetching credit cards", description: ccRes.error.message, variant: "destructive" });
    else setCreditCards(ccRes.data || []);
    if (catRes.error) toast({ title: "Error fetching categories", description: catRes.error.message, variant: "destructive" });
    else setCategories(catRes.data || []);
    if (profRes.error) toast({ title: "Error fetching profiles", description: profRes.error.message, variant: "destructive" });
    else setProfiles(profRes.data || []);
    setLoading(false);
  }

  function openAddModal() {
    setEditTransaction(null);
    setForm({
      user_card_id: "",
      category_id: "",
      amount: 0,
      transaction_date: "",
      merchant_name: "",
      reward_multiplier: null,
      reward_points_earned: null,
      description: null,
      id: undefined,
      created_at: undefined,
      updated_at: undefined,
    });
    setSelectedUserId("");
    setUserSearch("");
    setUserCardSearch("");
    setCategorySearch("");
    setFormError(null);
    setModalOpen(true);
  }

  function openEditModal(tx: Transaction) {
    setEditTransaction(tx);
    setForm({ ...tx });
    setFormError(null);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditTransaction(null);
    setFormError(null);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);
    // Validation
    if (!form.user_card_id) {
      setFormError("User Card is required");
      setSubmitting(false);
      return;
    }
    if (!form.category_id) {
      setFormError("Category is required");
      setSubmitting(false);
      return;
    }
    if (!form.amount || isNaN(Number(form.amount))) {
      setFormError("Amount must be a number");
      setSubmitting(false);
      return;
    }
    if (!form.transaction_date) {
      setFormError("Transaction date is required");
      setSubmitting(false);
      return;
    }
    const payload = {
      ...form,
      amount: Number(form.amount),
      reward_multiplier: form.reward_multiplier ? Number(form.reward_multiplier) : null,
      reward_points_earned: form.reward_points_earned ? Number(form.reward_points_earned) : null,
    };
    let error;
    if (editTransaction) {
      ({ error } = await supabase.from("transactions").update(payload).eq("id", editTransaction.id));
      if (!error) toast({ title: "Transaction updated" });
    } else {
      ({ error } = await supabase.from("transactions").insert(payload));
      if (!error) toast({ title: "Transaction added" });
    }
    if (error) {
      setFormError(error.message);
      setSubmitting(false);
      return;
    }
    setSubmitting(false);
    closeModal();
    fetchData();
  }

  async function handleDelete(tx: Transaction) {
    if (!window.confirm(`Delete transaction for card ${tx.user_card_id}? This cannot be undone.`)) return;
    const { error } = await supabase.from("transactions").delete().eq("id", tx.id);
    if (error) toast({ title: "Error deleting transaction", description: error.message, variant: "destructive" });
    else {
      toast({ title: "Transaction deleted" });
      fetchData();
    }
  }

  // Lookup helpers
  function getUserCardDisplay(user_card_id: string | null) {
    if (!user_card_id) return "-";
    const uc = userCards.find((u) => u.id === user_card_id);
    if (!uc) return user_card_id;
    const card = creditCards.find((c) => c.id === uc.card_id);
    const user = profiles.find((p) => p.user_id === uc.user_id);
    return `${user?.full_name || "User"} - ${card?.card_name || "Card"}`;
  }
  function getCategoryName(category_id: string | null) {
    if (!category_id) return "-";
    const cat = categories.find((c) => c.id === category_id);
    return cat ? cat.category_name : category_id;
  }

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">Transactions</h1>
        <Button onClick={openAddModal} className="transition-all hover:scale-[1.02]">
          <Plus className="w-5 h-5 mr-2" /> Add Transaction
        </Button>
      </div>
      <Card className="rounded-2xl shadow-md border p-4">
        <CardHeader className="pb-2">
          <h2 className="text-lg font-semibold">All Transactions</h2>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User Card</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Merchant</TableHead>
                  <TableHead>Points</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7}>Loading...</TableCell>
                  </TableRow>
                ) : transactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7}>No transactions found.</TableCell>
                  </TableRow>
                ) : (
                  transactions.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell>{getUserCardDisplay(tx.user_card_id)}</TableCell>
                      <TableCell>{tx.amount}</TableCell>
                      <TableCell>{tx.transaction_date ? new Date(tx.transaction_date).toLocaleDateString() : "-"}</TableCell>
                      <TableCell>{getCategoryName(tx.category_id)}</TableCell>
                      <TableCell>{tx.merchant_name || "-"}</TableCell>
                      <TableCell>{tx.reward_points_earned ?? "-"}</TableCell>
                      <TableCell className="flex gap-2 justify-end">
                        <Button size="icon" variant="ghost" aria-label="Edit" onClick={() => openEditModal(tx)}>
                          <Pencil className="w-5 h-5" />
                        </Button>
                        <Button size="icon" variant="ghost" aria-label="Delete" onClick={() => handleDelete(tx)}>
                          <Trash2 className="w-5 h-5" />
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
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editTransaction ? "Edit Transaction" : "Add Transaction"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="user_id">User</Label>
              <Select
                value={selectedUserId}
                onValueChange={(val) => {
                  setSelectedUserId(val);
                  setForm((f) => ({ ...f, user_card_id: "" }));
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select user" />
                </SelectTrigger>
                <SelectContent className="max-h-60 overflow-y-auto">
                  <div className="sticky top-0 z-10 bg-background p-2">
                    <Input
                      placeholder="Search users..."
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      className="h-8"
                      onClick={(e) => e.stopPropagation()}
                      onKeyDown={(e) => e.stopPropagation()}
                      onFocus={(e) => e.target.select()}
                    />
                  </div>
                  {profiles
                    .filter((p) => (p.full_name || "").toLowerCase().includes(userSearch.toLowerCase()))
                    .map((p) => (
                      <SelectItem key={p.user_id} value={p.user_id}>
                        {p.full_name || p.user_id}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="user_card_id">User Card</Label>
              <Select
                value={form.user_card_id || ""}
                onValueChange={(val) => setForm((f) => ({ ...f, user_card_id: val }))}
                disabled={!selectedUserId}
              >
                <SelectTrigger>
                  <SelectValue placeholder={selectedUserId ? "Select user card" : "Select user first"} />
                </SelectTrigger>
                <SelectContent className="max-h-60 overflow-y-auto">
                  <div className="sticky top-0 z-10 bg-background p-2">
                    <Input
                      placeholder="Search cards..."
                      value={userCardSearch}
                      onChange={(e) => setUserCardSearch(e.target.value)}
                      className="h-8"
                      onClick={(e) => e.stopPropagation()}
                      onKeyDown={(e) => e.stopPropagation()}
                      onFocus={(e) => e.target.select()}
                      disabled={!selectedUserId}
                    />
                  </div>
                  {userCards
                    .filter((uc) => uc.user_id === selectedUserId)
                    .filter((uc) => {
                      const card = creditCards.find((c) => c.id === uc.card_id);
                      return (card?.card_name || "").toLowerCase().includes(userCardSearch.toLowerCase());
                    })
                    .map((uc) => {
                      const card = creditCards.find((c) => c.id === uc.card_id);
                      return (
                        <SelectItem key={uc.id} value={uc.id}>
                          {card?.card_name || uc.id}
                        </SelectItem>
                      );
                    })}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="category_id">Category</Label>
              <Select
                value={form.category_id || ""}
                onValueChange={(val) => setForm((f) => ({ ...f, category_id: val }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="max-h-60 overflow-y-auto">
                  <div className="sticky top-0 z-10 bg-background p-2">
                    <Input
                      placeholder="Search categories..."
                      value={categorySearch}
                      onChange={(e) => setCategorySearch(e.target.value)}
                      className="h-8"
                      onClick={(e) => e.stopPropagation()}
                      onKeyDown={(e) => e.stopPropagation()}
                      onFocus={(e) => e.target.select()}
                    />
                  </div>
                  {categories
                    .filter((cat) => (cat.category_name || "").toLowerCase().includes(categorySearch.toLowerCase()))
                    .map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.category_name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="amount">Amount</Label>
              <Input id="amount" type="number" min="0" value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: e.target.valueAsNumber }))} required />
            </div>
            <div>
              <Label htmlFor="transaction_date">Transaction Date</Label>
              <DatePicker value={form.transaction_date || ""} onChange={(val) => setForm((f) => ({ ...f, transaction_date: val }))} id="transaction_date" />
            </div>
            <div>
              <Label htmlFor="merchant_name">Merchant Name</Label>
              <Input id="merchant_name" value={form.merchant_name || ""} onChange={(e) => setForm((f) => ({ ...f, merchant_name: e.target.value }))} />
            </div>
            <div>
              <Label htmlFor="reward_multiplier">Reward Multiplier</Label>
              <Input id="reward_multiplier" type="number" step="0.01" value={form.reward_multiplier ?? ""} onChange={(e) => setForm((f) => ({ ...f, reward_multiplier: e.target.value ? parseFloat(e.target.value) : null }))} />
            </div>
            <div>
              <Label htmlFor="reward_points_earned">Reward Points Earned</Label>
              <Input id="reward_points_earned" type="number" value={form.reward_points_earned ?? ""} onChange={(e) => setForm((f) => ({ ...f, reward_points_earned: e.target.value ? parseInt(e.target.value) : null }))} />
            </div>
            {formError && <div className="text-red-500 text-sm">{formError}</div>}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeModal} disabled={submitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {editTransaction ? "Update" : "Add"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
} 