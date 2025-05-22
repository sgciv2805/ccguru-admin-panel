"use client";

import { ReactNode, useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Database } from "@/types/supabase";
import { Plus, Edit, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

// Types

type CreditCard = Database["public"]["Tables"]["credit_cards"]["Row"];
type CardBenefit = Database["public"]["Tables"]["card_benefits"]["Row"];
type Milestone = Database["public"]["Tables"]["milestones"]["Row"];
type RewardProgram = Database["public"]["Tables"]["reward_programs"]["Row"];

type Props = {
  card: CreditCard;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
};

export function CardSettingsDialog({ card, open, onOpenChange, children }: Props) {
  const [tab, setTab] = useState("benefits");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-3xl w-full max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>
            Card Settings: <span className="text-primary">{card.card_name}</span>
          </DialogTitle>
        </DialogHeader>
        <Tabs value={tab} onValueChange={setTab} className="mt-4">
          <TabsList className="w-full">
            <TabsTrigger value="benefits">Benefits</TabsTrigger>
            <TabsTrigger value="milestones">Milestones</TabsTrigger>
            <TabsTrigger value="reward-program">Reward Program</TabsTrigger>
          </TabsList>
          <TabsContent value="benefits">
            {/* Benefits Tab Content */}
            <BenefitsTab card={card} />
          </TabsContent>
          <TabsContent value="milestones">
            {/* Milestones Tab Content */}
            <MilestonesTab card={card} />
          </TabsContent>
          <TabsContent value="reward-program">
            {/* Reward Program Tab Content */}
            <RewardProgramTab card={card} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

// --- Benefits Tab ---
function BenefitsTab({ card }: { card: CreditCard }) {
  const supabase = createClientComponentClient<Database>();
  const [benefits, setBenefits] = useState<Database["public"]["Tables"]["benefits"]["Row"][]>([]);
  const [rules, setRules] = useState<Database["public"]["Tables"]["calculation_rules"]["Row"][]>([]);
  const [cardBenefits, setCardBenefits] = useState<CardBenefit[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editBenefit, setEditBenefit] = useState<CardBenefit | null>(null);
  const [form, setForm] = useState({
    benefit_id: "",
    calculation_rule_id: "",
    reward_rate: "",
    max_reward_amount: "",
    terms_and_conditions: "",
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line
  }, [card.id]);

  async function fetchAll() {
    setLoading(true);
    const [{ data: cardBenefitsData }, { data: benefitsData }, { data: rulesData }] = await Promise.all([
      supabase.from("card_benefits").select("*", { count: "exact" }).eq("card_id", card.id),
      supabase.from("benefits").select("*"),
      supabase.from("calculation_rules").select("*"),
    ]);
    setCardBenefits(cardBenefitsData || []);
    setBenefits(benefitsData || []);
    setRules(rulesData || []);
    setLoading(false);
  }

  function openAddModal() {
    setEditBenefit(null);
    setForm({ benefit_id: "", calculation_rule_id: "", reward_rate: "", max_reward_amount: "", terms_and_conditions: "" });
    setFormError(null);
    setModalOpen(true);
  }

  function openEditModal(b: CardBenefit) {
    setEditBenefit(b);
    setForm({
      benefit_id: b.benefit_id || "",
      calculation_rule_id: b.calculation_rule_id || "",
      reward_rate: b.reward_rate?.toString() || "",
      max_reward_amount: b.max_reward_amount?.toString() || "",
      terms_and_conditions: b.terms_and_conditions || "",
    });
    setFormError(null);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditBenefit(null);
    setFormError(null);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);
    if (!form.benefit_id) {
      setFormError("Benefit is required");
      setSubmitting(false);
      return;
    }
    const payload = {
      benefit_id: form.benefit_id,
      calculation_rule_id: form.calculation_rule_id || null,
      card_id: card.id,
      reward_rate: form.reward_rate ? Number(form.reward_rate) : null,
      max_reward_amount: form.max_reward_amount ? Number(form.max_reward_amount) : null,
      terms_and_conditions: form.terms_and_conditions || null,
    };
    let error;
    if (editBenefit) {
      ({ error } = await supabase.from("card_benefits").update(payload).eq("id", editBenefit.id));
      if (!error) toast.success("Benefit updated");
    } else {
      ({ error } = await supabase.from("card_benefits").insert(payload));
      if (!error) toast.success("Benefit added");
    }
    if (error) {
      setFormError(error.message);
      setSubmitting(false);
      return;
    }
    setSubmitting(false);
    closeModal();
    fetchAll();
  }

  async function handleDelete(b: CardBenefit) {
    if (!window.confirm("Delete this benefit? This cannot be undone.")) return;
    const { error } = await supabase.from("card_benefits").delete().eq("id", b.id);
    if (error) toast.error(error.message);
    else {
      toast.success("Benefit deleted");
      fetchAll();
    }
  }

  return (
    <Card className="rounded-2xl shadow-md border p-4 mt-4">
      <CardHeader>
        <CardTitle>Benefits</CardTitle>
        <Button onClick={openAddModal} className="ml-auto transition-all hover:scale-[1.02]">
          <Plus className="w-5 h-5 mr-2" /> Add Benefit
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="p-4">Loading...</div>
        ) : cardBenefits.length === 0 ? (
          <div className="p-4">No benefits found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr>
                  <th className="text-left">Benefit</th>
                  <th className="text-left">Reward Rate</th>
                  <th className="text-left">Max Reward</th>
                  <th className="text-left">Rule</th>
                  <th className="text-left">Terms</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {cardBenefits.map((b) => (
                  <tr key={b.id} className="odd:bg-muted">
                    <td>{benefits.find((ben) => ben.id === b.benefit_id)?.benefit_name || b.benefit_id}</td>
                    <td>{b.reward_rate ?? "-"}</td>
                    <td>{b.max_reward_amount ?? "-"}</td>
                    <td>{rules.find((r) => r.id === b.calculation_rule_id)?.calculation_type || "-"}</td>
                    <td className="max-w-xs truncate" title={b.terms_and_conditions || undefined}>{b.terms_and_conditions || "-"}</td>
                    <td className="flex gap-2 justify-end">
                      <Button size="icon" variant="ghost" aria-label="Edit" onClick={() => openEditModal(b)}>
                        <Edit className="w-5 h-5" />
                      </Button>
                      <Button size="icon" variant="ghost" aria-label="Delete" onClick={() => handleDelete(b)}>
                        <Trash2 className="w-5 h-5" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editBenefit ? "Edit Benefit" : "Add Benefit"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="benefit_id">Benefit</Label>
                <Select value={form.benefit_id} onValueChange={(val) => setForm((f) => ({ ...f, benefit_id: val }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select benefit" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60 overflow-y-auto">
                    {benefits.map((b) => (
                      <SelectItem key={b.id} value={b.id}>{b.benefit_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="calculation_rule_id">Calculation Rule</Label>
                <Select value={form.calculation_rule_id || "none"} onValueChange={val => setForm((f) => ({ ...f, calculation_rule_id: val === "none" ? "" : val }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select rule" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60 overflow-y-auto">
                    <SelectItem value="none">None</SelectItem>
                    {rules.map((r) => (
                      <SelectItem key={r.id} value={r.id}>{r.calculation_type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="reward_rate">Reward Rate</Label>
                <Input type="number" step="0.01" value={form.reward_rate} onChange={(e) => setForm((f) => ({ ...f, reward_rate: e.target.value }))} />
              </div>
              <div>
                <Label htmlFor="max_reward_amount">Max Reward Amount</Label>
                <Input type="number" step="0.01" value={form.max_reward_amount} onChange={(e) => setForm((f) => ({ ...f, max_reward_amount: e.target.value }))} />
              </div>
              <div>
                <Label htmlFor="terms_and_conditions">Terms & Conditions</Label>
                <Textarea value={form.terms_and_conditions} onChange={(e) => setForm((f) => ({ ...f, terms_and_conditions: e.target.value }))} />
              </div>
              {formError && <div className="text-red-500 text-sm">{formError}</div>}
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={closeModal}>Cancel</Button>
                <Button type="submit" disabled={submitting}>{editBenefit ? "Update" : "Add"}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}

// --- Milestones Tab ---
function MilestonesTab({ card }: { card: CreditCard }) {
  const supabase = createClientComponentClient<Database>();
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editMilestone, setEditMilestone] = useState<Milestone | null>(null);
  const [form, setForm] = useState({
    milestone_name: "",
    spend_requirement: "",
    reward_description: "",
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchMilestones();
    // eslint-disable-next-line
  }, [card.id]);

  async function fetchMilestones() {
    setLoading(true);
    const { data, error } = await supabase.from("milestones").select("*").eq("card_id", card.id);
    setMilestones(data || []);
    setLoading(false);
  }

  function openAddModal() {
    setEditMilestone(null);
    setForm({ milestone_name: "", spend_requirement: "", reward_description: "" });
    setFormError(null);
    setModalOpen(true);
  }

  function openEditModal(m: Milestone) {
    setEditMilestone(m);
    setForm({
      milestone_name: m.milestone_name,
      spend_requirement: m.spend_requirement?.toString() || "",
      reward_description: m.reward_description || "",
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
    if (!form.milestone_name.trim()) {
      setFormError("Milestone name is required");
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
      card_id: card.id,
      spend_requirement: Number(form.spend_requirement),
      reward_description: form.reward_description || null,
    };
    let error;
    if (editMilestone) {
      ({ error } = await supabase.from("milestones").update(payload).eq("id", editMilestone.id));
      if (!error) toast.success("Milestone updated");
    } else {
      ({ error } = await supabase.from("milestones").insert(payload));
      if (!error) toast.success("Milestone added");
    }
    if (error) {
      setFormError(error.message);
      setSubmitting(false);
      return;
    }
    setSubmitting(false);
    closeModal();
    fetchMilestones();
  }

  async function handleDelete(m: Milestone) {
    if (!window.confirm("Delete this milestone? This cannot be undone.")) return;
    const { error } = await supabase.from("milestones").delete().eq("id", m.id);
    if (error) toast.error(error.message);
    else {
      toast.success("Milestone deleted");
      fetchMilestones();
    }
  }

  return (
    <Card className="rounded-2xl shadow-md border p-4 mt-4">
      <CardHeader>
        <CardTitle>Milestones</CardTitle>
        <Button onClick={openAddModal} className="ml-auto transition-all hover:scale-[1.02]">
          <Plus className="w-5 h-5 mr-2" /> Add Milestone
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="p-4">Loading...</div>
        ) : milestones.length === 0 ? (
          <div className="p-4">No milestones found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr>
                  <th className="text-left">Milestone Name</th>
                  <th className="text-left">Spend Requirement</th>
                  <th className="text-left">Reward Description</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {milestones.map((m) => (
                  <tr key={m.id} className="odd:bg-muted">
                    <td>{m.milestone_name}</td>
                    <td>{m.spend_requirement}</td>
                    <td>{m.reward_description || "-"}</td>
                    <td className="flex gap-2 justify-end">
                      <Button size="icon" variant="ghost" aria-label="Edit" onClick={() => openEditModal(m)}>
                        <Edit className="w-5 h-5" />
                      </Button>
                      <Button size="icon" variant="ghost" aria-label="Delete" onClick={() => handleDelete(m)}>
                        <Trash2 className="w-5 h-5" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editMilestone ? "Edit Milestone" : "Add Milestone"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="milestone_name">Milestone Name</Label>
                <Input value={form.milestone_name} onChange={(e) => setForm((f) => ({ ...f, milestone_name: e.target.value }))} required />
              </div>
              <div>
                <Label htmlFor="spend_requirement">Spend Requirement</Label>
                <Input type="number" step="0.01" value={form.spend_requirement} onChange={(e) => setForm((f) => ({ ...f, spend_requirement: e.target.value }))} />
              </div>
              <div>
                <Label htmlFor="reward_description">Reward Description</Label>
                <Textarea value={form.reward_description} onChange={(e) => setForm((f) => ({ ...f, reward_description: e.target.value }))} />
              </div>
              {formError && <div className="text-red-500 text-sm">{formError}</div>}
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={closeModal}>Cancel</Button>
                <Button type="submit" disabled={submitting}>{editMilestone ? "Update" : "Add"}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}

// --- Reward Program Tab ---
function RewardProgramTab({ card }: { card: CreditCard }) {
  const supabase = createClientComponentClient<Database>();
  const [programs, setPrograms] = useState<RewardProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProgram, setSelectedProgram] = useState<string>(card.reward_program_id || "");
  const [currentProgram, setCurrentProgram] = useState<RewardProgram | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchPrograms();
    // eslint-disable-next-line
  }, [card.reward_program_id]);

  async function fetchPrograms() {
    setLoading(true);
    const { data, error } = await supabase.from("reward_programs").select("*");
    setPrograms(data || []);
    if (card.reward_program_id) {
      setCurrentProgram(data?.find((p) => p.id === card.reward_program_id) || null);
    } else {
      setCurrentProgram(null);
    }
    setLoading(false);
  }

  async function handleAssign(program_id: string | null) {
    setSubmitting(true);
    const { error } = await supabase.from("credit_cards").update({ reward_program_id: program_id }).eq("id", card.id);
    if (error) toast.error(error.message);
    else {
      toast.success("Reward program updated");
      setSelectedProgram(program_id || "none");
      setCurrentProgram(programs.find((p) => p.id === program_id) || null);
    }
    setSubmitting(false);
  }

  return (
    <Card className="rounded-2xl shadow-md border p-4 mt-4">
      <CardHeader>
        <CardTitle>Reward Program</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="p-4">Loading...</div>
        ) : (
          <>
            <div className="mb-4">
              <Label htmlFor="reward_program_id">Assign Program</Label>
              <Select value={selectedProgram || "none"} onValueChange={val => handleAssign(val === "none" ? null : val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select program" />
                </SelectTrigger>
                <SelectContent className="max-h-60 overflow-y-auto">
                  <SelectItem value="none">None</SelectItem>
                  {programs.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.program_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {currentProgram && (
              <div className="space-y-2">
                <div>
                  <span className="font-semibold">Description:</span> {currentProgram.description || "-"}
                </div>
                <div>
                  <span className="font-semibold">Redemption Options:</span>
                  <ul className="list-disc ml-6">
                    {(currentProgram.redemption_options || []).map((opt, i) => (
                      <li key={i}>{opt}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

// Ensure both are valid React components
export { MilestonesTab, RewardProgramTab }; 