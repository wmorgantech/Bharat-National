import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ContactService } from './contact.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { Public } from 'src/auth/public.decorator';
import { Roles } from 'src/auth/roles.decorator';

@ApiTags('Contact')
@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  /** Public website enquiry form. */
  @Public()
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
