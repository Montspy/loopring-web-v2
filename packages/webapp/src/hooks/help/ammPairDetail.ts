import { AmmDetailBase, AmmInData } from '@loopring-web/common-resources';
import { myLog } from 'utils/log_tools';
import { volumeToCountAsBigNumber } from './volumeToCount';

export function ammPairInit<C>({
                                fee,
                                pair,
                                _ammCalcData,
                                coinMap,
                                walletMap,
                                ammMap,
                                tickerData,
                                ammPoolSnapshot
                            }: any): AmmInData<C> {
    _ammCalcData.coinInfoMap = coinMap;
    if (tickerData) {
        _ammCalcData.AtoB = Number(tickerData.close)
    }
    if (isNaN(_ammCalcData.AtoB) && ammPoolSnapshot) {
        const baseVol = volumeToCountAsBigNumber(pair.coinAInfo.simpleName, ammPoolSnapshot.pooled[ 0 ].volume);
        const quoteVol = volumeToCountAsBigNumber(pair.coinBInfo.simpleName, ammPoolSnapshot.pooled[ 1 ].volume);
        _ammCalcData.AtoB = quoteVol && baseVol && parseFloat(quoteVol.div(baseVol).toFixed(7, 0) as string)
    }

    let coinACount = 0, coinBCount = 0, percentage = 0
    if (pair.coinAInfo) {

        _ammCalcData.myCoinA = {
            belong: pair.coinAInfo.simpleName,
            balance: walletMap ? walletMap[ pair.coinAInfo.simpleName ]?.count : 0,
        }

        const feeReal = !!fee ? fee : 0

        const balanceB = walletMap ? walletMap[ pair.coinBInfo.simpleName ]?.count - feeReal : 0

        _ammCalcData.myCoinB = {
            belong: pair.coinBInfo.simpleName,
            balance: balanceB < 0 ? 0 : balanceB,
        }

        const key = `${pair.coinAInfo.simpleName}-${pair.coinBInfo.simpleName}`;
        if (walletMap) {
            const lpCoin = 'LP-' + key
            const balance = (walletMap && walletMap[ lpCoin ]) ? walletMap[ lpCoin ].count : 0;
            const ammInfo = ammMap[ 'AMM-' + key ]
            const {totalLPToken, totalA, totalB}: AmmDetailBase<any> = ammInfo

            myLog('ammInfo:', ammInfo)

            if (totalA && totalLPToken && totalB) {
                percentage = totalLPToken ? balance / totalLPToken : 0

                coinACount = totalA * percentage

                coinBCount = totalB * percentage
            }
            _ammCalcData.lpCoin = { belong: lpCoin, balance, }
        }

        _ammCalcData.lpCoinA = {
            belong: pair.coinAInfo.simpleName,
            balance: coinACount,
        }
        _ammCalcData.lpCoinB = {
            belong: pair.coinBInfo.simpleName,
            balance: coinBCount,
        }

        _ammCalcData.percentage = percentage
    }

    return _ammCalcData
}
