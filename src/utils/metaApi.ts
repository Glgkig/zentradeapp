import { supabase } from "@/integrations/supabase/client";

export interface MetaApiAccount {
  _id: string;
  name: string;
  login: string;
  server: string;
  platform: string;
  state: string;
  type: string;
}

export interface MetaApiDeal {
  id: string;
  type: string;
  time: string;
  symbol: string;
  volume: number;
  price: number;
  profit: number;
  commission: number;
  swap: number;
  comment?: string;
}

export interface MetaApiAccountInfo {
  balance: number;
  equity: number;
  margin: number;
  freeMargin: number;
  leverage: number;
  currency: string;
  server: string;
  platform: string;
}

async function invokeMetaApi(action: string, payload: Record<string, unknown> = {}) {
  const { data, error } = await supabase.functions.invoke("metaapi-connect", {
    body: { action, ...payload },
  });
  if (error) throw error;
  if (data?.error) throw new Error(data.error);
  return data;
}

export const metaApi = {
  /** List all MetaApi provisioned accounts */
  listAccounts: async (): Promise<MetaApiAccount[]> => {
    const res = await invokeMetaApi("list-accounts");
    return res.accounts || [];
  },

  /** Add a new MT4/MT5 account */
  addAccount: async (params: {
    login: string;
    password: string;
    serverName: string;
    platform: "mt4" | "mt5";
    name?: string;
  }) => {
    const res = await invokeMetaApi("add-account", params);
    return res.account;
  },

  /** Get trade history (deals) for an account */
  getHistory: async (
    accountId: string,
    startTime?: string,
    endTime?: string
  ): Promise<MetaApiDeal[]> => {
    const res = await invokeMetaApi("get-history", { accountId, startTime, endTime });
    return res.deals || [];
  },

  /** Get live account info (balance, equity, etc.) */
  getAccountInfo: async (accountId: string): Promise<MetaApiAccountInfo> => {
    const res = await invokeMetaApi("account-info", { accountId });
    return res.info;
  },
};
