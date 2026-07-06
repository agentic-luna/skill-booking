import { IConfigRepository } from '../../../domain/repositories/config.repository';
import { IRequest, IRequestHandler } from '../../common/mediator';

export class UpdateTemplateCommand implements IRequest<any> {
  readonly __tag = 'UpdateTemplateCommand';
  constructor(
    public readonly templateId: string,
    public readonly data: {
      bodyContent?: string;
      subject?: string | null;
      isActive?: boolean;
      variables?: any;
    }
  ) {}
}

export class UpdateTemplateCommandHandler implements IRequestHandler<UpdateTemplateCommand, any> {
  constructor(private configRepo: IConfigRepository) {}

  async handle(command: UpdateTemplateCommand): Promise<any> {
    const { templateId, data } = command;
    return this.configRepo.updateTemplate(templateId, data);
  }
}
