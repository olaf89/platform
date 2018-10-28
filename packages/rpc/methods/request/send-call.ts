import { curry, pipe } from 'ramda';
import { getMethodID, send, strip0x, extractNonTuple } from '../../utils';
import {
  Provider,
  RequestInputParams,
  Tag,
  NumberLike,
  FunctionDescription
} from '../../interfaces';
import { formatRequestInput, encodeArgs, decodeArgs } from './formatters';
import { formatBlockNr } from '../../formatters';

export interface CallInput<T = any> {
  abi: FunctionDescription;
  args: T;
  txParams: RequestInputParams;
  atBlock?: Tag | NumberLike;
}

/**
 * https://github.com/ethereum/wiki/wiki/JSON-RPC#eth_call
 */
export const sendCall = curry(
  (provider: Provider, input: CallInput): Promise<any> => {
    const { atBlock = 'latest' } = input;
    const request = {
      ...input.txParams,
      data: toData(input)
    };
    const resultParser = fromResult(input);

    return send(provider)({
      method: 'eth_call',
      params: [formatRequestInput(request), formatBlockNr(atBlock)]
    }).then(resultParser);
  }
);

function toData({ abi, args }: CallInput) {
  return getMethodID(abi) + encodeArgs(abi, args);
}

const fromResult = curry(({ abi }: CallInput, result: string) => {
  // Is this necessary?
  if (!result) {
    return result;
  }

  const decoder = decodeArgs(abi);

  return pipe(
    strip0x,
    decoder,
    extractNonTuple
  )(result);
});
