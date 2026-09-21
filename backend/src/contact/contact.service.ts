import { Injectable } from '@nestjs/common';
import { CreateContactDto } from './dto/create-contact.dto';
import { PrismaClient } from '@prisma/client';
import { MailService } from 'src/mail/mail.service';


@Injectable()
export class ContactService {
  constructor(
    
    private readonly mailService: MailService,
  ) {}
  private prisma = new PrismaClient();

  async create(dto: CreateContactDto) {
    // 1) Save to DB
    const contact = await this.prisma.contact.create({
      data: {
        name: dto.name,
        phone: dto.phone,
        email: dto.email,
        interestedIn: dto.interestedIn || null,
        message: dto.message || null,
      },
    });

    // 2) Send mail to USER email
    await this.mailService.sendContactAckToUser({
      to: dto.email,
      name: dto.name,
      phone: dto.phone,
      interestedIn: dto.interestedIn,
      message: dto.message,
    });

    return {
      message: 'Contact saved & email sent to user',
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



