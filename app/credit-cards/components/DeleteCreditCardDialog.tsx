"use client";

import { useState } from "react";
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
import { toast } from "sonner";
import { Loader2, AlertTriangle, Trash2 } from "lucide-react";

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
  const [loading, setLoading] = useState(false);
  const supabase = createClientComponentClient<Database>();

  const handleDelete = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("credit_cards")
        .delete()
        .eq("id", creditCard.id);

      if (error) throw error;
      onSuccess();
    } catch (error) {
      console.error("Error deleting credit card:", error);
      toast.error("Failed to delete credit card");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="w-5 h-5" />
            Delete Credit Card
          </DialogTitle>
          <DialogDescription className="pt-3">
            Are you sure you want to delete <span className="font-semibold text-gray-900">{creditCard.card_name}</span>? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center space-x-4 py-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
              <Trash2 className="w-6 h-6 text-red-600" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {creditCard.card_name}
            </p>
            <p className="text-sm text-gray-500">
              {creditCard.card_type} • {creditCard.card_network}
            </p>
          </div>
        </div>
        <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="w-full sm:w-auto hover:bg-gray-100"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={loading}
            className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Card
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 