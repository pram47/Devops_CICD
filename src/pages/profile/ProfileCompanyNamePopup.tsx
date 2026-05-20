import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { ProfileCompanyNamePopupProps } from "@/types/domain/profile";
import { Plus, X } from "lucide-react";

const COMPANY_NAME_LIMIT = 120;
const COMPANY_PLACE_LIMIT = 120;
const PHONE_DIGIT_LIMIT = 15;
const EMAIL_LIMIT = 120;
const ADDRESS_LINE_LIMIT = 180;
const ADDRESS_PART_LIMIT = 100;
const POSTAL_CODE_LIMIT = 10;
const LINK_LABEL_LIMIT = 50;
const LINK_URL_LIMIT = 200;
const MAX_MEDIA_LINKS = 6;

type AddressFormValue = {
  addressLine: string;
  no: string;
  moo: string;
  soi: string;
  street: string;
  province: string;
  district: string;
  subDistrict: string;
  postalCode: string;
};

function mapAddressToForm(
  value: ProfileCompanyNamePopupProps["value"],
): AddressFormValue {
  return {
    addressLine: value.address,
    no: value.addressNo,
    moo: value.addressMoo,
    soi: value.addressSoi,
    street: value.addressStreet,
    province: value.addressProvince,
    district: value.addressDistrict,
    subDistrict: value.addressSubDistrict,
    postalCode: value.addressPostalCode,
  };
}

function cloneDraftValue(value: ProfileCompanyNamePopupProps["value"]) {
  return {
    ...value,
    mediaLinks: value.mediaLinks.map((link) => ({ ...link })),
  };
}

export default function ProfileCompanyNamePopup({
  open,
  value,
  onOpenChange,
  onSave,
}: ProfileCompanyNamePopupProps) {
  const [draftValue, setDraftValue] = useState(() => cloneDraftValue(value));
  const [addressForm, setAddressForm] = useState<AddressFormValue>(() =>
    mapAddressToForm(value),
  );

  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDraftValue(cloneDraftValue(value));
      setAddressForm(mapAddressToForm(value));
    }
  }, [open, value]);

  const updateAddressField = (
    key: keyof AddressFormValue,
    nextValue: string,
  ) => {
    setAddressForm((previous) => ({
      ...previous,
      [key]: nextValue,
    }));
  };

  const updateMediaLink = (
    index: number,
    key: "label" | "url",
    nextValue: string,
  ) => {
    setDraftValue((previous) => ({
      ...previous,
      mediaLinks: previous.mediaLinks.map((link, linkIndex) =>
        linkIndex === index ? { ...link, [key]: nextValue } : link,
      ),
    }));
  };

  const addMediaLink = () => {
    setDraftValue((previous) => {
      if (previous.mediaLinks.length >= MAX_MEDIA_LINKS) {
        return previous;
      }

      return {
        ...previous,
        mediaLinks: [...previous.mediaLinks, { label: "", url: "" }],
      };
    });
  };

  const removeMediaLink = (index: number) => {
    setDraftValue((previous) => ({
      ...previous,
      mediaLinks: previous.mediaLinks.filter(
        (_, linkIndex) => linkIndex !== index,
      ),
    }));
  };

  const handleSave = () => {
    const normalizedValue = {
      ...draftValue,
      companyName: draftValue.companyName.trim() || value.companyName,
      place: draftValue.place.trim(),
      region: draftValue.region.trim(),
      phone: draftValue.phone.trim(),
      email: draftValue.email.trim(),
      address: addressForm.addressLine.trim(),
      addressNo: addressForm.no.trim(),
      addressMoo: addressForm.moo.trim(),
      addressSoi: addressForm.soi.trim(),
      addressStreet: addressForm.street.trim(),
      addressProvince: addressForm.province.trim(),
      addressDistrict: addressForm.district.trim(),
      addressSubDistrict: addressForm.subDistrict.trim(),
      addressPostalCode: addressForm.postalCode.trim(),
      mediaLinks: draftValue.mediaLinks
        .map((link) => ({
          label: link.label.trim(),
          url: link.url.trim(),
        }))
        .filter((link) => link.label || link.url),
    };

    onSave(normalizedValue);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[96vw]! max-h-[92vh]! max-w-180! gap-0 overflow-hidden rounded-[22px] p-0! sm:max-w-180!">
        <div className="flex max-h-[92vh] flex-col">
          <div className="relative shrink-0 px-4 pt-4 sm:px-5 sm:pt-5">
            <button
              type="button"
              aria-label="Close"
              onClick={() => onOpenChange(false)}
              className="absolute right-4 top-4 rounded-full p-1 text-foreground hover:bg-muted"
            >
              <X className="size-5" />
            </button>

            <DialogHeader className="gap-1 pr-10">
              <DialogTitle className="pt-0 text-[16px] font-semibold text-foreground">
                Edit Profile
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                Make changes to your profile here. Click save when you&apos;re
                done.
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="min-h-0 overflow-y-auto overflow-x-hidden px-4 pb-3 pt-4 sm:px-5">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm text-foreground">
                  Company Name
                </label>
                <Input
                  value={draftValue.companyName}
                  maxLength={COMPANY_NAME_LIMIT}
                  onChange={(event) => {
                    setDraftValue((previous) => ({
                      ...previous,
                      companyName: event.target.value,
                    }));
                  }}
                  placeholder="Company name"
                  className="h-10"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm text-foreground">
                  Company Place
                </label>
                <Input
                  value={draftValue.place}
                  maxLength={COMPANY_PLACE_LIMIT}
                  onChange={(event) => {
                    setDraftValue((previous) => ({
                      ...previous,
                      place: event.target.value,
                    }));
                  }}
                  placeholder="Bangkok"
                  className="h-10"
                />
              </div>
            </div>

            <div className="mt-3">
              <p className="text-[22px] font-semibold leading-8 text-foreground">
                Contact
              </p>
              <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div>
                  <label className="mb-1 block text-sm text-foreground">
                    Region
                  </label>
                  <Input
                    value={draftValue.region}
                    maxLength={50}
                    onChange={(event) => {
                      setDraftValue((previous) => ({
                        ...previous,
                        region: event.target.value,
                      }));
                    }}
                    placeholder="THA"
                    className="h-10"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm text-foreground">
                    Tel.
                  </label>
                  <Input
                    value={draftValue.phone}
                    maxLength={PHONE_DIGIT_LIMIT}
                    inputMode="numeric"
                    pattern="[0-9]*"
                    onChange={(event) => {
                      const nextPhone = event.target.value
                        .replace(/\D/g, "")
                        .slice(0, PHONE_DIGIT_LIMIT);
                      setDraftValue((previous) => ({
                        ...previous,
                        phone: nextPhone,
                      }));
                    }}
                    placeholder="062XXXXXXX"
                    className="h-10"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm text-foreground">
                    Email
                  </label>
                  <Input
                    type="email"
                    value={draftValue.email}
                    maxLength={EMAIL_LIMIT}
                    onChange={(event) => {
                      setDraftValue((previous) => ({
                        ...previous,
                        email: event.target.value,
                      }));
                    }}
                    placeholder="company@email.com"
                    className="h-10"
                  />
                </div>
              </div>
            </div>

            <div className="mt-3 space-y-2">
              {draftValue.mediaLinks.map((link, index) => (
                <div key={index} className="grid grid-cols-12 gap-2">
                  <div className="col-span-12 sm:col-span-3">
                    <label className="mb-1 block text-sm text-foreground">
                      Label
                    </label>
                    <Input
                      value={link.label}
                      maxLength={LINK_LABEL_LIMIT}
                      onChange={(event) =>
                        updateMediaLink(index, "label", event.target.value)
                      }
                      placeholder="linkedin"
                      className="h-10"
                    />
                  </div>

                  <div className="col-span-10 sm:col-span-8">
                    <label className="mb-1 block text-sm text-foreground">
                      Link
                    </label>
                    <Input
                      value={link.url}
                      maxLength={LINK_URL_LIMIT}
                      onChange={(event) =>
                        updateMediaLink(index, "url", event.target.value)
                      }
                      placeholder="https://www.linkedin.com/in"
                      className="h-10"
                    />
                  </div>

                  <div className="col-span-2 flex items-end justify-end sm:col-span-1">
                    <button
                      type="button"
                      aria-label="Remove link"
                      onClick={() => removeMediaLink(index)}
                      className="mb-1 rounded-full p-2 text-foreground hover:bg-muted"
                    >
                      <X className="size-5" />
                    </button>
                  </div>
                </div>
              ))}

              <div className="pt-1">
                <Button
                  type="button"
                  variant="outline"
                  onClick={addMediaLink}
                  disabled={draftValue.mediaLinks.length >= MAX_MEDIA_LINKS}
                  className="mx-auto flex h-9 rounded-full px-4"
                >
                  <Plus className="size-4" />
                  Add Link
                </Button>
              </div>
            </div>

            <section className="mt-5">
              <h2 className="mb-3 text-lg font-medium text-foreground">
                Address Information
              </h2>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-6">
                <div className="sm:col-span-3">
                  <label className="mb-1 block text-sm text-foreground">
                    Address line
                  </label>
                  <Input
                    value={addressForm.addressLine}
                    maxLength={ADDRESS_LINE_LIMIT}
                    onChange={(event) =>
                      updateAddressField("addressLine", event.target.value)
                    }
                    placeholder="Address line"
                    className="h-10"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm text-foreground">
                    No.
                  </label>
                  <Input
                    value={addressForm.no}
                    maxLength={ADDRESS_PART_LIMIT}
                    onChange={(event) =>
                      updateAddressField("no", event.target.value)
                    }
                    placeholder="No."
                    className="h-10"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm text-foreground">
                    Moo
                  </label>
                  <Input
                    value={addressForm.moo}
                    maxLength={ADDRESS_PART_LIMIT}
                    onChange={(event) =>
                      updateAddressField("moo", event.target.value)
                    }
                    placeholder="Moo"
                    className="h-10"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm text-foreground">
                    Soi
                  </label>
                  <Input
                    value={addressForm.soi}
                    maxLength={ADDRESS_PART_LIMIT}
                    onChange={(event) =>
                      updateAddressField("soi", event.target.value)
                    }
                    placeholder="Soi"
                    className="h-10"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-1 block text-sm text-foreground">
                    Street
                  </label>
                  <Input
                    value={addressForm.street}
                    maxLength={ADDRESS_PART_LIMIT}
                    onChange={(event) =>
                      updateAddressField("street", event.target.value)
                    }
                    placeholder="Street"
                    className="h-10"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-1 block text-sm text-foreground">
                    Province
                  </label>
                  <Input
                    value={addressForm.province}
                    maxLength={ADDRESS_PART_LIMIT}
                    onChange={(event) =>
                      updateAddressField("province", event.target.value)
                    }
                    placeholder="Province"
                    className="h-10"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm text-foreground">
                    District
                  </label>
                  <Input
                    value={addressForm.district}
                    maxLength={ADDRESS_PART_LIMIT}
                    onChange={(event) =>
                      updateAddressField("district", event.target.value)
                    }
                    placeholder="District"
                    className="h-10"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm text-foreground">
                    Sub-district
                  </label>
                  <Input
                    value={addressForm.subDistrict}
                    maxLength={ADDRESS_PART_LIMIT}
                    onChange={(event) =>
                      updateAddressField("subDistrict", event.target.value)
                    }
                    placeholder="Sub-district"
                    className="h-10"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm text-foreground">
                    Postal code
                  </label>
                  <Input
                    value={addressForm.postalCode}
                    maxLength={POSTAL_CODE_LIMIT}
                    onChange={(event) => {
                      const nextPostalCode = event.target.value
                        .replace(/\s/g, "")
                        .slice(0, POSTAL_CODE_LIMIT);
                      updateAddressField("postalCode", nextPostalCode);
                    }}
                    placeholder="Postal code"
                    className="h-10"
                  />
                </div>
              </div>
            </section>
          </div>

          <div className="shrink-0 border-t border-border bg-background px-4 py-3 sm:px-5">
            <div className="flex items-center justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="min-w-20"
              >
                Cancel
              </Button>
              <Button type="button" onClick={handleSave} className="min-w-28">
                Save Change
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
