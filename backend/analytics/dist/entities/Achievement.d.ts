export declare class Achievement {
    id: string;
    title: string;
    description: string;
    points: number;
    type: 'DAILY' | 'WEEKLY' | 'SPECIAL' | 'MILESTONE';
    criteria: {
        type: string;
        threshold: number;
        conditions: string[];
    };
    reward: {
        type: string;
        value: number;
    };
    createdAt: Date;
    updatedAt: Date;
}
