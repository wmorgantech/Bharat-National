import { Body, Controller, Get, Post } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ContactService } from './contact.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { Public } from 'src/auth/public.decorator';
import { Roles } from 'src/auth/roles.decorator';
import { CONTACT_THROTTLE } from '../common/throttle.config';

@ApiTags('Contact')
@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  /** Public website enquiry form. */
  @Public()
  @Throttle(CONTACT_THROTTLE)
  @Post()
  async create(@Body() dto: CreateContactDto) {
    const data = await this.contactService.create(dto);
    return { message: 'Contact saved successfully', data };
  }

  /** Submitted enquiries contain visitor PII, so this is admin-only. */
  @Get()
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiBearerAuth()
  async findAll() {
    const data = await this.contactService.findAll();
    return { message: 'All contacts', data };
  }
}
