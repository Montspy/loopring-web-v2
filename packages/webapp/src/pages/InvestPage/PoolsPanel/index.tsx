import { WithTranslation, withTranslation } from "react-i18next";
import { Box, Typography } from "@mui/material";
import styled from "@emotion/styled";

import React from "react";
import { useAmmMapUI } from "./hook";

import {
  PoolsTable,
  InputSearch,
  useSettings,
  useOpenModals,
  AmmPanelType,
} from "@loopring-web/component-lib";

import {
  store,
  useAccount,
  useSystem,
  useAmmActivityMap,
} from "@loopring-web/core";

const WrapperStyled = styled(Box)`
  flex: 1;
  display: flex;
  flex-direction: column;
  background: var(--color-box);
  border-radius: ${({ theme }) => theme.unit}px;
`;

const StylePaper = styled(Box)`
  width: 100%;
  //height: 100%;
  flex: 1;
  padding-bottom: ${({ theme }) => theme.unit}px;
  .rdg {
    flex: 1;
  }
` as typeof Box;

export const PoolsPanel = withTranslation("common")(
  <R extends { [key: string]: any }, I extends { [key: string]: any }>({
    t,
  }: WithTranslation & {}) => {
    const container = React.useRef(null);
    const { account } = useAccount();
    const {
      filteredData,
      sortMethod,
      tableHeight,
      getFilteredData,
      filterValue,
      rawData,
    } = useAmmMapUI();
    const { setShowAmm } = useOpenModals();
    const { coinJson } = useSettings();
    const { forex } = useSystem();
    const { tokenPrices } = store.getState().tokenPrices;
    const showLoading = rawData && !rawData.length;
    const { activityInProgressRules } = useAmmActivityMap();

    return (
      <>
        <WrapperStyled flex={1} marginBottom={3}>
          <Box
            marginBottom={3}
            display={"inline-flex"}
            flexDirection={"row"}
            justifyContent={"space-between"}
            paddingX={3}
            paddingTop={3}
            alignItems={"center"}
          >
            <Typography variant={"h5"} color={"textSecondary"} component={"h2"}>
              {t("labelLiquidityPageTitle")}
            </Typography>
            <InputSearch
              key={"search"}
              className={"search"}
              aria-label={"search"}
              placeholder={t("labelFilter")}
              value={filterValue}
              onChange={getFilteredData as any}
            />
          </Box>
          <StylePaper
            display={"flex"}
            flexDirection={"column"}
            ref={container}
            className={"table-divide"}
          >
            <PoolsTable
              {...{
                rawData: filteredData,
                showLoading: showLoading,
                tableHeight: tableHeight,
                sortMethod: sortMethod,
                activityInProgressRules,
                coinJson,
                forex,
                account,
                tokenPrices,
                handleWithdraw: (row) => {
                  // const pair = `${row.ammDetail.coinAInfo.name}-${row.ammDetail.coinBInfo.name}`;
                  const pair = `${row.coinAInfo.name}-${row.coinBInfo.name}`;

                  setShowAmm({
                    isShow: true,
                    type: AmmPanelType.Exit,
                    symbol: pair,
                  });
                },

                handleDeposit: (row) => {
                  const pair = `${row.coinAInfo.name}-${row.coinBInfo.name}`;
                  setShowAmm({
                    isShow: true,
                    type: AmmPanelType.Join,
                    symbol: pair,
                  });
                },
              }}
            />
          </StylePaper>
        </WrapperStyled>
      </>
    );
  }
);
