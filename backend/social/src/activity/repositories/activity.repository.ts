import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Activity, ActivityType, ActivityVisibility } from '../activity.entity';

@Injectable()
export class ActivityRepository {
  constructor(
    @InjectRepository(Activity)
    private readonly repository: Repository<Activity>,
  ) {}

  async create(activity: Partial<Activity>): Promise<Activity> {
    const newActivity = this.repository.create(activity);
    return this.repository.save(newActivity);
  }

  async findById(id: string): Promise<Activity> {
    return this.repository.findOne({ where: { id } });
  }

  async findByProfileId(
    profileId: string,
    options: {
      type?: ActivityType;
      visibility?: ActivityVisibility;
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<Activity[]> {
    const { type, visibility, limit = 10, offset = 0 } = options;

    const query = this.repository.createQueryBuilder('activity')
      .where('activity.profileId = :profileId', { profileId })
      .orderBy('activity.createdAt', 'DESC')
      .skip(offset)
      .take(limit);

    if (type) {
      query.andWhere('activity.type = :type', { type });
    }

    if (visibility) {
      query.andWhere('activity.visibility = :visibility', { visibility });
    }

    return query.getMany();
  }

  async findByProfileIds(
    profileIds: string[],
    options: {
      type?: ActivityType;
      visibility?: ActivityVisibility;
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<Activity[]> {
    const { type, visibility, limit = 10, offset = 0 } = options;

    const query = this.repository.createQueryBuilder('activity')
      .where('activity.profileId IN (:...profileIds)', { profileIds })
      .orderBy('activity.createdAt', 'DESC')
      .skip(offset)
      .take(limit);

    if (type) {
      query.andWhere('activity.type = :type', { type });
    }

    if (visibility) {
      query.andWhere('activity.visibility = :visibility', { visibility });
    }

    return query.getMany();
  }

  async findByTargetId(
    targetId: string,
    options: {
      type?: ActivityType;
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<Activity[]> {
    const { type, limit = 10, offset = 0 } = options;

    const query = this.repository.createQueryBuilder('activity')
      .where('activity.targetId = :targetId', { targetId })
      .orderBy('activity.createdAt', 'DESC')
      .skip(offset)
      .take(limit);

    if (type) {
      query.andWhere('activity.type = :type', { type });
    }

    return query.getMany();
  }

  async update(id: string, activity: Partial<Activity>): Promise<Activity> {
    await this.repository.update(id, activity);
    return this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.repository.delete(id);
    return result.affected > 0;
  }

  async countByProfileId(
    profileId: string,
    options: {
      type?: ActivityType;
      visibility?: ActivityVisibility;
    } = {}
  ): Promise<number> {
    const { type, visibility } = options;

    const query = this.repository.createQueryBuilder('activity')
      .where('activity.profileId = :profileId', { profileId });

    if (type) {
      query.andWhere('activity.type = :type', { type });
    }

    if (visibility) {
      query.andWhere('activity.visibility = :visibility', { visibility });
    }

    return query.getCount();
  }

  async incrementInteractionCount(
    id: string,
    field: 'likesCount' | 'commentsCount' | 'sharesCount'
  ): Promise<void> {
    await this.repository.increment({ id }, field, 1);
  }

  async decrementInteractionCount(
    id: string,
    field: 'likesCount' | 'commentsCount' | 'sharesCount'
  ): Promise<void> {
    await this.repository.decrement({ id }, field, 1);
  }
} 