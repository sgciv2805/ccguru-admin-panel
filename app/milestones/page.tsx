"use client";

import { useEffect, useMemo, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/types/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "../../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "../../components/ui/use-toast";
import { Trash2, Pencil, Plus } from "lucide-react";

// Types

type Milestone = Database["public"]["Tables"]["milestones"]["Row"];
type InsertMilestone = Database["public"]["Tables"]["milestones"]["Insert"];
type UpdateMilestone = Database["public"]["Tables"]["milestones"]["Update"];
type CreditCard = Database["public"]["Tables"]["credit_cards"]["Row"];

export default function Page() {
  const supabase = createClientComponentClient<Database>();
  const { toast } = useToast();
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [creditCards, setCreditCards] = useState<CreditCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editMilestone, setEditMilestone] = useState<Milestone | null>(null);
  const [form, setForm] = useState<{
    milestone_name: string;
    card_id: string;
    spend_requirement: string;
    reward_description: string;
  }>({ milestone_name: "", card_id: "", spend_requirement: "", reward_description: "" });
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [cardSearch, setCardSearch] = useState("");

  // Fetch milestones and credit cards
  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, []);

  async function fetchData() {
    setLoading(true);
    const [{ data: milestonesData, error: milestonesError }, { data: cardsData, error: cardsError }] = await Promise.all([
      supabase.from("milestones").select("*"),
      supabase.from("credit_cards").select("*")
    ]);
    if (milestonesError) {
      toast({ title: "Error fetching milestones", description: milestonesError.message, variant: "destructive" });
    } else {
      setMilestones(milestonesData || []);
    }
    if (cardsError) {
      toast({ title: "Error fetching credit cards", description: cardsError.message, variant: "destructive" });
    } else {
      setCreditCards(cardsData || []);
    }
    setLoading(false);
  }

  function openAddModal() {
    setEditMilestone(null);
    setForm({ milestone_name: "", card_id: "", spend_requirement: "", reward_description: "" });
    setFormError(null);
    setModalOpen(true);
  }

  function openEditModal(milestone: Milestone) {
    setEditMilestone(milestone);
    setForm({
      milestone_name: milestone.milestone_name,
      card_id: milestone.card_id || "",
      spend_requirement: milestone.spend_requirement?.toString() || "",
      reward_description: milestone.reward_description || "",
    });
    setFormError(null);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditMilestone(null);
    setFormError(null);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);
    // Validation
    if (!form.milestone_name.trim()) {
      setFormError("Milestone name is required");
      setSubmitting(false);
      return;
    }
    if (!form.card_id) {
      setFormError("Card is required");
      setSubmitting(false);
      return;
    }
    if (!form.spend_requirement || isNaN(Number(form.spend_requirement))) {
      setFormError("Spend requirement must be a number");
      setSubmitting(false);
      return;
    }
    const payload = {
      milestone_name: form.milestone_name,
      card_id: form.card_id,
      spend_requirement: Number(form.spend_requirement),
      reward_description: form.reward_description || null,
    };
    if (editMilestone) {
      const { error } = await supabase
        .from("milestones")
        .update(payload)
        .eq("id", editMilestone.id);
      if (error) {
        setFormError(error.message);
        setSubmitting(false);
        return;
      }
      toast({ title: "Milestone updated" });
    } else {
      const { error } = await supabase
        .from("milestones")
        .insert(payload);
      if (error) {
        setFormError(error.message);
        setSubmitting(false);
        return;
      }
      toast({ title: "Milestone added" });
    }
    setSubmitting(false);
    closeModal();
    fetchData();
  }

  async function handleDelete(milestone: Milestone) {
    if (!window.confirm(`Delete milestone "${milestone.milestone_name}"? This cannot be undone.`)) return;
    const { error } = await supabase.from("milestones").delete().eq("id", milestone.id);
    if (error) {
      toast({ title: "Error deleting milestone", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Milestone deleted" });
      fetchData();
    }
  }

  // Card name lookup
  function getCardNameById(id: string | null) {
    if (!id) return "-";
    const card = creditCards.find((c) => c.id === id);
    return card ? card.card_name : "-";
  }

  // Card select search
  const filteredCards = useMemo(
    () =>
      creditCards.filter((c) =>
        c.card_name.toLowerCase().includes(cardSearch.toLowerCase())
      ),
    [creditCards, cardSearch]
  );

  // Sort milestones by card name
  const sortedMilestones = useMemo(() => {
    return [...milestones].sort((a, b) => {
      const cardA = getCardNameById(a.card_id).toLowerCase();
      const cardB = getCardNameById(b.card_id).toLowerCase();
      return cardA.localeCompare(cardB);
    });
  }, [milestones, getCardNameById]);

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">Milestones</h1>
        <Button onClick={openAddModal} className="transition-all hover:scale-[1.02]">
          <Plus className="w-5 h-5 mr-2" /> Add Milestone
        </Button>
      </div>
      <Card className="rounded-2xl shadow-md border p-4">
        <CardHeader className="pb-2">
          <h2 className="text-lg font-semibold">All Milestones</h2>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Milestone Name</TableHead>
                  <TableHead>Card</TableHead>
                  <TableHead>Spend Requirement</TableHead>
                  <TableHead>Reward Description</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5}>Loading...</TableCell>
                  </TableRow>
                ) : sortedMilestones.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5}>No milestones found.</TableCell>
                  </TableRow>
                ) : (
                  sortedMilestones.map((m) => (
                    <TableRow key={m.id}>
                      <TableCell>{m.milestone_name}</TableCell>
                      <TableCell>{getCardNameById(m.card_id)}</TableCell>
                      <TableCell>{m.spend_requirement}</TableCell>
                      <TableCell>{m.reward_description || "-"}</TableCell>
                      <TableCell className="flex gap-2 justify-end">
                        <Button
                          size="icon"
                          variant="ghost"
                          aria-label="Edit"
                          onClick={() => openEditModal(m)}
                        >
                          <Pencil className="w-5 h-5" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          aria-label="Delete"
                          onClick={() => handleDelete(m)}
                        >
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
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editMilestone ? "Edit Milestone" : "Add Milestone"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="milestone_name">Milestone Name</Label>
              <Input
                id="milestone_name"
                value={form.milestone_name}
                onChange={(e) => setForm((f) => ({ ...f, milestone_name: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="card_id">Card</Label>
              <Select
                value={form.card_id}
                onValueChange={(val) => setForm((f) => ({ ...f, card_id: val }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select card" />
                </SelectTrigger>
                <SelectContent className="max-h-60 overflow-y-auto">
                  <div className="sticky top-0 z-10 bg-background p-2">
                    <Input
                      placeholder="Search cards..."
                      value={cardSearch}
                      onChange={(e) => setCardSearch(e.target.value)}
                      className="h-8"
                      onClick={(e) => e.stopPropagation()}
                      onKeyDown={(e) => e.stopPropagation()}
                      onFocus={(e) => e.target.select()}
                    />
                  </div>
                  {filteredCards.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.card_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="spend_requirement">Spend Requirement</Label>
              <Input
                id="spend_requirement"
                type="number"
                min="0"
                value={form.spend_requirement}
                onChange={(e) => setForm((f) => ({ ...f, spend_requirement: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="reward_description">Reward Description</Label>
              <textarea
                id="reward_description"
                value={form.reward_description}
                onChange={(e) => setForm((f) => ({ ...f, reward_description: e.target.value }))}
                rows={3}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </div>
            {formError && <div className="text-red-500 text-sm">{formError}</div>}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeModal} disabled={submitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {editMilestone ? "Update" : "Add"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
} 