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

  @Cron('0 8 * * *') // todos los días a las 8:00
  async sendMorningMotivation() {
    this.logger.log('Enviando mensaje motivador...');
    try {
      const messages = [
        `☀️ *Buen día, manga de vagos*\n\nHoy también se entrena. Después no quiero ver excusas raras ni "mañana arranco". Cuando terminen, carguen el formulario. 💪`,
        `🔥 *Dale, arranquen el día moviendo el culo*\n\nAunque sea poco, pero hagan algo. Después registren el entrenamiento como corresponde. 📝`,
        `🏋️ *Buen día, equipo*\n\nHoy no se negocia: se entrena. Después completan el formulario y listo. Sin hacerse los distraídos 😄`,
        `💥 *A ver si hoy metemos entrenamiento de verdad*\n\nNada de desaparecer todo el día y caer a la noche con culpa. Entrenan y cargan el form. ✅`,
        `⚡ *Buen día*\n\nNo hace falta romperla, pero sí cumplir. Aunque sea media hora, hagan algo y déjenlo cargado. 🏃`,
        `😎 *Dale, hoy toca sumar*\n\nDespués no lloren cuando falte constancia. Entrenen y registren, simple.`,
        `🚀 *Arriba gente*\n\nHoy cuenta todo: fuerza, cardio, movilidad, lo que sea... pero hagan algo y súbanlo al formulario.`,
        `🥊 *Buen día*\n\nMenos charla, más entrenamiento. Después cargan lo que hicieron y seguimos.`,
        `📢 *Acordate antes de colgarte todo el día: hoy también hay que entrenar*\n\nDespués completás el formulario y quedás al día. 💪`,
        `😅 *Vamos que nadie se hace fuerte scrolleando*\n\nMetan entrenamiento y después déjenlo registrado.`,
      ];
      const random = messages[Math.floor(Math.random() * messages.length)];
      await this.whatsappService.sendMessage(this.groupId, random);
      this.logger.log('✅ Mensaje motivador enviado');
    } catch (error) {
      this.logger.error('Error al enviar mensaje motivador:', error.message);
    }
  }

  @Cron('0 17 * * *') // todos los días a las 17:00
  async sendFormReminder() {
    this.logger.log('Enviando recordatorio de formulario...');
    try {
      const stats = await this.fitnessService.getStats();
      const pending =
        stats.totalSubmissions === 0
          ? 'nadie completó el formulario todavía'
          : `solo ${stats.totalSubmissions} persona${stats.totalSubmissions > 1 ? 's' : ''} lo completaron`;

      const message = `⏰ *Recordatorio*\n\nFaltan pocas horas para cerrar el día y ${pending}.\n\n📋 Completá el formulario aunque no hayas entrenado, ¡el registro es importante!\n\n👉`;
      await this.whatsappService.sendMessage(this.groupId, message);
      this.logger.log('✅ Recordatorio enviado');
    } catch (error) {
      this.logger.error('Error al enviar recordatorio:', error.message);
    }
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
        const emoji = this.getEmoji(p.trainedToday);
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

  private getEmoji(trainedToday: string): string {
    const n =
      trainedToday
        ?.trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') ?? '';
    if (n.includes('complete') || n.startsWith('si,') || n.startsWith('si '))
      return '✅';
    if (n.includes('parcial') || n.includes('ligero')) return '⚡';
    return '❌';
  }
}
