"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Database } from "@/types/supabase";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

type Bank = Database["public"]["Tables"]["banks"]["Row"];

const bankSchema = z.object({
  bank_name: z.string().min(1, "Bank name is required"),
  logo_url: z.string().url("Must be a valid URL").optional().nullable(),
});

type BankFormValues = z.infer<typeof bankSchema>;

interface BankFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bank: Bank | null;
  onSubmit: () => void;
}

export function BankForm({ open, onOpenChange, bank, onSubmit }: BankFormProps) {
  const { toast } = useToast();
  const supabase = createClientComponentClient<Database>();

  const form = useForm<BankFormValues>({
    resolver: zodResolver(bankSchema),
    defaultValues: {
      bank_name: "",
      logo_url: "",
    },
  });

  useEffect(() => {
    if (bank) {
      form.reset({
        bank_name: bank.bank_name,
        logo_url: bank.logo_url,
      });
    } else {
      form.reset({
        bank_name: "",
        logo_url: "",
      });
    }
  }, [bank, form]);

  const handleSubmit = async (values: BankFormValues) => {
    try {
      if (bank) {
        const { error } = await supabase
          .from("banks")
          .update(values)
          .eq("id", bank.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Bank updated successfully",
        });
      } else {
        const { error } = await supabase.from("banks").insert([values]);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Bank created successfully",
        });
      }

      onSubmit();
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{bank ? "Edit Bank" : "Add Bank"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="bank_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bank Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="logo_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Logo URL</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                {bank ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 