"use client";

import { useState } from "react";
import { Database } from "@/types/supabase";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, CreditCard, Banknote, Percent, Link } from "lucide-react";
import { cn } from "@/lib/utils";
import { SearchableSelect } from "../../../src/components/ui/searchable-select";

type Bank = Database["public"]["Tables"]["banks"]["Row"];

const cardTypes = ["Travel", "Cashback", "Business", "Student", "Secured", "Other"] as const;
const cardNetworks = ["Visa", "Mastercard", "American Express", "Discover", "Other"] as const;

interface CreditCardFormProps {
  banks: Bank[];
  onSuccess: () => void;
  onCancel: () => void;
}

export function CreditCardForm({ banks, onSuccess, onCancel }: CreditCardFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    card_name: "",
    bank_id: "",
    card_type: "",
    card_network: "",
    annual_fee: "",
    reward_rate: "",
    signup_bonus: "",
    intro_apr: "",
    regular_apr: "",
    foreign_transaction_fee: "",
    official_page_url: "",
  });

  const supabase = createClientComponentClient<Database>();

  const bankOptions = banks.map(bank => ({
    label: bank.bank_name,
    value: bank.id,
    icon: <Banknote className="w-4 h-4 text-emerald-500" />
  }));

  const cardTypeOptions = cardTypes.map(type => ({
    label: type,
    value: type,
    icon: <CreditCard className="w-4 h-4 text-purple-500" />
  }));

  const cardNetworkOptions = cardNetworks.map(network => ({
    label: network,
    value: network,
    icon: <CreditCard className="w-4 h-4 text-blue-500" />
  }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.from("credit_cards").insert([
        {
          card_name: formData.card_name,
          bank_id: formData.bank_id || null,
          card_type: formData.card_type || null,
          card_network: formData.card_network || null,
          annual_fee: formData.annual_fee ? parseFloat(formData.annual_fee) : null,
          reward_rate: formData.reward_rate ? parseFloat(formData.reward_rate) : null,
          signup_bonus: formData.signup_bonus || null,
          intro_apr: formData.intro_apr || null,
          regular_apr: formData.regular_apr || null,
          foreign_transaction_fee: formData.foreign_transaction_fee ? parseFloat(formData.foreign_transaction_fee) : null,
          official_page_url: formData.official_page_url || null,
        },
      ]);

      if (error) throw error;
      onSuccess();
    } catch (error) {
      console.error("Error adding credit card:", error);
      toast.error("Failed to add credit card");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="card_name" className="text-sm font-medium text-gray-700">
            Card Name
          </Label>
          <div className="relative">
            <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              id="card_name"
              name="card_name"
              value={formData.card_name}
              onChange={handleChange}
              required
              className="pl-10"
              placeholder="Enter card name"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="bank_id" className="text-sm font-medium text-gray-700">
            Bank
          </Label>
          <SearchableSelect
            options={bankOptions}
            value={formData.bank_id}
            onValueChange={(value) => setFormData((prev) => ({ ...prev, bank_id: value }))}
            placeholder="Select bank"
            searchPlaceholder="Search banks..."
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="card_type" className="text-sm font-medium text-gray-700">
            Card Type
          </Label>
          <SearchableSelect
            options={cardTypeOptions}
            value={formData.card_type}
            onValueChange={(value) => setFormData((prev) => ({ ...prev, card_type: value }))}
            placeholder="Select card type"
            searchPlaceholder="Search card types..."
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="card_network" className="text-sm font-medium text-gray-700">
            Card Network
          </Label>
          <SearchableSelect
            options={cardNetworkOptions}
            value={formData.card_network}
            onValueChange={(value) => setFormData((prev) => ({ ...prev, card_network: value }))}
            placeholder="Select card network"
            searchPlaceholder="Search card networks..."
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="annual_fee" className="text-sm font-medium text-gray-700">
            Annual Fee (₹)
          </Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
            <Input
              id="annual_fee"
              name="annual_fee"
              type="number"
              value={formData.annual_fee}
              onChange={handleChange}
              className="pl-8"
              placeholder="0.00"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="reward_rate" className="text-sm font-medium text-gray-700">
            Reward Rate (%)
          </Label>
          <div className="relative">
            <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              id="reward_rate"
              name="reward_rate"
              type="number"
              value={formData.reward_rate}
              onChange={handleChange}
              className="pl-10"
              placeholder="0.00"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="signup_bonus" className="text-sm font-medium text-gray-700">
            Sign-up Bonus
          </Label>
          <Input
            id="signup_bonus"
            name="signup_bonus"
            value={formData.signup_bonus}
            onChange={handleChange}
            placeholder="Enter sign-up bonus details"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="intro_apr" className="text-sm font-medium text-gray-700">
            Intro APR
          </Label>
          <Input
            id="intro_apr"
            name="intro_apr"
            value={formData.intro_apr}
            onChange={handleChange}
            placeholder="Enter intro APR details"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="regular_apr" className="text-sm font-medium text-gray-700">
            Regular APR
          </Label>
          <Input
            id="regular_apr"
            name="regular_apr"
            value={formData.regular_apr}
            onChange={handleChange}
            placeholder="Enter regular APR"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="foreign_transaction_fee" className="text-sm font-medium text-gray-700">
            Foreign Transaction Fee (%)
          </Label>
          <div className="relative">
            <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              id="foreign_transaction_fee"
              name="foreign_transaction_fee"
              type="number"
              value={formData.foreign_transaction_fee}
              onChange={handleChange}
              className="pl-10"
              placeholder="0.00"
            />
          </div>
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="official_page_url" className="text-sm font-medium text-gray-700">
            Official Page URL
          </Label>
          <div className="relative">
            <Link className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              id="official_page_url"
              name="official_page_url"
              type="url"
              value={formData.official_page_url}
              onChange={handleChange}
              className="pl-10"
              placeholder="https://"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-4 pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="hover:bg-gray-100"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={loading}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Adding Card...
            </>
          ) : (
            <>
              <CreditCard className="mr-2 h-4 w-4" />
              Add Card
            </>
          )}
        </Button>
      </div>
    </form>
  );
} 