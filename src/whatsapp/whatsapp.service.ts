import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class WhatsappService {
  private readonly logger = new Logger(WhatsappService.name);
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly instance: string;

  constructor(private configService: ConfigService) {
    this.baseUrl = this.configService.get<string>('EVOLUTION_API_URL') ?? '';
    this.apiKey = this.configService.get<string>('EVOLUTION_API_KEY') ?? '';
    this.instance = this.configService.get<string>('EVOLUTION_INSTANCE') ?? '';
  }

  async sendMessage(groupId: string, message: string) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/message/sendText/${this.instance}`,
        {
          number: groupId,
          text: message,
        },
        {
          headers: { apikey: this.apiKey },
        },
      );
      this.logger.log('✅ Mensaje enviado correctamente');
      return response.data;
    } catch (error) {
      this.logger.error(
        'Error al enviar mensaje:',
        error.response?.data || error.message,
      );
      throw error;
    }
  }
}
