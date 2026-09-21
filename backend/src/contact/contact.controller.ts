import { Body, Controller, Get, Post } from '@nestjs/common';
import { ContactService } from './contact.service';
import { CreateContactDto } from './dto/create-contact.dto';

@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  
  @Post()
  async create(@Body() dto: CreateContactDto) {
    const data = await this.contactService.create(dto);
    return { message: 'Contact saved successfully', data };
  }

  
  @Get()
  async findAll() {
    const data = await this.contactService.findAll();
    return { message: 'All contacts', data };
  }
}
