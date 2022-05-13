export interface Master {
  fajr: {
    total: number;
    completed: number;
  };
  zuhr: {
    total: number;
    completed: number;
  };
  asr: {
    total: number;
    completed: number;
  };
  maghrib: {
    total: number;
    completed: number;
  };
  isha: {
    total: number;
    completed: number;
  };
  witr: {
    total: number;
    completed: number;
  };
  fast: {
    total: number;
    completed: number;
  };
}
export interface MasterCompletedModel {
  fajrComplete: number;
  zuhrComplete: number;
  asrComplete: number;
  maghribComplete: number;
  ishaComplete: number;
  witrComplete: number;
  fastComplete: number;
}

export interface QazaItemModel {
  fajr: number;
  zuhr: number;
  asr: number;
  maghrib: number;
  isha: number;
  witr: number;
  fast: number;
  date: string;
  timestamp: Date;
}
