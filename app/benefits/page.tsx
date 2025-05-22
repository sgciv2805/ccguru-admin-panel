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
import { Trash2, Pencil, Plus, PlusCircle, ChevronDown, ChevronRight } from "lucide-react";

// Types

type Benefit = Database["public"]["Tables"]["benefits"]["Row"];
type InsertBenefit = Database["public"]["Tables"]["benefits"]["Insert"];
type UpdateBenefit = Database["public"]["Tables"]["benefits"]["Update"];

const benefitTypes = ["category", "benefit", "reward", "perk", "feeWaiver"] as const;
const NO_PARENT_VALUE = "__none__";

function getBenefitNameById(benefits: Benefit[], id: string | null) {
  if (!id) return "-";
  const b = benefits.find((b) => b.id === id);
  return b ? b.benefit_name : "-";
}

type BenefitWithChildren = Benefit & { children: BenefitWithChildren[] };

function buildBenefitTree(benefits: Benefit[]): BenefitWithChildren[] {
  const map = new Map<string, BenefitWithChildren>();
  benefits.forEach(b => map.set(b.id, { ...b, children: [] }));
  const roots: BenefitWithChildren[] = [];
  map.forEach(b => {
    if (b.parent_benefit_id && map.has(b.parent_benefit_id)) {
      map.get(b.parent_benefit_id)!.children.push(b);
    } else {
      roots.push(b);
    }
  });
  return roots;
}

function BenefitTreeNode({ node, onAddChild, onEdit, onDelete, level = 0 }: {
  node: BenefitWithChildren;
  onAddChild: (parentId: string) => void;
  onEdit: (b: Benefit) => void;
  onDelete: (b: Benefit) => void;
  level?: number;
}) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className={level > 0 ? "pl-4 border-l border-muted" : ""}>
      <div className="flex items-center gap-2 py-1">
        {node.children.length > 0 ? (
          <button
            type="button"
            onClick={() => setExpanded(e => !e)}
            aria-label={expanded ? "Collapse" : "Expand"}
            className="transition-colors hover:bg-muted rounded p-1"
          >
            {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        ) : (
          <span className="inline-block w-6" />
        )}
        <span className="font-medium flex-1 min-w-0 truncate" title={node.benefit_name}>{node.benefit_name}</span>
        <span className="text-muted-foreground text-xs">{node.benefit_type}</span>
        <Button size="icon" variant="ghost" aria-label="Add Child Benefit" onClick={() => onAddChild(node.id)}>
          <PlusCircle className="w-5 h-5" />
        </Button>
        <Button size="icon" variant="ghost" aria-label="Edit" onClick={() => onEdit(node)}>
          <Pencil className="w-5 h-5" />
        </Button>
        <Button size="icon" variant="ghost" aria-label="Delete" onClick={() => onDelete(node)}>
          <Trash2 className="w-5 h-5" />
        </Button>
      </div>
      {expanded && node.children.length > 0 && (
        <div>
          {node.children.map(child => (
            <BenefitTreeNode
              key={child.id}
              node={child}
              onAddChild={onAddChild}
              onEdit={onEdit}
              onDelete={onDelete}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function Page() {
  const supabase = createClientComponentClient<Database>();
  const { toast } = useToast();
  const [benefits, setBenefits] = useState<Benefit[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editBenefit, setEditBenefit] = useState<Benefit | null>(null);
  const [form, setForm] = useState<{
    benefit_name: string;
    benefit_type: string;
    parent_benefit_id: string;
    description: string;
  }>({ benefit_name: "", benefit_type: benefitTypes[0], parent_benefit_id: NO_PARENT_VALUE, description: "" });
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [parentSearch, setParentSearch] = useState("");
  const [typeSearch, setTypeSearch] = useState("");

  // Fetch benefits
  useEffect(() => {
    fetchBenefits();
    // eslint-disable-next-line
  }, []);

  async function fetchBenefits() {
    setLoading(true);
    const { data, error } = await supabase
      .from("benefits")
      .select("*")
      .order("level", { ascending: true })
      .order("benefit_name", { ascending: true });
    if (error) {
      toast({ title: "Error fetching benefits", description: error.message, variant: "destructive" });
    } else {
      setBenefits(data || []);
    }
    setLoading(false);
  }

  function openAddModal() {
    setEditBenefit(null);
    setForm({ benefit_name: "", benefit_type: benefitTypes[0], parent_benefit_id: NO_PARENT_VALUE, description: "" });
    setFormError(null);
    setModalOpen(true);
  }

  function openEditModal(benefit: Benefit) {
    setEditBenefit(benefit);
    setForm({
      benefit_name: benefit.benefit_name,
      benefit_type: benefit.benefit_type || benefitTypes[0],
      parent_benefit_id: benefit.parent_benefit_id || NO_PARENT_VALUE,
      description: benefit.description || "",
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
    // Validation
    if (!form.benefit_name.trim()) {
      setFormError("Benefit name is required");
      setSubmitting(false);
      return;
    }
    // Calculate level
    const parentId = form.parent_benefit_id === NO_PARENT_VALUE ? null : form.parent_benefit_id;
    let level = 0;
    if (parentId) {
      const parent = benefits.find((b) => b.id === parentId);
      level = parent ? parent.level + 1 : 0;
    }
    if (editBenefit) {
      // Update
      const { error } = await supabase
        .from("benefits")
        .update({
          benefit_name: form.benefit_name,
          benefit_type: form.benefit_type,
          parent_benefit_id: parentId,
          description: form.description || null,
          level,
        })
        .eq("id", editBenefit.id);
      if (error) {
        setFormError(error.message);
        setSubmitting(false);
        return;
      }
      toast({ title: "Benefit updated" });
    } else {
      // Insert
      const { error } = await supabase
        .from("benefits")
        .insert({
          benefit_name: form.benefit_name,
          benefit_type: form.benefit_type,
          parent_benefit_id: parentId,
          description: form.description || null,
          level,
        });
      if (error) {
        setFormError(error.message);
        setSubmitting(false);
        return;
      }
      toast({ title: "Benefit added" });
    }
    setSubmitting(false);
    closeModal();
    fetchBenefits();
  }

  async function handleDelete(benefit: Benefit) {
    if (!window.confirm(`Delete benefit "${benefit.benefit_name}"? This cannot be undone.`)) return;
    const { error } = await supabase.from("benefits").delete().eq("id", benefit.id);
    if (error) {
      toast({ title: "Error deleting benefit", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Benefit deleted" });
      fetchBenefits();
    }
  }

  // For parent select, exclude self and descendants (to prevent circular refs)
  const availableParents = useMemo(() => {
    if (!editBenefit) return benefits;
    // Get all descendants of the current benefit
    const descendants: Set<string> = new Set();
    function findDescendants(id: string) {
      benefits.forEach((b) => {
        if (b.parent_benefit_id === id) {
          descendants.add(b.id);
          findDescendants(b.id);
        }
      });
    }
    findDescendants(editBenefit.id);
    return benefits.filter((b) => b.id !== editBenefit.id && !descendants.has(b.id));
  }, [benefits, editBenefit]);

  const filteredParents = useMemo(
    () =>
      availableParents.filter((b) =>
        b.benefit_name.toLowerCase().includes(parentSearch.toLowerCase())
      ),
    [availableParents, parentSearch]
  );

  const tree = useMemo(() => buildBenefitTree(benefits), [benefits]);

  function openAddChildModal(parentId: string) {
    setEditBenefit(null);
    setForm({ benefit_name: "", benefit_type: benefitTypes[0], parent_benefit_id: parentId, description: "" });
    setParentSearch("");
    setFormError(null);
    setModalOpen(true);
  }

  const uniqueTypes = useMemo(
    () => Array.from(new Set(benefits.map(b => b.benefit_type).filter(Boolean))),
    [benefits]
  );
  const allTypes = useMemo(
    () => Array.from(new Set([...benefitTypes, ...uniqueTypes])),
    [benefitTypes, uniqueTypes]
  );

  const filteredTypes = useMemo(
    () => allTypes.filter((type): type is string => !!type && type.toLowerCase().includes(typeSearch.toLowerCase())),
    [allTypes, typeSearch]
  );

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">Benefits</h1>
        <Button onClick={openAddModal} className="transition-all hover:scale-[1.02]">
          <Plus className="w-5 h-5 mr-2" /> Add Benefit
        </Button>
      </div>
      <Card className="rounded-2xl shadow-md border p-4">
        <CardHeader className="pb-2">
          <h2 className="text-lg font-semibold">Benefit Tree</h2>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-4">Loading...</div>
            ) : tree.length === 0 ? (
              <div className="p-4">No benefits found.</div>
            ) : (
              tree.map(root => (
                <BenefitTreeNode
                  key={root.id}
                  node={root}
                  onAddChild={openAddChildModal}
                  onEdit={openEditModal}
                  onDelete={handleDelete}
                  level={0}
                />
              ))
            )}
          </div>
        </CardContent>
      </Card>
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editBenefit ? "Edit Benefit" : "Add Benefit"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="benefit_name">Benefit Name</Label>
              <Input
                id="benefit_name"
                value={form.benefit_name}
                onChange={(e) => setForm((f) => ({ ...f, benefit_name: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="benefit_type">Benefit Type</Label>
              <Select
                value={form.benefit_type}
                onValueChange={(val) => setForm((f) => ({ ...f, benefit_type: val }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent className="max-h-60 overflow-y-auto">
                  <div className="sticky top-0 z-10 bg-background p-2">
                    <Input
                      placeholder="Search types..."
                      value={typeSearch}
                      onChange={(e) => setTypeSearch(e.target.value)}
                      className="h-8"
                      onClick={(e) => e.stopPropagation()}
                      onKeyDown={(e) => e.stopPropagation()}
                      onFocus={(e) => e.target.select()}
                    />
                  </div>
                  {filteredTypes.filter((type): type is string => !!type).map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="parent_benefit_id">Parent Benefit</Label>
              <Select
                value={form.parent_benefit_id}
                onValueChange={(val) => setForm((f) => ({ ...f, parent_benefit_id: val }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="None (top-level)" />
                </SelectTrigger>
                <SelectContent className="max-h-60 overflow-y-auto">
                  <div className="sticky top-0 z-10 bg-background p-2">
                    <Input
                      placeholder="Search benefits..."
                      value={parentSearch}
                      onChange={(e) => setParentSearch(e.target.value)}
                      className="h-8"
                      onClick={(e) => e.stopPropagation()}
                      onKeyDown={(e) => e.stopPropagation()}
                      onFocus={(e) => e.target.select()}
                    />
                  </div>
                  <SelectItem value={NO_PARENT_VALUE}>None (top-level)</SelectItem>
                  {filteredParents.map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.benefit_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
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
                {editBenefit ? "Update" : "Add"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
} 