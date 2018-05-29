import { ActionsObservable } from 'redux-observable';
import { map, retry, catchError } from 'rxjs/operators';
import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';

import { EpicContext } from '../../context';
import * as actions from './actions';

export const watchLatestBlock = (
  _: ActionsObservable<any>,
  __,
  { watchLatestBlock }: EpicContext
): Observable<actions.Types> => {
  return watchLatestBlock().pipe(
    retry(10),
    map(actions.createUpdateLatestBlock),
    catchError(err => of(actions.createUpdateLatestBlockFailed(err)))
  );
};
