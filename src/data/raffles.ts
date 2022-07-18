import raffle2003 from "./20.3-10.4";
import raffle0206 from "./2.6-9.6";
import raffle0307 from "./3.7-17.7";
import raffle1907 from "./19.7-26.7";
import { getCurrentRaffleQueryParam } from "../utils/commonUtils";
import { RaffleDataType } from "../types/types";

export const raffles: Record<string, RaffleDataType> = {
  // order is reversed here manually, should be done in some util
  "2022-07-19": raffle1907,
  "2022-07-03": raffle0307,
  "2022-06-02": raffle0206,
  "2022-03-20": raffle2003,
};

export function getCurrentRaffleData() {
  return raffles[getCurrentRaffleCode()];
}

export function getCurrentRaffleCode() {
  const currentRaffleParam = getCurrentRaffleQueryParam();
  if (currentRaffleParam && raffles[currentRaffleParam]) {
    return currentRaffleParam;
  }
  return getDefaultRaffleCode();
}

export function getRaffleByCode(raffleCode: string) {
  return raffles[raffleCode] || raffles[getCurrentRaffleCode()];
}

export function getDefaultRaffleCode() {
  return Object.keys(raffles)[0];
}
