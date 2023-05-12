import { TestScheduler } from 'rxjs/testing';
import { of } from 'rxjs';
import client from '~/src/azure/client';

describe('client', () => {
  const scheduler = new TestScheduler((actual, expected) => {
    expect(actual).toStrictEqual(expected);
  });

  it('fetches boards from azure', () => {
    const getBoardReferences = jest.fn(() =>
      of([{ id: '1st' }, { id: '2nd' }, { id: '3rd' }]),
    );
    const getBoard = jest.fn((id: string) =>
      of({
        id,
        name: `${id} Board`,
        url: `https://dev.azure.com/org/project/_boards/board/${id}`,
      }),
    );
    const apiMock = {
      getBoardReferences,
      getBoard,
      getRevisions: jest.fn(),
    };

    scheduler.run(({ expectObservable }) => {
      const boards = client(apiMock).getBoards();

      expectObservable(boards).toBe('(abc|)', {
        a: {
          id: '1st',
          name: '1st Board',
          url: 'https://dev.azure.com/org/project/_boards/board/1st',
        },
        b: {
          id: '2nd',
          name: '2nd Board',
          url: 'https://dev.azure.com/org/project/_boards/board/2nd',
        },
        c: {
          id: '3rd',
          name: '3rd Board',
          url: 'https://dev.azure.com/org/project/_boards/board/3rd',
        },
      });
    });

    expect(getBoardReferences).toHaveBeenCalledTimes(1);
    expect(getBoard).nthCalledWith(1, '1st');
    expect(getBoard).nthCalledWith(2, '2nd');
    expect(getBoard).nthCalledWith(3, '3rd');
  });

  it('fetches revisions from azure', () => {
    const getRevisions = jest
      .fn()
      .mockImplementationOnce(() =>
        of({
          isLastBatch: false,
          continuationToken: '1stToken',
          values: [
            {
              id: 1,
              fields: {
                'System.Id': '1',
                'System.Title': 'First Item',
              },
            },
          ],
        }),
      )
      .mockImplementation(() =>
        of({
          isLastBatch: true,
          continuationToken: '2ndToken',
          values: [
            {
              id: 2,
              fields: {
                'System.Id': '2',
                'System.Title': 'Second Item',
              },
            },
          ],
        }),
      );
    const apiMock = {
      getBoardReferences: jest.fn(),
      getBoard: jest.fn(),
      getRevisions,
    };
    const from = new Date('1970-01-01');

    scheduler.run(({ expectObservable }) => {
      const revisions = client(apiMock).getRevisions(from);

      expectObservable(revisions).toBe('(ab|)', {
        a: {
          isLastBatch: false,
          continuationToken: '1stToken',
          values: [
            {
              id: 1,
              fields: {
                'System.Id': '1',
                'System.Title': 'First Item',
              },
            },
          ],
        },
        b: {
          isLastBatch: true,
          continuationToken: '2ndToken',
          values: [
            {
              id: 2,
              fields: {
                'System.Id': '2',
                'System.Title': 'Second Item',
              },
            },
          ],
        },
      });
    });

    expect(getRevisions).toHaveBeenCalledTimes(2);
    expect(getRevisions).nthCalledWith(1, expect.anything(), undefined);
    expect(getRevisions).nthCalledWith(2, expect.anything(), '1stToken');
  });
});
