import { Checkbox, Grid } from "@mui/material";
import { withTranslation, WithTranslation } from "react-i18next";
import { FormControlLabel, InputSearch } from "../../../";
import { CheckBoxIcon, CheckedIcon } from "@loopring-web/common-resources";
import {
  TokenType,
  // RawDataAssetsItem
} from "../AssetsTable";

export type TokenTypeCol = {
  type: TokenType;
  value: string;
};
export interface FilterProps {
  hideLpToken: boolean;
  hideSmallBalances: boolean;
  setHideLpToken: (value: boolean) => void;
  setHideSmallBalances: (value: boolean) => void;
  filter: {
    searchValue: string;
  };
  handleFilterChange: (props: { searchValue: string }) => void;
}

export enum CheckboxType {
  smallBalance = "smallBalance",
  lp = "lp",
}

export const Filter = withTranslation("tables", { withRef: true })(
  ({
    t,
    handleFilterChange,
    filter,
    hideLpToken,
    hideSmallBalances,
    setHideLpToken,
    setHideSmallBalances,
  }: FilterProps & WithTranslation) => {
    return (
      <Grid container spacing={4} justifyContent={"space-between"}>
        <Grid item>
          <InputSearch
            value={filter.searchValue}
            onChange={(value: any) => {
              handleFilterChange({ searchValue: value });
            }}
          />
        </Grid>

        <Grid item>
          <FormControlLabel
            control={
              <Checkbox
                checked={hideLpToken}
                checkedIcon={<CheckedIcon />}
                icon={<CheckBoxIcon />}
                color="default"
                onChange={(event) => {
                  setHideLpToken(event.target.checked);
                }}
              />
            }
            label={t("labelHideLPToken")}
          />
          <FormControlLabel
            style={{ marginRight: 0, paddingRight: 0 }}
            control={
              <Checkbox
                checked={hideSmallBalances}
                checkedIcon={<CheckedIcon />}
                icon={<CheckBoxIcon />}
                color="default"
                onChange={(event) => {
                  setHideSmallBalances(event.target.checked);
                }}
              />
            }
            label={t("labelHideSmallBalances")}
          />
        </Grid>
      </Grid>
    );
  }
);
