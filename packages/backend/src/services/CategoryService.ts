import { PrismaClient, Category } from '@prisma/client';
import { ApiError } from '../utils/ApiError';

export class CategoryService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async create(data: { name: string }): Promise<Category> {
    try {
      return await this.prisma.category.create({
        data: {
          name: data.name,
        }
      });
    } catch (error) {
      throw new ApiError(400, 'Error creating category');
    }
  }

  async findAll(): Promise<Category[]> {
    try {
      return await this.prisma.category.findMany({
        include: {
          translations: true
        }
      });
    } catch (error) {
      throw new ApiError(500, 'Error fetching categories');
    }
  }

  async findById(id: number): Promise<Category | null> {
    try {
      const category = await this.prisma.category.findUnique({
        where: { id },
        include: {
          translations: true
        }
      });

      if (!category) {
        throw new ApiError(404, 'Category not found');
      }

      return category;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, 'Error fetching category');
    }
  }

  async update(id: number, data: { name: string }): Promise<Category> {
    try {
      return await this.prisma.category.update({
        where: { id },
        data: {
          name: data.name,
          updatedAt: new Date()
        }
      });
    } catch (error) {
      throw new ApiError(400, 'Error updating category');
    }
  }

  async delete(id: number): Promise<void> {
    try {
      await this.prisma.category.delete({
        where: { id }
      });
    } catch (error) {
      throw new ApiError(400, 'Error deleting category');
    }
  }
}