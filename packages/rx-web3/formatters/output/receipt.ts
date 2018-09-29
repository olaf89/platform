import {
  TransactionReceipt,
  RawTransactionReceipt,
  RawLog,
  Log,
  TransactionStatus
} from '../../interfaces';
import { evolve, when, pipe, map } from 'ramda';
import { ethHexToNumber, isNotNil } from '../../utils';
import { fromLog } from './log';

export function fromReceipt(
  receipt: RawTransactionReceipt | null
): TransactionReceipt | null {
  if (!receipt) {
    return null;
  }

  return evolve(
    {
      blockNumber: when(isNotNil, ethHexToNumber),
      cumulativeGasUsed: ethHexToNumber,
      gasUsed: ethHexToNumber,
      status: pipe(
        ethHexToNumber,
        numberToTxStatus
      ),
      transactionIndex: when(isNotNil, ethHexToNumber),
      logs: map(fromLog)
    },
    receipt
  );
}

function numberToTxStatus(number: number): TransactionStatus {
  return number;
}
