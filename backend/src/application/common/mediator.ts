export interface IRequest<TResponse> {
  readonly __tag: string;
  readonly __response?: TResponse;
}

export interface IRequestHandler<TRequest extends IRequest<TResponse>, TResponse> {
  handle(request: TRequest): Promise<TResponse>;
}

export class Mediator {
  private handlers = new Map<string, any>();

  register<TRequest extends IRequest<TResponse>, TResponse>(
    requestTag: string,
    handler: IRequestHandler<TRequest, TResponse>
  ) {
    this.handlers.set(requestTag, handler);
  }

  async send<TResponse>(request: IRequest<TResponse>): Promise<TResponse> {
    const handler = this.handlers.get(request.__tag);
    if (!handler) {
      throw new Error(`No request handler registered for request type: ${request.__tag}`);
    }
    return handler.handle(request);
  }
}
