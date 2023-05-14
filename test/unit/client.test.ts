import { TestScheduler } from 'rxjs/testing';
import { of } from 'rxjs';
import client from '~/src/azure/client';
import {
  createBoard,
  createBoardReference,
  createWorkItem,
} from '~/test/fixtures/api';

describe('client', () => {
  const scheduler = new TestScheduler((actual, expected) => {
    expect(actual).toStrictEqual(expected);
  });

  it('fetches boards from azure', () => {
    const getBoardReferences = jest.fn(() =>
      of(['1st', '2nd', '3rd'].map(createBoardReference)),
    );
    const getBoard = jest.fn((id: string) => of(createBoard(id)));
    const apiMock = {
      getBoardReferences,
      getBoard,
      getRevisions: jest.fn(),
    };

    //fix mocks with functions for correct types
    //maximize optional parameters in zod types
    scheduler.run(({ expectObservable }) => {
      const boards = client(apiMock).getBoards();

      expectObservable(boards).toBe('(abc|)', {
        a: createBoard('1st'),
        b: createBoard('2nd'),
        c: createBoard('3rd'),
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
          values: [createWorkItem(1)],
          continuationToken: '1stToken',
          isLastBatch: false,
        }),
      )
      .mockImplementation(() =>
        of({
          values: [createWorkItem(2)],
          continuationToken: '2ndToken',
          isLastBatch: true,
        }),
      );
    const apiMock = {
      getBoardReferences: jest.fn(),
      getBoard: jest.fn(),
      getRevisions,
    };
    const from = new Date('1970-01-01');

    scheduler.run(({ expectObservable }) => {
      const revisions = client(apiMock).getLatestRevisions(from);

      expectObservable(revisions).toBe('(ab|)', {
        a: {
          values: [createWorkItem(1)],
          continuationToken: '1stToken',
        },
        b: {
          values: [createWorkItem(2)],
          continuationToken: '2ndToken',
        },
      });
    });

    expect(getRevisions).toHaveBeenCalledTimes(2);
    expect(getRevisions).nthCalledWith(1, expect.anything(), undefined);
    expect(getRevisions).nthCalledWith(2, expect.anything(), '1stToken');
  });
});
