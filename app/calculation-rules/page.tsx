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
import { Textarea } from "@/components/ui/textarea";
import { Pencil, Trash2, Plus } from "lucide-react";

// Types

type CalculationRule = Database["public"]["Tables"]["calculation_rules"]["Row"];
type InsertCalculationRule = Database["public"]["Tables"]["calculation_rules"]["Insert"];
type UpdateCalculationRule = Database["public"]["Tables"]["calculation_rules"]["Update"];
type SpendCategory = Database["public"]["Tables"]["spend_categories"]["Row"];

const calculationTypes = [
  { value: "rate", label: "Rate" },
  { value: "flat", label: "Flat" },
  { value: "slab", label: "Slab" },
  { value: "bonus", label: "Bonus" },
  { value: "reward", label: "Reward" },
];

export default function Page() {
  const supabase = createClientComponentClient<Database>();
  const { toast } = useToast();
  const [rules, setRules] = useState<CalculationRule[]>([]);
  const [categories, setCategories] = useState<SpendCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editRule, setEditRule] = useState<CalculationRule | null>(null);
  const [form, setForm] = useState<InsertCalculationRule>({
    calculation_type: "rate",
    spend_category_id: "",
    multiplier: 1.0,
    terms_and_conditions: "",
    cap_amount: null,
    min_spend: null,
    calculation_type: "rate",
    id: undefined,
    created_at: undefined,
    updated_at: undefined,
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [categorySearch, setCategorySearch] = useState("");

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, []);

  async function fetchData() {
    setLoading(true);
    const [rulesRes, catRes] = await Promise.all([
      supabase.from("calculation_rules").select("*"),
      supabase.from("spend_categories").select("*"),
    ]);
    if (rulesRes.error) toast({ title: "Error fetching rules", description: rulesRes.error.message, variant: "destructive" });
    else setRules(rulesRes.data || []);
    if (catRes.error) toast({ title: "Error fetching categories", description: catRes.error.message, variant: "destructive" });
    else setCategories(catRes.data || []);
    setLoading(false);
  }

  function openAddModal() {
    setEditRule(null);
    setForm({
      calculation_type: "rate",
      spend_category_id: "",
      multiplier: 1.0,
      terms_and_conditions: "",
      cap_amount: null,
      min_spend: null,
      id: undefined,
      created_at: undefined,
      updated_at: undefined,
    });
    setCategorySearch("");
    setFormError(null);
    setModalOpen(true);
  }

  function openEditModal(rule: CalculationRule) {
    setEditRule(rule);
    setForm({ ...rule });
    setCategorySearch("");
    setFormError(null);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditRule(null);
    setFormError(null);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);
    if (!form.calculation_type) {
      setFormError("Calculation type is required");
      setSubmitting(false);
      return;
    }
    if (!form.spend_category_id) {
      setFormError("Spend category is required");
      setSubmitting(false);
      return;
    }
    if (!form.multiplier || isNaN(Number(form.multiplier))) {
      setFormError("Multiplier must be a number");
      setSubmitting(false);
      return;
    }
    const payload = {
      ...form,
      multiplier: Number(form.multiplier),
      terms_and_conditions: form.terms_and_conditions || null,
    };
    let error;
    if (editRule) {
      ({ error } = await supabase.from("calculation_rules").update(payload).eq("id", editRule.id));
      if (!error) toast({ title: "Rule updated" });
    } else {
      ({ error } = await supabase.from("calculation_rules").insert(payload));
      if (!error) toast({ title: "Rule added" });
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

  async function handleDelete(rule: CalculationRule) {
    if (!window.confirm(`Delete rule for category ${getCategoryName(rule.spend_category_id)}? This cannot be undone.`)) return;
    const { error } = await supabase.from("calculation_rules").delete().eq("id", rule.id);
    if (error) toast({ title: "Error deleting rule", description: error.message, variant: "destructive" });
    else {
      toast({ title: "Rule deleted" });
      fetchData();
    }
  }

  function getCategoryName(category_id: string | null) {
    if (!category_id) return "-";
    const cat = categories.find((c) => c.id === category_id);
    return cat ? cat.category_name : category_id;
  }

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">Calculation Rules</h1>
        <Button onClick={openAddModal} className="transition-all hover:scale-[1.02]">
          <Plus className="w-5 h-5 mr-2" /> Add Rule
        </Button>
      </div>
      <Card className="rounded-2xl shadow-md border p-4">
        <CardHeader className="pb-2">
          <h2 className="text-lg font-semibold">All Calculation Rules</h2>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Multiplier</TableHead>
                  <TableHead>Cap Amount</TableHead>
                  <TableHead>Min Spend</TableHead>
                  <TableHead>Terms &amp; Conditions</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7}>Loading...</TableCell>
                  </TableRow>
                ) : rules.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7}>No rules found.</TableCell>
                  </TableRow>
                ) : (
                  rules.map((rule) => (
                    <TableRow key={rule.id}>
                      <TableCell>{rule.calculation_type}</TableCell>
                      <TableCell>{getCategoryName(rule.spend_category_id)}</TableCell>
                      <TableCell>{rule.multiplier}</TableCell>
                      <TableCell>{rule.cap_amount ?? '-'}</TableCell>
                      <TableCell>{rule.min_spend ?? '-'}</TableCell>
                      <TableCell className="max-w-xs truncate" title={rule.terms_and_conditions || undefined}>
                        {rule.terms_and_conditions || "-"}
                      </TableCell>
                      <TableCell className="flex gap-2 justify-end">
                        <Button size="icon" variant="ghost" aria-label="Edit" onClick={() => openEditModal(rule)}>
                          <Pencil className="w-5 h-5" />
                        </Button>
                        <Button size="icon" variant="ghost" aria-label="Delete" onClick={() => handleDelete(rule)}>
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
            <DialogTitle>{editRule ? "Edit Rule" : "Add Rule"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="calculation_type">Calculation Type</Label>
              <Select
                value={form.calculation_type}
                onValueChange={(val) => setForm((f) => ({ ...f, calculation_type: val as any }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {calculationTypes.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="spend_category_id">Spend Category</Label>
              <Select
                value={form.spend_category_id || ""}
                onValueChange={(val) => setForm((f) => ({ ...f, spend_category_id: val }))}
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
              <Label htmlFor="multiplier">Multiplier</Label>
              <Input
                id="multiplier"
                type="number"
                step="0.01"
                value={form.multiplier ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, multiplier: e.target.value ? parseFloat(e.target.value) : 1.0 }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="cap_amount">Cap Amount</Label>
              <Input
                id="cap_amount"
                type="number"
                step="0.01"
                value={form.cap_amount ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, cap_amount: e.target.value ? parseFloat(e.target.value) : null }))}
                placeholder="Optional"
              />
            </div>
            <div>
              <Label htmlFor="min_spend">Min Spend</Label>
              <Input
                id="min_spend"
                type="number"
                step="0.01"
                value={form.min_spend ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, min_spend: e.target.value ? parseFloat(e.target.value) : null }))}
                placeholder="Optional"
              />
            </div>
            <div>
              <Label htmlFor="terms_and_conditions">Terms &amp; Conditions</Label>
              <Textarea
                id="terms_and_conditions"
                value={form.terms_and_conditions || ""}
                onChange={(e) => setForm((f) => ({ ...f, terms_and_conditions: e.target.value }))}
                rows={3}
                className="w-full"
              />
            </div>
            {formError && <div className="text-red-500 text-sm">{formError}</div>}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeModal} disabled={submitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {editRule ? "Update" : "Add"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
} 