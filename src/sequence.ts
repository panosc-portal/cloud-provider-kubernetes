import { inject } from '@loopback/context';
import {
  FindRoute,
  InvokeMethod,
  ParseParams,
  Reject,
  RequestContext,
  RestBindings,
  Send,
  SequenceHandler
} from '@loopback/rest';

const SequenceActions = RestBindings.SequenceActions;

export class MySequence implements SequenceHandler {
  constructor(
    @inject(SequenceActions.FIND_ROUTE) protected _findRoute: FindRoute,
    @inject(SequenceActions.PARSE_PARAMS) protected _parseParams: ParseParams,
    @inject(SequenceActions.INVOKE_METHOD) protected _invoke: InvokeMethod,
    @inject(SequenceActions.SEND) public send: Send,
    @inject(SequenceActions.REJECT) public reject: Reject
  ) {}

  async handle(context: RequestContext) {
    try {
      const { request, response } = context;
      const route = this._findRoute(request);
      const args = await this._parseParams(request, route);
      const result = await this._invoke(route, args);
      this.send(response, result);
    } catch (err) {
      this.reject(context, err);
    }
  }
}
