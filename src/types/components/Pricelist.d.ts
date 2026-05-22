interface CommonPricelistProps {
  data: PriceList;
}

interface FeeType {
  TransferFees?: TransferFees[];
  recurringFees?: RecurringFees[];
  fxmarkup?: FXMarkup[];
}
interface FeeTypeIndividuals {
  TransferFees?: TransferFees[];
  recurringFees?: RecurringFees[];
  fxmarkup?: FXMarkup[];
}

interface DetailsBody {
  Details: {
    "Source price list": string;
    "Client type": string;
    Status: string;
    Standard: string;
    "External fee enabled": string;
    "Created At": string;
  };
  clients: {
    "Outgoing Transfers": string;
    "Created At": string;
  };
  Fees: FeeType[];
}

interface LimitDetailsBody {
  Details: {
    "Client type": string;
    "Limit name": string;
    "Created At": string;
    // Status?: string;
  };
  Limits: ExchangeLimits[];
}
