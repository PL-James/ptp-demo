import {
  CompositeTaskBuilder,
  Condition,
  TaskBackoffModel,
  TaskEventModel,
  TaskEventType,
  TaskLogEntryModel,
  TaskModel,
  TaskStatus,
  TaskType,
} from '@decaf-ts/core';
import { Model } from '@decaf-ts/decorator-validation';
import { DecafRepository, getLogger, getModelAndRepository, KeyValue } from '@decaf-ts/for-angular';
import { LoggedClass, LogLevel } from '@decaf-ts/logging';

//TODO: DELETE
export class TaskSessionService extends LoggedClass {
  // private readonly storageService: CmxStorageService = inject(CmxStorageService);

  private static _storage: Storage = sessionStorage;

  static get storage(): Storage {
    return this._storage;
  }

  static async initialize(repository: DecafRepository<Model>, toCreate?: Model[], modelName?: string): Promise<void> {
    try {
      await this.delete();
      if (repository) {
        const data = {
          [TaskModel.name]: (await this.read(TaskModel.name)) as TaskModel[],
          [TaskEventModel.name]: await this.read(TaskEventModel.name),
        };
        // const all = data[TaskModel.name] as TaskModel[];
        // if (all?.length > 6) {
        //   await this.delete();
        // }
        const tasks = data[TaskModel.name] as TaskModel[];
        let task!: TaskModel | undefined;
        if (tasks.length < 60) {
          task = await TaskSessionService.createTask(tasks.length % 2 !== 0);
        } else {
          task = undefined;
        }

        const save = async (entries: Model[], repository: DecafRepository<Model>): Promise<void> => {
          for (const item of entries) {
            const pk = Model.pk(repository.class);
            const check = await repository.select().where(Condition.attr(pk).eq(item[pk])).execute();
            if (!check?.length) {
              await repository.create(item);
            }
          }
          getLogger(this.initialize).info(
            `Passing stored data to ram adapter. ${repository.class.name} with ${entries.length} items`
          );
        };

        for (const [key, value] of Object.entries(data)) {
          let entries = value as Model[];
          const repo = getModelAndRepository(key);
          if (repo) {
            const { repository, model } = repo;
            if (key === TaskModel.name) {
              await save(entries, repository);
              getLogger(this.initialize).info(
                `Passing stored data to ram adapter. ${repository.class.name} with ${entries.length} items`
              );
            } else {
              await save(entries, repository);
              if (toCreate && task) {
                entries = [];
                getLogger(this.initialize).info(`Generating fake events for task ${task.id}.`);

                for (const status of [
                  TaskStatus.PENDING,
                  TaskStatus.SCHEDULED,
                  TaskStatus.RUNNING,
                  TaskStatus.WAITING_RETRY,
                ]) {
                  const event = await this.createEvent(task.id as string, status);
                  if (event) {
                    entries.push(event);
                  }
                }
              }
            }
          }
        }
      }
    } catch (error) {
      console.error(`Error initializing session adapter: ${(error as Error)?.message || error}`);
    }
  }

  static async populate<M extends Model>(modelName: string, item: KeyValue): Promise<M | undefined> {
    try {
      const repo = getModelAndRepository(modelName);
      if (repo) {
        const { repository, model } = repo;
        const result = (await TaskSessionService.create(modelName, repository, item)) as M;
        return result;
      }
    } catch (error) {
      getLogger('TaskPage').error(`Error creating item in ${modelName}: ${(error as Error)?.message || error}`);
      return undefined;
    }
  }

  static async read(modelName: string, respository?: DecafRepository<Model>, key?: string): Promise<unknown> {
    const logger = getLogger(this.read);
    function parseResult(data: string | null): unknown {
      let result;
      try {
        result = JSON.parse(data as string);
      } catch (error: unknown) {
        logger.warn(
          `Failed to parse session storage item for key "${modelName}": ${(error as Error)?.message || error}`
        );
        return [];
      }
      return result ?? [];
    }
    const data = parseResult(this._storage.getItem(modelName)) as [];
    if (data?.length) {
      const result = data.map((item) => {
        return typeof item === 'string' ? JSON.parse(item) : item;
      });
      if (!key || !respository) return result;
      const pk = Model.pk(respository.class);
      return result.find((item: KeyValue) => item[pk] === key) || undefined;
    }

    return [];
  }

  static async create<M extends Model>(modelName: string, repository: DecafRepository<M>, data: KeyValue): Promise<M> {
    const result = (await repository.create(Model.build(data, modelName))) as M;
    if (result) {
      const stored = (await this.read(modelName)) as M[];
      const data = JSON.stringify([result, ...(stored || [])]);
      this._storage.setItem(modelName, data);
    }
    return result;
  }

  // static async get(key: string): Promise<unknown> {
  //   return await TaskSessionService.read(key);
  // }

  // static async set(key: string, value: unknown): Promise<void> {
  //   if (typeof value === 'object') {
  //     const stored = (await this.get(key)) as object[];
  //     this._storage.setItem(key, JSON.stringify([value, ...stored]));
  //   }
  //   this._storage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
  // }

  static async destroy(): Promise<void> {
    await this.delete();
  }

  /**
   * @description Removes specific entries from session storage.
   * @summary Deletes entries by key or clears all entries if no key is provided.
   * @param {string | string[]} [key] - Key(s) to delete.
   * @returns {Promise<void>} Promise that resolves when deletion is complete.
   * @example
   * ```typescript
   * await TaskSessionService.delete('key');
   * ```
   */
  static async delete(key?: string | string[]): Promise<void> {
    if (!key) return this._storage.clear();
    if (Array.isArray(key)) {
      key.forEach((k) => this._storage.removeItem(k));
    } else {
      this._storage.removeItem(key);
    }
  }

  static async createTask(atomic: boolean = true): Promise<TaskModel | undefined> {
    const names = ['Product', 'Batch', 'Leaflet'];
    const classification = `${this.randomPick(names)}-task-${Date.now()}`;
    const logTail = Array.from({ length: 5 }, (_, i) => {
      const ts = new Date();
      ts.setDate(ts.getDate() - i);
      return Model.build(
        {
          msg: `Log entry ${i + 1} for task ${classification} at ${ts.toISOString()}`,
          ts,
          level: this.randomPick(Object.values(LogLevel)),
        },
        TaskLogEntryModel.name
      ) as TaskLogEntryModel;
    });
    const createDates = () => {
      const timestamp = new Date();
      return { createdAt: timestamp, updatedAt: timestamp };
    };
    const createBackoff = () => new TaskBackoffModel(createDates());
    const task = {
      classification: `atomic-${classification}`,
      atomicity: TaskType.ATOMIC,
      attempt: 0,
      maxAttempts: 2,
      ...createDates(),
      backoff: createBackoff(),
    };
    const composite = new CompositeTaskBuilder({
      ...task,
      ...{
        classification: `composite-${classification}`,
        atomicity: TaskType.COMPOSITE,
      },
    })
      .addStep('step-one', { value: 5 })
      .addStep('step-two', { offset: 3 })
      .addStep('step-three', { flag: true })
      .build();
    const data = { ...(atomic ? task : composite), logTail };
    return await this.populate<TaskModel>(TaskModel.name, data);
  }

  static async createEvent(uid: string, status: string): Promise<TaskEventModel | undefined> {
    const classification = [TaskStatus.SUCCEEDED, TaskStatus.FAILED, TaskStatus.CANCELED].includes(status as TaskStatus)
      ? TaskEventType.PROGRESS
      : this.randomPick([TaskEventType.LOG]);
    // this.randomPick([TaskEventType.STATUS, TaskEventType.PROGRESS, TaskEventType.LOG]);
    if (!status) {
      status = this.randomPick([
        TaskStatus.PENDING,
        TaskStatus.SCHEDULED,
        TaskStatus.RUNNING,
        TaskStatus.WAITING_RETRY,
      ]);
    }
    const ts = new Date();
    const data = Model.build(
      {
        taskId: uid,
        classification,
        payload:
          classification === TaskEventType.LOG
            ? ({
                msg: `${status} task ${uid} at ${ts.toISOString()}`,
                ts,
                level: this.randomPick(Object.values(LogLevel)),
              } as TaskLogEntryModel)
            : { status },
      },
      TaskEventModel.name
    ) as KeyValue;
    return await this.populate<TaskEventModel>(TaskEventModel.name, data);
  }

  static generateEvents(
    modelId: string,
    status: TaskStatus[] = [TaskStatus.PENDING, TaskStatus.SCHEDULED, TaskStatus.RUNNING, TaskStatus.WAITING_RETRY]
  ): void {
    const interval = setInterval(async () => {
      const index = Math.floor(Math.random() * status.length);
      const picked = status[index];
      status.splice(index, 1);
      await TaskSessionService.createEvent(modelId as string, picked);
      if (status?.length === 0) {
        await this.finishEvent(modelId);
        clearInterval(interval);
      }
    }, 2000);
  }

  static async finishEvent(modelId: string): Promise<void> {
    setTimeout(async () => {
      const event = this.randomPick([TaskStatus.SUCCEEDED, TaskStatus.FAILED, TaskStatus.CANCELED]);
      await TaskSessionService.createEvent(modelId as string, event);
    }, 3000);
  }

  static randomPick(source: string[] | KeyValue): string {
    const values: string[] = Array.isArray(source) ? source : Object.values(source);
    return !values?.length ? '' : `${values[Math.floor(Math.random() * values.length)]}`;
  }
}
