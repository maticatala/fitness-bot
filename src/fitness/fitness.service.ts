import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class FitnessService {
  private readonly logger = new Logger(FitnessService.name);
  private readonly baseUrl: string;
  private readonly token: string;

  constructor(private configService: ConfigService) {
    this.baseUrl = this.configService.get<string>('FITNESS_BACKEND_URL') ?? '';
    this.token = this.configService.get<string>('FITNESS_BACKEND_TOKEN') ?? '';
  }

  private get headers() {
    return { Authorization: `Bearer ${this.token}` };
  }

  async getStats() {
    try {
      const { data } = await axios.get(`${this.baseUrl}/workout-logs/stats`, {
        headers: this.headers,
      });
      return data;
    } catch (error) {
      this.logger.error(
        'Error al obtener stats:',
        error.response?.data || error.message,
      );
      throw error;
    }
  }

  async getTodayLogs() {
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data } = await axios.get(`${this.baseUrl}/workout-logs`, {
        headers: this.headers,
        params: { from: today, to: today },
      });
      return data.data;
    } catch (error) {
      this.logger.error(
        'Error al obtener logs:',
        error.response?.data || error.message,
      );
      throw error;
    }
  }
}
