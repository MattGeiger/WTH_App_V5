import { PrismaClient, Language } from '@prisma/client';
import { ApiError } from '../utils/ApiError';

export class LanguageService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  /**
   * Adds a new language to the database.
   * Throws ApiError if the language code already exists.
   */
  async addLanguage(code: string, name?: string): Promise<Language> {
    // Validate input
    if (!code || code.trim() === '') {
      throw new ApiError(400, 'Language code is required');
    }

    // Check if code already exists
    const existing = await this.prisma.language.findUnique({ where: { code } });
    if (existing) {
      throw new ApiError(400, `Language code '${code}' already exists`);
    }

    // Create new language
    try {
      const lang = await this.prisma.language.create({
        data: {
          code,
          name: name || code.toUpperCase(),
          active: true
        }
      });
      return lang;
    } catch (error) {
      throw new ApiError(500, 'Error creating language');
    }
  }

  /**
   * Returns all active languages.
   */
  async findAll(): Promise<Language[]> {
    try {
      return await this.prisma.language.findMany({
        where: { active: true }
      });
    } catch (error) {
      throw new ApiError(500, 'Error fetching languages');
    }
  }

  /**
   * Returns a language by code.
   * Throws ApiError if not found.
   */
  async findByCode(code: string): Promise<Language> {
    try {
      const lang = await this.prisma.language.findUnique({
        where: { code }
      });
      if (!lang || !lang.active) {
        throw new ApiError(404, `Language '${code}' not found`);
      }
      return lang;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, 'Error fetching language');
    }
  }
}
