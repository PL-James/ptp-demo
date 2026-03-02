import { EnvironmentInjector } from '@angular/core';
import BwipJs, { BwippOptions } from '@bwip-js/browser';
import {
  CrudFieldComponent,
  getModelAndRepository,
  NgxEventHandler,
  presentNgxInlineModal,
} from '@decaf-ts/for-angular';
import { Batch, Product } from '@pharmaledgerassoc/ptp-toolkit/shared';

function clearElement(el: HTMLElement): void {
  while (el.firstChild) el.removeChild(el.firstChild);
}

function createBarcodeWrapper(svgContainer: HTMLElement, labelText: string): HTMLElement {
  const wrapper = document.createElement('div');
  wrapper.style.cssText = 'display: flex; flex-direction: column; align-items: center; padding: 8px 0; cursor: pointer;';
  wrapper.appendChild(svgContainer);
  const label = document.createElement('span');
  label.style.cssText = 'font-size: 12px; color: var(--ion-color-medium); margin-top: 4px;';
  label.textContent = labelText;
  wrapper.appendChild(label);
  return wrapper;
}

export async function createOnClickShowBarcodeModal(instance: CrudFieldComponent) {
  const element = instance.component?.nativeElement as HTMLIonItemElement;
  if (element) {
    if (!Object.keys(instance._data as Batch).length) {
      const repository = getModelAndRepository(Batch.name)?.repository;
      instance._data = (await repository?.read(instance.modelId)) as Batch;
    }
    const batch = instance._data as Batch;
    const inlineSvg = DatamatrixModalHandler.getDatamatrixCanvasElement(batch, BarcodeTypes.gs1datamatrix, 150);
    if (inlineSvg) {
      const labelText = await instance.translate('batch.dataMatrix.view');
      const wrapper = createBarcodeWrapper(inlineSvg, labelText);
      clearElement(element);
      element.appendChild(wrapper);
    }
    element.classList.add('dcf-has-action');
    element.onclick = () => {
      DatamatrixModalHandler.showBarcodeModal(batch);
    };
  }
}

export async function createProductOnClickShowBarcodeModal(instance: CrudFieldComponent) {
  const element = instance.component?.nativeElement as HTMLIonItemElement;
  if (element) {
    if (!Object.keys(instance._data as Product).length) {
      const repository = getModelAndRepository(Product.name)?.repository;
      instance._data = (await repository?.read(instance.modelId)) as Product;
    }
    const product = instance._data as Product;
    const inlineSvg = DatamatrixModalHandler.getProductDatamatrixCanvasElement(product, 150);
    if (inlineSvg) {
      const labelText = await instance.translate('batch.dataMatrix.view');
      const wrapper = createBarcodeWrapper(inlineSvg, labelText);
      clearElement(element);
      element.appendChild(wrapper);
    }
    element.classList.add('dcf-has-action');
    element.onclick = () => {
      DatamatrixModalHandler.showProductBarcodeModal(product);
    };
  }
}

export const BarcodeTypes = {
  gs1datamatrix: 'gs1datamatrix',
  datamatrix: 'datamatrix',
  qrcode: 'qrcode',
} as const;

export class DatamatrixModalHandler extends NgxEventHandler {
  private static readonly charsMap: Record<string, string> = {
    '33': '!',
    '34': '"',
    '35': '#',
    '36': '$',
    '37': '%',
    '38': '&',
    '39': "'",
    '40': '(',
    '41': ')',
    '42': '*',
    '43': '+',
    '45': '-',
    '46': '.',
    '47': '/',
    '58': ':',
    '59': ';',
    '60': '<',
    '61': '=',
    '62': '>',
    '63': '?',
    '64': '@',
    '91': '[',
    '92': '\\',
    '93': ']',
    '94': '^',
    '95': '_',
    '96': '`',
    '123': '{',
    '124': '|',
    '125': '}',
    '126': '~',
  };

  private static readonly barcodeOptions = {
    text: '',
    includeBarcodeText: true,
    scale: 4,
    height: 16,
    textxalign: 'center',
    textyalign: 'center',
    backgroundcolor: 'ffffff',
    paddingwidth: 4,
    paddingheight: 4,
  } as BwippOptions;

  override async handleClick(instance: NgxEventHandler, event: CustomEvent, uid: string) {
    const item = (instance._data as Batch[]).find((item) => item[instance.pk as keyof Batch] === uid);
    if (item) {
      DatamatrixModalHandler.showBarcodeModal(item, this.injector);
    }
  }

  static async showBarcodeModal(item: Batch, injector?: EnvironmentInjector): Promise<void> {
    const datamatrixElement = DatamatrixModalHandler.getDatamatrixCanvasElement(item);
    if (datamatrixElement) {
      await presentNgxInlineModal(
        datamatrixElement,
        {
          title: 'batch.dataMatrix.preview',
          uid: 'dcf-datamatrix-modal',
          headerTransparent: true,
        },
        injector
      );
    }
  }

  static async showProductBarcodeModal(item: Product, injector?: EnvironmentInjector): Promise<void> {
    const datamatrixElement = DatamatrixModalHandler.getProductDatamatrixCanvasElement(item);
    if (datamatrixElement) {
      await presentNgxInlineModal(
        datamatrixElement,
        {
          title: 'batch.dataMatrix.preview',
          uid: 'dcf-datamatrix-modal',
          headerTransparent: true,
        },
        injector
      );
    }
  }

  static getBarcodeData(batch: Batch): string {
    const { batchNumber, productCode, expiryDate } = batch;
    const serialNumber = '';
    const emptySerialNumber = serialNumber === '' || typeof serialNumber === 'undefined';
    const sanitizeForBwipp = (value: string): string => {
      return value
        .split('')
        .map((char) => {
          if (this.charsMap[char.charCodeAt(0)]) {
            return Number(char.charCodeAt(0)) >= 100 ? `^${char.charCodeAt(0)}` : `^0${char.charCodeAt(0)}`;
          }
          return char;
        })
        .join('');
    };

    return (
      emptySerialNumber
        ? `(01)${productCode}(10)${sanitizeForBwipp(batchNumber)}(17)${expiryDate}`
        : `(01)${productCode}(21)${sanitizeForBwipp(serialNumber)}(10)${sanitizeForBwipp(batchNumber)}(17)${expiryDate}`
    ).replace(/"/g, '\\"');
  }

  static getProductBarcodeData(product: Product): string {
    return `(01)${product.productCode}`;
  }

  static getProductDatamatrixCanvasElement(
    product: Product,
    size: number = 280
  ): HTMLElement | undefined {
    const barcodeData = this.getProductBarcodeData(product);
    return this.renderBarcodeToContainer(barcodeData, BarcodeTypes.gs1datamatrix, size);
  }

  static getDatamatrixCanvasElement(
    batch: Batch,
    bcid: keyof typeof BarcodeTypes = BarcodeTypes.gs1datamatrix,
    size: number = 280
  ): HTMLElement | undefined {
    const barcodeData = this.getBarcodeData(batch);
    return this.renderBarcodeToContainer(barcodeData, bcid, size);
  }

  private static renderBarcodeToContainer(
    barcodeData: string,
    bcid: keyof typeof BarcodeTypes,
    size: number
  ): HTMLElement | undefined {
    const container = document.createElement('div');
    container.style.cssText = `width: ${size}px; height: ${size}px;`;

    const options = {
      ...this.barcodeOptions,
      text: barcodeData,
      bcid,
    };

    try {
      const svgString = BwipJs.toSVG(options);
      const parser = new DOMParser();
      const doc = parser.parseFromString(svgString, 'image/svg+xml');
      const svgEl = doc.documentElement;
      if (svgEl && svgEl.tagName === 'svg') {
        svgEl.setAttribute('width', '100%');
        svgEl.setAttribute('height', '100%');
        container.appendChild(document.importNode(svgEl, true));
      }
    } catch (error) {
      console.error('Invalid barcode data supplied:', error);
    }

    return container;
  }
}
