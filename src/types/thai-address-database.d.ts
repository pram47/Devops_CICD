declare module "thai-address-database" {
  export type ThaiAddressEntry = {
    district: string;
    amphoe: string;
    province: string;
    zipcode: number | string;
  };

  export function searchAddressByDistrict(
    searchStr: string,
    maxResult?: number,
  ): ThaiAddressEntry[];

  export function searchAddressByAmphoe(
    searchStr: string,
    maxResult?: number,
  ): ThaiAddressEntry[];

  export function searchAddressByProvince(
    searchStr: string,
    maxResult?: number,
  ): ThaiAddressEntry[];

  export function searchAddressByZipcode(
    searchStr: string,
    maxResult?: number,
  ): ThaiAddressEntry[];
}
