import { IRequest, IRequestHandler } from '../../common/mediator';
import { IConfigRepository } from '../../../domain/repositories/config.repository';
import { ICryptoService } from '../../services/crypto.service';

export class GetRazorpayPublicKeyQuery implements IRequest<{ keyId: string | null }> {
    readonly __tag = 'GetRazorpayPublicKeyQuery';
}

export class GetRazorpayPublicKeyQueryHandler
    implements IRequestHandler<GetRazorpayPublicKeyQuery, { keyId: string | null }> {
    constructor(
        private readonly configRepository: IConfigRepository,
        private readonly cryptoService: ICryptoService
    ) { }

    async handle(): Promise<{ keyId: string | null }> {
        const config = await this.configRepository.findIntegration('RAZORPAY');

        if (!config || !config.isActive) {
            return { keyId: null };
        }

        const credentials = this.cryptoService.decryptCredentials(config.credentials);

        return {
            keyId: credentials.keyId ?? null,
        };
    }
}