"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/types/supabase";
import { BankForm } from "./bank-form";
import { BanksTable } from "./banks-table";

type Bank = Database["public"]["Tables"]["banks"]["Row"];

export default function BanksPage() {
  const [banks, setBanks] = useState<Bank[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedBank, setSelectedBank] = useState<Bank | null>(null);
  const { toast } = useToast();
  const supabase = createClientComponentClient<Database>();

  const fetchBanks = async () => {
    try {
      const { data, error } = await supabase
        .from("banks")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setBanks(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch banks",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBanks();
  }, []);

  const handleEdit = (bank: Bank) => {
    setSelectedBank(bank);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      const { error } = await supabase.from("banks").delete().eq("id", id);
      if (error) throw error;

      toast({
        title: "Success",
        description: "Bank deleted successfully",
      });
      fetchBanks();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete bank",
        variant: "destructive",
      });
    }
  };

  const handleFormSubmit = async () => {
    await fetchBanks();
    setIsFormOpen(false);
    setSelectedBank(null);
  };

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Banks</CardTitle>
          <Button onClick={() => setIsFormOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Bank
          </Button>
        </CardHeader>
        <CardContent>
          <BanksTable
            banks={banks}
            isLoading={isLoading}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </CardContent>
      </Card>

      <BankForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        bank={selectedBank}
        onSubmit={handleFormSubmit}
      />
    </div>
  );
} 