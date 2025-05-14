import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto, UpdateProjectDto } from './dto';
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

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() createProjectDto: CreateProjectDto, @Req() req: RequestWithUser) {
    const userId = req.user.sub;
    return this.projectsService.create(createProjectDto, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(@Req() req: RequestWithUser) {
    const userId = req.user.sub;
    return this.projectsService.findAll(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: RequestWithUser) {
    const userId = req.user.sub;
    return this.projectsService.findOne(id, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateProjectDto: UpdateProjectDto, @Req() req: RequestWithUser) {
    const userId = req.user.sub;
    return this.projectsService.update(id, updateProjectDto, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: RequestWithUser) {
    const userId = req.user.sub;
    return this.projectsService.remove(id, userId);
  }
}
