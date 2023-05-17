import {
  Board,
  BoardReference,
  WorkItem,
  WorkItemType,
} from '~/src/azure/models';

export const createBoardReference = (id: string): BoardReference => ({ id });

export const createBoard = (id: string): Board => ({
  id,
  name: `${id} Board`,
  columns: [],
  allowedMappings: {},
});

export const createWorkItem = (id: number): WorkItem => ({
  id,
  areaPath: 'area',
  title: 'title',
  type: WorkItemType.PBI,
  created: new Date('1970-01-01'),
  changed: new Date('1970-01-01'),
  state: 'doing',
  tags: ['tag'],
  boardColumn: {
    name: 'doing',
    done: false,
  },
});
