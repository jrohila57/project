import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto, UpdateProjectDto } from './dto';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  async create(@Body() createProjectDto: CreateProjectDto) {
    const userId = await this.projectsService.getDemoUserId();
    return this.projectsService.create(createProjectDto, userId);
  }

  @Get()
  async findAll() {
    const userId = await this.projectsService.getDemoUserId();
    return this.projectsService.findAll(userId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const userId = await this.projectsService.getDemoUserId();
    return this.projectsService.findOne(id, userId);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateProjectDto: UpdateProjectDto) {
    const userId = await this.projectsService.getDemoUserId();
    return this.projectsService.update(id, updateProjectDto, userId);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const userId = await this.projectsService.getDemoUserId();
    return this.projectsService.remove(id, userId);
  }
}
