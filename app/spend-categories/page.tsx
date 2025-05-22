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

type SpendCategory = Database["public"]["Tables"]["spend_categories"]["Row"];
type InsertSpendCategory = Database["public"]["Tables"]["spend_categories"]["Insert"];
type UpdateSpendCategory = Database["public"]["Tables"]["spend_categories"]["Update"];
type SpendCategoryWithChildren = SpendCategory & { children: SpendCategoryWithChildren[] };

function getCategoryNameById(categories: SpendCategory[], id: string | null) {
  if (!id) return "-";
  const cat = categories.find((c) => c.id === id);
  return cat ? cat.category_name : "-";
}

function isCircular(categories: SpendCategory[], childId: string, parentId: string | null): boolean {
  let current: string | null = parentId;
  while (current !== null) {
    if (current === childId) return true;
    const parent = categories.find((c) => c.id === current)?.parent_category_id;
    current = parent ?? null;
  }
  return false;
}

// Helper to build a tree from flat categories
function buildCategoryTree(categories: SpendCategory[]): SpendCategoryWithChildren[] {
  const map = new Map<string, SpendCategoryWithChildren>();
  categories.forEach(cat => map.set(cat.id, { ...cat, children: [] }));
  const roots: SpendCategoryWithChildren[] = [];
  map.forEach(cat => {
    if (cat.parent_category_id && map.has(cat.parent_category_id)) {
      map.get(cat.parent_category_id)!.children.push(cat);
    } else {
      roots.push(cat);
    }
  });
  return roots;
}

// Recursive tree node component
function CategoryTreeNode({ node, onAddChild, onEdit, onDelete, level = 0 }: {
  node: SpendCategoryWithChildren;
  onAddChild: (parentId: string) => void;
  onEdit: (cat: SpendCategory) => void;
  onDelete: (cat: SpendCategory) => void;
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
        <span className="font-medium flex-1 min-w-0 truncate" title={node.category_name}>{node.category_name}</span>
        <Button size="icon" variant="ghost" aria-label="Add Child Category" onClick={() => onAddChild(node.id)}>
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
            <CategoryTreeNode
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
  const [categories, setCategories] = useState<SpendCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editCategory, setEditCategory] = useState<SpendCategory | null>(null);
  const [form, setForm] = useState<{
    category_name: string;
    parent_category_id: string;
    description: string;
  }>({ category_name: "", parent_category_id: "__none__", description: "" });
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [parentSearch, setParentSearch] = useState("");

  const NO_PARENT_VALUE = "__none__";

  // Fetch categories
  useEffect(() => {
    fetchCategories();
    // eslint-disable-next-line
  }, []);

  async function fetchCategories() {
    setLoading(true);
    const { data, error } = await supabase
      .from("spend_categories")
      .select("*")
      .order("level", { ascending: true })
      .order("category_name", { ascending: true });
    if (error) {
      toast({ title: "Error fetching categories", description: error.message, variant: "destructive" });
    } else {
      setCategories(data || []);
    }
    setLoading(false);
  }

  function openAddModal() {
    setEditCategory(null);
    setForm({ category_name: "", parent_category_id: NO_PARENT_VALUE, description: "" });
    setFormError(null);
    setModalOpen(true);
  }

  function openEditModal(category: SpendCategory) {
    setEditCategory(category);
    setForm({
      category_name: category.category_name,
      parent_category_id: category.parent_category_id || NO_PARENT_VALUE,
      description: category.description || "",
    });
    setFormError(null);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditCategory(null);
    setFormError(null);
  }

  function openAddChildModal(parentId: string) {
    setEditCategory(null);
    setForm({ category_name: "", parent_category_id: parentId, description: "" });
    setParentSearch("");
    setFormError(null);
    setModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);
    // Validation
    if (!form.category_name.trim()) {
      setFormError("Category name is required");
      setSubmitting(false);
      return;
    }
    // Prevent circular reference
    const parentId = form.parent_category_id === NO_PARENT_VALUE ? null : form.parent_category_id;
    if (editCategory && isCircular(categories, editCategory.id, parentId)) {
      setFormError("Cannot set a child as its own parent or descendant.");
      setSubmitting(false);
      return;
    }
    // Calculate level
    let level = 0;
    if (parentId) {
      const parent = categories.find((c) => c.id === parentId);
      level = parent ? parent.level + 1 : 0;
    }
    if (editCategory) {
      // Update
      const { error } = await supabase
        .from("spend_categories")
        .update({
          category_name: form.category_name,
          parent_category_id: parentId,
          description: form.description || null,
          level,
        })
        .eq("id", editCategory.id);
      if (error) {
        setFormError(error.message);
        setSubmitting(false);
        return;
      }
      toast({ title: "Category updated" });
    } else {
      // Insert
      const { error } = await supabase
        .from("spend_categories")
        .insert({
          category_name: form.category_name,
          parent_category_id: parentId,
          description: form.description || null,
          level,
        });
      if (error) {
        setFormError(error.message);
        setSubmitting(false);
        return;
      }
      toast({ title: "Category added" });
    }
    setSubmitting(false);
    closeModal();
    fetchCategories();
  }

  async function handleDelete(category: SpendCategory) {
    if (!window.confirm(`Delete category "${category.category_name}"? This cannot be undone.`)) return;
    const { error } = await supabase.from("spend_categories").delete().eq("id", category.id);
    if (error) {
      toast({ title: "Error deleting category", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Category deleted" });
      fetchCategories();
    }
  }

  // For parent select, exclude self and descendants (to prevent circular refs)
  const availableParents = useMemo(() => {
    if (!editCategory) return categories;
    // Get all descendants of the current category
    const descendants: Set<string> = new Set();
    function findDescendants(id: string) {
      categories.forEach((cat) => {
        if (cat.parent_category_id === id) {
          descendants.add(cat.id);
          findDescendants(cat.id);
        }
      });
    }
    findDescendants(editCategory.id);
    return categories.filter((cat) => cat.id !== editCategory.id && !descendants.has(cat.id));
  }, [categories, editCategory]);

  const filteredParents = useMemo(
    () =>
      availableParents.filter((cat) =>
        cat.category_name.toLowerCase().includes(parentSearch.toLowerCase())
      ),
    [availableParents, parentSearch]
  );

  const tree = useMemo(() => buildCategoryTree(categories), [categories]);

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">Spend Categories</h1>
        <Button onClick={openAddModal} className="transition-all hover:scale-[1.02]">
          <Plus className="w-5 h-5 mr-2" /> Add Category
        </Button>
      </div>
      <Card className="rounded-2xl shadow-md border p-4">
        <CardHeader className="pb-2">
          <h2 className="text-lg font-semibold">Category Tree</h2>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-4">Loading...</div>
            ) : tree.length === 0 ? (
              <div className="p-4">No categories found.</div>
            ) : (
              tree.map(root => (
                <CategoryTreeNode
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
            <DialogTitle>{editCategory ? "Edit Category" : "Add Category"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="category_name">Category Name</Label>
              <Input
                id="category_name"
                value={form.category_name}
                onChange={(e) => setForm((f) => ({ ...f, category_name: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="parent_category_id">Parent Category</Label>
              <Select
                value={form.parent_category_id}
                onValueChange={(val) => setForm((f) => ({ ...f, parent_category_id: val }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="None (top-level)" />
                </SelectTrigger>
                <SelectContent className="max-h-60 overflow-y-auto">
                  <div className="sticky top-0 z-10 bg-background p-2">
                    <Input
                      placeholder="Search categories..."
                      value={parentSearch}
                      onChange={(e) => setParentSearch(e.target.value)}
                      className="h-8"
                      onClick={(e) => e.stopPropagation()}
                      onKeyDown={(e) => e.stopPropagation()}
                      onFocus={(e) => e.target.select()}
                    />
                  </div>
                  <SelectItem value={NO_PARENT_VALUE}>None (top-level)</SelectItem>
                  {filteredParents.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.category_name}
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
                {editCategory ? "Update" : "Add"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
} 