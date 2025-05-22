"use client";

import { Database } from "@/types/supabase";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type CreditCard = Database["public"]["Tables"]["credit_cards"]["Row"];

interface DeleteCreditCardDialogProps {
  creditCard: CreditCard;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function DeleteCreditCardDialog({
  creditCard,
  isOpen,
  onClose,
  onSuccess,
}: DeleteCreditCardDialogProps) {
  const supabase = createClientComponentClient<Database>();

  const handleDelete = async () => {
    const { error } = await supabase
      .from("credit_cards")
      .delete()
      .eq("id", creditCard.id);

    if (error) {
      console.error("Error deleting credit card:", error);
      return;
    }

    onSuccess();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Credit Card</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete {creditCard.card_name}? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" variant="destructive" onClick={handleDelete}>
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 