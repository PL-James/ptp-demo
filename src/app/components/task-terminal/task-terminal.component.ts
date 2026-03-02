import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Condition, Observer, TaskEventModel, TaskEventType, TaskLogEntryModel, TaskStatus } from '@decaf-ts/core';
import { RamFlavour } from '@decaf-ts/core/ram';
import { uses } from '@decaf-ts/decoration';
import { Model } from '@decaf-ts/decorator-validation';
import {
  DB_ADAPTER_FLAVOUR_TOKEN,
  DecafRepository,
  getModelAndRepository,
  KeyValue,
  NgxComponentDirective,
  setOnWindow,
} from '@decaf-ts/for-angular';
import { Terminal } from '@xterm/xterm';
import { LogLevel } from 'rollup';
import { BehaviorSubject, debounceTime, shareReplay, takeUntil, timer } from 'rxjs';
import { TaskModel } from 'src/app/models/TaskModel';
import { TaskSessionService } from 'src/app/pages/tasks/TaskSessionService';
import { ITaskEventItem } from 'src/app/utils/interfaces';

// new RamAdapter({ user: 'demerson.carvalho@plaqa.org' });
// uses(RamFlavour)(TaskModel);
// uses(RamFlavour)(TaskEventModel);

@Component({
  selector: 'app-task-terminal',
  templateUrl: './task-terminal.component.html',
  styleUrls: ['./task-terminal.component.scss'],
  standalone: true,
})
export class AppTaskTerminalComponent extends NgxComponentDirective implements OnInit, OnDestroy {
  @ViewChild('terminalComponent', { static: true }) terminalContainer!: ElementRef;
  private terminal!: Terminal;

  // items: ITaskEventItem[] = [];

  taskEventRepository!: DecafRepository<TaskEventModel>;

  private items = new BehaviorSubject<ITaskEventItem[]>([]);
  items$ = this.items.asObservable().pipe(shareReplay(1));

  _initialized: boolean = false;

  // constructor() {}

  constructor() {
    super('Tasks');
    this.terminal = new Terminal({
      cursorBlink: true,
      disableStdin: true, // Torna o terminal apenas leitura
      theme: {
        // background: '#1e1e1e',
        // foreground: '#ffffff',
      },
    });
  }

  async ngOnInit() {
    await this.initRamRepository();
    await this.initialize();
  }

  override async ngOnDestroy(): Promise<void> {
    await super.ngOnDestroy();
    if (this.taskEventRepository && this.repositoryObserver) {
      const repo = this.taskEventRepository;
      //TODO: fix check observerHandler
      if (repo) {
        const observeHandler = repo['observerHandler'] as { observers: Observer[] } | undefined;
        if (observeHandler && observeHandler?.observers?.length) {
          try {
            repo.unObserve(this.repositoryObserver);
            this.log.info(`Repository observer detached successfully for repository ${repo.class.name}`);
          } catch (error: unknown) {
            this.log.info((error as Error)?.message);
          }
        }
      }
    }
  }

  override async initialize(): Promise<void> {
    await super.initialize();
    this.model = (await this._repository?.read(this.modelId)) as TaskModel;
    // logtail da task, é o que já correu (tipo log)
    // await super.initialize();
    // Exemplo de saída no terminal
    const logTail = (this.model as TaskModel).logTail;
    if (logTail?.length) {
      this.logOnTerminal('Task History...');
      logTail.forEach((item) => {
        this.logOnTerminal(item);
      });
    }

    this._initialized = true;

    await this.getEvents();

    // this.terminal.writeln('------------------------------');

    // quando composite, o terminal tem mais de 1

    // quando finalizar (successo ou falha), mostrar mensagem final

    // apenas logs
  }

  override observe() {
    this.items$
      .pipe(takeUntil(this.destroySubscriptions$)) // Cancela a assinatura quando o componente é destruído
      .subscribe((items) => {
        items.forEach((item) => {
          if (item?.msg) {
            this.terminal.writeln(item.msg);
          }
        });
      });
    if (!this.repositoryObserver) {
      this.repositoryObserver = {
        refresh: async (...args) => {
          const [, type, , event] = args;
          await this.pipeEvents(event, type);
        },
      };
      try {
        const repository = this.taskEventRepository;
        // const observerHandler = (this._repository as DecafRepository<Model>)['observerHandler'];
        // if (!observerHandler)
        //   (this._repository as DecafRepository<Model>).observe(this.repositoryObserver);
        const observerHandler = repository?.['observerHandler'] as { observers: Observer[] } | undefined;
        if (!observerHandler?.observers?.length) {
          repository?.observe(this.repositoryObserver);
          this.log.for(this.observe).info(`Registered repository observer for model ${this.modelName}`);

          this.repositoryObserverSubject
            .pipe(debounceTime(100), shareReplay(1), takeUntil(this.destroySubscriptions$))
            .subscribe(([model, action, uid, data]) => this.handleObserveEvent(data, model, action, uid));
        }
      } catch (error: unknown) {
        this.log.info((error as Error)?.message);
      }
    }
  }

  logOnTerminal(event: ITaskEventItem | TaskLogEntryModel | string) {
    if (!this._initialized) {
      this.terminal.open(this.terminalContainer.nativeElement);
    }
    if (typeof event === 'string') {
      this.terminal.writeln(this.getLineContent(event, TaskEventType.LOG));
    }
    if (typeof event === 'object' && event?.msg) {
      const status = (event as ITaskEventItem)?.status || TaskEventType.LOG;
      this.terminal.writeln(this.getLineContent(event.msg, status));
    }
  }

  getLineContent(text: string, status: TaskEventType | TaskStatus = TaskEventType.LOG): string {
    function formatStringWithHexColor(hex: string, text: string): string {
      // Verifica se o hexadecimal é válido
      // if (!/^#([0-9A-Fa-f]{6})$/.test(hex)) {
      //   throw new Error('Cor hexadecimal inválida. Use o formato #RRGGBB.');
      // }

      // Converte a cor hexadecimal para valores RGB
      const r = parseInt(hex.substring(1, 3), 16);
      const g = parseInt(hex.substring(3, 5), 16);
      const b = parseInt(hex.substring(5, 7), 16);

      return `\x1b[38;2;${r};${g};${b}m${text}\x1b[0m\r\n`;
    }

    const colors = {
      primary: '#5a2fb2',
      warn: '#ff9800',
      scheduled: '#f2c47e',
      trace: '#ab80ff',
      waiting_retry: '#ab80ff',
      danger: '#c5000f',
      error: '#c5000f',
      failed: '#88000b',
      succeeded: '#2dd55b',
      log: '#ffffff',
    } as KeyValue;

    return formatStringWithHexColor(colors?.[status] || colors['log'], text);
  }

  async getEvents() {
    uses(RamFlavour)(TaskEventModel);
    const repo = getModelAndRepository(TaskEventModel.name);

    if (repo) {
      const { repository, pk } = repo;
      if (!repository['adapter']) {
        throw new Error('Repository adapter is not defined');
      }
      this.taskEventRepository = repository as DecafRepository<TaskEventModel>;
      const events = (await repository.query(
        Condition.attr('taskId' as keyof Model).eq(this.modelId),
        pk as keyof Model
      )) as TaskEventModel[];

      this.observe();
      const timerSuscription = timer(1000).subscribe(() => {
        events.map((event) => {
          this.updateItems(this.parseToItem(event));
        });
        timerSuscription.unsubscribe();
      });

      TaskSessionService.generateEvents(this.modelId as string, [
        TaskStatus.PENDING,
        TaskStatus.WAITING_RETRY,
        TaskStatus.RUNNING,
      ]);
    }
  }

  updateItems(items: ITaskEventItem[]) {
    items.map((item) => {
      if (item.msg) {
        this.items.next([item]);
      }
    });
  }

  async pipeEvents(event: TaskEventModel, type: TaskEventType): Promise<void> {
    // this.items.next([...events, this.parseToItem(event)]);
    // const events = this.items.getValue();
    const entry = this.parseToItem(event);
    this.items.next(entry);
    console.log('Event piped:', event, 'Type:', type);
  }

  async initRamRepository() {
    if (!this.model) {
      this.model = new TaskModel();
    }
    setOnWindow(DB_ADAPTER_FLAVOUR_TOKEN, RamFlavour);
    if (this._repository) {
      await TaskSessionService.initialize(this._repository as DecafRepository<Model>, undefined);
    }
  }

  parseToItem(event: TaskEventModel | TaskEventModel[]): ITaskEventItem[] {
    const result: ITaskEventItem[] = [];
    if (Array.isArray(event)) {
      event.map((evt) => {
        result.push(...this.parseToItem(evt));
      });
    }
    const { classification, payload } = event as TaskEventModel;
    let item: KeyValue = {};
    const status: TaskStatus = payload?.status || event;
    switch (classification) {
      case TaskEventType.LOG: {
        const logs: [LogLevel, string, unknown][] = payload;
        if (Array.isArray(logs)) {
          logs.map((log) => {
            if (Array.isArray(log)) {
              item = {
                ...item,
                msg: log[1],
              };
            }
            if (typeof log === 'string') {
              item = {
                ...item,
                msg: log,
              };
            }
            if (log && typeof log === 'object' && 'msg' in log) {
              item = {
                ...item,
                msg: (log as { msg?: string }).msg,
              };
            }
          });
        } else {
          item = {
            ...item,
            msg: typeof logs === 'object' && 'msg' in logs ? (logs as any).msg : JSON.stringify(logs),
          };
        }
        break;
      }
      case TaskEventType.PROGRESS: {
        const { currentStep, totalSteps } = payload;
        item = {
          ...item,
          currentStep: currentStep,
          totalSteps,
          ...(currentStep === totalSteps
            ? {
                msg: `Task completed: ${currentStep}/${totalSteps}`,
              }
            : {
                msg: `Task progress: ${currentStep}/${totalSteps}`,
              }),
        };
        break;
      }
      case TaskEventType.STATUS: {
        item = this.getStatus(item as ITaskEventItem, status);
        break;
      }
      default: {
        this.log.for(this.parseToItem).debug(`Received unknown task status: ${classification}`);
      }
    }
    return [
      {
        ...item,
        classification,
        status: (typeof status === 'object' ? status?.['level'] || TaskEventType.LOG : status) as TaskStatus,
      },
    ] as ITaskEventItem[];
  }

  getStatus(item: ITaskEventItem, status: TaskStatus): ITaskEventItem {
    switch (status) {
      case TaskStatus.FAILED:
      case TaskStatus.CANCELED:
      case TaskStatus.SUCCEEDED:
        item = {
          ...item,
          className: `dcf-task ${status} finished`,
        };
        break;
      case TaskStatus.RUNNING:
        item = {
          ...item,
          className: `dcf-task ${status} running`,
        };
        break;
      case TaskStatus.SCHEDULED:
      case TaskStatus.WAITING_RETRY:
      case TaskStatus.PENDING:
        item = {
          ...item,
          className: `dcf-task ${status} awaiting`,
        };
        break;
      default: {
        item = {
          ...item,
          className: 'dcf-task',
        };
      }
    }
    return item;
  }
}

//TODO: DELETE
// async function createEvent(uid: string, status: string): Promise<TaskEventModel | undefined> {
//   const classification = [TaskStatus.SUCCEEDED, TaskStatus.FAILED, TaskStatus.CANCELED].includes(status as TaskStatus)
//     ? TaskEventType.PROGRESS
//     : TaskSessionService.randomPick([TaskEventType.STATUS, TaskEventType.PROGRESS, TaskEventType.LOG]);
//   if (!status) {
//     status = TaskSessionService.randomPick([
//       TaskStatus.PENDING,
//       TaskStatus.SCHEDULED,
//       TaskStatus.RUNNING,
//       TaskStatus.WAITING_RETRY,
//     ]);
//   }
//   const data = Model.build(
//     {
//       taskId: uid,
//       classification,
//       payload: { status },
//     },
//     TaskEventModel.name
//   ) as KeyValue;
//   return await TaskSessionService.populate<TaskEventModel>(TaskEventModel.name, data);
// }

// async function create<M extends Model>(modelName: string, item: KeyValue): Promise<M | undefined> {
//   try {
//     const repo = getModelAndRepository(modelName);
//     if (repo) {
//       const { repository, model } = repo;
//       const result = (await TaskSessionService.create(modelName, repository, item)) as M;
//       return result;
//     }
//   } catch (error) {
//     getLogger('TaskTerminalComponent').error(
//       `Error creating item in ${modelName}: ${(error as Error)?.msg || error}`
//     );
//     return undefined;
//   }
// }

// async function read<M extends Model>(modelName: string, uid?: string): Promise<M[]> {
//   try {
//     const repo = getModelAndRepository(modelName);
//     if (repo) {
//       const { repository } = repo;
//       return TaskSessionService.read(modelName, repository, uid) as Promise<M[]>;
//     }
//     return [];
//   } catch (error) {
//     getLogger('TaskPage').error(`Error reading item in ${modelName}: ${(error as Error)?.msg || error}`);
//     return [];
//   }
// }
