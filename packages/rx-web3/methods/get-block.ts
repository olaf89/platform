import * as Web3 from 'web3';
import { createWeb3, bind } from '../utils';
import { bindNodeCallback } from 'rxjs/observable/bindNodeCallback';
import { CurriedFunction2, curry, isNil } from 'ramda';
import { Observable } from 'rxjs/Observable';
import { tap } from 'rxjs/operators';

export const getBlock = curry(
  (provider: Web3.Provider, filter: 'latest' | string | number) => {
    const web3 = createWeb3(provider);
    const callback = bind(web3.eth.getBlock, web3);

    return bindNodeCallback(callback)(filter).pipe(
      tap(result => {
        if (isNil(result)) {
          throw Error('Invalid block');
        }
      })
    );
  }
);