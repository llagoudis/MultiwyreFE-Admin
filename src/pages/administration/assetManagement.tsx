import React, { useEffect, useState } from "react";
import HeaderLayout from "~/components/common/HeaderLayout";
import { useForm } from "react-hook-form";
import MuiButton from "~/components/common/Button";
import { ApiHandler } from "~/service/UtilService";
import {
  create_MASTER_GAS_COMMISSION_LIQUIDITY_WALLET,
  fetch_MASTER_GAS_COMMISSION_BALANCE,
} from "~/service/ApiRequests";
import toast from "react-hot-toast";
import CommissionWallet from "./administration-assets/commissionWallet";
import GasWallet from "./administration-assets/gasWallet";
import BeneficiaryDetails from "./administration-assets/BeneficiaryDetails";
import OtcDepositAddresses from "./administration-assets/OtcDepositAddresses";
import { enforcePermission } from "~/utils/permissions";

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

const AssetManagement = () => {
  const {} = useForm<formData>();

  const [state, setState] = useState<MASTER_GAS_COMMISSION>({
    masterWalletBalance: [],
    gasWalletsBalance: [],
    commissionWalletsBalance: [],
    liquidityWalletBalance: [],
  });

  const [walletsLoading, setWalletsLoading] = useState(false);
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
            assetAddress: item?.assetAddress,
            createdAt: item?.createdAt,
            color: "#5C77BA",
            bgcolor: "#D3E5FF",
          });
        });

      res?.body?.commissionWalletsBalance
        ?.filter((item) => item !== null)
        ?.map((item) => {
          commissionWalletsBalance.push({
            id: item?.id,
            balance: Number(item.balance).toFixed(6),
            adminUserId: item?.adminUserId,
            vaultId: item?.vaultId,
            asset: item?.asset,
            assetAddress: item?.assetAddress,
            createdAt: item?.createdAt,
            color: "#5C77BA",
            bgcolor: "#D3E5FF",
          });
        });

      res?.body?.liquidityWalletBalance?.map((item) => {
        liquidityWalletBalance.push({
          id: item?.id,
          balance: Number(item.balance).toFixed(6),
          adminUserId: item?.adminUserId,
          vaultId: item?.vaultId,
          asset: item?.asset,
          assetAddress: item?.assetAddress,
          createdAt: item?.createdAt,
          color: "#5C77BA",
          bgcolor: "#D3E5FF",
        });
      });

      setState({
        masterWalletBalance,
        gasWalletsBalance,
        commissionWalletsBalance,
        liquidityWalletBalance,
      });
    }
  };

  const [activeTab, setActiveTab] = useState({
    value: "GAS",
    label: "Gas Wallet",
  });
  function switchTab(value: string, label: string) {
    setActiveTab({ value, label });
  }

  useEffect(() => {
    if (activeTab?.value === "GAS") {
      void getAllBalance(activeTab?.value);
    }

    if (activeTab?.value === "COMMISSION") {
      void getAllBalance(activeTab?.value);
    }
  }, [activeTab]);

  const tabs = [
    { name: "GAS", label: "Gas Wallet" },
    { name: "COMMISSION", label: "Commission Wallet" },
    { name: "BENEFICIARY", label: "Beneficiary Details" },
    { name: "OTC_DEPOSIT", label: "OTC Deposit Addresses" },
    // Deposit Wallets removed — same lists live under E-Commerce → Wallets.
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

      <div className="my-4 grid max-w-full min-w-0 gap-4 overflow-hidden">
        {activeTab?.value === "BENEFICIARY" && (
          <HeaderLayout name={activeTab.label}>
            <BeneficiaryDetails />
          </HeaderLayout>
        )}
        {activeTab?.value === "OTC_DEPOSIT" && (
          <HeaderLayout name={activeTab.label}>
            <OtcDepositAddresses />
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
      </div>
    </div>
  );
};

export default AssetManagement;
