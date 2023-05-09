import { TestScheduler } from 'rxjs/testing';
import { of } from 'rxjs';
import client from '~/src/api/client';

describe('client', () => {
  const scheduler = new TestScheduler((actual, expected) => {
    expect(actual).toStrictEqual(expected);
  });

  it('fetches boards from azure', () => {
    const boardReferencesMock = jest.fn(() =>
      of(['1', '2', '3'].map(id => ({ id }))),
    );
    const boardMock = jest.fn((id: string) =>
      of({
        id,
        name: `Board ${id}`,
        url: `https://dev.azure.com/org/project/_boards/board/${id}`,
      }),
    );
    const apiMock = {
      boardReferences: boardReferencesMock,
      board: boardMock,
    };

    scheduler.run(({ expectObservable }) => {
      const boards = client(apiMock).boards();

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

    expect(boardReferencesMock).toHaveBeenCalledTimes(1);
    expect(boardMock).toHaveBeenCalledTimes(3);
  });
});
