import { IConfigRepository } from '../../../domain/repositories/config.repository';
import { IRequest, IRequestHandler } from '../../common/mediator';

export class GetTemplatesQuery implements IRequest<any[]> {
  readonly __tag = 'GetTemplatesQuery';
}

export class GetTemplatesQueryHandler implements IRequestHandler<GetTemplatesQuery, any[]> {
  constructor(private configRepo: IConfigRepository) {}

  async handle(query: GetTemplatesQuery): Promise<any[]> {
    return this.configRepo.findTemplates();
  }
}
