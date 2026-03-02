import { Comparison, Model, Primitives } from '@decaf-ts/decorator-validation';
import {
  DecafComponentConstructor,
  KeyValue,
  NgxEventHandler,
  getLogger,
  getNgxModalComponent,
} from '@decaf-ts/for-angular';
import { uionclick, uitablecol } from '@decaf-ts/ui-decorators';
import { Audit, Diffs } from '@pharmaledgerassoc/ptp-toolkit/shared';
import { AppModalDiffsComponent } from 'src/app/components/modal-diffs/modal-diffs.component';

function filterDiffs(diffs: string | Diffs<Audit>): Comparison<Audit> {
  if (typeof diffs === 'string') {
    diffs = JSON.parse(diffs);
  }
  const result = {} as Comparison<Audit>;
  Object.entries(diffs).map(([k, v]) => {
    const propName = k as keyof Diffs<Audit>;
    const o = v.old;
    const n = v.new;
    if (o || n) {
      result[propName] = v;
    }
  });
  return result;
}

export function getAuditModel(): Audit {
  const model = new Audit();
  // Set onclick handler for diffs column to open a modal with the diffs content
  uionclick(() => AuditHandler)(Audit, 'diffs');
  // overrides diffs prop, to show a "View Diffs"
  uitablecol(4, async (instance: DecafComponentConstructor, propName: string, value: string) => {
    const phrase = await instance.translate('audit.view_diffs');
    if (value?.length) {
      const diffs = filterDiffs(value);
      if (Object.keys(diffs).length) {
        value = JSON.stringify(diffs);
        return phrase;
      }
    }
    return '';
  })(Audit, 'diffs');
  return model;
}

async function downLoadFile(content: string, extension: 'csv' | 'json', filename: string = 'download'): Promise<void> {
  try {
    const url = URL.createObjectURL(
      new Blob([content], {
        type: extension === 'csv' ? 'text/csv;charset=utf-8;' : 'application/json;charset=utf-8;',
      })
    );
    const link = document.createElement('a');
    const fileNameSuffix = `-${Date.now()}`;
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      filename.endsWith(`.${extension}`) ? `${filename}${fileNameSuffix}` : `${filename}${fileNameSuffix}.${extension}`
    );
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  } catch (error: unknown) {
    getLogger(downLoadFile).error(`Error downloading ${filename} as ${extension}: ${(error as Error)?.message}`);
  }
}

export async function downloadAsCsv(
  data: Audit[],
  filename: string = 'download',
  headers: string[] = [],
  delimiter: string = ','
): Promise<void> {
  const arrayData = Array.isArray(data) ? data : [data];
  const cols = Object.keys(arrayData[0]);
  if (!headers.length) {
    headers = cols;
  }
  const headerRow = headers.map((header) => `"${header}"`).join(delimiter);
  const rows = await Promise.all(
    arrayData.map(async (row: KeyValue) => {
      const values = await Promise.all(
        cols.map(async (col, index: number) => {
          if (index <= headers.length - 1) {
            let value = row[col];
            if (value === null || value === undefined) {
              return '""';
            }
            if (value instanceof Promise) {
              value = await value;
            }
            return `"${String(value).replace(/"/g, '""')}"`;
          }
        })
      );
      return values.join(delimiter);
    })
  );

  const content = [headerRow, ...rows].join('\n');

  return await downLoadFile(content, 'csv', filename);
}

export async function downloadAsJson(
  data: Comparison<Audit> | Diffs<Audit>,
  filename: string = 'download',
  format: boolean = true
): Promise<void> {
  return await downLoadFile(format ? JSON.stringify(data, null, 2) : JSON.stringify(data), 'json', filename);
}

export class AuditHandler extends NgxEventHandler {
  override async handleClick(instance: NgxEventHandler, event: CustomEvent, uid: string) {
    const item = (instance._data as Audit[]).find((item) => item[Model.pk(Audit)] === uid) as Audit;
    console.log(instance._data);
    const diffs = (item as Audit)?.diffs || undefined;
    if (item && diffs) {
      let content = JSON.parse(diffs as unknown as string);
      while (typeof content === Primitives.STRING) {
        content = JSON.parse(content);
      }
      const filteredDiffs = filterDiffs(content);
      if (!Object.keys(filteredDiffs).length) {
        return false;
      }
      const locale = instance.locale as string;
      const modal = await getNgxModalComponent(
        {
          tag: 'app-modal-diffs',
          expandable: true,
          title: `${locale.toLowerCase()}.diffs.title`,
          //  headerTransparent: true,
          globals: {
            diffs: content,
            locale: item.model.toLowerCase(),
            confirmButton: {
              text: 'audit.diffs.button.download',
              handle: async () => {
                await downloadAsJson(filteredDiffs, item.transaction);
              },
            },
          } as AppModalDiffsComponent,
        },
        {},
        instance.injector
      );
      await modal.present();
      // const container = document.createElement('div');
      // let content = JSON.parse(diffs as unknown as string);
      // while (typeof content === Primitives.STRING) {
      //   content = JSON.parse(content);
      // }
      // container.innerHTML = `<pre>${JSON.stringify(content, null, 2)}</pre>`;

      // await presentNgxInlineModal(
      //   container,
      //   {
      //     title: 'audit.diffs.preview',
      //     headerTransparent: true,
      //   },
      //   this.injector,
      // );
    }
  }
}
