import { WithTranslation, withTranslation } from "react-i18next";
import React from "react";
import { AccountStatus } from "@loopring-web/common-resources";
import {
  boxLiner,
  DepositPanel,
  DepositTitle,
  useSettings,
} from "@loopring-web/component-lib";
import { useAccount } from "stores/account";
import { useDeposit } from "hooks/useractions/useDeposit";
import { Box, Typography } from "@mui/material";
import { BtnConnect } from "layouts/BtnConnect";
import styled from "@emotion/styled";
const BoxStyle = styled(Box)`
  max-height: 400px;
  width: var(--swap-box-width);
  ${({ theme }) => boxLiner({ theme })};
` as typeof Box;
export const DepositToPage = withTranslation(["common"])(
  ({ t }: WithTranslation) => {
    const { account } = useAccount();
    const { isMobile } = useSettings();
    const { depositProps } = useDeposit(true);
    const viewTemplate = React.useMemo(() => {
      switch (account.readyState) {
        case AccountStatus.UN_CONNECT:
          return (
            <Box
              flex={1}
              display={"flex"}
              justifyContent={"center"}
              flexDirection={"column"}
              alignItems={"center"}
            >
              <Typography
                marginTop={3}
                marginBottom={1}
                variant={isMobile ? "h4" : "h1"}
                textAlign={"center"}
              >
                {t("describeTitleConnectToWalletAsDeposit")}
              </Typography>
              <BtnConnect />
            </Box>
          );
          break;
        case AccountStatus.LOCKED:
        case AccountStatus.NO_ACCOUNT:
        case AccountStatus.NOT_ACTIVE:
        case AccountStatus.DEPOSITING:
        case AccountStatus.ACTIVATED:
          return (
            <Box
              flex={1}
              display={"flex"}
              justifyContent={"center"}
              flexDirection={"column"}
              alignItems={"center"}
            >
              <BoxStyle display={"flex"} flexDirection={"column"}>
                <Box
                  display={"flex"}
                  paddingTop={5 / 2}
                  alignItems={"center"}
                  justifyContent={"center"}
                >
                  <DepositTitle title={t("depositTitle")} />
                </Box>
                {/*<Typography*/}
                {/*  component={"h2"}*/}
                {/*  variant={"h4"}*/}
                {/*  paddingTop={5 / 2}*/}
                {/*  display={"inline-flex"}*/}
                {/*  alignItems={"center"}*/}
                {/*  justifyContent={"center"}*/}
                {/*  textAlign={"center"}*/}
                {/*>*/}
                {/*  {t("depositTitle")}*/}
                {/*</Typography>*/}

                <DepositPanel {...depositProps} />
              </BoxStyle>
            </Box>
          );
          break;
        case AccountStatus.ERROR_NETWORK:
          return (
            <Box
              flex={1}
              display={"flex"}
              justifyContent={"center"}
              flexDirection={"column"}
              alignItems={"center"}
            >
              <Typography
                marginY={3}
                variant={isMobile ? "h4" : "h1"}
                textAlign={"center"}
              >
                {t("describeTitleOnErrorNetwork", {
                  connectName: account.connectName,
                })}
              </Typography>
            </Box>
          );
          break;
        default:
          break;
      }
    }, [account.readyState, account.connectName, t]);
    return <>{viewTemplate}</>;
  }
);
