import { Repository, FindOptionsWhere, FindOneOptions, DeepPartial } from 'typeorm';
import { AppDataSource } from '../config/database';
import { logger } from '../utils/logger';

export class BaseRepository<T> {
  protected repository: Repository<T>;

  constructor(entity: any) {
    this.repository = AppDataSource.getRepository(entity);
  }

  async findById(id: string, relations: string[] = []): Promise<T | null> {
    try {
      const options: FindOneOptions = {
        where: { id } as FindOptionsWhere<T>,
        relations
      };
      return await this.repository.findOne(options);
    } catch (error) {
      logger.error('Error in findById:', error);
      throw error;
    }
  }

  async findOne(options: FindOneOptions<T>): Promise<T | null> {
    try {
      return await this.repository.findOne(options);
    } catch (error) {
      logger.error('Error in findOne:', error);
      throw error;
    }
  }

  async find(options?: FindOneOptions<T>): Promise<T[]> {
    try {
      return await this.repository.find(options);
    } catch (error) {
      logger.error('Error in find:', error);
      throw error;
    }
  }

  async create(data: DeepPartial<T>): Promise<T> {
    try {
      const entity = this.repository.create(data);
      return await this.repository.save(entity);
    } catch (error) {
      logger.error('Error in create:', error);
      throw error;
    }
  }

  async update(id: string, data: DeepPartial<T>): Promise<T | null> {
    try {
      const result = await this.repository.update(id, data as any);
      if (result.affected === 0) return null;
      return await this.findById(id);
    } catch (error) {
      logger.error('Error in update:', error);
      throw error;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const result = await this.repository.delete(id);
      return result.affected > 0;
    } catch (error) {
      logger.error('Error in delete:', error);
      throw error;
    }
  }

  async count(options?: FindOneOptions<T>): Promise<number> {
    try {
      return await this.repository.count(options);
    } catch (error) {
      logger.error('Error in count:', error);
      throw error;
    }
  }

  async exists(id: string): Promise<boolean> {
    try {
      const count = await this.repository.count({
        where: { id } as FindOptionsWhere<T>
      });
      return count > 0;
    } catch (error) {
      logger.error('Error in exists:', error);
      throw error;
    }
  }
} 