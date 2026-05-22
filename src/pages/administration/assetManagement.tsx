import React, { useEffect, useMemo, useState } from "react";
import HeaderLayout from "~/components/common/HeaderLayout";
import BTC from "~/assets/walleticons/btc.svg";
import ETH from "~/assets/walleticons/eth.svg";
import USDT from "~/assets/walleticons/ustd.svg";
import TRX from "~/assets/walleticons/trx.svg";
import USDC from "~/assets/walleticons/USDC.svg";
import EUR from "~/assets/walleticons/eur.svg";
import Image from "next/image";

import SelectComponent from "~/components/common/SelectComponent";
import { useForm } from "react-hook-form";
import MuiButton from "~/components/common/Button";
import { ApiHandler } from "~/service/UtilService";
import {
  create_MASTER_GAS_COMMISSION_LIQUIDITY_WALLET,
  fetch_MASTER_GAS_COMMISSION_BALANCE,
  fetchKrakenBalance,
} from "~/service/ApiRequests";
import toast from "react-hot-toast";
import { KrakenCoin } from "~/common/functions";
import MasterWallet from "./administration-assets/masterWallet";
import CommissionWallet from "./administration-assets/commissionWallet";
import GasWallet from "./administration-assets/gasWallet";
import LiquidityWallets from "./administration-assets/liquidityWallet";
import KrakenWallets from "./administration-assets/krakenWallet";
import { enforcePermission } from "~/utils/permissions";

type PairValues = Record<string, string>;

type formData = {
  name: string;
  email: string;
  template1: string;
  template2: string;
  template3: string;

  type: string;
  countryCode: string;
  number: string;
  issuedBy: string;
  issuedDate: string;
  validUntil: string;
  state: string;
};
// filter options

// dropdown
const currencyTypes = [
  { label: "Euro", value: "euro" },
  { label: "USD", value: "usd" },
  // { label: "GBP", value: "gbp" },
];
const AssetManagement = () => {
  const krakenCurrency = [
    {
      color: "#EF902F",
      bgcolor: "#F8A13833",
      name: "BTC",
      image: BTC,
      checked: true,
    },
    {
      name: "USDT",
      color: "#26A17B",
      bgcolor: "#11986E33",
      image: USDT,
      checked: true,
    },
    {
      color: "#5C77BA",
      name: "ETH",
      image: ETH,
      checked: true,
      bgcolor: "#D3E5FF",
    },

    {
      color: "#EB0826",
      bgcolor: "#EA072533",
      name: "USDT.t",
      image: TRX,
      checked: false,
    },

    {
      color: "#5C77BA",
      bgcolor: "#D3E5FF",
      name: "USDC",
      image: USDC,
      checked: true,
    },

    {
      color: "#5C77BA",
      bgcolor: "#D3E5FF",
      name: "EUR",
      image: EUR ?? "",
    },
  ];

  const {} = useForm<formData>();

  useEffect(() => {
    void fetchAllPairs();
  }, []);

  const pairs = [
    { BTC: "BTC/EUR" },
    { USDC: "USDC/EUR" },
    { "USDT.t": "USDT/EUR" },
    { ETH: "ETH/EUR" },
    { USDT: "USDT/EUR" },
  ];

  async function getPairValue(pair: any) {
    try {
      const response = await fetch(
        `https://api.kraken.com/0/public/Ticker?pair=${pair}`,
      );
      const data = await response.json();
      const value = data?.result?.[pair]?.a[0] || null;
      return value;
    } catch (error) {
      return null;
    }
  }

  const [euroValues, setEuroValues] = useState<PairValues>({});

  async function fetchAllPairs() {
    try {
      const pairValues: PairValues = {};
      await Promise.all(
        pairs.map(async (pairObj) => {
          const pairKey = Object.keys(pairObj)[0];
          const pairValue = Object.values(pairObj)[0];
          const value = await getPairValue(pairValue);
          if (pairKey) {
            pairValues[pairKey] = value;
          }
        }),
      );

      return pairValues;
    } catch (error) {
      return null;
    }
  }

  const [state, setState] = useState<MASTER_GAS_COMMISSION>({
    masterWalletBalance: [],
    gasWalletsBalance: [],
    commissionWalletsBalance: [],
    liquidityWalletBalance: [],
  });

  const [krakenBalance, setKrakenBalance] = useState<krakenBalance[]>();
  const [walletsLoading, setWalletsLoading] = useState(false);
  const [krakenLoading, setKrakenLoading] = useState(false);
  const [createWalletLoading, setCreateWalletLoading] = useState(false);

  const getAllBalance = async (tab: string) => {
    setWalletsLoading(true);
    const [res, error]: APIResult<MASTER_GAS_COMMISSION> = await ApiHandler(
      fetch_MASTER_GAS_COMMISSION_BALANCE,
      { tab },
    );
    setWalletsLoading(false);

    if (error) {
      toast.error("Failed to load users");
    }

    if (res?.success && res.body) {
      const masterWalletBalance: FirebockAssets[] = [];
      const gasWalletsBalance: FirebockAssets[] = [];
      const commissionWalletsBalance: FirebockAssets[] = [];
      const liquidityWalletBalance: FirebockAssets[] = [];

      res?.body?.masterWalletBalance?.map((item) => {
        masterWalletBalance.push({
          id: item?.id,
          balance: Number(item.balance).toFixed(6),
          adminUserId: item?.adminUserId,
          vaultId: item?.vaultId,
          asset: item?.asset,
          assetAddress: item?.assetAddress,
          privateKey: item?.privateKey,
          publicKey: item?.publicKey,
          mnemonic: item?.mnemonic,
          createdAt: item?.createdAt,
          color: "#5C77BA",
          bgcolor: "#D3E5FF",
        });
      });

      res?.body?.gasWalletsBalance
        ?.filter((item) => item !== null)
        ?.map((item) => {
          gasWalletsBalance.push({
            id: item?.id,
            balance: Number(item.balance).toFixed(6),
            adminUserId: item?.adminUserId,
            vaultId: item?.vaultId,
            asset: item?.asset,
            assetId: item?.assetId,
            assetAddress: item?.assetAddress,
            privateKey: item?.privateKey,
            publicKey: item?.publicKey,
            mnemonic: item?.mnemonic,
            createdAt: item?.createdAt,
            color: "#5C77BA",
            bgcolor: "#D3E5FF",
          });
        });

      res?.body?.commissionWalletsBalance?.map((item) => {
        commissionWalletsBalance.push({
          id: item?.id,
          balance: Number(item.balance).toFixed(6),
          adminUserId: item?.adminUserId,
          vaultId: item?.vaultId,
          asset: item?.asset,
          assetAddress: item?.assetAddress,
          privateKey: item?.privateKey,
          publicKey: item?.publicKey,
          mnemonic: item?.mnemonic,
          createdAt: item?.createdAt,
          color: "#5C77BA",
          bgcolor: "#D3E5FF",
        });
      });

      // res?.body?.liquidityWalletBalance?.map((item) => {
      //   liquidityWalletBalance.push({
      //     id: item?.id,
      //     balance: Number(item.balance).toFixed(6),
      //     adminUserId: item?.adminUserId,
      //     vaultId: item?.vaultId,
      //     asset: item?.asset,
      //     assetAddress: item?.assetAddress,
      //     privateKey: item?.privateKey,
      //     publicKey: item?.publicKey,
      //     mnemonic: item?.mnemonic,
      //     createdAt: item?.createdAt,
      //     color: "#5C77BA",
      //     bgcolor: "#D3E5FF",
      //   });
      // });

      setState({
        masterWalletBalance,
        gasWalletsBalance,
        commissionWalletsBalance,
        liquidityWalletBalance,
      });
    }
  };

  const getKrakenBalance = async () => {
    setKrakenLoading(true);
    const [res, error]: APIResult<string[]> =
      await ApiHandler(fetchKrakenBalance);
    setKrakenLoading(false);

    if (error) {
      // toast.error("Failed to load users");
    }

    if (res?.success && res.body) {
      const euroValues = await fetchAllPairs();

      const balance: krakenBalance[] = [];

      Object.entries(res?.body).map(([key, value]) => {
        const matchedCustody = krakenCurrency.find(
          (v) => v.name === KrakenCoin(key),
        );

        const ev = euroValues ? euroValues[KrakenCoin(key)] : 0;
        console.log("ev: ", ev);

        let euroBalance =
          Number(ev) > 0 ? Number(ev) * Number(value) : Number(value);

        euroBalance = Number(euroBalance.toFixed(8));

        if (matchedCustody) {
          balance.push({
            id: KrakenCoin(key),
            balance: Number(value).toFixed(6),
            euroBalance: euroBalance ?? 0,
            image: matchedCustody ? matchedCustody.image : "",
            color: matchedCustody ? matchedCustody.color : "",
            bgcolor: matchedCustody ? matchedCustody.bgcolor : "",
          });
        }
      });

      balance.push({
        id: "ETH",
        balance: Number(0).toFixed(6),
        euroBalance: Number(0),
        image: ETH ?? "",
        color: "#5C77BA",

        bgcolor: "#D3E5FF",
      });

      if (!balance.some((item) => item.id === "USDT")) {
        balance.push({
          id: "USDT",
          euroBalance: Number(0),
          balance: Number(0).toFixed(6),
          image: USDT ?? "",
          color: "#26A17B",
          bgcolor: "#11986E33",
        });
      }

      setKrakenBalance(balance);
    }
  };

  useMemo(() => {
    void getKrakenBalance();
  }, []);

  const [activeTab, setActiveTab] = useState({
    value: "kraken",
    label: "Kraken balance",
  });
  function switchTab(value: string, label: string) {
    setActiveTab({ value, label });
  }

  useEffect(() => {
    if (activeTab?.value === "MASTER") {
      void getAllBalance(activeTab?.value);
    }

    if (activeTab?.value === "GAS") {
      void getAllBalance(activeTab?.value);
    }

    if (activeTab?.value === "COMMISSION") {
      void getAllBalance(activeTab?.value);
    }
  }, [activeTab]);

  const tabs = [
    { name: "kraken", label: "Kraken Balance" },
    { name: "MASTER", label: "Master Wallet" },
    { name: "GAS", label: "Gas Wallet" },
    { name: "COMMISSION", label: "Commission Wallet" },
    // { name: "LIQUIDITY", label: "Liquidity Wallet" },
  ];

  async function handleGenerateWallet(walletName: string) {
    const data: FilterType = {
      walletName,
    };

    setCreateWalletLoading(true);
    const [res, error]: APIResult<{
      data: Project[];
      pagination: Pagination;
    }> = await ApiHandler(create_MASTER_GAS_COMMISSION_LIQUIDITY_WALLET, data);
    setCreateWalletLoading(false);

    if (res?.success) {
      res?.message ? toast.success(res?.message) : "";
      void getAllBalance(activeTab?.value);
    }
  }

  return (
    <div>
      <div>
        <p className=" py-4 text-2xl font-bold text-[#1E293B]">
          Asset Management
        </p>

        <div className="flex gap-2">
          {tabs.map((item, i) => (
            <MuiButton
              key={i}
              title={item.label}
              className={`${item.name === activeTab.value ? "btn-solid" : "btn-outlined"}`}
              onClick={() => {
                switchTab(item.name, item.label);
              }}
            ></MuiButton>
          ))}
        </div>
      </div>

      <div className="my-4 grid gap-4">
        {activeTab?.value === "kraken" && (
          <HeaderLayout name={activeTab.label}>
            {krakenBalance?.length && (
              <div className="grid grid-cols-1">
                <KrakenWallets
                  data={krakenBalance}
                  walletsLoading={krakenLoading}
                />
              </div>
            )}
          </HeaderLayout>
        )}
        {activeTab?.value === "MASTER" && (
          <HeaderLayout name={activeTab.label}>
            <div className="grid grid-cols-1">
              <MuiButton
                title={`Create ${activeTab.label} `}
                className="btn-solid"
                loading={createWalletLoading}
                onClick={() => {
                  enforcePermission(
                    "write",
                    () => void handleGenerateWallet(activeTab?.value),
                  );
                }}
              />
              <MasterWallet
                data={state?.masterWalletBalance}
                walletsLoading={walletsLoading}
              />
            </div>
          </HeaderLayout>
        )}
        {activeTab?.value === "GAS" && (
          <HeaderLayout name={activeTab.label}>
            <div className="grid grid-cols-1">
              <MuiButton
                title={`Create ${activeTab.label} `}
                className="btn-solid"
                loading={createWalletLoading}
                onClick={() => {
                  enforcePermission(
                    "write",
                    () => void handleGenerateWallet(activeTab?.value),
                  );
                }}
              />
              <GasWallet
                data={state?.gasWalletsBalance}
                walletsLoading={walletsLoading}
              />
            </div>
          </HeaderLayout>
        )}
        {activeTab?.value === "COMMISSION" && (
          <HeaderLayout name={activeTab.label}>
            <div className="grid grid-cols-1">
              <MuiButton
                title={`Create ${activeTab.label} `}
                className="btn-solid"
                loading={createWalletLoading}
                onClick={() => {
                  enforcePermission(
                    "write",
                    () => void handleGenerateWallet(activeTab?.value),
                  );
                }}
              />
              <CommissionWallet
                data={state?.commissionWalletsBalance}
                walletsLoading={walletsLoading}
              />
            </div>
          </HeaderLayout>
        )}

        {activeTab?.value === "LIQUIDITY" && (
          <HeaderLayout name={activeTab.label}>
            <div className="grid grid-cols-1">
              {/* <MuiButton
                title={`Create ${activeTab.label} `}
                className="btn-solid"
                loading={createWalletLoading}
                onClick={() => {
                  void handleGenerateWallet(activeTab?.value);
                }}
              /> */}
              <LiquidityWallets
                data={state?.liquidityWalletBalance}
                walletsLoading={walletsLoading}
              />
            </div>
          </HeaderLayout>
        )}
      </div>
    </div>
  );
};

export default AssetManagement;
