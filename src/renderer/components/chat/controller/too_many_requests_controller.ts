import { BehaviorSubject } from "rxjs";
import { Rxjs } from "~/shared/rxjs";

export enum TooManyRequestsState {
  Ask = "ask",
  Retry = "retry",
  Abort = "abort",
}

export default class TooManyRequestsController {
  protected _subject = new BehaviorSubject(TooManyRequestsState.Abort);

  readonly subject = Rxjs.asImmutable(this._subject);

  constructor() {
    this.markAsAsk = this.markAsAsk.bind(this);
    this.markAsRetry = this.markAsRetry.bind(this);
    this.markAsAbort = this.markAsAbort.bind(this);
  }

  get state() {
    return this._subject.value;
  }

  async markAsAsk() {
    this._subject.next(TooManyRequestsState.Ask);
    await Rxjs.waitUntil(
      this._subject,
      (state) => state !== TooManyRequestsState.Ask
    );
    const next = this._subject.value;
    return next ?? TooManyRequestsState.Ask;
  }

  markAsRetry() {
    this._subject.next(TooManyRequestsState.Retry);
  }

  markAsAbort() {
    this._subject.next(TooManyRequestsState.Abort);
  }
}
