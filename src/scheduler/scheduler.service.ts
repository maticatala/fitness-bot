import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { FitnessService } from '../fitness/fitness.service';
import { WhatsappService } from '../whatsapp/whatsapp.service';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);
  private readonly groupId: string;

  constructor(
    private fitnessService: FitnessService,
    private whatsappService: WhatsappService,
    private configService: ConfigService,
  ) {
    this.groupId = this.configService.get<string>('WHATSAPP_GROUP_ID') ?? '';
  }

  @Cron('0 21 * * *') // todos los días a las 21:00
  async sendDailySummary() {
    this.logger.log('Enviando resumen diario...');

    try {
      const stats = await this.fitnessService.getStats();

      const message = this.buildMessage(stats);
      await this.whatsappService.sendMessage(this.groupId, message);
      this.logger.log('✅ Resumen diario enviado');
    } catch (error) {
      this.logger.error('Error al enviar resumen:', error.message);
    }
  }

  private buildMessage(stats: any): string {
    const byPerson = stats.byPerson
      .map((p: any) => {
        const emoji =
          p.trainedToday === 'Si, completé mi entrenamiento.'
            ? '✅'
            : p.trainedToday === 'Entrenamiento parcial/ligero.'
              ? '⚡'
              : '❌';
        const types = p.workoutType?.length
          ? ` - ${p.workoutType.join(', ')}`
          : '';
        const duration = p.duration ? ` (${p.duration})` : '';
        const notes = p.notes ? `\n    📝 ${p.notes}` : '';
        return `${emoji} ${p.email}${types}${duration}${notes}`;
      })
      .join('\n');

    const workoutTypes = Object.entries(stats.byWorkoutType || {})
      .map(([type, count]) => `  • ${type}: ${count}`)
      .join('\n');

    return `📊 *Resumen de entrenamiento*
📅 ${stats.date}

*Detalle por persona:*
${byPerson || '  Sin registros aún'}

*Resumen del día:*
✅ Completaron: ${stats.totalTrained}
⚡ Parcial: ${stats.totalPartial}
❌ No entrenaron: ${stats.totalNotTrained}

🏋️ Entrenamientos:
${workoutTypes || '  Sin datos'}

🔥 *Asistencia: ${stats.attendanceRate}%*
¡Sigan así! 💪`;
  }
}
