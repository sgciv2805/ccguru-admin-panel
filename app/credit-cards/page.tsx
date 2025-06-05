"use client";

import { useEffect, useState, useCallback } from "react";
import { Database } from "@/types/supabase";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { CreditCardForm } from "./components/CreditCardForm";
import { EditCreditCardForm } from "./components/EditCreditCardForm";
import { DeleteCreditCardDialog } from "./components/DeleteCreditCardDialog";
import { Plus, Settings } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CardSettingsDialog } from "@/components/credit-cards/CardSettingsDialog";

type CreditCard = Database["public"]["Tables"]["credit_cards"]["Row"];
type Bank = Database["public"]["Tables"]["banks"]["Row"];

const cardTypes = ["Credit", "Charge", "Debit"] as const;
const cardNetworks = ["Visa", "Mastercard", "American Express", "Discover", "RuPay"] as const;

export default function CreditCardsPage() {
  const [creditCards, setCreditCards] = useState<CreditCard[]>([]);
  const [banks, setBanks] = useState<Bank[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState<CreditCard | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCardType, setSelectedCardType] = useState<string>("all");
  const [selectedCardNetwork, setSelectedCardNetwork] = useState<string>("all");
  const [selectedBank, setSelectedBank] = useState<string>("all");
  const [cardTypeSearch, setCardTypeSearch] = useState("");
  const [cardNetworkSearch, setCardNetworkSearch] = useState("");
  const [bankSearch, setBankSearch] = useState("");
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);
  const supabase = createClientComponentClient<Database>();

  const fetchCreditCards = useCallback(async () => {
    const { data, error } = await supabase
      .from("credit_cards")
      .select("*")
      .order("card_name");

    if (error) {
      console.error("Error fetching credit cards:", error);
      toast.error("Failed to fetch credit cards");
      return;
    }

    setCreditCards(data || []);
  }, [supabase, toast]);

  const fetchBanks = useCallback(async () => {
    const { data, error } = await supabase
      .from("banks")
      .select("*")
      .order("bank_name");

    if (error) {
      console.error("Error fetching banks:", error);
      toast.error("Failed to fetch banks");
      return;
    }

    setBanks(data || []);
  }, [supabase, toast]);

  useEffect(() => {
    fetchCreditCards();
    fetchBanks();
  }, [fetchCreditCards, fetchBanks]);

  const handleAddSuccess = () => {
    setIsAddDialogOpen(false);
    fetchCreditCards();
    toast.success("Credit card added successfully");
  };

  const handleEditSuccess = () => {
    setIsEditDialogOpen(false);
    setSelectedCard(null);
    fetchCreditCards();
    toast.success("Credit card updated successfully");
  };

  const handleDeleteSuccess = () => {
    setIsDeleteDialogOpen(false);
    setSelectedCard(null);
    fetchCreditCards();
    toast.success("Credit card deleted successfully");
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    e.stopPropagation();
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

  const filteredCards = creditCards.filter((card) => {
    const matchesSearch = card.card_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCardType = selectedCardType === "all" || card.card_type === selectedCardType;
    const matchesCardNetwork = selectedCardNetwork === "all" || card.card_network === selectedCardNetwork;
    const matchesBank = selectedBank === "all" || card.bank_id === selectedBank;
    return matchesSearch && matchesCardType && matchesCardNetwork && matchesBank;
  });

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Credit Cards</h1>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Card
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-full sm:max-w-2xl w-full max-h-[90vh] sm:max-h-[80vh] overflow-auto">
            <DialogHeader>
              <DialogTitle>Add Credit Card</DialogTitle>
            </DialogHeader>
            <CreditCardForm
              banks={banks}
              onSuccess={handleAddSuccess}
              onCancel={() => setIsAddDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Input
                placeholder="Search cards..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div>
              <Select value={selectedCardType} onValueChange={setSelectedCardType}>
                <SelectTrigger>
                  <SelectValue placeholder="Card Type" />
                </SelectTrigger>
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
                  <SelectItem value="all">All Types</SelectItem>
                  {filteredCardTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select value={selectedCardNetwork} onValueChange={setSelectedCardNetwork}>
                <SelectTrigger>
                  <SelectValue placeholder="Card Network" />
                </SelectTrigger>
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
                  <SelectItem value="all">All Networks</SelectItem>
                  {filteredCardNetworks.map((network) => (
                    <SelectItem key={network} value={network}>
                      {network}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select value={selectedBank} onValueChange={setSelectedBank}>
                <SelectTrigger>
                  <SelectValue placeholder="Bank" />
                </SelectTrigger>
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
                  <SelectItem value="all">All Banks</SelectItem>
                  {filteredBanks.map((bank) => (
                    <SelectItem key={bank.id} value={bank.id}>
                      {bank.bank_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Card Name
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Network
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Annual Fee
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Reward Rate
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Bank
              </th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Edit</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredCards.map((card) => (
              <tr key={card.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {card.card_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {card.card_type}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {card.card_network}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {card.annual_fee ? `$${card.annual_fee}` : "N/A"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {card.reward_rate ? `${card.reward_rate}%` : "N/A"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {banks.find((b) => b.id === card.bank_id)?.bank_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedCard(card);
                      setIsEditDialogOpen(true);
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      setSelectedCard(card);
                      setIsDeleteDialogOpen(true);
                    }}
                  >
                    Delete
                  </Button>
                  <CardSettingsDialog
                    card={card}
                    open={selectedCard?.id === card.id && isSettingsDialogOpen}
                    onOpenChange={(open) => {
                      setSelectedCard(open ? card : null);
                      setIsSettingsDialogOpen(open);
                    }}
                  >
                    <Button variant="outline" aria-label="Settings">
                      <Settings className="w-5 h-5 mr-2" />
                      Settings
                    </Button>
                  </CardSettingsDialog>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedCard && (
        <>
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="max-w-full sm:max-w-2xl w-full max-h-[90vh] sm:max-h-[80vh] overflow-auto">
              <DialogHeader>
                <DialogTitle>Edit Credit Card</DialogTitle>
              </DialogHeader>
              <EditCreditCardForm
                creditCard={selectedCard}
                banks={banks}
                onSuccess={handleEditSuccess}
                onCancel={() => {
                  setIsEditDialogOpen(false);
                  setSelectedCard(null);
                }}
              />
            </DialogContent>
          </Dialog>

          <DeleteCreditCardDialog
            creditCard={selectedCard}
            isOpen={isDeleteDialogOpen}
            onClose={() => {
              setIsDeleteDialogOpen(false);
              setSelectedCard(null);
            }}
            onSuccess={handleDeleteSuccess}
          />
        </>
      )}
    </div>
  );
} 