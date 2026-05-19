import PageLayout from "@/components/layout/PageLayout";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Multiselect from "@/components/ui/multiselect";
import SectionPagination from "@/components/ui/pagination";
import { apiGetEmployeeList } from "@/services/accountManagementService";
import type { EmployeeListItem } from "@/services/accountManagementService";
import { apiGetCompanyIdByUserId } from "@/services/profileService";
import { useAuthStore } from "@/store/auth";
import { Ellipsis, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import AddEmployerDialog from "./dialogs/AddEmployerDialog";

const ROLE_MAP: Record<number, string> = {
  1: "jobby_user",
  2: "employer_admin",
  3: "manager",
  4: "hr",
  5: "staff",
};

const ROLE_OPTIONS = Object.values(ROLE_MAP).map((r) => ({
  label: r,
  value: r,
}));

const perPage = 10;

export default function AccountPage() {
  const user = useAuthStore((s) => s.user);
  const [companyId, setCompanyId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [employees, setEmployees] = useState<EmployeeListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [refreshTick, setRefreshTick] = useState(0);

  // Fetch company_id once on mount
  useEffect(() => {
    if (!user?.id) return;
    apiGetCompanyIdByUserId(user.id)
      .then((res) => setCompanyId(res.data?.company_id ?? ""))
      .catch(() => setCompanyId(""));
  }, [user?.id]);

  useEffect(() => {
    let cancelled = false;
    const fetchEmployees = async () => {
      setIsLoading(true);
      setErrorMessage("");
      try {
        const response = await apiGetEmployeeList({
          page: currentPage - 1,
          limit: perPage,
        });
        if (cancelled) return;
        setEmployees(response.data.data ?? []);
        setTotal(response.data.total ?? 0);
      } catch {
        if (cancelled) return;
        setEmployees([]);
        setTotal(0);
        setErrorMessage("Failed to load employee list");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    void fetchEmployees();
    return () => {
      cancelled = true;
    };
  }, [currentPage, refreshTick]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedRoles]);

  const filteredEmployees = employees.filter((emp) => {
    const fullName = [emp.first_name, emp.last_name]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    const matchesSearch =
      !searchQuery.trim() ||
      fullName.includes(searchQuery.trim().toLowerCase()) ||
      emp.email.toLowerCase().includes(searchQuery.trim().toLowerCase());
    const empRole = emp.role_name ?? ROLE_MAP[emp.role] ?? String(emp.role);
    const matchesRole =
      selectedRoles.length === 0 || selectedRoles.includes(empRole);
    return matchesSearch && matchesRole;
  });

  const handleAddSuccess = () => {
    setRefreshTick((t) => t + 1);
  };

  return (
    <PageLayout>
      <div className="w-full bg-background px-6 py-6 overflow-y-auto">
        <div className="mx-auto max-w-6xl ml-4">
          <div className="mb-3 mx-[1%]">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbPage>Employee</BreadcrumbPage>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Account Management</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          <div className="mb-4 mt-2 flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-4xl font-semibold text-foreground sm:text-2xl">
              Account Management
            </h1>
            <Button
              size="lg"
              className="px-5"
              onClick={() => setDialogOpen(true)}
            >
              <Plus className="size-4" />
              Add People
            </Button>
          </div>

          <section className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-12">
            <div className="md:col-span-4">
              <p className="mb-1 text-base font-medium">Search</p>
              <Input
                placeholder="Search name or email"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
              />
            </div>
            <div className="md:col-span-4">
              <p className="mb-1 text-base font-medium">Filter by Role</p>
              <Multiselect
                options={ROLE_OPTIONS}
                selectedValues={selectedRoles}
                onSelectedValuesChange={setSelectedRoles}
                placeholder="All roles"
              />
            </div>
          </section>

          <section className="overflow-hidden rounded-xl border border-border bg-card">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30 text-left">
                    <th className="px-5 py-3 font-semibold">Name</th>
                    <th className="px-5 py-3 font-semibold">Email</th>
                    <th className="px-5 py-3 font-semibold">Role</th>
                    <th className="px-5 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-5 py-6 text-center text-sm text-muted-foreground"
                      >
                        Loading...
                      </td>
                    </tr>
                  ) : errorMessage ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-5 py-6 text-center text-sm text-destructive"
                      >
                        {errorMessage}
                      </td>
                    </tr>
                  ) : filteredEmployees.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-5 py-6 text-center text-sm text-muted-foreground"
                      >
                        No employees found
                      </td>
                    </tr>
                  ) : (
                    filteredEmployees.map((emp) => {
                      const fullName =
                        [emp.first_name, emp.last_name]
                          .filter(Boolean)
                          .join(" ") || "-";
                      const roleName =
                        emp.role_name ?? ROLE_MAP[emp.role] ?? String(emp.role);
                      return (
                        <tr
                          key={emp.id}
                          className="border-b border-border last:border-b-0"
                        >
                          <td className="px-5 py-3">{fullName}</td>
                          <td className="px-5 py-3">{emp.email}</td>
                          <td className="px-5 py-3">{roleName}</td>
                          <td className="px-5 py-3 text-right">
                            <button
                              type="button"
                              className="rounded-md p-1 text-muted-foreground hover:bg-muted"
                              aria-label={`Open actions for ${fullName}`}
                            >
                              <Ellipsis className="size-5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <SectionPagination
            total={total}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            perPage={perPage}
          />
        </div>
      </div>

      <AddEmployerDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        companyId={companyId}
        onSuccess={handleAddSuccess}
      />
    </PageLayout>
  );
}
