import { forkJoin } from 'rxjs/observable/forkJoin';
import {
  map as rxMap,
  catchError,
  mergeMap,
  tap,
  first,
  defaultIfEmpty
} from 'rxjs/operators';
import { chain, isEmpty } from 'ramda';
import { ActionsObservable } from 'redux-observable';
import { of } from 'rxjs/observable/of';

import {
  createQueryEventsSuccess,
  createQueryEventsFailed,
  QUERY_EVENTS,
  QueryEvents,
  QueryEventsFailed,
  QueryEventsSuccess
} from '../actions';
import { Observable } from 'rxjs/Observable';
import { EpicContext } from '../../../context';
import {
  createEventCache,
  getFiltersToLoad,
  getEventsForFilter
} from '../cache';
import * as fromSchema from '../../schema';

export const queryEvents = (
  action$: ActionsObservable<QueryEvents>,
  store,
  { getEvents }: EpicContext
) => {
  const cache = createEventCache();
  action$.subscribe(console.log);

  return action$.ofType(QUERY_EVENTS).pipe(
    mergeMap(({ payload: { filters, id } }) => {
      const loadAll$ = of(...filters).pipe(
        mergeMap(f => getFiltersToLoad(cache.getState(), f)),
        tap(cache.request),
        mergeMap(f =>
          getEvents(f).pipe(
            tap({
              next: cache.result(f),
              error: cache.error(f)
            })
          )
        ),
        defaultIfEmpty([])
      );

      const pendingLoaded$ = cache
        .select(state =>
          filters.every(f => isEmpty(getFiltersToLoad(state, f)))
        )
        .pipe(first());

      return forkJoin(loadAll$, pendingLoaded$, of(null))
        .pipe(
          mergeMap(() =>
            cache.select(state =>
              chain(f => getEventsForFilter(f, state), filters)
            )
          ),
          first(),
          rxMap(fromSchema.getLogDecoder(store.getState()))
        )
        .pipe(
          rxMap(events => createQueryEventsSuccess({ id, events })),
          catchError(err => {
            console.error(err);
            return of(createQueryEventsFailed(id));
          })
        );
    })
  );
};
