import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { PlusIcon, Pencil1Icon, TrashIcon } from "@radix-ui/react-icons";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/components/ui/use-toast";

// Define the village schema for form validation
const villageSchema = z.object({
  village_name: z
    .string()
    .min(2, { message: "Village name must be at least 2 characters" }),
  district_name: z
    .string()
    .min(2, { message: "District name must be at least 2 characters" }),
  pincode: z
    .string()
    .regex(/^\d{6}$/, { message: "Pincode must be a 6-digit number" }),
});

type VillageFormValues = z.infer<typeof villageSchema>;

interface Village {
  village_id: number;
  village_name: string;
  district_name: string;
  pincode: string;
}

const VillageManagement = () => {
  const { toast } = useToast();
  const [villages, setVillages] = useState<Village[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch villages from Supabase
  useEffect(() => {
    const fetchVillages = async () => {
      try {
        const { data, error } = await supabase.from("villages").select("*");

        if (error) {
          throw error;
        }

        if (data) {
          setVillages(
            data.map((v) => ({
              village_id: v.village_id,
              village_name: v.village_name,
              district_name: v.district_name,
              pincode: v.pincode,
            })),
          );
        }
      } catch (error) {
        console.error("Error fetching villages:", error);
        toast({
          title: "Error",
          description: "Failed to load villages",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchVillages();
  }, []);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedVillage, setSelectedVillage] = useState<Village | null>(null);

  // Form for adding a new village
  const addForm = useForm<VillageFormValues>({
    resolver: zodResolver(villageSchema),
    defaultValues: {
      village_name: "",
      district_name: "",
      pincode: "",
    },
  });

  // Form for editing an existing village
  const editForm = useForm<VillageFormValues>({
    resolver: zodResolver(villageSchema),
    defaultValues: {
      village_name: "",
      district_name: "",
      pincode: "",
    },
  });

  // Handle adding a new village
  const handleAddVillage = async (data: VillageFormValues) => {
    try {
      const { data: newVillage, error } = await supabase
        .from("villages")
        .insert([
          {
            village_name: data.village_name,
            district_name: data.district_name,
            pincode: data.pincode,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      if (newVillage) {
        setVillages([...villages, newVillage as Village]);
        setIsAddDialogOpen(false);
        addForm.reset();

        toast({
          title: "Village Added",
          description: `${data.village_name} has been added successfully.`,
        });
      }
    } catch (error) {
      console.error("Error adding village:", error);
      toast({
        title: "Error",
        description: "Failed to add village",
        variant: "destructive",
      });
    }
  };

  // Handle editing a village
  const handleEditVillage = async (data: VillageFormValues) => {
    if (!selectedVillage) return;

    try {
      const { error } = await supabase
        .from("villages")
        .update({
          village_name: data.village_name,
          district_name: data.district_name,
          pincode: data.pincode,
        })
        .eq("village_id", selectedVillage.village_id);

      if (error) throw error;

      const updatedVillages = villages.map((village) =>
        village.village_id === selectedVillage.village_id
          ? { ...village, ...data }
          : village,
      );

      setVillages(updatedVillages);
      setIsEditDialogOpen(false);
      setSelectedVillage(null);

      toast({
        title: "Village Updated",
        description: `${data.village_name} has been updated successfully.`,
      });
    } catch (error) {
      console.error("Error updating village:", error);
      toast({
        title: "Error",
        description: "Failed to update village",
        variant: "destructive",
      });
    }
  };

  // Handle deleting a village
  const handleDeleteVillage = async () => {
    if (!selectedVillage) return;

    try {
      const { error } = await supabase
        .from("villages")
        .delete()
        .eq("village_id", selectedVillage.village_id);

      if (error) throw error;

      const updatedVillages = villages.filter(
        (village) => village.village_id !== selectedVillage.village_id,
      );

      setVillages(updatedVillages);
      setIsDeleteDialogOpen(false);

      toast({
        title: "Village Deleted",
        description: `${selectedVillage.village_name} has been deleted successfully.`,
        variant: "destructive",
      });

      setSelectedVillage(null);
    } catch (error) {
      console.error("Error deleting village:", error);
      toast({
        title: "Error",
        description:
          "Failed to delete village. Make sure there are no citizens associated with this village.",
        variant: "destructive",
      });
    }
  };

  // Open edit dialog and populate form with village data
  const openEditDialog = (village: Village) => {
    setSelectedVillage(village);
    editForm.reset({
      village_name: village.village_name,
      district_name: village.district_name,
      pincode: village.pincode,
    });
    setIsEditDialogOpen(true);
  };

  // Open delete confirmation dialog
  const openDeleteDialog = (village: Village) => {
    setSelectedVillage(village);
    setIsDeleteDialogOpen(true);
  };

  return (
    <div className="bg-background p-6 rounded-lg">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            Village/Area Management
          </CardTitle>
          <CardDescription>
            Add, edit, or delete villages and Areas in the Panchayat Management System.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Villages and Areas List</h3>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <PlusIcon className="mr-2 h-4 w-4" /> Add Village or Area
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Village/Area</DialogTitle>
                  <DialogDescription>
                    Fill in the details to add a new village/Area to the system.
                  </DialogDescription>
                </DialogHeader>
                <Form {...addForm}>
                  <form
                    onSubmit={addForm.handleSubmit(handleAddVillage)}
                    className="space-y-4"
                  >
                    <FormField
                      control={addForm.control}
                      name="village_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Village/Area Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter village/Area name"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={addForm.control}
                      name="district_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>District Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter district name"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={addForm.control}
                      name="pincode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Pincode</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter 6-digit pincode"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Pincode must be a 6-digit number.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <DialogFooter>
                      <Button type="submit">Add Village/Area</Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          {isLoading ? (
            <div className="text-center py-10 border rounded-md">
              <p className="text-muted-foreground">Loading villages...</p>
            </div>
          ) : villages.length > 0 ? (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Village/Area Name</TableHead>
                    <TableHead>District</TableHead>
                    <TableHead>Pincode</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {villages.map((village) => (
                    <TableRow key={village.village_id}>
                      <TableCell className="font-medium">
                        {village.village_name}
                      </TableCell>
                      <TableCell>{village.district_name}</TableCell>
                      <TableCell>{village.pincode}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditDialog(village)}
                          >
                            <Pencil1Icon className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-destructive hover:bg-destructive/10"
                            onClick={() => openDeleteDialog(village)}
                          >
                            <TrashIcon className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-10 border rounded-md">
              <p className="text-muted-foreground">
                No villages/Areas found. Add a village/area to get started.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Village Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Village/Area</DialogTitle>
            <DialogDescription>
              Update the details for {selectedVillage?.village_name}.
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form
              onSubmit={editForm.handleSubmit(handleEditVillage)}
              className="space-y-4"
            >
              <FormField
                control={editForm.control}
                name="village_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Village/Area Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter village name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="district_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>District Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter district name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="pincode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pincode</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter 6-digit pincode" {...field} />
                    </FormControl>
                    <FormDescription>
                      Pincode must be a 6-digit number.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit">Update Village/Area</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Village Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will permanently delete the village "
              {selectedVillage?.village_name}" and cannot be undone. All citizen
              records associated with this village/Area may also be affected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteVillage}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default VillageManagement;
