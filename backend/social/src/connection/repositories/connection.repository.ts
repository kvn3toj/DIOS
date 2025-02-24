import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Connection, ConnectionStatus } from '../connection.entity';

@Injectable()
export class ConnectionRepository {
  constructor(
    @InjectRepository(Connection)
    private readonly repository: Repository<Connection>,
  ) {}

  async create(connection: Partial<Connection>): Promise<Connection> {
    const newConnection = this.repository.create(connection);
    return this.repository.save(newConnection);
  }

  async findById(id: string): Promise<Connection> {
    return this.repository.findOne({ where: { id } });
  }

  async findByFollowerAndFollowing(followerId: string, followingId: string): Promise<Connection> {
    return this.repository.findOne({
      where: { followerId, followingId }
    });
  }

  async findByProfileId(profileId: string): Promise<Connection[]> {
    return this.repository.find({
      where: [
        { followerId: profileId },
        { followingId: profileId }
      ],
      order: {
        createdAt: 'DESC'
      }
    });
  }

  async findFollowers(profileId: string): Promise<Connection[]> {
    return this.repository.find({
      where: {
        followingId: profileId,
        status: ConnectionStatus.ACCEPTED
      },
      order: {
        createdAt: 'DESC'
      }
    });
  }

  async findFollowing(profileId: string): Promise<Connection[]> {
    return this.repository.find({
      where: {
        followerId: profileId,
        status: ConnectionStatus.ACCEPTED
      },
      order: {
        createdAt: 'DESC'
      }
    });
  }

  async findPendingRequests(profileId: string): Promise<Connection[]> {
    return this.repository.find({
      where: {
        followingId: profileId,
        status: ConnectionStatus.PENDING
      },
      order: {
        createdAt: 'DESC'
      }
    });
  }

  async update(id: string, connection: Partial<Connection>): Promise<Connection> {
    await this.repository.update(id, connection);
    return this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.repository.delete(id);
    return result.affected > 0;
  }

  async countFollowers(profileId: string): Promise<number> {
    return this.repository.count({
      where: {
        followingId: profileId,
        status: ConnectionStatus.ACCEPTED
      }
    });
  }

  async countFollowing(profileId: string): Promise<number> {
    return this.repository.count({
      where: {
        followerId: profileId,
        status: ConnectionStatus.ACCEPTED
      }
    });
  }

  async countPendingRequests(profileId: string): Promise<number> {
    return this.repository.count({
      where: {
        followingId: profileId,
        status: ConnectionStatus.PENDING
      }
    });
  }
} 