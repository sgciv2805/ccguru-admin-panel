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
import { Plus, Settings, Loader2, CreditCard as CreditCardIcon, Filter, Banknote, Layers, Search, Trash2, Edit2, MoreVertical } from "lucide-react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../src/components/ui/dropdown-menu";
import { SearchableSelect } from "../../src/components/ui/searchable-select";

type CreditCard = Database["public"]["Tables"]["credit_cards"]["Row"];
type Bank = Database["public"]["Tables"]["banks"]["Row"];

const cardTypes = ["Travel", "Cashback", "Business", "Student", "Secured", "Other"];
const cardNetworks = ["Visa", "Mastercard", "American Express", "Discover", "Other"];

export default function CreditCardsPage() {
  const [creditCards, setCreditCards] = useState<CreditCard[]>([]);
  const [banks, setBanks] = useState<Bank[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState<CreditCard | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedNetwork, setSelectedNetwork] = useState<string>("all");
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
    setLoading(true);
    Promise.all([fetchCreditCards(), fetchBanks()]).finally(() => setLoading(false));
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

  const handleDialogClose = () => {
    setIsEditDialogOpen(false);
    setIsDeleteDialogOpen(false);
    setIsAddDialogOpen(false);
    setSelectedCard(null);
    setTimeout(() => {
      document.body.style.overflow = '';
      document.body.style.pointerEvents = '';
    }, 0);
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
    const matchesType = selectedType === "all" || card.card_type === selectedType;
    const matchesNetwork = selectedNetwork === "all" || card.card_network === selectedNetwork;
    const matchesBank = selectedBank === "all" || card.bank_id === selectedBank;
    return matchesSearch && matchesType && matchesNetwork && matchesBank;
  });

  const handleEditClick = (card: CreditCard) => {
    setSelectedCard(card);
    setIsEditDialogOpen(true);
  };

  const handleDelete = (card: CreditCard) => {
    setSelectedCard(card);
    setIsDeleteDialogOpen(true);
  };

  const cardTypeOptions = [
    { label: "All Types", value: "all", icon: <Layers className="w-4 h-4 text-purple-500" /> },
    ...cardTypes.map(type => ({
      label: type,
      value: type,
      icon: <Layers className="w-4 h-4 text-purple-500" />
    }))
  ];

  const cardNetworkOptions = [
    { label: "All Networks", value: "all", icon: <CreditCardIcon className="w-4 h-4 text-blue-500" /> },
    ...cardNetworks.map(network => ({
      label: network,
      value: network,
      icon: <CreditCardIcon className="w-4 h-4 text-blue-500" />
    }))
  ];

  const bankOptions = [
    { label: "All Banks", value: "all", icon: <Banknote className="w-4 h-4 text-emerald-500" /> },
    ...banks.map(bank => ({
      label: bank.bank_name,
      value: bank.id,
      icon: <Banknote className="w-4 h-4 text-emerald-500" />
    }))
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 pb-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="rounded-2xl shadow-md bg-gradient-to-r from-blue-600 via-purple-600 to-fuchsia-600 p-8 mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <CreditCardIcon className="w-8 h-8 text-white drop-shadow" />
              Credit Cards
            </h1>
            <p className="text-white/80 mt-2">Manage all credit cards in your system</p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
            if (!open) handleDialogClose();
          }}>
            <DialogTrigger asChild>
              <Button 
                onClick={() => setIsAddDialogOpen(true)}
                className="bg-white text-blue-700 font-semibold shadow-lg hover:scale-[1.03] transition-all flex items-center gap-2 px-6 py-3 rounded-xl"
              >
                <Plus className="mr-2 h-5 w-5 text-blue-700" />
                Add Card
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-full sm:max-w-2xl w-full max-h-[90vh] sm:max-h-[80vh] overflow-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-blue-700">
                  <CreditCardIcon className="w-5 h-5" /> Add Credit Card
                </DialogTitle>
              </DialogHeader>
              <CreditCardForm
                banks={banks}
                onSuccess={handleAddSuccess}
                onCancel={() => setIsAddDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-700">
              <Filter className="w-5 h-5" /> Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Input
                  placeholder="Search cards..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400" />
              </div>
              <SearchableSelect
                options={cardTypeOptions}
                value={selectedType}
                onValueChange={setSelectedType}
                placeholder="Card Type"
                searchPlaceholder="Search card types..."
              />
              <SearchableSelect
                options={cardNetworkOptions}
                value={selectedNetwork}
                onValueChange={setSelectedNetwork}
                placeholder="Card Network"
                searchPlaceholder="Search card networks..."
              />
              <SearchableSelect
                options={bankOptions}
                value={selectedBank}
                onValueChange={setSelectedBank}
                placeholder="Bank"
                searchPlaceholder="Search banks..."
              />
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-blue-700 flex items-center gap-2">
              <CreditCardIcon className="w-5 h-5" /> Card List
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse h-12 bg-slate-200/60 rounded-xl" />
                ))}
              </div>
            ) : filteredCards.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <CreditCardIcon className="w-12 h-12 text-blue-200 mb-4" />
                <p className="text-lg text-muted-foreground">No credit cards found.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-blue-50">
                    <TableHead>Card Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Network</TableHead>
                    <TableHead>Bank</TableHead>
                    <TableHead>Annual Fee</TableHead>
                    <TableHead>Reward Rate</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCards.map((card) => (
                    <TableRow
                      key={card.id}
                      className="transition-all duration-200 hover:bg-blue-50/80 group"
                    >
                      <TableCell className="flex items-center gap-2 font-semibold">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                          <CreditCardIcon className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{card.card_name}</div>
                          <div className="text-xs text-gray-500">{card.card_network}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {card.card_type}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {card.card_network === "Visa" && (
                            <span className="text-blue-600 font-semibold">Visa</span>
                          )}
                          {card.card_network === "Mastercard" && (
                            <span className="text-orange-600 font-semibold">Mastercard</span>
                          )}
                          {card.card_network === "American Express" && (
                            <span className="text-green-600 font-semibold">Amex</span>
                          )}
                          {card.card_network === "Discover" && (
                            <span className="text-red-600 font-semibold">Discover</span>
                          )}
                          {card.card_network === "RuPay" && (
                            <span className="text-indigo-600 font-semibold">RuPay</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Banknote className="w-4 h-4 text-emerald-500" />
                          <span>{banks.find((b) => b.id === card.bank_id)?.bank_name || "-"}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {card.annual_fee !== null ? (
                          <span className="font-medium text-gray-900">₹{card.annual_fee}</span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {card.reward_rate !== null ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {card.reward_rate}%
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              className="h-8 w-8 p-0 hover:bg-gray-100"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-[160px]">
                            <DropdownMenuItem
                              onSelect={() => handleEditClick(card)}
                              className="cursor-pointer"
                            >
                              <Edit2 className="mr-2 h-4 w-4 text-blue-500" />
                              <span>Edit Card</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onSelect={() => handleDelete(card)}
                              className="cursor-pointer text-red-600 focus:text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              <span>Delete Card</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
      {selectedCard && (
        <>
          <Dialog 
            open={isEditDialogOpen} 
            onOpenChange={(open) => {
              if (!open) handleDialogClose();
            }}
          >
            <DialogContent className="max-w-full sm:max-w-2xl w-full max-h-[90vh] sm:max-h-[80vh] overflow-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-blue-700">
                  <CreditCardIcon className="w-5 h-5" /> Edit Credit Card
                </DialogTitle>
              </DialogHeader>
              {selectedCard && (
                <EditCreditCardForm
                  card={selectedCard}
                  banks={banks}
                  onSuccess={handleEditSuccess}
                  onCancel={handleDialogClose}
                />
              )}
            </DialogContent>
          </Dialog>

          <DeleteCreditCardDialog
            creditCard={selectedCard}
            isOpen={isDeleteDialogOpen}
            onClose={handleDialogClose}
            onSuccess={handleDeleteSuccess}
          />
        </>
      )}
    </div>
  );
} 