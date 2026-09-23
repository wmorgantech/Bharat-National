import { Injectable, Logger } from '@nestjs/common';
import { CreateContactDto } from './dto/create-contact.dto';
import { MailService } from 'src/mail/mail.service';
import { PrismaService } from '../prisma/prisma.service';


@Injectable()
export class ContactService {
  private readonly logger = new Logger(ContactService.name);

  constructor(
    private readonly mailService: MailService,
    private readonly prisma: PrismaService,
  ) {}

  async create(dto: CreateContactDto) {
    // 1) Save to DB. A persistence failure is a real failure and is left to
    //    propagate, so the caller still gets an error response.
    const contact = await this.prisma.contact.create({
      data: {
        name: dto.name,
        phone: dto.phone,
        email: dto.email,
        interestedIn: dto.interestedIn || null,
        message: dto.message || null,
      },
    });

    // 2) Send mail to USER email.
    //    Best effort only: the enquiry is already stored and the business can
    //    act on it, so a mail transport problem must not turn a successful
    //    submission into a 500 for the visitor.
    let emailSent = false;

    try {
      await this.mailService.sendContactAckToUser({
        to: dto.email,
        name: dto.name,
        phone: dto.phone,
        interestedIn: dto.interestedIn,
        message: dto.message,
      });
      emailSent = true;
    } catch (error) {
      this.logger.error(
        `Contact #${contact.id} saved, but the acknowledgement email to ${dto.email} could not be sent: ${
          error instanceof Error ? error.message : String(error)
        }`,
        error instanceof Error ? error.stack : undefined,
      );
    }

    return {
      message: emailSent
        ? 'Contact saved & email sent to user'
        : 'Contact saved, but the acknowledgement email could not be sent',
      emailSent,
      data: contact,
    };
  }

  // optional: list all contacts (admin)
  async findAll() {
    return this.prisma.contact.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }
}



