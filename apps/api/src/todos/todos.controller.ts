import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { TodosService } from './todos.service';
import { CreateTodoDto, UpdateTodoDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Request } from 'express';

// Define JWT user interface
interface JwtUser {
  sub: string; // User ID
  email: string;
  sessionId: string;
  iat?: number;
  exp?: number;
}

// Add type to Express Request
interface RequestWithUser extends Request {
  user: JwtUser;
}

@Controller('todos')
export class TodosController {
  constructor(private readonly todosService: TodosService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() createTodoDto: CreateTodoDto, @Req() req: RequestWithUser) {
    const userId = req.user.sub;
    console.log({ APP: req.user });
    return this.todosService.create(userId, createTodoDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(@Req() req: RequestWithUser, @Query('projectId') projectId?: string) {
    const userId = req.user.sub;
    return this.todosService.findAll(userId, projectId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: RequestWithUser) {
    const userId = req.user.sub;
    return this.todosService.findOne(userId, id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateTodoDto: UpdateTodoDto,
    @Req() req: RequestWithUser
  ) {
    const userId = req.user.sub;
    return this.todosService.update(userId, id, updateTodoDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: RequestWithUser) {
    const userId = req.user.sub;
    return this.todosService.remove(userId, id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id/hard')
  async hardRemove(@Param('id') id: string, @Req() req: RequestWithUser) {
    const userId = req.user.sub;
    return this.todosService.hardRemove(userId, id);
  }
}
