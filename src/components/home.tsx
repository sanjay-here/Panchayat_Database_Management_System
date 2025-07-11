import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import VillageManagement from "./VillageManagement";
import CitizenRegistry from "./CitizenRegistry";
import CitizenTable from "./CitizenTable";

interface Village {
  id: number;
  name: string;
  district: string;
  pincode: string;
}

interface Citizen {
  aadhar_number: string;
  name: string;
  dob: string;
  age: number;
  gender: string;
  address: string;
  marital_status: string;
  father_name: string;
  mother_name: string;
  spouse_name?: string;
  education: string;
  occupation: string;
  village_id: number;
  status: string;
  remarks?: string;
}

const Home = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [editingCitizen, setEditingCitizen] = useState<Citizen | null>(null);
  const [selectedVillage, setSelectedVillage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState("name");

  const [villages, setVillages] = useState<Village[]>([]);
  const [citizens, setCitizens] = useState<Citizen[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch villages and citizens from Supabase
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch villages
        const { data: villagesData, error: villagesError } = await supabase
          .from("villages")
          .select("*");

        if (villagesError) throw villagesError;

        // Fetch citizens
        const { data: citizensData, error: citizensError } = await supabase
          .from("citizens")
          .select("*");

        if (citizensError) throw citizensError;

        if (villagesData) {
          setVillages(
            villagesData.map((v) => ({
              id: v.village_id,
              name: v.village_name,
              district: v.district_name,
              pincode: v.pincode,
            })),
          );
        }

        if (citizensData) {
          setCitizens(citizensData);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    // Set up realtime subscription for villages
    const villagesSubscription = supabase
      .channel("villages-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "villages" },
        () => {
          fetchData();
        },
      )
      .subscribe();

    // Set up realtime subscription for citizens
    const citizensSubscription = supabase
      .channel("citizens-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "citizens" },
        () => {
          fetchData();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(villagesSubscription);
      supabase.removeChannel(citizensSubscription);
    };
  }, []);

  // Filter citizens based on selected village and search query
  const filteredCitizens = citizens.filter((citizen) => {
    const matchesVillage =
      !selectedVillage ||
      selectedVillage === "all" ||
      citizen.village_id === parseInt(selectedVillage);

    if (!searchQuery) return matchesVillage;

    if (searchType === "name") {
      return (
        matchesVillage &&
        citizen.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    } else if (searchType === "aadhar") {
      return matchesVillage && citizen.aadhar_number.includes(searchQuery);
    }

    return matchesVillage;
  });

  // Handlers for adding/updating villages and citizens
  const handleAddVillage = async (village: Omit<Village, "id">) => {
    try {
      const { data, error } = await supabase
        .from("villages")
        .insert([
          {
            village_name: village.name,
            district_name: village.district,
            pincode: village.pincode,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      if (data) {
        const newVillage = {
          id: data.village_id,
          name: data.village_name,
          district: data.district_name,
          pincode: data.pincode,
        };
        setVillages([...villages, newVillage]);
      }
    } catch (error) {
      console.error("Error adding village:", error);
    }
  };

  const handleUpdateVillage = async (updatedVillage: Village) => {
    try {
      const { error } = await supabase
        .from("villages")
        .update({
          village_name: updatedVillage.name,
          district_name: updatedVillage.district,
          pincode: updatedVillage.pincode,
        })
        .eq("village_id", updatedVillage.id);

      if (error) throw error;

      setVillages(
        villages.map((village) =>
          village.id === updatedVillage.id ? updatedVillage : village,
        ),
      );
    } catch (error) {
      console.error("Error updating village:", error);
    }
  };

  const handleDeleteVillage = async (id: number) => {
    try {
      const { error } = await supabase
        .from("villages")
        .delete()
        .eq("village_id", id);

      if (error) throw error;

      setVillages(villages.filter((village) => village.id !== id));
      // Citizens will be automatically removed due to CASCADE delete in the database
      setCitizens(citizens.filter((citizen) => citizen.village_id !== id));
    } catch (error) {
      console.error("Error deleting village:", error);
    }
  };

  const handleAddCitizen = async (citizen: Citizen) => {
    try {
      // Ensure village_id is a number
      if (typeof citizen.village_id === "string") {
        citizen.village_id = parseInt(citizen.village_id as unknown as string);
      }

      const { error } = await supabase.from("citizens").insert([citizen]);

      if (error) throw error;

      setCitizens([...citizens, citizen]);
    } catch (error) {
      console.error("Error adding citizen:", error);
    }
  };

  const handleUpdateCitizen = async (updatedCitizen: Citizen) => {
    try {
      // Ensure village_id is a number
      if (typeof updatedCitizen.village_id === "string") {
        updatedCitizen.village_id = parseInt(
          updatedCitizen.village_id as unknown as string,
        );
      }

      const { error } = await supabase
        .from("citizens")
        .update(updatedCitizen)
        .eq("aadhar_number", updatedCitizen.aadhar_number);

      if (error) throw error;

      setCitizens(
        citizens.map((citizen) =>
          citizen.aadhar_number === updatedCitizen.aadhar_number
            ? updatedCitizen
            : citizen,
        ),
      );

      // Switch to citizens tab after update
      setActiveTab("citizens");
    } catch (error) {
      console.error("Error updating citizen:", error);
    }
  };

  const handleDeleteCitizen = async (aadhar: string) => {
    try {
      const { error } = await supabase
        .from("citizens")
        .delete()
        .eq("aadhar_number", aadhar);

      if (error) throw error;

      setCitizens(
        citizens.filter((citizen) => citizen.aadhar_number !== aadhar),
      );
    } catch (error) {
      console.error("Error deleting citizen:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <h1 className="text-2xl font-bold text-gray-900">
              Santhapuram Panchayat Database Management System
            </h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                Welcome, {localStorage.getItem("adminUsername") || "Admin"}
              </span>
              <Button
                variant="outline"
                onClick={() => {
                  localStorage.removeItem("isAuthenticated");
                  localStorage.removeItem("adminId");
                  localStorage.removeItem("adminUsername");
                  window.location.href = "/login";
                }}
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Total Villages/Areas</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold">{villages.length}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Total Citizens</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold">{citizens.length}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Average Age</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold">
                    {citizens.length > 0
                      ? Math.round(
                          citizens.reduce(
                            (sum, citizen) => sum + citizen.age,
                            0,
                          ) / citizens.length,
                        )
                      : 0}
                  </p>
                </CardContent>
              </Card>
            </div>
          <br></br>
          <div className="flex justify-between items-center mb-6">
            <TabsList>
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="villages">Villages/Areas</TabsTrigger>
              <TabsTrigger value="citizens">New Citizen</TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="dashboard" className="space-y-6">
            <Card className="bg-white">
              <CardHeader>
                <CardTitle>Dashboard</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="w-full md:w-1/3">
                      <Select
                        value={selectedVillage || "all"}
                        onValueChange={setSelectedVillage}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Village" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Villages and Areas</SelectItem>
                          {villages.map((village) => (
                            <SelectItem
                              key={village.id}
                              value={village.id.toString()}
                            >
                              {village.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                  </div>

                  <CitizenTable
                    citizens={filteredCitizens}
                    villages={villages.map((v) => ({
                      village_id: v.id.toString(),
                      village_name: v.name,
                    }))}
                    onEdit={(citizen) => {
                      // Set the selected citizen for editing and switch to citizens tab
                      const citizenToEdit = {
                        ...citizen,
                        village_id: citizen.village_id?.toString() || "",
                      };
                      setEditingCitizen(citizenToEdit);
                      setActiveTab("citizens");
                    }}
                    onDelete={handleDeleteCitizen}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="villages">
            <VillageManagement
              villages={villages}
              onAdd={handleAddVillage}
              onUpdate={handleUpdateVillage}
              onDelete={handleDeleteVillage}
            />
          </TabsContent>

          <TabsContent value="citizens" data-tab-content="citizens">
            <CitizenRegistry
              villages={villages.map((v) => ({
                village_id: v.id.toString(),
                village_name: v.name,
              }))}
              citizens={citizens}
              onAdd={handleAddCitizen}
              onUpdate={handleUpdateCitizen}
              onDelete={handleDeleteCitizen}
              initialData={editingCitizen || {}}
            />
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">
                Panchayat Management System
              </h3>
              <p className="text-gray-300">
                A comprehensive solution for managing citizen data
                for local governance.
              </p>
              <br></br>
              <p>Thanks to</p>
              <img
                src="src/SRM_logo.jpg"
                alt="Panchayat Logo"
                className="w-40 h-auto mb-0"
              />
            </div>
           <div>
              <h3 className="text-lg font-semibold mb-4">Developer</h3>
              <ul className="space-y-2 text-gray-300">
                <li>
                  Developed by <span className="font-medium text-white">Sanjay A (RA2311008020159). <br></br> Student of SRMist Ramapuram, Chennai</span>
                </li>
                <li>
                  <a
                    href="https://www.linkedin.com/in/sanjay-a-749a90223/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-white"
                  >
                    LinkedIn Profile
                  </a>
                </li>
                <li>
                  <a
                    href="mailto:sanjay2407san@gmail.com"
                    className="hover:text-white"
                  >
                    sanjay2407san@gmail.com
                  </a>
                </li>
                <li>
                  <span>+91 9943034411</span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact</h3>
              <address className="not-italic text-gray-300">
                <p>Santhapuram Panchayat</p>
                <p>Phone: +91-9965879553</p>
              </address>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-6 text-center text-gray-400">
            <p>
              © {new Date().getFullYear()} Santhapuram Panchayat Database Management System. All
              rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
