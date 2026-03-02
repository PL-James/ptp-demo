import { Component, OnDestroy, OnInit } from '@angular/core';
import { Observer } from '@decaf-ts/core';
import { RamAdapter, RamFlavour } from '@decaf-ts/core/ram';
import { OperationKeys } from '@decaf-ts/db-decorators';
import { uses } from '@decaf-ts/decoration';
import { Model } from '@decaf-ts/decorator-validation';
import {
  DB_ADAPTER_FLAVOUR_TOKEN,
  DecafRepository,
  getModelAndRepository,
  IconComponent,
  NgxModelPageDirective,
  setOnWindow,
  TableComponent,
} from '@decaf-ts/for-angular';
import { IonButton, IonContent, IonRouterLink } from '@ionic/angular/standalone';
import { TranslatePipe } from '@ngx-translate/core';
import { Product } from '@pharmaledgerassoc/ptp-toolkit/shared';
import { AppCardTitleComponent } from 'src/app/components/card-title/card-title.component';
import { HeaderComponent } from 'src/app/components/header/header.component';
import { AppTaskTerminalComponent } from 'src/app/components/task-terminal/task-terminal.component';
import { TaskEventModel } from 'src/app/models/TaskEventModel';
import { TaskModel } from 'src/app/models/TaskModel';
import { ContainerComponent } from '../../components/container/container.component';
import { TaskSessionService } from './TaskSessionService';

new RamAdapter({ user: 'demerson.carvalho@plaqa.org' });
uses(RamFlavour)(TaskModel);
uses(RamFlavour)(TaskEventModel);

interface IEventItem {
  color: string;
  className: string;
  message: string;
  currentStep?: number;
  totalSteps?: number;
}
@Component({
  selector: 'app-tasks',
  templateUrl: './tasks.page.html',
  styleUrls: ['./tasks.page.scss'],
  standalone: true,
  imports: [
    TranslatePipe,
    HeaderComponent,
    ContainerComponent,
    TableComponent,
    AppCardTitleComponent,
    IonRouterLink,
    IonContent,
    IonButton,
    IconComponent,
    AppTaskTerminalComponent,
  ],
})
export class TasksPage extends NgxModelPageDirective implements OnInit, OnDestroy {
  taskEvents: IEventItem[] = [];

  products: Product[] = [];

  _initialized: boolean = false;

  constructor() {
    super('Tasks', false);
  }

  async ngOnInit() {
    // changing repository  - TODO: DELETE THIS LINE
    await this.initRamRepository(Product.name);
    this.model = new TaskModel();
    this.operations = [OperationKeys.READ];
    this.title = `${this.locale}.title`;
    await super.initialize();
    this._initialized = true;
  }

  override async ngOnDestroy(): Promise<void> {
    await super.ngOnDestroy();
    if (this._repository && this.repositoryObserver) {
      const repo = this._repository as DecafRepository<Model>;
      const handler = repo['observerHandler'] as { observers: Observer[] } | undefined;
      if (handler && handler?.observers?.length) {
        try {
          if (this.repositoryObserver) {
            repo.unObserve(this.repositoryObserver);
          }
        } catch (error: unknown) {
          this.log.info((error as Error)?.message);
        }
      }
    }
  }

  override async ionViewWillEnter(): Promise<void> {
    await super.ionViewWillEnter();
    // const uid = this.modelId as string;
    // if (uid) {
    //   try {
    //     if (!this.repository) {
    //       throw new Error('Repository is not defined');
    //     }
    //     uses(RamFlavour)(TaskEventModel);
    //     const repo = getModelAndRepository(TaskEventModel.name);
    //     if (repo) {
    //       const { repository, model, pk } = repo;
    //       const repositoryAdapter = repository['adapter'];
    //       if (!repositoryAdapter) {
    //         throw new Error('Repository adapter is not defined');
    //       }
    //       const events = await repository.query(
    //         Condition.attr('taskId' as keyof Model).eq(this.modelId),
    //         pk as keyof Model
    //       );
    //       console.log(events);
    //       // const tracker = new TaskTracker(repositoryAdapter as unknown as TaskEventBus, this.model as TaskModel);
    //       if (!this.repositoryObserver) {
    //         this.repositoryObserver = {
    //           refresh: async (...args) => {
    //             const [, type, , event] = args;
    //             await this.pipeEvents(event, type);
    //           },
    //         };
    //         repository.observe(this.repositoryObserver);
    //       }
    //       // const resolvedTracker = await tracker.wait();
    //       // console.log(resolvedTracker);
    //       // // Configura o pipe para capturar todos os eventos e armazená-los
    //       this.generateEvents([TaskStatus.PENDING, TaskStatus.WAITING_RETRY, TaskStatus.RUNNING]);
    //     }
    //   } catch (error) {
    //     console.error('Error in ionViewWillEnter:', error);
    //     this.log.for(this.ngOnInit).error(`Error initializing TasksPage: ${(error as Error)?.message || error}`);
    //   }
    // }
  }

  async initRamRepository(modelName?: string) {
    let query: Model[] = [];
    if (!this.operation && modelName) {
      const repo = getModelAndRepository(modelName);
      if (repo) {
        const { repository } = repo;
        if (repository) {
          query = (await repository.select().execute()) as Model[];
          if (query?.length) {
            query = query.slice(0, 1);
          }
        }
      }
    }
    if (!this.model) {
      this.model = new TaskModel();
    }
    setOnWindow(DB_ADAPTER_FLAVOUR_TOKEN, RamFlavour);
    this._repository = this.repository;
    if (this._repository) {
      await TaskSessionService.initialize(
        this._repository as DecafRepository<Model>,
        query?.length ? query : undefined,
        modelName
      );
    }
  }
}
