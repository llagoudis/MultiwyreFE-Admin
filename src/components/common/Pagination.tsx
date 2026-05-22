import React from "react";
import Button from "./Button";
import EastIcon from "@mui/icons-material/East";
import WestIcon from "@mui/icons-material/West";

type pageModel = {
  page: number;
  pageSize: number;
};

type propType = {
  handlePrevPage: () => void;
  handleNextPage: () => void;
  paginationModel: pageModel;
  rowLength: number;
};

const Pagination = ({
  handlePrevPage,
  handleNextPage,
  paginationModel,
  rowLength,
}: propType) => {
  const startIndex = paginationModel.page * paginationModel.pageSize + 1;
  const endIndex = Math.min(
    (paginationModel.page + 1) * paginationModel.pageSize,
    rowLength,
  );

  const displayText = `${startIndex}-${endIndex} of ${rowLength}`;

  return (
    <div className="flex  items-center justify-end gap-20 py-3">
      <h1 className="font-medium text-[#64748B]">
        {displayText} of {rowLength}
      </h1>
      <div className="flex gap-5">
        <Button
          onClick={handlePrevPage}
          title="Previous"
          className={`${
            paginationModel.page === 0 ? "btn-disable" : "btn-outlined"
          }`}
          disabled={paginationModel.page === 0}
        >
          <WestIcon />
        </Button>
        <Button
          onClick={handleNextPage}
          className={`${
            paginationModel.page ===
            Math.ceil(rowLength / paginationModel.pageSize) - 1
              ? "btn-disable"
              : "btn-outlined"
          }`}
          disabled={
            paginationModel.page ===
            Math.ceil(rowLength / paginationModel.pageSize) - 1
          }
          title="Next"
        >
          <EastIcon />
        </Button>
      </div>
    </div>
  );
};

export default Pagination;
