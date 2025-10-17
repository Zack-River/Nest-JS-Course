import { MessagesRepository } from './messages.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MessagesService {
    constructor(public messageRepo: MessagesRepository) {}

    async findOne(id: number) {
        return this.messageRepo.findOne(id);
    }

    async findAll() {
        return this.messageRepo.findAll();
    }

    async create(content: string) {
        return this.messageRepo.create(content);
    }
}
