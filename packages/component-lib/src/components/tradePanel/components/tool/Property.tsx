import {
  AddIcon,
  DeleteIcon,
  MetaProperty,
} from "@loopring-web/common-resources";
import { Trans, useTranslation } from "react-i18next";
import { Button, TextField } from "../../../basic-lib";
import { Box, Grid, IconButton } from "@mui/material";
import React from "react";

export const Properties = ({
  properties = [],
  handleChange,
}: {
  properties: MetaProperty[];
  handleChange: (properties: Array<Partial<MetaProperty>>) => void;
}) => {
  const { t } = useTranslation();
  const _handleChange = React.useCallback(
    (_property: Partial<MetaProperty>, index: number) => {
      let _properties = [...properties];
      _properties[index] = { ...(_properties[index] ?? {}), ..._property };
      handleChange(_properties);
      // properties.filter((item,_index) => index!== )
      // properties[index]
    },
    [properties, handleChange]
  );
  const onDelete = React.useCallback(
    (index: number) => {
      let _properties = [...properties];
      if (_properties.length > 1) {
        handleChange(_properties.filter((_item, _index) => _index !== index));
      }
    },
    [handleChange, properties]
  );
  const addItem = React.useCallback(() => {
    if (
      properties.length === 0 ||
      (properties[properties.length - 1] &&
        !!properties[properties.length - 1].key &&
        !!properties[properties.length - 1].value)
    ) {
      let _properties = [...properties, { key: "", value: "" }];
      handleChange(_properties);
    }
  }, [handleChange, properties]);
  React.useEffect(() => {
    if (!properties.length) {
      addItem();
    }
  }, []);
  return (
    <Box>
      {properties.map((property, index) => (
        <Grid container key={index} spacing={2} marginBottom={1}>
          <Property
            property={property}
            index={index}
            handleChange={_handleChange}
            onDelete={onDelete}
          />
        </Grid>
      ))}
      {properties[properties.length - 1] &&
        !!properties[properties.length - 1].key &&
        !!properties[properties.length - 1].value &&
        properties.length <= 5 && (
          <Box paddingTop={1}>
            <Button
              startIcon={<AddIcon />}
              size={"small"}
              variant={"outlined"}
              // variant={"contained"}
              onClick={addItem}
              title={t("labelPropertyAdd")}
            >
              {t("labelPropertyAdd")}
            </Button>
          </Box>
        )}
    </Box>
  );
};
export const Property = React.memo(
  React.forwardRef(
    ({
      property,
      index,
      handleChange,
      onDelete,
    }: {
      property: MetaProperty;
      index: number;
      handleChange: (property: Partial<MetaProperty>, index: number) => void;
      onDelete: (index: number) => void;
    }) => {
      // const [,] = React.useState<Partial<MetaProperty>>();
      const _handleChange = React.useCallback(
        (_property: Partial<MetaProperty>) => {
          handleChange({ ...property, ..._property }, index);
        },
        [handleChange, index, property]
      );

      return (
        <>
          <Grid item xs={5}>
            <TextField
              value={property.key}
              fullWidth
              required
              label={<Trans i18nKey={"labelMintPropertyKey"}>key</Trans>}
              type={"text"}
              onChange={(e) => _handleChange({ key: e.target.value })}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              value={property.value}
              fullWidth
              required
              label={<Trans i18nKey={"labelMintPropertyValue"}>Value</Trans>}
              type={"text"}
              onChange={(e) => _handleChange({ value: e.target.value })}
            />
          </Grid>
          <Grid
            item
            xs={1}
            display={"flex"}
            alignItems={"center"}
            justifyContent={"center"}
          >
            <IconButton
              sx={{ marginTop: 3 }}
              edge={"end"}
              // disabled={properties.length === 1 ? true : false}
              onClick={() => onDelete(index)}
            >
              <DeleteIcon color={"error"} />
            </IconButton>
          </Grid>
        </>
      );
    }
  )
);