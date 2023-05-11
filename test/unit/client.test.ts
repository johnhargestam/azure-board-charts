import { TestScheduler } from 'rxjs/testing';
import { of } from 'rxjs';
import client from '~/src/azure/client';

describe('client', () => {
  const scheduler = new TestScheduler((actual, expected) => {
    expect(actual).toStrictEqual(expected);
  });

  it('fetches boards from azure', () => {
    const boardReferencesMock = jest.fn(() =>
      of([{ id: '1st' }, { id: '2nd' }, { id: '3rd' }]),
    );
    const boardMock = jest.fn((id: string) =>
      of({
        id,
        name: `${id} Board`,
        url: `https://dev.azure.com/org/project/_boards/board/${id}`,
      }),
    );
    const apiMock = {
      boardReferences: boardReferencesMock,
      board: boardMock,
      revisions: jest.fn(),
    };

    scheduler.run(({ expectObservable }) => {
      const boards = client(apiMock).boards();

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

    expect(boardReferencesMock).toHaveBeenCalledTimes(1);
    expect(boardMock).nthCalledWith(1, '1st');
    expect(boardMock).nthCalledWith(2, '2nd');
    expect(boardMock).nthCalledWith(3, '3rd');
  });

  it('fetches revisions from azure', () => {
    const revisionsMock = jest
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
      boardReferences: jest.fn(),
      board: jest.fn(),
      revisions: revisionsMock,
    };
    const from = new Date('1970-01-01');

    scheduler.run(({ expectObservable }) => {
      const revisions = client(apiMock).revisions(from);

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

    expect(revisionsMock).toHaveBeenCalledTimes(2);
    expect(revisionsMock).nthCalledWith(1, expect.anything(), undefined);
    expect(revisionsMock).nthCalledWith(2, expect.anything(), '1stToken');
  });
});
