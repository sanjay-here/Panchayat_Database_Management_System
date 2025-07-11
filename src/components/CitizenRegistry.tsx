import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Check, Save, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "@/components/ui/use-toast";

// Define the form schema with Zod
const citizenFormSchema = z.object({
  aadhar_number: z
    .string()
    .length(12, { message: "Aadhar number must be exactly 12 digits" })
    .regex(/^\d+$/, { message: "Aadhar number must contain only digits" }),
  village_id: z.string({ required_error: "Please select a village" }),
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  dob: z.string(),
  age: z.string().regex(/^\d+$/, { message: "Age must be a number" }),
  gender: z.enum(["male", "female", "other"]),
  address: z
    .string()
    .min(5, { message: "Address must be at least 5 characters" }),
  marital_status: z.enum(["single", "married", "divorced", "widowed"]),
  father_name: z
    .string()
    .min(2, { message: "Father's name must be at least 2 characters" }),
  mother_name: z
    .string()
    .min(2, { message: "Mother's name must be at least 2 characters" }),
  spouse_name: z.string().optional(),
  status: z.enum(["alive", "dead"]),
  education: z.string(),
  occupation: z.string(),
  remarks: z.string().optional(),
});

type CitizenFormValues = z.infer<typeof citizenFormSchema>;

interface Village {
  village_id: string;
  village_name: string;
}

interface CitizenRegistryProps {
  villages?: Village[];
  onSave?: (data: CitizenFormValues) => void;
  onCancel?: () => void;
  initialData?: Partial<CitizenFormValues>;
  onUpdate?: (data: any) => void;
  onAdd?: (data: any) => void;
  citizens?: any[];
  onDelete?: (aadharNumber: string) => void;
}

const CitizenRegistry: React.FC<CitizenRegistryProps> = ({
  villages = [],
  onSave,
  onCancel,
  initialData = {},
  onUpdate,
  onAdd,
  citizens = [],
  onDelete,
}) => {
  // Add data attribute for easier DOM selection
  React.useEffect(() => {
    const element = document.querySelector(".citizen-registry-container");
    if (element) {
      element.setAttribute("data-citizen-registry", "true");
    }
  }, []);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("personal");

  const defaultValues: Partial<CitizenFormValues> = {
    aadhar_number: "",
    village_id: "",
    name: "",
    dob: "",
    age: "",
    gender: "male",
    address: "",
    marital_status: "single",
    father_name: "",
    mother_name: "",
    spouse_name: "",
    status: "alive",
    education: "",
    occupation: "",
    remarks: "",
    ...initialData,
  };

  // Convert village_id to string if it's a number
  if (typeof defaultValues.village_id === "number") {
    defaultValues.village_id = defaultValues.village_id.toString();
  }

  const form = useForm<CitizenFormValues>({
    resolver: zodResolver(citizenFormSchema),
    defaultValues,
    mode: "onChange",
  });

  const handleSubmit = async (data: CitizenFormValues) => {
    try {
      setIsSubmitting(true);
      setError(null);

      // Convert form data to citizen object
      const citizenData = {
        aadhar_number: data.aadhar_number,
        name: data.name,
        dob: data.dob,
        age: parseInt(data.age),
        gender: data.gender,
        address: data.address,
        marital_status: data.marital_status,
        father_name: data.father_name,
        mother_name: data.mother_name,
        spouse_name: data.spouse_name || null,
        status: data.status,
        education: data.education,
        occupation: data.occupation,
        remarks: data.remarks || null,
        village_id: parseInt(data.village_id),
      };

      if (initialData.aadhar_number) {
        // Update existing citizen
        const { error } = await supabase
          .from("citizens")
          .update(citizenData)
          .eq("aadhar_number", initialData.aadhar_number);

        if (error) throw new Error(error.message);

        if (onUpdate) {
          onUpdate(citizenData);
        }

        toast({
          title: "Success",
          description: "Citizen record has been updated successfully.",
          variant: "default",
        });
      } else {
        // Add new citizen
        const { error } = await supabase.from("citizens").insert([citizenData]);

        if (error) throw new Error(error.message);

        if (onAdd) {
          onAdd(citizenData);
        }

        toast({
          title: "Success",
          description: "Citizen record has been added successfully.",
          variant: "default",
        });

        // Reset the form
        form.reset(defaultValues);
      }

      // Call the onSave prop with the form data if provided
      if (onSave) {
        await onSave(data);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred while saving the citizen record.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="citizen-registry-container bg-background p-6 rounded-lg shadow-sm w-full max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            {initialData.aadhar_number
              ? "Edit Citizen Record"
              : "New Citizen Registration"}
          </CardTitle>
          <CardDescription>
            Enter citizen details for the village/Area registry. All fields marked
            with * are required.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-6"
            >
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="grid grid-cols-3 mb-6">
                  <TabsTrigger value="personal">
                    Personal Information
                  </TabsTrigger>
                  <TabsTrigger value="family">Family Details</TabsTrigger>
                  <TabsTrigger value="socioeconomic">
                    Socioeconomic Data
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="personal" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="aadhar_number"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Aadhar Number *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter 12-digit Aadhar number"
                              {...field}
                              disabled={!!initialData.aadhar_number}
                              maxLength={12}
                            />
                          </FormControl>
                          <FormDescription>
                            Must be exactly 12 digits
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="village_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Village/Area *</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a village" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {villages && villages.length > 0 ? (
                                villages.map((village) => (
                                  <SelectItem
                                    key={village.village_id}
                                    value={village.village_id}
                                  >
                                    {village.village_name}
                                  </SelectItem>
                                ))
                              ) : (
                                <SelectItem value="1">
                                  Default Village
                                </SelectItem>
                              )}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter full name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="dob"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date of Birth *</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="age"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Age *</FormLabel>
                          <FormControl>
                            <Input placeholder="Age" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="gender"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel>Gender *</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="flex space-x-4"
                            >
                              <FormItem className="flex items-center space-x-2">
                                <FormControl>
                                  <RadioGroupItem value="male" />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  Male
                                </FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center space-x-2">
                                <FormControl>
                                  <RadioGroupItem value="female" />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  Female
                                </FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center space-x-2">
                                <FormControl>
                                  <RadioGroupItem value="other" />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  Other
                                </FormLabel>
                              </FormItem>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter full address" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="marital_status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Marital Status *</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select marital status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="single">Single</SelectItem>
                            <SelectItem value="married">Married</SelectItem>
                            <SelectItem value="divorced">Divorced</SelectItem>
                            <SelectItem value="widowed">Widowed</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>

                <TabsContent value="family" className="space-y-4">
                  <FormField
                    control={form.control}
                    name="father_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Father's Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter father's name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="mother_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mother's Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter mother's name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="spouse_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Spouse/Husband's Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter spouse's name (if applicable)"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Leave blank if not applicable
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status *</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="alive">Alive</SelectItem>
                            <SelectItem value="dead">Passed Away</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>

                <TabsContent value="socioeconomic" className="space-y-4">
                  <FormField
                    control={form.control}
                    name="education"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Education *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Highest education qualification"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="occupation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Occupation *</FormLabel>
                        <FormControl>
                          <Input placeholder="Current occupation" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="remarks"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Remarks/Notes</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Any additional notes or remarks"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Optional field for additional information
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>
              </Tabs>

              <Separator className="my-4" />

              <div className="flex justify-between space-x-2">
                <div>
                  {onCancel && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={onCancel}
                      disabled={isSubmitting}
                    >
                      <X className="mr-2 h-4 w-4" /> Cancel
                    </Button>
                  )}
                </div>
                <div className="flex space-x-2">
                  {activeTab === "personal" && (
                    <Button
                      type="button"
                      onClick={() => setActiveTab("family")}
                    >
                      Next: Family Details
                    </Button>
                  )}
                  {activeTab === "family" && (
                    <>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setActiveTab("personal")}
                      >
                        Back
                      </Button>
                      <Button
                        type="button"
                        onClick={() => setActiveTab("socioeconomic")}
                      >
                        Next: Socioeconomic Data
                      </Button>
                    </>
                  )}
                  {activeTab === "socioeconomic" && (
                    <>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setActiveTab("family")}
                      >
                        Back
                      </Button>
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? (
                          <span className="flex items-center">
                            <svg
                              className="animate-spin -ml-1 mr-3 h-4 w-4 text-white"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                            Saving...
                          </span>
                        ) : initialData.aadhar_number ? (
                          <span className="flex items-center">
                            <Save className="mr-2 h-4 w-4" /> Update Citizen
                          </span>
                        ) : (
                          <span className="flex items-center">
                            <Check className="mr-2 h-4 w-4" /> Register Citizen
                          </span>
                        )}
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CitizenRegistry;
