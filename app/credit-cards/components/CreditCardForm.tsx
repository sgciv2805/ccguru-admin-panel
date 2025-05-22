"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Database } from "@/types/supabase";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

type Bank = Database["public"]["Tables"]["banks"]["Row"];

const cardTypes = ["Credit", "Charge", "Debit"] as const;
const cardNetworks = ["Visa", "Mastercard", "American Express", "Discover", "RuPay"] as const;

const formSchema = z.object({
  card_name: z.string().min(1, "Card name is required"),
  card_type: z.string().optional(),
  card_network: z.string().optional(),
  annual_fee: z.string().optional(),
  reward_rate: z.string().optional(),
  bank_id: z.string().min(1, "Bank is required"),
  foreign_transaction_fee: z.string().optional(),
  intro_apr: z.string().optional(),
  joining_fee: z.string().optional(),
  official_page_url: z.string().optional(),
  regular_apr: z.string().optional(),
  signup_bonus: z.string().optional(),
  source: z.string().optional(),
  reward_program_id: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface CreditCardFormProps {
  banks: Bank[];
  onSuccess: () => void;
  onCancel: () => void;
}

export function CreditCardForm({ banks, onSuccess, onCancel }: CreditCardFormProps) {
  const supabase = createClientComponentClient<Database>();
  const [cardTypeSearch, setCardTypeSearch] = useState("");
  const [cardNetworkSearch, setCardNetworkSearch] = useState("");
  const [bankSearch, setBankSearch] = useState("");
  const [isCardTypeOpen, setIsCardTypeOpen] = useState(false);
  const [isCardNetworkOpen, setIsCardNetworkOpen] = useState(false);
  const [isBankOpen, setIsBankOpen] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      card_name: "",
      card_type: "Credit",
      card_network: "Visa",
      annual_fee: "",
      reward_rate: "",
      bank_id: "",
      foreign_transaction_fee: "",
      intro_apr: "",
      joining_fee: "",
      official_page_url: "",
      regular_apr: "",
      signup_bonus: "",
      source: "",
      reward_program_id: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    const transformedValues = {
      ...values,
      annual_fee: values.annual_fee ? parseFloat(values.annual_fee) : null,
      reward_rate: values.reward_rate ? parseFloat(values.reward_rate) : null,
      foreign_transaction_fee: values.foreign_transaction_fee ? parseFloat(values.foreign_transaction_fee) : null,
      joining_fee: values.joining_fee ? parseFloat(values.joining_fee) : null,
    };

    const { error } = await supabase.from("credit_cards").insert([transformedValues]);

    if (error) {
      console.error("Error adding credit card:", error);
      return;
    }

    onSuccess();
  };

  const filteredCardTypes = cardTypes.filter((type) =>
    type.toLowerCase().includes(cardTypeSearch.toLowerCase())
  );

  const filteredCardNetworks = cardNetworks.filter((network) =>
    network.toLowerCase().includes(cardNetworkSearch.toLowerCase())
  );

  const filteredBanks = banks.filter((bank) =>
    bank.bank_name.toLowerCase().includes(bankSearch.toLowerCase())
  );

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    e.stopPropagation();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="card_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Card Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="card_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Card Type</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
                open={isCardTypeOpen}
                onOpenChange={setIsCardTypeOpen}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select card type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="max-h-60 overflow-y-auto">
                  <div className="sticky top-0 z-10 bg-background p-2">
                    <Input
                      placeholder="Search card types..."
                      value={cardTypeSearch}
                      onChange={(e) => {
                        e.stopPropagation();
                        setCardTypeSearch(e.target.value);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      onKeyDown={handleSearchKeyDown}
                      onFocus={(e) => e.target.select()}
                      className="h-8"
                    />
                  </div>
                  {filteredCardTypes.map((type) => (
                    <SelectItem 
                      key={type} 
                      value={type}
                      onPointerDown={(e) => e.preventDefault()}
                    >
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="card_network"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Card Network</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
                open={isCardNetworkOpen}
                onOpenChange={setIsCardNetworkOpen}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select card network" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="max-h-60 overflow-y-auto">
                  <div className="sticky top-0 z-10 bg-background p-2">
                    <Input
                      placeholder="Search networks..."
                      value={cardNetworkSearch}
                      onChange={(e) => {
                        e.stopPropagation();
                        setCardNetworkSearch(e.target.value);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      onKeyDown={handleSearchKeyDown}
                      onFocus={(e) => e.target.select()}
                      className="h-8"
                    />
                  </div>
                  {filteredCardNetworks.map((network) => (
                    <SelectItem 
                      key={network} 
                      value={network}
                      onPointerDown={(e) => e.preventDefault()}
                    >
                      {network}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="annual_fee"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Annual Fee</FormLabel>
              <FormControl>
                <Input type="number" step="0.01" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="reward_rate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Reward Rate (%)</FormLabel>
              <FormControl>
                <Input type="number" step="0.01" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="bank_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bank</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
                open={isBankOpen}
                onOpenChange={setIsBankOpen}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select bank" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="max-h-60 overflow-y-auto">
                  <div className="sticky top-0 z-10 bg-background p-2">
                    <Input
                      placeholder="Search banks..."
                      value={bankSearch}
                      onChange={(e) => {
                        e.stopPropagation();
                        setBankSearch(e.target.value);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      onKeyDown={handleSearchKeyDown}
                      onFocus={(e) => e.target.select()}
                      className="h-8"
                    />
                  </div>
                  {filteredBanks.map((bank) => (
                    <SelectItem 
                      key={bank.id} 
                      value={bank.id}
                      onPointerDown={(e) => e.preventDefault()}
                    >
                      {bank.bank_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="foreign_transaction_fee"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Foreign Transaction Fee</FormLabel>
              <FormControl>
                <Input type="number" step="0.01" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="intro_apr"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Intro APR</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="joining_fee"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Joining Fee</FormLabel>
              <FormControl>
                <Input type="number" step="0.01" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="official_page_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Official Page URL</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="regular_apr"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Regular APR</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="signup_bonus"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Signup Bonus</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="source"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Source</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="reward_program_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Reward Program ID</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">Add Card</Button>
        </div>
      </form>
    </Form>
  );
} 