import { Injectable } from '@nestjs/common';
import { CreateQuestionDto } from './dto/create-question.dto.js';
import { UpdateQuestionDto } from './dto/update-question.dto.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class QuestionsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createQuestionDto: CreateQuestionDto, userId: number) {
    return await this.prisma.questions.create({
      data: { ...createQuestionDto, userId },
    });
  }

  async findAll() {
    // return `This action returns all questions`;
    return await this.prisma.questions.findMany();
  }

  async findOne(id: number) {
    // return `This action returns a #${id} question`;
    return await this.prisma.questions.findUnique({ where: { id }});
  }

  async update(id: number, updateQuestionDto: UpdateQuestionDto) {
    // return `This action updates a #${id} question`;
    return await this.prisma.questions.update({
      where: { id },
      data: updateQuestionDto,
    });
  }

  remove(id: number) {
    // return `This action removes a #${id} question`;
    return this.prisma.questions.delete({ where: { id } });
  }
}
