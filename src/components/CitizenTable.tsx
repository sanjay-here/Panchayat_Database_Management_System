import React, { useState } from "react";
import {
  Search,
  Edit,
  Trash2,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface Citizen {
  aadhar_number: string;
  name: string;
  age: number;
  gender: string;
  village_id: number;
  address: string;
  marital_status: string;
  father_name?: string;
  mother_name?: string;
  spouse_name?: string;
  education?: string;
  occupation?: string;
  dob?: string | Date;
  status?: string;
  remarks?: string;
}

interface CitizenTableProps {
  citizens?: Citizen[];
  onEdit?: (citizen: Citizen) => void;
  onDelete?: (aadharNumber: string) => void;
  villageName?: string;
  villages?: { village_id: string; village_name: string }[];
}

const CitizenTable: React.FC<CitizenTableProps> = ({
  citizens = [],
  onEdit = () => {},
  onDelete = () => {},
  villageName = "All Villages",
  villages = [],
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchType, setSearchType] = useState<"name" | "aadhar">("name");
  const [sortField, setSortField] = useState<"name" | "aadhar_number" | "age">(
    "name",
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const itemsPerPage = 10;

  // Filter citizens based on search term
  const filteredCitizens = citizens.filter((citizen) => {
    if (searchTerm === "") return true;

    if (searchType === "name") {
      return citizen.name.toLowerCase().includes(searchTerm.toLowerCase());
    } else {
      return citizen.aadhar_number.includes(searchTerm);
    }
  });

  // Sort the filtered citizens
  const sortedCitizens = [...filteredCitizens].sort((a, b) => {
    if (sortField === "name") {
      return sortOrder === "asc"
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name);
    } else if (sortField === "aadhar_number") {
      return sortOrder === "asc"
        ? a.aadhar_number.localeCompare(b.aadhar_number)
        : b.aadhar_number.localeCompare(a.aadhar_number);
    } else if (sortField === "age") {
      return sortOrder === "asc" ? a.age - b.age : b.age - a.age;
    }
    return 0;
  });

  // Calculate pagination
  const totalPages = Math.ceil(sortedCitizens.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCitizens = sortedCitizens.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push("ellipsis");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push("ellipsis");
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push("ellipsis");
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push("ellipsis");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  return (
    <div className="w-full bg-white rounded-lg shadow-md p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-gray-800">
            Citizen Registry
          </h2>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder={`Search by ${searchType === "name" ? "name" : "Aadhar number"}`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="flex gap-2">
            <Button
              variant={searchType === "name" ? "default" : "outline"}
              onClick={() => setSearchType("name")}
              size="sm"
            >
              By Name
            </Button>
            <Button
              variant={searchType === "aadhar" ? "default" : "outline"}
              onClick={() => setSearchType("aadhar")}
              size="sm"
            >
              By Aadhar
            </Button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-10 border rounded-lg">
          <p className="text-gray-500">Loading citizens...</p>
        </div>
      ) : filteredCitizens.length > 0 ? (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[180px]">
                  <div
                    className="flex items-center gap-1 cursor-pointer"
                    onClick={() => {
                      if (sortField === "name") {
                        setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                      } else {
                        setSortField("name");
                        setSortOrder("asc");
                      }
                    }}
                  >
                    Name
                    {sortField === "name" ? (
                      sortOrder === "asc" ? (
                        <ArrowUp className="h-4 w-4" />
                      ) : (
                        <ArrowDown className="h-4 w-4" />
                      )
                    ) : (
                      <ArrowUpDown className="h-4 w-4 opacity-50" />
                    )}
                  </div>
                </TableHead>
                <TableHead>
                  <div
                    className="flex items-center gap-1 cursor-pointer"
                    onClick={() => {
                      if (sortField === "aadhar_number") {
                        setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                      } else {
                        setSortField("aadhar_number");
                        setSortOrder("asc");
                      }
                    }}
                  >
                    Aadhar Number
                    {sortField === "aadhar_number" ? (
                      sortOrder === "asc" ? (
                        <ArrowUp className="h-4 w-4" />
                      ) : (
                        <ArrowDown className="h-4 w-4" />
                      )
                    ) : (
                      <ArrowUpDown className="h-4 w-4 opacity-50" />
                    )}
                  </div>
                </TableHead>
                <TableHead>
                  <div
                    className="flex items-center gap-1 cursor-pointer"
                    onClick={() => {
                      if (sortField === "age") {
                        setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                      } else {
                        setSortField("age");
                        setSortOrder("asc");
                      }
                    }}
                  >
                    Age
                    {sortField === "age" ? (
                      sortOrder === "asc" ? (
                        <ArrowUp className="h-4 w-4" />
                      ) : (
                        <ArrowDown className="h-4 w-4" />
                      )
                    ) : (
                      <ArrowUpDown className="h-4 w-4 opacity-50" />
                    )}
                  </div>
                </TableHead>
                <TableHead>Gender</TableHead>
                <TableHead>Occupation</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedCitizens.map((citizen) => (
                <TableRow key={citizen.aadhar_number}>
                  <TableCell className="font-medium">{citizen.name}</TableCell>
                  <TableCell>{citizen.aadhar_number}</TableCell>
                  <TableCell>{citizen.age}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        citizen.gender === "Male"
                          ? "bg-blue-50 text-blue-700 border-blue-200"
                          : "bg-pink-50 text-pink-700 border-pink-200"
                      }
                    >
                      {citizen.gender}
                    </Badge>
                  </TableCell>
                  <TableCell>{citizen.occupation || "Not specified"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Citizen Details</DialogTitle>
                            <DialogDescription>
                              Complete information for {citizen.name}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                            <div className="space-y-2">
                              <h3 className="font-medium text-sm">
                                Personal Information
                              </h3>
                              <div className="grid grid-cols-2 gap-2">
                                <div className="text-sm font-medium">Name:</div>
                                <div className="text-sm">{citizen.name}</div>
                                <div className="text-sm font-medium">
                                  Aadhar Number:
                                </div>
                                <div className="text-sm">
                                  {citizen.aadhar_number}
                                </div>
                                <div className="text-sm font-medium">
                                  Date of Birth:
                                </div>
                                <div className="text-sm">
                                  {citizen.dob
                                    ? new Date(citizen.dob).toLocaleDateString()
                                    : "Not provided"}
                                </div>
                                <div className="text-sm font-medium">Age:</div>
                                <div className="text-sm">{citizen.age}</div>
                                <div className="text-sm font-medium">
                                  Gender:
                                </div>
                                <div className="text-sm">{citizen.gender}</div>
                                <div className="text-sm font-medium">
                                  Address:
                                </div>
                                <div className="text-sm">{citizen.address}</div>
                                <div className="text-sm font-medium">
                                  Marital Status:
                                </div>
                                <div className="text-sm">
                                  {citizen.marital_status}
                                </div>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <h3 className="font-medium text-sm">
                                Family Information
                              </h3>
                              <div className="grid grid-cols-2 gap-2">
                                <div className="text-sm font-medium">
                                  Father's Name:
                                </div>
                                <div className="text-sm">
                                  {citizen.father_name || "Not provided"}
                                </div>
                                <div className="text-sm font-medium">
                                  Mother's Name:
                                </div>
                                <div className="text-sm">
                                  {citizen.mother_name || "Not provided"}
                                </div>
                                <div className="text-sm font-medium">
                                  Spouse's Name:
                                </div>
                                <div className="text-sm">
                                  {citizen.spouse_name || "Not provided"}
                                </div>
                              </div>
                              <h3 className="font-medium text-sm mt-4">
                                Socioeconomic Information
                              </h3>
                              <div className="grid grid-cols-2 gap-2">
                                <div className="text-sm font-medium">
                                  Education:
                                </div>
                                <div className="text-sm">
                                  {citizen.education || "Not provided"}
                                </div>
                                <div className="text-sm font-medium">
                                  Occupation:
                                </div>
                                <div className="text-sm">
                                  {citizen.occupation || "Not provided"}
                                </div>
                                <div className="text-sm font-medium">
                                  Status:
                                </div>
                                <div className="text-sm">
                                  {citizen.status || "Alive"}
                                </div>
                                {citizen.remarks && (
                                  <>
                                    <div className="text-sm font-medium">
                                      Remarks:
                                    </div>
                                    <div className="text-sm">
                                      {citizen.remarks}
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(citizen)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Confirm Deletion
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete the record for{" "}
                              {citizen.name}? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => onDelete(citizen.aadhar_number)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center py-10 border rounded-lg">
          <p className="text-gray-500">
            No citizens found matching your search criteria.
          </p>
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-6">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  className={
                    currentPage === 1 ? "pointer-events-none opacity-50" : ""
                  }
                />
              </PaginationItem>

              {getPageNumbers().map((page, index) =>
                page === "ellipsis" ? (
                  <PaginationItem key={`ellipsis-${index}`}>
                    <PaginationEllipsis />
                  </PaginationItem>
                ) : (
                  <PaginationItem key={`page-${page}`}>
                    <PaginationLink
                      isActive={currentPage === page}
                      onClick={() => setCurrentPage(page as number)}
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ),
              )}

              <PaginationItem>
                <PaginationNext
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  className={
                    currentPage === totalPages
                      ? "pointer-events-none opacity-50"
                      : ""
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      <div className="mt-4 text-sm text-gray-500">
        Showing {sortedCitizens.length > 0 ? startIndex + 1 : 0} to{" "}
        {Math.min(startIndex + itemsPerPage, sortedCitizens.length)} of{" "}
        {sortedCitizens.length} citizens
      </div>
    </div>
  );
};

export default CitizenTable;
