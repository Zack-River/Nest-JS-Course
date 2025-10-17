import { Controller, Get, Param, Post, Body , NotFoundException } from '@nestjs/common';
import { CreateMessageDto } from './create-message.dto';
import { MessagesService } from './messages.service';

@Controller('messages')
export class MessagesController {
    constructor(public messageService: MessagesService) {}
    
    @Get('/')
    listMessages() {
        return this.messageService.findAll();
    }
    @Get('/:id')
    async getMessage(@Param('id') id: number) {
        const message = await this.messageService.findOne(id);
        if (!message) {
            throw new NotFoundException('Message not found');
        }
        return message;
    }
    @Post('/')
    createMessage(@Body() body: CreateMessageDto) {
        return this.messageService.create(body.content);
    }
}
