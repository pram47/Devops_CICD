import PageLayout from "@/components/layout/PageLayout";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import type { CompanyProfileDetails } from "@/types/domain/profile";
import { useEffect, useState } from "react";
import { Pencil } from "lucide-react";
import ProfileAboutPopup from "./ProfileAboutPopup";
import ProfileCompanyInformationPopup from "./ProfileCompanyInformationPopup";
import ProfileCompanyNamePopup from "./ProfileCompanyNamePopup";
import ProfileCompanyProfilePicturePopup from "./ProfileCompanyProfilePicturePopup";
import OpenJobCard from "./OpenJobCard";
import { useAuthStore } from "@/store/auth";
import {
  apiGetProfileCompanyProfile,
  apiGetCompanyIdByUserId,
  apiGetProfileCompanyJobList,
  apiPatchProfileCompanyInfo,
  apiPatchProfileCompanyAbout,
  apiPatchProfileCompanyAdditionInformation,
  apiPatchProfileCompanyMedia,
} from "@/services/profileService";
import { formatDate } from "@/utils/formatDate";
import type { ProfileUpdateCompanyInfoRequest } from "@/types/profileTypes";
import type { ProfileCompanyJobListItem } from "@/services/profileService";

function toExternalUrl(link: string): string {
  const trimmed = link.trim();
  if (!trimmed) return "";

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  return `https://${trimmed}`;
}

export default function ProfilePage() {
  const authUser = useAuthStore((state) => state.user);
  const authToken = useAuthStore((state) => state.token);
  const [companyProfile, setCompanyProfile] = useState<CompanyProfileDetails>({
    companyName: "",
    place: "",
    region: "",
    phone: "",
    email: "",
    address: "",
    addressNo: "",
    addressMoo: "",
    addressSoi: "",
    addressStreet: "",
    addressProvince: "",
    addressDistrict: "",
    addressSubDistrict: "",
    addressPostalCode: "",
    mediaLinks: [],
  });
  const [companyProfileImageUrl, setCompanyProfileImageUrl] = useState("");
  const [isCompanyNamePopupOpen, setIsCompanyNamePopupOpen] = useState(false);
  const [
    isCompanyProfilePicturePopupOpen,
    setIsCompanyProfilePicturePopupOpen,
  ] = useState(false);
  const [aboutText, setAboutText] = useState("");
  const [isAboutPopupOpen, setIsAboutPopupOpen] = useState(false);
  const [companyInformationHtml, setCompanyInformationHtml] = useState("");
  const [isCompanyInformationPopupOpen, setIsCompanyInformationPopupOpen] =
    useState(false);
  const [companyId, setCompanyId] = useState("");
  const [openJobs, setOpenJobs] = useState<ProfileCompanyJobListItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const ensureAuthorizedAndFetch = async () => {
      setIsLoading(true);
      try {
        const userId = authUser?.id;

        if (!userId || !authToken) {
          setCompanyId("");
          setOpenJobs([]);
          setCompanyProfile({
            companyName: "",
            place: "",
            region: "",
            phone: "",
            email: "",
            address: "",
            addressNo: "",
            addressMoo: "",
            addressSoi: "",
            addressStreet: "",
            addressProvince: "",
            addressDistrict: "",
            addressSubDistrict: "",
            addressPostalCode: "",
            mediaLinks: [],
          });
          setAboutText("");
          setCompanyInformationHtml("");
          setCompanyProfileImageUrl("");
          return;
        }

        // แปลง user_id → company_id
        console.log("[GET company-id] userId:", userId);
        const companyIdResult = await apiGetCompanyIdByUserId(userId);
        console.log("[GET company-id] response:", companyIdResult);
        const companyId = companyIdResult.data?.company_id;
        if (!companyId) {
          console.error("No company_id found for user", userId);
          return;
        }

        setCompanyId(companyId);

        console.log("[GET profile] companyId:", companyId);
        const [profileResult, openJobResult] = await Promise.all([
          apiGetProfileCompanyProfile(companyId),
          apiGetProfileCompanyJobList(companyId, { page: 0, limit: 10 }),
        ]);

        const data = profileResult.data;
        if (!data) return;

        setCompanyProfile({
          companyName: data.name ?? "",
          place: data.province?.province_name_en ?? "",
          region: data.country?.country_name_en ?? "",
          phone: data.phone ?? "",
          email: data.email ?? "",
          address: data.address_line ?? "",
          addressNo: data.no ?? "",
          addressMoo: data.moo ?? "",
          addressSoi: data.soi ?? "",
          addressStreet: data.street ?? "",
          addressProvince: data.province?.province_name_en ?? "",
          addressDistrict: data.district?.district_name_en ?? "",
          addressSubDistrict: data.sub_district?.sub_district_name_en ?? "",
          addressPostalCode: data.postal_code?.postal_code ?? "",
          mediaLinks: (data.contacts ?? []).map((c) => ({
            label: c.label,
            url: c.link,
          })),
        });
        setAboutText(data.about ?? "");
        setCompanyInformationHtml(
          data.addition_information_rtf ?? data.addition_information ?? "",
        );
        if (data.logo) setCompanyProfileImageUrl(data.logo);
        setOpenJobs(openJobResult.data?.data ?? []);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    void ensureAuthorizedAndFetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const contactBadges = [
    { key: "email", text: companyProfile.email, href: "" },
    { key: "phone", text: companyProfile.phone, href: "" },
    ...companyProfile.mediaLinks.map((link, index) => ({
      key: `media-${index}`,
      text: link.label || link.url,
      href: link.label && link.url ? toExternalUrl(link.url) : "",
    })),
  ].filter((item) => item.text.trim().length > 0);

  const locationText = [companyProfile.place, companyProfile.region]
    .filter((item) => item.trim().length > 0)
    .join(", ");

  return (
    <PageLayout>
      <div className="w-full overflow-y-auto bg-background px-6 py-6">
        <div className="mx-auto ml-4 max-w-6xl">
          {isLoading && (
            <div className="flex items-center justify-center py-20 text-sm text-muted-foreground">
              Loading...
            </div>
          )}
          <div className="mb-3 mx-[1%]">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbPage>Profile</BreadcrumbPage>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Main Profile</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          <section className="overflow-hidden rounded-xl border border-border bg-card">
            <div className="relative h-44 overflow-hidden bg-[#4a555d]">
              <div className="absolute -left-8 -top-10 size-28 rounded-full bg-[#d93fd0]" />
              <div className="bg-linear-to-br absolute left-24 top-20 size-36 rounded-full from-[#ff8557] to-[#ea39d9]" />
              <div className="bg-linear-to-br absolute left-1/2 -top-9 size-32 -translate-x-1/2 rounded-full from-[#ff9800] to-[#e23be0]" />
              <div className="absolute -right-6 top-6 size-36 rounded-full bg-[#ff9800]" />
              <div className="absolute left-1/3 top-3 size-7 rounded-full bg-white/90" />
              <div className="absolute right-20 top-12 size-10 rounded-full bg-white/90" />
            </div>

            <div className="relative px-6 pb-6 pt-22">
              <div className="absolute -top-20 left-6 size-40 rounded-full border-4 border-card bg-[#c8ccd2] shadow-sm">
                {companyProfileImageUrl ? (
                  <img
                    src={companyProfileImageUrl}
                    alt={companyProfile.companyName}
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : null}
                <button
                  type="button"
                  aria-label="Edit company profile picture"
                  onClick={() => setIsCompanyProfilePicturePopupOpen(true)}
                  className="absolute bottom-1 right-1 rounded-full border border-border bg-background p-1.5 text-muted-foreground shadow-sm transition-colors hover:bg-muted"
                >
                  <Pencil className="size-3.5" />
                </button>
              </div>

              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-3xl font-semibold">
                      {companyProfile.companyName}
                    </h1>
                    <button
                      type="button"
                      aria-label="Edit company name"
                      onClick={() => setIsCompanyNamePopupOpen(true)}
                      className="rounded-md p-1 text-muted-foreground hover:bg-muted"
                    >
                      <Pencil className="size-4" />
                    </button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {locationText}
                  </p>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {contactBadges.map((badge) => {
                  const className =
                    "rounded-full border border-border bg-background px-3 py-1 text-xs text-muted-foreground";

                  if (badge.href) {
                    return (
                      <a
                        key={badge.key}
                        href={badge.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`${className} transition-colors hover:border-primary/50 hover:text-primary`}
                      >
                        {badge.text}
                      </a>
                    );
                  }

                  return (
                    <span key={badge.key} className={className}>
                      {badge.text}
                    </span>
                  );
                })}
              </div>

              <div className="mt-5 space-y-4">
                <div className="rounded-xl border border-border bg-background px-4 py-3">
                  <div className="mb-2 flex items-center justify-between">
                    <h2 className="text-lg font-semibold">About</h2>
                    <button
                      type="button"
                      aria-label="Edit about"
                      onClick={() => setIsAboutPopupOpen(true)}
                      className="rounded-md p-1 text-muted-foreground hover:bg-muted"
                    >
                      <Pencil className="size-4" />
                    </button>
                  </div>
                  <p className="text-sm leading-6 whitespace-pre-line wrap-break-word text-muted-foreground">
                    {aboutText}
                  </p>
                </div>

                <div className="rounded-xl border border-border bg-background px-4 py-3">
                  <div className="mb-2 flex items-center justify-between">
                    <h2 className="text-lg font-semibold">
                      Company Information
                    </h2>
                    <button
                      type="button"
                      aria-label="Edit company information"
                      onClick={() => setIsCompanyInformationPopupOpen(true)}
                      className="rounded-md p-1 text-muted-foreground hover:bg-muted"
                    >
                      <Pencil className="size-4" />
                    </button>
                  </div>
                  <div
                    className="text-sm leading-6 text-muted-foreground [&_ol]:my-3 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:my-0 [&_p+ol]:mt-3 [&_p+ul]:mt-3 [&_p:not(:first-child)]:mt-3 [&_strong]:font-semibold [&_strong]:text-foreground [&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-5"
                    dangerouslySetInnerHTML={{ __html: companyInformationHtml }}
                  />
                </div>

                <div className="rounded-xl border border-border bg-background px-4 py-3">
                  <h2 className="mb-3 text-lg font-semibold">Open Job</h2>
                  <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                    {openJobs.map((job) => {
                      const district =
                        job.district?.district_name_en ??
                        job.district?.district_name_th ??
                        "";
                      const province =
                        job.province?.province_name_en ??
                        job.province?.province_name_th ??
                        "";

                      const location = [district, province]
                        .filter((item) => item.trim().length > 0)
                        .join(", ");

                      const startDate = job.start_apply
                        ? formatDate({
                            date: job.start_apply,
                            format: "DD/MM/YYYY",
                          })
                        : "-";
                      const endDate = job.end_apply
                        ? formatDate({
                            date: job.end_apply,
                            format: "DD/MM/YYYY",
                          })
                        : "-";

                      return (
                        <OpenJobCard
                          key={job.id}
                          jobId={job.id}
                          title={job.name}
                          location={location}
                          dateRange={`${startDate} - ${endDate}`}
                          applied={`${job.applied_count} Applied`}
                          prefill={{
                            jobId: job.id,
                            name: job.name,
                            start_apply: job.start_apply,
                            end_apply: job.end_apply,
                            province_name:
                              job.province?.province_name_en ??
                              job.province?.province_name_th ??
                              "",
                            district_name:
                              job.district?.district_name_en ??
                              job.district?.district_name_th ??
                              "",
                          }}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      <ProfileAboutPopup
        open={isAboutPopupOpen}
        value={aboutText}
        onOpenChange={setIsAboutPopupOpen}
        onSave={async (nextValue) => {
          setIsAboutPopupOpen(false);
          if (!companyId) return;
          try {
            const body = { about: nextValue };
            console.log("[PATCH about] body:", body);
            setAboutText(nextValue);
            const result = await apiPatchProfileCompanyAbout(companyId, body);
            console.log("[PATCH about] response:", result);
          } catch (err) {
            console.error("[PATCH about] error:", err);
          }
        }}
      />

      <ProfileCompanyInformationPopup
        open={isCompanyInformationPopupOpen}
        value={companyInformationHtml}
        onOpenChange={setIsCompanyInformationPopupOpen}
        onSave={async (nextValue) => {
          setIsCompanyInformationPopupOpen(false);
          if (!companyId) return;
          try {
            const body = {
              addition_information: nextValue,
              addition_information_rtf: nextValue,
            };
            console.log("[PATCH addition-information] body:", body);
            setCompanyInformationHtml(nextValue);
            const result = await apiPatchProfileCompanyAdditionInformation(
              companyId,
              body,
            );
            console.log("[PATCH addition-information] response:", result);
          } catch (err) {
            console.error("[PATCH addition-information] error:", err);
          }
        }}
      />

      <ProfileCompanyNamePopup
        open={isCompanyNamePopupOpen}
        value={companyProfile}
        onOpenChange={setIsCompanyNamePopupOpen}
        onSave={async (nextValue) => {
          setIsCompanyNamePopupOpen(false);
          if (!companyId) return;
          try {
            const body: ProfileUpdateCompanyInfoRequest = {
              name: nextValue.companyName,
              email: nextValue.email,
              phone: nextValue.phone,
              phone_region: "+66",
              address_line: nextValue.address,
              no: nextValue.addressNo,
              moo: nextValue.addressMoo,
              soi: nextValue.addressSoi,
              street: nextValue.addressStreet,
              contacts: nextValue.mediaLinks.map((link, index) => ({
                index,
                label: link.label,
                link: link.url,
              })),
            };
            console.log("[PATCH info] body:", body);
            setCompanyProfile(nextValue);
            const result = await apiPatchProfileCompanyInfo(companyId, body);
            console.log("[PATCH info] response:", result);
          } catch (err) {
            console.error("[PATCH info] error:", err);
          }
        }}
      />

      <ProfileCompanyProfilePicturePopup
        open={isCompanyProfilePicturePopupOpen}
        value={companyProfileImageUrl}
        companyName={companyProfile.companyName}
        onOpenChange={setIsCompanyProfilePicturePopupOpen}
        onSave={async (nextValue, file) => {
          setIsCompanyProfilePicturePopupOpen(false);
          if (!companyId || !file) return;
          setCompanyProfileImageUrl(nextValue);
          try {
            const body = { logo: file };
            console.log("[PATCH media] logo file:", file.name);
            const result = await apiPatchProfileCompanyMedia(companyId, body);
            console.log("[PATCH media] response:", result);
            if (result.data?.logo) setCompanyProfileImageUrl(result.data.logo);
          } catch (err) {
            console.error("[PATCH media] error:", err);
          }
        }}
      />
    </PageLayout>
  );
}
