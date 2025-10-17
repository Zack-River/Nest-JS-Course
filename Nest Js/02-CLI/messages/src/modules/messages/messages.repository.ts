import { Injectable, NotFoundException } from "@nestjs/common";
import { readFile, writeFile } from "fs/promises";

@Injectable()
export class MessagesRepository {
    private async ensureFileExists() {
        try {
            await readFile("messages.json", "utf8");
        } catch {
            await writeFile("messages.json", JSON.stringify({}));
        }
    }

    async findOne(id: number) {
        await this.ensureFileExists();

        const contents = await readFile("messages.json", "utf8");
        const messages = JSON.parse(contents);

        if (!messages[id]) throw new NotFoundException("Message not found");
        return messages[id];
    }

    async findAll() {
        await this.ensureFileExists();
        const contents = await readFile("messages.json", "utf8");
        return JSON.parse(contents);
    }

    async create(content: string) {
        await this.ensureFileExists();
        const contents = await readFile("messages.json", "utf8");
        const messages = JSON.parse(contents);

        const id = Math.floor(Math.random() * 999);
        messages[id] = { id, content };

        await writeFile("messages.json", JSON.stringify(messages));
    }
}
