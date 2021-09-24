import { AccountStatus, IBData, MarketType, myLog } from '@loopring-web/common-resources';
import React from 'react';
import { useToast } from 'hooks/common/useToast';
import { LoopringAPI } from 'api_wrapper';
import * as sdk from 'loopring-sdk';
import { walletLayer2Service } from 'services/socket';
import { MarketTradeData, TradeBaseType, TradeBtnStatus, TradeProType, useSettings } from '@loopring-web/component-lib';
import { usePageTradePro } from 'stores/router';
import { useAccount } from 'stores/account';
import { useTokenMap } from 'stores/token';
import { useSystem } from 'stores/system';
import { useTranslation } from 'react-i18next';
import { useSubmitBtn } from './hookBtn';
import { VolToNumberWithPrecision } from 'utils/formatter_tool';
import { usePlaceOrder } from 'hooks/common/useTrade';
import store from 'stores';

export const useMarket = <C extends { [ key: string ]: any }>(market: MarketType): {
    [ key: string ]: any;
    // market: MarketType|undefined;
    // marketTicker: MarketBlockProps<C> |undefined,
} => {
    const {t} = useTranslation();
    const {tokenMap, marketArray, marketMap,} = useTokenMap();
    const [alertOpen, setAlertOpen] = React.useState<boolean>(false);
    const [confirmOpen, setConfirmOpen] = React.useState<boolean>(false);
    const {toastOpen, setToastOpen, closeToast} = useToast();
    const {account} = useAccount();
    const {slippage} = useSettings()
    // const [marketTradeData, setMarketTradeData] = React.useState<MarketTradeData<IBData<C>> | undefined>(undefined);
    const {
        pageTradePro,
        updatePageTradePro,
        __SUBMIT_LOCK_TIMER__,
        __TOAST_AUTO_CLOSE_TIMER__
    } = usePageTradePro();

    // @ts-ignore
    const [, baseSymbol, quoteSymbol] = market.match(/(\w+)-(\w+)/i);
    const walletMap = pageTradePro.tradeCalcProData?.walletMap ?? {}
    const [isMarketLoading, setIsMarketLoading] = React.useState(false)
    const {exchangeInfo} = useSystem();

    const [marketTradeData, setMarketTradeData] = React.useState<MarketTradeData<IBData<any>>>(
        // pageTradePro.market === market ?
        {
            base: {
                belong: baseSymbol,
                balance: walletMap ? walletMap[ baseSymbol as string ]?.count : 0,
            } as IBData<any>,
            quote: {
                belong: quoteSymbol,
                balance: walletMap ? walletMap[ quoteSymbol as string ]?.count : 0,
            } as IBData<any>,
            slippage: slippage && slippage !== 'N' ? slippage : 0.5,
            type: TradeProType.buy
        }
    )
    React.useEffect(() => {
        // if(walletMap[ baseSymbol as string ])
        // if(walletMap)
        const walletMap = pageTradePro.tradeCalcProData?.walletMap ?? {}
        setMarketTradeData((state) => {
            return {
                ...state,
                base: {
                    ...state.base,
                    // belong: baseSymbol,
                    balance: walletMap ? walletMap[ baseSymbol as string ]?.count : 0,
                } as IBData<any>,
                quote: {
                    ...state.quote,
                    balance: walletMap ? walletMap[ quoteSymbol as string ]?.count : 0,
                } as IBData<any>,
            }
        })
    }, [pageTradePro.tradeCalcProData?.walletMap])

    React.useEffect(() => {
        if (marketTradeData.base.belong !== baseSymbol || marketTradeData.quote.belong !== quoteSymbol) {
            setMarketTradeData((state) => {
                return {
                    ...state,
                    base: {
                        belong: baseSymbol,
                        balance: walletMap ? walletMap[ baseSymbol as string ]?.count : 0,
                    } as IBData<any>,
                    quote: {
                        belong: quoteSymbol,
                        balance: walletMap ? walletMap[ quoteSymbol as string ]?.count : 0,
                    } as IBData<any>,

                }
            })
        }

    }, [baseSymbol, quoteSymbol])

    // React.useEffect(() => {
    //     if (pageTradePro.market === market && pageTradePro.depth) {
    //         setIsMarketLoading(false)
    //     } else {
    //         setIsMarketLoading(true)
    //     }
    // }, [market, pageTradePro.depth, pageTradePro.market])

    const {makeMarketReqInHook} = usePlaceOrder()

    const onChangeMarketEvent = React.useCallback((tradeData: MarketTradeData<IBData<any>>, formType: TradeBaseType) => {

        const pageTradePro = store.getState()._router_pageTradePro.pageTradePro
        // myLog(`onChangeMarketEvent depth:`, pageTradePro.depth)
        // myLog(`onChangeMarketEvent ammPoolSnapshot:`, pageTradePro.ammPoolSnapshot)
        if (!pageTradePro.depth && !pageTradePro.ammPoolSnapshot) {
            // myLog(`onChangeMarketEvent data not ready!`)
            setIsMarketLoading(true)
            return
        }

        myLog(`onChangeMarketEvent tradeData:`, tradeData, 'formType',formType)

        // setMarketTradeData(tradeData)

        let slippage = sdk.toBig(tradeData.slippage ? tradeData.slippage : '0.5').times(100).toString()

        let amountBase = formType === TradeBaseType.base ? tradeData.base.tradeValue : undefined
        let amountQuote = formType === TradeBaseType.quote ? tradeData.quote.tradeValue : undefined

        if (formType === TradeBaseType.tab) {
            amountBase = tradeData.base.tradeValue ? tradeData.base.tradeValue : undefined
            amountQuote = amountBase !== undefined ? undefined : tradeData.quote.tradeValue ? tradeData.quote.tradeValue : undefined
        }

        let {marketRequest,calcTradeParams} = makeMarketReqInHook({
            isBuy: tradeData.type === 'buy',
            base: tradeData.base.belong,
            quote: tradeData.quote.belong,
            amountBase,
            amountQuote,
            marketArray,
            marketMap,
            depth: pageTradePro.depth,
            ammPoolSnapshot: pageTradePro.ammPoolSnapshot,
            slippage,
        })

        myLog('marketRequest:',marketRequest, calcTradeParams)

        updatePageTradePro({
            market,
            request: marketRequest as any,
            calcTradeParams: calcTradeParams,
            tradeCalcProData: {
                ...pageTradePro.tradeCalcProData,
                fee:calcTradeParams ? calcTradeParams.feeBips: undefined,
                minimumReceived: calcTradeParams? calcTradeParams.amountBOutSlip?.minReceivedVal: undefined,
                priceImpact: calcTradeParams? calcTradeParams.priceImpact:undefined,
            }
        })
        setMarketTradeData((state)=>{
            let baseValue = undefined;
            let quoteValue = undefined;
            if(calcTradeParams){
                 baseValue = calcTradeParams.isReverse? calcTradeParams.buyAmt as number:calcTradeParams.sellAmt  as number;
                 quoteValue = calcTradeParams.isReverse? calcTradeParams.sellAmt as number: calcTradeParams.buyAmt  as number;
            }
            return{
                ...state,
                base:{
                    ...state.base,
                    tradeValue:  baseValue
                },
                quote:{
                    ...state.quote,
                    tradeValue: quoteValue
                }
            }
        })

    }, [])

    const marketSubmit = React.useCallback(async (event: MouseEvent, isAgree?: boolean) => {
        const {calcTradeParams, request, tradeCalcProData,} = pageTradePro;
        setAlertOpen(false)
        setConfirmOpen(false)

        if (isAgree) {

            setIsMarketLoading(true);
            if (!LoopringAPI.userAPI || !tokenMap || !exchangeInfo
                || !calcTradeParams || !request
                || account.readyState !== AccountStatus.ACTIVATED) {

                setToastOpen({open: true, type: 'error', content: t('labelSwapFailed')})
                setIsMarketLoading(false)

                return
            }

            const baseToken = tokenMap[ marketTradeData?.base.belong as string ]
            // const quoteToken = tokenMap[ marketTradeData?.quote.belong as string ]
            try {

                const req: sdk.GetNextStorageIdRequest = {
                    accountId: account.accountId,
                    sellTokenId: baseToken.tokenId
                }

                const storageId = await LoopringAPI.userAPI.getNextStorageId(req, account.apiKey)

                request.storageId = storageId.orderId

                myLog(request)

                const response = await LoopringAPI.userAPI.submitOrder(request, account.eddsaKey.sk, account.apiKey)

                myLog(response)

                if (!response?.hash) {
                    setToastOpen({open: true, type: 'error', content: t('labelSwapFailed')})
                    myLog(response?.resultInfo)
                } else {
                    await sdk.sleep(__TOAST_AUTO_CLOSE_TIMER__)

                    const resp = await LoopringAPI.userAPI.getOrderDetails({
                        accountId: account.accountId,
                        orderHash: response.hash
                    }, account.apiKey)

                    myLog('-----> resp:', resp)

                    if (resp.orderDetail?.status !== undefined) {
                        switch (resp.orderDetail?.status) {
                            case sdk.OrderStatus.cancelled:
                                setToastOpen({open: true, type: 'warning', content: t('labelSwapCancelled')})
                                break
                            case sdk.OrderStatus.processed:
                                setToastOpen({open: true, type: 'success', content: t('labelSwapSuccess')})
                                break
                            default:
                                setToastOpen({open: true, type: 'error', content: t('labelSwapFailed')})
                        }
                    }
                    walletLayer2Service.sendUserUpdate()
                    setMarketTradeData((state) => {
                        return {
                            ...state,
                            base: {...state?.base, tradeValue: 0},
                            quote: {...state?.quote, tradeValue: 0},
                        } as MarketTradeData<IBData<C>>
                    });
                    updatePageTradePro({
                        market: market as MarketType,
                        tradeCalcProData: {
                            ...tradeCalcProData,
                            minimumReceived: undefined,
                            priceImpact: undefined,
                            fee: undefined
                        }
                    })

                }
            } catch (reason) {
                sdk.dumpError400(reason)
                setToastOpen({open: true, type: 'error', content: t('labelSwapFailed')})

            }

            // setOutput(undefined)

            await sdk.sleep(__SUBMIT_LOCK_TIMER__)

            setIsMarketLoading(false)

        }

    }, [account.readyState, pageTradePro, tokenMap, marketTradeData, setIsMarketLoading, setToastOpen, setMarketTradeData])
    const availableTradeCheck = React.useCallback((): { tradeBtnStatus: TradeBtnStatus, label: string } => {

        const {calcTradeParams, quoteMinAmtInfo, baseMinAmtInfo} = pageTradePro;
        if (account.readyState === AccountStatus.ACTIVATED) {
            const type = marketTradeData.type === TradeProType.sell ? 'quote' : 'base';
            const minAmt = type === 'quote' ? quoteMinAmtInfo?.minAmount : baseMinAmtInfo?.minAmount;
            const validAmt = !!(calcTradeParams?.amountBOut && minAmt
                && sdk.toBig(calcTradeParams?.amountBOut).gte(sdk.toBig(minAmt)));

            if (marketTradeData?.base.tradeValue === undefined
                || marketTradeData?.quote.tradeValue === undefined
                || marketTradeData?.base.tradeValue === 0
                || marketTradeData?.quote.tradeValue === 0) {
                return {tradeBtnStatus: TradeBtnStatus.DISABLED, label: 'labelEnterAmount'}
            } else if (validAmt || minAmt === undefined) {
                return {tradeBtnStatus: TradeBtnStatus.AVAILABLE, label: ''}
            } else {
                const symbol: string = marketTradeData[ type ].belong;
                const minOrderSize = VolToNumberWithPrecision(minAmt, symbol) + ' ' + symbol;
                return {tradeBtnStatus: TradeBtnStatus.DISABLED, label: `labelLimitMin, ${minOrderSize}`}
            }
        }
        return {tradeBtnStatus: TradeBtnStatus.AVAILABLE, label: ''}
    }, [account.readyState, pageTradePro, marketTradeData])

    const {
        btnStatus: tradeMarketBtnStatus,
        onBtnClick: marketBtnClick,
        btnLabel: tradeMarketI18nKey,
        btnStyle: tradeMarketBtnStyle
        // btnClickCallbackArray
    } = useSubmitBtn({
        availableTradeCheck: availableTradeCheck,
        isLoading: isMarketLoading,
        submitCallback: marketSubmit
    })

    return {
        alertOpen,
        confirmOpen,
        toastOpen,
        closeToast,
        isMarketLoading,
        marketSubmit,
        marketTradeData,
        onChangeMarketEvent,
        tradeMarketBtnStatus,
        tradeMarketI18nKey,
        marketBtnClick,
        tradeMarketBtnStyle
        // marketTicker,
    }
}