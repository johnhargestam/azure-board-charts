import { TestScheduler } from 'rxjs/testing';
import { of } from 'rxjs';
import client from '~/src/api/client';

jest.mock('~/env', () => ({}))

const getBoardsMock = jest.fn(() => of(['1', '2', '3'].map(id => ({ id }))));

const getBoardMock = jest.fn((_, id: string) =>
  of({
    id,
    name: `Board ${id}`,
    url: `https://dev.azure.com/org/project/_boards/board/${id}`,
  }),
);

jest.mock('azure-devops-node-api', () => ({
  WebApi: jest.fn(() => ({
    getWorkApi: jest.fn(() =>
      of({
        getBoards: getBoardsMock,
        getBoard: getBoardMock,
      }),
    ),
  })),
  getPersonalAccessTokenHandler: jest.fn(),
}));

describe('client', () => {
  const scheduler = new TestScheduler((actual, expected) => {
    expect(actual).toStrictEqual(expected);
  });

  it('fetches boards from azure', () => {
    scheduler.run(({ expectObservable }) => {

      const boards = client.getBoards();

      expectObservable(boards).toBe('(abc|)', {
        a: {
          id: '1',
          name: 'Board 1',
          url: 'https://dev.azure.com/org/project/_boards/board/1',
        },
        b: {
          id: '2',
          name: 'Board 2',
          url: 'https://dev.azure.com/org/project/_boards/board/2',
        },
        c: {
          id: '3',
          name: 'Board 3',
          url: 'https://dev.azure.com/org/project/_boards/board/3',
        },
      });
    });
    
    expect(getBoardsMock).toHaveBeenCalledTimes(1);
    expect(getBoardMock).toHaveBeenCalledTimes(3);
  });
});
