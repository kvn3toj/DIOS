export declare class Quest {
    id: string;
    title: string;
    description: string;
    type: 'DAILY' | 'WEEKLY' | 'SPECIAL' | 'CHAIN';
    requirements: {
        achievements: string[];
        level: number;
        items: string[];
    };
    reward: {
        type: string;
        value: number;
    };
    deadline: Date;
    createdAt: Date;
    updatedAt: Date;
}
