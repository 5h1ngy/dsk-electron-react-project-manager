import Container, { Service } from 'typedi';

import { Project } from '../models/Project';
import { Tag } from '../models/Tag';
import { Task } from '../models/Task';
import { Logger } from '../shared/logger';
import { CreateProjectDto, ProjectListResponseDto, ProjectResponseDto, SingleProjectResponseDto, UpdateProjectDto } from '../dtos/project.dto';
import { TagResponseDto } from '../dtos/tag.dto';
import { BaseService } from './base.service';

@Service()
export class ProjectService extends BaseService {

  constructor() {
    super(Container.get(Logger));
    this._logger.info('ProjectService initialized');
  }

  public async getAllProjects(userId: number): Promise<ProjectListResponseDto> {
    try {
      this._logger.info(`Fetching all projects for user ${userId}`);

      // Check if userId is defined and valid
      if (!userId || isNaN(userId)) {
        this._logger.warn(`Invalid user ID provided: ${userId}`);
        return new ProjectListResponseDto(false, 'Invalid user ID', []);
      }

      // Query per ottenere i progetti
      const projects = await Project.findAll({
        where: { userId },
        include: [
          {
            model: Tag,
            as: 'tags',
          }
        ],
        order: [['updatedAt', 'DESC']]
      });

      // Mappare i risultati usando ProjectResponseDto
      const mappedProjects = projects.map(project => {
        const tagsDto = project.tags?.map(tag => new TagResponseDto(
          tag.id,
          tag.name,
          tag.color || '#6e6e6e',
          tag.createdAt,
          tag.updatedAt
        )) || [];

        return new ProjectResponseDto(
          project.id,
          project.name,
          project.description || '',
          project.userId,
          tagsDto,
          project.createdAt,
          project.updatedAt
        );
      });

      this._logger.info(`Retrieved ${mappedProjects.length} projects for user ${userId}`);
      return new ProjectListResponseDto(true, 'Projects retrieved successfully', mappedProjects, projects.length);
    } catch (error) {
      this.handleError(`Error fetching projects for user ${userId}`, error);
      return new ProjectListResponseDto(false, 'Failed to fetch projects', []);
    }
  }

  public async createProject(createProjectDto: CreateProjectDto): Promise<SingleProjectResponseDto> {
    try {
      const { name, description, userId, tags } = createProjectDto;

      this._logger.info(`Creating project "${name}" for user ${userId}`);

      // Create the project
      const projectData = {
        name,
        description: description || '',
        userId
      };

      const project = await Project.create(projectData as any);

      // Add tags if provided
      if (tags && tags.length > 0) {
        this._logger.info(`Adding ${tags.length} tags to project ${project.id}`);
        await (project as any).addTags(tags);
      }

      // Get the updated project with tags
      const updatedProject = await Project.findByPk(project.id, {
        include: [{
          model: Tag,
          as: 'tags',
          through: { attributes: [] }
        }]
      });

      if (!updatedProject) {
        this._logger.warn(`Unable to retrieve updated project ${project.id} after creation`);
        return new SingleProjectResponseDto(false, 'Project created but could not be retrieved');
      }

      // Costruiamo un ProjectResponseDto
      const tagsDto = updatedProject.tags?.map(tag => new TagResponseDto(
        tag.id,
        tag.name,
        tag.color || '#6e6e6e',
        tag.createdAt,
        tag.updatedAt
      )) || [];

      const projectDto = new ProjectResponseDto(
        updatedProject.id,
        updatedProject.name,
        updatedProject.description || '',
        updatedProject.userId,
        tagsDto,
        updatedProject.createdAt,
        updatedProject.updatedAt
      );

      this._logger.info(`Project ${project.id} created successfully`);
      return new SingleProjectResponseDto(true, 'Project created successfully', projectDto);
    } catch (error) {
      this.handleError('Error creating project', error);
      return new SingleProjectResponseDto(false, 'Failed to create project');
    }
  }

  public async updateProject(projectId: number, updateProjectDto: UpdateProjectDto): Promise<SingleProjectResponseDto> {
    try {
      const { name, description, tags } = updateProjectDto;

      this._logger.info(`Updating project ${projectId}`);

      // Find the project
      const project = await Project.findByPk(projectId);
      if (!project) {
        this._logger.warn(`Project ${projectId} not found during update attempt`);
        return new SingleProjectResponseDto(false, 'Project not found');
      }

      // Update fields
      if (name !== undefined) project.name = name;
      if (description !== undefined) project.description = description;

      await project.save();

      // Set tags for the project
      if (tags && tags.length > 0) {
        this._logger.info(`Setting ${tags.length} tags for project ${project.id}`);
        await (project as any).setTags(tags);
      }

      // Get the updated project with tags
      const updatedProject = await Project.findByPk(project.id, {
        include: [{
          model: Tag,
          as: 'tags',
          through: { attributes: [] }
        }]
      });

      if (!updatedProject) {
        this._logger.warn(`Unable to retrieve updated project ${project.id} after update`);
        return new SingleProjectResponseDto(false, 'Project updated but could not be retrieved');
      }

      // Costruiamo un ProjectResponseDto
      const tagsDto = updatedProject.tags?.map(tag => new TagResponseDto(
        tag.id,
        tag.name,
        tag.color || '#6e6e6e',
        tag.createdAt,
        tag.updatedAt
      )) || [];

      const projectDto = new ProjectResponseDto(
        updatedProject.id,
        updatedProject.name,
        updatedProject.description || '',
        updatedProject.userId,
        tagsDto,
        updatedProject.createdAt,
        updatedProject.updatedAt
      );

      this._logger.info(`Project ${project.id} updated successfully`);
      return new SingleProjectResponseDto(true, 'Project updated successfully', projectDto);
    } catch (error) {
      this.handleError(`Error updating project ${projectId}`, error);
      return new SingleProjectResponseDto(false, 'Failed to update project');
    }
  }

  public async deleteProject(projectId: number): Promise<SingleProjectResponseDto> {
    try {
      // Find the project
      const project = await Project.findByPk(projectId);
      if (!project) {
        this._logger.warn(`Project ${projectId} not found during delete attempt`);
        return new SingleProjectResponseDto(false, 'Project not found');
      }

      // Delete the project
      await project.destroy();

      this._logger.info(`Project ${projectId} deleted successfully`);
      return new SingleProjectResponseDto(true, 'Project deleted successfully');
    } catch (error) {
      this.handleError(`Error deleting project ${projectId}`, error);
      return new SingleProjectResponseDto(false, 'Failed to delete project');
    }
  }

  public async getProjectDetails(projectId: number): Promise<SingleProjectResponseDto> {
    try {
      const project = await Project.findByPk(projectId, {
        include: [
          {
            model: Tag,
            as: 'tags',
            through: { attributes: [] }
          },
          {
            model: Task,
            as: 'tasks'
          }
        ]
      });

      if (!project) {
        this._logger.warn(`Project ${projectId} not found during delete attempt`);
        return new SingleProjectResponseDto(false, 'Project not found');
      }

      // Costruiamo un ProjectResponseDto
      const tagsDto = project.tags?.map(tag => new TagResponseDto(
        tag.id,
        tag.name,
        tag.color || '#6e6e6e',
        tag.createdAt,
        tag.updatedAt
      )) || [];

      const projectDto = new ProjectResponseDto(
        project.id,
        project.name,
        project.description || '',
        project.userId,
        tagsDto,
        project.createdAt,
        project.updatedAt
      );

      this._logger.info(`Project ${projectId} details retrieved successfully`);
      return new SingleProjectResponseDto(true, 'Project details retrieved successfully', projectDto);
    } catch (error) {
      this.handleError(`Error fetching project details for project ${projectId}`, error);
      return new SingleProjectResponseDto(false, 'Failed to fetch project details');
    }
  }
}

// Export is managed by TypeDI
